import { supabase } from '@/lib/supabase';
import type {
  Investment,
  InvestmentRow,
  NewInvestment,
} from '@/types/investments';

const TABLE = 'investments';

function toInvestment(row: InvestmentRow): Investment {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    type: row.type,
    category: row.category,
    performance: Number(row.performance),
    currentValue: Number(row.current_value),
    investedValue: Number(row.invested_value),
    ticker: row.ticker,
    quantity: row.quantity === null ? null : Number(row.quantity),
    lastQuote: row.last_quote === null ? null : Number(row.last_quote),
    quoteSource: row.quote_source,
    quoteUpdatedAt: row.quote_updated_at,
  };
}

function toRow(investment: NewInvestment, userId: string) {
  return {
    user_id: userId,
    name: investment.name,
    issuer: investment.issuer,
    type: investment.type,
    category: investment.category,
    performance: investment.performance,
    current_value: investment.currentValue,
    invested_value: investment.investedValue,
    // Sem ticker o ativo nunca é cotado: fica com os valores digitados.
    ticker: investment.ticker,
    quantity: investment.quantity,
  };
}

/**
 * Lê a carteira do usuário logado. Não há `.eq('user_id', ...)` aqui de
 * propósito: quem filtra é o RLS, com o auth.uid() do token. Um select sem
 * filtro no cliente já volta só com as linhas de quem pediu.
 */
export async function fetchInvestments(): Promise<Investment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    // O seed insere tudo numa transação só, então os created_at empatam e a
    // ordem vira arbitrária. O name desempata e deixa a listagem estável.
    .order('created_at', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Não foi possível carregar os investimentos: ${error.message}`);
  }

  return (data as InvestmentRow[]).map(toInvestment);
}

export async function insertInvestment(
  investment: NewInvestment,
): Promise<Investment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A policy de insert exige auth.uid() = user_id, então o dono vai explícito
  // na linha: sem ele o banco recusa a escrita.
  if (!user) {
    throw new Error('Faça login para adicionar um investimento.');
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(investment, user.id))
    .select()
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar o investimento: ${error.message}`);
  }

  return toInvestment(data as InvestmentRow);
}

export async function deleteInvestment(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);

  if (error) {
    throw new Error(`Não foi possível remover o investimento: ${error.message}`);
  }
}
