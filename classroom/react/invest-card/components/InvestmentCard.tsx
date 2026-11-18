'use client';

import { formatCurrency, formatPercentage, formatQuantity } from '@/lib/format';
import { useInvestments } from '@/contexts/InvestmentsContext';
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
  const { removeInvestment } = useInvestments();

  const handleRemoveClick = () => {
    void removeInvestment(id);
  };

  return (
    <article className="relative bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <AlertDialog>
        <AlertDialogTrigger
          className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors"
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
            <AlertDialogAction variant="destructive" onClick={handleRemoveClick}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between pr-6">
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
          <p className="text-xs text-slate-400">
            {isOpenEye && quantity !== null
              ? `${formatQuantity(quantity)} × ${formatCurrency(lastQuote)}`
              : `${formatCurrency(lastQuote)} / un.`}
          </p>
        )}
        <p className="text-sm text-slate-400">
          Investido: {isOpenEye ? formatCurrency(investedValue) : 'R$ ****'}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
        {/* Mostrar o provider deixa o fallback visível na tela. */}
        <span className="text-xs text-slate-400">
          {ticker && quoteSource && quoteUpdatedAt
            ? `${ticker} · ${quoteSource} · ${formatQuoteTime(quoteUpdatedAt)}`
            : ticker
              ? `${ticker} · valor inicial`
              : 'valor informado'}
        </span>
        <span>{type}</span>
      </div>
    </article>
  );
}
