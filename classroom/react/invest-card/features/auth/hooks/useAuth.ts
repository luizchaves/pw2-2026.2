'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export type Credentials = {
  email: string;
  password: string;
};

export const authKeys = {
  user: ['auth', 'user'] as const,
};

// O Supabase responde em inglês; a tela fala português.
const MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha inválidos.',
  'User already registered': 'Já existe uma conta com este e-mail.',
  'Email not confirmed': 'Confirme o e-mail antes de entrar.',
  'Password should be at least 6 characters.':
    'A senha precisa ter ao menos 6 caracteres.',
};

function translate(message: string): string {
  return MESSAGES[message] ?? message;
}

export function useUser(): UseQueryResult<User | null, Error> {
  return useQuery({
    queryKey: authKeys.user,
    // getUser() confere o token com o servidor do Supabase, em vez de confiar
    // no que está guardado no cookie.
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();

      // Sem sessão não é erro: é só alguém deslogado.
      if (error) {
        return null;
      }

      return data.user;
    },
  });
}

export function useSignIn(): UseMutationResult<User, Error, Credentials> {
  return useMutation({
    mutationFn: async ({ email, password }: Credentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(translate(error.message));
      }

      return data.user;
    },
  });
}

export function useSignUp(): UseMutationResult<User | null, Error, Credentials> {
  return useMutation({
    mutationFn: async ({ email, password }: Credentials) => {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        throw new Error(translate(error.message));
      }

      // Com `enable_confirmations = false` (padrão local) a sessão já vem
      // junto e a pessoa entra direto. Com confirmação ligada, `session` vem
      // nula e seria preciso passar pelo e-mail antes.
      return data.user;
    },
  });
}

export function useSignOut(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(translate(error.message));
      }
    },
    // Esvaziar o cache é parte do logout: a carteira em memória é de quem
    // acabou de sair, e não pode aparecer para o próximo login.
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
