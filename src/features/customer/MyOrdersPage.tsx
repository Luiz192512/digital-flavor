import { useEffect, useState } from 'react'

import { Ficha } from '../../components/Ficha'
import { fetchMyOrders, type MyOrderInfo } from '../../lib/myOrders'

const statusLabel: Record<string, string> = {
  queued: 'Na fila',
  preparing: 'Em preparo',
  ready: 'Pronto para retirar',
  completed: 'Retirado',
  cancelled: 'Cancelado',
  submitted: 'Recebido',
  draft: 'Rascunho'
}

interface MyOrdersPageProps {
  isSupabaseData: boolean
}

// Fichas do usuário (marketplace v3): pedidos reais do banco, mais recentes
// primeiro. No modo demo não há pedidos persistidos.
export function MyOrdersPage({ isSupabaseData }: MyOrdersPageProps) {
  const [orders, setOrders] = useState<MyOrderInfo[]>([])
  const [loading, setLoading] = useState(isSupabaseData)

  useEffect(() => {
    if (!isSupabaseData) {
      return
    }

    let active = true

    fetchMyOrders()
      .then((rows) => {
        if (active) {
          setOrders(rows)
        }
      })
      .catch(() => {
        // Mantém a lista vazia; o usuário pode voltar e tentar de novo.
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [isSupabaseData])

  return (
    <section className="mx-auto grid max-w-2xl gap-3 px-4 py-5 pb-24 sm:px-5 sm:py-7 sm:pb-8">
      <h1 className="font-display text-2xl tracking-tight text-brand-ink">Meus pedidos</h1>

      {loading ? (
        <p className="text-sm text-brand-muted">Carregando suas fichas...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border-[1.5px] border-dashed border-brand-line p-7 text-center text-sm text-brand-muted">
          Suas fichas de retirada aparecem aqui depois do primeiro pedido.
        </div>
      ) : (
        orders.map((order) => (
          <Ficha
            key={order.id}
            code={order.pickupCode}
            canteenName={order.canteenName}
            pickupTime={order.pickupTime}
            totalCents={order.totalCents}
            statusLabel={statusLabel[order.status] ?? order.status}
          />
        ))
      )}
    </section>
  )
}
