import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { PAYMENT_METHOD_LABELS } from '../../lib/constants'
import { formatDate, parseDateInput, toDateInput } from '../../lib/format'
import { parseAmount } from '../../lib/parse'
import type { Payment, PaymentFormData, PaymentMethod } from '../../types/finance'
import { Button } from '../ui/Button'
import { Field, MoneyField, SelectField, TextAreaField } from '../ui/Field'
import { Money } from '../ui/Money'
import { Sheet } from '../ui/Sheet'

export function PaymentsSection({
  payments,
  received,
  pending,
  onAdd,
  onDelete,
}: {
  payments: Payment[]
  received: number
  pending: number
  onAdd: (data: PaymentFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] bg-facil-bg px-3 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-facil-text-secondary">Total recibido</span>
          <Money amount={received} className="font-semibold" />
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-facil-text-secondary">Saldo pendiente</span>
          <Money amount={pending} signed className="font-semibold" />
        </div>
      </div>

      <Button className="w-full" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Registrar pago
      </Button>

      <ul className="space-y-2">
        {payments.length === 0 && (
          <li className="text-sm text-facil-text-secondary">Aún no hay pagos.</li>
        )}
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="flex items-start justify-between gap-3 rounded-[10px] border border-facil-border px-3 py-3"
          >
            <div className="min-w-0">
              <p className="font-semibold">
                <Money amount={payment.amount} />
              </p>
              <p className="text-xs text-facil-text-secondary">
                {formatDate(payment.date)}
                {payment.method ? ` · ${PAYMENT_METHOD_LABELS[payment.method]}` : ''}
              </p>
              {payment.notes && (
                <p className="mt-1 text-xs text-facil-text-secondary">{payment.notes}</p>
              )}
            </div>
            <button
              type="button"
              className="rounded-[10px] p-2 text-red-600 hover:bg-red-50"
              aria-label="Eliminar pago"
              onClick={() => void onDelete(payment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <PaymentFormSheet open={open} onClose={() => setOpen(false)} onSubmit={onAdd} />
    </div>
  )
}

function PaymentFormSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: PaymentFormData) => Promise<void>
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(toDateInput(new Date()))
  const [method, setMethod] = useState<PaymentMethod | ''>('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        amount: parseAmount(amount),
        date: parseDateInput(date),
        method: method || undefined,
        notes: notes.trim() || undefined,
      })
      toast.success('Pago registrado')
      setAmount('')
      setNotes('')
      setMethod('')
      setDate(toDateInput(new Date()))
      onClose()
    } catch {
      toast.error('No se pudo guardar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} title="Nuevo pago" onClose={onClose}>
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
          label="Método (opcional)"
          value={method}
          onChange={(event) => setMethod(event.target.value as PaymentMethod | '')}
        >
          <option value="">Sin especificar</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="cheque">Cheque</option>
          <option value="otro">Otro</option>
        </SelectField>
        <TextAreaField
          label="Notas (opcional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar pago'}
        </Button>
      </form>
    </Sheet>
  )
}
