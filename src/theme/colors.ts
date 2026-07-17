export const brandColors = {
  red: '#C82828',
  redDark: '#A91F26',
  redSoft: '#F4DDDD',
  wine: '#741533',
  gold: '#D8A45D',
  coolSoft: '#C8D0E8',
  graphite: '#201C1F',
  slate: '#6B6568',
  softGray: '#F7F7F9',
  border: '#DEDEE4',
  white: '#FFFFFF'
} as const

export const statusTone = {
  success: {
    label: 'Disponivel',
    className: 'bg-brand-red-soft text-brand-wine ring-brand-red/20'
  },
  info: {
    label: 'Operacional',
    className: 'bg-brand-cool-soft text-brand-wine ring-brand-wine/20'
  },
  warning: {
    label: 'Atencao',
    className: 'bg-brand-gold/25 text-brand-wine ring-brand-gold/45'
  },
  danger: {
    label: 'Critico',
    className: 'bg-red-50 text-brand-red-dark ring-brand-red/20'
  },
  neutral: {
    label: 'Neutro',
    className: 'bg-brand-paper text-brand-muted ring-brand-line'
  }
} as const

export type StatusTone = keyof typeof statusTone
