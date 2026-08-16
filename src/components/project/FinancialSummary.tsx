import type { ReactNode } from 'react'
import { Landmark, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { amountToInvest, profitPercent } from '../../lib/finance'
import { formatPercent } from '../../lib/format'
import type { ProjectTotals } from '../../types/finance'
import { Card } from '../ui/Card'
import { Money } from '../ui/Money'

export function FinancialSummary({
  budget,
  materialsBudget,
  laborBudget,
  totals,
}: {
  budget: number
  materialsBudget: number
  laborBudget: number
  totals: ProjectTotals
}) {
  const percent = profitPercent(budget, totals.estimatedProfit)
  const profitPositive = totals.estimatedProfit >= 0
  const toInvest = amountToInvest({
    materialsBudget,
    materialsPurchased: totals.materialsPurchased,
    laborBudget,
    laborCost: totals.laborCost,
  })

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-facil-accent" />
        <h2 className="text-sm font-semibold text-facil-text">Resumen financiero</h2>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <SummaryItem label="Presupuesto">
          <Money amount={budget} className="text-base font-semibold" />
        </SummaryItem>
        <SummaryItem label="Costo real">
          <Money amount={totals.realCost} className="text-base font-semibold" />
        </SummaryItem>
        <SummaryItem label="Pagos recibidos">
          <Money amount={totals.paymentsReceived} className="text-base font-semibold" />
        </SummaryItem>
        <SummaryItem label="Falta por cobrar">
          <Money amount={Math.max(0, totals.pendingBalance)} className="text-base font-semibold text-amber-700" />
        </SummaryItem>
      </dl>

      <div className="flex items-center justify-between rounded-[10px] bg-blue-50 px-3 py-3">
        <div>
          <p className="text-xs font-medium text-blue-800">Falta por invertir</p>
          <p className="mt-0.5 text-[11px] text-facil-text-secondary">
            Materiales y mano de obra pendientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-blue-700" />
          <Money amount={toInvest} className="text-lg font-bold text-blue-800" />
        </div>
      </div>

      <div
        className={`flex items-center justify-between rounded-[10px] px-3 py-3 ${
          profitPositive ? 'bg-emerald-50' : 'bg-red-50'
        }`}
      >
        <div>
          <p className={`text-xs font-medium ${profitPositive ? 'text-emerald-800' : 'text-red-800'}`}>
            Utilidad estimada
          </p>
          <p className="mt-0.5 text-xs text-facil-text-secondary">{formatPercent(percent)}</p>
        </div>
        <div className="flex items-center gap-2">
          {profitPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <Money amount={totals.estimatedProfit} signed className="text-lg font-bold" />
        </div>
      </div>

      <p className="text-[11px] text-facil-text-secondary">
        Costo real = materiales comprados + mano de obra. Falta por invertir = lo que falta gastar vs
        presupuesto de materiales y de mano de obra. Falta por cobrar = presupuesto − pagos
        recibidos. Utilidad = presupuesto − costo real.
      </p>
    </Card>
  )
}

function SummaryItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] text-facil-text-secondary">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
