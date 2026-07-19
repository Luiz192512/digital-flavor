export const brandColors = {
  red: '#C82828',
  redDark: '#A61F1F',
  redSoft: '#F6E7E2',
  green: '#2F5D50',
  gold: '#A8842C',
  ink: '#231F1C',
  muted: '#7A736C',
  paper: '#FCFBF7',
  line: '#E7E2DA',
  white: '#FFFFFF'
} as const

// Tons dos carimbos de status (a cor do texto é também a da borda, via
// currentColor no componente StatusBadge).
export const statusTone = {
  success: {
    label: 'Disponivel',
    className: 'text-brand-green'
  },
  info: {
    label: 'Operacional',
    className: 'text-brand-ink/70'
  },
  warning: {
    label: 'Atencao',
    className: 'text-brand-gold'
  },
  danger: {
    label: 'Critico',
    className: 'text-brand-red'
  },
  neutral: {
    label: 'Neutro',
    className: 'text-brand-muted'
  }
} as const

export type StatusTone = keyof typeof statusTone
