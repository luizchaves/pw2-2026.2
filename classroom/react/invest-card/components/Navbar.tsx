'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet } from 'lucide-react';
import EyeToggle from '@/components/EyeToggle';
import UserMenu from '@/components/UserMenu';
import { useUser } from '@/hooks/useAuth';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/', label: 'Investimentos' },
];

export default function Navbar() {
  const pathname = usePathname();
  // Deslogado só vê a marca: as rotas abaixo são todas protegidas pelo proxy.
  const { data: user } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      {/* As mesmas margens do conteúdo (p-6 md:p-10 em app/layout.tsx) por
          fora, e o mesmo max-w-6xl por dentro: assim a marca nasce na mesma
          vertical do título da página, e o botão Sair na borda dos cards. */}
      <div className="px-6 md:px-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 py-3 sm:gap-4">
          {/* Navegação à esquerda, colada na marca; à direita ficam as ações
            de quem está logado (esconder valores e sair). */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {/* A marca leva para a mesma primeira tela do login. */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-slate-800"
            >
              <Wallet className="size-5 shrink-0 text-emerald-600" />
              {/* No celular a marca fica só no ícone: o nome inteiro empurraria
                os links para cima das ações da direita. */}
              <span className="hidden sm:inline">InvestCard</span>
            </Link>

            {user && (
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {links.map(({ href, label }) => (
                    <NavigationMenuItem key={href}>
                      <NavigationMenuLink
                        active={pathname === href}
                        className="px-2 py-2 font-medium text-slate-600 data-active:bg-slate-200/70 data-active:text-slate-900 sm:px-3"
                        render={<Link href={href} />}
                      >
                        {label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && <EyeToggle />}
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
