'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import type { Investment, InvestmentFormData } from '@/types/investments';
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

type InvestmentFormProps = {
  onAdd: (investment: Investment) => void;
};

const initialFormData: InvestmentFormData = {
  name: '',
  issuer: '',
  type: '',
  category: '',
  performance: '',
  currentValue: '',
  investedValue: '',
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

export default function InvestmentForm({ onAdd }: InvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<InvestmentFormData>(initialFormData);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setFormData(initialFormData);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onAdd({
      id: crypto.randomUUID(),
      name: formData.name,
      issuer: formData.issuer,
      type: formData.type,
      category: formData.category,
      performance: parseLocaleNumber(formData.performance),
      currentValue: parseLocaleNumber(formData.currentValue),
      investedValue: parseLocaleNumber(formData.investedValue),
    });

    handleOpenChange(false);
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

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
