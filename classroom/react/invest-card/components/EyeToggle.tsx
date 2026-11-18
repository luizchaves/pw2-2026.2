'use client';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVisibility } from '@/contexts/VisibilityContext';

export default function EyeToggle() {
  const { isOpenEye, toggleEye } = useVisibility();

  const handleEyeClick = () => {
    toggleEye();
  };

  const label = isOpenEye ? 'Ocultar valores' : 'Mostrar valores';

  // Mesma caixa do avatar ao lado (size-8, redonda): um ícone solto fica com
  // altura e centro próprios e desalinha a dupla. A área de clique também
  // deixa de ser do tamanho do desenho do olho.
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleEyeClick}
      className={cn(
        'rounded-full transition-colors hover:bg-slate-100 hover:text-slate-600',
        // Com os valores escondidos o botão fica marcado: senão o único
        // sinal de que o modo está ligado são os R$ **** na tela.
        isOpenEye ? 'text-slate-400' : 'bg-slate-100 text-slate-600',
      )}
      title={label}
      aria-label={label}
      aria-pressed={!isOpenEye}
    >
      {isOpenEye ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
    </Button>
  );
}
