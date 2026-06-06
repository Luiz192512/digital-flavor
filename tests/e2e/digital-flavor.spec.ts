import { expect, test } from '@playwright/test'

const technicalTerms = [/CRUD/i, /FIFO/i, /Queue/i, /Pilha/i, /ODS/i, /3s/i, /estrutura de dados/i]

test('client registers, orders, and sees their queue position', async ({ page }) => {
  await page.goto('/cadastro')

  await page.getByLabel(/Nome completo/i).fill('Aluno E2E')
  await page.getByLabel(/E-mail/i).fill(`aluno-${Date.now()}@escola.com`)
  await page.getByLabel(/Senha/i).fill('senha123')
  await page.getByRole('button', { name: /Cadastrar e entrar/i }).click()

  await expect(page.getByRole('heading', { name: /Cardapio para o intervalo/i })).toBeVisible()

  for (const term of technicalTerms) {
    await expect(page.getByText(term)).toHaveCount(0)
  }

  await page.getByRole('button', { name: /Adicionar/i }).first().click()
  await page.getByRole('button', { name: /Confirmar pedido/i }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByText(/Sua posicao: 4/i)).toBeVisible()
  await expect(page.getByText(/Codigo de retirada/i)).toBeVisible()
})

test('admin manages order flow and reports in separate tabs', async ({ page }) => {
  const email = `luiz-${Date.now()}@escola.com`

  await page.goto('/cadastro')
  await page.getByLabel(/Nome completo/i).fill('Luiz Gustavo Lorencone Enz')
  await page.getByLabel(/E-mail/i).fill(email)
  await page.getByLabel(/Senha/i).fill('senha123')
  await page.getByRole('button', { name: /Cadastrar e entrar/i }).click()
  await page.getByRole('button', { name: /Adicionar/i }).first().click()
  await page.getByRole('button', { name: /Confirmar pedido/i }).click()

  await page.getByRole('button', { name: /Luiz/i }).click()
  await page.getByRole('button', { name: /^Sair$/i }).click()
  await page.getByLabel(/E-mail/i).fill('admin@digitalflavor.com')
  await page.getByLabel(/Senha/i).fill('Admin@2026')
  await page.getByRole('button', { name: /^Entrar$/i }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByText(/Luiz Gustavo Lorencone Enz/i)).toBeVisible()

  for (const term of technicalTerms) {
    await expect(page.getByText(term)).toHaveCount(0)
  }

  await page.getByRole('button', { name: /Chamar proximo/i }).click()
  await page.getByRole('button', { name: /Chamar proximo/i }).click()

  await expect(page.getByText(/Marina Alves/i)).toBeVisible()
  await expect(page.getByText(/Pedro Lima/i)).toBeVisible()

  await page.getByRole('button', { name: /Marcar pronto/i }).first().click()
  await expect(page.getByText('Pronto', { exact: true })).toBeVisible()
  await expect(page.getByText(/Pedro Lima/i)).toBeVisible()

  await expect(page.getByText(/Vendas do dia/i)).toHaveCount(0)
  await page.getByRole('button', { name: /Relatorios/i }).click()
  await expect(page.getByText(/Resultado da operacao/i)).toBeVisible()
  await expect(page.getByText(/Vendas do dia/i)).toBeVisible()
  await expect(page.getByText(/Cardapio e estoque/i)).toHaveCount(0)
})
