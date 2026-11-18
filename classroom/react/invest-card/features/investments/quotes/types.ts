/** Cotação normalizada: o formato que o app conhece, independente do provider. */
export type Quote = {
  ticker: string;
  price: number;
  /** Variação do dia, em %. */
  changePercent: number;
  currency: string;
  source: string;
};

export type QuoteProvider = {
  readonly name: string;
  /**
   * Resolve com a cotação ou rejeita com QuoteUnavailableError.
   * Nunca devolve um valor "vazio": quem não sabe cotar, falha.
   */
  fetchQuote(ticker: string, signal: AbortSignal): Promise<Quote>;
};

/** Falha esperada de um provider — é o que dispara o fallback. */
export class QuoteUnavailableError extends Error {
  constructor(
    readonly provider: string,
    readonly ticker: string,
    readonly reason: string,
  ) {
    super(`[${provider}] ${ticker}: ${reason}`);
    this.name = 'QuoteUnavailableError';
  }
}
