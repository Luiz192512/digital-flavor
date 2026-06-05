import type { UserRole } from './types'

const managementRoles: UserRole[] = ['employee', 'manager', 'admin']

export interface UserProfileProps {
  id: string
  name: string
  email: string
  role: UserRole
}

export class UserProfile {
  readonly id: string
  name: string
  email: string
  role: UserRole

  constructor(props: UserProfileProps) {
    this.id = props.id
    this.name = props.name
    this.email = props.email
    this.role = props.role
  }

  canOrder() {
    return this.role === 'customer'
  }

  canManageOrders() {
    return managementRoles.includes(this.role)
  }

  canManageProducts() {
    return this.role === 'manager' || this.role === 'admin'
  }

  canAdministerUsers() {
    return this.role === 'admin'
  }
}

