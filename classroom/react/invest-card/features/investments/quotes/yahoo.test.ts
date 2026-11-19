import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { yahooProvider } from '@/features/investments/quotes/yahoo';
import { QuoteUnavailableError } from '@/features/investments/quotes/types';

/** Resposta do endpoint de chart, no formato que o provider lê. */
function chart(price: number, previousClose: number, currency = 'BRL') {
  return {
    ok: true,
    json: async () => ({
      chart: { result: [{ meta: { regularMarketPrice: price, previousClose, currency } }] },
    }),
  };
}

const fetchMock = vi.fn();
const signal = new AbortController().signal;

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('yahooProvider', () => {
  it('cota ação da B3 acrescentando o sufixo .SA', async () => {
    fetchMock.mockResolvedValue(chart(43.27, 42.5));

    const quote = await yahooProvider.fetchQuote('PETR4', signal);

    expect(String(fetchMock.mock.calls[0][0])).toContain('PETR4.SA');
    expect(quote).toMatchObject({ ticker: 'PETR4', price: 43.27, source: 'yahoo' });
    expect(quote.changePercent).toBeCloseTo(1.81, 2);
  });

  it('passa cripto e câmbio direto, sem sufixo', async () => {
    fetchMock.mockResolvedValue(chart(100, 100, 'USD'));

    await yahooProvider.fetchQuote('BTC-USD', signal);

    expect(String(fetchMock.mock.calls[0][0])).toContain('BTC-USD');
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('.SA');
  });

  it('compõe BTC-BRL multiplicando pelo câmbio, inclusive o fechamento', async () => {
    // O Yahoo não tem esse par: o provider busca BTC-USD e USDBRL=X.
    fetchMock.mockImplementation((url: string) =>
      String(url).includes('USDBRL')
        ? Promise.resolve(chart(5, 4, 'BRL'))
        : Promise.resolve(chart(100, 100, 'USD')),
    );

    const quote = await yahooProvider.fetchQuote('BTC-BRL', signal);

    expect(quote.price).toBe(500);
    expect(quote.currency).toBe('BRL');
    // A variação inclui o movimento do dólar, e isso é proposital:
    // 500 contra 400 de fechamento composto.
    expect(quote.changePercent).toBeCloseTo(25, 5);
  });

  it('falha com o motivo quando a resposta não é 200', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });

    await expect(yahooProvider.fetchQuote('XPTO3', signal)).rejects.toThrow(
      QuoteUnavailableError,
    );
    await expect(yahooProvider.fetchQuote('XPTO3', signal)).rejects.toThrow(/HTTP 404/);
  });

  it('falha quando o corpo vem sem preço', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ chart: { result: [] } }) });

    await expect(yahooProvider.fetchQuote('PETR4', signal)).rejects.toThrow(
      /sem regularMarketPrice/,
    );
  });

  it('não divide por zero quando o fechamento anterior é zero', async () => {
    fetchMock.mockResolvedValue(chart(10, 0));

    const quote = await yahooProvider.fetchQuote('PETR4', signal);

    expect(quote.changePercent).toBe(0);
  });
});
