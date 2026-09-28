import { formatCurrency, formatPercentage } from '../lib/format.js';
import { createIcons, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide';

export function createInvestmentCard(investment) {
  const card = document.createElement('article');
  card.className = 'relative bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4';

  const performanceClass = investment.performance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';
  const trendIcon = investment.performance >= 0 ? 'trending-up' : 'trending-down';

  card.innerHTML = `
        <button class="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors" aria-label="Remover investimento">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
        <div class="flex items-center justify-between pr-6">
          <div>
            <h2 class="font-semibold text-slate-800">${investment.name}</h2>
            <span class="text-xs text-slate-400">${investment.category}</span>
          </div>
          <span class="flex items-center gap-1 text-xs font-medium ${performanceClass} px-2 py-1 rounded-full">
            <i data-lucide="${trendIcon}" class="w-3 h-3"></i>
            ${formatPercentage(investment.performance)}
          </span>
        </div>
        <div>
          <p class="flex items-center gap-1 text-2xl font-bold text-slate-800">
            <i data-lucide="wallet" class="w-4 h-4 text-slate-400"></i>
            ${formatCurrency(investment.currentValue)}
          </p>
          <p class="text-sm text-slate-400">Investido: R$ ${formatCurrency(investment.investedValue)}</p>
        </div>
        <div class="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
          <span></span>
          <span>${investment.type}</span>
        </div>
      `;

  createIcons({
    icons: {
      Trash2,
      TrendingDown,
      TrendingUp,
      Wallet
    }
  });

  return card;
}
