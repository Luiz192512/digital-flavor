import {
  BarChart3,
  Leaf,
  PackageCheck,
  ShoppingCart,
  Timer,
  Utensils
} from 'lucide-react'

import canteenOrdering from './assets/canteen-ordering.png'
import { Button, MetricCard, Panel, ProgressBar, StatusBadge } from './components/ui'

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
              <Utensils size={21} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Digital Flavor</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Cantina escolar inteligente
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#cardapio">Cardapio</a>
            <a href="#gestao">Gestao</a>
            <a href="#estoque">Estoque</a>
            <a href="#relatorios">Relatorios</a>
          </nav>
          <Button type="button" className="hidden sm:inline-flex">
            Abrir pedido
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center">
          <StatusBadge tone="success">ODS 12 + cantina sem filas</StatusBadge>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Pedido do aluno e gestao da cantina em uma unica plataforma.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Antecipe pedidos, reduza desperdicio, acompanhe estoque em tempo real e
            organize a fila de preparo com uma experiencia visual clara para escola,
            alunos e equipe da cantina.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button">
              <ShoppingCart size={18} aria-hidden="true" />
              Montar pedido
            </Button>
            <Button type="button" variant="secondary">
              <BarChart3 size={18} aria-hidden="true" />
              Ver gestao
            </Button>
          </div>
        </div>

        <Panel className="overflow-hidden">
          <img
            src={canteenOrdering}
            alt="Aluno usando o Digital Flavor para pedir alimentos na cantina escolar"
            className="aspect-[16/10] w-full object-cover"
          />
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <MetricCard
              label="Fila media"
              value="4 min"
              detail="Retirada planejada"
              tone="info"
            />
            <MetricCard
              label="Estoque"
              value="91%"
              detail="Itens disponiveis"
              tone="success"
            />
            <MetricCard
              label="Desperdicio"
              value="-28%"
              detail="Meta semanal"
              tone="warning"
            />
          </div>
        </Panel>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-10 md:grid-cols-3">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <Leaf className="text-green-600" aria-hidden="true" />
            <h2 className="text-lg font-bold">Cores com funcao</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Verde comunica sustentabilidade, azul organiza operacoes, laranja guia a
            compra e vermelho aparece apenas em estados criticos.
          </p>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <PackageCheck className="text-blue-600" aria-hidden="true" />
            <h2 className="text-lg font-bold">Estoque legivel</h2>
          </div>
          <div className="mt-4 space-y-3">
            <ProgressBar value={84} tone="success" />
            <ProgressBar value={44} tone="warning" />
            <ProgressBar value={16} tone="danger" />
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <Timer className="text-orange-500" aria-hidden="true" />
            <h2 className="text-lg font-bold">Retirada antecipada</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            A interface conecta pedido, preparo e pagamento para diminuir filas e
            melhorar a previsao de producao da cantina.
          </p>
        </Panel>
      </section>
    </main>
  )
}
