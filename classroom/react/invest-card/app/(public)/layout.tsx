import { Suspense } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import { getSessionUser } from '@/lib/session';

async function SessionAwareNavbar() {
  const user = await getSessionUser();

  return <PublicNavbar isSignedIn={Boolean(user)} />;
}

/**
 * Landing, login e cadastro. O resto da página é estático; só a barra depende
 * da sessão, então ela sai primeiro com as portas de entrada (o fallback) e é
 * trocada pelo atalho do dashboard quando a sessão chega do servidor.
 */
export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Suspense fallback={<PublicNavbar />}>
        <SessionAwareNavbar />
      </Suspense>
      <div className="p-6 md:p-10">{children}</div>
    </>
  );
}
