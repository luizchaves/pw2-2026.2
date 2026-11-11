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

export type InvestmentFormData = {
  name: string;
  issuer: string;
  type: string;
  category: string;
  performance: string;
  currentValue: string;
  investedValue: string;
};
