'use client';

import type { PropsWithChildren } from 'react';
import QueryProvider from '@/contexts/QueryProvider';
import AuthProvider from '@/contexts/AuthProvider';
import { VisibilityProvider } from '@/contexts/VisibilityContext';

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      {/* AuthProvider usa o queryClient, então fica dentro do QueryProvider. */}
      <AuthProvider>
        {/* Estado de UI puro (mostrar/esconder valores) segue em Context: não é
            dado de servidor, então não tem o que cachear. */}
        <VisibilityProvider>{children}</VisibilityProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
