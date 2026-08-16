import { Plus, Trash2 } from 'lucide-react'
import { formatMoney } from '../../lib/format'
import { parseAmount } from '../../lib/parse'
import { MoneyField } from '../ui/Field'

export interface LineDraft {
  key: string
  description: string
  amount: string
}

export function emptyLine(): LineDraft {
  return { key: crypto.randomUUID(), description: '', amount: '' }
}

export function LineItemsFields({
  lines,
  onChange,
}: {
  lines: LineDraft[]
  onChange: (lines: LineDraft[]) => void
}) {
  const total = lines.reduce((acc, line) => acc + parseAmount(line.amount), 0)

  function update(key: string, patch: Partial<LineDraft>) {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-facil-text">Partidas</p>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-facil-primary"
          onClick={() => onChange([...lines, emptyLine()])}
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>
      {lines.map((line, index) => (
        <div key={line.key} className="rounded-[10px] border border-facil-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-facil-text-secondary">Partida {index + 1}</span>
            {lines.length > 1 && (
              <button
                type="button"
                className="rounded-[10px] p-1.5 text-red-600 hover:bg-red-50"
                aria-label="Quitar partida"
                onClick={() => onChange(lines.filter((item) => item.key !== line.key))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <label className="mb-3 block">
            <span className="mb-1.5 block text-sm font-medium text-facil-text">Descripción</span>
            <input
              required
              value={line.description}
              onChange={(event) => update(line.key, { description: event.target.value })}
              placeholder="Puertas, ventanas, closet…"
              className="w-full rounded-[10px] border border-facil-border bg-white px-3 py-2.5 text-sm text-facil-text outline-none transition focus:border-facil-accent focus:ring-2 focus:ring-facil-accent/20"
            />
          </label>
          <MoneyField
            label="Monto (RD$)"
            required
            value={line.amount}
            onValueChange={(amount) => update(line.key, { amount })}
          />
        </div>
      ))}
      <p className="text-right text-sm font-semibold text-facil-text">
        Total {formatMoney(total)}
      </p>
    </div>
  )
}
