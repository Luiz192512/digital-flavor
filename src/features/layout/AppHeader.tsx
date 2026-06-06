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
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-600 text-white">
              <Utensils size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">Digital Flavor</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pedidos e retirada
              </p>
            </div>
          </div>
          <StatusBadge tone={role === 'admin' ? 'info' : 'success'}>
            {role === 'admin' ? '/admin' : 'Cliente'}
          </StatusBadge>
        </div>

        <div className="flex flex-1 flex-col gap-3 lg:max-w-5xl lg:flex-row lg:items-center">
          <label className="flex min-h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Buscar</span>
            <input
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Buscar produto ou pedido"
            />
          </label>

          {role === 'student' ? (
            <div className="relative">
              <button
                type="button"
                className="flex min-h-10 max-w-40 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                onClick={() => setProfileOpen((current) => !current)}
                aria-expanded={profileOpen}
              >
                <UserCircle size={18} className="text-orange-600" aria-hidden="true" />
                <span className="truncate">{shortName}</span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/80">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-sm font-bold text-slate-950">{userName}</p>
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
            <div className="flex min-h-10 max-w-44 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-700">
              <ShieldCheck size={17} className="text-blue-700" aria-hidden="true" />
              <span className="truncate">Administrador</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="quiet">
            {queueLabel}
          </Button>
          {role === 'student' ? (
            <Button type="button" variant="primary">
              <ShoppingCart size={17} aria-hidden="true" />
              Pedido {cartItems}
            </Button>
          ) : null}
          {role === 'admin' ? (
            <Button type="button" variant="quiet" onClick={onLogout}>
              <LogOut size={17} aria-hidden="true" />
              Sair
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
