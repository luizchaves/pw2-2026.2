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

/**
 * Sugestões para o campo Indexador. É uma lista de atalho (datalist), não um
 * select: a taxa muda de papel para papel, então o campo aceita qualquer texto.
 */
export const indexerSuggestions: string[] = [
  '100% Selic',
  '100% CDI',
  '110% CDI',
  'IPCA + 5,5%',
  'IPCA + 6%',
  'Prefixado 11% a.a.',
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
