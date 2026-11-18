'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useAddInvestment,
  useUpdateInvestment,
} from '@/features/investments/hooks/useInvestments';
import {
  emptyInvestmentForm,
  investmentFormSchema,
  toInvestmentForm,
  toNewInvestment,
  type InvestmentFormValues,
} from '@/features/investments/schema';
import type { Investment } from '@/features/investments/types';

/**
 * O formulário de investimento, nos dois modos: sem `investment` ele cria, com
 * `investment` ele edita. A validação vem do schema (Zod) pelo resolver; aqui
 * fica só o que o React Hook Form não sabe — quando abrir, o que preencher e
 * para qual mutation mandar.
 */
export function useInvestmentForm(investment?: Investment) {
  // As duas mutations são criadas sempre (regras dos hooks); o modo escolhe
  // qual vale. Elas já carregam isPending e error.
  const addInvestment = useAddInvestment();
  const updateInvestment = useUpdateInvestment();
  const [isOpen, setIsOpen] = useState(false);

  const isEditing = investment !== undefined;
  const mutation = isEditing ? updateInvestment : addInvestment;

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: emptyInvestmentForm,
    // Valida ao sair do campo, e não a cada tecla: corrigir um valor enquanto
    // se digita é mais incômodo do que útil.
    mode: 'onTouched',
  });

  // useWatch em vez de form.watch(): assina só este campo e é a forma que o
  // React Compiler consegue memoizar.
  const ticker = useWatch({ control: form.control, name: 'ticker' });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    // Ao abrir em edição, os campos nascem com o que já está salvo; ao fechar,
    // o reset também limpa os erros de validação da abertura anterior.
    form.reset(open && investment ? toInvestmentForm(investment) : emptyInvestmentForm);
    mutation.reset();
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = toNewInvestment(values);

    try {
      if (investment) {
        await updateInvestment.mutateAsync({ id: investment.id, investment: payload });
      } else {
        await addInvestment.mutateAsync(payload);
      }

      handleOpenChange(false);
    } catch {
      // A mensagem vem de mutation.error; o catch existe só para o dialog não
      // fechar quando a escrita falha.
    }
  });

  return {
    form,
    isOpen,
    handleOpenChange,
    handleSubmit,
    isEditing,
    isPending: mutation.isPending,
    // O ticker decide se o valor atual é obrigatório e se o indexador existe.
    hasTicker: ticker.trim() !== '',
    submitError: mutation.error?.message ?? null,
  };
}
