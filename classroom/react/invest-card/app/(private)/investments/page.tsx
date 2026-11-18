'use client';

import InvestmentCard from '@/features/investments/components/InvestmentCard';
import InvestmentForm from '@/features/investments/components/InvestmentForm';
import RefreshQuotesButton from '@/features/investments/components/RefreshQuotesButton';
import { useInvestments } from '@/features/investments/hooks/useInvestments';

export default function Home() {
  const {
    data: investments = [],
    isPending,
    isFetching,
    error,
  } = useInvestments();

  return (
    <main className="max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Meus Investimentos
          </h1>
          <p className="text-slate-500">
            Acompanhe o desempenho da sua carteira
          </p>
        </div>
        <div className="flex items-start gap-3">
          <RefreshQuotesButton />
          <InvestmentForm />
        </div>
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
      ) : (
        <>
          {/* isFetching (e não isPending) é o refetch em background: os cards
              continuam na tela com os dados antigos enquanto chega o novo. */}
          <section
            className={
              isFetching
                ? 'investments-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 transition-opacity'
                : 'investments-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity'
            }
          >
            {investments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </section>

          {investments.length === 0 && (
            <p className="text-slate-500">
              Nenhum investimento na carteira. Adicione um no formulário acima.
            </p>
          )}
        </>
      )}
    </main>
  );
}
