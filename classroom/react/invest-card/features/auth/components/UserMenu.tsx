'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSignOut, useUser } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/lib/routes';

/**
 * Iniciais a partir do e-mail — é o único nome que temos, já que o cadastro
 * pede só e-mail e senha. `maria.silva@...` vira MS; `demo@...`, sem separador
 * para dividir, vira DE.
 */
function getInitials(email: string): string {
  const [localPart = ''] = email.split('@');
  const parts = localPart.split(/[._-]+/).filter(Boolean);

  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase();
}

export default function UserMenu() {
  const router = useRouter();
  const { data: user } = useUser();
  const { mutate: signOut, isPending } = useSignOut();

  if (!user?.email) {
    return null;
  }

  const handleSignOut = () => {
    signOut(undefined, {
      onSuccess: () => {
        router.replace(ROUTES.landing);
        // O proxy precisa reavaliar a sessão já sem o cookie.
        router.refresh();
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Abrir menu da conta"
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-slate-300"
      >
        <Avatar>
          <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
            {getInitials(user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* align="end" prende o menu na borda direita; sem w-56 ele herdaria a
          largura do avatar, que tem 32px. */}
      <DropdownMenuContent align="end" className="w-56">
        {/* No Base UI o label pertence a um grupo: solto, ele quebra em
            runtime procurando o MenuGroupContext. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate" title={user.email}>
            {user.email}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={handleSignOut}
        >
          <LogOut />
          {isPending ? 'Saindo...' : 'Sair'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
