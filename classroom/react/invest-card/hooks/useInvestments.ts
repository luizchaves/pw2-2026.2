'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  deleteInvestment,
  fetchInvestments,
  insertInvestment,
} from '@/lib/investments';
import { requestQuotesRefresh, type RefreshSummary } from '@/lib/quotes-refresh';
import type { Investment, NewInvestment } from '@/types/investments';

// Uma chave só para a carteira. Tudo que muda a lista (incluir, remover,
// atualizar cotações) invalida esta chave, e quem usa useInvestments refaz o
// fetch automaticamente — é isso que substitui o estado compartilhado antigo.
export const investmentKeys = {
  all: ['investments'] as const,
};

export function useInvestments(): UseQueryResult<Investment[], Error> {
  return useQuery({
    queryKey: investmentKeys.all,
    queryFn: fetchInvestments,
  });
}

export function useAddInvestment(): UseMutationResult<
  Investment,
  Error,
  NewInvestment
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertInvestment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: investmentKeys.all });
    },
  });
}

export function useRemoveInvestment(): UseMutationResult<
  void,
  Error,
  string,
  { previous: Investment[] | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvestment,
    // Remoção otimista: o card sai da tela na hora e volta se o banco recusar.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: investmentKeys.all });

      const previous = queryClient.getQueryData<Investment[]>(
        investmentKeys.all,
      );

      queryClient.setQueryData<Investment[]>(investmentKeys.all, (current) =>
        current?.filter((investment) => investment.id !== id),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(investmentKeys.all, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: investmentKeys.all });
    },
  });
}

export function useRefreshQuotes(): UseMutationResult<
  RefreshSummary,
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestQuotesRefresh(),
    // O Route Handler grava direto no Supabase, então o cache local fica velho:
    // invalidar é o que traz os novos preços para os cards.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: investmentKeys.all });
    },
  });
}
