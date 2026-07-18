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
  UserCircle
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
    <header className="sticky top-0 z-30 border-b border-brand-line bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-4 lg:flex lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 font-display text-[22px] tracking-tight text-brand-red sm:text-[26px]">
            Rapidinha
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted sm:text-xs">
              Pedidos rapidos na cantina
            </p>
          </div>
        </div>

        <div className="justify-self-end">
          <StatusBadge tone={role === 'admin' ? 'info' : 'success'}>
            {role === 'admin' ? '/admin' : 'Cliente'}
          </StatusBadge>
        </div>

        <label className="col-span-2 flex min-h-10 items-center gap-2 rounded-md border border-brand-line bg-brand-paper px-3 text-sm text-brand-muted lg:col-span-1 lg:min-w-[360px] lg:flex-1">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Buscar</span>
          <input
            className="w-full bg-transparent text-brand-ink outline-none placeholder:text-brand-muted/70"
            placeholder="Buscar produto ou pedido"
          />
        </label>

        <div className="col-span-2 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 lg:col-span-1 lg:flex lg:flex-nowrap lg:justify-end">
          {role === 'student' ? (
            <div className="relative min-w-0">
              <button
                type="button"
                className="flex min-h-10 w-10 items-center justify-center rounded-lg bg-brand-red-soft text-sm font-semibold text-brand-wine transition hover:bg-brand-gold/25 sm:w-auto sm:max-w-40 sm:justify-start sm:gap-2 sm:px-3"
                onClick={() => setProfileOpen((current) => !current)}
                aria-expanded={profileOpen}
                aria-label={`Abrir perfil de ${userName}`}
              >
                <UserCircle size={18} className="shrink-0 text-brand-red" aria-hidden="true" />
                <span className="hidden truncate sm:inline">{shortName}</span>
                <ChevronDown size={15} className="hidden shrink-0 sm:block" aria-hidden="true" />
              </button>

              {profileOpen ? (
                <div className="absolute left-0 z-40 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-brand-line bg-white p-2 shadow-lg shadow-brand-red/10 sm:left-auto sm:right-0">
                  <div className="border-b border-brand-line px-3 py-2">
                    <p className="truncate text-sm font-bold text-brand-ink">{userName}</p>
                    <p className="text-xs text-brand-muted">Perfil do cliente</p>
                  </div>
                  <Link
                    className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-brand-muted hover:bg-brand-paper"
                    to="/configuracoes"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} aria-hidden="true" />
                    Configuracoes
                  </Link>
                  <Link
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-brand-muted hover:bg-brand-paper"
                    to="/perfil"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={16} aria-hidden="true" />
                    Dados do perfil
                  </Link>
                  <Link
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-brand-muted hover:bg-brand-paper"
                    to="/pagamentos"
                    onClick={() => setProfileOpen(false)}
                  >
                    <CreditCard size={16} aria-hidden="true" />
                    Metodos de pagamento
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-brand-red-dark hover:bg-red-50"
                    onClick={onLogout}
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-10 items-center gap-2 rounded-lg bg-brand-paper px-3 text-sm font-semibold text-brand-muted lg:max-w-[11rem]">
              <ShieldCheck size={17} className="shrink-0 text-brand-wine" aria-hidden="true" />
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
