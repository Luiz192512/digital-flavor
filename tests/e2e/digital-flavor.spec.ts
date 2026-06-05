import { expect, test } from '@playwright/test'

test('student registers and orders from the root page', async ({ page }) => {
  await page.goto('/cadastro')

  await page.getByLabel(/Nome do aluno/i).fill('Aluno E2E')
  await page.getByLabel(/E-mail/i).fill(`aluno-${Date.now()}@escola.com`)
  await page.getByLabel(/Senha/i).fill('senha123')
  await page.getByRole('button', { name: /Cadastrar e entrar/i }).click()

  await expect(
    page.getByRole('heading', {
      name: /Pedido do aluno e gestao da cantina trabalhando juntos/i
    })
  ).toBeVisible()

  await page.getByRole('button', { name: /Adicionar/i }).first().click()
  await page.getByRole('button', { name: /Confirmar pedido/i }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByText('/aluno')).toHaveCount(0)
  await expect(page.getByText('/admin')).toHaveCount(0)
  await expect(page.getByText(/Vendas do dia/i)).toHaveCount(0)
  await expect(page.getByText(/Verde para sustentabilidade/i)).toHaveCount(0)
  await expect(page.getByText(/Pedido criado com codigo/i)).toBeVisible()
})

test('admin login opens the admin page', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/E-mail/i).fill('admin@digitalflavor.com')
  await page.getByLabel(/Senha/i).fill('Admin@2026')
  await page.getByRole('button', { name: /^Entrar$/i }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByText(/Fila FIFO/i)).toBeVisible()
  await expect(page.getByText(/Vendas do dia/i)).toBeVisible()
  await expect(page.getByText(/Verde para sustentabilidade/i)).toHaveCount(0)
  await expect(page.getByText('/aluno')).toHaveCount(0)
  await expect(page.getByText('/admin')).toHaveCount(1)
})
