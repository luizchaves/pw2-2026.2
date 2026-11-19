import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import InvestmentCard from '@/features/investments/components/InvestmentCard';
import { makeInvestment } from '@/features/investments/test-fixtures';
import { renderWithProviders } from '@/test-utils';

// Nenhum teste aqui escreve no banco; o card só precisa que o módulo exista.
vi.mock('@/features/investments/api', () => ({
  fetchInvestments: vi.fn(),
  insertInvestment: vi.fn(),
  updateInvestment: vi.fn(),
  deleteInvestment: vi.fn(),
}));

describe('<InvestmentCard />', () => {
  it('mostra nome, emissor e os valores da carteira', () => {
    renderWithProviders(<InvestmentCard investment={makeInvestment()} />);

    expect(screen.getByRole('heading', { name: 'PETR4' })).toBeInTheDocument();
    expect(screen.getByText('B3')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s3\.245,10/)).toBeInTheDocument();
    expect(screen.getByText(/Investido:/)).toHaveTextContent('3.400,00');
  });

  it('mostra quantidade × cotação para quem é negociado em bolsa', () => {
    renderWithProviders(<InvestmentCard investment={makeInvestment()} />);

    expect(screen.getByText(/75\s×\s*R\$\s43,27/)).toBeInTheDocument();
  });

  it('troca a cotação pelo indexador na renda fixa', () => {
    renderWithProviders(
      <InvestmentCard
        investment={makeInvestment({
          name: 'Tesouro Selic 2029',
          ticker: null,
          quantity: null,
          lastQuote: null,
          indexer: '100% Selic',
        })}
      />,
    );

    expect(screen.getByText('Rende 100% Selic')).toBeInTheDocument();
    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
  });

  it('pinta a performance conforme o sinal', () => {
    const { rerender } = renderWithProviders(
      <InvestmentCard investment={makeInvestment({ performance: 2.5 })} />,
    );

    expect(screen.getByText('+2,50%')).toHaveClass('text-emerald-700');

    rerender(<InvestmentCard investment={makeInvestment({ performance: -2.5 })} />);
    expect(screen.getByText('-2,50%')).toHaveClass('text-rose-700');
  });

  it('dá cor neutra ao zero, que é o ativo recém-cadastrado', () => {
    renderWithProviders(
      <InvestmentCard investment={makeInvestment({ performance: 0 })} />,
    );

    // Vermelho ali sugeriria prejuízo onde não houve movimento nenhum.
    expect(screen.getByText('0,00%')).toHaveClass('text-slate-500');
  });

  it('oferece editar e remover, com o nome do ativo no rótulo', () => {
    renderWithProviders(<InvestmentCard investment={makeInvestment()} />);

    expect(screen.getByRole('button', { name: 'Editar PETR4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover PETR4' })).toBeInTheDocument();
  });
});
