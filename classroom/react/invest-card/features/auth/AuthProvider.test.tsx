import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '@/features/auth/AuthProvider';

const { onAuthStateChange, unsubscribe } = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: { auth: { onAuthStateChange } },
}));

/** Monta o provider e devolve o gatilho dos eventos de sessão. */
function setup() {
  let emit: (event: string) => void = () => {};

  onAuthStateChange.mockImplementation((handler: (event: string) => void) => {
    emit = handler;

    return { data: { subscription: { unsubscribe } } };
  });

  const queryClient = new QueryClient();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>conteúdo</AuthProvider>
    </QueryClientProvider>,
  );

  return { emit: (event: string) => emit(event), queryClient, view };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('<AuthProvider />', () => {
  it('esvazia o cache quando a sessão termina', () => {
    const { emit, queryClient } = setup();

    queryClient.setQueryData(['investments'], [{ id: '1' }]);
    emit('SIGNED_OUT');

    // Inclusive quando o logout aconteceu em outra aba.
    expect(queryClient.getQueryData(['investments'])).toBeUndefined();
  });

  it('revalida a carteira quando alguém entra', () => {
    const { emit, queryClient } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    emit('SIGNED_IN');

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['auth', 'user'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['investments'] });
  });

  it('cancela a assinatura ao desmontar', () => {
    const { view } = setup();

    view.unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
