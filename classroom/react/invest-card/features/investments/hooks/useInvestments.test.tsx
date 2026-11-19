import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  investmentKeys,
  useInvestments,
  useRemoveInvestment,
} from '@/features/investments/hooks/useInvestments';
import { makeInvestment } from '@/features/investments/test-fixtures';
import type { Investment } from '@/features/investments/types';

const { fetchInvestments, deleteInvestment } = vi.hoisted(() => ({
  fetchInvestments: vi.fn(),
  deleteInvestment: vi.fn(),
}));

vi.mock('@/features/investments/api', () => ({
  fetchInvestments,
  deleteInvestment,
  insertInvestment: vi.fn(),
  updateInvestment: vi.fn(),
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, wrapper };
}

const carteira = [
  makeInvestment({ id: '1', name: 'PETR4' }),
  makeInvestment({ id: '2', name: 'ITSA4' }),
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useInvestments', () => {
  it('lê a carteira pela chave compartilhada', async () => {
    fetchInvestments.mockResolvedValue(carteira);
    const { wrapper } = setup();

    const { result } = renderHook(() => useInvestments(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });

  it('entrega o erro já com a mensagem da camada de dados', async () => {
    fetchInvestments.mockRejectedValue(new Error('Não foi possível carregar'));
    const { wrapper } = setup();

    const { result } = renderHook(() => useInvestments(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Não foi possível carregar');
  });
});

describe('useRemoveInvestment', () => {
  it('tira o card do cache antes da resposta do banco', async () => {
    // Promessa que não resolve: congela a mutation no meio para olhar o cache.
    deleteInvestment.mockReturnValue(new Promise(() => {}));
    const { queryClient, wrapper } = setup();

    queryClient.setQueryData(investmentKeys.all, carteira);
    const { result } = renderHook(() => useRemoveInvestment(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => {
      const cached = queryClient.getQueryData<Investment[]>(investmentKeys.all);

      expect(cached?.map((i) => i.id)).toEqual(['2']);
    });
  });

  it('devolve o card para a lista quando o banco recusa', async () => {
    deleteInvestment.mockRejectedValue(new Error('row level security'));
    const { queryClient, wrapper } = setup();

    queryClient.setQueryData(investmentKeys.all, carteira);
    const { result } = renderHook(() => useRemoveInvestment(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    // O rollback é o que torna a remoção otimista honesta.
    const cached = queryClient.getQueryData<Investment[]>(investmentKeys.all);

    expect(cached?.map((i) => i.id)).toEqual(['1', '2']);
  });

  it('revalida a lista depois de remover', async () => {
    deleteInvestment.mockResolvedValue(undefined);
    fetchInvestments.mockResolvedValueOnce(carteira).mockResolvedValueOnce([carteira[1]]);
    const { wrapper } = setup();

    // A query precisa de alguém observando: invalidar sem observador marca
    // como velha, mas não busca de novo — é o mesmo que acontece na tela.
    const { result } = renderHook(
      () => ({ lista: useInvestments(), remover: useRemoveInvestment() }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.lista.isSuccess).toBe(true));
    result.current.remover.mutate('1');

    await waitFor(() => expect(result.current.remover.isSuccess).toBe(true));
    // O onSettled invalida a chave, então a carteira é relida do banco.
    await waitFor(() => expect(fetchInvestments).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.lista.data).toHaveLength(1));
  });
});
