export type UserRole = 'customer' | 'employee' | 'manager' | 'admin'

export type ProductCategory = 'lanche' | 'bebida' | 'fruta' | 'combo'

export type InventoryStatus = 'available' | 'low' | 'critical' | 'unavailable'

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'queued'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export type PaymentMethod = 'pix' | 'card' | 'cash'

export type PaymentStatus = 'pending' | 'approved' | 'refused' | 'refunded'

export interface CartItemSnapshot {
  productId: string
  name: string
  unitPriceCents: number
  quantity: number
  totalCents: number
}

export interface AdminAction {
  id: string
  label: string
  createdAt: Date
  undo: () => void
}

