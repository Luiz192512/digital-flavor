import { supabase } from './supabase'

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpCustomer({
  email,
  password,
  fullName
}: {
  email: string
  password: string
  fullName: string
}) {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
}

export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
}

export async function signOut() {
  if (!supabase) {
    return
  }

  await supabase.auth.signOut()
}
