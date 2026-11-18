import type { Investment } from '@/features/investments/types';

export type PortfolioSummary = {
  /** Soma do valor atual de todos os ativos. */
  currentValue: number;
  investedValue: number;
  /** Lucro ou prejuízo acumulado, em reais. */
  result: number;
  /** O mesmo resultado em %, sobre o que foi investido. */
  resultPercentage: number;
  count: number;
};

export type CategoryAllocation = {
  category: string;
  value: number;
  /** Fatia da carteira, de 0 a 100. */
  share: number;
  count: number;
};

/**
 * Quanto um valor investido rendeu, em %. É o que o formulário não pergunta
 * mais: com valor atual e valor investido, o número já está determinado.
 */
export function returnPercentage(
  currentValue: number,
  investedValue: number,
): number {
  // Carteira (ou aporte) zerada não tem rentabilidade: dividir por zero daria
  // NaN na tela.
  if (investedValue === 0) {
    return 0;
  }

  return ((currentValue - investedValue) / investedValue) * 100;
}

/**
 * Os números do topo do dashboard. Fica fora do componente porque é cálculo
 * puro: entra uma lista, sai um objeto — dá para ler, testar e reaproveitar
 * sem montar React nenhum.
 */
export function summarize(investments: Investment[]): PortfolioSummary {
  const currentValue = sum(investments, (investment) => investment.currentValue);
  const investedValue = sum(investments, (investment) => investment.investedValue);
  const result = currentValue - investedValue;

  return {
    currentValue,
    investedValue,
    result,
    resultPercentage: returnPercentage(currentValue, investedValue),
    count: investments.length,
  };
}

/** Quanto cada categoria pesa na carteira, da maior fatia para a menor. */
export function allocationByCategory(
  investments: Investment[],
): CategoryAllocation[] {
  const total = sum(investments, (investment) => investment.currentValue);
  const byCategory = new Map<string, { value: number; count: number }>();

  for (const investment of investments) {
    const current = byCategory.get(investment.category) ?? { value: 0, count: 0 };

    byCategory.set(investment.category, {
      value: current.value + investment.currentValue,
      count: current.count + 1,
    });
  }

  return [...byCategory.entries()]
    .map(([category, { value, count }]) => ({
      category,
      value,
      share: total === 0 ? 0 : (value / total) * 100,
      count,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Até `count` ativos de maior alta (ou de maior queda, com
 * `direction: 'down'`) no dia. O filtro por sinal é de propósito: num dia em
 * que tudo subiu, a lista de baixas vem vazia em vez de mostrar altas.
 */
export function rankByPerformance(
  investments: Investment[],
  direction: 'up' | 'down',
  count = 3,
): Investment[] {
  return investments
    .filter(({ performance }) =>
      direction === 'up' ? performance > 0 : performance < 0,
    )
    .sort((a, b) =>
      direction === 'up'
        ? b.performance - a.performance
        : a.performance - b.performance,
    )
    .slice(0, count);
}

function sum(investments: Investment[], pick: (i: Investment) => number): number {
  return investments.reduce((total, investment) => total + pick(investment), 0);
}
