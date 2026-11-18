-- Dados iniciais da carteira (carregados em `supabase db reset`)
insert into public.investments
  (name, issuer, type, category, performance, current_value, invested_value)
values
  ('Tesouro Selic 2029', 'CDB', 'Tesouro Direto', 'Renda Fixa', 0.92, 12480.32, 11500.00),
  ('PETR4', 'B3', 'Ação Ordinária', 'Ações', 1.84, 3245.10, 3400.00),
  ('HGLG11', 'FII', 'Fundo Imobiliário', 'Fundos Imobiliários', 2.15, 8760.45, 8100.00),
  ('Bitcoin', 'Binance', 'Criptomoeda', 'Cripto', 5.32, 6120.00, 5000.00),
  ('ITSA4', 'B3', 'Ação Preferencial', 'Ações', 0.47, 2190.60, 2250.00),
  ('CDB Banco XP', 'CDB', 'Certificado de Depósito Bancário', 'Renda Fixa', 1.10, 5430.88, 5000.00),
  ('GOLD11', 'B3', 'ETF', 'Commodities', 1.48, 2860.75, 2700.00),
  ('Fundo Multimercado XP', 'XP Investimentos', 'Fundo Multimercado', 'Multimercado', -0.65, 7320.15, 7500.00),
  ('AAPL34', 'B3', 'BDR', 'Ações Internacionais', 3.24, 4150.20, 3900.00);
