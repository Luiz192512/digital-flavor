import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'
import { adminCredential } from './auth/demoAuth'

describe('Digital Flavor app', () => {
  beforeEach(() => {
    window.localStorage.removeItem('digital-flavor-students')
    window.localStorage.removeItem('digital-flavor-session')
  })

  it('registers a student and keeps the student page at the root route', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Nome do aluno/i), 'Aluno Teste')
    await user.type(screen.getByLabelText(/E-mail/i), 'aluno@escola.com')
    await user.type(screen.getByLabelText(/Senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))

    expect(
      screen.getByRole('heading', {
        name: /Pedido do aluno e gestao da cantina trabalhando juntos/i
      })
    ).toBeInTheDocument()
    expect(screen.queryByText('/aluno')).not.toBeInTheDocument()
    expect(screen.queryByText('/admin')).not.toBeInTheDocument()
    expect(screen.queryByText(/Vendas do dia/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Verde para sustentabilidade/i)).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /Adicionar/i })[0])
    expect(screen.getByText(/Carrinho do aluno/i)).toBeInTheDocument()
    expect(screen.getAllByText('R$ 12,90').length).toBeGreaterThanOrEqual(2)

    await user.click(screen.getByRole('button', { name: /Confirmar pedido/i }))

    expect(screen.getByText(/Pedido criado com codigo/i)).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /Preparo por ordem de chegada/i })
    ).not.toBeInTheDocument()
  })

  it('sends the admin login to the admin route screen', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/E-mail/i), adminCredential.email)
    await user.type(screen.getByLabelText(/Senha/i), adminCredential.password)
    await user.click(screen.getByRole('button', { name: /^Entrar$/i }))

    expect(screen.getByText(/Fila FIFO/i)).toBeInTheDocument()
    expect(screen.getByText(/Vendas do dia/i)).toBeInTheDocument()
    expect(screen.queryByText(/Verde para sustentabilidade/i)).not.toBeInTheDocument()
    expect(screen.queryByText('/aluno')).not.toBeInTheDocument()
    expect(screen.getAllByText('/admin')).toHaveLength(1)
  })
})
