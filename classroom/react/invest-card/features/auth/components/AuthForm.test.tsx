import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '@/features/auth/components/AuthForm';
import { renderWithProviders } from '@/test-utils';

const { signIn, signUp, replace, refresh, searchParams } = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
  useSearchParams: () => searchParams,
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useSignIn: () => ({ mutateAsync: signIn, isPending: false, error: null }),
  useSignUp: () => ({ mutateAsync: signUp, isPending: false, error: null }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  searchParams.delete('next');
});

describe('<AuthForm mode="signin" />', () => {
  it('valida antes de chamar o Supabase', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AuthForm mode="signin" />);
    await user.type(screen.getByLabelText('E-mail'), 'nao-e-email');
    await user.type(screen.getByLabelText('Senha'), '123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByText('A senha precisa ter ao menos 6 caracteres.')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('entra e vai para o dashboard', async () => {
    signIn.mockResolvedValue({ id: 'user-1' });
    const user = userEvent.setup();

    renderWithProviders(<AuthForm mode="signin" />);
    await user.type(screen.getByLabelText('E-mail'), 'demo@investcard.dev');
    await user.type(screen.getByLabelText('Senha'), 'demo1234');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(signIn).toHaveBeenCalledWith({
      email: 'demo@investcard.dev',
      password: 'demo1234',
    }));
    expect(replace).toHaveBeenCalledWith('/dashboard');
    // Sem o refresh o proxy decidiria com a sessão antiga.
    expect(refresh).toHaveBeenCalled();
  });

  it('devolve para a página que o proxy interceptou', async () => {
    searchParams.set('next', '/investments');
    signIn.mockResolvedValue({ id: 'user-1' });
    const user = userEvent.setup();

    renderWithProviders(<AuthForm mode="signin" />);
    await user.type(screen.getByLabelText('E-mail'), 'demo@investcard.dev');
    await user.type(screen.getByLabelText('Senha'), 'demo1234');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/investments'));
  });

  it('ignora destino de fora do site', async () => {
    // `//evil.com` começa com barra e o browser leria como URL
    // protocolo-relativa: seria um open redirect.
    searchParams.set('next', '//evil.com');
    signIn.mockResolvedValue({ id: 'user-1' });
    const user = userEvent.setup();

    renderWithProviders(<AuthForm mode="signin" />);
    await user.type(screen.getByLabelText('E-mail'), 'demo@investcard.dev');
    await user.type(screen.getByLabelText('Senha'), 'demo1234');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('não pede confirmação de senha', () => {
    renderWithProviders(<AuthForm mode="signin" />);

    expect(screen.queryByLabelText('Confirmar senha')).not.toBeInTheDocument();
  });
});

describe('<AuthForm mode="signup" />', () => {
  it('cobra a confirmação igual', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AuthForm mode="signup" />);
    await user.type(screen.getByLabelText('E-mail'), 'novo@investcard.dev');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.type(screen.getByLabelText('Confirmar senha'), 'outra-coisa');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('As senhas não conferem.')).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('cadastra e entra direto', async () => {
    signUp.mockResolvedValue({ id: 'user-2' });
    const user = userEvent.setup();

    renderWithProviders(<AuthForm mode="signup" />);
    await user.type(screen.getByLabelText('E-mail'), 'novo@investcard.dev');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.type(screen.getByLabelText('Confirmar senha'), 'senha123');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    await waitFor(() => expect(signUp).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });
});
