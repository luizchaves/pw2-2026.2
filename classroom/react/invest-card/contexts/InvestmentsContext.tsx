'use client';

import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  deleteInvestment,
  fetchInvestments,
  insertInvestment,
} from '@/lib/investments';
import type { Investment, NewInvestment } from '@/types/investments';

type InvestmentsContextValue = {
  investments: Investment[];
  isLoading: boolean;
  error: string | null;
  addInvestment: (investment: NewInvestment) => Promise<void>;
  removeInvestment: (id: string) => Promise<void>;
  /** Relê a carteira do banco (usado depois de atualizar as cotações). */
  reload: () => Promise<void>;
};

const InvestmentsContext = createContext<InvestmentsContextValue | null>(null);

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Erro inesperado.';
}

export function InvestmentsProvider({ children }: PropsWithChildren) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    fetchInvestments()
      .then((data) => {
        if (isCurrent) {
          setInvestments(data);
        }
      })
      .catch((cause) => {
        if (isCurrent) {
          setError(getErrorMessage(cause));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const reload = async () => {
    try {
      setInvestments(await fetchInvestments());
      setError(null);
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  };

  const addInvestment = async (investment: NewInvestment) => {
    try {
      const created = await insertInvestment(investment);

      setInvestments((previous) => [...previous, created]);
      setError(null);
    } catch (cause) {
      setError(getErrorMessage(cause));
      throw cause;
    }
  };

  const removeInvestment = async (id: string) => {
    try {
      await deleteInvestment(id);

      setInvestments((previous) =>
        previous.filter((investment) => investment.id !== id),
      );
      setError(null);
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  };

  return (
    <InvestmentsContext
      value={{
        investments,
        isLoading,
        error,
        addInvestment,
        removeInvestment,
        reload,
      }}
    >
      {children}
    </InvestmentsContext>
  );
}

export function useInvestments(): InvestmentsContextValue {
  const context = use(InvestmentsContext);

  if (!context) {
    throw new Error(
      'useInvestments deve ser usado dentro de InvestmentsProvider',
    );
  }

  return context;
}
