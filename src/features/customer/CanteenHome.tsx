import { Link } from 'react-router-dom'

import { StatusBadge } from '../../components/ui'
import type { CanteenInfo } from '../../lib/canteens'

interface CanteenHomeProps {
  canteens: CanteenInfo[]
  userName: string
  cartCountByCanteen: Record<string, number>
}

// Home de descoberta do marketplace: onde vai ser o lanche de hoje?
export function CanteenHome({ canteens, userName, cartCountByCanteen }: CanteenHomeProps) {
  const shortName = userName.trim().split(/\s+/)[0] || 'Cliente'

  return (
    <section className="mx-auto max-w-2xl px-4 py-5 pb-24 sm:px-5 sm:py-7 sm:pb-8">
      <h1 className="font-display text-2xl tracking-tight text-brand-ink">
        Ola, {shortName} — onde vai ser o lanche de hoje?
      </h1>
      <p className="mt-1 text-sm text-brand-muted">
        Peca agora e retire no intervalo, sem fila.
      </p>

      <p className="mb-2 mt-6 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
        Cantinas do campus
      </p>

      <div className="grid gap-2.5">
        {canteens.map((canteen) => {
          const cartCount = cartCountByCanteen[canteen.id] ?? 0
          const card = (
            <span className="grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 text-left">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[10px] border border-brand-line bg-brand-paper font-display text-2xl text-brand-red">
                {canteen.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base tracking-tight text-brand-ink">
                  {canteen.name}
                </span>
                <span className="block text-xs text-brand-muted">
                  {canteen.location} · preparo {canteen.prepMinutes} min · fila {canteen.queueSize}
                </span>
              </span>
              <StatusBadge tone={canteen.active ? 'success' : 'danger'} className={canteen.active ? '' : '-rotate-3'}>
                {canteen.active ? 'Aberta' : 'Fechada'}
              </StatusBadge>
            </span>
          )

          if (!canteen.active) {
            return (
              <div
                key={canteen.id}
                className="relative rounded-xl border border-brand-line bg-brand-surface px-3.5 py-3 opacity-55"
              >
                {card}
              </div>
            )
          }

          return (
            <Link
              key={canteen.id}
              to={`/cantina/${canteen.slug}`}
              className="relative rounded-xl border border-brand-line bg-brand-surface px-3.5 py-3 transition hover:border-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-2 rounded-full bg-brand-red px-2 py-0.5 font-mono text-[11px] font-bold text-[#FFF6F0]">
                  {cartCount}
                </span>
              ) : null}
              {card}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
