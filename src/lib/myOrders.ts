import type { OrderStatus } from '../domain'
import { supabase } from './supabase'

export interface MyOrderInfo {
  id: string
  status: OrderStatus
  pickupTime: string
  pickupCode: string
  totalCents: number
  createdAt: Date
  canteenName: string
}

// Fichas do próprio usuário (a RLS de orders já restringe ao dono).
export async function fetchMyOrders(): Promise<MyOrderInfo[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id,status,pickup_time,pickup_code,total_cents,created_at,canteens(name)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as unknown as Array<{
    id: string
    status: OrderStatus
    pickup_time: string
    pickup_code: string
    total_cents: number
    created_at: string
    canteens: { name: string } | null
  }>).map((row) => ({
    id: row.id,
    status: row.status,
    pickupTime: row.pickup_time.slice(0, 5),
    pickupCode: row.pickup_code,
    totalCents: row.total_cents,
    createdAt: new Date(row.created_at),
    canteenName: row.canteens?.name ?? 'Cantina'
  }))
}
