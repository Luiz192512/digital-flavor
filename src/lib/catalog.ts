import { InventoryItem, Product } from '../domain'
import { supabase } from './supabase'

export interface Catalog {
  products: Product[]
  inventory: InventoryItem[]
}

// Carrega catálogo e estoque reais do Supabase, mapeados para as classes de
// domínio da UI. Retorna null quando o Supabase não está configurado ou o
// banco não tem catálogo (o chamador mantém o seed local nesses casos).
// As policies de leitura exigem usuário autenticado — chamar apenas com
// sessão Supabase ativa. `canteenId` restringe o cardápio à cantina da rota
// (marketplace v3: cada cantina tem o próprio menu).
export async function fetchCatalog(canteenId?: string): Promise<Catalog | null> {
  if (!supabase) {
    return null
  }

  let productsQuery = supabase
    .from('products')
    .select('id,name,description,category,price_cents,preparation_minutes,sustainability_score,active')

  if (canteenId) {
    productsQuery = productsQuery.eq('canteen_id', canteenId)
  }

  const [productsResult, inventoryResult] = await Promise.all([
    productsQuery,
    supabase.from('inventory').select('product_id,quantity,reserved,reorder_point,expires_at')
  ])

  if (productsResult.error) {
    throw new Error(productsResult.error.message)
  }

  if (inventoryResult.error) {
    throw new Error(inventoryResult.error.message)
  }

  if (!productsResult.data || productsResult.data.length === 0) {
    return null
  }

  const products = productsResult.data.map(
    (row) =>
      new Product({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        priceCents: row.price_cents,
        preparationMinutes: row.preparation_minutes,
        sustainabilityScore: row.sustainability_score,
        active: row.active
      })
  )

  const inventory = (inventoryResult.data ?? []).map(
    (row) =>
      new InventoryItem({
        productId: row.product_id,
        quantity: row.quantity,
        reserved: row.reserved,
        reorderPoint: row.reorder_point,
        expiresAt: row.expires_at ? new Date(row.expires_at) : undefined
      })
  )

  return { products, inventory }
}
