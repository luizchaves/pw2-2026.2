'use client';

import { investments as initialInvestments } from '@/data/investments';
import InvestmentCard from '@/components/InvestmentCard';
import InvestmentForm from '@/components/InvestmentForm';
import type { Investment } from '@/types/investments';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isOpenEye, setIsOpenEye] = useState(true);
  const [investments, setInvestments] =
    useState<Investment[]>(initialInvestments);

  const toggleEye = () => {
    setIsOpenEye(!isOpenEye);
  };

  const handleEyeClick = () => {
    toggleEye();
  };

  const handleAddInvestment = (investment: Investment) => {
    setInvestments([...investments, investment]);
  };

  const handleRemoveInvestment = (id: string) => {
    setInvestments(investments.filter((investment) => investment.id !== id));
  };

  return (
    <main className="max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Meus Investimentos
          </h1>
          <p className="text-slate-500">
            Acompanhe o desempenho da sua carteira
          </p>
        </div>
        <div className="flex items-center gap-4">
          <InvestmentForm onAdd={handleAddInvestment} />
          <button
            type="button"
            onClick={handleEyeClick}
            aria-label={isOpenEye ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {isOpenEye ? (
              <Eye className="w-6 h-6 text-slate-400" />
            ) : (
              <EyeOff className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>
      </header>

      <section className="investments-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((investment) => (
          <InvestmentCard
            key={investment.id}
            investment={investment}
            isOpenEye={isOpenEye}
            onRemove={handleRemoveInvestment}
          />
        ))}
      </section>

      {investments.length === 0 && (
        <p className="text-slate-500">
          Nenhum investimento na carteira. Adicione um no formulário acima.
        </p>
      )}
    </main>
  );
}
