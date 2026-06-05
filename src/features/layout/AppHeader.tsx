import { BarChart3, Leaf, Search, ShoppingCart, Utensils } from 'lucide-react'

import { Button, StatusBadge } from '../../components/ui'

export type ViewMode = 'student' | 'management'

interface AppHeaderProps {
  viewMode: ViewMode
  cartItems: number
  queuedOrders: number
  onViewModeChange: (mode: ViewMode) => void
}

export function AppHeader({
  viewMode,
  cartItems,
  queuedOrders,
  onViewModeChange
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-600 text-white">
              <Utensils size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">Digital Flavor</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cantina escolar sustentavel
              </p>
            </div>
          </div>
          <StatusBadge tone="success">ODS 12</StatusBadge>
        </div>

        <div className="flex flex-1 flex-col gap-3 lg:max-w-3xl lg:flex-row lg:items-center">
          <label className="flex min-h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Buscar</span>
            <input
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Buscar produto, pedido ou relatorio"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                viewMode === 'student'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              onClick={() => onViewModeChange('student')}
            >
              <ShoppingCart size={17} aria-hidden="true" />
              Aluno
            </button>
            <button
              type="button"
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                viewMode === 'management'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              onClick={() => onViewModeChange('management')}
            >
              <BarChart3 size={17} aria-hidden="true" />
              Gestao
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="quiet"
            onClick={() => onViewModeChange('management')}
          >
            Fila {queuedOrders}
          </Button>
          <Button type="button" onClick={() => onViewModeChange('student')}>
            Pedido {cartItems}
          </Button>
        </div>

        <div className="hidden items-center gap-2 text-xs font-semibold text-green-700 xl:flex">
          <Leaf size={16} aria-hidden="true" />
          Consumo responsavel em tempo real
        </div>
      </div>
    </header>
  )
}

