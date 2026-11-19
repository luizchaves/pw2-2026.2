import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentForm from '@/features/investments/components/InvestmentForm';
import { makeInvestment } from '@/features/investments/test-fixtures';
import { renderWithProviders } from '@/test-utils';

// O formulário é testado até a borda do banco: a API é dublê, e o que se
// verifica é o que ela recebeu.
const { insertInvestment, updateInvestment } = vi.hoisted(() => ({
  insertInvestment: vi.fn(),
  updateInvestment: vi.fn(),
}));

vi.mock('@/features/investments/api', () => ({
  fetchInvestments: vi.fn(),
  insertInvestment,
  updateInvestment,
  deleteInvestment: vi.fn(),
}));

async function openForm(investment?: ReturnType<typeof makeInvestment>) {
  const user = userEvent.setup();

  renderWithProviders(<InvestmentForm investment={investment} />);
  await user.click(
    screen.getByRole('button', {
      name: investment ? `Editar ${investment.name}` : 'Adicionar investimento',
    }),
  );

  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('<InvestmentForm /> — validação', () => {
  it('acusa os campos obrigatórios sem chamar o banco', async () => {
    const user = await openForm();

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe o emissor.')).toBeInTheDocument();
    expect(screen.getByText('Informe o valor investido.')).toBeInTheDocument();
    expect(insertInvestment).not.toHaveBeenCalled();
  });

  it('põe a mensagem embaixo do campo que a causou', async () => {
    const user = await openForm();

    await user.type(screen.getByLabelText('Ticker (opcional)'), 'PETR4');
    await user.type(screen.getByLabelText('Indexador (opcional)'), '100% Selic');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    // Regras que cruzam campos: antes apareciam uma por vez, no rodapé.
    expect(
      await screen.findByText('Informe a quantidade para poder cotar o ticker.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ativo com ticker é cotado pelo mercado: deixe o indexador vazio.'),
    ).toBeInTheDocument();
  });

  it('cobra o valor atual só quando não há ticker para cotar', async () => {
    const user = await openForm();

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(
      await screen.findByText('Informe o valor atual, ou um ticker para cotar o ativo.'),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Ticker (opcional)'), 'PETR4');
    await user.type(screen.getByLabelText('Quantidade'), '75');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => {
      expect(
        screen.queryByText('Informe o valor atual, ou um ticker para cotar o ativo.'),
      ).not.toBeInTheDocument();
    });
  });
});

describe('<InvestmentForm /> — escrita', () => {
  it('manda ao banco os valores já convertidos', async () => {
    insertInvestment.mockResolvedValue(makeInvestment());
    const user = await openForm();

    await user.type(screen.getByLabelText('Nome'), 'Tesouro Selic 2029');
    await user.type(screen.getByLabelText('Emissor'), 'Tesouro Direto');
    await user.type(screen.getByLabelText('Valor investido'), '11.500,00');
    await user.type(screen.getByLabelText('Valor atual'), '12.480,32');
    await user.type(screen.getByLabelText('Indexador (opcional)'), '100% Selic');

    await user.click(screen.getByRole('combobox', { name: 'Tipo' }));
    await user.click(await screen.findByRole('option', { name: 'Tesouro Direto' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(await screen.findByRole('option', { name: 'Renda Fixa' }));

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    // O TanStack Query passa um segundo argumento de contexto para a
    // mutationFn; o que interessa aqui é o primeiro.
    await waitFor(() => expect(insertInvestment).toHaveBeenCalled());
    expect(insertInvestment.mock.calls[0][0]).toEqual({
      name: 'Tesouro Selic 2029',
      issuer: 'Tesouro Direto',
      type: 'Tesouro Direto',
      category: 'Renda Fixa',
      // Texto em pt-BR vira número; o indexador fica porque não há ticker.
      investedValue: 11500,
      currentValue: 12480.32,
      ticker: null,
      indexer: '100% Selic',
      quantity: null,
    });
  });

  it('abre preenchido na edição e salva por cima', async () => {
    const investment = makeInvestment({ ticker: null, quantity: null, indexer: '110% CDI' });
    updateInvestment.mockResolvedValue(investment);
    const user = await openForm(investment);

    expect(screen.getByLabelText('Nome')).toHaveValue(investment.name);
    expect(screen.getByLabelText('Valor investido')).toHaveValue('3.400,00');

    await user.clear(screen.getByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), 'PETR4 renomeado');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(updateInvestment).toHaveBeenCalledWith(
        investment.id,
        expect.objectContaining({ name: 'PETR4 renomeado', indexer: '110% CDI' }),
      );
    });
  });
});
