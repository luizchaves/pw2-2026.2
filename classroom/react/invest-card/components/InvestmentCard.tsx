'use client';

import { formatCurrency, formatPercentage } from '@/lib/format';
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
  isOpenEye: boolean;
  onRemove: (id: string) => void;
};

export default function InvestmentCard({
  investment: {
    id,
    name,
    issuer,
    type,
    performance,
    currentValue,
    investedValue,
  },
  isOpenEye,
  onRemove,
}: InvestmentCardProps) {
  const handleRemoveClick = () => {
    onRemove(id);
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
        <p className="text-sm text-slate-400">
          Investido: {isOpenEye ? formatCurrency(investedValue) : 'R$ ****'}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
        <span></span>
        <span>{type}</span>
      </div>
    </article>
  );
}
