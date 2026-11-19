import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import PublicNavbar from '@/components/PublicNavbar';
import { renderWithProviders } from '@/test-utils';

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn(() => '/dashboard') }));

vi.mock('next/navigation', () => ({ usePathname, useRouter: () => ({}) }));
vi.mock('@/features/auth/components/UserMenu', () => ({
  default: () => <div>menu da conta</div>,
}));
describe('<Navbar /> — área logada', () => {
  it('leva ao dashboard pela marca e lista as duas rotas', () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByRole('link', { name: /InvestCard/ })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Investimentos' })).toHaveAttribute(
      'href',
      '/investments',
    );
  });

  it('marca a rota atual', () => {
    usePathname.mockReturnValue('/investments');

    renderWithProviders(<Navbar />);

    // O Base UI marca o item ativo com o atributo vazio `data-active`.
    expect(screen.getByRole('link', { name: 'Investimentos' })).toHaveAttribute(
      'data-active',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'data-active',
    );
  });
});

describe('<PublicNavbar /> — fora da sessão', () => {
  it('oferece as duas portas de entrada', () => {
    usePathname.mockReturnValue('/');

    renderWithProviders(<PublicNavbar />);

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
  });

  it('esconde o botão da página em que já se está', () => {
    usePathname.mockReturnValue('/login');

    renderWithProviders(<PublicNavbar />);

    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
  });

  it('troca pelo atalho do dashboard quando já há sessão', () => {
    usePathname.mockReturnValue('/');

    renderWithProviders(<PublicNavbar isSignedIn />);

    expect(screen.getByRole('button', { name: 'Ir para o dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Criar conta' })).not.toBeInTheDocument();
  });
});
