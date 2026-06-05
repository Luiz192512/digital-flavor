import { Cart } from './Cart'
import { InventoryItem } from './InventoryItem'
import { Order } from './Order'
import { Payment } from './Payment'
import { Product } from './Product'
import { Queue, Stack } from './structures'
import type { AdminAction, PaymentMethod } from './types'

export class StockService {
  private inventory: Map<string, InventoryItem>

  constructor(items: InventoryItem[]) {
    this.inventory = new Map(items.map((item) => [item.productId, item]))
  }

  get(productId: string) {
    return this.inventory.get(productId)
  }

  require(productId: string) {
    const item = this.get(productId)

    if (!item) {
      throw new Error(`Inventory item not found: ${productId}`)
    }

    return item
  }

  reserveCart(cart: Cart) {
    cart.listItems().forEach((item) => {
      this.require(item.productId).reserve(item.quantity)
    })
  }

  consumeCart(cart: Cart) {
    cart.listItems().forEach((item) => {
      this.require(item.productId).consume(item.quantity)
    })
  }

  snapshot() {
    return Array.from(this.inventory.values())
  }
}

export class CheckoutService {
  constructor(private stockService: StockService) {}

  createOrder({
    cart,
    customerId,
    customerName,
    paymentMethod,
    pickupTime
  }: {
    cart: Cart
    customerId: string
    customerName: string
    paymentMethod: PaymentMethod
    pickupTime: string
  }) {
    if (cart.isEmpty) {
      throw new Error('Cannot checkout an empty cart')
    }

    this.stockService.reserveCart(cart)

    const payment = new Payment({
      id: crypto.randomUUID(),
      method: paymentMethod,
      amountCents: cart.totalCents
    })

    return new Order({
      id: crypto.randomUUID(),
      customerId,
      customerName,
      items: cart.listItems(),
      payment,
      pickupTime,
      pickupCode: this.createPickupCode()
    })
  }

  private createPickupCode() {
    return Math.random().toString(36).slice(2, 6).toUpperCase()
  }
}

export class OrderQueueService {
  private queue = new Queue<Order>()

  enqueue(order: Order) {
    order.advance('queued')
    this.queue.enqueue(order)
  }

  nextForPreparation() {
    const order = this.queue.dequeue()

    if (order) {
      order.advance('preparing')
    }

    return order
  }

  peekNext() {
    return this.queue.peek()
  }

  listQueue() {
    return this.queue.toArray()
  }

  get size() {
    return this.queue.size
  }
}

export class ProductCatalogService {
  private products: Map<string, Product>

  constructor(products: Product[]) {
    this.products = new Map(products.map((product) => [product.id, product]))
  }

  listActive() {
    return Array.from(this.products.values()).filter((product) => product.active)
  }

  upsert(product: Product) {
    this.products.set(product.id, product)
  }

  remove(productId: string) {
    this.products.get(productId)?.deactivate()
  }
}

export class AdminActionHistory {
  private stack = new Stack<AdminAction>()

  record(action: AdminAction) {
    this.stack.push(action)
  }

  undoLast() {
    const action = this.stack.pop()

    if (!action) {
      return undefined
    }

    action.undo()
    return action
  }

  listRecent() {
    return this.stack.toArray()
  }
}

