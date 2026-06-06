import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import {
  authenticateUser,
  clearSession,
  defaultCustomerPreferences,
  defaultCustomerProfile,
  defaultPaymentMethods,
  readCustomerPreferences,
  readCustomerProfile,
  readPaymentMethods,
  readSession,
  registerStudentAccount,
  saveCustomerPreferences,
  saveCustomerProfile,
  savePaymentMethods,
  saveSession,
  type AuthSession,
  type CustomerPreferences,
  type CustomerProfileDetails,
  type SavedPaymentMethod
} from './auth/demoAuth'
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
import {
  AccountSettingsPage,
  PaymentMethodsPage,
  ProfileDetailsPage
} from './features/account/AccountPages'
import { CustomerOrdering } from './features/customer/CustomerOrdering'
import { LoginPage, OAuthCallbackPage, RegisterPage } from './features/auth/AuthPages'
import { AppHeader } from './features/layout/AppHeader'
import {
  ManagementWorkspace,
  type ProductAdjustmentDraft
} from './features/management/ManagementWorkspace'
import { saveCustomerExperience } from './lib/edgeFunctions'
import { signInWithGoogle, signOut as signOutFromSupabase } from './lib/auth'
import { isSupabaseConfigured, supabase } from './lib/supabase'

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

function formatPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2).replace('.', ',')
}

function parsePriceCents(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  const price = Number(normalized)

  if (Number.isNaN(price) || price < 0) {
    throw new Error('Informe um preco valido.')
  }

  return Math.round(price * 100)
}

