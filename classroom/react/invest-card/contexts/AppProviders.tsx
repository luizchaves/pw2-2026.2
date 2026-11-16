'use client';

import type { PropsWithChildren } from 'react';
import { InvestmentsProvider } from '@/contexts/InvestmentsContext';
import { VisibilityProvider } from '@/contexts/VisibilityContext';

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <VisibilityProvider>
      <InvestmentsProvider>{children}</InvestmentsProvider>
    </VisibilityProvider>
  );
}
