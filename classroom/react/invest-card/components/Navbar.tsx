'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const links = [
  { href: '/', label: 'Investimentos' },
  { href: '/about', label: 'Sobre' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-slate-800"
        >
          <Wallet className="size-5 text-emerald-600" />
          <span>InvestCard</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="gap-1">
            {links.map(({ href, label }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink
                  active={pathname === href}
                  className="px-3 py-2 font-medium text-slate-600 data-active:bg-slate-200/70 data-active:text-slate-900"
                  render={<Link href={href} />}
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  );
}
