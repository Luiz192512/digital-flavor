import { Payment } from './Payment'
import type { CartItemSnapshot, OrderStatus } from './types'

export interface OrderProps {
  id: string
  customerId: string
  customerName: string
  items: CartItemSnapshot[]
  payment: Payment
  pickupTime: string
  pickupCode: string
  createdAt?: Date
  status?: OrderStatus
}

export class Order {
  readonly id: string
  readonly customerId: string
  customerName: string
  items: CartItemSnapshot[]
  payment: Payment
  pickupTime: string
  pickupCode: string
  createdAt: Date
  status: OrderStatus

  constructor(props: OrderProps) {
    if (props.items.length === 0) {
      throw new Error('Order must have at least one item')
    }

    this.id = props.id
    this.customerId = props.customerId
    this.customerName = props.customerName
    this.items = props.items
    this.payment = props.payment
    this.pickupTime = props.pickupTime
    this.pickupCode = props.pickupCode
    this.createdAt = props.createdAt ?? new Date()
    this.status = props.status ?? 'submitted'
  }

  get totalCents() {
    return this.items.reduce((sum, item) => sum + item.totalCents, 0)
  }

  advance(status: Exclude<OrderStatus, 'draft'>) {
    if (this.status === 'cancelled' || this.status === 'completed') {
      throw new Error('Finalized orders cannot change status')
    }

    this.status = status
  }

  cancel() {
    if (this.status === 'completed') {
      throw new Error('Completed orders cannot be cancelled')
    }

    this.status = 'cancelled'
  }
}

