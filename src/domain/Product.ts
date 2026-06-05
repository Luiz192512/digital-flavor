import type { ProductCategory } from './types'

export interface ProductProps {
  id: string
  name: string
  description: string
  category: ProductCategory
  priceCents: number
  preparationMinutes: number
  sustainabilityScore: number
  active?: boolean
}

export class Product {
  readonly id: string
  name: string
  description: string
  category: ProductCategory
  priceCents: number
  preparationMinutes: number
  sustainabilityScore: number
  active: boolean

  constructor(props: ProductProps) {
    if (props.priceCents < 0) {
      throw new Error('Product price cannot be negative')
    }

    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.category = props.category
    this.priceCents = props.priceCents
    this.preparationMinutes = props.preparationMinutes
    this.sustainabilityScore = Math.max(0, Math.min(100, props.sustainabilityScore))
    this.active = props.active ?? true
  }

  updatePrice(priceCents: number) {
    if (priceCents < 0) {
      throw new Error('Product price cannot be negative')
    }

    this.priceCents = priceCents
  }

  deactivate() {
    this.active = false
  }

  activate() {
    this.active = true
  }

  get priceLabel() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.priceCents / 100)
  }
}

