'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  useAddInvestment,
  useUpdateInvestment,
} from '@/features/investments/hooks/useInvestments';
import type {
  Investment,
  InvestmentFormData,
} from '@/features/investments/types';
import {
  formatLocaleNumber,
  formatQuantity,
  parseLocaleNumber,
} from '@/lib/format';

const initialFormData: InvestmentFormData = {
  name: '',
  issuer: '',
  type: '',
  category: '',
  currentValue: '',
  investedValue: '',
  ticker: '',
  indexer: '',
  quantity: '',
};

/** Reabre um investimento no formulário: números viram texto em pt-BR. */
function toFormData(investment: Investment): InvestmentFormData {
  return {
    name: investment.name,
    issuer: investment.issuer,
    type: investment.type,
    category: investment.category,
    currentValue: formatLocaleNumber(investment.currentValue),
    investedValue: formatLocaleNumber(investment.investedValue),
    ticker: investment.ticker ?? '',
    indexer: investment.indexer ?? '',
    quantity:
      investment.quantity === null ? '' : formatQuantity(investment.quantity),
  };
}

/**
 * O estado e as regras do formulário de investimento, para o componente ficar
 * só com a apresentação. Serve aos dois modos: sem `investment` ele cria, com
 * `investment` ele edita.
 */
export function useInvestmentForm(investment?: Investment) {
  // As duas mutations são criadas sempre (regras dos hooks); o modo escolhe
  // qual vale. Elas já carregam isPending e error, então aqui só mora o que é
  // do formulário: o dialog, os campos e a validação local.
  const addInvestment = useAddInvestment();
  const updateInvestment = useUpdateInvestment();
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InvestmentFormData>(initialFormData);

  const isEditing = investment !== undefined;
  const mutation = isEditing ? updateInvestment : addInvestment;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    // Ao abrir em edição, os campos nascem com o que já está salvo; ao
    // fechar, tudo volta ao zero para a próxima abertura.
    setFormData(open && investment ? toFormData(investment) : initialFormData);
    setValidationError(null);
    mutation.reset();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleTypeChange = (value: string | null) => {
    setFormData({ ...formData, type: value ?? '' });
  };

  const handleCategoryChange = (value: string | null) => {
    setFormData({ ...formData, category: value ?? '' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const ticker = formData.ticker.trim().toUpperCase();
    const quantity = formData.quantity.trim();

    if (ticker && !quantity) {
      setValidationError('Informe a quantidade para poder cotar o ticker.');

      return;
    }

    const indexer = formData.indexer.trim();

    // Mesma regra que a check constraint do banco, só que avisando antes.
    if (ticker && indexer) {
      setValidationError(
        'Ativo com ticker é cotado pelo mercado: deixe o indexador vazio.',
      );

      return;
    }

    const investedValue = parseLocaleNumber(formData.investedValue);
    const currentValueInput = formData.currentValue.trim();

    const payload = {
      name: formData.name,
      issuer: formData.issuer,
      type: formData.type,
      category: formData.category,
      // Só chega aqui vazio quando há ticker: até a primeira cotação o ativo
      // vale o que custou, e a performance derivada dá 0%.
      currentValue: currentValueInput
        ? parseLocaleNumber(currentValueInput)
        : investedValue,
      investedValue,
      ticker: ticker || null,
      indexer: ticker ? null : indexer || null,
      quantity: ticker ? parseLocaleNumber(quantity) : null,
    };

    try {
      if (investment) {
        await updateInvestment.mutateAsync({
          id: investment.id,
          investment: payload,
        });
      } else {
        await addInvestment.mutateAsync(payload);
      }

      handleOpenChange(false);
    } catch {
      // A mensagem vem de mutation.error; o catch existe só para o dialog não
      // fechar quando a escrita falha.
    }
  };

  return {
    isOpen,
    handleOpenChange,
    formData,
    handleChange,
    handleTypeChange,
    handleCategoryChange,
    handleSubmit,
    isEditing,
    isPending: mutation.isPending,
    hasTicker: formData.ticker.trim() !== '',
    formError: validationError ?? mutation.error?.message ?? null,
  };
}
