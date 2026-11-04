export default function About() {
  return (
    <main className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Sobre</h1>
        <p className="text-slate-500">
          Este projeto é um exemplo de aplicação React para gerenciamento de
          investimentos.
        </p>
      </header>

      <section className="text-slate-700">
        <p>
          A aplicação permite que os usuários acompanhem o desempenho de seus
          investimentos, exibindo informações como nome, emissor, tipo,
          performance, valor atual e valor investido.
        </p>
        <p className="mt-4">
          O código-fonte está disponível no repositório do GitHub, e a aplicação
          utiliza tecnologias modernas como React, TypeScript e Tailwind CSS.
        </p>
      </section>
    </main>
  );
}
