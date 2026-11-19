import { expect, test } from '@playwright/test';
import { DEMO_USER, signIn, signOut } from './helpers';

test.describe('autenticação', () => {
  test('a landing é pública e convida a entrar', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /Seus investimentos em um lugar só/ }),
    ).toBeVisible();
    // Os CTAs são <a> com role="button" (Button + render={<Link/>} do Base UI).
    await expect(page.getByRole('button', { name: 'Criar conta' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' }).first()).toBeVisible();
  });

  test('rota protegida manda para o login e volta depois de entrar', async ({ page }) => {
    await page.goto('/investments');

    // O proxy guarda o destino no `next`.
    await expect(page).toHaveURL('/login?next=%2Finvestments');

    await page.getByLabel('E-mail').fill(DEMO_USER.email);
    await page.getByLabel('Senha').fill(DEMO_USER.password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/investments');
    await expect(page.getByRole('heading', { name: 'Meus Investimentos' })).toBeVisible();
  });

  test('credencial errada mostra o motivo e não entra', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(DEMO_USER.email);
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('o cadastro valida antes de chamar o servidor', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('E-mail').fill('nao-e-email');
    await page.getByLabel('Senha', { exact: true }).fill('123');
    await page.getByLabel('Confirmar senha').fill('456');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
    await expect(page.getByText('A senha precisa ter ao menos 6 caracteres.')).toBeVisible();
    await expect(page.getByText('As senhas não conferem.')).toBeVisible();
    await expect(page).toHaveURL('/signup');
  });

  test('sair devolve para a landing e fecha as rotas de novo', async ({ page }) => {
    await signIn(page);
    await signOut(page);

    await expect(page).toHaveURL('/');

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
