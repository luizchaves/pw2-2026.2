export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

/**
 * Aceita apenas o formato pt-BR: ponto como separador de milhar e vírgula
 * como separador decimal. Ex.: "-1.234,56", "0,92", "12480,32".
 */
export const LOCALE_NUMBER_PATTERN =
  '-?\\d{1,3}(\\.\\d{3})*(,\\d{1,2})?|-?\\d+(,\\d{1,2})?';

/**
 * Converte um número escrito em pt-BR (ou em BRL, com "R$" e espaços) para
 * o `number` do JavaScript. Retorna NaN quando o texto não é um número válido.
 */
export function parseLocaleNumber(value: string): number {
  const digits = value.replace(/[R$%\s]/g, '').trim();

  if (!new RegExp(`^(${LOCALE_NUMBER_PATTERN})$`).test(digits)) {
    return NaN;
  }

  return Number(digits.replace(/\./g, '').replace(',', '.'));
}
