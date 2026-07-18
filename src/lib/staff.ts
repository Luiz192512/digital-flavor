import { supabase } from './supabase'

export interface StaffContext {
  isPlatformAdmin: boolean
  canteenIds: string[]
  isStaff: boolean
}

// Papel vindo do SERVIDOR (profiles.role + vínculos em canteen_staff), nunca
// de metadata editável pelo cliente. A RLS permite ler o próprio perfil e os
// próprios vínculos; a barreira real das mutações são as policies de staff.
export async function fetchStaffContext(): Promise<StaffContext | null> {
  if (!supabase) {
    return null
  }

  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return null
  }

  const [profileResult, staffResult] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', authData.user.id).maybeSingle(),
    supabase.from('canteen_staff').select('canteen_id').eq('profile_id', authData.user.id)
  ])

  if (profileResult.error || staffResult.error) {
    return null
  }

  const isPlatformAdmin = profileResult.data?.role === 'admin'
  const canteenIds = (staffResult.data ?? []).map((row) => row.canteen_id)

  return {
    isPlatformAdmin,
    canteenIds,
    isStaff: isPlatformAdmin || canteenIds.length > 0
  }
}
