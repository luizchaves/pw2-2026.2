-- A migration inicial concedeu acesso só a anon/authenticated. O código de
-- servidor usa a secret key, que entra como `service_role` — sem GRANT ela
-- bate em "permission denied" mesmo ignorando RLS (GRANT e RLS são camadas
-- diferentes: uma controla acesso à tabela, a outra às linhas).
grant select, insert, update, delete on public.investments to service_role;
