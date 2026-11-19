import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatLocaleNumber,
  formatPercentage,
  formatQuantity,
  parseLocaleNumber,
} from '@/lib/format';

describe('parseLocaleNumber', () => {
  it('lê o formato pt-BR, com ponto de milhar e vírgula decimal', () => {
    expect(parseLocaleNumber('3.245,10')).toBe(3245.1);
    expect(parseLocaleNumber('12480,32')).toBe(12480.32);
    expect(parseLocaleNumber('75')).toBe(75);
    expect(parseLocaleNumber('-1.234,56')).toBe(-1234.56);
  });

  it('aceita mais de duas casas, que é o caso da cripto', () => {
    // Regressão: com o limite de 2 casas, 0,01662 BTC virava NaN e a
    // quantidade era gravada errada ao salvar o formulário.
    expect(parseLocaleNumber('0,01662')).toBe(0.01662);
  });

  it('tolera R$, % e espaços em volta', () => {
    expect(parseLocaleNumber('R$ 1.900,00')).toBe(1900);
    expect(parseLocaleNumber('1,84%')).toBe(1.84);
  });

  it('devolve NaN para o que não é número', () => {
    expect(parseLocaleNumber('abc')).toBeNaN();
    expect(parseLocaleNumber('')).toBeNaN();
    // Formato en-US não passa: 3.245 ali seria "três mil" para quem digitou.
    expect(parseLocaleNumber('3,245.10')).toBeNaN();
  });
});

describe('formatação', () => {
  it('escreve valores em reais', () => {
    // O Intl usa espaço estreito depois do R$, então a comparação é por partes.
    expect(formatCurrency(3245.1)).toMatch(/^R\$\s3\.245,10$/);
  });

  it('põe sinal na performance, menos no zero', () => {
    expect(formatPercentage(1.84)).toBe('+1,84%');
    expect(formatPercentage(-0.65)).toBe('-0,65%');
    // "+0,00%" sugeria uma alta que não houve.
    expect(formatPercentage(0)).toBe('0,00%');
  });

  it('mostra quantidade inteira ou fracionária conforme o ativo', () => {
    expect(formatQuantity(75)).toBe('75');
    expect(formatQuantity(0.01662)).toBe('0,01662');
  });

  it('devolve um número editável pelo formulário', () => {
    expect(formatLocaleNumber(3245.1)).toBe('3.245,10');
    // Ida e volta: o que o formulário mostra volta a ser o mesmo número.
    expect(parseLocaleNumber(formatLocaleNumber(12480.32))).toBe(12480.32);
  });
});
