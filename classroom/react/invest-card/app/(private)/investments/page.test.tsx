import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Home from '@/app/(private)/investments/page';
import { makeInvestment } from '@/features/investments/test-fixtures';
import { renderWithProviders } from '@/test-utils';

const { useInvestments } = vi.hoisted(() => ({ useInvestments: vi.fn() }));

vi.mock('@/features/investments/hooks/useInvestments', () => ({
  useInvestments,
  useAddInvestment: () => ({ mutateAsync: vi.fn(), reset: vi.fn(), isPending: false, error: null }),
  useUpdateInvestment: () => ({ mutateAsync: vi.fn(), reset: vi.fn(), isPending: false, error: null }),
  useRemoveInvestment: () => ({ mutate: vi.fn(), error: null }),
  useRefreshQuotes: () => ({ mutate: vi.fn(), isPending: false, data: undefined, error: null }),
  investmentKeys: { all: ['investments'] },
}));

function queryState(overrides: Record<string, unknown> = {}) {
  useInvestments.mockReturnValue({
    data: [],
    isPending: false,
    isFetching: false,
    error: null,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('<Home /> — a carteira', () => {
  it('lista um card por investimento', () => {
    queryState({
      data: [makeInvestment({ name: 'PETR4' }), makeInvestment({ name: 'ITSA4' })],
    });

    renderWithProviders(<Home />);

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'PETR4' })).toBeInTheDocument();
  });

  it('avisa quando a carteira está vazia', () => {
    queryState({ data: [] });

    renderWithProviders(<Home />);

    expect(screen.getByText(/Nenhum investimento na carteira/)).toBeInTheDocument();
  });

  it('mostra carregando no primeiro load', () => {
    queryState({ isPending: true, data: undefined });

    renderWithProviders(<Home />);

    expect(screen.getByText('Carregando investimentos...')).toBeInTheDocument();
  });

  it('mantém os cards na tela durante a revalidação', () => {
    // isFetching é o refetch em background: os dados antigos continuam
    // visíveis, só esmaecidos.
    queryState({ data: [makeInvestment()], isFetching: true });

    renderWithProviders(<Home />);

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.queryByText('Carregando investimentos...')).not.toBeInTheDocument();
    expect(document.querySelector('.investments-grid')).toHaveClass('opacity-60');
  });

  it('mostra o erro da query', () => {
    queryState({ error: new Error('Falha no banco') });

    renderWithProviders(<Home />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha no banco');
  });
});
