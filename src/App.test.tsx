import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'
import { demoAdminCredential } from './auth/demoAuth'

// Em modo de teste o Vite define import.meta.env.DEV = true, então a credencial
// de admin de desenvolvimento está sempre disponível aqui.
const adminCredential = demoAdminCredential!

const technicalTerms = [/CRUD/i, /FIFO/i, /Queue/i, /Pilha/i, /ODS/i, /3s/i, /estrutura de dados/i]
const validRa = '12345678-9'
const validCpf = '529.982.247-25'
const validPassword = 'senha1234'

describe('Rapidinha app', () => {
  beforeEach(() => {
    window.localStorage.removeItem('rapidinha-students')
    window.localStorage.removeItem('rapidinha-session')
  })

  it('registers a client, creates an order, and shows the client position', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Nome completo/i), 'Aluno Teste')
    await user.type(screen.getByLabelText(/^RA$/i), validRa)
    await user.type(screen.getByLabelText(/^CPF$/i), validCpf)
    await user.type(screen.getByLabelText(/E-mail/i), 'aluno@escola.com')
    await user.type(screen.getByLabelText(/Senha/i), validPassword)
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))

    expect(
      await screen.findByRole('heading', { name: /Cardapio para o intervalo/i })
    ).toBeInTheDocument()
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
    await user.type(screen.getByLabelText(/^RA$/i), validRa)
    await user.type(screen.getByLabelText(/^CPF$/i), validCpf)
    await user.type(screen.getByLabelText(/E-mail/i), 'luiz@escola.com')
    await user.type(screen.getByLabelText(/Senha/i), validPassword)
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))
    await user.click(screen.getAllByRole('button', { name: /Adicionar/i })[0])
    await user.click(screen.getByRole('button', { name: /Confirmar pedido/i }))

    await user.click(screen.getByRole('button', { name: /Luiz/i }))
    await user.click(screen.getByRole('button', { name: /^Sair$/i }))
    await user.type(screen.getByLabelText(/E-mail/i), adminCredential.email)
    await user.type(screen.getByLabelText(/Senha/i), adminCredential.password)
    await user.click(screen.getByRole('button', { name: /^Entrar$/i }))

    expect(await screen.findByText(/Luiz Gustavo Lorencone Enz/i)).toBeInTheDocument()
    expect(screen.queryByText(/Aluno Rapidinha/i)).not.toBeInTheDocument()
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

  it('opens customer account pages from the profile menu', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Nome completo/i), 'Aluno Conta')
    await user.type(screen.getByLabelText(/^RA$/i), validRa)
    await user.type(screen.getByLabelText(/^CPF$/i), validCpf)
    await user.type(screen.getByLabelText(/E-mail/i), 'conta@escola.com')
    await user.type(screen.getByLabelText(/Senha/i), validPassword)
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))

    await user.click(screen.getByRole('button', { name: /Aluno/i }))
    await user.click(screen.getByRole('link', { name: /Configuracoes/i }))
    expect(screen.getByRole('heading', { name: /Preferencias da conta/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Salvar configuracoes/i }))

    await user.click(screen.getByRole('button', { name: /Aluno/i }))
    await user.click(screen.getByRole('link', { name: /Dados do perfil/i }))
    expect(screen.getByRole('heading', { name: /Informacoes do cliente/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue(validRa)).toBeInTheDocument()
    expect(screen.getByDisplayValue(validCpf)).toBeInTheDocument()
    await user.clear(screen.getByLabelText(/Telefone/i))
    await user.type(screen.getByLabelText(/Telefone/i), '(11) 99999-0000')
    await user.click(screen.getByRole('button', { name: /Salvar perfil/i }))

    await user.click(screen.getByRole('button', { name: /Aluno/i }))
    await user.click(screen.getByRole('link', { name: /Metodos de pagamento/i }))
    expect(screen.getByRole('heading', { name: /Como voce prefere pagar/i })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Nova chave PIX/i), 'conta@escola.com')
    await user.click(screen.getByRole('button', { name: /Adicionar PIX/i }))
    expect(screen.getByText(/PIX salvo/i)).toBeInTheDocument()
  })

  it('requires valid RA and CPF during client registration', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Nome completo/i), 'Aluno Documento')
    await user.type(screen.getByLabelText(/^RA$/i), '123')
    await user.type(screen.getByLabelText(/^CPF$/i), '111.111.111-11')
    await user.type(screen.getByLabelText(/E-mail/i), 'documento@escola.com')
    await user.type(screen.getByLabelText(/Senha/i), validPassword)
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))

    expect(screen.getByText(/Informe um RA com 9 digitos/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Cardapio para o intervalo/i })).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText(/^RA$/i))
    await user.type(screen.getByLabelText(/^RA$/i), validRa)
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))

    expect(screen.getByText(/Informe um CPF valido/i)).toBeInTheDocument()
  })

  it('requires at least 8 password characters during client registration', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Nome completo/i), 'Aluno Senha')
    await user.type(screen.getByLabelText(/^RA$/i), validRa)
    await user.type(screen.getByLabelText(/^CPF$/i), validCpf)
    await user.type(screen.getByLabelText(/E-mail/i), 'senha-curta@escola.com')
    await user.type(screen.getByLabelText(/Senha/i), '1234567')
    await user.click(screen.getByRole('button', { name: /Cadastrar e entrar/i }))

    expect(screen.getByText(/A senha precisa ter pelo menos 8 caracteres/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Cardapio para o intervalo/i })).not.toBeInTheDocument()
  })

  it('asks Google customers to complete RA and CPF before opening the menu', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(
      'rapidinha-session',
      JSON.stringify({
        role: 'student',
        name: 'Aluno Google',
        email: 'google@escola.com'
      })
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /Completar cadastro/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^RA$/i), validRa)
    await user.type(screen.getByLabelText(/^CPF$/i), validCpf)
    await user.click(screen.getByRole('button', { name: /Salvar e acessar/i }))

    expect(
      await screen.findByRole('heading', { name: /Cardapio para o intervalo/i })
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('rapidinha-session')).toContain(validRa)
    expect(window.localStorage.getItem('rapidinha-session')).toContain(validCpf)
  })

  it('opens password recovery from the login page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('link', { name: /Esqueci minha senha/i }))

    expect(screen.getByRole('heading', { name: /Recuperar senha/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar link de recuperacao/i })).toBeInTheDocument()
  })

  it('validates password confirmation before updating a reset password', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/nova-senha']}>
        <App />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/^Nova senha$/i), 'senha1234')
    await user.type(screen.getByLabelText(/Confirmar nova senha/i), 'senha4567')
    await user.click(screen.getByRole('button', { name: /Atualizar senha/i }))

    expect(screen.getByText(/As senhas digitadas nao conferem/i)).toBeInTheDocument()
  })
})
