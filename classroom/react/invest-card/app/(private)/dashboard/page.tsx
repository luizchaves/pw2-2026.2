'use client';

import Link from 'next/link';
import { Layers, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import Money from '@/components/Money';
import CategoryAllocation from '@/features/investments/components/CategoryAllocation';
import Movers from '@/features/investments/components/Movers';
import StatCard from '@/features/investments/components/StatCard';
import { useInvestments } from '@/features/investments/hooks/useInvestments';
import {
  allocationByCategory,
  rankByPerformance,
  summarize,
} from '@/features/investments/portfolio';
import { formatPercentage } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

export default function Dashboard() {
  const { data: investments = [], isPending, error } = useInvestments();

  // Os mesmos dados da carteira, por outro ângulo: ela já está em cache sob a
  // chave ['investments'], então esta página não refaz request nenhum.
  const { currentValue, investedValue, result, resultPercentage, count } =
    summarize(investments);
  const allocation = allocationByCategory(investments);
  const isPositive = result >= 0;

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
            href={ROUTES.investments}
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
              value={<Money value={currentValue} />}
              hint={`${count} ${count === 1 ? 'ativo' : 'ativos'} na carteira`}
              icon={Wallet}
            />
            <StatCard
              label="Investido"
              value={<Money value={investedValue} />}
              hint="Total aportado"
              icon={PiggyBank}
            />
            <StatCard
              label="Resultado"
              value={<Money value={result} />}
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

              <CategoryAllocation allocation={allocation} />
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
