import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useSignIn, useSignOut, useUser } from '@/features/auth/hooks/useAuth';

const { auth } = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock('@/lib/supabase/client', () => ({ supabase: { auth } }));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUser', () => {
  it('entrega o usuário logado', async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: '1' } }, error: null });
    const { wrapper } = setup();

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual({ id: '1' }));
  });

  it('trata ausência de sessão como null, e não como erro', async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('no session') });
    const { wrapper } = setup();

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useSignIn', () => {
  it('traduz a mensagem do Supabase', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });
    const { wrapper } = setup();

    const { result } = renderHook(() => useSignIn(), { wrapper });

    result.current.mutate({ email: 'demo@investcard.dev', password: 'errada' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('E-mail ou senha inválidos.');
  });

  it('repassa mensagem desconhecida sem inventar tradução', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Service unavailable' },
    });
    const { wrapper } = setup();

    const { result } = renderHook(() => useSignIn(), { wrapper });

    result.current.mutate({ email: 'demo@investcard.dev', password: 'x' });

    await waitFor(() => expect(result.current.error?.message).toBe('Service unavailable'));
  });
});

describe('useSignOut', () => {
  it('esvazia o cache ao sair', async () => {
    auth.signOut.mockResolvedValue({ error: null });
    const { queryClient, wrapper } = setup();

    queryClient.setQueryData(['investments'], [{ id: '1' }]);
    const { result } = renderHook(() => useSignOut(), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // A carteira em memória é de quem saiu: não pode aparecer no próximo login.
    expect(queryClient.getQueryData(['investments'])).toBeUndefined();
  });
});
