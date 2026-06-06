import { Clock, Minus, Plus, ShoppingBag, WalletCards } from 'lucide-react'

import { Button, Panel, StatusBadge } from '../../components/ui'
import type { CartItemSnapshot, InventoryItem, PaymentMethod, Product } from '../../domain'
import type { StatusTone } from '../../theme/colors'
import { formatCurrency } from '../../utils/format'

interface CustomerOrderStatus {
  title: string
  detail: string
  code?: string
  tone: StatusTone
}

interface CustomerOrderingProps {
  products: Product[]
  inventory: InventoryItem[]
  cartItems: CartItemSnapshot[]
  cartTotalCents: number
  pickupTime: string
  paymentMethod: PaymentMethod
  orderStatus: CustomerOrderStatus
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

export function CustomerOrdering({
  products,
  inventory,
  cartItems,
  cartTotalCents,
  pickupTime,
  paymentMethod,
  orderStatus,
  errorMessage,
  onPickupTimeChange,
  onPaymentMethodChange,
  onAddProduct,
  onUpdateQuantity,
  onCheckout
}: CustomerOrderingProps) {
  const inventoryByProduct = new Map(inventory.map((item) => [item.productId, item]))

  return (
    <section id="cardapio" className="mx-auto grid max-w-7xl gap-5 px-5 py-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <Panel className="overflow-hidden">
          <div className="border-b border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                  Pedido antecipado
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Cardapio para o intervalo
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Escolha seus itens, confirme o pagamento e retire no horario combinado.
                </p>
              </div>
              <StatusBadge tone="info">Retirada organizada</StatusBadge>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            {products.map((product) => {
              const stock = inventoryByProduct.get(product.id)
              const available = stock?.availableQuantity ?? 0
              const stockStatus = stock?.status() ?? 'unavailable'
              const stockTone =
                stockStatus === 'available'
                  ? 'success'
                  : stockStatus === 'low'
                    ? 'warning'
                    : stockStatus === 'critical'
                      ? 'danger'
                      : 'danger'

              return (
                <article
                  key={product.id}
                  className="grid min-h-[200px] gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md sm:grid-cols-[92px_1fr]"
                >
                  <div className="flex h-24 w-full items-center justify-center rounded-lg bg-gradient-to-br from-green-50 via-white to-orange-50 text-4xl sm:h-full">
                    {product.category === 'bebida'
                      ? '🥤'
                      : product.category === 'fruta'
                        ? '🍓'
                        : product.category === 'combo'
                          ? '🥪'
                          : '🍞'}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {categoryLabel[product.category]}
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-slate-950">{product.name}</h2>
                      </div>
                      <p className="shrink-0 text-lg font-bold text-slate-950">
                        {product.priceLabel}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <div>
                        <StatusBadge tone={stockTone}>
                          {stockStatus === 'available'
                            ? 'Disponivel'
                            : stockStatus === 'low'
                              ? 'Poucas unidades'
                              : stockStatus === 'critical'
                                ? 'Quase esgotado'
                                : 'Indisponivel'}
                        </StatusBadge>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {available} unidades disponiveis
                        </p>
                      </div>
                      <Button
                        type="button"
                        disabled={available === 0 || !product.active}
                        onClick={() => onAddProduct(product.id)}
                      >
                        <Plus size={17} aria-hidden="true" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </Panel>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-28 xl:h-fit">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <ShoppingBag size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Carrinho</h2>
              <p className="text-sm text-slate-500">Resumo do pedido</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {cartItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                Escolha itens do cardapio para montar seu pedido.
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.productId} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(item.unitPriceCents)} por unidade
                      </p>
                    </div>
                    <p className="font-bold text-slate-950">{formatCurrency(item.totalCents)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus size={16} aria-hidden="true" />
                    </button>
                    <span className="text-sm font-bold text-slate-700">{item.quantity}</span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Horario de retirada
              <input
                className="min-h-10 rounded-md border border-slate-200 px-3 text-slate-700 outline-none focus:border-blue-500"
                type="time"
                value={pickupTime}
                onChange={(event) => onPickupTimeChange(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Metodo de pagamento
              <select
                className="min-h-10 rounded-md border border-slate-200 px-3 text-slate-700 outline-none focus:border-blue-500"
                value={paymentMethod}
                onChange={(event) => onPaymentMethodChange(event.target.value as PaymentMethod)}
              >
                <option value="pix">PIX</option>
                <option value="card">Cartao</option>
                <option value="cash">Dinheiro na retirada</option>
              </select>
            </label>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <span className="text-sm font-semibold text-slate-600">Total</span>
              <span className="text-2xl font-bold text-slate-950">
                {formatCurrency(cartTotalCents)}
              </span>
            </div>

            {errorMessage ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <Button type="button" disabled={cartItems.length === 0} onClick={onCheckout}>
              <WalletCards size={18} aria-hidden="true" />
              Confirmar pedido
            </Button>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" aria-hidden="true" />
              <div>
                <h2 className="font-bold text-slate-950">Meu pedido</h2>
                <p className="text-sm text-slate-500">Acompanhamento de retirada</p>
              </div>
            </div>
            <StatusBadge tone={orderStatus.tone}>{orderStatus.title}</StatusBadge>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
            <p>{orderStatus.detail}</p>
            {orderStatus.code ? (
              <p className="mt-2 font-semibold">Codigo de retirada: {orderStatus.code}</p>
            ) : null}
          </div>
        </Panel>
      </aside>
    </section>
  )
}
