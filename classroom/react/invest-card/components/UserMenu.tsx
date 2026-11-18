'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSignOut, useUser } from '@/hooks/useAuth';

export default function UserMenu() {
  const router = useRouter();
  const { data: user } = useUser();
  const { mutate: signOut, isPending } = useSignOut();

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    signOut(undefined, {
      onSuccess: () => {
        router.replace('/login');
        // O proxy precisa reavaliar a sessão já sem o cookie.
        router.refresh();
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[16ch] truncate text-sm text-slate-500 sm:inline"
        title={user.email}
      >
        {user.email}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={isPending}
        aria-label="Sair"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">{isPending ? 'Saindo...' : 'Sair'}</span>
      </Button>
    </div>
  );
}
