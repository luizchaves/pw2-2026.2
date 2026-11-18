export type Investment = {
  id: string;
  name: string;
  type: string;
  category: string;
  performance: number;
  currentValue: number;
  investedValue: number;
  issuer: string;
  /** Símbolo negociado em bolsa. Nulo para renda fixa e fundos. */
  ticker: string | null;
  /** Remuneração da renda fixa (ex.: 100% Selic). Nulo quando há ticker. */
  indexer: string | null;
  quantity: number | null;
  lastQuote: number | null;
  quoteSource: string | null;
  quoteUpdatedAt: string | null;
};

/**
 * O que o formulário envia. `performance` fica de fora porque é derivada: ou
 * vem do provider de cotações, ou sai de valor atual vs. valor investido.
 */
export type NewInvestment = Omit<
  Investment,
  'id' | 'performance' | 'lastQuote' | 'quoteSource' | 'quoteUpdatedAt'
>;

/** Formato das colunas da tabela `investments` no Supabase. */
export type InvestmentRow = {
  id: string;
  /** Dono da linha: comparado com auth.uid() nas policies de RLS. */
  user_id: string;
  name: string;
  type: string;
  category: string;
  performance: number;
  current_value: number;
  invested_value: number;
  issuer: string;
  created_at: string;
  ticker: string | null;
  indexer: string | null;
  quantity: number | null;
  last_quote: number | null;
  quote_source: string | null;
  quote_updated_at: string | null;
};

export type InvestmentFormData = {
  name: string;
  issuer: string;
  type: string;
  category: string;
  currentValue: string;
  investedValue: string;
  ticker: string;
  indexer: string;
  quantity: string;
};
