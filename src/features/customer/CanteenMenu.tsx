import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Ficha } from '../../components/Ficha'
import { Button, Panel, StatusBadge } from '../../components/ui'
import type { CartItemSnapshot, InventoryItem, PaymentMethod, Product } from '../../domain'
import type { CanteenInfo } from '../../lib/canteens'
import type { StatusTone } from '../../theme/colors'
import { formatCurrency } from '../../utils/format'

interface CustomerOrderStatus {
  title: string
  detail: string
  tone: StatusTone
}

// Dados congelados da ficha, definidos no checkout (não mudam com o formulário).
interface OrderTicket {
  code: string
  canteenName: string
  pickupTime: string
  totalCents: number
}

interface CanteenMenuProps {
  canteen: CanteenInfo
  products: Product[]
  inventory: InventoryItem[]
  cartItems: CartItemSnapshot[]
  cartTotalCents: number
  pickupTime: string
  paymentMethod: PaymentMethod
  orderStatus: CustomerOrderStatus
  ticket?: OrderTicket
  submitting?: boolean
  errorMessage?: string
  onPickupTimeChange: (value: string) => void
  onPaymentMethodChange: (value: PaymentMethod) => void
  onAddProduct: (productId: string) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onCheckout: () => void
}

const categoryLabel: Record<Product['category'], string> = {
  lanche: 'Lanches',
  bebida: 'Bebidas',
  fruta: 'Frutas',
  combo: 'Combos'
}

const categoryOrder: Product['category'][] = ['lanche', 'bebida', 'fruta', 'combo']

