import { z } from 'zod';
import { formatLocaleNumber, formatQuantity, parseLocaleNumber } from '@/lib/format';
import type { Investment, NewInvestment } from '@/features/investments/types';

const NUMBER_HINT = 'Use o formato pt-BR, por exemplo 3.245,10.';

function isNumber(value: string): boolean {
  return !Number.isNaN(parseLocaleNumber(value));
}

const requiredText = (field: string) =>
  z.string().trim().min(1, { error: `Informe ${field}.` });

/**
 * Valor em reais: obrigatório e no formato pt-BR. O teste de formato ignora o
 * vazio de propósito — senão o campo em branco acusaria duas coisas ao mesmo
 * tempo ("informe" e "use o formato"), e só a primeira apareceria na tela.
 */
const money = (field: string) =>
  requiredText(field).refine((value) => value === '' || isNumber(value), {
    error: NUMBER_HINT,
  });

/**
 * As regras do formulário de investimento. O schema é a única fonte: o tipo
 * dos campos sai dele (`z.infer`), então campo e validação não têm como
 * divergir, e as regras que cruzam campos ficam declaradas aqui em vez de
 * espalhadas pelo `onSubmit`.
 */
export const investmentFormSchema = z
  .object({
    name: requiredText('o nome'),
    issuer: requiredText('o emissor'),
    type: requiredText('o tipo'),
    category: requiredText('a categoria'),
    investedValue: money('o valor investido'),
    // Vazio só é aceito quando há ticker — a regra cruzada está abaixo.
    currentValue: z
      .string()
      .trim()
      .refine((value) => value === '' || isNumber(value), { error: NUMBER_HINT }),
    ticker: z.string().trim(),
    quantity: z.string().trim(),
    indexer: z.string().trim(),
  })
  // Sem quantidade não dá para derivar o valor atual a partir da cotação.
  .refine((values) => !values.ticker || values.quantity !== '', {
    error: 'Informe a quantidade para poder cotar o ticker.',
    path: ['quantity'],
  })
  // Idem: quantidade vazia já é acusada pela regra acima.
  .refine(
    (values) =>
      !values.ticker || values.quantity === '' || isNumber(values.quantity),
    {
      error: NUMBER_HINT,
      path: ['quantity'],
    },
  )
  // Mesma regra da check constraint do banco, só que avisando antes.
  .refine((values) => !values.ticker || values.indexer === '', {
    error: 'Ativo com ticker é cotado pelo mercado: deixe o indexador vazio.',
    path: ['indexer'],
  })
  // Sem ticker não há de onde tirar o valor atual.
  .refine((values) => values.ticker !== '' || values.currentValue !== '', {
    error: 'Informe o valor atual, ou um ticker para cotar o ativo.',
    path: ['currentValue'],
  });

export type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

export const emptyInvestmentForm: InvestmentFormValues = {
  name: '',
  issuer: '',
  type: '',
  category: '',
  investedValue: '',
  currentValue: '',
  ticker: '',
  quantity: '',
  indexer: '',
};

/** Reabre um investimento no formulário: números viram texto em pt-BR. */
export function toInvestmentForm(investment: Investment): InvestmentFormValues {
  return {
    name: investment.name,
    issuer: investment.issuer,
    type: investment.type,
    category: investment.category,
    investedValue: formatLocaleNumber(investment.investedValue),
    currentValue: formatLocaleNumber(investment.currentValue),
    ticker: investment.ticker ?? '',
    quantity:
      investment.quantity === null ? '' : formatQuantity(investment.quantity),
    indexer: investment.indexer ?? '',
  };
}

/** O caminho inverso: dos campos validados para o que o banco recebe. */
export function toNewInvestment(values: InvestmentFormValues): NewInvestment {
  const ticker = values.ticker.toUpperCase();
  const investedValue = parseLocaleNumber(values.investedValue);

  return {
    name: values.name,
    issuer: values.issuer,
    type: values.type,
    category: values.category,
    // Vazio só chega aqui com ticker: até a primeira cotação o ativo vale o
    // que custou, e a performance derivada dá 0%.
    currentValue: values.currentValue
      ? parseLocaleNumber(values.currentValue)
      : investedValue,
    investedValue,
    ticker: ticker || null,
    indexer: ticker ? null : values.indexer || null,
    quantity: ticker ? parseLocaleNumber(values.quantity) : null,
  };
}
