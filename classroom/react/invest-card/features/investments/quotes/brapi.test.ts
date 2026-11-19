import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { brapiProvider } from '@/features/investments/quotes/brapi';

const fetchMock = vi.fn();
const signal = new AbortController().signal;
const originalToken = process.env.BRAPI_TOKEN;

function ok(body: unknown) {
  return { ok: true, json: async () => body };
}

/** A URL chamada, já com a query string. */
function calledUrl(call = 0): string {
  return String(fetchMock.mock.calls[call][0]);
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  delete process.env.BRAPI_TOKEN;
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.BRAPI_TOKEN = originalToken;
});

describe('brapiProvider', () => {
  it('cota ativo de bolsa pelo ticker puro', async () => {
    fetchMock.mockResolvedValue(
      ok({ results: [{ regularMarketPrice: 43.56, regularMarketChangePercent: -1.2 }] }),
    );

    const quote = await brapiProvider.fetchQuote('PETR4', signal);

    expect(calledUrl()).toContain('/quote/PETR4');
    expect(quote).toMatchObject({
      ticker: 'PETR4',
      price: 43.56,
      changePercent: -1.2,
      currency: 'BRL',
      source: 'brapi',
    });
  });

  it('manda cripto para o endpoint de moedas, com a moeda pedida', async () => {
    fetchMock.mockResolvedValue(
      ok({ coins: [{ regularMarketPrice: 368231.04, regularMarketChangePercent: 5.32 }] }),
    );

    const quote = await brapiProvider.fetchQuote('BTC-BRL', signal);

    expect(calledUrl()).toContain('/v2/crypto');
    expect(calledUrl()).toContain('coin=BTC');
    expect(calledUrl()).toContain('currency=BRL');
    expect(quote.price).toBe(368231.04);
  });

  it('acrescenta o token quando existe', async () => {
    process.env.BRAPI_TOKEN = 'token-de-teste';
    fetchMock.mockResolvedValue(ok({ results: [{ regularMarketPrice: 10 }] }));

    await brapiProvider.fetchQuote('PETR4', signal);

    expect(calledUrl()).toContain('token=token-de-teste');
  });

  it('sem token, não inventa parâmetro', async () => {
    fetchMock.mockResolvedValue(ok({ results: [{ regularMarketPrice: 10 }] }));

    await brapiProvider.fetchQuote('PETR4', signal);

    expect(calledUrl()).not.toContain('token=');
  });

  it('explica o 401 em vez de repetir o código', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    // É o erro mais comum em aula: a brapi exige token para lote e cripto.
    await expect(brapiProvider.fetchQuote('PETR4', signal)).rejects.toThrow(
      /defina BRAPI_TOKEN/,
    );
  });

  it('assume variação zero quando o provider não manda', async () => {
    fetchMock.mockResolvedValue(ok({ results: [{ regularMarketPrice: 10 }] }));

    const quote = await brapiProvider.fetchQuote('PETR4', signal);

    expect(quote.changePercent).toBe(0);
  });

  it('falha quando a resposta não traz preço', async () => {
    fetchMock.mockResolvedValue(ok({ results: [] }));

    await expect(brapiProvider.fetchQuote('PETR4', signal)).rejects.toThrow(
      /sem regularMarketPrice/,
    );
  });
});
