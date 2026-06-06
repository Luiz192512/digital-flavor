export type AuthRole = 'student' | 'admin'

export interface AuthSession {
  role: AuthRole
  name: string
  email: string
}

export interface CustomerProfileDetails {
  name: string
  email: string
  phone: string
  classroom: string
  shift: 'manha' | 'tarde' | 'noite'
}

export interface CustomerPreferences {
  quickPickup: boolean
  orderUpdates: boolean
  receiptEmail: boolean
  defaultPickupTime: string
}

export interface SavedPaymentMethod {
  id: string
  type: 'pix' | 'card' | 'cash'
  label: string
  detail: string
  preferred: boolean
}

export interface StudentAccount {
  name: string
  email: string
  password: string
}

export const adminCredential = {
  email: 'admin@digitalflavor.com',
  password: 'Admin@2026'
} as const

const studentsKey = 'digital-flavor-students'
const sessionKey = 'digital-flavor-session'
const profileKeyPrefix = 'digital-flavor-profile'
const preferencesKeyPrefix = 'digital-flavor-preferences'
const paymentMethodsKeyPrefix = 'digital-flavor-payment-methods'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function customerKey(prefix: string, email: string) {
  return `${prefix}:${normalizeEmail(email)}`
}

function readJson<T>(key: string, fallback: T) {
  if (!canUseStorage()) {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

export function readStudentAccounts(): StudentAccount[] {
  if (!canUseStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(studentsKey)
    return raw ? (JSON.parse(raw) as StudentAccount[]) : []
  } catch {
    return []
  }
}

export function registerStudentAccount(account: StudentAccount) {
  const email = normalizeEmail(account.email)
  const existing = readStudentAccounts().filter((student) => student.email !== email)
  const nextAccount = {
    name: account.name.trim(),
    email,
    password: account.password
  }

  if (canUseStorage()) {
    window.localStorage.setItem(studentsKey, JSON.stringify([...existing, nextAccount]))
  }

  return nextAccount
}

export function authenticateUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email)

  if (
    normalizedEmail === adminCredential.email &&
    password === adminCredential.password
  ) {
    return {
      role: 'admin',
      name: 'Administrador Digital Flavor',
      email: adminCredential.email
    } satisfies AuthSession
  }

  const student = readStudentAccounts().find((account) => account.email === normalizedEmail)

  if (!student) {
    return {
      error: 'missing-account' as const,
      message: 'Aluno sem cadastro. Crie sua conta antes de entrar.'
    }
  }

  if (student.password !== password) {
    return {
      error: 'invalid-password' as const,
      message: 'Senha incorreta para este aluno.'
    }
  }

  return {
    role: 'student',
    name: student.name,
    email: student.email
  } satisfies AuthSession
}

export function readSession() {
  if (!canUseStorage()) {
    return undefined
  }

  try {
    const raw = window.localStorage.getItem(sessionKey)
    return raw ? (JSON.parse(raw) as AuthSession) : undefined
  } catch {
    return undefined
  }
}

export function saveSession(session: AuthSession) {
  if (canUseStorage()) {
    window.localStorage.setItem(sessionKey, JSON.stringify(session))
  }
}

export function clearSession() {
  if (canUseStorage()) {
    window.localStorage.removeItem(sessionKey)
  }
}

export function defaultCustomerProfile(session?: AuthSession): CustomerProfileDetails {
  return {
    name: session?.name ?? '',
    email: session?.email ?? '',
    phone: '',
    classroom: '',
    shift: 'manha'
  }
}

export function readCustomerProfile(session?: AuthSession) {
  if (!session) {
    return defaultCustomerProfile()
  }

  return readJson(
    customerKey(profileKeyPrefix, session.email),
    defaultCustomerProfile(session)
  )
}

export function saveCustomerProfile(profile: CustomerProfileDetails) {
  writeJson(customerKey(profileKeyPrefix, profile.email), profile)
}

export function defaultCustomerPreferences(): CustomerPreferences {
  return {
    quickPickup: true,
    orderUpdates: true,
    receiptEmail: true,
    defaultPickupTime: '10:30'
  }
}

export function readCustomerPreferences(session?: AuthSession) {
  if (!session) {
    return defaultCustomerPreferences()
  }

  return readJson(
    customerKey(preferencesKeyPrefix, session.email),
    defaultCustomerPreferences()
  )
}

export function saveCustomerPreferences(session: AuthSession, preferences: CustomerPreferences) {
  writeJson(customerKey(preferencesKeyPrefix, session.email), preferences)
}

export function defaultPaymentMethods(): SavedPaymentMethod[] {
  return [
    {
      id: 'pix',
      type: 'pix',
      label: 'PIX',
      detail: 'Pagamento instantaneo na retirada',
      preferred: true
    },
    {
      id: 'card',
      type: 'card',
      label: 'Cartao',
      detail: 'Debito ou credito no balcao',
      preferred: false
    },
    {
      id: 'cash',
      type: 'cash',
      label: 'Dinheiro',
      detail: 'Pagamento em especie na retirada',
      preferred: false
    }
  ]
}

export function readPaymentMethods(session?: AuthSession) {
  if (!session) {
    return defaultPaymentMethods()
  }

  return readJson(
    customerKey(paymentMethodsKeyPrefix, session.email),
    defaultPaymentMethods()
  )
}

export function savePaymentMethods(session: AuthSession, methods: SavedPaymentMethod[]) {
  writeJson(customerKey(paymentMethodsKeyPrefix, session.email), methods)
}
