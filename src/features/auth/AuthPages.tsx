import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Chrome, Loader2, LockKeyhole, UserPlus, Utensils } from 'lucide-react'

import { Button, Panel, StatusBadge } from '../../components/ui'
import { formatCpf, formatStudentRa } from '../../utils/documents'

interface LoginPageProps {
  errorMessage?: string
  onLogin: (email: string, password: string) => void
  onGoogleLogin: () => void
}

interface RegisterPageProps {
  errorMessage?: string
  onRegister: (
    name: string,
    email: string,
    password: string,
    studentRa: string,
    cpf: string
  ) => void
  onGoogleLogin: () => void
}

interface CompleteRegistrationPageProps {
  errorMessage?: string
  userName: string
  onCompleteRegistration: (studentRa: string, cpf: string) => void
  onLogout: () => void
}

interface ForgotPasswordPageProps {
  errorMessage?: string
  successMessage?: string
  onPasswordResetRequest: (email: string) => void
}

interface UpdatePasswordPageProps {
  errorMessage?: string
  successMessage?: string
  onPasswordUpdate: (password: string, confirmation: string) => void
}

export function LoginPage({ errorMessage, onLogin, onGoogleLogin }: LoginPageProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onLogin(String(formData.get('email') ?? ''), String(formData.get('password') ?? ''))
  }

  return (
    <AuthLayout
      title="Entrar no Digital Flavor"
      description="Acesse sua conta para comprar no intervalo ou administrar a cantina."
    >
      <Button type="button" variant="quiet" className="mb-4 w-full" onClick={onGoogleLogin}>
        <Chrome size={18} aria-hidden="true" />
        Entrar com Google
      </Button>

      <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        ou entre com e-mail
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          E-mail
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu-email@escola.com"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          <span className="flex items-center justify-between gap-3">
            Senha
            <Link className="text-xs font-bold text-orange-600 underline" to="/recuperar-senha">
              Esqueci minha senha
            </Link>
          </span>
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
          />
        </label>

        {errorMessage ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {errorMessage}{' '}
            <Link className="underline" to="/cadastro">
              Criar conta
            </Link>
          </div>
        ) : null}

        <Button type="submit" variant="secondary">
          <LockKeyhole size={18} aria-hidden="true" />
          Entrar
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Ainda nao possui cadastro?{' '}
        <Link className="font-bold text-orange-600 underline" to="/cadastro">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}

export function RegisterPage({ errorMessage, onRegister, onGoogleLogin }: RegisterPageProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onRegister(
      String(formData.get('name') ?? ''),
      String(formData.get('email') ?? ''),
      String(formData.get('password') ?? ''),
      String(formData.get('studentRa') ?? ''),
      String(formData.get('cpf') ?? '')
    )
  }

  return (
    <AuthLayout
      title="Criar conta"
      description="Cadastre-se para montar pedidos, escolher horario de retirada e acompanhar o atendimento."
    >
      <Button type="button" variant="quiet" className="mb-4 w-full" onClick={onGoogleLogin}>
        <Chrome size={18} aria-hidden="true" />
        Cadastrar com Google
      </Button>

      <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        ou preencha seus dados
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Nome completo
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="name"
            autoComplete="name"
            placeholder="Nome completo"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          RA
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="studentRa"
            inputMode="numeric"
            autoComplete="off"
            placeholder="00000000-0"
            maxLength={10}
            onInput={(event) => {
              event.currentTarget.value = formatStudentRa(event.currentTarget.value)
            }}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          CPF
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="cpf"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            maxLength={14}
            onInput={(event) => {
              event.currentTarget.value = formatCpf(event.currentTarget.value)
            }}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          E-mail
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="aluno@escola.com"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Senha
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Minimo 8 caracteres"
            required
          />
        </label>

        {errorMessage ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit">
          <UserPlus size={18} aria-hidden="true" />
          Cadastrar e entrar
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Ja possui conta?{' '}
        <Link className="font-bold text-blue-700 underline" to="/login">
          Voltar para login
        </Link>
      </p>
    </AuthLayout>
  )
}

