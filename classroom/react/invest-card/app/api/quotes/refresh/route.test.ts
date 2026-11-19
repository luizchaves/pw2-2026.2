import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/quotes/refresh/route';

const { createServerSupabaseClient, fetchQuotes, state } = vi.hoisted(() => {
  const state = {
    user: { id: 'user-1' } as { id: string } | null,
    rows: [] as unknown[],
    selectError: null as { message: string } | null,
    updateError: null as { message: string } | null,
    updates: [] as Record<string, unknown>[],
    clientThrows: false,
  };

  return { state, createServerSupabaseClient: vi.fn(), fetchQuotes: vi.fn() };
});

vi.mock('@/lib/supabase/server', () => ({ createServerSupabaseClient }));
vi.mock('@/features/investments/quotes', () => ({ fetchQuotes }));

/** Cliente de mentira com o encadeamento que o handler usa. */
function fakeClient() {
  const chain = {
    select: vi.fn(() => chain),
    not: vi.fn(async () => ({ data: state.rows, error: state.selectError })),
    update: vi.fn((changes: Record<string, unknown>) => {
      state.updates.push(changes);

      return { eq: vi.fn(async () => ({ error: state.updateError })) };
    }),
  };

  return {
    auth: { getUser: vi.fn(async () => ({ data: { user: state.user } })) },
    from: vi.fn(() => chain),
  };
}

function post(url = 'http://localhost:3000/api/quotes/refresh?force=1') {
  return POST(new Request(url, { method: 'POST' }));
}

function quotableRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'row-1',
    ticker: 'PETR4',
    quantity: 75,
    quote_updated_at: null,
    ...overrides,
  };
}

function quoteResult(overrides: Record<string, unknown> = {}) {
  return {
    ticker: 'PETR4',
    ok: true,
    quote: {
      ticker: 'PETR4',
      price: 43.56,
      changePercent: -1.2,
      currency: 'BRL',
      source: 'brapi',
    },
    attempts: [{ provider: 'brapi', ok: true }],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  state.user = { id: 'user-1' };
  state.rows = [];
  state.selectError = null;
  state.updateError = null;
  state.updates = [];
  createServerSupabaseClient.mockImplementation(async () => fakeClient());
});

describe('POST /api/quotes/refresh', () => {
  it('responde 401 em JSON sem sessão', async () => {
    state.user = null;

    const response = await post();

    // Redirecionar devolveria HTML onde o fetch espera JSON.
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Faça login para continuar.' });
  });

  it('grava preço, provider e valor atual derivado da quantidade', async () => {
    state.rows = [quotableRow()];
    fetchQuotes.mockResolvedValue([quoteResult()]);

    const response = await post();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.refreshed).toHaveLength(1);
    expect(state.updates[0]).toMatchObject({
      last_quote: 43.56,
      quote_source: 'brapi',
      // 75 × 43,56
      current_value: 3267,
      performance: -1.2,
    });
  });

  it('pula o que ainda está fresco quando não é forçado', async () => {
    state.rows = [quotableRow({ quote_updated_at: new Date().toISOString() })];

    const response = await post('http://localhost:3000/api/quotes/refresh');
    const body = await response.json();

    // É isso que protege o rate limit dos providers.
    expect(fetchQuotes).not.toHaveBeenCalled();
    expect(body.skipped).toEqual([{ ticker: 'PETR4', reason: 'cotação ainda fresca' }]);
  });

  it('com force=1, busca mesmo o que acabou de ser cotado', async () => {
    state.rows = [quotableRow({ quote_updated_at: new Date().toISOString() })];
    fetchQuotes.mockResolvedValue([quoteResult()]);

    await post();

    expect(fetchQuotes).toHaveBeenCalledWith(['PETR4']);
  });

  it('recusa cotação em moeda estrangeira em vez de converter errado', async () => {
    state.rows = [quotableRow({ ticker: 'AAPL' })];
    fetchQuotes.mockResolvedValue([
      quoteResult({
        ticker: 'AAPL',
        quote: { ticker: 'AAPL', price: 200, changePercent: 1, currency: 'USD', source: 'yahoo' },
      }),
    ]);

    const response = await post();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.failed[0].reason).toMatch(/veio em USD/);
    expect(state.updates).toHaveLength(0);
  });

  it('502 quando nenhum provider respondeu', async () => {
    state.rows = [quotableRow()];
    fetchQuotes.mockResolvedValue([
      { ticker: 'PETR4', ok: false, attempts: [{ provider: 'yahoo', ok: false, reason: 'HTTP 404' }] },
    ]);

    const response = await post();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.failed[0]).toMatchObject({ ticker: 'PETR4', reason: 'nenhum provider respondeu' });
  });

  it('atualização parcial ainda é sucesso', async () => {
    state.rows = [quotableRow(), quotableRow({ id: 'row-2', ticker: 'XPTO3' })];
    fetchQuotes.mockResolvedValue([
      quoteResult(),
      { ticker: 'XPTO3', ok: false, attempts: [] },
    ]);

    const response = await post();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.refreshed).toHaveLength(1);
    expect(body.failed).toHaveLength(1);
  });

  it('502 quando o banco recusa a leitura', async () => {
    state.selectError = { message: 'permission denied' };

    const response = await post();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: 'permission denied' });
  });

  it('500 quando falta configuração do servidor', async () => {
    createServerSupabaseClient.mockRejectedValue(new Error('Faltam NEXT_PUBLIC_SUPABASE_URL'));

    const response = await post();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Faltam NEXT_PUBLIC_SUPABASE_URL' });
  });

  it('sem nada a cotar, responde vazio sem chamar provider', async () => {
    state.rows = [];

    const response = await post();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ refreshed: [], skipped: [], failed: [] });
    expect(fetchQuotes).not.toHaveBeenCalled();
  });
});
