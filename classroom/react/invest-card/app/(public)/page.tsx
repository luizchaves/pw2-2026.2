import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionUser } from '@/features/auth/session';
import { HOME_ROUTE, ROUTES } from '@/lib/routes';

const features = [
  {
    icon: RefreshCw,
    title: 'Cotações de verdade',
    description:
      'Ativos com ticker buscam o preço no Yahoo Finance, com a brapi como reserva. O valor atual e a variação do dia deixam de ser digitados.',
  },
  {
    icon: LayoutDashboard,
    title: 'A carteira de cima',
    description:
      'Patrimônio, resultado, alocação por categoria e as maiores altas e baixas do dia — a mesma carteira, lida de outro jeito.',
  },
  {
    icon: ShieldCheck,
    title: 'Cada carteira é sua',
    description:
      'O filtro por pessoa mora no banco, nas políticas de RLS do Supabase. Nem um fetch forjado no navegador enxerga a carteira de outra conta.',
  },
];

/** Quem já entrou vê o atalho para o dashboard no lugar do cadastro. */
async function LandingActions() {
  const user = await getSessionUser();

  if (user) {
    return (
      <Button
        size="lg"
        nativeButton={false}
        className="bg-emerald-600 text-white hover:bg-emerald-700"
        render={<Link href={HOME_ROUTE} />}
      >
        Ir para o dashboard
        <ArrowRight className="size-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        size="lg"
        nativeButton={false}
        className="bg-emerald-600 text-white hover:bg-emerald-700"
        render={<Link href={ROUTES.signup} />}
      >
        Criar conta
        <ArrowRight className="size-4" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        nativeButton={false}
        render={<Link href={ROUTES.login} />}
      >
        Entrar
      </Button>
    </>
  );
}

export default function Landing() {
  return (
    <main className="max-w-6xl mx-auto">
      <section className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            <TrendingUp className="size-3.5" />
            Carteira de investimentos
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-800 md:text-5xl">
            Seus investimentos em um lugar só
          </h1>

          <p className="mt-4 text-lg text-slate-500">
            Cadastre o que você tem, deixe as cotações se atualizarem sozinhas e
            acompanhe quanto a carteira rendeu — sem planilha.
          </p>

          {/* O resto da página é estático; só os botões dependem da sessão,
              então eles chegam em streaming, com a altura já reservada. */}
          <div className="mt-8 flex min-h-11 flex-wrap items-center gap-3">
            <Suspense>
              <LandingActions />
            </Suspense>
          </div>
        </div>

        {/* Amostra do produto: os mesmos cards da carteira, com dados fixos. */}
        <div
          aria-hidden="true"
          className="grid gap-4 sm:grid-cols-2 lg:justify-self-end"
        >
          <article className="h-full rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-slate-800">PETR4</h2>
                <span className="text-xs text-slate-400">B3</span>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                <TrendingUp className="size-3" />
                +1,84%
              </span>
            </div>
            <p className="mt-4 flex items-center gap-1 text-2xl font-bold text-slate-800">
              <Wallet className="size-4 text-slate-400" />
              R$ 3.245,10
            </p>
            <p className="text-xs text-slate-400">75 × R$ 43,27</p>
            <p className="text-sm text-slate-400">Investido: R$ 3.400,00</p>
          </article>

          <article className="h-full rounded-xl bg-white p-5 shadow-sm sm:mt-8">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-slate-800">Tesouro Selic 2029</h2>
                <span className="text-xs text-slate-400">Tesouro Direto</span>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-1 text-2xl font-bold text-slate-800">
              <Wallet className="size-4 text-slate-400" />
              R$ 12.480,32
            </p>
            <p className="text-xs text-slate-400">Rende 100% Selic</p>
            <p className="text-sm text-slate-400">Investido: R$ 11.500,00</p>
          </article>
        </div>
      </section>

      <section className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-xl bg-white p-5 shadow-sm">
            <Icon className="size-5 text-emerald-600" />
            <h2 className="mt-3 font-semibold text-slate-800">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-8 text-sm text-slate-400">
        InvestCard — projeto de exemplo em Next.js, TanStack Query e Supabase.
      </footer>
    </main>
  );
}
