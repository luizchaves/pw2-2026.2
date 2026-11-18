import { QuoteUnavailableError, type Quote, type QuoteProvider } from './types';

// API brasileira e documentada (https://brapi.dev). Ticker único de bolsa
// funciona sem token; lote e cripto exigem token.
const BASE_URL = process.env.QUOTE_BRAPI_BASE_URL ?? 'https://brapi.dev/api';

/** Ex.: BTC-BRL -> ['BTC', 'BRL']. Cripto usa outro endpoint na brapi. */
const CRYPTO_PAIR = /^([A-Z0-9]+)-([A-Z]{3})$/;

function withToken(url: URL): URL {
  const token = process.env.BRAPI_TOKEN;

  if (token) {
    url.searchParams.set('token', token);
  }

  return url;
}

async function request(
  url: URL,
  ticker: string,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await fetch(withToken(url), { signal, cache: 'no-store' });

  if (!response.ok) {
    throw new QuoteUnavailableError(
      'brapi',
      ticker,
      response.status === 401
        ? 'token ausente ou inválido (defina BRAPI_TOKEN)'
        : `HTTP ${response.status}`,
    );
  }

  return response.json();
}

function toQuote(
  ticker: string,
  entry: Record<string, unknown> | undefined,
  fallbackCurrency: string,
): Quote {
  const price = entry?.regularMarketPrice;
  const changePercent = entry?.regularMarketChangePercent;

  if (typeof price !== 'number') {
    throw new QuoteUnavailableError(
      'brapi',
      ticker,
      'resposta sem regularMarketPrice',
    );
  }

  return {
    ticker,
    price,
    changePercent: typeof changePercent === 'number' ? changePercent : 0,
    currency:
      typeof entry?.currency === 'string' ? entry.currency : fallbackCurrency,
    source: 'brapi',
  };
}

export const brapiProvider: QuoteProvider = {
  name: 'brapi',

  async fetchQuote(ticker, signal): Promise<Quote> {
    const crypto = ticker.match(CRYPTO_PAIR);

    if (crypto) {
      const [, coin, currency] = crypto;
      const url = new URL(`${BASE_URL}/v2/crypto`);

      url.searchParams.set('coin', coin);
      url.searchParams.set('currency', currency);

      const body = (await request(url, ticker, signal)) as {
        coins?: Record<string, unknown>[];
      };

      return toQuote(ticker, body?.coins?.[0], currency);
    }

    // Ações, FIIs, ETFs e BDRs: ticker puro, sem sufixo.
    const body = (await request(
      new URL(`${BASE_URL}/quote/${encodeURIComponent(ticker)}`),
      ticker,
      signal,
    )) as { results?: Record<string, unknown>[] };

    return toQuote(ticker, body?.results?.[0], 'BRL');
  },
};
