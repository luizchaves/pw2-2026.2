import type { Investment } from '@/features/investments/types';

/** Um investimento qualquer; cada teste sobrescreve o que lhe interessa. */
export function makeInvestment(overrides: Partial<Investment> = {}): Investment {
  return {
    id: crypto.randomUUID(),
    name: 'PETR4',
    issuer: 'B3',
    type: 'Ação Ordinária',
    category: 'Ações',
    performance: 1.84,
    currentValue: 3245.1,
    investedValue: 3400,
    ticker: 'PETR4',
    indexer: null,
    quantity: 75,
    lastQuote: 43.27,
    quoteSource: 'yahoo',
    quoteUpdatedAt: '2026-11-18T12:00:00.000Z',
    ...overrides,
  };
}
