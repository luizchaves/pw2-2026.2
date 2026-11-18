'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import type { InvestmentFormData } from '@/types/investments';
import { useAddInvestment } from '@/hooks/useInvestments';
import { investmentCategories, investmentTypes } from '@/data/investments';
import { LOCALE_NUMBER_PATTERN, parseLocaleNumber } from '@/lib/format';
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
  performance: '',
  currentValue: '',
  investedValue: '',
  ticker: '',
  quantity: '',
};

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

const numberFields = [
  {
    name: 'performance',
    label: 'Performance',
    prefix: '%',
    placeholder: '1,84',
  },
  {
    name: 'currentValue',
    label: 'Valor atual',
    prefix: 'R$',
    placeholder: '3.245,10',
  },
  {
    name: 'investedValue',
    label: 'Valor investido',
    prefix: 'R$',
    placeholder: '3.400,00',
  },
] as const;

export default function InvestmentForm() {
  // A mutation já carrega isPending e error: o componente só guarda o que é
  // dele mesmo (o dialog, os campos e a validação local).
  const { mutateAsync: addInvestment, isPending, error, reset } =
    useAddInvestment();
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InvestmentFormData>(initialFormData);

  const formError = validationError ?? error?.message ?? null;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setFormData(initialFormData);
      setValidationError(null);
      reset();
    }
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

    try {
      await addInvestment({
        name: formData.name,
        issuer: formData.issuer,
        type: formData.type,
        category: formData.category,
        performance: parseLocaleNumber(formData.performance),
        currentValue: parseLocaleNumber(formData.currentValue),
        investedValue: parseLocaleNumber(formData.investedValue),
        ticker: ticker || null,
        quantity: ticker ? parseLocaleNumber(quantity) : null,
      });

      handleOpenChange(false);
    } catch {
      // A mensagem vem de error.message da mutation; o catch existe só para o
      // dialog não fechar quando o insert falha.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button size="lg" />}
        className="bg-emerald-600 text-white hover:bg-emerald-700"
      >
        <Plus className="w-4 h-4" />
        Adicionar investimento
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar investimento</DialogTitle>
          <DialogDescription>
            Preencha os dados do ativo para incluí-lo na sua carteira.
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

            {numberFields.map(({ name, label, prefix, placeholder }) => (
              <div key={name} className="grid gap-1.5">
                <Label htmlFor={name}>{label}</Label>
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
                    required
                  />
                </div>
              </div>
            ))}
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
              {isPending ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
