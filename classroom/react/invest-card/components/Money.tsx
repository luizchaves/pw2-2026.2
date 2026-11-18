'use client';

import { formatCurrency } from '@/lib/format';
import { useVisibility } from '@/contexts/VisibilityContext';

type MoneyProps = {
  value: number;
};

/**
 * Um valor em reais que obedece ao olho da navbar. A regra do mascaramento
 * fica aqui: espalhada pelos componentes, bastava esquecer um `isOpenEye ?`
 * para vazar um número que a pessoa pediu para esconder.
 */
export default function Money({ value }: MoneyProps) {
  const { isOpenEye } = useVisibility();

  return <>{isOpenEye ? formatCurrency(value) : 'R$ ****'}</>;
}
