import { Leaf, PackageCheck, Timer, WalletCards } from 'lucide-react'

import { MetricCard, Panel, ProgressBar } from '../../components/ui'
import canteenOrdering from '../../assets/canteen-ordering.png'
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format'

interface SustainabilityStripProps {
  salesCents: number
  activeStock: number
  queuedOrders: number
  wasteReduction: number
}

export function SustainabilityStrip({
  salesCents,
  activeStock,
  queuedOrders,
  wasteReduction
}: SustainabilityStripProps) {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-5 py-6 md:grid-cols-4">
      <Panel className="overflow-hidden md:col-span-4">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Proposta de valor
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Pedido do aluno e gestao da cantina trabalhando juntos.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              O Digital Flavor reduz fila, melhora previsao de preparo e ajuda a escola a
              controlar estoque com menos desperdicio. A mesma tela mostra compra,
              operacao e indicadores de sustentabilidade.
            </p>
          </div>
          <img
            src={canteenOrdering}
            alt="Aluno usando celular para pedir alimentos em uma cantina escolar"
            className="h-full min-h-[280px] w-full object-cover"
          />
        </div>
      </Panel>

      <MetricCard
        label="Vendas do dia"
        value={formatCurrency(salesCents)}
        detail="Pedidos antecipados e balcão"
        tone="info"
      />
      <MetricCard
        label="Estoque ativo"
        value={formatNumber(activeStock)}
        detail="Unidades disponiveis"
        tone="success"
      />
      <MetricCard
        label="Fila agora"
        value={`${queuedOrders} pedidos`}
        detail="FIFO por horario de chegada"
        tone="warning"
      />
      <MetricCard
        label="Desperdicio"
        value={formatPercent(wasteReduction)}
        detail="Reducao estimada semanal"
        tone="success"
      />

      <Panel className="md:col-span-4">
        <div className="grid gap-4 p-5 md:grid-cols-4">
          <div className="flex items-start gap-3">
            <Leaf className="mt-1 text-green-600" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">Verde para sustentabilidade</h2>
              <p className="mt-1 text-sm text-slate-600">Disponibilidade, ODS 12 e frescor.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <PackageCheck className="mt-1 text-blue-600" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">Azul para operacao</h2>
              <p className="mt-1 text-sm text-slate-600">Status, gestao e confianca.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <WalletCards className="mt-1 text-orange-500" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">Laranja para acao</h2>
              <p className="mt-1 text-sm text-slate-600">Compra, apetite e chamadas.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Timer className="mt-1 text-red-600" aria-hidden="true" />
            <div className="w-full">
              <h2 className="font-bold text-slate-950">Vermelho para risco</h2>
              <p className="mt-1 text-sm text-slate-600">Estoque critico e indisponivel.</p>
              <div className="mt-3">
                <ProgressBar value={18} tone="danger" />
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  )
}
