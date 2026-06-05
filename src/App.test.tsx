import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('Digital Flavor app', () => {
  it('lets a student add an item and send the order to management queue', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: /Pedido do aluno e gestao da cantina trabalhando juntos/i
      })
    ).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /Adicionar/i })[0])
    expect(screen.getByText(/Carrinho do aluno/i)).toBeInTheDocument()
    expect(screen.getAllByText('R$ 12,90').length).toBeGreaterThanOrEqual(2)

    await user.click(screen.getByRole('button', { name: /Confirmar pedido/i }))

    expect(screen.getByText(/Fila FIFO/i)).toBeInTheDocument()
    expect(screen.getByText(/Aluno Digital Flavor/i)).toBeInTheDocument()
  })
})
