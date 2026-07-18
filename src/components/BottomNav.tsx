import { Home, Ticket, UserCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'

const itens = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/pedidos', label: 'Pedidos', icon: Ticket },
  { to: '/perfil', label: 'Perfil', icon: UserCircle }
] as const

// Navegação inferior de app (mobile) do marketplace — some em telas maiores.
export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-brand-line bg-brand-surface sm:hidden">
      {itens.map((item) => {
        const ativo =
          item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)

        return (
          <Link
            key={item.to}
            to={item.to}
            className={clsx(
              'grid justify-items-center gap-0.5 px-1 pb-3 pt-2.5 text-[11.5px] font-semibold tracking-[0.04em]',
              ativo ? 'text-brand-red' : 'text-brand-muted'
            )}
          >
            <item.icon size={18} aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
