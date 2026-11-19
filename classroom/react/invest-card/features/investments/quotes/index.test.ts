import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchQuotes, resolveProviders } from '@/features/investments/quotes';
import {
  QuoteUnavailableError,
  type Quote,
  type QuoteProvider,
} from '@/features/investments/quotes/types';

function quote(ticker: string, source: string): Quote {
  return { ticker, price: 10, changePercent: 1, currency: 'BRL', source };
}

/** Provider de mentira: responde ou falha conforme o combinado. */
function fakeProvider(
  name: string,
  behaviour: (ticker: string) => Quote | Error,
): QuoteProvider {
  return {
    name,
    async fetchQuote(ticker) {
      const result = behaviour(ticker);

      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
  };
}

const originalOrder = process.env.QUOTE_PROVIDER_ORDER;

afterEach(() => {
  process.env.QUOTE_PROVIDER_ORDER = originalOrder;
});

describe('resolveProviders', () => {
  it('usa yahoo como primário e brapi como fallback', () => {
    delete process.env.QUOTE_PROVIDER_ORDER;

    expect(resolveProviders().map((p) => p.name)).toEqual(['yahoo', 'brapi']);
  });

  it('respeita a ordem configurada por env', () => {
    process.env.QUOTE_PROVIDER_ORDER = 'brapi,yahoo';

    expect(resolveProviders().map((p) => p.name)).toEqual(['brapi', 'yahoo']);
  });

  it('reclama quando a env não nomeia nenhum provider conhecido', () => {
    process.env.QUOTE_PROVIDER_ORDER = 'bloomberg';

    expect(() => resolveProviders()).toThrow(/QUOTE_PROVIDER_ORDER inválido/);
  });
});

describe('fetchQuotes', () => {
  it('não chama o fallback quando o primário responde', async () => {
    const primary = vi.fn(async () => quote('PETR4', 'yahoo'));
    const fallback = vi.fn(async () => quote('PETR4', 'brapi'));

    const [result] = await fetchQuotes(['PETR4'], {
      providers: [
        { name: 'yahoo', fetchQuote: primary },
        { name: 'brapi', fetchQuote: fallback },
      ],
    });

    expect(result.ok && result.quote.source).toBe('yahoo');
    expect(fallback).not.toHaveBeenCalled();
    expect(result.attempts).toEqual([{ provider: 'yahoo', ok: true }]);
  });

  it('cai para o próximo provider e registra o motivo da falha', async () => {
    const [result] = await fetchQuotes(['PETR4'], {
      providers: [
        fakeProvider('yahoo', (t) => new QuoteUnavailableError('yahoo', t, 'HTTP 404')),
        fakeProvider('brapi', (t) => quote(t, 'brapi')),
      ],
    });

    expect(result.ok && result.quote.source).toBe('brapi');
    expect(result.attempts).toEqual([
      { provider: 'yahoo', ok: false, reason: 'HTTP 404' },
      { provider: 'brapi', ok: true },
    ]);
  });

  it('o fallback é por ticker, não tudo-ou-nada', async () => {
    // O Yahoo responde PETR4 e falha em BTC-BRL: só o segundo vai para a brapi.
    const brapi = vi.fn(async (ticker: string) => quote(ticker, 'brapi'));

    const results = await fetchQuotes(['PETR4', 'BTC-BRL'], {
      providers: [
        fakeProvider('yahoo', (t) =>
          t === 'PETR4' ? quote(t, 'yahoo') : new QuoteUnavailableError('yahoo', t, 'HTTP 404'),
        ),
        { name: 'brapi', fetchQuote: brapi },
      ],
    });

    expect(results.map((r) => r.ok && r.quote.source)).toEqual(['yahoo', 'brapi']);
    expect(brapi).toHaveBeenCalledTimes(1);
    expect(brapi.mock.calls[0][0]).toBe('BTC-BRL');
  });

  it('devolve ok: false quando ninguém responde, com todas as tentativas', async () => {
    const [result] = await fetchQuotes(['XPTO3'], {
      providers: [
        fakeProvider('yahoo', (t) => new QuoteUnavailableError('yahoo', t, 'HTTP 404')),
        fakeProvider('brapi', () => new Error('rede caiu')),
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.attempts).toEqual([
      { provider: 'yahoo', ok: false, reason: 'HTTP 404' },
      { provider: 'brapi', ok: false, reason: 'rede caiu' },
    ]);
  });

  it('não cota o mesmo ticker duas vezes', async () => {
    const provider = vi.fn(async (ticker: string) => quote(ticker, 'yahoo'));

    const results = await fetchQuotes(['PETR4', 'PETR4'], {
      providers: [{ name: 'yahoo', fetchQuote: provider }],
    });

    expect(results).toHaveLength(1);
    expect(provider).toHaveBeenCalledTimes(1);
  });
});
