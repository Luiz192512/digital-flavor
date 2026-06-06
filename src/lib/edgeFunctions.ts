import type {
  CustomerPreferences,
  CustomerProfileDetails,
  SavedPaymentMethod
} from '../auth/demoAuth'
import { supabase } from './supabase'

export interface CustomerExperiencePayload {
  profile: CustomerProfileDetails
  preferences: CustomerPreferences
  paymentMethods: SavedPaymentMethod[]
}

export async function saveCustomerExperience(payload: CustomerExperiencePayload) {
  if (!supabase) {
    return { synced: false, reason: 'Supabase is not configured' }
  }

  const { error } = await supabase.functions.invoke('customer-preferences', {
    body: payload
  })

  if (error) {
    return { synced: false, reason: error.message }
  }

  return { synced: true }
}

export async function fetchCustomerExperience() {
  if (!supabase) {
    return { synced: false, reason: 'Supabase is not configured' }
  }

  const { data, error } = await supabase.functions.invoke('customer-preferences', {
    method: 'GET'
  })

  if (error) {
    return { synced: false, reason: error.message }
  }

  return { synced: true, data }
}
