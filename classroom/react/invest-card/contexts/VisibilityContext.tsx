'use client';

import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

type VisibilityContextValue = {
  isOpenEye: boolean;
  toggleEye: () => void;
};

const VisibilityContext = createContext<VisibilityContextValue | null>(null);

export function VisibilityProvider({ children }: PropsWithChildren) {
  const [isOpenEye, setIsOpenEye] = useState(true);

  const toggleEye = () => {
    setIsOpenEye((previous) => !previous);
  };

  return (
    <VisibilityContext.Provider value={{ isOpenEye, toggleEye }}>
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility(): VisibilityContextValue {
  const context = useContext(VisibilityContext);

  if (!context) {
    throw new Error('useVisibility deve ser usado dentro de VisibilityProvider');
  }

  return context;
}
