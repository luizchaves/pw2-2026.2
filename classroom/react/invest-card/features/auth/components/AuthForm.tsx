'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, UserPlus, Wallet } from 'lucide-react';
import FieldError from '@/components/FieldError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignIn, useSignUp } from '@/features/auth/hooks/useAuth';
import {
  authSchema,
  emptyAuthForm,
  type AuthFormValues,
} from '@/features/auth/schema';
import { HOME_ROUTE, ROUTES } from '@/lib/routes';

type AuthFormProps = {
  mode: 'signin' | 'signup';
};

/**
 * Só aceita destino dentro da própria aplicação. Testar `startsWith('/')` não
 * basta: `//evil.com` começa com barra e o browser lê como URL
 * protocolo-relativa, o que transformaria o login em um open redirect.
 */
function safeNext(next: string | null): string {
  if (!next) {
    return HOME_ROUTE;
  }

  try {
    const url = new URL(next, window.location.origin);

    return url.origin === window.location.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : HOME_ROUTE;
  } catch {
    return HOME_ROUTE;
  }
}

const copy = {
  signin: {
    title: 'Entrar',
    description: 'Acesse sua carteira de investimentos.',
    submit: 'Entrar',
    pending: 'Entrando...',
    footer: 'Ainda não tem conta?',
    linkLabel: 'Criar conta',
    linkHref: ROUTES.signup,
    Icon: LogIn,
  },
  signup: {
    title: 'Criar conta',
    description: 'Comece uma carteira nova, só sua.',
    submit: 'Criar conta',
    pending: 'Criando...',
    footer: 'Já tem conta?',
    linkLabel: 'Entrar',
    linkHref: ROUTES.login,
    Icon: UserPlus,
  },
} as const;

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useSignIn();
  const signUp = useSignUp();

  const isSignUp = mode === 'signup';
  const mutation = isSignUp ? signUp : signIn;
  const { title, description, submit, pending, footer, linkLabel, linkHref, Icon } =
    copy[mode];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    // O schema recebe o modo: a confirmação de senha só é cobrada no cadastro.
    resolver: zodResolver(authSchema(isSignUp)),
    defaultValues: emptyAuthForm,
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      await mutation.mutateAsync({ email: email.trim(), password });

      // `next` guarda a página que o proxy interceptou antes do login.
      router.replace(safeNext(searchParams.get('next')));
      // Sem o refresh o proxy continuaria decidindo com a sessão antiga.
      router.refresh();
    } catch {
      // A mensagem vem de mutation.error.
    }
  });

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Wallet className="size-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {isSignUp && !errors.password && (
              <span className="text-xs text-slate-400">Mínimo 6 caracteres</span>
            )}
            <FieldError message={errors.password?.message} />
          </div>

          {isSignUp && (
            <div className="grid gap-1.5">
              <Label htmlFor="confirmation">Confirmar senha</Label>
              <Input
                id="confirmation"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.confirmation)}
                {...register('confirmation')}
              />
              <FieldError message={errors.confirmation?.message} />
            </div>
          )}

          {/* Erro vindo do Supabase (credenciais, e-mail já usado), não de
              validação: vale para o formulário todo. */}
          {mutation.error && (
            <p role="alert" className="text-sm text-rose-600">
              {mutation.error.message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={mutation.isPending}
          >
            <Icon className="size-4" />
            {mutation.isPending ? pending : submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {footer}{' '}
          <Link href={linkHref} className="font-medium text-emerald-700 hover:underline">
            {linkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
