'use client';

import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useInvestments } from '@/features/investments/hooks/useInvestments';
import { useVisibility } from '@/contexts/VisibilityContext';
import {
  allocationByCategory,
  rankByPerformance,
  summarize,
} from '@/features/investments/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Investment } from '@/features/investments/types';

const HIDDEN_VALUE = 'R$ ****';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: 'neutral' | 'positive' | 'negative';
};

function StatCard({ label, value, hint, icon: Icon, tone = 'neutral' }: StatCardProps) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4 text-slate-400" />
        {label}
      </div>

      <p
        className={cn(
          'mt-2 text-2xl font-bold',
          tone === 'positive' && 'text-emerald-600',
          tone === 'negative' && 'text-rose-600',
          tone === 'neutral' && 'text-slate-800',
        )}
      >
        {value}
      </p>

      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </article>
  );
}

type MoversProps = {
  title: string;
  investments: Investment[];
  direction: 'up' | 'down';
};

function Movers({ title, investments, direction }: MoversProps) {
  const Icon = direction === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <Icon
          className={cn(
            'size-4',
            direction === 'up' ? 'text-emerald-500' : 'text-rose-500',
          )}
        />
        {title}
      </h3>

      {investments.length === 0 && (
        <p className="text-sm text-slate-400">
          {direction === 'up' ? 'Nenhuma alta hoje.' : 'Nenhuma baixa hoje.'}
        </p>
      )}

      <ul className="grid gap-2">
        {investments.map(({ id, name, issuer, performance }) => (
          <li key={id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0">
              <span className="font-medium text-slate-700">{name}</span>{' '}
              <span className="text-xs text-slate-400">{issuer}</span>
            </span>

            <span
              className={cn(
                'shrink-0 font-medium',
                performance >= 0 ? 'text-emerald-600' : 'text-rose-600',
              )}
            >
              {formatPercentage(performance)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const { data: investments = [], isPending, error } = useInvestments();
  const { isOpenEye } = useVisibility();

  // Os mesmos dados da home, por outro ângulo: a carteira já está em cache sob
  // a chave ['investments'], então esta página não refaz request nenhum.
  const { currentValue, investedValue, result, resultPercentage, count } =
    summarize(investments);
  const allocation = allocationByCategory(investments);
  const isPositive = result >= 0;

  const money = (value: number) => (isOpenEye ? formatCurrency(value) : HIDDEN_VALUE);

  return (
    <main className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Como está a sua carteira hoje</p>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error.message}
        </p>
      )}

      {isPending ? (
        <p className="text-slate-500">Carregando investimentos...</p>
      ) : count === 0 ? (
        <p className="text-slate-500">
          Nenhum investimento na carteira ainda.{' '}
          <Link
            href="/investments"
            className="font-medium text-emerald-700 hover:underline"
          >
            Adicione o primeiro
          </Link>{' '}
          para ver os números aqui.
        </p>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Patrimônio"
              value={money(currentValue)}
              hint={`${count} ${count === 1 ? 'ativo' : 'ativos'} na carteira`}
              icon={Wallet}
            />
            <StatCard
              label="Investido"
              value={money(investedValue)}
              hint="Total aportado"
              icon={PiggyBank}
            />
            <StatCard
              label="Resultado"
              value={money(result)}
              hint={`${formatPercentage(resultPercentage)} sobre o investido`}
              icon={isPositive ? TrendingUp : TrendingDown}
              tone={isPositive ? 'positive' : 'negative'}
            />
            <StatCard
              label="Categorias"
              value={String(allocation.length)}
              hint={allocation[0] ? `Maior: ${allocation[0].category}` : undefined}
              icon={Layers}
            />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-4 font-semibold text-slate-800">
                Alocação por categoria
              </h2>

              <ul className="grid gap-4">
                {allocation.map(({ category, value, share, count: assets }) => (
                  <li key={category}>
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate text-slate-700">
                        {category}{' '}
                        <span className="text-xs text-slate-400">
                          ({assets})
                        </span>
                      </span>
                      <span className="shrink-0 text-slate-500">
                        {share.toLocaleString('pt-BR', {
                          maximumFractionDigits: 1,
                        })}
                        % · {money(value)}
                      </span>
                    </div>

                    {/* Barra em CSS puro: uma biblioteca de gráfico seria peso
                        a mais para mostrar uma proporção. */}
                    <div
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      role="presentation"
                    >
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6 rounded-xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-800">Variação do dia</h2>

              <Movers
                title="Maiores altas"
                direction="up"
                investments={rankByPerformance(investments, 'up')}
              />

              <Movers
                title="Maiores baixas"
                direction="down"
                investments={rankByPerformance(investments, 'down')}
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
