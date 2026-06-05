import { describe, expect, it, vi } from 'vitest'

import {
  AdminActionHistory,
  Cart,
  CheckoutService,
  InventoryItem,
  Product,
  Queue,
  Stack,
  StockService,
  UserProfile
} from './index'

function makeProduct() {
  return new Product({
    id: 'sandwich',
    name: 'Sanduiche natural',
    description: 'Produto de teste',
    category: 'lanche',
    priceCents: 1200,
    preparationMinutes: 5,
    sustainabilityScore: 90
  })
}

describe('canteen domain models', () => {
  it('calculates cart totals with a product list', () => {
    const product = makeProduct()
    const stock = new InventoryItem({
      productId: product.id,
      quantity: 8,
      reorderPoint: 2
    })
    const cart = new Cart()

    cart.addProduct(product, 2, stock)

    expect(cart.totalItems).toBe(2)
    expect(cart.totalCents).toBe(2400)
    expect(cart.listItems()).toEqual([
      {
        productId: 'sandwich',
        name: 'Sanduiche natural',
        unitPriceCents: 1200,
        quantity: 2,
        totalCents: 2400
      }
    ])
  })

  it('blocks cart quantities above available stock', () => {
    const product = makeProduct()
    const stock = new InventoryItem({
      productId: product.id,
      quantity: 2,
      reserved: 1,
      reorderPoint: 1
    })
    const cart = new Cart()

    expect(() => cart.addProduct(product, 2, stock)).toThrow(
      'Cart quantity exceeds available stock'
    )
  })

  it('reserves stock during checkout and creates an approved order flow', () => {
    const product = makeProduct()
    const stock = new InventoryItem({
      productId: product.id,
      quantity: 5,
      reorderPoint: 2
    })
    const cart = new Cart()
    cart.addProduct(product, 2, stock)
    const stockService = new StockService([stock])
    const checkout = new CheckoutService(stockService)

    const order = checkout.createOrder({
      cart,
      customerId: 'student-1',
      customerName: 'Aluno Teste',
      paymentMethod: 'pix',
      pickupTime: '10:30'
    })
    order.payment.approve()
    order.advance('queued')

    expect(order.status).toBe('queued')
    expect(order.payment.status).toBe('approved')
    expect(stock.availableQuantity).toBe(3)
  })

  it('uses a FIFO queue for order preparation', () => {
    const queue = new Queue<string>()

    queue.enqueue('DF-1')
    queue.enqueue('DF-2')
    queue.enqueue('DF-3')

    expect(queue.dequeue()).toBe('DF-1')
    expect(queue.dequeue()).toBe('DF-2')
    expect(queue.peek()).toBe('DF-3')
  })

  it('uses a stack for undoable admin actions', () => {
    const stack = new Stack<string>()

    stack.push('restock')
    stack.push('price-update')

    expect(stack.pop()).toBe('price-update')
    expect(stack.pop()).toBe('restock')
  })

  it('runs the last admin undo action first', () => {
    const undoFirst = vi.fn()
    const undoSecond = vi.fn()
    const history = new AdminActionHistory()

    history.record({
      id: 'a1',
      label: 'Primeira acao',
      createdAt: new Date(),
      undo: undoFirst
    })
    history.record({
      id: 'a2',
      label: 'Segunda acao',
      createdAt: new Date(),
      undo: undoSecond
    })

    const undone = history.undoLast()

    expect(undone?.id).toBe('a2')
    expect(undoSecond).toHaveBeenCalledTimes(1)
    expect(undoFirst).not.toHaveBeenCalled()
  })

  it('separates customer and management permissions by role', () => {
    const customer = new UserProfile({
      id: 'u1',
      name: 'Aluno',
      email: 'aluno@example.com',
      role: 'customer'
    })
    const manager = new UserProfile({
      id: 'u2',
      name: 'Gerente',
      email: 'gerente@example.com',
      role: 'manager'
    })

    expect(customer.canOrder()).toBe(true)
    expect(customer.canManageProducts()).toBe(false)
    expect(manager.canManageOrders()).toBe(true)
    expect(manager.canManageProducts()).toBe(true)
  })
})

