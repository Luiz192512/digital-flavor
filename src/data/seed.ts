import { InventoryItem, Order, Payment, Product } from '../domain'

export const seedProducts = [
  new Product({
    id: 'sandwich-natural',
    name: 'Sanduiche natural',
    description: 'Pao integral, frango, cenoura e alface. Ideal para retirada rapida.',
    category: 'lanche',
    priceCents: 1290,
    preparationMinutes: 8,
    sustainabilityScore: 92
  }),
  new Product({
    id: 'suco-integral',
    name: 'Suco integral',
    description: 'Suco de laranja sem acucar, gelado e pronto para o intervalo.',
    category: 'bebida',
    priceCents: 690,
    preparationMinutes: 2,
    sustainabilityScore: 78
  }),
  new Product({
    id: 'salada-frutas',
    name: 'Salada de frutas',
    description: 'Frutas selecionadas do dia em porcao individual.',
    category: 'fruta',
    priceCents: 890,
    preparationMinutes: 4,
    sustainabilityScore: 96
  }),
  new Product({
    id: 'combo-responsavel',
    name: 'Combo intervalo',
    description: 'Sanduiche, fruta e suco com desconto para pedido antecipado.',
    category: 'combo',
    priceCents: 2190,
    preparationMinutes: 10,
    sustainabilityScore: 94
  }),
  new Product({
    id: 'pao-queijo',
    name: 'Pao de queijo',
    description: 'Porcao assada e pronta para retirada no intervalo.',
    category: 'lanche',
    priceCents: 590,
    preparationMinutes: 6,
    sustainabilityScore: 71
  })
]

export const seedInventory = [
  new InventoryItem({
    productId: 'sandwich-natural',
    quantity: 36,
    reserved: 8,
    reorderPoint: 12,
    expiresAt: new Date('2026-06-05T15:00:00')
  }),
  new InventoryItem({
    productId: 'suco-integral',
    quantity: 52,
    reserved: 11,
    reorderPoint: 18,
    expiresAt: new Date('2026-06-08T15:00:00')
  }),
  new InventoryItem({
    productId: 'salada-frutas',
    quantity: 19,
    reserved: 5,
    reorderPoint: 10,
    expiresAt: new Date('2026-06-04T18:00:00')
  }),
  new InventoryItem({
    productId: 'combo-responsavel',
    quantity: 22,
    reserved: 7,
    reorderPoint: 8,
    expiresAt: new Date('2026-06-05T18:00:00')
  }),
  new InventoryItem({
    productId: 'pao-queijo',
    quantity: 8,
    reserved: 3,
    reorderPoint: 14,
    expiresAt: new Date('2026-06-04T16:00:00')
  })
]

export const seedOrders = [
  new Order({
    id: 'DF-1024',
    customerId: 'student-1',
    customerName: 'Marina Alves',
    pickupTime: '10:10',
    pickupCode: 'A19Q',
    status: 'queued',
    payment: new Payment({
      id: 'PAY-1024',
      method: 'pix',
      amountCents: 2190,
      status: 'approved'
    }),
    items: [
      {
        productId: 'combo-responsavel',
        name: 'Combo intervalo',
        unitPriceCents: 2190,
        quantity: 1,
        totalCents: 2190
      }
    ]
  }),
  new Order({
    id: 'DF-1025',
    customerId: 'student-2',
    customerName: 'Pedro Lima',
    pickupTime: '10:18',
    pickupCode: 'B42K',
    status: 'queued',
    payment: new Payment({
      id: 'PAY-1025',
      method: 'card',
      amountCents: 1580,
      status: 'approved'
    }),
    items: [
      {
        productId: 'salada-frutas',
        name: 'Salada de frutas',
        unitPriceCents: 890,
        quantity: 1,
        totalCents: 890
      },
      {
        productId: 'suco-integral',
        name: 'Suco integral',
        unitPriceCents: 690,
        quantity: 1,
        totalCents: 690
      }
    ]
  }),
  new Order({
    id: 'DF-1026',
    customerId: 'student-3',
    customerName: 'Rafael Costa',
    pickupTime: '10:30',
    pickupCode: 'C08N',
    status: 'queued',
    payment: new Payment({
      id: 'PAY-1026',
      method: 'pix',
      amountCents: 1290,
      status: 'approved'
    }),
    items: [
      {
        productId: 'sandwich-natural',
        name: 'Sanduiche natural',
        unitPriceCents: 1290,
        quantity: 1,
        totalCents: 1290
      }
    ]
  })
]
