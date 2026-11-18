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

Abra [http://localhost:3000](http://localhost:3000) e entre com uma das contas
de exemplo criadas pelo seed (ou crie a sua em **Criar conta**):

| e-mail                 | senha      | carteira            |
| ---------------------- | ---------- | ------------------- |
| `demo@investcard.dev`  | `demo1234` | 9 ativos            |
| `maria@investcard.dev` | `demo1234` | 3 ativos            |

As duas contas existem para dar para ver o isolamento: entre com uma, depois
com a outra, e repare que os cards são outros.

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

## Autenticação e carteira por pessoa

O login é do **Supabase Auth**, com e-mail e senha. A escolha não é só de
biblioteca: as policies de RLS são escritas com `auth.uid()`, que vem do JWT
que o próprio Supabase emite. Com uma sessão de outra ferramenta (NextAuth, por
exemplo) o Postgres não saberia quem está perguntando, e o filtro por pessoa
teria que descer para o código da aplicação.

### O filtro mora no banco

`investments` ganhou a coluna `user_id`, e as policies comparam cada linha com
quem está logado:

```sql
create policy "investments_select_own"
  on public.investments for select
  to authenticated
  using (auth.uid() = user_id);
```

Repare que `lib/investments.ts` **não** tem `.eq('user_id', ...)`: um
`select('*')` já volta só com as linhas de quem pediu. O acesso anônimo foi
revogado, então sem login a tabela nem responde:

```json
{ "code": "42501", "message": "permission denied for table investments" }
```

Isso é diferente de esconder os dados na interface. Um `fetch` montado à mão no
console do browser, com a chave publishable na mão, esbarra na mesma regra.

### Sessão em cookie, não em localStorage

O `@supabase/ssr` guarda a sessão em cookie. É o que permite o servidor saber
quem está logado — o cookie viaja em toda requisição, o `localStorage` nunca sai
do browser. São três clientes, um por ambiente:

| arquivo                 | onde roda            | para quê                         |
| ----------------------- | -------------------- | -------------------------------- |
| `lib/supabase.ts`       | browser              | queries e mutations da interface |
| `lib/supabase-server.ts`| Route Handlers       | ler a sessão dos cookies         |
| `lib/supabase-proxy.ts` | proxy (middleware)   | renovar o token e barrar rotas   |

### proxy.ts: renovar a sessão e barrar rota

No Next.js 16 o `middleware.ts` passou a se chamar **`proxy.ts`** — mesmo
arquivo na raiz, mesma função, nome novo. Ele roda antes de cada página e faz
duas coisas:

1. **renova o access token** (vale 1h) e regrava o cookie, senão a pessoa seria
   deslogada no meio do uso;
2. **redireciona**: sem sessão, manda para `/login?next=...` (e o login devolve
   para a página pretendida); com sessão, tira de `/login` e `/signup`. Quem
   entra sem ter pedido uma página específica cai no `/dashboard`.

A guarda usa `supabase.auth.getUser()`, que valida o token no servidor do
Supabase, e não `getSession()`, que apenas lê o cookie — e cookie o browser
pode forjar.

As rotas de API ficam de fora do redirect: elas respondem `401` em JSON, que é
o que um `fetch` consegue tratar. O `POST /api/quotes/refresh` também deixou de
usar a secret key e passou a rodar como o usuário logado — assim cada pessoa
atualiza as cotações da própria carteira, e não as de todo mundo.

### Cache e troca de usuário

Um cache de carteira é dado de uma pessoa específica, então o logout **limpa**
o cache (`queryClient.clear()` em `useSignOut`). Sem isso, o próximo login
mostraria por um instante os cards de quem acabou de sair. O
`contexts/AuthProvider.tsx` escuta `onAuthStateChange` e invalida as queries
quando a sessão muda — inclusive quando a mudança aconteceu em outra aba.

## Cotações de mercado

Os ativos negociados em bolsa têm `ticker` e `quantity`. Para eles, o valor
atual deixa de ser digitado e passa a ser derivado:

```
current_value = quantity * last_quote
performance   = variação do dia devolvida pelo provider
```

### performance não é digitada

O formulário pergunta **valor investido** e, depois, o **valor atual** — este
obrigatório só quando não há ticker, porque com ticker a primeira atualização
de cotações o calcula (`quantity * last_quote`). Vazio, o ativo começa valendo
o que custou. A performance sai desses dois valores, em `lib/investments.ts`:

```
performance = (current_value - invested_value) / invested_value * 100
```

Pedir o número seria pedir algo que a aplicação já sabe — e que, para quem tem
ticker, seria descartado na primeira atualização de cotações, quando o provider
grava a variação do dia por cima. Daí a diferença de leitura do badge: para
bolsa ele mostra o **dia**, para renda fixa o **acumulado** desde o aporte.

Renda fixa e fundos ficam com `ticker` nulo e seguem com os valores informados
à mão — Tesouro, CDB e fundos não têm ticker de bolsa e precisariam de outras
fontes (Tesouro Direto, CDI, CVM).

### Indexador: o outro lado do ticker

Renda fixa não tem variação de mercado, tem **regra de remuneração**: um
Tesouro Selic rende `100% Selic`, um CDB `110% CDI`, um Tesouro IPCA+
`IPCA + 5,5%`. Isso vai na coluna `indexer`, e o card mostra como
*Rende 100% Selic* no lugar da linha de cotação.

O campo é **texto livre** (com sugestões via `datalist`, em
`data/investments.ts`), e não um select: o índice e a taxa mudam de papel para
papel, e uma lista fechada envelheceria a cada produto novo.

`indexer` e `ticker` são excludentes — o que tem preço de mercado não tem regra
de remuneração. A regra está no banco, como check constraint, e o formulário
avisa antes de tentar salvar:

```sql
check (indexer is null or ticker is null)
```

O `performance` continua numérico e segue valendo para todo mundo: é a variação
que alimenta o badge do card e as listas do dashboard.

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

O Route Handler usa o client de servidor (`lib/supabase-server.ts`), que lê a
sessão dos cookies e continua sujeito ao RLS: ele só enxerga — e só atualiza —
os ativos de quem fez a chamada.

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

## Estado de servidor com TanStack Query

Os dados da carteira vivem no Supabase, não no React: eles podem mudar fora da
aba (o `POST /api/quotes/refresh` grava direto no banco) e precisam de
`loading`, `error`, cache e revalidação. Esse é trabalho de
[TanStack Query](https://tanstack.com/query), e não de `useState` + `useEffect`
num Context.

Todo o acesso passa por `hooks/useInvestments.ts`:

| hook                   | o que é            | o que faz                                   |
| ---------------------- | ------------------ | ------------------------------------------- |
| `useInvestments()`     | `useQuery`         | lê a carteira (`data`, `isPending`, `error`) |
| `useAddInvestment()`   | `useMutation`      | insere e invalida a lista                    |
| `useRemoveInvestment()`| `useMutation`      | remove de forma otimista, com rollback       |
| `useRefreshQuotes()`   | `useMutation`      | chama o Route Handler e invalida a lista     |

A chave `['investments']` (em `investmentKeys.all`) é o ponto de encontro: cada
mutation termina invalidando-a, e **qualquer** componente que use
`useInvestments()` recebe os dados novos — sem prop drilling e sem um estado
compartilhado escrito à mão.

É por isso que o **dashboard não faz request nenhum**: ele chama o mesmo
`useInvestments()` da home e lê a carteira que já está em cache sob aquela
chave. Duas telas, uma query — e uma cotação atualizada numa delas aparece na
outra sozinha.

```ts
onSuccess: () => {
  void queryClient.invalidateQueries({ queryKey: investmentKeys.all });
}
```

O `QueryClient` fica em `contexts/QueryProvider.tsx`, criado dentro de
`useState` para o cache ser por árvore React (no servidor, dois usuários
renderizando ao mesmo tempo não compartilham dados). Os defaults valem para
todas as queries:

- `staleTime: 60_000` — dentro de 1 min os dados são frescos, então remontar um
  componente ou voltar para a aba não dispara request novo;
- `retry: 1` — uma segunda tentativa antes de mostrar erro.

Dois estados que o Context antigo não tinha como distinguir:

- `isPending` — primeiro carregamento, ainda não há nada para mostrar;
- `isFetching` — revalidação em background, com os dados antigos na tela (a
  grade de cards fica translúcida em vez de desaparecer).

### Remoção otimista

`useRemoveInvestment` usa o trio `onMutate` / `onError` / `onSettled`: tira o
card do cache antes da resposta do banco (a UI reage na hora), guarda um
snapshot e o restaura se o delete falhar — nesse caso o card volta para a lista
com a mensagem de erro.

### Devtools

`ReactQueryDevtools` entra junto com o provider e aparece como um botão
flutuante em desenvolvimento. Ele mostra as queries em cache, o estado de cada
uma (`fresh`, `stale`, `fetching`) e os dados guardados — é a forma mais rápida
de ver a invalidação acontecendo ao adicionar um investimento ou atualizar as
cotações.

## Estrutura dos dados

Tabela `public.investments` (`supabase/migrations/`):

| coluna           | tipo            | observação                      |
| ---------------- | --------------- | ------------------------------- |
| `id`             | `uuid`          | PK, `gen_random_uuid()`         |
| `user_id`        | `uuid`          | FK para `auth.users`; dono da linha |
| `name`           | `text`          | nome do ativo                   |
| `issuer`         | `text`          | emissor                         |
| `type`           | `text`          | tipo do investimento            |
| `category`       | `text`          | categoria                       |
| `performance`    | `numeric(8,2)`  | variação em %                   |
| `current_value`  | `numeric(14,2)` | valor atual                     |
| `invested_value` | `numeric(14,2)` | valor investido                 |
| `created_at`     | `timestamptz`   | usado para ordenar a listagem   |
| `ticker`         | `text`          | nulo para renda fixa e fundos   |
| `indexer`        | `text`          | remuneração da renda fixa; exclui `ticker` |
| `quantity`       | `numeric(18,8)` | obrigatória quando há ticker    |
| `last_quote`     | `numeric(14,4)` | preço unitário; vem no seed     |
| `quote_currency` | `text`          | moeda da cotação                |
| `quote_source`   | `text`          | `yahoo` ou `brapi`              |
| `quote_updated_at` | `timestamptz` | base do cache de frescor        |

RLS está habilitado com políticas por dono (`auth.uid() = user_id`) para o role
`authenticated`; o `anon` não tem mais acesso à tabela. O seed cria os usuários
de exemplo direto em `auth.users` — isso vale para o ambiente local de sala de
aula; em produção as contas nascem pelo cadastro da aplicação.

### Camadas no front-end

- `lib/supabase.ts` — cliente Supabase do browser.
- `lib/investments.ts` — acesso aos dados e conversão `snake_case` ↔ `camelCase`.
- `app/page.tsx` — a carteira, card a card.
- `app/dashboard/page.tsx` — a mesma carteira consolidada: totais, alocação e
  variação do dia.
- `lib/portfolio.ts` — as somas e proporções do dashboard. Cálculo puro (entra
  uma lista, sai um objeto), fora do componente e fácil de testar.
- `hooks/useInvestments.ts` — queries e mutations da carteira (TanStack Query).
- `hooks/useAuth.ts` — sessão, login, cadastro e logout.
- `contexts/QueryProvider.tsx` — `QueryClient` e devtools.
- `contexts/AuthProvider.tsx` — liga os eventos de sessão ao cache.
- `contexts/VisibilityContext.tsx` — estado de UI (mostrar/esconder valores).
- `data/investments.ts` — apenas as opções fixas de tipo e categoria.
- `lib/supabase-server.ts` — client de servidor que lê a sessão dos cookies.
- `lib/supabase-proxy.ts` + `proxy.ts` — renovação da sessão e proteção de rotas.
- `lib/quotes-refresh.ts` — chamada do browser para o Route Handler de cotações.
- `lib/quotes/` — providers de cotação e a cadeia de fallback.
- `app/api/quotes/refresh/route.ts` — Route Handler que atualiza as cotações.
- `scripts/supabase-env.mjs` — gera o `.env.local` a partir de `supabase status`.
