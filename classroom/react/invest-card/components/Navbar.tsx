'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import EyeToggle from '@/components/EyeToggle';
import NavShell from '@/components/NavShell';
import UserMenu from '@/features/auth/components/UserMenu';
import { ROUTES } from '@/lib/routes';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const links = [
  { href: ROUTES.dashboard, label: 'Dashboard' },
  { href: ROUTES.investments, label: 'Investimentos' },
];

/**
 * Barra da área logada. Não checa sessão: ela só é montada pelo layout de
 * `(private)`, e o proxy já barrou quem não entrou.
 */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <NavShell
      brandHref={ROUTES.dashboard}
      left={
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
      }
      right={
        <>
          <EyeToggle />
          <UserMenu />
        </>
      }
    />
  );
}
