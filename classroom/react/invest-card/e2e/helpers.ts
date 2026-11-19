import { expect, type Page } from '@playwright/test';

/** Conta criada pelo seed (`supabase/seed.sql`), só no ambiente local. */
export const DEMO_USER = {
  email: 'demo@investcard.dev',
  password: 'demo1234',
};

export async function signIn(page: Page, user = DEMO_USER) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(user.email);
  await page.getByLabel('Senha').fill(user.password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  // O login termina no dashboard; esperar por ele evita seguir com a próxima
  // ação enquanto a navegação ainda está no ar.
  await expect(page).toHaveURL('/dashboard');
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Abrir menu da conta' }).click();
  await page.getByRole('menuitem', { name: 'Sair' }).click();
}
