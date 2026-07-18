import { supabase } from './supabase'

export interface InventoryChange {
  productId: string
  quantity: number
  reserved: number
}

// Assina as mudanças de estoque via Supabase Realtime (Postgres Changes na
// tabela inventory). Retorna a função de unsubscribe. No-op sem Supabase.
export function subscribeInventory(onChange: (change: InventoryChange) => void): () => void {
  if (!supabase) {
    return () => {}
  }

  const client = supabase
  const channel = client
    .channel('inventory-changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'inventory' },
      (payload) => {
        const row = payload.new as { product_id?: string; quantity?: number; reserved?: number }

        if (typeof row.product_id === 'string' && typeof row.quantity === 'number') {
          onChange({
            productId: row.product_id,
            quantity: row.quantity,
            reserved: row.reserved ?? 0
          })
        }
      }
    )
    .subscribe()

  return () => {
    void client.removeChannel(channel)
  }
}
