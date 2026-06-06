import { createClient } from 'jsr:@supabase/supabase-js@2'

import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

type PaymentMethod = 'pix' | 'card' | 'cash'

interface PreferencesPayload {
  profile?: {
    name?: string
    phone?: string
    classroom?: string
    shift?: 'manha' | 'tarde' | 'noite'
  }
  preferences?: {
    quickPickup?: boolean
    orderUpdates?: boolean
    receiptEmail?: boolean
    defaultPickupTime?: string
  }
  paymentMethods?: Array<{
    id?: string
    type?: PaymentMethod
    label?: string
    detail?: string
    preferred?: boolean
  }>
}

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
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = getSupabaseClient(req)
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return jsonResponse({ error: 'Sessao invalida.' }, 401)
  }

  if (req.method === 'GET') {
    const [{ data: profile }, { data: preferences }, { data: paymentMethods }] = await Promise.all([
      supabase.from('profiles').select('full_name,email').eq('id', user.id).maybeSingle(),
      supabase.from('customer_preferences').select('*').eq('profile_id', user.id).maybeSingle(),
      supabase
        .from('customer_payment_methods')
        .select('id,method,label,detail,preferred')
        .eq('profile_id', user.id)
        .eq('active', true)
        .order('preferred', { ascending: false })
    ])

    return jsonResponse({
      profile,
      preferences,
      paymentMethods: paymentMethods ?? []
    })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo nao permitido.' }, 405)
  }

  const body = (await req.json()) as PreferencesPayload
  const now = new Date().toISOString()
  const profileName = body.profile?.name?.trim()

  if (profileName) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileName,
        updated_at: now
      })
      .eq('id', user.id)

    if (error) {
      return jsonResponse({ error: error.message }, 400)
    }
  }

  const { error: preferencesError } = await supabase
    .from('customer_preferences')
    .upsert({
      profile_id: user.id,
      phone: body.profile?.phone ?? '',
      classroom: body.profile?.classroom ?? '',
      shift: body.profile?.shift ?? 'manha',
      quick_pickup: body.preferences?.quickPickup ?? true,
      order_updates: body.preferences?.orderUpdates ?? true,
      receipt_email: body.preferences?.receiptEmail ?? true,
      default_pickup_time: body.preferences?.defaultPickupTime ?? '10:30',
      updated_at: now
    })

  if (preferencesError) {
    return jsonResponse({ error: preferencesError.message }, 400)
  }

  if (Array.isArray(body.paymentMethods)) {
    const paymentRows = body.paymentMethods
      .filter((method) => method.type && method.label && method.detail)
      .map((method, index) => ({
        profile_id: user.id,
        method: method.type as PaymentMethod,
        label: String(method.label),
        detail: String(method.detail),
        preferred: method.preferred ?? index === 0,
        active: true,
        updated_at: now
      }))

    const { error: deleteError } = await supabase
      .from('customer_payment_methods')
      .delete()
      .eq('profile_id', user.id)

    if (deleteError) {
      return jsonResponse({ error: deleteError.message }, 400)
    }

    if (paymentRows.length > 0) {
      const { error: insertError } = await supabase
        .from('customer_payment_methods')
        .insert(paymentRows)

      if (insertError) {
        return jsonResponse({ error: insertError.message }, 400)
      }
    }
  }

  return jsonResponse({ ok: true, updatedAt: now })
})
