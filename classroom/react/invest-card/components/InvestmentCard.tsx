import { formatCurrency, formatPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Investment } from '@/data/investments';
import { TrendingDown, TrendingUp, Trash2, Wallet } from 'lucide-react';

type InvestmentCardProps = {
  investment: Investment;
};

export default function InvestmentCard({
  investment: {
    name,
    issuer,
    type,
    performance,
    currentValue,
    investedValue,
  },
}: InvestmentCardProps) {
  return (
    <article className="relative bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <button
        className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors"
        aria-label="Remover investimento"
      >
        <Trash2 className="w-4 h-4" />
      </button>
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
              : 'bg-rose-100 text-rose-700'
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
          {formatCurrency(currentValue)}
        </p>
        <p className="text-sm text-slate-400">
          Investido: {formatCurrency(investedValue)}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
        <span></span>
        <span>{type}</span>
      </div>
    </article>
  );
}
