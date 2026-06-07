import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Mail,
  Save,
  Settings,
  User
} from 'lucide-react'

import type {
  AuthSession,
  CustomerPreferences,
  CustomerProfileDetails,
  SavedPaymentMethod
} from '../../auth/demoAuth'
import { Button, Panel, StatusBadge } from '../../components/ui'

interface AccountPageProps {
  session: AuthSession
  profile: CustomerProfileDetails
  preferences: CustomerPreferences
  paymentMethods: SavedPaymentMethod[]
  onProfileSave: (profile: CustomerProfileDetails) => void
  onPreferencesSave: (preferences: CustomerPreferences) => void
  onPaymentMethodsSave: (methods: SavedPaymentMethod[]) => void
}

export function AccountSettingsPage({
  preferences,
  onPreferencesSave
}: Pick<AccountPageProps, 'preferences' | 'onPreferencesSave'>) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    onPreferencesSave({
      quickPickup: formData.get('quickPickup') === 'on',
      orderUpdates: formData.get('orderUpdates') === 'on',
      receiptEmail: formData.get('receiptEmail') === 'on',
      defaultPickupTime: String(formData.get('defaultPickupTime') ?? '10:30')
    })
  }

  return (
    <AccountContent
      eyebrow="Configuracoes"
      title="Preferencias da conta"
      description="Defina como o Digital Flavor deve preparar sua experiencia de compra."
      icon={<Settings className="text-blue-700" aria-hidden="true" />}
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Horario padrao de retirada
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="defaultPickupTime"
            type="time"
            defaultValue={preferences.defaultPickupTime}
          />
        </label>

        <div className="grid gap-3">
          <PreferenceToggle
            icon={<CheckCircle2 size={18} aria-hidden="true" />}
            name="quickPickup"
            checked={preferences.quickPickup}
            title="Priorizar retirada rapida"
            detail="Mantem horario e metodo de pagamento sugeridos no carrinho."
          />
          <PreferenceToggle
            icon={<Bell size={18} aria-hidden="true" />}
            name="orderUpdates"
            checked={preferences.orderUpdates}
            title="Receber atualizacoes do pedido"
            detail="Mostra avisos quando o pedido entra em preparo ou fica pronto."
          />
          <PreferenceToggle
            icon={<Mail size={18} aria-hidden="true" />}
            name="receiptEmail"
            checked={preferences.receiptEmail}
            title="Enviar comprovante por e-mail"
            detail="Guarda um resumo da compra para consulta posterior."
          />
        </div>

        <Button type="submit" variant="secondary" className="w-full sm:w-fit">
          <Save size={17} aria-hidden="true" />
          Salvar configuracoes
        </Button>
      </form>
    </AccountContent>
  )
}

export function ProfileDetailsPage({
  profile,
  onProfileSave
}: Pick<AccountPageProps, 'profile' | 'onProfileSave'>) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    onProfileSave({
      name: String(formData.get('name') ?? profile.name),
      email: profile.email,
      phone: String(formData.get('phone') ?? ''),
      classroom: String(formData.get('classroom') ?? ''),
      shift: String(formData.get('shift') ?? 'manha') as CustomerProfileDetails['shift']
    })
  }

  return (
    <AccountContent
      eyebrow="Dados do perfil"
      title="Informacoes do cliente"
      description="Mantenha seus dados atualizados para a cantina identificar seu pedido."
      icon={<User className="text-green-600" aria-hidden="true" />}
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
          Nome completo
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="name"
            defaultValue={profile.name}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          E-mail
          <input
            className="min-h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-500 outline-none"
            value={profile.email}
            readOnly
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Telefone
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="phone"
            defaultValue={profile.phone}
            placeholder="(00) 00000-0000"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Turma
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="classroom"
            defaultValue={profile.classroom}
            placeholder="Ex.: 3A"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Periodo
          <select
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="shift"
            defaultValue={profile.shift}
          >
            <option value="manha">Manha</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
          </select>
        </label>
        <Button type="submit" variant="secondary" className="w-full sm:col-span-2 sm:w-fit">
          <Save size={17} aria-hidden="true" />
          Salvar perfil
        </Button>
      </form>
    </AccountContent>
  )
}

export function PaymentMethodsPage({
  paymentMethods,
  onPaymentMethodsSave
}: Pick<AccountPageProps, 'paymentMethods' | 'onPaymentMethodsSave'>) {
  function makePreferred(methodId: string) {
    onPaymentMethodsSave(
      paymentMethods.map((method) => ({
        ...method,
        preferred: method.id === methodId
      }))
    )
  }

  function addPixMethod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const pixKey = String(formData.get('pixKey') ?? '').trim()

    if (!pixKey) {
      return
    }

    onPaymentMethodsSave([
      ...paymentMethods.map((method) => ({ ...method, preferred: false })),
      {
        id: `pix-${Date.now()}`,
        type: 'pix',
        label: 'PIX salvo',
        detail: pixKey,
        preferred: true
      }
    ])
    form.reset()
  }

  return (
    <AccountContent
      eyebrow="Metodos de pagamento"
      title="Como voce prefere pagar"
      description="Escolha o metodo padrao para acelerar a confirmacao do pedido."
      icon={<CreditCard className="text-orange-600" aria-hidden="true" />}
    >
      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <article
            key={method.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-950">{method.label}</h3>
                {method.preferred ? <StatusBadge tone="success">Padrao</StatusBadge> : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">{method.detail}</p>
            </div>
            <Button
              type="button"
              variant={method.preferred ? 'quiet' : 'secondary'}
              className="w-full sm:w-auto"
              disabled={method.preferred}
              onClick={() => makePreferred(method.id)}
            >
              Usar como padrao
            </Button>
          </article>
        ))}
      </div>

      <form className="mt-5 grid gap-3 rounded-lg border border-dashed border-slate-300 p-4" onSubmit={addPixMethod}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Nova chave PIX
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            name="pixKey"
            placeholder="E-mail, telefone ou chave aleatoria"
          />
        </label>
        <Button type="submit" className="w-full sm:w-fit">
          Adicionar PIX
        </Button>
      </form>
    </AccountContent>
  )
}

function AccountContent({
  eyebrow,
  title,
  description,
  icon,
  children
}: {
  eyebrow: string
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-4 sm:px-5 sm:py-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{eyebrow}</p>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <Link
          className="inline-flex w-fit rounded-md bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700 underline-offset-2 hover:bg-orange-100 sm:bg-transparent sm:px-0 sm:py-0 sm:text-orange-600 sm:underline"
          to="/"
        >
          Voltar ao cardapio
        </Link>
      </div>

      <Panel className="p-4 sm:p-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200 sm:mb-5">
          {icon}
        </div>
        {children}
      </Panel>
    </section>
  )
}

function PreferenceToggle({
  name,
  checked,
  title,
  detail,
  icon
}: {
  name: string
  checked: boolean
  title: string
  detail: string
  icon: ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 sm:p-4">
      <span className="mt-1 text-blue-700">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-slate-950">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500">{detail}</span>
      </span>
      <input
        className="mt-1 h-5 w-5 accent-blue-600"
        type="checkbox"
        name={name}
        defaultChecked={checked}
      />
    </label>
  )
}
