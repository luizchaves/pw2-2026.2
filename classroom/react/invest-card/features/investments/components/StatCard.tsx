import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type StatCardProps = {
  label: string;
  /** Texto ou um <Money/>, quando o número obedece ao olho da navbar. */
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: 'neutral' | 'positive' | 'negative';
};

/** Um número do topo do dashboard. */
export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
}: StatCardProps) {
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
