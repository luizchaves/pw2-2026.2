import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserMenu from '@/features/auth/components/UserMenu';
import { renderWithProviders } from '@/test-utils';

const { useUser, signOut, replace, refresh } = vi.hoisted(() => ({
  useUser: vi.fn(),
  signOut: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useUser,
  useSignOut: () => ({ mutate: signOut, isPending: false }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('<UserMenu />', () => {
  it('não mostra nada sem sessão', () => {
    useUser.mockReturnValue({ data: null });

    const { container } = renderWithProviders(<UserMenu />);

    expect(container).toBeEmptyDOMElement();
  });

  it('tira as iniciais do e-mail', () => {
    useUser.mockReturnValue({ data: { email: 'maria.silva@investcard.dev' } });

    renderWithProviders(<UserMenu />);

    // Com separador, as iniciais das duas partes.
    expect(screen.getByText('MS')).toBeInTheDocument();
  });

  it('sem separador, usa as duas primeiras letras', () => {
    useUser.mockReturnValue({ data: { email: 'demo@investcard.dev' } });

    renderWithProviders(<UserMenu />);

    expect(screen.getByText('DE')).toBeInTheDocument();
  });

  it('mostra o e-mail e sai pelo menu, voltando para a landing', async () => {
    useUser.mockReturnValue({ data: { email: 'demo@investcard.dev' } });
    signOut.mockImplementation((_input, options) => options?.onSuccess?.());
    const user = userEvent.setup();

    renderWithProviders(<UserMenu />);
    await user.click(screen.getByRole('button', { name: 'Abrir menu da conta' }));

    expect(await screen.findByText('demo@investcard.dev')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Sair' }));

    expect(signOut).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/');
    // Sem o refresh o proxy decidiria com a sessão antiga.
    expect(refresh).toHaveBeenCalled();
  });
});
