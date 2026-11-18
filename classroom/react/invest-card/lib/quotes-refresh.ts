export type RefreshSummary = {
  refreshed: { ticker: string; source: string }[];
  skipped: { ticker: string; reason: string }[];
  failed: { ticker: string; reason: string }[];
};

/**
 * Chama o Route Handler que atualiza as cotações. O fetch fica aqui, fora do
 * componente, para o hook de mutation só orquestrar cache e estado.
 */
export async function requestQuotesRefresh(
  force = true,
): Promise<RefreshSummary> {
  const response = await fetch(`/api/quotes/refresh${force ? '?force=1' : ''}`, {
    method: 'POST',
  });
  const body = await response.json();

  // Atualização parcial volta com status 200 e `refreshed` preenchido; só é
  // erro de verdade quando nada foi atualizado.
  if (!response.ok && !body?.refreshed) {
    throw new Error(body?.error ?? `HTTP ${response.status}`);
  }

  return {
    refreshed: body.refreshed ?? [],
    skipped: body.skipped ?? [],
    failed: body.failed ?? [],
  };
}
