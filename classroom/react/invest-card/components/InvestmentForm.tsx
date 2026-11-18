'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Pencil, Plus } from 'lucide-react';
import type { Investment, InvestmentFormData } from '@/types/investments';
import { useAddInvestment, useUpdateInvestment } from '@/hooks/useInvestments';
import {
  indexerSuggestions,
  investmentCategories,
  investmentTypes,
} from '@/data/investments';
import {
  formatLocaleNumber,
  formatQuantity,
  LOCALE_NUMBER_PATTERN,
  parseLocaleNumber,
} from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const textFields = [
  { name: 'name', label: 'Nome', placeholder: 'PETR4' },
  { name: 'issuer', label: 'Emissor', placeholder: 'B3' },
] as const;

const selectFields = [
  {
    name: 'type',
    label: 'Tipo',
    placeholder: 'Selecione o tipo',
    options: investmentTypes,
  },
  {
    name: 'category',
    label: 'Categoria',
    placeholder: 'Selecione a categoria',
    options: investmentCategories,
  },
] as const;

// Opcionais: preenchidos só para o que é negociado em bolsa. Com ticker, a
// cotação passa a vir do /api/quotes/refresh e sobrescreve os valores abaixo.
const quoteFields = [
  {
    name: 'ticker',
    label: 'Ticker (opcional)',
    placeholder: 'PETR4',
    hint: 'Deixe vazio para renda fixa e fundos',
  },
  {
    name: 'quantity',
    label: 'Quantidade',
    placeholder: '75',
    hint: 'Obrigatória quando há ticker',
  },
] as const;

// Sem campo de performance: ela é calculada a partir destes dois valores
// (e, para quem tem ticker, sobrescrita pela cotação no próximo refresh).
// O que foi aportado vem primeiro: é o dado que a pessoa sempre tem na mão.
// O valor atual vem depois e só é dispensável quando há ticker — aí ele nasce
// da cotação (quantidade × preço) na primeira atualização.
const numberFields = [
  {
    name: 'investedValue',
    label: 'Valor investido',
    prefix: 'R$',
    placeholder: '3.400,00',
  },
  {
    name: 'currentValue',
    label: 'Valor atual',
    prefix: 'R$',
    placeholder: '3.245,10',
  },
] as const;

type InvestmentFormProps = {
  /** Presente: o formulário edita este ativo. Ausente: cria um novo. */
  investment?: Investment;
};

export default function InvestmentForm({ investment }: InvestmentFormProps) {
  // As duas mutations são criadas sempre (regras dos hooks); o modo escolhe
  // qual vale. Elas já carregam isPending e error, então o componente só
  // guarda o que é dele: o dialog, os campos e a validação local.
  const addInvestment = useAddInvestment();
  const updateInvestment = useUpdateInvestment();
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InvestmentFormData>(initialFormData);

  const isEditing = investment !== undefined;
  const mutation = isEditing ? updateInvestment : addInvestment;
  const { isPending } = mutation;

  const formError = validationError ?? mutation.error?.message ?? null;

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

  const hasTicker = formData.ticker.trim() !== '';

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

    try {
      const investedValue = parseLocaleNumber(formData.investedValue);
      const currentValueInput = formData.currentValue.trim();

      const payload = {
        name: formData.name,
        issuer: formData.issuer,
        type: formData.type,
        category: formData.category,
        // Só chega aqui vazio quando há ticker: até a primeira cotação o
        // ativo vale o que custou, e a performance derivada dá 0%.
        currentValue: currentValueInput
          ? parseLocaleNumber(currentValueInput)
          : investedValue,
        investedValue,
        ticker: ticker || null,
        indexer: ticker ? null : indexer || null,
        quantity: ticker ? parseLocaleNumber(quantity) : null,
      };

      if (investment) {
        await updateInvestment.mutateAsync({ id: investment.id, investment: payload });
      } else {
        await addInvestment.mutateAsync(payload);
      }

      handleOpenChange(false);
    } catch {
      // A mensagem vem de error.message da mutation; o catch existe só para o
      // dialog não fechar quando o insert falha.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {isEditing ? (
        <DialogTrigger
          className="shrink-0 p-1 rounded-md text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={`Editar ${investment.name}`}
        >
          <Pencil className="w-4 h-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger
          render={<Button size="lg" />}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Adicionar investimento
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar investimento' : 'Adicionar investimento'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere os dados do ativo. A carteira é atualizada na hora.'
              : 'Preencha os dados do ativo para incluí-lo na sua carteira.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {textFields.map(({ name, label, placeholder }) => (
              <div key={name} className="grid gap-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}

            {selectFields.map(({ name, label, placeholder, options }) => (
              <div key={name} className="grid gap-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Select
                  name={name}
                  value={formData[name]}
                  onValueChange={
                    name === 'type' ? handleTypeChange : handleCategoryChange
                  }
                  required
                >
                  <SelectTrigger id={name} className="w-full">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {numberFields.map(({ name, label, prefix, placeholder }) => {
              // Sem ticker não há de onde tirar o valor atual: ele é obrigatório.
              const isOptional = name === 'currentValue' && hasTicker;

              return (
                <div key={name} className="grid gap-1.5">
                  <Label htmlFor={name}>
                    {isOptional ? `${label} (opcional)` : label}
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      {prefix}
                    </span>
                    <Input
                      id={name}
                      name={name}
                      inputMode="decimal"
                      pattern={LOCALE_NUMBER_PATTERN}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      title="Use o formato pt-BR, por exemplo 3.245,10"
                      className="pl-9"
                      required={!isOptional}
                    />
                  </div>
                  {isOptional && (
                    <span className="text-xs text-slate-400">
                      A cotação preenche na primeira atualização
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            {quoteFields.map(({ name, label, placeholder, hint }) => (
              <div key={name} className="grid gap-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                />
                <span className="text-xs text-slate-400">{hint}</span>
              </div>
            ))}

            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="indexer">Indexador (opcional)</Label>
              <Input
                id="indexer"
                name="indexer"
                list="indexer-suggestions"
                value={formData.indexer}
                onChange={handleChange}
                placeholder="100% Selic"
              />
              {/* datalist: sugere os indexadores mais comuns sem fechar a
                  lista — a taxa muda de papel para papel. */}
              <datalist id="indexer-suggestions">
                {indexerSuggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
              <span className="text-xs text-slate-400">
                Como a renda fixa rende. Deixe vazio quando há ticker.
              </span>
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-rose-600">
              {formError}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