export function CompleteRegistrationPage({
  errorMessage,
  userName,
  onCompleteRegistration,
  onLogout
}: CompleteRegistrationPageProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    onCompleteRegistration(
      String(formData.get('studentRa') ?? ''),
      String(formData.get('cpf') ?? '')
    )
  }

  return (
    <AuthLayout
      title="Completar cadastro"
      description={`Informe RA e CPF para liberar o cardapio, ${userName.split(' ')[0] || 'cliente'}.`}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          RA
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="studentRa"
            inputMode="numeric"
            autoComplete="off"
            placeholder="00000000-0"
            maxLength={10}
            onInput={(event) => {
              event.currentTarget.value = formatStudentRa(event.currentTarget.value)
            }}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          CPF
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="cpf"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            maxLength={14}
            onInput={(event) => {
              event.currentTarget.value = formatCpf(event.currentTarget.value)
            }}
            required
          />
        </label>

        {errorMessage ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" variant="secondary">
          Salvar e acessar
        </Button>
      </form>

      <button
        type="button"
        className="mt-5 w-full text-center text-sm font-bold text-slate-500 underline"
        onClick={onLogout}
      >
        Sair e trocar conta
      </button>
    </AuthLayout>
  )
}

export function ForgotPasswordPage({
  errorMessage,
  successMessage,
  onPasswordResetRequest
}: ForgotPasswordPageProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onPasswordResetRequest(String(formData.get('email') ?? ''))
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      description="Informe seu e-mail de cliente para receber o link de redefinicao."
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          E-mail
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu-email@escola.com"
            required
          />
        </label>

        {successMessage ? (
          <div className="rounded-md bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" variant="secondary">
          Enviar link de recuperacao
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Lembrou a senha?{' '}
        <Link className="font-bold text-blue-700 underline" to="/login">
          Voltar para login
        </Link>
      </p>
    </AuthLayout>
  )
}

export function UpdatePasswordPage({
  errorMessage,
  successMessage,
  onPasswordUpdate
}: UpdatePasswordPageProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onPasswordUpdate(
      String(formData.get('password') ?? ''),
      String(formData.get('confirmation') ?? '')
    )
  }

  return (
    <AuthLayout
      title="Definir nova senha"
      description="Crie uma senha nova para voltar a acessar seus pedidos com seguranca."
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Nova senha
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Minimo 8 caracteres"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Confirmar nova senha
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Digite novamente"
            required
          />
        </label>

        {successMessage ? (
          <div className="rounded-md bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" variant="secondary">
          Atualizar senha
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Ja esta tudo certo?{' '}
        <Link className="font-bold text-orange-600 underline" to="/">
          Ir para o cardapio
        </Link>
      </p>
    </AuthLayout>
  )
}

export function OAuthCallbackPage({ errorMessage }: { errorMessage?: string }) {
  return (
    <AuthLayout
      title="Conectando sua conta"
      description="Estamos finalizando seu acesso para abrir o Digital Flavor."
    >
      {errorMessage ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-950">
          <Loader2 className="animate-spin text-blue-700" size={20} aria-hidden="true" />
          Aguarde um instante.
        </div>
      )}
    </AuthLayout>
  )
}

function AuthLayout({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 text-slate-950 sm:px-5 sm:py-8">
      <Panel className="mx-auto flex max-w-5xl flex-col overflow-hidden lg:grid lg:grid-cols-[0.95fr_1.05fr]">
        <section className="order-2 flex min-h-0 flex-col gap-5 bg-gradient-to-br from-green-700 via-green-600 to-blue-700 p-5 text-white sm:p-6 lg:order-none lg:min-h-[620px] lg:justify-between lg:p-8">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25 lg:h-12 lg:w-12">
              <Utensils size={22} aria-hidden="true" />
            </div>
            <h1 className="mt-4 max-w-md text-2xl font-bold tracking-tight lg:mt-8 lg:text-4xl">
              Digital Flavor
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-green-50 lg:mt-4 lg:text-lg lg:leading-8">
              Pedido antecipado para retirar no intervalo, com controle simples de
              produtos, precos e atendimento da cantina.
            </p>
          </div>
          <div className="grid gap-2 text-xs text-green-50 sm:text-sm lg:gap-3">
            <p>Compra rapida para quem quer evitar espera.</p>
            <p>Painel de produtos e pedidos para a equipe.</p>
            <p>Status claro do pedido ate a retirada.</p>
          </div>
        </section>

        <section className="order-1 flex min-h-0 items-center p-5 sm:p-8 lg:order-none lg:min-h-[620px] lg:p-10">
          <div className="w-full">
            <StatusBadge tone="info">Acesso por perfil</StatusBadge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-5 sm:mt-7">{children}</div>
          </div>
        </section>
      </Panel>
    </main>
  )
}
