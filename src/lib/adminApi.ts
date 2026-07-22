import { Order, Payment, type OrderStatus, type PaymentMethod, type ProductCategory } from '../domain'
import { supabase } from './supabase'

// Camada de dados do painel de gestão. Todas as mutações passam pela RLS de
// staff por cantina (nenhum privilégio no cliente); erros de permissão são
// traduzidos para mensagens da UI.

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  return supabase
}

function translateAdminError(message: string): string {
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return 'Sem permissao para esta acao nesta cantina.'
  }

  if (message.startsWith('stock_adjust_denied_or_insufficient')) {
    return 'Ajuste negado: exige papel de gerente ou deixaria o estoque abaixo do reservado.'
  }

  return message
}

interface ActiveOrderRow {
  id: string
  customer_id: string
  customer_name: string
  status: OrderStatus
  pickup_time: string
  pickup_code: string
  created_at: string
  order_items: Array<{
    product_id: string | null
    product_name: string
    unit_price_cents: number
    quantity: number
    total_cents: number
  }>
  payments: Array<{
    id: string
    method: PaymentMethod
    status: 'pending' | 'approved' | 'refused' | 'refunded'
    amount_cents: number
  }>
}

// Pedidos ativos (fila, preparo, prontos) + concluidos recentes, mapeados
// para as classes de dominio consumidas pelo ManagementWorkspace.
export async function fetchActiveOrders(): Promise<Order[]> {
  const client = requireClient()
  const columns =
    'id,customer_id,customer_name,status,pickup_time,pickup_code,created_at,order_items(product_id,product_name,unit_price_cents,quantity,total_cents),payments(id,method,status,amount_cents)'

  // BUG-07: separar a fila (ativos, ordem de chegada, sem teto que os empurre
  // para fora) dos concluídos (só de hoje, mais recentes primeiro). Antes uma
  // única query `limit(100)` asc podia trazer só os 100 concluídos mais
  // antigos e esconder a fila atual.
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [activeResult, completedResult] = await Promise.all([
    client
      .from('orders')
      .select(columns)
      .in('status', ['queued', 'preparing', 'ready'])
      .order('created_at', { ascending: true })
      .limit(200),
    client
      .from('orders')
      .select(columns)
      .eq('status', 'completed')
      .gte('created_at', startOfToday.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)
  ])

  if (activeResult.error) {
    throw new Error(translateAdminError(activeResult.error.message))
  }

  if (completedResult.error) {
    throw new Error(translateAdminError(completedResult.error.message))
  }

  const rows = [
    ...((activeResult.data ?? []) as unknown as ActiveOrderRow[]),
    ...((completedResult.data ?? []) as unknown as ActiveOrderRow[])
  ]

  return rows
    .filter((row) => row.order_items.length > 0)
    .map((row) => {
      const paymentRow = row.payments[0]

      return new Order({
        id: row.id,
        customerId: row.customer_id,
        customerName: row.customer_name,
        items: row.order_items.map((item) => ({
          productId: item.product_id ?? '',
          name: item.product_name,
          unitPriceCents: item.unit_price_cents,
          quantity: item.quantity,
          totalCents: item.total_cents
        })),
        payment: new Payment({
          id: paymentRow?.id ?? row.id,
          method: paymentRow?.method ?? 'pix',
          amountCents: paymentRow?.amount_cents ?? 0,
          status: paymentRow?.status ?? 'pending'
        }),
        pickupTime: row.pickup_time.slice(0, 5),
        pickupCode: row.pickup_code,
        createdAt: new Date(row.created_at),
        status: row.status
      })
    })
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const client = requireClient()

  const { data, error } = await client
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('id')

  if (error) {
    throw new Error(translateAdminError(error.message))
  }

  if (!data || data.length === 0) {
    throw new Error('Sem permissao para esta acao nesta cantina.')
  }
}

// Ajuste atomico no servidor (RPC security invoker → RLS de gerente vale).
export async function adjustStockOnServer(productId: string, units: number): Promise<void> {
  const client = requireClient()

  const { error } = await client.rpc('adjust_stock', {
    p_product_id: productId,
    p_units: units,
    p_reason: 'ajuste manual pelo painel'
  })

  if (error) {
    throw new Error(translateAdminError(error.message))
  }
}

export async function updateProductPrice(productId: string, priceCents: number): Promise<void> {
  const client = requireClient()

  const { data, error } = await client
    .from('products')
    .update({ price_cents: priceCents, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select('id')

  if (error) {
    throw new Error(translateAdminError(error.message))
  }

  if (!data || data.length === 0) {
    throw new Error('Sem permissao para esta acao nesta cantina.')
  }
}

export async function setProductActive(productId: string, active: boolean): Promise<void> {
  const client = requireClient()

  const { data, error } = await client
    .from('products')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select('id')

  if (error) {
    throw new Error(translateAdminError(error.message))
  }

  if (!data || data.length === 0) {
    throw new Error('Sem permissao para esta acao nesta cantina.')
  }
}

export async function createProductOnServer(input: {
  name: string
  category: ProductCategory
  priceCents: number
  canteenId: string
}): Promise<void> {
  const client = requireClient()

  const { data, error } = await client
    .from('products')
    .insert({
      name: input.name,
      description: 'Produto cadastrado para venda no cardapio.',
      category: input.category,
      price_cents: input.priceCents,
      canteen_id: input.canteenId
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(translateAdminError(error.message))
  }

  const { error: inventoryError } = await client.from('inventory').insert({
    product_id: data.id,
    quantity: 12,
    reserved: 0,
    reorder_point: 6
  })

  if (inventoryError) {
    throw new Error(translateAdminError(inventoryError.message))
  }
}

// Assinatura de mudanças em orders (fila em tempo real do painel).
export function subscribeOrders(onChange: () => void): () => void {
  if (!supabase) {
    return () => {}
  }

  const client = supabase
  const channel = client
    .channel('orders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      onChange()
    })
    .subscribe()

  return () => {
    void client.removeChannel(channel)
  }
}
