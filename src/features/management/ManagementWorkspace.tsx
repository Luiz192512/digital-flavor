import { useState, type FormEvent } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  History,
  Plus,
  RotateCcw,
  Save
} from 'lucide-react'

import { Button, MetricCard, Panel, ProgressBar, StatusBadge } from '../../components/ui'
import type { AdminAction, InventoryItem, Order, Product } from '../../domain'
import { formatCurrency, formatNumber } from '../../utils/format'

export interface ProductAdjustmentDraft {
  quantity: string
  price: string
}

interface ManagementWorkspaceProps {
  products: Product[]
  inventory: InventoryItem[]
  queue: Order[]
  preparingOrders: Order[]
  completedOrders: Order[]
  salesCents: number
  adminHistory: AdminAction[]
  productDraft: {
    name: string
    price: string
    category: Product['category']
  }
  productAdjustments: Record<string, ProductAdjustmentDraft>
  onProductDraftChange: (draft: {
    name: string
    price: string
    category: Product['category']
  }) => void
  onProductAdjustmentChange: (productId: string, draft: ProductAdjustmentDraft) => void
  onTakeNextOrder: () => void
  onMarkReady: (orderId: string) => void
  onCompleteOrder: (orderId: string) => void
  onAdjustStock: (productId: string, units: number) => void
  onSaveProductPrice: (productId: string) => void
  onDeactivateProduct: (productId: string) => void
  onActivateProduct: (productId: string) => void
  onCreateProduct: () => void
  onUndoLast: () => void
}

type AdminTab = 'orders' | 'products' | 'reports'

const tabLabel: Record<AdminTab, string> = {
  orders: 'Pedidos',
  products: 'Produtos',
  reports: 'Relatorios'
}

