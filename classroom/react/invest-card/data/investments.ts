// Os investimentos da carteira vivem no Supabase (ver supabase/seed.sql).
// Aqui ficam apenas as opções fixas usadas nos selects do formulário.

export const investmentTypes: string[] = [
  'Tesouro Direto',
  'CDB',
  'Ação Ordinária',
  'Ação Preferencial',
  'BDR',
  'Fundo Imobiliário',
  'Fundo Multimercado',
  'ETF',
  'Criptomoeda',
];

export const investmentCategories: string[] = [
  'Renda Fixa',
  'Ações',
  'Ações Internacionais',
  'Fundos Imobiliários',
  'Multimercado',
  'Commodities',
  'Cripto',
];
