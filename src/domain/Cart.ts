import type { InventoryItem } from './InventoryItem'
import type { Product } from './Product'
import type { CartItemSnapshot } from './types'

export class Cart {
  private items = new Map<string, CartItemSnapshot>()

  addProduct(product: Product, quantity: number, stock?: InventoryItem) {
    this.assertQuantity(quantity)

    const currentQuantity = this.items.get(product.id)?.quantity ?? 0
    const nextQuantity = currentQuantity + quantity

    if (stock && nextQuantity > stock.availableQuantity) {
      throw new Error('Cart quantity exceeds available stock')
    }

    this.items.set(product.id, this.snapshot(product, nextQuantity))
  }

  updateQuantity(product: Product, quantity: number, stock?: InventoryItem) {
    if (quantity === 0) {
      this.items.delete(product.id)
      return
    }

    this.assertQuantity(quantity)

    if (stock && quantity > stock.availableQuantity) {
      throw new Error('Cart quantity exceeds available stock')
    }

    this.items.set(product.id, this.snapshot(product, quantity))
  }

  removeProduct(productId: string) {
    this.items.delete(productId)
  }

  clear() {
    this.items.clear()
  }

  listItems() {
    return Array.from(this.items.values())
  }

  get totalCents() {
    return this.listItems().reduce((sum, item) => sum + item.totalCents, 0)
  }

  get totalItems() {
    return this.listItems().reduce((sum, item) => sum + item.quantity, 0)
  }

  get isEmpty() {
    return this.items.size === 0
  }

  private snapshot(product: Product, quantity: number): CartItemSnapshot {
    return {
      productId: product.id,
      name: product.name,
      unitPriceCents: product.priceCents,
      quantity,
      totalCents: product.priceCents * quantity
    }
  }

  private assertQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Cart quantity must be a positive integer')
    }
  }
}