function sessionFromSupabaseUser(user: {
  email?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
}) {
  const email = user.email ?? ''
  const metadataName = user.user_metadata?.full_name ?? user.user_metadata?.name
  const role = user.app_metadata?.role === 'admin' ? 'admin' : 'student'

  return {
    role,
    name: typeof metadataName === 'string' && metadataName.trim()
      ? metadataName
      : email.split('@')[0] || 'Cliente Digital Flavor',
    email
  } satisfies AuthSession
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<AuthSession | undefined>(() => readSession())
  const [loginError, setLoginError] = useState<string>()
  const [registerError, setRegisterError] = useState<string>()
  const [products, setProducts] = useState(() => seedProducts.map(cloneProduct))
  const [inventory, setInventory] = useState(() => seedInventory.map(cloneInventoryItem))
  const [cart, setCart] = useState(() => new Cart())
  const [queue, setQueue] = useState(() => seedOrders)
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([])
  const [completedOrders, setCompletedOrders] = useState<typeof seedOrders>([])
  const [adminHistory, setAdminHistory] = useState<AdminAction[]>([])
  const [pickupTime, setPickupTime] = useState('10:30')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [latestOrderId, setLatestOrderId] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [customerProfile, setCustomerProfile] = useState<CustomerProfileDetails>(() =>
    defaultCustomerProfile(session)
  )
  const [customerPreferences, setCustomerPreferences] = useState<CustomerPreferences>(() =>
    defaultCustomerPreferences()
  )
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>(() =>
    defaultPaymentMethods()
  )
  const [productAdjustments, setProductAdjustments] = useState<Record<string, ProductAdjustmentDraft>>({})
  const [productDraft, setProductDraft] = useState<{
    name: string
    price: string
    category: Product['category']
  }>({
    name: '',
    price: '',
    category: 'lanche'
  })

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let active = true

    function applySupabaseSession(userSession: AuthSession) {
      saveSession(userSession)
      setSession(userSession)

      if (location.pathname === '/login' || location.pathname === '/cadastro' || location.pathname === '/auth/callback') {
        navigate(userSession.role === 'admin' ? '/admin' : '/', { replace: true })
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session?.user) {
        applySupabaseSession(sessionFromSupabaseUser(data.session.user))
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession?.user) {
        applySupabaseSession(sessionFromSupabaseUser(authSession.user))
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (!session || session.role !== 'student') {
      setCustomerProfile(defaultCustomerProfile(session))
      setCustomerPreferences(defaultCustomerPreferences())
      setPaymentMethods(defaultPaymentMethods())
      return
    }

    const nextProfile = readCustomerProfile(session)
    const nextPreferences = readCustomerPreferences(session)
    const nextPaymentMethods = readPaymentMethods(session)

    setCustomerProfile(nextProfile)
    setCustomerPreferences(nextPreferences)
    setPaymentMethods(nextPaymentMethods)
    setPickupTime(nextPreferences.defaultPickupTime)
    setPaymentMethod(
      (nextPaymentMethods.find((method) => method.preferred)?.type ?? 'pix') as PaymentMethod
    )
  }, [session])

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products])
  const cartItems = cart.listItems()
  const salesCents = [...queue, ...preparingOrders, ...completedOrders].reduce(
    (sum, order) => sum + order.totalCents,
    0
  )
  const productAdjustmentDrafts = useMemo(() => {
    return Object.fromEntries(
      products.map((product) => [
        product.id,
        productAdjustments[product.id] ?? {
          quantity: '1',
          price: formatPriceInput(product.priceCents)
        }
      ])
    ) as Record<string, ProductAdjustmentDraft>
  }, [productAdjustments, products])
  const customerOrderStatus = useMemo(() => {
    if (!latestOrderId) {
      return {
        headerLabel: `Fila agora ${queue.length}`,
        title: `Fila agora: ${queue.length}`,
        detail: 'Faca seu pedido para acompanhar a posicao de retirada.',
        tone: 'info' as const
      }
    }

    const queuedIndex = queue.findIndex((order) => order.id === latestOrderId)

    if (queuedIndex >= 0) {
      const order = queue[queuedIndex]

      return {
        headerLabel: `Sua posicao ${queuedIndex + 1}`,
        title: `Sua posicao: ${queuedIndex + 1}`,
        detail: 'Pedido confirmado. A cantina vai chamar os pedidos na ordem de chegada.',
        code: order.pickupCode,
        tone: 'warning' as const
      }
    }

    const preparingOrder = preparingOrders.find((order) => order.id === latestOrderId)

    if (preparingOrder) {
      const ready = preparingOrder.status === 'ready'

      return {
        headerLabel: ready ? 'Pronto' : 'Em preparo',
        title: ready ? 'Pronto' : 'Em preparo',
        detail: ready
          ? 'Seu pedido esta pronto para retirada.'
          : 'Seu pedido ja esta sendo preparado.',
        code: preparingOrder.pickupCode,
        tone: ready ? ('success' as const) : ('info' as const)
      }
    }

    const completedOrder = completedOrders.find((order) => order.id === latestOrderId)

    if (completedOrder) {
      return {
        headerLabel: 'Retirado',
        title: 'Retirado',
        detail: 'Pedido finalizado. Obrigado pela compra.',
        code: completedOrder.pickupCode,
        tone: 'success' as const
      }
    }

    return {
      headerLabel: `Fila agora ${queue.length}`,
      title: `Fila agora: ${queue.length}`,
      detail: 'Faca seu pedido para acompanhar a posicao de retirada.',
      tone: 'info' as const
    }
  }, [completedOrders, latestOrderId, preparingOrders, queue])

  function handleLogin(email: string, password: string) {
    setLoginError(undefined)
    const result = authenticateUser(email, password)

    if ('error' in result) {
      setLoginError(result.message)
      return
    }

    if (result.role === 'admin') {
      void signOutFromSupabase()
    }

    saveSession(result)
    setSession(result)
    navigate(result.role === 'admin' ? '/admin' : '/', { replace: true })
  }

  async function handleGoogleLogin() {
    setLoginError(undefined)
    setRegisterError(undefined)

    if (!isSupabaseConfigured) {
      setLoginError('Login Google depende das chaves do Supabase no ambiente.')
      setRegisterError('Login Google depende das chaves do Supabase no ambiente.')
      return
    }

    const { error } = await signInWithGoogle()

    if (error) {
      setLoginError(error.message)
      setRegisterError(error.message)
    }
  }

  function handleRegister(name: string, email: string, password: string) {
    setRegisterError(undefined)

    if (name.trim().length < 3) {
      setRegisterError('Informe o nome completo do aluno.')
      return
    }

    if (password.length < 6) {
      setRegisterError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    const account = registerStudentAccount({ name, email, password })
    const nextSession = {
      role: 'student',
      name: account.name,
      email: account.email
    } satisfies AuthSession

    saveSession(nextSession)
    setSession(nextSession)
    navigate('/', { replace: true })
  }

  function handleLogout() {
    void signOutFromSupabase()
    clearSession()
    setSession(undefined)
    setCart(new Cart())
    setLatestOrderId(undefined)
    navigate('/login', { replace: true })
  }

  function syncCustomerData(
    profile = customerProfile,
    preferences = customerPreferences,
    methods = paymentMethods
  ) {
    void saveCustomerExperience({
      profile,
      preferences,
      paymentMethods: methods
    })
  }

  function handleProfileSave(profile: CustomerProfileDetails) {
    saveCustomerProfile(profile)
    setCustomerProfile(profile)

    if (session) {
      const nextSession = {
        ...session,
        name: profile.name
      }

      saveSession(nextSession)
      setSession(nextSession)
      syncCustomerData(profile)
    }
  }

  function handlePreferencesSave(preferences: CustomerPreferences) {
    if (!session) {
      return
    }

    saveCustomerPreferences(session, preferences)
    setCustomerPreferences(preferences)
    setPickupTime(preferences.defaultPickupTime)
    syncCustomerData(customerProfile, preferences)
  }

  function handlePaymentMethodsSave(methods: SavedPaymentMethod[]) {
    if (!session) {
      return
    }

    savePaymentMethods(session, methods)
    setPaymentMethods(methods)

    const preferred = methods.find((method) => method.preferred)

    if (preferred) {
      setPaymentMethod(preferred.type)
    }

    syncCustomerData(customerProfile, customerPreferences, methods)
  }

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
        customerId: session?.email ?? 'cliente-digital-flavor',
        customerName: session?.name ?? 'Cliente Digital Flavor',
        paymentMethod,
        pickupTime
      })

      order.payment.approve()
      order.advance('queued')

      setQueue((current) => [...current, order])
      setInventory(stockService.snapshot().map(cloneInventoryItem))
      setCart(new Cart())
      setLatestOrderId(order.id)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel confirmar.')
    }
  }

  function handleTakeNextOrder() {
    const [nextOrder, ...remaining] = queue

    if (!nextOrder) {
      return
    }

    nextOrder.advance('preparing')
    setQueue(remaining)
    setPreparingOrders((current) => [nextOrder, ...current])
  }

  function handleMarkReady(orderId: string) {
    setPreparingOrders((current) =>
      current.map((order) => {
        if (order.id === orderId) {
          order.advance('ready')
        }

        return order
      })
    )
  }

  function handleCompleteOrder(orderId: string) {
    const order = preparingOrders.find((item) => item.id === orderId)

    if (!order) {
      return
    }

    order.advance('completed')
    setPreparingOrders((current) => current.filter((item) => item.id !== orderId))
    setCompletedOrders((current) => [...current, order])
  }

  function handleProductAdjustmentChange(productId: string, draft: ProductAdjustmentDraft) {
    setProductAdjustments((current) => ({
      ...current,
      [productId]: draft
    }))
  }

  function handleAdjustStock(productId: string, units: number) {
    if (!Number.isInteger(units) || units === 0) {
      return
    }

    const before = inventory.map(cloneInventoryItem)
    const product = products.find((item) => item.id === productId)
    let invalidAdjustment = false
    const nextInventory = inventory.map((item) => {
      const next = cloneInventoryItem(item)

      if (next.productId === productId) {
        if (units > 0) {
          next.restock(units)
        } else {
          const unitsToRemove = Math.abs(units)

          if (unitsToRemove > next.availableQuantity) {
            invalidAdjustment = true
            return next
          }

          next.quantity -= unitsToRemove
        }
      }

      return next
    })

    if (invalidAdjustment) {
      setErrorMessage('Quantidade maior que o estoque disponivel.')
      return
    }

    setInventory(nextInventory)
    pushHistory(
      `${units > 0 ? 'Entrada' : 'Saida'} de ${Math.abs(units)} unidades em ${product?.name ?? productId}`,
      () => {
        setInventory(before)
      }
    )
  }

  function handleSaveProductPrice(productId: string) {
    const before = products.map(cloneProduct)
    const product = products.find((item) => item.id === productId)
    const draft = productAdjustmentDrafts[productId]
    let cents: number

    try {
      cents = parsePriceCents(draft?.price ?? '')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Informe um preco valido.')
      return
    }

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
    setProductAdjustments((current) => ({
      ...current,
      [productId]: {
        quantity: current[productId]?.quantity ?? '1',
        price: formatPriceInput(cents)
      }
    }))
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

  function handleActivateProduct(productId: string) {
    const before = products.map(cloneProduct)
    const product = products.find((item) => item.id === productId)

    setProducts((current) =>
      current.map((item) => {
        const next = cloneProduct(item)

        if (next.id === productId) {
          next.activate()
        }

        return next
      })
    )

    pushHistory(`Produto disponivel: ${product?.name ?? productId}`, () => {
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
      description: 'Produto cadastrado para venda no cardapio.',
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

  const studentPage = session?.role === 'student' ? (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader
        role="student"
        cartItems={cart.totalItems}
        queueLabel={customerOrderStatus.headerLabel}
        userName={session.name}
        onLogout={handleLogout}
      />
      <CustomerOrdering
        products={activeProducts}
        inventory={inventory}
        cartItems={cartItems}
        cartTotalCents={cart.totalCents}
        pickupTime={pickupTime}
        paymentMethod={paymentMethod}
        orderStatus={customerOrderStatus}
        errorMessage={errorMessage}
        onPickupTimeChange={setPickupTime}
        onPaymentMethodChange={setPaymentMethod}
        onAddProduct={handleAddProduct}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
      />
    </main>
  ) : (
    <Navigate to={session?.role === 'admin' ? '/admin' : '/login'} replace />
  )

  const adminPage = session?.role === 'admin' ? (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader
        role="admin"
        cartItems={cart.totalItems}
        queueLabel={`Pedidos ${queue.length + preparingOrders.length}`}
        userName={session.name}
        onLogout={handleLogout}
      />
      <ManagementWorkspace
        products={products}
        inventory={inventory}
        queue={queue}
        preparingOrders={preparingOrders}
        completedOrders={completedOrders}
        salesCents={salesCents}
        adminHistory={adminHistory}
        productDraft={productDraft}
        productAdjustments={productAdjustmentDrafts}
        onProductDraftChange={setProductDraft}
        onProductAdjustmentChange={handleProductAdjustmentChange}
        onTakeNextOrder={handleTakeNextOrder}
        onMarkReady={handleMarkReady}
        onCompleteOrder={handleCompleteOrder}
        onAdjustStock={handleAdjustStock}
        onSaveProductPrice={handleSaveProductPrice}
        onDeactivateProduct={handleDeactivateProduct}
        onActivateProduct={handleActivateProduct}
        onCreateProduct={handleCreateProduct}
        onUndoLast={handleUndoLast}
      />
    </main>
  ) : (
    <Navigate to={session?.role === 'student' ? '/' : '/login'} replace />
  )

  function studentAccountPage(element: ReactNode) {
    if (session?.role !== 'student') {
      return <Navigate to={session?.role === 'admin' ? '/admin' : '/login'} replace />
    }

    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader
          role="student"
          cartItems={cart.totalItems}
          queueLabel={customerOrderStatus.headerLabel}
          userName={session.name}
          onLogout={handleLogout}
        />
        {element}
      </main>
    )
  }

  return (
    <Routes>
      <Route path="/" element={studentPage} />
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to={session.role === 'admin' ? '/admin' : '/'} replace />
          ) : (
            <LoginPage
              errorMessage={loginError}
              onLogin={handleLogin}
              onGoogleLogin={handleGoogleLogin}
            />
          )
        }
      />
      <Route
        path="/cadastro"
        element={
          session ? (
            <Navigate to={session.role === 'admin' ? '/admin' : '/'} replace />
          ) : (
            <RegisterPage
              errorMessage={registerError}
              onRegister={handleRegister}
              onGoogleLogin={handleGoogleLogin}
            />
          )
        }
      />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route
        path="/configuracoes"
        element={studentAccountPage(
          <AccountSettingsPage
            preferences={customerPreferences}
            onPreferencesSave={handlePreferencesSave}
          />
        )}
      />
      <Route
        path="/perfil"
        element={studentAccountPage(
          <ProfileDetailsPage
            profile={customerProfile}
            onProfileSave={handleProfileSave}
          />
        )}
      />
      <Route
        path="/pagamentos"
        element={studentAccountPage(
          <PaymentMethodsPage
            paymentMethods={paymentMethods}
            onPaymentMethodsSave={handlePaymentMethodsSave}
          />
        )}
      />
      <Route path="/admin" element={adminPage} />
      <Route path="*" element={<Navigate to={session?.role === 'admin' ? '/admin' : '/'} replace />} />
    </Routes>
  )
}
