-- Cotação de mercado para os ativos que têm ticker negociado em bolsa.
-- Renda fixa (Tesouro, CDB) e fundos não têm ticker: ficam com `ticker` nulo
-- e seguem com os valores informados à mão no formulário.

alter table public.investments
  add column if not exists ticker text,
  add column if not exists quantity numeric(18, 8),
  add column if not exists last_quote numeric(14, 4),
  add column if not exists quote_currency text,
  add column if not exists quote_source text,
  add column if not exists quote_updated_at timestamptz;

-- Sem quantidade não dá para derivar o valor atual a partir da cotação.
alter table public.investments
  drop constraint if exists investments_ticker_requires_quantity;

alter table public.investments
  add constraint investments_ticker_requires_quantity
  check (ticker is null or quantity is not null);

create index if not exists investments_ticker_idx
  on public.investments (ticker)
  where ticker is not null;

comment on column public.investments.ticker is
  'Símbolo canônico (ex.: PETR4). Cada provider traduz para o seu formato.';
comment on column public.investments.quote_source is
  'Qual provider respondeu por último: yahoo ou brapi.';

-- Os GRANTs da migration anterior são por tabela, então já valem para as
-- colunas novas. As policies de RLS continuam as mesmas.
