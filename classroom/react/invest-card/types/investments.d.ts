export type Investment = {
  id: string;
  name: string;
  type: string;
  category: string;
  performance: number;
  currentValue: number;
  investedValue: number;
  issuer: string;
};

export type NewInvestment = Omit<Investment, 'id'>;

/** Formato das colunas da tabela `investments` no Supabase. */
export type InvestmentRow = {
  id: string;
  name: string;
  type: string;
  category: string;
  performance: number;
  current_value: number;
  invested_value: number;
  issuer: string;
  created_at: string;
};

export type InvestmentFormData = {
  name: string;
  issuer: string;
  type: string;
  category: string;
  performance: string;
  currentValue: string;
  investedValue: string;
};
