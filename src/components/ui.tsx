import { clsx } from 'clsx'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { statusTone, type StatusTone } from '../theme/colors'

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'

const buttonVariantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-orange-500 text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600 focus-visible:outline-orange-500',
  secondary:
    'bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 focus-visible:outline-blue-600',
  quiet:
    'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
  danger:
    'bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700 focus-visible:outline-red-600'
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
        'rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60',
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
    success: 'bg-green-500',
    info: 'bg-blue-600',
    warning: 'bg-orange-500',
    danger: 'bg-red-600'
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