// Cardápio da cantina no vernáculo de menu: linha pontilhada nome→preço,
// carimbos de status e a comanda ao lado.
export function CanteenMenu({
  canteen,
  products,
  inventory,
  cartItems,
  cartTotalCents,
  pickupTime,
  paymentMethod,
  orderStatus,
  ticket,
  submitting,
  errorMessage,
  onPickupTimeChange,
  onPaymentMethodChange,
  onAddProduct,
  onUpdateQuantity,
  onCheckout
}: CanteenMenuProps) {
  const inventoryByProduct = new Map(inventory.map((item) => [item.productId, item]))
  const byCategory = categoryOrder
    .map((category) => ({
      category,
      items: products.filter((product) => product.category === category)
    }))
    .filter((group) => group.items.length > 0)

  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-4 py-4 pb-24 sm:gap-5 sm:px-5 sm:py-6 sm:pb-8 xl:grid-cols-[1fr_360px]">
      <Panel className="h-fit overflow-hidden">
        <div className="flex items-center gap-3 border-b border-brand-line p-4 sm:p-5">
          <Link
            to="/"
            aria-label="Voltar para as cantinas"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-line text-brand-ink transition hover:border-brand-red hover:text-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            <ArrowLeft size={17} aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-display text-xl tracking-tight text-brand-ink">{canteen.name}</h1>
            <p className="text-xs text-brand-muted">
              {canteen.location} · preparo {canteen.prepMinutes} min · retire no balcao
            </p>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          {byCategory.map((group) => (
            <div key={group.category}>
              <p className="mb-1 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                {categoryLabel[group.category]}
              </p>
              {group.items.map((product) => {
                const stock = inventoryByProduct.get(product.id)
                const available = stock?.availableQuantity ?? 0
                const stockStatus = stock?.status() ?? 'unavailable'
                const esgotado = stockStatus === 'unavailable'

                return (
                  <article
                    key={product.id}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 border-b border-brand-line py-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-baseline gap-2.5">
                      <h2 className="whitespace-nowrap text-[15px] font-semibold text-brand-ink">
                        {product.name}
                      </h2>
                      <span className="pontilhado" aria-hidden="true" />
                    </div>
                    <p className="font-mono text-sm font-semibold tabular-nums text-brand-ink">
                      {product.priceLabel}
                    </p>
                    <p className="col-span-2 max-w-[56ch] text-[13px] leading-5 text-brand-muted">
                      {product.description}
                    </p>
                    <div className="col-span-2 mt-1.5 flex items-center gap-3">
                      <StatusBadge
                        tone={
                          stockStatus === 'available'
                            ? 'success'
                            : stockStatus === 'low'
                              ? 'info'
                              : 'danger'
                        }
                        className={esgotado ? '-rotate-3' : ''}
                      >
                        {stockStatus === 'available'
                          ? 'Disponivel'
                          : stockStatus === 'low'
                            ? 'Poucas unidades'
                            : stockStatus === 'critical'
                              ? 'Quase esgotado'
                              : 'Esgotado'}
                      </StatusBadge>
                      <span className="text-xs tabular-nums text-brand-muted">{available} un.</span>
                      <button
                        type="button"
                        disabled={available === 0 || !product.active}
                        onClick={() => onAddProduct(product.id)}
                        className="ml-auto min-h-8 rounded-md border-[1.5px] border-brand-red px-3.5 text-[13px] font-semibold text-brand-red transition hover:bg-brand-red hover:text-brand-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:cursor-not-allowed disabled:border-brand-line disabled:text-brand-muted disabled:hover:bg-transparent"
                      >
                        Adicionar
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ))}
        </div>
      </Panel>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <Panel className="p-4 sm:p-5">
          <h2 className="font-display text-lg tracking-tight text-brand-ink">Sua comanda</h2>

          <div className="mt-4 space-y-2.5">
            {cartItems.length === 0 ? (
              <div className="rounded-lg border-[1.5px] border-dashed border-brand-line p-5 text-center text-[13px] text-brand-muted">
                Toque em "Adicionar" nos itens do cardapio para montar o pedido.
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-2.5 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`Remover um ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-line text-brand-ink hover:border-brand-red hover:text-brand-red"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span className="w-4 text-center font-semibold tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Adicionar um ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-line text-brand-ink hover:border-brand-red hover:text-brand-red"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="font-mono text-[13px] font-semibold tabular-nums">
                    {formatCurrency(item.totalCents)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 grid gap-2.5 border-t border-brand-line pt-4">
            <label className="grid gap-1 text-xs font-semibold text-brand-muted">
              Horario de retirada
              <input
                className="min-h-10 rounded-md border border-brand-line bg-brand-paper px-3 text-sm text-brand-ink outline-none focus:border-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-red"
                type="time"
                value={pickupTime}
                onChange={(event) => onPickupTimeChange(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-brand-muted">
              Pagamento na retirada
              <select
                className="min-h-10 rounded-md border border-brand-line bg-brand-paper px-3 text-sm text-brand-ink outline-none focus:border-brand-red"
                value={paymentMethod}
                onChange={(event) => onPaymentMethodChange(event.target.value as PaymentMethod)}
              >
                <option value="pix">PIX</option>
                <option value="card">Cartao</option>
                <option value="cash">Dinheiro na retirada</option>
              </select>
            </label>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-semibold text-brand-muted">Total</span>
              <span className="font-display text-2xl tracking-tight text-brand-ink">
                {formatCurrency(cartTotalCents)}
              </span>
            </div>

            {errorMessage ? (
              <p className="rounded-md bg-brand-red-soft px-3 py-2 text-sm font-semibold text-brand-red-dark">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="button"
              disabled={cartItems.length === 0 || submitting}
              onClick={onCheckout}
            >
              {submitting ? 'Confirmando...' : 'Confirmar pedido'}
            </Button>
          </div>
        </Panel>

        {ticket ? (
          <div>
            <Ficha
              code={ticket.code}
              canteenName={ticket.canteenName}
              pickupTime={ticket.pickupTime}
              totalCents={ticket.totalCents}
              statusLabel={orderStatus.title}
              animate
            />
            <p className="mt-2 text-xs text-brand-muted">
              Mostre esta ficha no balcao. {orderStatus.detail}
            </p>
          </div>
        ) : (
          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base tracking-tight text-brand-ink">Meu pedido</h2>
              <StatusBadge tone={orderStatus.tone}>{orderStatus.title}</StatusBadge>
            </div>
            <p className="mt-2 text-[13px] text-brand-muted">{orderStatus.detail}</p>
          </Panel>
        )}
      </aside>
    </section>
  )
}
