import { supabase } from './supabase'

export interface CanteenInfo {
  id: string
  slug: string
  name: string
  location: string
  prepMinutes: number
  active: boolean
  queueSize: number
}

// Cantina única do modo demo (sem Supabase).
export const demoCanteens: CanteenInfo[] = [
  {
    id: 'demo-central',
    slug: 'cantina-central',
    name: 'Cantina Central',
    location: 'Bloco 7',
    prepMinutes: 8,
    active: true,
    queueSize: 0
  }
]

// Cantinas ativas + tamanho de fila (RPC agregada; a RLS de orders não deixa
// o cliente contar pedidos alheios, então o número vem do servidor).
export async function fetchCanteens(): Promise<CanteenInfo[] | null> {
  if (!supabase) {
    return null
  }

  const [canteensResult, queueResult] = await Promise.all([
    supabase.from('canteens').select('id,slug,name,location,prep_minutes,active').order('name'),
    supabase.rpc('canteen_queue_sizes')
  ])

  if (canteensResult.error) {
    throw new Error(canteensResult.error.message)
  }

  if (!canteensResult.data || canteensResult.data.length === 0) {
    return null
  }

  const queueByCanteen = new Map(
    (queueResult.data ?? []).map((row) => [row.canteen_id, row.queue_size])
  )

  return canteensResult.data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    location: row.location,
    prepMinutes: row.prep_minutes,
    active: row.active,
    queueSize: queueByCanteen.get(row.id) ?? 0
  }))
}
