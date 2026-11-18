'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavShell from '@/components/NavShell';
import { Button } from '@/components/ui/button';

type PublicNavbarProps = {
  /** O layout lê a sessão no servidor e avisa aqui. */
  isSignedIn?: boolean;
};

/**
 * Barra da landing, do login e do cadastro: as duas portas de entrada, menos a
 * da página em que já se está — ou o atalho de volta, para quem já entrou.
 */
export default function PublicNavbar({ isSignedIn = false }: PublicNavbarProps) {
  const pathname = usePathname();

  if (isSignedIn) {
    return (
      <NavShell
        brandHref="/dashboard"
        right={
          <Button
            nativeButton={false}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            render={<Link href="/dashboard" />}
          >
            Ir para o dashboard
          </Button>
        }
      />
    );
  }

  return (
    <NavShell
      brandHref="/"
      right={
        <>
          {pathname !== '/login' && (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Entrar
            </Button>
          )}
          {pathname !== '/signup' && (
            <Button
              nativeButton={false}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              render={<Link href="/signup" />}
            >
              Criar conta
            </Button>
          )}
        </>
      }
    />
  );
}
