import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { PURCHASE_PAYMENT_LABELS } from '../../lib/constants'
import { materialsBudgetDelta } from '../../lib/finance'
import { formatDate, formatMoney, parseDateInput, toDateInput } from '../../lib/format'
import { parseAmount } from '../../lib/parse'
import type { Purchase, PurchaseFormData, PurchasePaymentType } from '../../types/finance'
import { Button } from '../ui/Button'
import { Field, MoneyField, SelectField, TextAreaField } from '../ui/Field'
import { Money } from '../ui/Money'
import { Sheet } from '../ui/Sheet'

export function PurchasesSection({
  purchases,
  materialsBudget,
  materialsPurchased,
  onAdd,
  onDelete,
}: {
  purchases: Purchase[]
  materialsBudget: number
  materialsPurchased: number
  onAdd: (data: PurchaseFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const delta = materialsBudgetDelta(materialsPurchased, materialsBudget)
  const over = delta > 0

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] bg-facil-bg px-3 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-facil-text-secondary">Comprado</span>
          <Money amount={materialsPurchased} className="font-semibold" />
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-facil-text-secondary">Presupuesto materiales</span>
          <Money amount={materialsBudget} className="font-semibold" />
        </div>
        <p className={`mt-2 text-xs font-medium ${over ? 'text-red-600' : 'text-emerald-600'}`}>
          {materialsBudget <= 0
            ? 'Define un presupuesto de materiales para comparar.'
            : over
              ? `Por encima del presupuesto: ${formatMoney(delta)}`
              : `Por debajo del presupuesto: ${formatMoney(Math.abs(delta))}`}
        </p>
      </div>

      <Button className="w-full" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Registrar compra
      </Button>

      <ul className="space-y-2">
        {purchases.length === 0 && (
          <li className="text-sm text-facil-text-secondary">Aún no hay compras.</li>
        )}
        {purchases.map((purchase) => (
          <li
            key={purchase.id}
            className="flex items-start justify-between gap-3 rounded-[10px] border border-facil-border px-3 py-3"
          >
            <div className="min-w-0">
              <p className="font-semibold">
                <Money amount={purchase.amount} />
              </p>
              <p className="text-xs text-facil-text-secondary">
                {formatDate(purchase.date)} · {PURCHASE_PAYMENT_LABELS[purchase.paymentType]}
              </p>
              {purchase.notes && (
                <p className="mt-1 text-xs text-facil-text-secondary">{purchase.notes}</p>
              )}
            </div>
            <button
              type="button"
              className="rounded-[10px] p-2 text-red-600 hover:bg-red-50"
              aria-label="Eliminar compra"
              onClick={() => void onDelete(purchase.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <PurchaseFormSheet open={open} onClose={() => setOpen(false)} onSubmit={onAdd} />
    </div>
  )
}

function PurchaseFormSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: PurchaseFormData) => Promise<void>
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(toDateInput(new Date()))
  const [paymentType, setPaymentType] = useState<PurchasePaymentType>('cash')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        amount: parseAmount(amount),
        date: parseDateInput(date),
        paymentType,
        notes: notes.trim() || undefined,
      })
      toast.success('Compra registrada')
      setAmount('')
      setNotes('')
      setDate(toDateInput(new Date()))
      setPaymentType('cash')
      onClose()
    } catch {
      toast.error('No se pudo guardar la compra')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} title="Nueva compra" onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <MoneyField
          label="Monto (RD$)"
          required
          value={amount}
          onValueChange={setAmount}
        />
        <Field
          label="Fecha"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <SelectField
          label="Tipo de pago"
          value={paymentType}
          onChange={(event) => setPaymentType(event.target.value as PurchasePaymentType)}
        >
          <option value="cash">Contado</option>
          <option value="credit">Crédito</option>
        </SelectField>
        <TextAreaField
          label="Notas (opcional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar compra'}
        </Button>
      </form>
    </Sheet>
  )
}
