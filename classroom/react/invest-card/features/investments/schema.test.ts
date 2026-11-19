import { describe, expect, it } from 'vitest';
import {
  emptyInvestmentForm,
  investmentFormSchema,
  toInvestmentForm,
  toNewInvestment,
  type InvestmentFormValues,
} from '@/features/investments/schema';
import { makeInvestment } from '@/features/investments/test-fixtures';

/** Um preenchimento válido de renda fixa; cada teste quebra uma regra. */
function validForm(
  overrides: Partial<InvestmentFormValues> = {},
): InvestmentFormValues {
  return {
    ...emptyInvestmentForm,
    name: 'Tesouro Selic 2029',
    issuer: 'Tesouro Direto',
    type: 'Tesouro Direto',
    category: 'Renda Fixa',
    investedValue: '11.500,00',
    currentValue: '12.480,32',
    indexer: '100% Selic',
    ...overrides,
  };
}

/**
 * As mensagens por campo, como o formulário as mostra: o React Hook Form
 * exibe a primeira de cada campo, então o teste olha para a mesma.
 */
function errorsOf(values: InvestmentFormValues): Record<string, string> {
  const result = investmentFormSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  const errors: Record<string, string> = {};

  for (const issue of result.error.issues) {
    const field = String(issue.path[0]);

    errors[field] ??= issue.message;
  }

  return errors;
}

describe('investmentFormSchema', () => {
  it('aceita um preenchimento completo', () => {
    expect(investmentFormSchema.safeParse(validForm()).success).toBe(true);
  });

  it('cobra os campos obrigatórios', () => {
    const errors = errorsOf(emptyInvestmentForm);

    expect(errors.name).toBe('Informe o nome.');
    expect(errors.issuer).toBe('Informe o emissor.');
    expect(errors.type).toBe('Informe o tipo.');
    expect(errors.category).toBe('Informe a categoria.');
    expect(errors.investedValue).toBe('Informe o valor investido.');
  });

  it('recusa número fora do formato pt-BR', () => {
    expect(errorsOf(validForm({ investedValue: '1,234.56' })).investedValue).toMatch(
      /formato pt-BR/,
    );
  });

  it('exige quantidade quando há ticker', () => {
    const errors = errorsOf(
      validForm({ ticker: 'PETR4', indexer: '', quantity: '' }),
    );

    // A mensagem precisa cair no campo quantidade, não no rodapé do form.
    expect(errors.quantity).toBe('Informe a quantidade para poder cotar o ticker.');
  });

  it('não deixa ticker e indexador conviverem', () => {
    const errors = errorsOf(
      validForm({ ticker: 'PETR4', quantity: '75', indexer: '100% Selic' }),
    );

    // Mesma regra da check constraint do banco.
    expect(errors.indexer).toMatch(/deixe o indexador vazio/);
  });

  it('exige valor atual quando não há ticker para cotar', () => {
    const errors = errorsOf(validForm({ currentValue: '' }));

    expect(errors.currentValue).toMatch(/Informe o valor atual/);
  });

  it('dispensa o valor atual quando há ticker', () => {
    const values = validForm({
      ticker: 'PETR4',
      quantity: '75',
      indexer: '',
      currentValue: '',
    });

    expect(investmentFormSchema.safeParse(values).success).toBe(true);
  });
});

describe('toNewInvestment', () => {
  it('converte os campos de texto para o que o banco recebe', () => {
    const payload = toNewInvestment(
      validForm({ ticker: 'petr4', quantity: '75', indexer: '', currentValue: '3.245,10' }),
    );

    expect(payload).toMatchObject({
      currentValue: 3245.1,
      investedValue: 11500,
      ticker: 'PETR4',
      quantity: 75,
      indexer: null,
    });
  });

  it('sem valor atual, o ativo começa valendo o que custou', () => {
    const payload = toNewInvestment(
      validForm({ ticker: 'TAEE11', quantity: '70', indexer: '', currentValue: '' }),
    );

    // A performance derivada dá 0% no dia da compra, até a primeira cotação.
    expect(payload.currentValue).toBe(payload.investedValue);
  });

  it('guarda o indexador só para quem não tem ticker', () => {
    expect(toNewInvestment(validForm()).indexer).toBe('100% Selic');
    expect(toNewInvestment(validForm()).ticker).toBeNull();
  });
});

describe('toInvestmentForm', () => {
  it('reabre um investimento com os números em pt-BR', () => {
    const values = toInvestmentForm(
      makeInvestment({ currentValue: 6120, investedValue: 5000, quantity: 0.01662 }),
    );

    expect(values.currentValue).toBe('6.120,00');
    expect(values.investedValue).toBe('5.000,00');
    expect(values.quantity).toBe('0,01662');
  });

  it('ida e volta não perde valor', () => {
    const investment = makeInvestment({ ticker: null, indexer: '110% CDI', quantity: null });
    const payload = toNewInvestment(toInvestmentForm(investment));

    expect(payload.currentValue).toBe(investment.currentValue);
    expect(payload.investedValue).toBe(investment.investedValue);
    expect(payload.indexer).toBe('110% CDI');
    expect(payload.quantity).toBeNull();
  });
});
