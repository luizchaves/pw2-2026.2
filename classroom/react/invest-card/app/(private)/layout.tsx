import Navbar from '@/components/Navbar';

/**
 * Área logada. O grupo `(private)` não aparece na URL (/dashboard continua
 * /dashboard): ele existe para estas rotas compartilharem esta casca — a
 * navbar de quem já entrou. Quem chega aqui sem sessão é parado antes, no
 * proxy.ts.
 */
export default function PrivateLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Navbar />
      <div className="p-6 md:p-10">{children}</div>
    </>
  );
}
