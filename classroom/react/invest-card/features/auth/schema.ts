import { z } from 'zod';

/**
 * As regras do login e do cadastro. A confirmação de senha só é cobrada no
 * cadastro, então o schema recebe o modo — o formato dos campos continua o
 * mesmo nos dois, o que mantém um tipo só para o formulário.
 */
export function authSchema(isSignUp: boolean) {
  return z
    .object({
      email: z.email({ error: 'Informe um e-mail válido.' }),
      password: z
        .string()
        .min(6, { error: 'A senha precisa ter ao menos 6 caracteres.' }),
      confirmation: z.string(),
    })
    .refine((values) => !isSignUp || values.password === values.confirmation, {
      error: 'As senhas não conferem.',
      path: ['confirmation'],
    });
}

export type AuthFormValues = z.infer<ReturnType<typeof authSchema>>;

export const emptyAuthForm: AuthFormValues = {
  email: '',
  password: '',
  confirmation: '',
};