export function ManagementWorkspace({
  products,
  inventory,
  queue,
  preparingOrders,
  completedOrders,
  salesCents,
  adminHistory,
  productDraft,
  productAdjustments,
  onProductDraftChange,
  onProductAdjustmentChange,
  onTakeNextOrder,
  onMarkReady,
  onCompleteOrder,
  onAdjustStock,
  onSaveProductPrice,
  onDeactivateProduct,
  onActivateProduct,
  onCreateProduct,
  onUndoLast
}: ManagementWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders')
  const inventoryByProduct = new Map(inventory.map((item) => [item.productId, item]))
  const lowStockCount = inventory.filter((item) => item.status() !== 'available').length
  const pausedProducts = products.filter((product) => !product.active).length
  const activeStock = inventory.reduce((sum, item) => sum + item.availableQuantity, 0)

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCreateProduct()
  }

  function quantityFor(productId: string) {
    return Math.max(1, Number.parseInt(productAdjustments[productId]?.quantity ?? '1', 10) || 1)
  }

  return (
    <section id="admin-panel" className="mx-auto max-w-7xl px-5 py-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Painel da cantina
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Atendimento e produtos
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
          {(Object.keys(tabLabel) as AdminTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`min-h-10 rounded-md px-4 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabel[tab]}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'orders' ? (
        <Panel className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Ordem de preparo
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Pedidos em atendimento
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Chame o proximo pedido, acompanhe o preparo e finalize a entrega.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={onTakeNextOrder} disabled={queue.length === 0}>
              <ClipboardList size={18} aria-hidden="true" />
              Chamar proximo
            </Button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
            <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">Em preparo</p>
              {preparingOrders.length > 0 ? (
                preparingOrders.map((order) => (
                  <article key={order.id} className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-blue-950">{order.customerName}</h3>
                        <p className="text-sm text-blue-800">
                          Codigo {order.pickupCode} - retirada {order.pickupTime}
                        </p>
                      </div>
                      <StatusBadge tone={order.status === 'ready' ? 'success' : 'info'}>
                        {order.status === 'ready' ? 'Pronto' : 'Em preparo'}
                      </StatusBadge>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-blue-950">
                      {order.items.map((item) => (
                        <li key={item.productId} className="flex justify-between gap-3">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <strong>{formatCurrency(item.totalCents)}</strong>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="quiet"
                        onClick={() => onMarkReady(order.id)}
                        disabled={order.status === 'ready'}
                      >
                        <CheckCircle2 size={16} aria-hidden="true" />
                        Marcar pronto
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onCompleteOrder(order.id)}
                      >
                        Entregar
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="mt-3 text-sm text-blue-800">
                  Nenhum pedido em preparo. Chame o primeiro pedido da lista.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Aguardando preparo</p>
              {queue.map((order, index) => (
                <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        #{index + 1} aguardando
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
                  Nenhum pedido aguardando preparo.
                </div>
              ) : null}
            </div>
          </div>
        </Panel>
      ) : null}

      {activeTab === 'products' ? (
        <div className="grid gap-5">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                  Produtos
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Cardapio e estoque
                </h2>
              </div>
              <Button type="button" variant="quiet" onClick={onUndoLast} disabled={adminHistory.length === 0}>
                <RotateCcw size={17} aria-hidden="true" />
                Desfazer ultima alteracao
              </Button>
            </div>

            <div className="divide-y divide-slate-200">
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
                const draft = productAdjustments[product.id] ?? { quantity: '1', price: product.priceLabel }

                return (
                  <article
                    key={product.id}
                    className={`grid gap-4 p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(170px,0.55fr)_minmax(190px,0.65fr)_minmax(240px,0.8fr)] lg:items-center ${
                      !product.active ? 'bg-slate-50 opacity-80' : 'bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-950">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{product.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge tone={product.active ? 'success' : 'danger'}>
                          {product.active ? 'No cardapio' : 'Pausado'}
                        </StatusBadge>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preco</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input
                          className="min-h-10 w-28 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
                          value={draft.price}
                          aria-label={`Preco de ${product.name}`}
                          onChange={(event) =>
                            onProductAdjustmentChange(product.id, {
                              ...draft,
                              price: event.target.value
                            })
                          }
                        />
                        <Button type="button" variant="quiet" onClick={() => onSaveProductPrice(product.id)}>
                          <Save size={15} aria-hidden="true" />
                          Salvar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estoque</p>
                      <div className="mt-2">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-700">{available}</span>
                          <StatusBadge tone={tone}>
                            {status === 'available'
                              ? 'Disponivel'
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
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantidade</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-[80px_1fr_1fr]">
                        <input
                          className="min-h-10 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
                          type="number"
                          min="1"
                          value={draft.quantity}
                          aria-label={`Quantidade de ${product.name}`}
                          onChange={(event) =>
                            onProductAdjustmentChange(product.id, {
                              ...draft,
                              quantity: event.target.value
                            })
                          }
                        />
                        <Button type="button" variant="quiet" onClick={() => onAdjustStock(product.id, quantityFor(product.id))}>
                          Adicionar
                        </Button>
                        <Button type="button" variant="quiet" onClick={() => onAdjustStock(product.id, -quantityFor(product.id))}>
                          Retirar
                        </Button>
                      </div>
                      <div className="mt-2">
                        {product.active ? (
                          <Button type="button" variant="danger" onClick={() => onDeactivateProduct(product.id)}>
                            Pausar
                          </Button>
                        ) : (
                          <Button type="button" variant="secondary" onClick={() => onActivateProduct(product.id)}>
                            Disponivel
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel className="p-5">
              <div className="flex items-center gap-3">
                <Plus className="text-green-600" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Novo produto</h2>
                  <p className="text-sm text-slate-500">Inclua um item no cardapio da cantina.</p>
                </div>
              </div>
              <form className="mt-4 grid gap-3" onSubmit={submitProduct}>
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
                  Criar produto
                </Button>
              </form>
            </Panel>

            <Panel className="p-5">
              <div className="flex items-center gap-3">
                <History className="text-orange-500" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Historico de alteracoes</h2>
                  <p className="text-sm text-slate-500">Ultimas mudancas feitas no cardapio.</p>
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
                    Nenhuma alteracao registrada.
                  </div>
                ) : null}
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {activeTab === 'reports' ? (
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Relatorios
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Resultado da operacao
              </h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Vendas do dia"
              value={formatCurrency(salesCents)}
              detail="Pedidos aguardando, em preparo e entregues"
              tone="info"
            />
            <MetricCard
              label="Pedidos atendidos"
              value={formatNumber(completedOrders.length)}
              detail="Retiradas finalizadas"
              tone="success"
            />
            <MetricCard
              label="Produtos em alerta"
              value={formatNumber(lowStockCount)}
              detail="Itens com poucas unidades"
              tone={lowStockCount > 0 ? 'warning' : 'success'}
            />
            <MetricCard
              label="Produtos pausados"
              value={formatNumber(pausedProducts)}
              detail={`${formatNumber(activeStock)} unidades disponiveis`}
              tone={pausedProducts > 0 ? 'danger' : 'success'}
            />
          </div>
        </Panel>
      ) : null}
    </section>
  )
}
