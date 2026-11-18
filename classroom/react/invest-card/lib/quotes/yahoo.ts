import { QuoteUnavailableError, type Quote, type QuoteProvider } from './types';

// Endpoint não documentado do Yahoo Finance. Não tem contrato nem
// versionamento: é justamente por isso que existe um fallback.
// A base pode ser trocada por env para demonstrar a queda em aula.
const BASE_URL =
  process.env.QUOTE_YAHOO_BASE_URL ??
  'https://query1.finance.yahoo.com/v8/finance/chart';

/** Par de câmbio usado para converter cripto cotada em dólar. */
const USD_BRL_SYMBOL = 'USDBRL=X';

/** Ex.: BTC-BRL -> ['BTC']. O Yahoo não tem esse par; ver fetchQuote. */
const SYNTHETIC_BRL_PAIR = /^([A-Z0-9]+)-BRL$/;

type ChartMeta = {
  price: number;
  previousClose: number;
  currency: string;
};

/**
 * Símbolo do Yahoo para um ticker nosso:
 * - `PETR4`    -> `PETR4.SA` (B3 leva sufixo)
 * - `BTC-USD`  -> `BTC-USD`  (cripto e câmbio passam direto)
 */
function toSymbol(ticker: string): string {
  return /[-=]/.test(ticker) ? ticker : `${ticker}.SA`;
}

async function fetchChartMeta(
  symbol: string,
  ticker: string,
  signal: AbortSignal,
): Promise<ChartMeta> {
  const url = `${BASE_URL}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

  const response = await fetch(url, {
    signal,
    cache: 'no-store',
    headers: {
      // Sem User-Agent de browser o Yahoo costuma responder 403.
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
    },
  });

  // fetch não lança em 4xx/5xx — a checagem é manual.
  if (!response.ok) {
    throw new QuoteUnavailableError(
      'yahoo',
      ticker,
      `${symbol}: HTTP ${response.status}`,
    );
  }

  const body = await response.json();
  const meta = body?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const previousClose = meta?.previousClose ?? meta?.chartPreviousClose;

  if (typeof price !== 'number' || typeof previousClose !== 'number') {
    throw new QuoteUnavailableError(
      'yahoo',
      ticker,
      `${symbol}: resposta sem regularMarketPrice/previousClose`,
    );
  }

  return { price, previousClose, currency: meta?.currency ?? 'BRL' };
}

function toQuote(
  ticker: string,
  { price, previousClose, currency }: ChartMeta,
): Quote {
  return {
    ticker,
    price,
    changePercent:
      previousClose === 0 ? 0 : ((price - previousClose) / previousClose) * 100,
    currency,
    source: 'yahoo',
  };
}

export const yahooProvider: QuoteProvider = {
  name: 'yahoo',

  async fetchQuote(ticker, signal): Promise<Quote> {
    const synthetic = ticker.match(SYNTHETIC_BRL_PAIR);

    // O Yahoo não tem BTC-BRL (404), só BTC-USD. Compomos o par multiplicando
    // pelo câmbio — inclusive o fechamento anterior, para que a variação saia
    // correta em reais (ela inclui o movimento do dólar, e isso é proposital).
    if (synthetic) {
      const [, coin] = synthetic;

      const [asset, fx] = await Promise.all([
        fetchChartMeta(`${coin}-USD`, ticker, signal),
        fetchChartMeta(USD_BRL_SYMBOL, ticker, signal),
      ]);

      return toQuote(ticker, {
        price: asset.price * fx.price,
        previousClose: asset.previousClose * fx.previousClose,
        currency: 'BRL',
      });
    }

    return toQuote(ticker, await fetchChartMeta(toSymbol(ticker), ticker, signal));
  },
};
