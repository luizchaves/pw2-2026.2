'use client';

import { investments } from '@/data/investments';
import InvestmentCard from '@/components/InvestmentCard';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isOpenEye, setIsOpenEye] = useState(true);

  const toggleEye = () => {
    setIsOpenEye(!isOpenEye);
  };

  const handleEyeClick = () => {
    toggleEye();
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
        <div className="float-end" onClick={handleEyeClick}>
          {isOpenEye ? (
            <Eye className="w-6 h-6 text-slate-400 mt-2" />
          ) : (
            <EyeOff className="w-6 h-6 text-slate-400 mt-2" />
          )}
        </div>
      </header>

      <section className="investments-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((investment) => (
          <InvestmentCard
            key={investment.name}
            investment={investment}
            isOpenEye={isOpenEye}
          />
        ))}
      </section>
    </main>
  );
}
