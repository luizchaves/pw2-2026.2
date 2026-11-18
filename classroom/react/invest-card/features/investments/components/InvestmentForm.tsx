'use client';

import { Controller } from 'react-hook-form';
import { Pencil, Plus } from 'lucide-react';
import FieldError from '@/components/FieldError';
import { useInvestmentForm } from '@/features/investments/hooks/useInvestmentForm';
import {
  numberFields,
  quoteFields,
  selectFields,
  textFields,
} from '@/features/investments/form-fields';
import { indexerSuggestions } from '@/features/investments/options';
import type { Investment } from '@/features/investments/types';
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

/**
 * Só a apresentação: o estado é do React Hook Form e as regras são do schema
 * em `features/investments/schema.ts`. Nenhum campo valida a si mesmo aqui.
 */
export default function InvestmentForm({ investment }: InvestmentFormProps) {
  const {
    form,
    isOpen,
    handleOpenChange,
    handleSubmit,
    isEditing,
    isPending,
    hasTicker,
    submitError,
  } = useInvestmentForm(investment);

  const {
    register,
    control,
    formState: { errors },
  } = form;

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

        {/* noValidate: quem valida é o schema, e o balão nativo do browser
            competiria com as mensagens abaixo de cada campo. */}
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {textFields.map(({ name, label, placeholder }) => (
              <div key={name} className="grid gap-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  placeholder={placeholder}
                  aria-invalid={Boolean(errors[name])}
                  {...register(name)}
                />
                <FieldError message={errors[name]?.message} />
              </div>
            ))}

            {selectFields.map(({ name, label, placeholder, options }) => (
              <div key={name} className="grid gap-1.5">
                <Label htmlFor={name}>{label}</Label>
                {/* Select é controlado (não é um <input>), então o campo passa
                    pelo Controller em vez de register. */}
                <Controller
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? '')}
                    >
                      <SelectTrigger
                        id={name}
                        className="w-full"
                        onBlur={field.onBlur}
                        aria-invalid={Boolean(errors[name])}
                      >
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
                  )}
                />
                <FieldError message={errors[name]?.message} />
              </div>
            ))}

            {numberFields.map(({ name, label, prefix, placeholder }) => {
              // Sem ticker não há de onde tirar o valor atual: é obrigatório.
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
                      inputMode="decimal"
                      placeholder={placeholder}
                      className="pl-9"
                      aria-invalid={Boolean(errors[name])}
                      {...register(name)}
                    />
                  </div>
                  {isOptional && !errors[name] && (
                    <span className="text-xs text-slate-400">
                      A cotação preenche na primeira atualização
                    </span>
                  )}
                  <FieldError message={errors[name]?.message} />
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
                  placeholder={placeholder}
                  aria-invalid={Boolean(errors[name])}
                  {...register(name)}
                />
                {!errors[name] && (
                  <span className="text-xs text-slate-400">{hint}</span>
                )}
                <FieldError message={errors[name]?.message} />
              </div>
            ))}

            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="indexer">Indexador (opcional)</Label>
              <Input
                id="indexer"
                list="indexer-suggestions"
                placeholder="100% Selic"
                aria-invalid={Boolean(errors.indexer)}
                {...register('indexer')}
              />
              {/* datalist: sugere os indexadores mais comuns sem fechar a
                  lista — a taxa muda de papel para papel. */}
              <datalist id="indexer-suggestions">
                {indexerSuggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
              {!errors.indexer && (
                <span className="text-xs text-slate-400">
                  Como a renda fixa rende. Deixe vazio quando há ticker.
                </span>
              )}
              <FieldError message={errors.indexer?.message} />
            </div>
          </div>

          {/* Erro da escrita no banco, não de validação: vale para o form todo. */}
          {submitError && (
            <p role="alert" className="text-sm text-rose-600">
              {submitError}
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
