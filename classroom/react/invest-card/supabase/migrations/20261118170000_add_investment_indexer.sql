-- Renda fixa não tem "variação do dia": tem indexador. Um Tesouro Selic rende
-- `100% Selic`, um CDB `110% CDI`, um Tesouro IPCA+ `IPCA + 5,5%`. O número e
-- o índice mudam de papel para papel, então a coluna é texto livre — não uma
-- lista fechada que envelheceria a cada produto novo.
alter table public.investments
  add column if not exists indexer text;

-- Indexador e ticker são excludentes: o que é cotado em bolsa tem preço de
-- mercado, não uma regra de remuneração.
alter table public.investments
  drop constraint if exists investments_indexer_without_ticker;

alter table public.investments
  add constraint investments_indexer_without_ticker
  check (indexer is null or ticker is null);

comment on column public.investments.indexer is
  'Remuneração da renda fixa (ex.: 100% Selic, IPCA + 5,5%). Nulo para o que tem ticker.';
