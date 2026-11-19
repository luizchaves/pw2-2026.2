import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers';

// Nome único por execução: os testes escrevem no banco local de verdade, e
// uma rodada não pode esbarrar no que a anterior deixou.
const ASSET = `E2E ${Date.now()}`;

async function openNewInvestmentForm(page: Page) {
  await page.goto('/investments');
  await page.getByRole('button', { name: 'Adicionar investimento' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function selectOption(page: Page, field: string, option: string) {
  await page.getByRole('combobox', { name: field }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test.describe('carteira', () => {
  test('lista os investimentos do seed', async ({ page }) => {
    await page.goto('/investments');

    await expect(page.getByRole('heading', { name: 'PETR4' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tesouro Selic 2029' })).toBeVisible();
    // Renda fixa mostra a remuneração no lugar da cotação.
    await expect(page.getByText('Rende 100% Selic')).toBeVisible();
  });

  test('cadastra, edita e remove um investimento', async ({ page }) => {
    await openNewInvestmentForm(page);

    await page.getByLabel('Nome').fill(ASSET);
    await page.getByLabel('Emissor').fill('Tesouro Direto');
    await selectOption(page, 'Tipo', 'Tesouro Direto');
    await selectOption(page, 'Categoria', 'Renda Fixa');
    await page.getByLabel('Valor investido').fill('1.000,00');
    await page.getByLabel('Valor atual').fill('1.100,00');
    await page.getByLabel('Indexador (opcional)').fill('100% Selic');
    await page.getByRole('button', { name: 'Adicionar' }).click();

    const card = page.getByRole('article').filter({ hasText: ASSET });

    await expect(card).toBeVisible();
    await expect(card).toContainText('R$ 1.100,00');
    // Performance não é digitada: sai de (atual - investido) / investido.
    await expect(card).toContainText('+10,00%');
    await expect(card).toContainText('Rende 100% Selic');

    // --- edição ---
    await card.getByRole('button', { name: `Editar ${ASSET}` }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel('Valor investido')).toHaveValue('1.000,00');

    await page.getByLabel('Valor atual').fill('900,00');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(card).toContainText('R$ 900,00');
    await expect(card).toContainText('-10,00%');

    // --- remoção ---
    await card.getByRole('button', { name: `Remover ${ASSET}` }).click();
    await page.getByRole('button', { name: 'Remover', exact: true }).click();

    await expect(card).toHaveCount(0);
  });

  test('o formulário barra o que o banco recusaria', async ({ page }) => {
    await openNewInvestmentForm(page);

    await page.getByLabel('Ticker (opcional)').fill('PETR4');
    await page.getByLabel('Indexador (opcional)').fill('100% Selic');
    await page.getByRole('button', { name: 'Adicionar' }).click();

    await expect(
      page.getByText('Informe a quantidade para poder cotar o ticker.'),
    ).toBeVisible();
    await expect(
      page.getByText('Ativo com ticker é cotado pelo mercado: deixe o indexador vazio.'),
    ).toBeVisible();
    // Nada foi salvo: o dialog continua aberto.
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('esconder valores vale para a carteira e o dashboard', async ({ page }) => {
    await page.goto('/investments');
    await page.getByRole('button', { name: 'Ocultar valores' }).click();

    await expect(page.getByText('R$ ****').first()).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByText('R$ ****').first()).toBeVisible();
  });
});

test.describe('dashboard', () => {
  test('consolida a mesma carteira', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Patrimônio')).toBeVisible();
    // Sem contagem exata: o banco local também recebe o que se cadastra à mão.
    await expect(page.getByText(/\d+ ativos na carteira/)).toBeVisible();
    await expect(page.getByText('Alocação por categoria')).toBeVisible();
  });
});
