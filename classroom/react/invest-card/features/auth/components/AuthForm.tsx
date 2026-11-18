'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, UserPlus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignIn, useSignUp } from '@/features/auth/hooks/useAuth';

type AuthFormProps = {
  mode: 'signin' | 'signup';
};

/** Para onde vai quem entrou sem ter pedido uma página específica. */
const HOME_ROUTE = '/dashboard';

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
    linkHref: '/signup',
    Icon: LogIn,
  },
  signup: {
    title: 'Criar conta',
    description: 'Comece uma carteira nova, só sua.',
    submit: 'Criar conta',
    pending: 'Criando...',
    footer: 'Já tem conta?',
    linkLabel: 'Entrar',
    linkHref: '/login',
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

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmation: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const errorMessage = validationError ?? mutation.error?.message ?? null;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (isSignUp && form.password !== form.confirmation) {
      setValidationError('As senhas não conferem.');

      return;
    }

    try {
      await mutation.mutateAsync({
        email: form.email.trim(),
        password: form.password,
      });

      // `next` guarda a página que o proxy interceptou antes do login.
      router.replace(safeNext(searchParams.get('next')));
      // Sem o refresh o proxy continuaria decidindo com a sessão antiga.
      router.refresh();
    } catch {
      // A mensagem já vem de mutation.error.
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Wallet className="size-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="voce@exemplo.com"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={6}
              required
            />
            {isSignUp && (
              <span className="text-xs text-slate-400">Mínimo 6 caracteres</span>
            )}
          </div>

          {isSignUp && (
            <div className="grid gap-1.5">
              <Label htmlFor="confirmation">Confirmar senha</Label>
              <Input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                value={form.confirmation}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          )}

          {errorMessage && (
            <p role="alert" className="text-sm text-rose-600">
              {errorMessage}
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
