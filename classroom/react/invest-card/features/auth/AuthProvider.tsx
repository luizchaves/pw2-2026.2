'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { authKeys } from '@/features/auth/hooks/useAuth';
import { investmentKeys } from '@/features/investments/hooks/useInvestments';

/**
 * Liga os eventos de sessão do Supabase ao cache do TanStack Query. Sem isto,
 * login em outra aba (ou logout, ou o refresh automático do token) não chegaria
 * nesta tela: o cache continuaria mostrando a carteira de quem saiu.
 */
export default function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear();

        return;
      }

      void queryClient.invalidateQueries({ queryKey: authKeys.user });
      void queryClient.invalidateQueries({ queryKey: investmentKeys.all });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return children;
}
