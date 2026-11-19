import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VisibilityProvider } from '@/contexts/VisibilityContext';

/**
 * Monta um componente com os providers que o app dá a ele. O QueryClient é
 * novo a cada teste (cache zerado) e sem retry: um erro esperado não pode
 * ficar tentando de novo até o teste estourar o tempo.
 *
 * Os providers vão pela opção `wrapper`, e não em volta do `ui`: assim o
 * `rerender` devolvido continua montando o componente dentro deles.
 */
export function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Providers({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <VisibilityProvider>{children}</VisibilityProvider>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Providers }) };
}
