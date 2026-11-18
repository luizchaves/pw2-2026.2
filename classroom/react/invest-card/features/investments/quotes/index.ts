import { brapiProvider } from './brapi';
import { yahooProvider } from './yahoo';
import { QuoteUnavailableError, type Quote, type QuoteProvider } from './types';

export type { Quote, QuoteProvider } from './types';
export { QuoteUnavailableError } from './types';

const DEFAULT_ORDER = 'yahoo,brapi';
const DEFAULT_TIMEOUT_MS = 5_000;

const registry: Record<string, QuoteProvider> = {
  yahoo: yahooProvider,
  brapi: brapiProvider,
};

/**
 * Ordem da cadeia: o primeiro é o primário, os seguintes são fallback.
 * Trocável por env (QUOTE_PROVIDER_ORDER=brapi,yahoo) para inverter em aula.
 */
export function resolveProviders(): QuoteProvider[] {
  const order = (process.env.QUOTE_PROVIDER_ORDER ?? DEFAULT_ORDER)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  const providers = order
    .map((name) => registry[name])
    .filter((provider): provider is QuoteProvider => Boolean(provider));

  if (providers.length === 0) {
    throw new Error(
      `QUOTE_PROVIDER_ORDER inválido. Use nomes de: ${Object.keys(registry).join(', ')}`,
    );
  }

  return providers;
}

export type QuoteAttempt = {
  provider: string;
  ok: boolean;
  reason?: string;
};

export type QuoteResult =
  | { ticker: string; ok: true; quote: Quote; attempts: QuoteAttempt[] }
  | { ticker: string; ok: false; attempts: QuoteAttempt[] };

function describe(cause: unknown): string {
  if (cause instanceof QuoteUnavailableError) {
    return cause.reason;
  }

  if (cause instanceof DOMException && cause.name === 'TimeoutError') {
    return 'timeout';
  }

  return cause instanceof Error ? cause.message : 'erro desconhecido';
}

/**
 * Tenta cada provider em ordem até um responder. O fallback é POR TICKER:
 * se o Yahoo devolve 4 de 5, a brapi é chamada só para o que faltou.
 */
async function fetchWithFallback(
  ticker: string,
  providers: QuoteProvider[],
  timeoutMs: number,
): Promise<QuoteResult> {
  const attempts: QuoteAttempt[] = [];

  for (const provider of providers) {
    try {
      const quote = await provider.fetchQuote(
        ticker,
        AbortSignal.timeout(timeoutMs),
      );

      attempts.push({ provider: provider.name, ok: true });

      return { ticker, ok: true, quote, attempts };
    } catch (cause) {
      attempts.push({
        provider: provider.name,
        ok: false,
        reason: describe(cause),
      });
    }
  }

  return { ticker, ok: false, attempts };
}

/** Cota vários tickers em paralelo, cada um com a sua própria cadeia. */
export async function fetchQuotes(
  tickers: string[],
  options: { providers?: QuoteProvider[]; timeoutMs?: number } = {},
): Promise<QuoteResult[]> {
  const providers = options.providers ?? resolveProviders();
  const timeoutMs =
    options.timeoutMs ??
    Number(process.env.QUOTE_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const unique = [...new Set(tickers)];

  return Promise.all(
    unique.map((ticker) => fetchWithFallback(ticker, providers, timeoutMs)),
  );
}
