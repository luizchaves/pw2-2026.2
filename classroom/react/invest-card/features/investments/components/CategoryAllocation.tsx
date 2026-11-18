import Money from '@/components/Money';
import type { CategoryAllocation as Allocation } from '@/features/investments/portfolio';

type CategoryAllocationProps = {
  allocation: Allocation[];
};

/** Quanto cada categoria pesa na carteira, da maior fatia para a menor. */
export default function CategoryAllocation({
  allocation,
}: CategoryAllocationProps) {
  return (
    <ul className="grid gap-4">
      {allocation.map(({ category, value, share, count }) => (
        <li key={category}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 truncate text-slate-700">
              {category} <span className="text-xs text-slate-400">({count})</span>
            </span>
            <span className="shrink-0 text-slate-500">
              {share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% ·{' '}
              <Money value={value} />
            </span>
          </div>

          {/* Barra em CSS puro: uma biblioteca de gráfico seria peso a mais
              para mostrar uma proporção. */}
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
  );
}
