import {
  investmentCategories,
  investmentTypes,
} from '@/features/investments/options';

/**
 * A descrição dos campos do formulário, fora do componente: acrescentar um
 * campo passa a ser acrescentar uma linha aqui, e o JSX continua o mesmo.
 */
export const textFields = [
  { name: 'name', label: 'Nome', placeholder: 'PETR4' },
  { name: 'issuer', label: 'Emissor', placeholder: 'B3' },
] as const;

export const selectFields = [
  {
    name: 'type',
    label: 'Tipo',
    placeholder: 'Selecione o tipo',
    options: investmentTypes,
  },
  {
    name: 'category',
    label: 'Categoria',
    placeholder: 'Selecione a categoria',
    options: investmentCategories,
  },
] as const;

// Sem campo de performance: ela é calculada a partir destes dois valores (e,
// para quem tem ticker, sobrescrita pela cotação no próximo refresh). O que
// foi aportado vem primeiro, porque é o dado que a pessoa sempre tem na mão;
// o valor atual só é dispensável quando há ticker para cotar.
export const numberFields = [
  {
    name: 'investedValue',
    label: 'Valor investido',
    prefix: 'R$',
    placeholder: '3.400,00',
  },
  {
    name: 'currentValue',
    label: 'Valor atual',
    prefix: 'R$',
    placeholder: '3.245,10',
  },
] as const;

// Preenchidos só para o que é negociado em bolsa. Com ticker, a cotação passa
// a vir do /api/quotes/refresh e sobrescreve os valores acima.
export const quoteFields = [
  {
    name: 'ticker',
    label: 'Ticker (opcional)',
    placeholder: 'PETR4',
    hint: 'Deixe vazio para renda fixa e fundos',
  },
  {
    name: 'quantity',
    label: 'Quantidade',
    placeholder: '75',
    hint: 'Obrigatória quando há ticker',
  },
] as const;
