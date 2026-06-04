export const brandColors = {
  green: '#16A34A',
  blue: '#2563EB',
  orange: '#F97316',
  red: '#DC2626',
  graphite: '#111827',
  slate: '#64748B',
  softGray: '#F8FAFC',
  border: '#E5E7EB',
  white: '#FFFFFF'
} as const

export const statusTone = {
  success: {
    label: 'Disponivel',
    className: 'bg-green-50 text-green-700 ring-green-200'
  },
  info: {
    label: 'Operacional',
    className: 'bg-blue-50 text-blue-700 ring-blue-200'
  },
  warning: {
    label: 'Atencao',
    className: 'bg-orange-50 text-orange-700 ring-orange-200'
  },
  danger: {
    label: 'Critico',
    className: 'bg-red-50 text-red-700 ring-red-200'
  },
  neutral: {
    label: 'Neutro',
    className: 'bg-slate-100 text-slate-700 ring-slate-200'
  }
} as const

export type StatusTone = keyof typeof statusTone

