import { clsx } from 'clsx'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { statusTone, type StatusTone } from '../theme/colors'

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'

const buttonVariantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-red text-white shadow-sm shadow-brand-red/20 hover:bg-brand-red-dark focus-visible:outline-brand-red',
  secondary:
    'bg-brand-wine text-white shadow-sm shadow-brand-wine/20 hover:bg-brand-red-dark focus-visible:outline-brand-wine',
  quiet:
    'border border-brand-line bg-white text-brand-muted hover:border-brand-red/30 hover:bg-brand-paper focus-visible:outline-brand-muted',
  danger:
    'bg-brand-red-dark text-white shadow-sm shadow-brand-red/20 hover:bg-brand-wine focus-visible:outline-brand-red-dark'
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant }) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariantClass[variant],
        className
      )}
      {...props}
    />
  )
}

export function Panel({
  className,
  ...props
}: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={clsx(
        'rounded-lg border border-brand-line bg-white shadow-sm shadow-brand',
        className
      )}
      {...props}
    />
  )
}

export function StatusBadge({
  tone = 'neutral',
  children
}: {
  tone?: StatusTone
  children?: ReactNode
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        statusTone[tone].className
      )}
    >
      {children ?? statusTone[tone].label}
    </span>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral'
}: {
  label: string
  value: string
  detail: string
  tone?: StatusTone
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <StatusBadge tone={tone} />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  )
}

export function ProgressBar({
  value,
  tone = 'success'
}: {
  value: number
  tone?: Extract<StatusTone, 'success' | 'info' | 'warning' | 'danger'>
}) {
  const colorClass = {
    success: 'bg-brand-red',
    info: 'bg-brand-wine',
    warning: 'bg-brand-gold',
    danger: 'bg-brand-red-dark'
  }[tone]

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={clsx('h-full rounded-full transition-all', colorClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
