import { describe, expect, it } from 'vitest';
import {
  allocationByCategory,
  rankByPerformance,
  returnPercentage,
  summarize,
} from '@/features/investments/portfolio';
import { makeInvestment } from '@/features/investments/test-fixtures';

describe('returnPercentage', () => {
  it('mede quanto o aporte rendeu', () => {
    expect(returnPercentage(1100, 1000)).toBeCloseTo(10);
    expect(returnPercentage(3245.1, 3400)).toBeCloseTo(-4.56, 2);
  });

  it('não divide por zero', () => {
    // Carteira vazia (ou aporte zerado) daria NaN na tela.
    expect(returnPercentage(0, 0)).toBe(0);
  });
});

describe('summarize', () => {
  it('soma a carteira e calcula o resultado', () => {
    const summary = summarize([
      makeInvestment({ currentValue: 1000, investedValue: 900 }),
      makeInvestment({ currentValue: 500, investedValue: 600 }),
    ]);

    expect(summary.currentValue).toBe(1500);
    expect(summary.investedValue).toBe(1500);
    expect(summary.result).toBe(0);
    expect(summary.resultPercentage).toBe(0);
    expect(summary.count).toBe(2);
  });

  it('devolve zeros para a carteira vazia', () => {
    expect(summarize([])).toEqual({
      currentValue: 0,
      investedValue: 0,
      result: 0,
      resultPercentage: 0,
      count: 0,
    });
  });
});

describe('allocationByCategory', () => {
  it('agrupa por categoria, da maior fatia para a menor', () => {
    const allocation = allocationByCategory([
      makeInvestment({ category: 'Ações', currentValue: 200 }),
      makeInvestment({ category: 'Renda Fixa', currentValue: 600 }),
      makeInvestment({ category: 'Ações', currentValue: 200 }),
    ]);

    expect(allocation).toEqual([
      { category: 'Renda Fixa', value: 600, share: 60, count: 1 },
      { category: 'Ações', value: 400, share: 40, count: 2 },
    ]);
  });
});

describe('rankByPerformance', () => {
  const carteira = [
    makeInvestment({ name: 'ALTA', performance: 5 }),
    makeInvestment({ name: 'BAIXA', performance: -2 }),
    makeInvestment({ name: 'PARADA', performance: 0 }),
    makeInvestment({ name: 'ALTINHA', performance: 1 }),
  ];

  it('ordena as altas da maior para a menor', () => {
    expect(rankByPerformance(carteira, 'up').map((i) => i.name)).toEqual([
      'ALTA',
      'ALTINHA',
    ]);
  });

  it('só lista quem de fato caiu', () => {
    // Num dia em que tudo subiu, a lista de baixas vem vazia em vez de
    // mostrar altas disfarçadas.
    expect(rankByPerformance(carteira, 'down').map((i) => i.name)).toEqual([
      'BAIXA',
    ]);
  });

  it('respeita o limite pedido', () => {
    expect(rankByPerformance(carteira, 'up', 1)).toHaveLength(1);
  });
});
