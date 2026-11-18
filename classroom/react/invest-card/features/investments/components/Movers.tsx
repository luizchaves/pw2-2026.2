import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatPercentage } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Investment } from '@/features/investments/types';

type MoversProps = {
  title: string;
  investments: Investment[];
  direction: 'up' | 'down';
};

/** Os ativos que mais subiram (ou caíram) no dia. */
export default function Movers({ title, investments, direction }: MoversProps) {
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
