import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'
import { adminCredential } from './auth/demoAuth'

const technicalTerms = [/CRUD/i, /FIFO/i, /Queue/i, /Pilha/i, /ODS/i, /3s/i, /estrutura de dados/i]

describe('Digital Flavor app', () => {
  beforeEach(() => {
    window.localStorage.removeItem('digital-flavor-students')
    window.localStorage.removeItem('digital-flavor-session')
  })

  it('registers a client, creates an order, and shows the client position', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Nome completo/i), 'Aluno Teste')
    await user.type(screen.getByLabelText(/E-mail/i), 'aluno@escola.com')
    await user.type(screen.getByLabelText(/Senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))

    expect(screen.getByRole('heading', { name: /Cardapio para o intervalo/i })).toBeInTheDocument()
    technicalTerms.forEach((term) => {
      expect(screen.queryByText(term)).not.toBeInTheDocument()
    })

    await user.click(screen.getAllByRole('button', { name: /Adicionar/i })[0])
    expect(screen.getByText(/Carrinho/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Confirmar pedido/i }))

    expect(screen.getByText(/Sua posicao: 4/i)).toBeInTheDocument()
    expect(screen.getByText(/Codigo de retirada/i)).toBeInTheDocument()
  })

  it('shows the real client name in the admin order list', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Nome completo/i), 'Luiz Gustavo Lorencone Enz')
    await user.type(screen.getByLabelText(/E-mail/i), 'luiz@escola.com')
    await user.type(screen.getByLabelText(/Senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))
    await user.click(screen.getAllByRole('button', { name: /Adicionar/i })[0])
    await user.click(screen.getByRole('button', { name: /Confirmar pedido/i }))

    await user.click(screen.getByRole('button', { name: /Luiz/i }))
    await user.click(screen.getByRole('button', { name: /^Sair$/i }))
    await user.type(screen.getByLabelText(/E-mail/i), adminCredential.email)
    await user.type(screen.getByLabelText(/Senha/i), adminCredential.password)
    await user.click(screen.getByRole('button', { name: /^Entrar$/i }))

    expect(screen.getByText(/Luiz Gustavo Lorencone Enz/i)).toBeInTheDocument()
    expect(screen.queryByText(/Aluno Digital Flavor/i)).not.toBeInTheDocument()
  })

  it('keeps called orders visible and marks the selected order as ready', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/E-mail/i), adminCredential.email)
    await user.type(screen.getByLabelText(/Senha/i), adminCredential.password)
    await user.click(screen.getByRole('button', { name: /^Entrar$/i }))

    expect(screen.getByRole('button', { name: /^Pedidos$/i })).toBeInTheDocument()
    technicalTerms.forEach((term) => {
      expect(screen.queryByText(term)).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Chamar proximo/i }))
    await user.click(screen.getByRole('button', { name: /Chamar proximo/i }))

    expect(screen.getByText(/Marina Alves/i)).toBeInTheDocument()
    expect(screen.getByText(/Pedro Lima/i)).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /Marcar pronto/i })[0])

    expect(screen.getAllByText(/Pronto/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Pedro Lima/i)).toBeInTheDocument()
  })

  it('lets admin adjust stock, price, and product availability', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/E-mail/i), adminCredential.email)
    await user.type(screen.getByLabelText(/Senha/i), adminCredential.password)
    await user.click(screen.getByRole('button', { name: /^Entrar$/i }))
    await user.click(screen.getByRole('button', { name: /Produtos/i }))

    const quantityInput = screen.getByLabelText(/Quantidade de Sanduiche natural/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '3')
    await user.click(screen.getAllByRole('button', { name: /Adicionar/i })[0])

    expect(screen.getByText('31')).toBeInTheDocument()

    const priceInput = screen.getByLabelText(/Preco de Sanduiche natural/i)
    await user.clear(priceInput)
    await user.type(priceInput, '15,00')
    await user.click(screen.getAllByRole('button', { name: /Salvar/i })[0])

    expect(priceInput).toHaveValue('15,00')

    await user.click(screen.getAllByRole('button', { name: /Pausar/i })[0])
    expect(screen.getAllByText(/Pausado/i).length).toBeGreaterThanOrEqual(1)

    await user.click(screen.getByRole('button', { name: /Disponivel/i }))
    expect(screen.getAllByText(/No cardapio/i).length).toBeGreaterThanOrEqual(1)
  }, 10000)
})
