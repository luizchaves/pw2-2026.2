import { NextResponse } from 'next/server';
import { fetchQuotes, type QuoteAttempt } from '@/features/investments/quotes';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Isto roda no servidor porque:
// 1. o BRAPI_TOKEN não pode ir para o bundle do browser;
// 2. o Yahoo não manda header de CORS, então fetch do cliente falharia;
// 3. o rate limit é compartilhado por todos os usuários, não por aba aberta.
//
// O client vem dos cookies da requisição, então as queries abaixo rodam como o
// usuário logado e o RLS cuida do resto: cada um só cota a própria carteira.

const DEFAULT_STALE_MINUTES = 15;

type QuotableRow = {
  id: string;
  ticker: string;
  quantity: number;
  quote_updated_at: string | null;
};

type Refreshed = {
  ticker: string;
  price: number;
  changePercent: number;
  currentValue: number;
  source: string;
  attempts: QuoteAttempt[];
};

type Failed = { ticker: string; reason: string; attempts?: QuoteAttempt[] };

export async function POST(request: Request) {
  // ?force=1 ignora o cache de frescor e busca tudo de novo.
  const force = new URL(request.url).searchParams.get('force') === '1';
  const staleMinutes = Number(
    process.env.QUOTE_STALE_MINUTES ?? DEFAULT_STALE_MINUTES,
  );

  let supabase;

  try {
    supabase = await createServerSupabaseClient();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'erro de configuração';

    return NextResponse.json({ error: message }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('investments')
    .select('id, ticker, quantity, quote_updated_at')
    .not('ticker', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  const rows = (data ?? []) as QuotableRow[];
  const threshold = Date.now() - staleMinutes * 60_000;

  // Cotação recente não é buscada de novo: é isso que protege o rate limit.
  const stale = rows.filter((row) => {
    if (force || !row.quote_updated_at) {
      return true;
    }

    return Date.parse(row.quote_updated_at) <= threshold;
  });

  const skipped = rows
    .filter((row) => !stale.includes(row))
    .map((row) => ({ ticker: row.ticker, reason: 'cotação ainda fresca' }));

  if (stale.length === 0) {
    return NextResponse.json({ refreshed: [], skipped, failed: [] });
  }

  const results = await fetchQuotes(stale.map((row) => row.ticker));
  const byTicker = new Map(results.map((result) => [result.ticker, result]));

  const refreshed: Refreshed[] = [];
  const failed: Failed[] = [];

  await Promise.all(
    stale.map(async (row) => {
      const result = byTicker.get(row.ticker);

      if (!result || !result.ok) {
        failed.push({
          ticker: row.ticker,
          reason: 'nenhum provider respondeu',
          attempts: result?.attempts,
        });

        return;
      }

      const { quote } = result;

      // Converter moeda exigiria uma cotação de câmbio — fora de escopo.
      if (quote.currency !== 'BRL') {
        failed.push({
          ticker: row.ticker,
          reason: `cotação veio em ${quote.currency}, não em BRL`,
          attempts: result.attempts,
        });

        return;
      }

      const currentValue = Number((row.quantity * quote.price).toFixed(2));

      const { error: updateError } = await supabase
        .from('investments')
        .update({
          last_quote: quote.price,
          quote_currency: quote.currency,
          quote_source: quote.source,
          quote_updated_at: new Date().toISOString(),
          current_value: currentValue,
          performance: Number(quote.changePercent.toFixed(2)),
        })
        .eq('id', row.id);

      if (updateError) {
        failed.push({ ticker: row.ticker, reason: updateError.message });

        return;
      }

      refreshed.push({
        ticker: row.ticker,
        price: quote.price,
        changePercent: quote.changePercent,
        currentValue,
        source: quote.source,
        attempts: result.attempts,
      });
    }),
  );

  // Falhou tudo que tentou: avisa com erro. Parcial ainda é sucesso.
  const status = refreshed.length === 0 && failed.length > 0 ? 502 : 200;

  return NextResponse.json({ refreshed, skipped, failed }, { status });
}
