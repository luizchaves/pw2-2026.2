'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavShell from '@/components/NavShell';
import { Button } from '@/components/ui/button';
import { HOME_ROUTE, ROUTES } from '@/lib/routes';

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
        brandHref={HOME_ROUTE}
        right={
          <Button
            nativeButton={false}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            render={<Link href={HOME_ROUTE} />}
          >
            Ir para o dashboard
          </Button>
        }
      />
    );
  }

  return (
    <NavShell
      brandHref={ROUTES.landing}
      right={
        <>
          {pathname !== ROUTES.login && (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={ROUTES.login} />}
            >
              Entrar
            </Button>
          )}
          {pathname !== ROUTES.signup && (
            <Button
              nativeButton={false}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              render={<Link href={ROUTES.signup} />}
            >
              Criar conta
            </Button>
          )}
        </>
      }
    />
  );
}
