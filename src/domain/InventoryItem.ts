import type { InventoryStatus } from './types'

export interface InventoryItemProps {
  productId: string
  quantity: number
  reserved?: number
  reorderPoint: number
  expiresAt?: Date
}

export class InventoryItem {
  readonly productId: string
  quantity: number
  reserved: number
  reorderPoint: number
  expiresAt?: Date

  constructor(props: InventoryItemProps) {
    if (props.quantity < 0 || props.reorderPoint < 0) {
      throw new Error('Inventory values cannot be negative')
    }

    this.productId = props.productId
    this.quantity = props.quantity
    this.reserved = props.reserved ?? 0
    this.reorderPoint = props.reorderPoint
    this.expiresAt = props.expiresAt
  }

  get availableQuantity() {
    return Math.max(0, this.quantity - this.reserved)
  }

  reserve(units: number) {
    this.assertPositive(units)

    if (units > this.availableQuantity) {
      throw new Error('Insufficient stock to reserve product')
    }

    this.reserved += units
  }

  release(units: number) {
    this.assertPositive(units)
    this.reserved = Math.max(0, this.reserved - units)
  }

  consume(units: number) {
    this.assertPositive(units)

    if (units > this.quantity) {
      throw new Error('Insufficient stock to consume product')
    }

    this.quantity -= units
    this.reserved = Math.max(0, this.reserved - units)
  }

  restock(units: number) {
    this.assertPositive(units)
    this.quantity += units
  }

  status(): InventoryStatus {
    if (this.availableQuantity === 0) {
      return 'unavailable'
    }

    if (this.availableQuantity <= Math.max(1, Math.floor(this.reorderPoint / 2))) {
      return 'critical'
    }

    if (this.availableQuantity <= this.reorderPoint) {
      return 'low'
    }

    return 'available'
  }

  private assertPositive(units: number) {
    if (!Number.isInteger(units) || units <= 0) {
      throw new Error('Units must be a positive integer')
    }
  }
}

