import { expect, test } from '@playwright/test'

test('student order appears in the management queue', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: /Pedido do aluno e gestao da cantina trabalhando juntos/i
    })
  ).toBeVisible()

  await page.getByRole('button', { name: /Adicionar/i }).first().click()
  await page.getByRole('button', { name: /Confirmar pedido/i }).click()

  await expect(page.getByText(/Fila FIFO/i)).toBeVisible()
  await expect(page.getByText(/Aluno Digital Flavor/i)).toBeVisible()
})

