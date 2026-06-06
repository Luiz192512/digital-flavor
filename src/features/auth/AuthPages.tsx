import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Chrome, Loader2, LockKeyhole, UserPlus, Utensils } from 'lucide-react'

import { Button, Panel, StatusBadge } from '../../components/ui'
import { adminCredential } from '../../auth/demoAuth'

interface LoginPageProps {
  errorMessage?: string
  onLogin: (email: string, password: string) => void
  onGoogleLogin: () => void
}

interface RegisterPageProps {
  errorMessage?: string
  onRegister: (name: string, email: string, password: string) => void
  onGoogleLogin: () => void
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
          Senha
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

      <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
        <p className="font-bold">Acesso administrativo de demonstracao</p>
        <p className="mt-1">E-mail: {adminCredential.email}</p>
        <p>Senha: {adminCredential.password}</p>
      </div>

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
      String(formData.get('password') ?? '')
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
            minLength={6}
            placeholder="Minimo 6 caracteres"
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

export function OAuthCallbackPage() {
  return (
    <AuthLayout
      title="Conectando sua conta"
      description="Estamos finalizando seu acesso para abrir o Digital Flavor."
    >
      <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-950">
        <Loader2 className="animate-spin text-blue-700" size={20} aria-hidden="true" />
        Aguarde um instante.
      </div>
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
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <Panel className="mx-auto grid max-w-5xl overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex min-h-[620px] flex-col justify-between bg-gradient-to-br from-green-700 via-green-600 to-blue-700 p-8 text-white">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
              <Utensils size={25} aria-hidden="true" />
            </div>
            <h1 className="mt-8 max-w-md text-4xl font-bold tracking-tight">
              Digital Flavor
            </h1>
            <p className="mt-4 max-w-md text-lg leading-8 text-green-50">
              Pedido antecipado para retirar no intervalo, com controle simples de
              produtos, precos e atendimento da cantina.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-green-50">
            <p>Compra rapida para quem quer evitar espera.</p>
            <p>Painel de produtos e pedidos para a equipe.</p>
            <p>Status claro do pedido ate a retirada.</p>
          </div>
        </section>

        <section className="flex min-h-[620px] items-center p-6 sm:p-10">
          <div className="w-full">
            <StatusBadge tone="info">Acesso por perfil</StatusBadge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
        </section>
      </Panel>
    </main>
  )
}
