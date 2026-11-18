# InvestCard

Carteira de investimentos em [Next.js](https://nextjs.org) com persistência no
[Supabase](https://supabase.com).

## Pré-requisitos

- Node.js 20+
- Docker em execução (necessário para o Supabase local)

A CLI do Supabase vem como devDependency do projeto — não precisa instalar nada
globalmente.

## Rodando com Supabase local

```bash
npm install
```

```bash
npm run setup
```

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

O `npm run setup` sobe os containers do Supabase (aplicando as migrations de
`supabase/migrations` e o seed de `supabase/seed.sql`) e gera o `.env.local`
com a API URL e a publishable key do ambiente local. Se você já tiver um
`.env.local`, ele é preservado.

O Supabase Studio local fica em [http://127.0.0.1:54353](http://127.0.0.1:54353).

> As portas deste projeto (API 54351, banco 54352, Studio 54353) foram alteradas
> em `supabase/config.toml` para não colidirem com outros projetos Supabase na
> mesma máquina.

### Comandos úteis

| comando                      | o que faz                                        |
| ---------------------------- | ------------------------------------------------ |
| `npm run setup`              | sobe o Supabase e gera o `.env.local`            |
| `npm run db:start`           | sobe os containers do Supabase                   |
| `npm run db:stop`            | derruba os containers                            |
| `npm run db:reset`           | recria o banco: migrations + seed                |
| `npm run db:status`          | mostra URLs e chaves do ambiente local           |
| `npm run db:env -- --force`  | regrava o `.env.local` com os valores locais     |

## Fazendo deploy para a nuvem

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard) e
   anote a senha do banco.
2. Autentique a CLI e vincule o projeto (o `project-ref` está na URL do
   dashboard):

```bash
npx supabase login
```

```bash
npx supabase link --project-ref SEU_PROJECT_REF
```

3. Envie as migrations para a nuvem:

```bash
npx supabase db push
```

4. (Opcional) Carregue os dados de exemplo no projeto remoto:

```bash
psql "postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres" -f supabase/seed.sql
```

5. Troque as variáveis de ambiente para o projeto remoto — editando o
   `.env.local` para rodar local contra a nuvem, ou nas variáveis de ambiente
   da hospedagem (ex.: Vercel). O `npm run setup` não sobrescreve um
   `.env.local` existente, então ele continua apontando para a nuvem:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Os valores estão em **Project Settings > API Keys** no dashboard. Use apenas a
chave publishable (anon) no front-end; a secret key nunca vai para o cliente.

## Estrutura dos dados

Tabela `public.investments` (`supabase/migrations/`):

| coluna           | tipo            | observação                      |
| ---------------- | --------------- | ------------------------------- |
| `id`             | `uuid`          | PK, `gen_random_uuid()`         |
| `name`           | `text`          | nome do ativo                   |
| `issuer`         | `text`          | emissor                         |
| `type`           | `text`          | tipo do investimento            |
| `category`       | `text`          | categoria                       |
| `performance`    | `numeric(8,2)`  | variação em %                   |
| `current_value`  | `numeric(14,2)` | valor atual                     |
| `invested_value` | `numeric(14,2)` | valor investido                 |
| `created_at`     | `timestamptz`   | usado para ordenar a listagem   |

RLS está habilitado com políticas liberadas para `anon`/`authenticated`, já que
a aplicação ainda não tem autenticação. Ao adicionar login, troque as políticas
por regras baseadas em `auth.uid()`.

### Camadas no front-end

- `lib/supabase.ts` — cliente Supabase do browser.
- `lib/investments.ts` — acesso aos dados e conversão `snake_case` ↔ `camelCase`.
- `contexts/InvestmentsContext.tsx` — estado da carteira (`isLoading`, `error`,
  `addInvestment`, `removeInvestment`).
- `data/investments.ts` — apenas as opções fixas de tipo e categoria.
- `scripts/supabase-env.mjs` — gera o `.env.local` a partir de `supabase status`.
