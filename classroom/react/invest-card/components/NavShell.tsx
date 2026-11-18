import type { ReactNode } from 'react';
import Link from 'next/link';
import { Wallet } from 'lucide-react';

type NavShellProps = {
  /** Para onde a marca leva: o dashboard, ou a landing para quem está fora. */
  brandHref: string;
  /** Navegação, à direita da marca. */
  left?: ReactNode;
  /** Ações da conta, na outra ponta. */
  right: ReactNode;
};

/**
 * A casca da barra, compartilhada pelas duas navbars. As margens são as mesmas
 * do conteúdo (p-6 md:p-10 nos layouts) com o mesmo max-w-6xl por dentro:
 * assim a marca nasce na vertical do título da página, e as ações terminam na
 * borda dos cards.
 */
export default function NavShell({ brandHref, left, right }: NavShellProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="px-6 md:px-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 py-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link
              href={brandHref}
              className="flex items-center gap-2 font-bold text-slate-800"
            >
              <Wallet className="size-5 shrink-0 text-emerald-600" />
              {/* No celular a marca fica só no ícone: o nome inteiro
                  empurraria o resto da barra. */}
              <span className="hidden sm:inline">InvestCard</span>
            </Link>

            {left}
          </div>

          <div className="flex items-center gap-2">{right}</div>
        </nav>
      </div>
    </header>
  );
}
