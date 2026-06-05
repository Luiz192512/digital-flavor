import type { FormEvent } from 'react'
import { ClipboardList, History, PackagePlus, Plus, RotateCcw, Save } from 'lucide-react'

import { Button, Panel, ProgressBar, StatusBadge } from '../../components/ui'
import type { AdminAction, InventoryItem, Order, Product } from '../../domain'
import { formatCurrency } from '../../utils/format'

interface ManagementWorkspaceProps {
  products: Product[]
  inventory: InventoryItem[]
  queue: Order[]
  activeOrder?: Order
  completedOrders: Order[]
  adminHistory: AdminAction[]
  productDraft: {
    name: string
    price: string
    category: Product['category']
  }
  onProductDraftChange: (draft: {
    name: string
    price: string
    category: Product['category']
  }) => void
  onTakeNextOrder: () => void
  onMarkReady: () => void
  onCompleteActiveOrder: () => void
  onRestock: (productId: string, units: number) => void
  onPriceChange: (productId: string, cents: number) => void
  onDeactivateProduct: (productId: string) => void
  onCreateProduct: () => void
  onUndoLast: () => void
}

export function ManagementWorkspace({
  products,
  inventory,
  queue,
  activeOrder,
  completedOrders,
  adminHistory,
  productDraft,
  onProductDraftChange,
  onTakeNextOrder,
  onMarkReady,
  onCompleteActiveOrder,
  onRestock,
  onPriceChange,
  onDeactivateProduct,
  onCreateProduct,
  onUndoLast
}: ManagementWorkspaceProps) {
  const inventoryByProduct = new Map(inventory.map((item) => [item.productId, item]))
  const salesToday = [...queue, ...completedOrders, ...(activeOrder ? [activeOrder] : [])].reduce(
    (sum, order) => sum + order.totalCents,
    0
  )

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCreateProduct()
  }

  return (
    <section id="gestao" className="mx-auto grid max-w-7xl gap-5 px-5 py-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <Panel className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Fila FIFO
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Preparo por ordem de chegada
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A fila usa a estrutura de dados Queue: o primeiro pedido confirmado e o
                primeiro preparado.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={onTakeNextOrder} disabled={queue.length === 0}>
              <ClipboardList size={18} aria-hidden="true" />
              Chamar proximo
            </Button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">Em preparo</p>
              {activeOrder ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-blue-950">{activeOrder.customerName}</h3>
                      <p className="text-sm text-blue-800">
                        Codigo {activeOrder.pickupCode} - retirada {activeOrder.pickupTime}
                      </p>
                    </div>
                    <StatusBadge tone={activeOrder.status === 'ready' ? 'success' : 'info'}>
                      {activeOrder.status === 'ready' ? 'Pronto' : 'Preparando'}
                    </StatusBadge>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-950">
                    {activeOrder.items.map((item) => (
                      <li key={item.productId} className="flex justify-between gap-3">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <strong>{formatCurrency(item.totalCents)}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="quiet" onClick={onMarkReady}>
                      Marcar pronto
                    </Button>
                    <Button type="button" variant="secondary" onClick={onCompleteActiveOrder}>
                      Entregar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-blue-800">
                  Nenhum pedido em preparo. Chame o primeiro da fila.
                </p>
              )}
            </div>

            <div className="space-y-3">
              {queue.map((order, index) => (
                <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        #{index + 1} na fila
                      </p>
                      <h3 className="font-bold text-slate-950">{order.customerName}</h3>
                      <p className="text-sm text-slate-500">
                        {order.pickupTime} - {order.items.length} itens
                      </p>
                    </div>
                    <StatusBadge tone="warning">{order.pickupCode}</StatusBadge>
                  </div>
                </article>
              ))}
              {queue.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                  Fila vazia no momento.
                </div>
              ) : null}
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                Relatorios
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Indicadores da cantina
              </h2>
            </div>
            <StatusBadge tone="info">99,5% alvo</StatusBadge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Receita simulada</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(salesToday)}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-700">Sobra evitada</p>
              <p className="mt-2 text-2xl font-bold text-green-900">28%</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4">
              <p className="text-sm font-semibold text-orange-700">Itens proximos</p>
              <p className="mt-2 text-2xl font-bold text-orange-900">7</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                Estoque e CRUD
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Produtos controlados por validade
              </h2>
            </div>
            <Button type="button" variant="quiet" onClick={onUndoLast} disabled={adminHistory.length === 0}>
              <RotateCcw size={17} aria-hidden="true" />
              Desfazer
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Produto</th>
                  <th className="px-5 py-3">Preco</th>
                  <th className="px-5 py-3">Disponivel</th>
                  <th className="px-5 py-3">ODS</th>
                  <th className="px-5 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => {
                  const stock = inventoryByProduct.get(product.id)
                  const available = stock?.availableQuantity ?? 0
                  const status = stock?.status() ?? 'unavailable'
                  const tone =
                    status === 'available'
                      ? 'success'
                      : status === 'low'
                        ? 'warning'
                        : status === 'critical'
                          ? 'danger'
                          : 'danger'
                  const nextPrice = product.priceCents + 100

                  return (
                    <tr key={product.id} className={!product.active ? 'bg-slate-50 opacity-60' : 'bg-white'}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.description}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{product.priceLabel}</td>
                      <td className="px-5 py-4">
                        <div className="min-w-32">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-700">{available}</span>
                            <StatusBadge tone={tone}>
                              {status === 'available'
                                ? 'OK'
                                : status === 'low'
                                  ? 'Baixo'
                                  : status === 'critical'
                                    ? 'Critico'
                                    : 'Zerado'}
                            </StatusBadge>
                          </div>
                          <ProgressBar
                            value={stock && stock.quantity > 0 ? (available / stock.quantity) * 100 : 0}
                            tone={tone}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-green-700">
                        {product.sustainabilityScore}%
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="quiet" onClick={() => onRestock(product.id, 5)}>
                            <PackagePlus size={16} aria-hidden="true" />
                            +5
                          </Button>
                          <Button type="button" variant="quiet" onClick={() => onPriceChange(product.id, nextPrice)}>
                            <Save size={16} aria-hidden="true" />
                            Preco
                          </Button>
                          <Button type="button" variant="danger" onClick={() => onDeactivateProduct(product.id)}>
                            Pausar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <Plus className="text-green-600" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-slate-950">Novo produto</h2>
              <p className="text-sm text-slate-500">CRUD simples para demonstracao avaliativa</p>
            </div>
          </div>
          <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_130px_150px_auto]" onSubmit={submitProduct}>
            <input
              className="min-h-10 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
              placeholder="Nome do produto"
              value={productDraft.name}
              onChange={(event) => onProductDraftChange({ ...productDraft, name: event.target.value })}
            />
            <input
              className="min-h-10 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
              placeholder="Preco"
              value={productDraft.price}
              onChange={(event) => onProductDraftChange({ ...productDraft, price: event.target.value })}
            />
            <select
              className="min-h-10 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
              value={productDraft.category}
              onChange={(event) =>
                onProductDraftChange({
                  ...productDraft,
                  category: event.target.value as Product['category']
                })
              }
            >
              <option value="lanche">Lanche</option>
              <option value="bebida">Bebida</option>
              <option value="fruta">Fruta</option>
              <option value="combo">Combo</option>
            </select>
            <Button type="submit" variant="secondary">
              Criar
            </Button>
          </form>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <History className="text-orange-500" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-slate-950">Pilha de acoes</h2>
              <p className="text-sm text-slate-500">Ultima acao administrativa pode ser desfeita</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {adminHistory.slice(-4).reverse().map((action) => (
              <div key={action.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {action.label}
              </div>
            ))}
            {adminHistory.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500">
                Nenhuma acao registrada.
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
    </section>
  )
}

