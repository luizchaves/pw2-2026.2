# InvestCard — guia para agentes

Carteira de investimentos usada como exemplo de aula (PW2). O código é
material didático: cada decisão não óbvia vem comentada com o **porquê**, e os
comentários são em português, como a interface.

## Comandos

```bash
npm run setup     # sobe o Supabase local e gera o .env.local
npm run dev       # servidor de desenvolvimento
npm run lint      # eslint (precisa passar antes de commitar)
npm test          # Vitest: unidade, integração e componente
npm run test:e2e  # Playwright (exige Supabase local e um dev server)
npm run build     # checa tipos e gera o build de produção
npm run db:reset  # recria o banco: migrations + seed
```

`npx tsc --noEmit` costuma acusar tipos de rota desatualizados depois de mover
arquivos em `app/`: apague `.next/dev` e `.next/types` e rode o build.

## Stack

| camada     | escolha                                                      |
| ---------- | ------------------------------------------------------------ |
| framework  | Next.js 16 (App Router, `cacheComponents`, React 19)          |
| dados      | Supabase (Postgres + Auth + RLS), CLI local em `supabase/`    |
| estado     | TanStack Query v5 — nada de Context para dado de servidor     |
| formulário | React Hook Form + Zod (`zodResolver`)                         |
| interface  | Tailwind v4 + shadcn no estilo `base-nova` (sobre Base UI)    |
| testes     | Vitest + Testing Library; Playwright no `e2e/`                |

## Organização

```
app/              rotas. (public) = landing/login/signup, (private) = app logado
features/         código de domínio: investments/ e auth/
components/       casca e primitivos compartilhados (ui/ é gerado pelo shadcn)
contexts/         QueryProvider, VisibilityContext, AppProviders
lib/              supabase/ (client, server, proxy), routes, format, cn
supabase/         migrations e seed
e2e/              Playwright
```

Regra: **se o arquivo fala de investimento ou de login, ele vive em
`features/`**. Página compõe, componente apresenta, regra de negócio sai do
JSX. Teste fica ao lado do que testa (`portfolio.ts` + `portfolio.test.ts`).

## Invariantes do domínio

Quebrar qualquer uma destas quebra o app ou o banco:

- **`performance` não é digitada.** Sai de `(atual - investido) / investido` na
  gravação; para quem tem ticker, o provider sobrescreve com a variação do dia
  no refresh — por isso o update não a recalcula nesse caso.
- **`ticker` e `indexer` são excludentes.** Há `check constraint` no banco e a
  mesma regra no schema Zod, que avisa antes da ida ao servidor.
- **Com ticker, o valor atual é opcional**; sem ticker, é obrigatório (não há
  de onde derivá-lo).
- **O filtro por usuário mora no RLS.** As queries não levam
  `.eq('user_id', ...)`: um `select('*')` já volta só com as linhas de quem
  pediu. Inserir exige mandar `user_id`, que a policy confere.
- **Valor em reais na tela passa por `<Money/>`**, que obedece ao olho da
  navbar. Formatar à mão vaza número que a pessoa mandou esconder.
- **Caminho de rota vem de `lib/routes.ts`**, não como string solta.

## Armadilhas já pagas

- **`proxy.ts`, não `middleware.ts`** — o Next 16 renomeou. Ele renova a
  sessão e barra rota; rotas de API ficam de fora do redirect e respondem 401
  em JSON.
- **Sessão para UI renderizada no servidor** vem de `features/auth/session.ts`
  (cookies), nunca de hook no cliente: isso causa erro de hidratação e botão
  piscando. Com `cacheComponents` ligado, essa leitura precisa de
  `await connection()` antes, senão o `Date.now()` do cliente Supabase quebra o
  prerender.
- **shadcn CLI** escreve `import { cn } from "cn"` nos componentes que gera:
  troque por `@/lib/cn` (e não instale o pacote `cn`). O item do catálogo é
  `dropdown-menu`, não `menu`.
- **Base UI**: `Button` com `render={<Link/>}` precisa de `nativeButton={false}`;
  `DropdownMenuLabel` só funciona dentro de `DropdownMenuGroup`; o item de
  navegação ativo recebe `data-active` **vazio**.
- **React Compiler** reclama de `form.watch()`: use `useWatch`.
- **Prettier não está configurado** no projeto, e o padrão dele é aspas duplas.
  Se for rodar, use `--single-quote` — ou não rode.
- **Vitest sem `@vitejs/plugin-react`**: ele exige Babel 8 e só serve para Fast
  Refresh. O transformador do próprio Vite dá conta do JSX.

## Ao mexer no banco

Toda mudança de schema é uma migration nova em `supabase/migrations/`
(`AAAAMMDDHHMMSS_descricao.sql`), nunca edição de uma antiga. O seed cria dois
usuários de exemplo — `demo@investcard.dev` e `maria@investcard.dev`, senha
`demo1234` — e é deles que o e2e depende. Depois de migration ou seed novos,
`npm run db:reset`.

## Commits

Conventional Commits em inglês, assunto no imperativo, corpo explicando o
**porquê** (a aula se lê pelo histórico). O README é parte da entrega: mudou
comportamento ou estrutura, atualize a seção correspondente.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
