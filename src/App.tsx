import { useMemo, useState } from 'react'

import { seedInventory, seedOrders, seedProducts } from './data/seed'
import {
  Cart,
  CheckoutService,
  InventoryItem,
  Product,
  StockService,
  type AdminAction,
  type Order,
  type PaymentMethod
} from './domain'
import { CustomerOrdering } from './features/customer/CustomerOrdering'
import { AppHeader, type ViewMode } from './features/layout/AppHeader'
import { ManagementWorkspace } from './features/management/ManagementWorkspace'
import { SustainabilityStrip } from './features/summary/SustainabilityStrip'

const customerId = 'demo-student'
const customerName = 'Aluno Digital Flavor'

function cloneProduct(product: Product) {
  return new Product({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    priceCents: product.priceCents,
    preparationMinutes: product.preparationMinutes,
    sustainabilityScore: product.sustainabilityScore,
    active: product.active
  })
}

function cloneInventoryItem(item: InventoryItem) {
  return new InventoryItem({
    productId: item.productId,
    quantity: item.quantity,
    reserved: item.reserved,
    reorderPoint: item.reorderPoint,
    expiresAt: item.expiresAt
  })
}

function cloneCart(cart: Cart, products: Product[]) {
  const next = new Cart()
  const productById = new Map(products.map((product) => [product.id, product]))

  cart.listItems().forEach((item) => {
    const product = productById.get(item.productId)

    if (product) {
      next.updateQuantity(product, item.quantity)
    }
  })

  return next
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('student')
  const [products, setProducts] = useState(() => seedProducts.map(cloneProduct))
  const [inventory, setInventory] = useState(() => seedInventory.map(cloneInventoryItem))
  const [cart, setCart] = useState(() => new Cart())
  const [queue, setQueue] = useState(() => seedOrders)
  const [activeOrder, setActiveOrder] = useState<Order | undefined>(undefined)
  const [completedOrders, setCompletedOrders] = useState<typeof seedOrders>([])
  const [adminHistory, setAdminHistory] = useState<AdminAction[]>([])
  const [pickupTime, setPickupTime] = useState('10:30')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [latestOrderCode, setLatestOrderCode] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [productDraft, setProductDraft] = useState<{
    name: string
    price: string
    category: Product['category']
  }>({
    name: '',
    price: '',
    category: 'lanche'
  })

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products])
  const cartItems = cart.listItems()
  const activeStock = inventory.reduce((sum, item) => sum + item.availableQuantity, 0)
  const salesCents = [...queue, ...completedOrders, ...(activeOrder ? [activeOrder] : [])].reduce(
    (sum, order) => sum + order.totalCents,
    0
  )

  function pushHistory(label: string, undo: () => void) {
    setAdminHistory((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        label,
        createdAt: new Date(),
        undo
      }
    ])
  }

  function handleAddProduct(productId: string) {
    setErrorMessage(undefined)
    const product = products.find((item) => item.id === productId)
    const stock = inventory.find((item) => item.productId === productId)

    if (!product) {
      setErrorMessage('Produto nao encontrado.')
      return
    }

    try {
      const nextCart = cloneCart(cart, products)
      nextCart.addProduct(product, 1, stock)
      setCart(nextCart)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel adicionar.')
    }
  }

  function handleUpdateQuantity(productId: string, quantity: number) {
    setErrorMessage(undefined)
    const product = products.find((item) => item.id === productId)
    const stock = inventory.find((item) => item.productId === productId)

    if (!product) {
      return
    }

    try {
      const nextCart = cloneCart(cart, products)
      nextCart.updateQuantity(product, Math.max(0, quantity), stock)
      setCart(nextCart)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Quantidade indisponivel.')
    }
  }

  function handleCheckout() {
    setErrorMessage(undefined)

    try {
      const stockService = new StockService(inventory.map(cloneInventoryItem))
      const checkout = new CheckoutService(stockService)
      const order = checkout.createOrder({
        cart,
        customerId,
        customerName,
        paymentMethod,
        pickupTime
      })

      order.payment.approve()
      order.advance('queued')

      setQueue((current) => [...current, order])
      setInventory(stockService.snapshot().map(cloneInventoryItem))
      setCart(new Cart())
      setLatestOrderCode(order.pickupCode)
      setViewMode('management')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel confirmar.')
    }
  }

  function handleTakeNextOrder() {
    setQueue((current) => {
      const [nextOrder, ...remaining] = current

      if (nextOrder) {
        nextOrder.advance('preparing')
        setActiveOrder(nextOrder)
      }

      return remaining
    })
  }

  function handleMarkReady() {
    if (!activeOrder) {
      return
    }

    activeOrder.advance('ready')
    setActiveOrder(activeOrder)
  }

  function handleCompleteActiveOrder() {
    if (!activeOrder) {
      return
    }

    activeOrder.advance('completed')
    setCompletedOrders((current) => [...current, activeOrder])
    setActiveOrder(undefined)
  }

  function handleRestock(productId: string, units: number) {
    const before = inventory.map(cloneInventoryItem)
    const product = products.find((item) => item.id === productId)

    setInventory((current) =>
      current.map((item) => {
        const next = cloneInventoryItem(item)

        if (next.productId === productId) {
          next.restock(units)
        }

        return next
      })
    )

    pushHistory(`Reposicao de ${units} unidades em ${product?.name ?? productId}`, () => {
      setInventory(before)
    })
  }

  function handlePriceChange(productId: string, cents: number) {
    const before = products.map(cloneProduct)
    const product = products.find((item) => item.id === productId)

    setProducts((current) =>
      current.map((item) => {
        const next = cloneProduct(item)

        if (next.id === productId) {
          next.updatePrice(cents)
        }

        return next
      })
    )

    pushHistory(`Preco atualizado em ${product?.name ?? productId}`, () => {
      setProducts(before)
    })
  }

  function handleDeactivateProduct(productId: string) {
    const before = products.map(cloneProduct)
    const product = products.find((item) => item.id === productId)

    setProducts((current) =>
      current.map((item) => {
        const next = cloneProduct(item)

        if (next.id === productId) {
          next.deactivate()
        }

        return next
      })
    )

    pushHistory(`Produto pausado: ${product?.name ?? productId}`, () => {
      setProducts(before)
    })
  }

  function handleCreateProduct() {
    const priceNumber = Number(productDraft.price.replace(',', '.'))

    if (!productDraft.name.trim() || Number.isNaN(priceNumber) || priceNumber <= 0) {
      setErrorMessage('Informe nome e preco valido para criar produto.')
      return
    }

    const beforeProducts = products.map(cloneProduct)
    const beforeInventory = inventory.map(cloneInventoryItem)
    const newProduct = new Product({
      id: `produto-${Date.now()}`,
      name: productDraft.name.trim(),
      description: 'Produto cadastrado pela gestao com controle de estoque.',
      category: productDraft.category,
      priceCents: Math.round(priceNumber * 100),
      preparationMinutes: 6,
      sustainabilityScore: 82
    })
    const newInventory = new InventoryItem({
      productId: newProduct.id,
      quantity: 12,
      reorderPoint: 6
    })

    setProducts((current) => [...current, newProduct])
    setInventory((current) => [...current, newInventory])
    setProductDraft({ name: '', price: '', category: 'lanche' })
    pushHistory(`Produto criado: ${newProduct.name}`, () => {
      setProducts(beforeProducts)
      setInventory(beforeInventory)
    })
  }

  function handleUndoLast() {
    const lastAction = adminHistory[adminHistory.length - 1]

    if (!lastAction) {
      return
    }

    lastAction.undo()
    setAdminHistory((current) => current.slice(0, -1))
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader
        viewMode={viewMode}
        cartItems={cart.totalItems}
        queuedOrders={queue.length}
        onViewModeChange={setViewMode}
      />

      <SustainabilityStrip
        salesCents={salesCents}
        activeStock={activeStock}
        queuedOrders={queue.length}
        wasteReduction={-28}
      />

      {viewMode === 'student' ? (
        <CustomerOrdering
          products={activeProducts}
          inventory={inventory}
          cartItems={cartItems}
          cartTotalCents={cart.totalCents}
          pickupTime={pickupTime}
          paymentMethod={paymentMethod}
          latestOrderCode={latestOrderCode}
          errorMessage={errorMessage}
          onPickupTimeChange={setPickupTime}
          onPaymentMethodChange={setPaymentMethod}
          onAddProduct={handleAddProduct}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={handleCheckout}
        />
      ) : (
        <ManagementWorkspace
          products={products}
          inventory={inventory}
          queue={queue}
          activeOrder={activeOrder}
          completedOrders={completedOrders}
          adminHistory={adminHistory}
          productDraft={productDraft}
          onProductDraftChange={setProductDraft}
          onTakeNextOrder={handleTakeNextOrder}
          onMarkReady={handleMarkReady}
          onCompleteActiveOrder={handleCompleteActiveOrder}
          onRestock={handleRestock}
          onPriceChange={handlePriceChange}
          onDeactivateProduct={handleDeactivateProduct}
          onCreateProduct={handleCreateProduct}
          onUndoLast={handleUndoLast}
        />
      )}
    </main>
  )
}
