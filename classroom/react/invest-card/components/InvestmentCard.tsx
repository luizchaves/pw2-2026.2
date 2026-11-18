'use client';

import { formatCurrency, formatPercentage, formatQuantity } from '@/lib/format';
import { useRemoveInvestment } from '@/hooks/useInvestments';
import { useVisibility } from '@/contexts/VisibilityContext';
import { cn } from '@/lib/utils';
import type { Investment } from '@/types/investments';
import {
  TrendingDown,
  TrendingUp,
  Trash2,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type InvestmentCardProps = {
  investment: Investment;
};

function formatQuoteTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InvestmentCard({
  investment: {
    id,
    name,
    issuer,
    type,
    performance,
    currentValue,
    investedValue,
    ticker,
    quantity,
    lastQuote,
    quoteSource,
    quoteUpdatedAt,
  },
}: InvestmentCardProps) {
  const { isOpenEye } = useVisibility();
  const { mutate: removeInvestment, error: removeError } =
    useRemoveInvestment();

  const handleRemoveClick = () => {
    removeInvestment(id);
  };

  // Procedência da cotação: fora do rodapé para não poluir, mas disponível no
  // hover — é o que deixa o fallback entre providers visível sem DevTools.
  const quoteLabel = ticker
    ? quoteSource && quoteUpdatedAt
      ? `${ticker} · ${quoteSource} · ${formatQuoteTime(quoteUpdatedAt)}`
      : `${ticker} · valor inicial`
    : undefined;

  return (
    <article className="h-full bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
      {/* items-start: o badge acompanha a linha do nome, não o centro do
          bloco nome+emissor (que tem duas linhas, e três quando o nome quebra). */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-800">{name}</h2>
          <span className="text-xs text-slate-400">{issuer}</span>
        </div>

        <span
          className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            performance > 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700',
          )}
        >
          {performance > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {formatPercentage(performance)}
        </span>
      </div>

      <div>
        <p className="flex items-center gap-1 text-2xl font-bold text-slate-800">
          <Wallet className="w-4 h-4 text-slate-400" />
          {isOpenEye ? formatCurrency(currentValue) : 'R$ ****'}
        </p>
        {lastQuote !== null && (
          <p className="text-xs text-slate-400" title={quoteLabel}>
            {isOpenEye && quantity !== null
              ? `${formatQuantity(quantity)} × ${formatCurrency(lastQuote)}`
              : `${formatCurrency(lastQuote)} / un.`}
          </p>
        )}
        <p className="text-sm text-slate-400">
          Investido: {isOpenEye ? formatCurrency(investedValue) : 'R$ ****'}
        </p>
        {/* A remoção é otimista: o card volta para a lista se o banco recusar,
            e aí esta linha explica por quê. */}
        {removeError && (
          <p role="alert" className="mt-1 text-xs text-rose-600">
            {removeError.message}
          </p>
        )}
      </div>

      {/* mt-auto cola o rodapé na base: os cards sem cotação têm uma linha a
          menos, e sem isso o rodapé deles subia em relação aos vizinhos.
          A lixeira mora aqui, na faixa de metadados, longe do valor — ação
          destrutiva não deve ficar colada no número que todo mundo lê. */}
      <div className="mt-auto flex items-center justify-between gap-2 text-sm text-slate-500 border-t border-slate-100 pt-3">
        <span className="min-w-0 truncate" title={type}>
          {type}
        </span>

        <AlertDialog>
          <AlertDialogTrigger
            className="shrink-0 -mr-1 p-1 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            aria-label={`Remover ${name}`}
          >
            <Trash2 className="w-4 h-4" />
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <TriangleAlert className="text-rose-500" />
              </AlertDialogMedia>
              <AlertDialogTitle>Remover investimento?</AlertDialogTitle>
              <AlertDialogDescription>
                {name} será removido da sua carteira. Esta ação não pode ser
                desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleRemoveClick}
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      </div>
    </article>
  );
}
