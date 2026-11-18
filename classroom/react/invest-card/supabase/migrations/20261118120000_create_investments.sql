-- Tabela de investimentos da carteira
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  type text not null,
  category text not null,
  performance numeric(8, 2) not null default 0,
  current_value numeric(14, 2) not null default 0,
  invested_value numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists investments_created_at_idx
  on public.investments (created_at);

-- Acesso via API (PostgREST) para as chaves pública e autenticada.
grant select, insert, update, delete on public.investments to anon, authenticated;

-- Row Level Security: a aplicação ainda não tem autenticação,
-- então liberamos leitura/escrita para a chave anônima (uso em sala de aula).
alter table public.investments enable row level security;

drop policy if exists "investments_select_anon" on public.investments;
create policy "investments_select_anon"
  on public.investments for select
  to anon, authenticated
  using (true);

drop policy if exists "investments_insert_anon" on public.investments;
create policy "investments_insert_anon"
  on public.investments for insert
  to anon, authenticated
  with check (true);

drop policy if exists "investments_update_anon" on public.investments;
create policy "investments_update_anon"
  on public.investments for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "investments_delete_anon" on public.investments;
create policy "investments_delete_anon"
  on public.investments for delete
  to anon, authenticated
  using (true);
