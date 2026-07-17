import { createClient } from 'jsr:@supabase/supabase-js@2'

import { corsHeadersFor, jsonResponse } from '../_shared/cors.ts'

function getSupabaseClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? ''
        }
      }
    }
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) })
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Metodo nao permitido.' }, 405, req)
  }

  const supabase = getSupabaseClient(req)
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return jsonResponse({ error: 'Sessao invalida.' }, 401, req)
  }

  const { data: latestOrder, error: orderError } = await supabase
    .from('orders')
    .select('id,status,pickup_time,pickup_code,total_cents,created_at,updated_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (orderError) {
    return jsonResponse({ error: orderError.message }, 400, req)
  }

  const { count: queueLength, error: queueError } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'queued')

  if (queueError) {
    return jsonResponse({ error: queueError.message }, 400, req)
  }

  let position: number | null = null

  if (latestOrder?.status === 'queued') {
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'queued')
      .lte('created_at', latestOrder.created_at)

    if (error) {
      return jsonResponse({ error: error.message }, 400, req)
    }

    position = count ?? null
  }

  return jsonResponse({
    queueLength: queueLength ?? 0,
    latestOrder,
    position
  }, 200, req)
})
