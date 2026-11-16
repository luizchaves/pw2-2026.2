'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useVisibility } from '@/contexts/VisibilityContext';

export default function EyeToggle() {
  const { isOpenEye, toggleEye } = useVisibility();

  const handleEyeClick = () => {
    toggleEye();
  };

  return (
    <button
      type="button"
      onClick={handleEyeClick}
      className="text-slate-400 transition-colors hover:text-slate-600"
      aria-label={isOpenEye ? 'Ocultar valores' : 'Mostrar valores'}
      aria-pressed={!isOpenEye}
    >
      {isOpenEye ? (
        <Eye className="size-5" />
      ) : (
        <EyeOff className="size-5" />
      )}
    </button>
  );
}
