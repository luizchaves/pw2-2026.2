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

## Cotações de mercado

Os ativos negociados em bolsa têm `ticker` e `quantity`. Para eles, o valor
atual deixa de ser digitado e passa a ser derivado:

```
current_value = quantity * last_quote
performance   = variação do dia devolvida pelo provider
```

Renda fixa e fundos ficam com `ticker` nulo e seguem com os valores informados
à mão — Tesouro, CDB e fundos não têm ticker de bolsa e precisariam de outras
fontes (Tesouro Direto, CDI, CVM).

O `last_quote` já vem preenchido no seed (derivado de
`current_value / quantity`), então o **preço unitário aparece no card desde o
primeiro load**, antes de qualquer refresh. Como `quote_source` fica nulo nesse
estado, o card mostra `valor inicial` em vez do nome de um provider.

### Cripto: o par sintético BTC-BRL

O Yahoo **não tem `BTC-BRL`** (responde 404) — só `BTC-USD`. Em vez de exibir o
Bitcoin em dólar, o provider compõe o par: busca `BTC-USD` e o câmbio
`USDBRL=X` e multiplica, inclusive os fechamentos anteriores, para que a
variação saia correta em reais (ela passa a incluir o movimento do dólar, o que
é proposital). Na brapi o mesmo ticker vai para o endpoint de cripto
(`/api/v2/crypto?coin=BTC&currency=BRL`), que exige token.

### Cadeia de providers

`POST /api/quotes/refresh` busca as cotações com **Yahoo Finance como primário
e brapi.dev como fallback**. Os dois implementam a mesma interface
(`lib/quotes/types.ts`), então trocar ou acrescentar fonte não encosta no resto
do app:

| arquivo                 | papel                                            |
| ----------------------- | ------------------------------------------------ |
| `lib/quotes/types.ts`   | `Quote`, `QuoteProvider`, `QuoteUnavailableError` |
| `lib/quotes/yahoo.ts`   | endpoint não documentado do Yahoo (`PETR4.SA`)    |
| `lib/quotes/brapi.ts`   | brapi.dev (`PETR4`, token opcional)               |
| `lib/quotes/index.ts`   | cadeia de fallback e paralelismo                  |

O fallback é **por ticker**, não tudo-ou-nada: se o Yahoo responde 4 de 5, a
brapi é chamada só para o que faltou. Cada tentativa fica registrada na resposta,
então dá para ver qual provider atendeu cada ativo:

```json
{
  "refreshed": [
    {
      "ticker": "PETR4",
      "price": 43.56,
      "source": "brapi",
      "attempts": [
        { "provider": "yahoo", "ok": false, "reason": "HTTP 404" },
        { "provider": "brapi", "ok": true }
      ]
    }
  ],
  "skipped": [],
  "failed": []
}
```

### Por que isso roda no servidor

Esta é a primeira parte do app que **não pode** rodar no browser:

1. o `BRAPI_TOKEN` não pode ir para o bundle;
2. o Yahoo não manda header de CORS, então `fetch` do cliente falharia;
3. o rate limit precisa ser compartilhado entre os usuários, não por aba aberta.

O Route Handler também usa a **secret key** do Supabase (`lib/supabase-server.ts`),
que ignora RLS — por isso ela nunca leva o prefixo `NEXT_PUBLIC_`.

### Cache e rate limit

Cotação com menos de `QUOTE_STALE_MINUTES` (padrão 15) não é buscada de novo.
Use `POST /api/quotes/refresh?force=1` para ignorar o cache.

> **O fallback só é real com `BRAPI_TOKEN`.** Sem token a brapi aceita apenas
> um ticker por requisição e devolve 401/429 rapidamente — testado com o Yahoo
> fora, só 1 de 5 ativos foi cotado. Pegue um token gratuito em
> [brapi.dev](https://brapi.dev) antes de depender do fallback.

### Testando o fallback

Aponte o Yahoo para uma URL quebrada no `.env.local` e force a atualização:

```bash
echo 'QUOTE_YAHOO_BASE_URL=https://query1.finance.yahoo.com/v8/finance/quebrado' >> .env.local
```

```bash
curl -X POST 'http://localhost:3000/api/quotes/refresh?force=1'
```

Também dá para inverter a ordem com `QUOTE_PROVIDER_ORDER=brapi,yahoo`.

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
| `ticker`         | `text`          | nulo para renda fixa e fundos   |
| `quantity`       | `numeric(18,8)` | obrigatória quando há ticker    |
| `last_quote`     | `numeric(14,4)` | preço unitário; vem no seed     |
| `quote_currency` | `text`          | moeda da cotação                |
| `quote_source`   | `text`          | `yahoo` ou `brapi`              |
| `quote_updated_at` | `timestamptz` | base do cache de frescor        |

RLS está habilitado com políticas liberadas para `anon`/`authenticated`, já que
a aplicação ainda não tem autenticação. Ao adicionar login, troque as políticas
por regras baseadas em `auth.uid()`.

### Camadas no front-end

- `lib/supabase.ts` — cliente Supabase do browser.
- `lib/investments.ts` — acesso aos dados e conversão `snake_case` ↔ `camelCase`.
- `contexts/InvestmentsContext.tsx` — estado da carteira (`isLoading`, `error`,
  `addInvestment`, `removeInvestment`).
- `data/investments.ts` — apenas as opções fixas de tipo e categoria.
- `lib/supabase-server.ts` — client de servidor com a secret key (nunca no cliente).
- `lib/quotes/` — providers de cotação e a cadeia de fallback.
- `app/api/quotes/refresh/route.ts` — Route Handler que atualiza as cotações.
- `scripts/supabase-env.mjs` — gera o `.env.local` a partir de `supabase status`.
