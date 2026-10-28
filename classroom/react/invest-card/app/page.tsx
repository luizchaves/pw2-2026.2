import { investments } from '@/data/investments';
import InvestmentCard from '@/components/InvestmentCard';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Meus Investimentos
        </h1>
        <p className="text-slate-500">Acompanhe o desempenho da sua carteira</p>
      </header>

      <section className="investments-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((investment) => (
          <InvestmentCard key={investment.name} investment={investment} />
        ))}
      </section>
    </main>
  );
}
