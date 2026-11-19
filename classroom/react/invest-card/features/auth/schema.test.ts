import { describe, expect, it } from 'vitest';
import { authSchema, emptyAuthForm } from '@/features/auth/schema';

const valid = { email: 'demo@investcard.dev', password: 'demo1234' };

describe('authSchema', () => {
  it('aceita e-mail e senha válidos no login', () => {
    const result = authSchema(false).safeParse({ ...emptyAuthForm, ...valid });

    expect(result.success).toBe(true);
  });

  it('recusa e-mail inválido', () => {
    const result = authSchema(false).safeParse({ ...emptyAuthForm, ...valid, email: 'arroba.com' });

    expect(result.success).toBe(false);
  });

  it('exige senha de ao menos 6 caracteres', () => {
    const result = authSchema(false).safeParse({ ...emptyAuthForm, ...valid, password: '123' });

    expect(result.error?.issues[0].message).toMatch(/ao menos 6/);
  });

  it('no cadastro, cobra a confirmação igual', () => {
    const result = authSchema(true).safeParse({ ...valid, confirmation: 'outra-coisa' });

    expect(result.error?.issues[0]).toMatchObject({
      message: 'As senhas não conferem.',
      path: ['confirmation'],
    });
  });

  it('no login, a confirmação não é cobrada', () => {
    // O campo nem é renderizado ali, então chega vazio.
    const result = authSchema(false).safeParse({ ...valid, confirmation: '' });

    expect(result.success).toBe(true);
  });
});
