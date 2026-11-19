import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import Dashboard from '@/app/(private)/dashboard/page';
import { makeInvestment } from '@/features/investments/test-fixtures';
import { renderWithProviders } from '@/test-utils';

// A página é a composição; o que ela faz com os dados é o que se testa aqui.
const { useInvestments } = vi.hoisted(() => ({ useInvestments: vi.fn() }));

vi.mock('@/features/investments/hooks/useInvestments', () => ({
  useInvestments,
  useAddInvestment: vi.fn(),
  useUpdateInvestment: vi.fn(),
  useRemoveInvestment: vi.fn(),
  investmentKeys: { all: ['investments'] },
}));

function queryState(overrides: Record<string, unknown> = {}) {
  useInvestments.mockReturnValue({
    data: [],
    isPending: false,
    error: null,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('<Dashboard />', () => {
  it('avisa enquanto a carteira não chegou', () => {
    queryState({ isPending: true, data: undefined });

    renderWithProviders(<Dashboard />);

    expect(screen.getByText('Carregando investimentos...')).toBeInTheDocument();
  });

  it('mostra o erro da query', () => {
    queryState({ error: new Error('Não foi possível carregar os investimentos') });

    renderWithProviders(<Dashboard />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar');
  });

  it('convida a cadastrar quando a carteira está vazia', () => {
    queryState({ data: [] });

    renderWithProviders(<Dashboard />);

    expect(screen.getByText(/Nenhum investimento na carteira ainda/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Adicione o primeiro' })).toHaveAttribute(
      'href',
      '/investments',
    );
  });

  it('consolida patrimônio, investido e resultado', () => {
    queryState({
      data: [
        makeInvestment({ currentValue: 1100, investedValue: 1000, category: 'Ações' }),
        makeInvestment({ currentValue: 900, investedValue: 1000, category: 'Renda Fixa' }),
      ],
    });

    renderWithProviders(<Dashboard />);

    // Uma subiu 100 e a outra caiu 100: patrimônio e investido empatam em
    // 2.000,00, então o valor aparece nos dois cards.
    expect(screen.getAllByText(/R\$\s2\.000,00/)).toHaveLength(2);
    expect(screen.getByText('2 ativos na carteira')).toBeInTheDocument();
    expect(screen.getByText('0,00% sobre o investido')).toBeInTheDocument();
    // Duas categorias: 1.100 e 900 sobre 2.000 dão 55% e 45%, nessa ordem —
    // a alocação vai da maior fatia para a menor.
    const categorias = screen.getByText('Categorias').closest('article');

    expect(within(categorias!).getByText('2')).toBeInTheDocument();

    const fatias = screen
      .getAllByRole('listitem')
      .filter((item) => /\d+% ·/.test(item.textContent ?? ''));

    expect(fatias.map((item) => item.textContent)).toEqual([
      expect.stringContaining('55%'),
      expect.stringContaining('45%'),
    ]);
    expect(fatias[0].textContent).toContain('Ações');
  });

  it('separa as altas das baixas do dia', () => {
    queryState({
      data: [
        makeInvestment({ name: 'SUBIU', performance: 3 }),
        makeInvestment({ name: 'CAIU', performance: -1 }),
      ],
    });

    renderWithProviders(<Dashboard />);

    expect(screen.getByText('+3,00%')).toBeInTheDocument();
    expect(screen.getByText('-1,00%')).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma alta hoje.')).not.toBeInTheDocument();
  });

  it('diz quando não houve baixa no dia', () => {
    queryState({ data: [makeInvestment({ performance: 3 })] });

    renderWithProviders(<Dashboard />);

    expect(screen.getByText('Nenhuma baixa hoje.')).toBeInTheDocument();
  });
});
