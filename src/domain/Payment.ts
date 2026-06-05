import type { PaymentMethod, PaymentStatus } from './types'

export interface PaymentProps {
  id: string
  method: PaymentMethod
  amountCents: number
  status?: PaymentStatus
}

export class Payment {
  readonly id: string
  method: PaymentMethod
  amountCents: number
  status: PaymentStatus

  constructor(props: PaymentProps) {
    if (props.amountCents < 0) {
      throw new Error('Payment amount cannot be negative')
    }

    this.id = props.id
    this.method = props.method
    this.amountCents = props.amountCents
    this.status = props.status ?? 'pending'
  }

  approve() {
    this.status = 'approved'
  }

  refuse() {
    this.status = 'refused'
  }

  refund() {
    if (this.status !== 'approved') {
      throw new Error('Only approved payments can be refunded')
    }

    this.status = 'refunded'
  }
}

