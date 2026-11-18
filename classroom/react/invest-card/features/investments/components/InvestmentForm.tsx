'use client';

import { Pencil, Plus } from 'lucide-react';
import { useInvestmentForm } from '@/features/investments/hooks/useInvestmentForm';
import {
  numberFields,
  quoteFields,
  selectFields,
  textFields,
} from '@/features/investments/form-fields';
import { indexerSuggestions } from '@/features/investments/options';
import type { Investment } from '@/features/investments/types';
import { LOCALE_NUMBER_PATTERN } from '@/lib/format';
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
  /** Presente: o formulário edita este ativo. Ausente: cria um novo. */
  investment?: Investment;
};

/** Só a apresentação: estado, validação e escrita moram no useInvestmentForm. */
export default function InvestmentForm({ investment }: InvestmentFormProps) {
  const {
    isOpen,
    handleOpenChange,
    formData,
    handleChange,
    handleTypeChange,
    handleCategoryChange,
    handleSubmit,
    isEditing,
    isPending,
    hasTicker,
    formError,
  } = useInvestmentForm(investment);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* `investment` em vez de `isEditing`: só a prop estreita o tipo para o
          TypeScript saber que há um nome aqui. */}
      {investment ? (
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
