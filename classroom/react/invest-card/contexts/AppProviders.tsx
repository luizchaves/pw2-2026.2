'use client';

import type { PropsWithChildren } from 'react';
import QueryProvider from '@/contexts/QueryProvider';
import { VisibilityProvider } from '@/contexts/VisibilityContext';

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      {/* Estado de UI puro (mostrar/esconder valores) segue em Context: não é
          dado de servidor, então não tem o que cachear. */}
      <VisibilityProvider>{children}</VisibilityProvider>
    </QueryProvider>
  );
}
