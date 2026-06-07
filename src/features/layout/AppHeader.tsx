import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  CreditCard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  User,
  UserCircle,
  Utensils
} from 'lucide-react'

import { Button, StatusBadge } from '../../components/ui'

export type HeaderRole = 'student' | 'admin'

interface AppHeaderProps {
  role: HeaderRole
  cartItems: number
  queueLabel: string
  userName: string
  onLogout: () => void
}

export function AppHeader({
  role,
  cartItems,
  queueLabel,
  userName,
  onLogout
}: AppHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const shortName = userName.trim().split(/\s+/)[0] || 'Cliente'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-4 lg:flex lg:justify-between">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white sm:h-11 sm:w-11">
            <Utensils size={20} className="sm:size-[22px]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">
              Digital Flavor
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              Pedidos e retirada
            </p>
          </div>
        </div>

        <div className="justify-self-end">
          <StatusBadge tone={role === 'admin' ? 'info' : 'success'}>
            {role === 'admin' ? '/admin' : 'Cliente'}
          </StatusBadge>
        </div>

        <label className="col-span-2 flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 lg:col-span-1 lg:min-w-[360px] lg:flex-1">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Buscar</span>
          <input
            className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Buscar produto ou pedido"
          />
        </label>

        <div className="col-span-2 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 lg:col-span-1 lg:flex lg:flex-nowrap lg:justify-end">
          {role === 'student' ? (
            <div className="relative min-w-0">
              <button
                type="button"
                className="flex min-h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:w-auto sm:max-w-40 sm:justify-start sm:gap-2 sm:px-3"
                onClick={() => setProfileOpen((current) => !current)}
                aria-expanded={profileOpen}
                aria-label={`Abrir perfil de ${userName}`}
              >
                <UserCircle size={18} className="shrink-0 text-orange-600" aria-hidden="true" />
                <span className="hidden truncate sm:inline">{shortName}</span>
                <ChevronDown size={15} className="hidden shrink-0 sm:block" aria-hidden="true" />
              </button>

              {profileOpen ? (
                <div className="absolute left-0 z-40 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/80 sm:left-auto sm:right-0">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-bold text-slate-950">{userName}</p>
                    <p className="text-xs text-slate-500">Perfil do cliente</p>
                  </div>
                  <Link
                    className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    to="/configuracoes"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} aria-hidden="true" />
                    Configuracoes
                  </Link>
                  <Link
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    to="/perfil"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={16} aria-hidden="true" />
                    Dados do perfil
                  </Link>
                  <Link
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    to="/pagamentos"
                    onClick={() => setProfileOpen(false)}
                  >
                    <CreditCard size={16} aria-hidden="true" />
                    Metodos de pagamento
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                    onClick={onLogout}
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-700 lg:max-w-[11rem]">
              <ShieldCheck size={17} className="shrink-0 text-blue-700" aria-hidden="true" />
              <span className="truncate">Administrador</span>
            </div>
          )}
          <Button type="button" variant="quiet" className="min-w-0 px-2 text-xs sm:px-4 sm:text-sm">
            {queueLabel}
          </Button>
          {role === 'student' ? (
            <Button type="button" variant="primary" className="px-2 text-xs sm:px-4 sm:text-sm">
              <ShoppingCart size={17} aria-hidden="true" />
              <span className="sm:hidden">{cartItems}</span>
              <span className="hidden sm:inline">Pedido {cartItems}</span>
            </Button>
          ) : null}
          {role === 'admin' ? (
            <Button type="button" variant="quiet" className="px-2 text-xs sm:px-4 sm:text-sm" onClick={onLogout}>
              <LogOut size={17} aria-hidden="true" />
              Sair
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
