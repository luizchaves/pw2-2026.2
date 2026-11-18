-- Dados iniciais (carregados em `supabase db reset`)
--
-- ATENÇÃO: este arquivo cria usuários com senha fixa direto em `auth.users`.
-- Isso é para o ambiente LOCAL de sala de aula. Em produção os usuários nascem
-- pelo signup da aplicação (ou pelo dashboard), nunca por INSERT no seed.
--
-- Duas carteiras, para dar para ver o isolamento por usuário: faça login com
-- uma conta, depois com a outra, e repare que os cards são outros.
--
--   demo@investcard.dev  / demo1234
--   maria@investcard.dev / demo1234

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  -- Com e-mail já confirmado o login funciona na hora (o ambiente local está
  -- com `enable_confirmations = false` no config.toml).
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  -- Colunas de token não aceitam NULL no GoTrue: string vazia é o "sem token".
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'demo@investcard.dev',
    crypt('demo1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'maria@investcard.dev',
    crypt('demo1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    '', '', '', ''
  );

-- O GoTrue procura a identidade do provider `email` para autenticar por senha;
-- só a linha em auth.users não basta.
insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "demo@investcard.dev", "email_verified": true, "phone_verified": false}',
    'email',
    now(), now(), now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "maria@investcard.dev", "email_verified": true, "phone_verified": false}',
    'email',
    now(), now(), now()
  );

-- Carteira do demo@investcard.dev
--
-- `ticker` e `quantity` só existem para o que tem cotação de mercado. O
-- `last_quote` já vem preenchido (derivado de current_value / quantity), então
-- o preço unitário aparece no card desde o primeiro load, antes de qualquer
-- chamada ao /api/quotes/refresh. Como `quote_source` fica nulo, dá para
-- distinguir o valor inicial de uma cotação de verdade.
--
-- Bitcoin usa o par sintético BTC-BRL: o Yahoo só tem BTC-USD, então o
-- provider compõe o preço multiplicando pelo câmbio USDBRL=X.
-- `indexer` é o outro lado da moeda do `ticker`: quem tem preço de mercado não
-- tem regra de remuneração, e vice-versa. O fundo multimercado fica sem os
-- dois — a cota varia, mas não é negociada em bolsa nem rende um índice.
insert into public.investments
  (user_id, name, issuer, type, category, performance, current_value, invested_value, ticker, indexer, quantity, last_quote)
values
  ('11111111-1111-1111-1111-111111111111', 'Tesouro Selic 2029', 'Tesouro Direto', 'Tesouro Direto', 'Renda Fixa', 0.92, 12480.32, 11500.0, null, '100% Selic', null, null),
  ('11111111-1111-1111-1111-111111111111', 'PETR4', 'B3', 'Ação Ordinária', 'Ações', 1.84, 3245.1, 3400.0, 'PETR4', null, 75, 43.268),
  ('11111111-1111-1111-1111-111111111111', 'HGLG11', 'Pátria', 'Fundo Imobiliário', 'Fundos Imobiliários', 2.15, 8760.45, 8100.0, 'HGLG11', null, 61, 143.6139),
  ('11111111-1111-1111-1111-111111111111', 'Bitcoin', 'Binance', 'Criptomoeda', 'Cripto', 5.32, 6120.0, 5000.0, 'BTC-BRL', null, 0.01662, 368231.0469),
  ('11111111-1111-1111-1111-111111111111', 'ITSA4', 'B3', 'Ação Preferencial', 'Ações', 0.47, 2190.6, 2250.0, 'ITSA4', null, 165, 13.2764),
  ('11111111-1111-1111-1111-111111111111', 'CDB Banco XP', 'Banco XP', 'CDB', 'Renda Fixa', 1.1, 5430.88, 5000.0, null, '110% CDI', null, null),
  ('11111111-1111-1111-1111-111111111111', 'GOLD11', 'B3', 'ETF', 'Commodities', 1.48, 2860.75, 2700.0, 'GOLD11', null, 127, 22.5256),
  ('11111111-1111-1111-1111-111111111111', 'Fundo Multimercado XP', 'XP Investimentos', 'Fundo Multimercado', 'Multimercado', -0.65, 7320.15, 7500.0, null, null, null, null),
  ('11111111-1111-1111-1111-111111111111', 'AAPL34', 'B3', 'BDR', 'Ações Internacionais', 3.24, 4150.2, 3900.0, 'AAPL34', null, 40, 103.755);

-- Carteira da maria@investcard.dev: outra pessoa, outros ativos.
insert into public.investments
  (user_id, name, issuer, type, category, performance, current_value, invested_value, ticker, indexer, quantity, last_quote)
values
  ('22222222-2222-2222-2222-222222222222', 'VALE3', 'B3', 'Ação Ordinária', 'Ações', -0.74, 5544.0, 5800.0, 'VALE3', null, 100, 55.44),
  ('22222222-2222-2222-2222-222222222222', 'BOVA11', 'B3', 'ETF', 'Ações', 1.12, 3285.0, 3000.0, 'BOVA11', null, 25, 131.4),
  ('22222222-2222-2222-2222-222222222222', 'Tesouro IPCA+ 2035', 'Tesouro Direto', 'Tesouro Direto', 'Renda Fixa', 0.58, 8140.6, 7800.0, null, 'IPCA + 5,5%', null, null);
