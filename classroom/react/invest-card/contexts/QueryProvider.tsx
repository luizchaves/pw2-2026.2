'use client';

import { useState, type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// O client guarda o cache. Criá-lo com useState (e não em module scope) dá um
// cache por árvore React: no servidor, dois usuários renderizando ao mesmo
// tempo não compartilham dados; no browser ele é criado uma vez e sobrevive
// aos re-renders.
export default function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dentro de 1 min os dados são considerados frescos: trocar de aba
            // ou remontar um componente não dispara request novo.
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Painel flutuante (só em dev) para inspecionar as queries do cache. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
