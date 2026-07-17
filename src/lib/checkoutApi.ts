import type { PaymentMethod } from '../domain'
import { supabase } from './supabase'

export interface CheckoutItemInput {
  productId: string
  quantity: number
}

export interface CheckoutResult {
  orderId: string
  pickupCode: string
  totalCents: number
}

// Erros de negócio da RPC (RAISE EXCEPTION no Postgres) → mensagem para a UI.
function translateCheckoutError(message: string): string {
  if (message.startsWith('insufficient_stock')) {
    return 'Um dos itens do carrinho acabou de esgotar. Atualize as quantidades e tente de novo.'
  }

  if (message.startsWith('product_inactive') || message.startsWith('product_not_found')) {
    return 'Um dos itens do carrinho saiu do cardapio. Remova-o para continuar.'
  }

  if (message === 'empty_cart' || message === 'invalid_quantity') {
    return 'Carrinho invalido. Revise os itens e tente de novo.'
  }

  if (message === 'mixed_canteens') {
    return 'O pedido deve conter itens de uma unica cantina.'
  }

  if (message === 'not_authenticated' || message === 'profile_not_found') {
    return 'Sessao expirada. Entre novamente para confirmar o pedido.'
  }

  return message
}

// Confirma o pedido no servidor via RPC atômica: preço, estoque e cantina são
// decididos pelo Postgres — o cliente envia apenas produto + quantidade.
export async function submitCheckout(
  items: CheckoutItemInput[],
  pickupTime: string,
  paymentMethod: PaymentMethod
): Promise<CheckoutResult> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase.rpc('checkout', {
    p_items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    p_pickup_time: pickupTime,
    p_payment_method: paymentMethod
  })

  if (error) {
    throw new Error(translateCheckoutError(error.message))
  }

  const row = Array.isArray(data) ? data[0] : undefined

  if (!row) {
    throw new Error('O servidor nao confirmou o pedido. Tente novamente.')
  }

  return {
    orderId: row.order_id,
    pickupCode: row.pickup_code,
    totalCents: row.total_cents
  }
}
