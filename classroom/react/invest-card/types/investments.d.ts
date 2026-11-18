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
  quantity: number | null;
  lastQuote: number | null;
  quoteSource: string | null;
  quoteUpdatedAt: string | null;
};

export type NewInvestment = Omit<
  Investment,
  'id' | 'lastQuote' | 'quoteSource' | 'quoteUpdatedAt'
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
  performance: string;
  currentValue: string;
  investedValue: string;
  ticker: string;
  quantity: string;
};
