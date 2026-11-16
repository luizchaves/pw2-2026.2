'use client';

import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';
import { investments as initialInvestments } from '@/data/investments';
import type { Investment } from '@/types/investments';

type InvestmentsContextValue = {
  investments: Investment[];
  addInvestment: (investment: Investment) => void;
  removeInvestment: (id: string) => void;
};

const InvestmentsContext = createContext<InvestmentsContextValue | null>(null);

export function InvestmentsProvider({ children }: PropsWithChildren) {
  const [investments, setInvestments] =
    useState<Investment[]>(initialInvestments);

  const addInvestment = (investment: Investment) => {
    setInvestments((previous) => [...previous, investment]);
  };

  const removeInvestment = (id: string) => {
    setInvestments((previous) =>
      previous.filter((investment) => investment.id !== id),
    );
  };

  return (
    <InvestmentsContext.Provider
      value={{ investments, addInvestment, removeInvestment }}
    >
      {children}
    </InvestmentsContext.Provider>
  );
}

export function useInvestments(): InvestmentsContextValue {
  const context = useContext(InvestmentsContext);

  if (!context) {
    throw new Error(
      'useInvestments deve ser usado dentro de InvestmentsProvider',
    );
  }

  return context;
}
