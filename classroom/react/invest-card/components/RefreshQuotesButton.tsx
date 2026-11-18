'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRefreshQuotes } from '@/hooks/useInvestments';

export default function RefreshQuotesButton() {
  const { mutate, isPending, data, error } = useRefreshQuotes();

  // O sucesso já aparece nos próprios cards (preço, provider e horário);
  // só vale avisar o que NÃO foi atualizado.
  const message =
    error?.message ??
    (data && data.failed.length > 0 ? `${data.failed.length} sem cotação` : null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="lg"
        onClick={() => mutate()}
        disabled={isPending}
      >
        <RefreshCw className={isPending ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
        {isPending ? 'Atualizando...' : 'Atualizar cotações'}
      </Button>

      {message && (
        <span className="text-xs text-slate-500 text-right">{message}</span>
      )}
    </div>
  );
}
