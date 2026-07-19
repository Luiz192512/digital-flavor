import { formatCurrency } from '../utils/format'

interface FichaProps {
  code: string
  canteenName: string
  pickupTime: string
  totalCents: number
  statusLabel?: string
  animate?: boolean
}

// A assinatura visual do Rapidinha: a ficha de retirada da cantina — cartão
// vermelho com furos laterais, código grande em mono e canhoto pontilhado.
export function Ficha({ code, canteenName, pickupTime, totalCents, statusLabel, animate }: FichaProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[10px] bg-brand-red px-5 pt-4 text-[#FFF6F0] ${
        animate ? 'ficha-entrando' : ''
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-85">
        Ficha de retirada
      </p>
      <p className="mb-2 mt-1 font-mono text-4xl font-bold tracking-[0.04em]">{code}</p>
      <div
        className="flex flex-wrap justify-between gap-2 border-t-2 border-dashed border-[#FFF6F0]/55 py-2.5 pb-3.5 text-xs"
      >
        <span>
          Cantina
          <b className="block text-[13px]">{canteenName}</b>
        </span>
        <span>
          Retirada
          <b className="block text-[13px]">{pickupTime}</b>
        </span>
        <span>
          Total
          <b className="block text-[13px]">{formatCurrency(totalCents)}</b>
        </span>
        {statusLabel ? (
          <span>
            Status
            <b className="block text-[13px]">{statusLabel}</b>
          </span>
        ) : null}
      </div>
      {/* furos da ficha */}
      <span className="absolute -left-2 bottom-11 h-4 w-4 rounded-full bg-brand-surface" aria-hidden="true" />
      <span className="absolute -right-2 bottom-11 h-4 w-4 rounded-full bg-brand-surface" aria-hidden="true" />
    </div>
  )
}
