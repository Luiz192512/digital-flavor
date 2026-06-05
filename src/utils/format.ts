export function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents / 100)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercent(value: number) {
  return `${value > 0 ? '+' : ''}${value}%`
}

