'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestments } from '@/contexts/InvestmentsContext';

type RefreshSummary = {
  refreshed: { ticker: string; source: string }[];
  failed: { ticker: string; reason: string }[];
};

export default function RefreshQuotesButton() {
  const { reload } = useInvestments();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setIsRefreshing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/quotes/refresh?force=1', {
        method: 'POST',
      });
      const body = await response.json();

      if (!response.ok && !body?.refreshed) {
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }

      // O sucesso já aparece nos próprios cards (preço, provider e horário);
      // só vale avisar o que NÃO foi atualizado.
      const { failed = [] } = body as RefreshSummary;

      if (failed.length > 0) {
        setMessage(`${failed.length} sem cotação`);
      }

      await reload();
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : 'Falha ao atualizar cotações.',
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={isRefreshing}
      >
        <RefreshCw className={isRefreshing ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
        {isRefreshing ? 'Atualizando...' : 'Atualizar cotações'}
      </Button>

      {message && (
        <span className="text-xs text-slate-500 text-right">{message}</span>
      )}
    </div>
  );
}
