-- Cada investimento passa a ter dono. Antes disso a carteira era única e
-- qualquer visitante (chave anon) lia e escrevia tudo.

alter table public.investments
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- As linhas criadas antes do login não têm dono e não podem ser atribuídas a
-- ninguém. O seed recria a carteira do usuário demo, então aqui elas saem.
delete from public.investments where user_id is null;

alter table public.investments
  alter column user_id set not null;

-- Toda query filtra por dono: sem este índice o RLS varre a tabela inteira.
create index if not exists investments_user_id_idx
  on public.investments (user_id);

-- Sem login não há mais o que ver: o acesso anônimo some da tabela.
revoke select, insert, update, delete on public.investments from anon;

drop policy if exists "investments_select_anon" on public.investments;
drop policy if exists "investments_insert_anon" on public.investments;
drop policy if exists "investments_update_anon" on public.investments;
drop policy if exists "investments_delete_anon" on public.investments;

-- auth.uid() é o id do usuário dentro do JWT que o Supabase emitiu. O filtro
-- por pessoa mora aqui, no banco: nem um fetch forjado no browser escapa dele.
create policy "investments_select_own"
  on public.investments for select
  to authenticated
  using (auth.uid() = user_id);

-- `with check` vale para a linha depois da escrita: impede inserir (ou
-- atualizar) um investimento no nome de outra pessoa.
create policy "investments_insert_own"
  on public.investments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "investments_update_own"
  on public.investments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "investments_delete_own"
  on public.investments for delete
  to authenticated
  using (auth.uid() = user_id);

comment on column public.investments.user_id is
  'Dono da linha; comparado com auth.uid() nas policies de RLS.';
