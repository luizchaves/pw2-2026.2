import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteInvestment,
  fetchInvestments,
  insertInvestment,
  updateInvestment,
} from '@/features/investments/api';
import type { InvestmentRow, NewInvestment } from '@/features/investments/types';

// O cliente do Supabase é encadeado (from().insert().select().single()), então
// o dublê devolve ele mesmo em cada passo e guarda o que recebeu.
const { supabase, calls } = vi.hoisted(() => {
  const calls = {
    table: '',
    insert: null as unknown,
    update: null as unknown,
    eq: null as unknown,
    deleted: false,
    order: [] as unknown[],
    result: { data: null as unknown, error: null as { message: string } | null },
    user: { id: 'user-1' } as { id: string } | null,
  };

  const chain: Record<string, unknown> = {
    select: vi.fn(() => chain),
    insert: vi.fn((row: unknown) => ((calls.insert = row), chain)),
    update: vi.fn((row: unknown) => ((calls.update = row), chain)),
    delete: vi.fn(() => ((calls.deleted = true), chain)),
    eq: vi.fn((column: string, value: unknown) => ((calls.eq = [column, value]), chain)),
    order: vi.fn((column: string) => (calls.order.push(column), chain)),
    single: vi.fn(async () => calls.result),
    then: (resolve: (value: unknown) => unknown) => resolve(calls.result),
  };

  return {
    calls,
    supabase: {
      from: vi.fn((table: string) => ((calls.table = table), chain)),
      auth: { getUser: vi.fn(async () => ({ data: { user: calls.user } })) },
    },
  };
});

vi.mock('@/lib/supabase/client', () => ({ supabase }));

function row(overrides: Partial<InvestmentRow> = {}): InvestmentRow {
  return {
    id: 'abc',
    user_id: 'user-1',
    name: 'PETR4',
    issuer: 'B3',
    type: 'Ação Ordinária',
    category: 'Ações',
    // O Postgres devolve numeric como string: a conversão é parte do contrato.
    performance: '1.84' as unknown as number,
    current_value: '3245.10' as unknown as number,
    invested_value: '3400.00' as unknown as number,
    created_at: '2026-11-18T12:00:00Z',
    ticker: 'PETR4',
    indexer: null,
    quantity: '75.00000000' as unknown as number,
    last_quote: '43.2700' as unknown as number,
    quote_source: 'yahoo',
    quote_updated_at: '2026-11-18T12:00:00Z',
    ...overrides,
  };
}

const newInvestment: NewInvestment = {
  name: 'Tesouro Selic 2029',
  issuer: 'Tesouro Direto',
  type: 'Tesouro Direto',
  category: 'Renda Fixa',
  currentValue: 1100,
  investedValue: 1000,
  ticker: null,
  indexer: '100% Selic',
  quantity: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  calls.result = { data: null, error: null };
  calls.user = { id: 'user-1' };
  calls.order = [];
  // Sem zerar o que foi gravado, um teste enxerga a escrita do anterior.
  calls.insert = null;
  calls.update = null;
  calls.eq = null;
  calls.deleted = false;
});

describe('fetchInvestments', () => {
  it('converte snake_case em camelCase e numeric em número', async () => {
    calls.result = { data: [row()], error: null };

    const [investment] = await fetchInvestments();

    expect(investment).toMatchObject({
      currentValue: 3245.1,
      investedValue: 3400,
      performance: 1.84,
      quantity: 75,
      lastQuote: 43.27,
      quoteSource: 'yahoo',
    });
    expect(typeof investment.currentValue).toBe('number');
  });

  it('preserva os nulos da renda fixa', async () => {
    calls.result = {
      data: [row({ ticker: null, quantity: null, last_quote: null, indexer: '110% CDI' })],
      error: null,
    };

    const [investment] = await fetchInvestments();

    expect(investment).toMatchObject({
      ticker: null,
      quantity: null,
      lastQuote: null,
      indexer: '110% CDI',
    });
  });

  it('ordena por created_at e desempata por nome', async () => {
    calls.result = { data: [], error: null };

    await fetchInvestments();

    expect(calls.order).toEqual(['created_at', 'name']);
  });

  it('transforma erro do banco em mensagem para a tela', async () => {
    calls.result = { data: null, error: { message: 'conexão recusada' } };

    await expect(fetchInvestments()).rejects.toThrow(
      'Não foi possível carregar os investimentos: conexão recusada',
    );
  });
});

describe('insertInvestment', () => {
  it('grava o dono da linha, que o RLS vai conferir', async () => {
    calls.result = { data: row(), error: null };

    await insertInvestment(newInvestment);

    expect(calls.insert).toMatchObject({ user_id: 'user-1' });
  });

  it('deriva a performance de (atual - investido) / investido', async () => {
    calls.result = { data: row(), error: null };

    await insertInvestment(newInvestment);

    // 1100 sobre 1000 aportados = +10%.
    expect(calls.insert).toMatchObject({ performance: 10 });
  });

  it('exige sessão antes de tentar escrever', async () => {
    calls.user = null;

    await expect(insertInvestment(newInvestment)).rejects.toThrow(/Faça login/);
    expect(calls.insert).toBeNull();
  });
});

describe('updateInvestment', () => {
  it('recalcula a performance de quem não tem ticker', async () => {
    calls.result = { data: row(), error: null };

    await updateInvestment('abc', newInvestment);

    expect(calls.update).toMatchObject({ performance: 10 });
    expect(calls.eq).toEqual(['id', 'abc']);
  });

  it('não toca na performance de quem é cotado pelo mercado', async () => {
    calls.result = { data: row(), error: null };

    await updateInvestment('abc', {
      ...newInvestment,
      ticker: 'PETR4',
      indexer: null,
      quantity: 75,
    });

    // Ela pertence ao provider: recalcular aqui trocaria a variação do dia
    // pela rentabilidade acumulada.
    expect(calls.update).not.toHaveProperty('performance');
  });
});

describe('deleteInvestment', () => {
  it('apaga pela chave', async () => {
    calls.result = { data: null, error: null };

    await deleteInvestment('abc');

    expect(calls.deleted).toBe(true);
    expect(calls.eq).toEqual(['id', 'abc']);
  });

  it('avisa quando o banco recusa', async () => {
    calls.result = { data: null, error: { message: 'row not found' } };

    await expect(deleteInvestment('abc')).rejects.toThrow(/Não foi possível remover/);
  });
});
