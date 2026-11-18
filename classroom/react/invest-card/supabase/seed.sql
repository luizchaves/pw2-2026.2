-- Dados iniciais da carteira (carregados em `supabase db reset`)
--
-- `ticker` e `quantity` só existem para o que tem cotação de mercado. O
-- `last_quote` já vem preenchido (derivado de current_value / quantity), então
-- o preço unitário aparece no card desde o primeiro load, antes de qualquer
-- chamada ao /api/quotes/refresh. Como `quote_source` fica nulo, dá para
-- distinguir o valor inicial de uma cotação de verdade.
--
-- Bitcoin usa o par sintético BTC-BRL: o Yahoo só tem BTC-USD, então o
-- provider compõe o preço multiplicando pelo câmbio USDBRL=X.
insert into public.investments
  (name, issuer, type, category, performance, current_value, invested_value, ticker, quantity, last_quote)
values
  ('Tesouro Selic 2029', 'CDB', 'Tesouro Direto', 'Renda Fixa', 0.92, 12480.32, 11500.0, null, null, null),
  ('PETR4', 'B3', 'Ação Ordinária', 'Ações', 1.84, 3245.1, 3400.0, 'PETR4', 75, 43.268),
  ('HGLG11', 'FII', 'Fundo Imobiliário', 'Fundos Imobiliários', 2.15, 8760.45, 8100.0, 'HGLG11', 61, 143.6139),
  ('Bitcoin', 'Binance', 'Criptomoeda', 'Cripto', 5.32, 6120.0, 5000.0, 'BTC-BRL', 0.01662, 368231.0469),
  ('ITSA4', 'B3', 'Ação Preferencial', 'Ações', 0.47, 2190.6, 2250.0, 'ITSA4', 165, 13.2764),
  ('CDB Banco XP', 'CDB', 'Certificado de Depósito Bancário', 'Renda Fixa', 1.1, 5430.88, 5000.0, null, null, null),
  ('GOLD11', 'B3', 'ETF', 'Commodities', 1.48, 2860.75, 2700.0, 'GOLD11', 127, 22.5256),
  ('Fundo Multimercado XP', 'XP Investimentos', 'Fundo Multimercado', 'Multimercado', -0.65, 7320.15, 7500.0, null, null, null),
  ('AAPL34', 'B3', 'BDR', 'Ações Internacionais', 3.24, 4150.2, 3900.0, 'AAPL34', 40, 103.755);
