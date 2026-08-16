import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { budgetDelta } from '../../lib/finance'
import { formatDate, formatMoney, parseDateInput, toDateInput } from '../../lib/format'
import { parseAmount } from '../../lib/parse'
import type { WorkDay, WorkDayFormData } from '../../types/finance'
import type { Technician } from '../../types/technician'
import { Button } from '../ui/Button'
import { Field, MoneyField, SelectField, TextAreaField } from '../ui/Field'
import { Money } from '../ui/Money'
import { Sheet } from '../ui/Sheet'

export function LaborSection({
  workDays,
  laborCost,
  laborBudget,
  technicians,
  onAdd,
  onDelete,
}: {
  workDays: WorkDay[]
  laborCost: number
  laborBudget: number
  technicians: Technician[]
  onAdd: (data: WorkDayFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const activeTechnicians = technicians.filter((technician) => technician.active)
  const delta = budgetDelta(laborCost, laborBudget)
  const over = delta > 0

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] bg-facil-bg px-3 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-facil-text-secondary">Gastado en jornadas</span>
          <Money amount={laborCost} className="font-semibold" />
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-facil-text-secondary">Presupuesto mano de obra</span>
          <Money amount={laborBudget} className="font-semibold" />
        </div>
        <p className={`mt-2 text-xs font-medium ${over ? 'text-red-600' : 'text-emerald-600'}`}>
          {laborBudget <= 0
            ? 'Define un presupuesto de mano de obra para comparar.'
            : over
              ? `Por encima del presupuesto: ${formatMoney(delta)}`
              : `Por debajo del presupuesto: ${formatMoney(Math.abs(delta))}`}
        </p>
      </div>

      <Button className="w-full" onClick={() => setOpen(true)} disabled={activeTechnicians.length === 0}>
        <Plus className="h-4 w-4" />
        Registrar jornada
      </Button>
      {activeTechnicians.length === 0 && (
        <p className="text-xs text-facil-text-secondary">
          Primero agrega un técnico activo en la pantalla Técnicos.
        </p>
      )}

      <ul className="space-y-2">
        {workDays.length === 0 && (
          <li className="text-sm text-facil-text-secondary">Aún no hay jornadas.</li>
        )}
        {workDays.map((workDay) => (
          <li
            key={workDay.id}
            className="flex items-start justify-between gap-3 rounded-[10px] border border-facil-border px-3 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-facil-text">{workDay.technicianName}</p>
              <p className="text-xs text-facil-text-secondary">
                {formatDate(workDay.date)} · {formatMoney(workDay.dailyValue)}
              </p>
              {workDay.notes && (
                <p className="mt-1 text-xs text-facil-text-secondary">{workDay.notes}</p>
              )}
            </div>
            <button
              type="button"
              className="rounded-[10px] p-2 text-red-600 hover:bg-red-50"
              aria-label="Eliminar jornada"
              onClick={() => void onDelete(workDay.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <WorkDayFormSheet
        open={open}
        technicians={activeTechnicians}
        onClose={() => setOpen(false)}
        onSubmit={onAdd}
      />
    </div>
  )
}

function WorkDayFormSheet({
  open,
  technicians,
  onClose,
  onSubmit,
}: {
  open: boolean
  technicians: Technician[]
  onClose: () => void
  onSubmit: (data: WorkDayFormData) => Promise<void>
}) {
  const [technicianId, setTechnicianId] = useState(technicians[0]?.id ?? '')
  const selected = useMemo(
    () => technicians.find((technician) => technician.id === technicianId) ?? technicians[0],
    [technicianId, technicians],
  )
  const [dailyValue, setDailyValue] = useState(String(selected?.dailyRate ?? ''))
  const [date, setDate] = useState(toDateInput(new Date()))
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const first = technicians[0]
    setTechnicianId(first?.id ?? '')
    setDailyValue(String(first?.dailyRate ?? ''))
    setDate(toDateInput(new Date()))
    setNotes('')
  }, [open, technicians])

  function handleTechnicianChange(id: string) {
    setTechnicianId(id)
    const next = technicians.find((technician) => technician.id === id)
    if (next) setDailyValue(String(next.dailyRate))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    setSubmitting(true)
    try {
      await onSubmit({
        technicianId: selected.id,
        technicianName: selected.name,
        date: parseDateInput(date),
        dailyValue: parseAmount(dailyValue),
        notes: notes.trim() || undefined,
      })
      toast.success('Jornada registrada')
      setNotes('')
      setDate(toDateInput(new Date()))
      onClose()
    } catch {
      toast.error('No se pudo guardar la jornada')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} title="Nueva jornada" onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <SelectField
          label="Técnico"
          value={selected?.id ?? ''}
          onChange={(event) => handleTechnicianChange(event.target.value)}
          required
        >
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.name} · {formatMoney(technician.dailyRate)}
            </option>
          ))}
        </SelectField>
        <Field
          label="Fecha"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <MoneyField
          label="Valor del día (RD$)"
          required
          value={dailyValue}
          onValueChange={setDailyValue}
        />
        <TextAreaField
          label="Notas (opcional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Button type="submit" className="w-full" disabled={submitting || !selected}>
          {submitting ? 'Guardando…' : 'Guardar jornada'}
        </Button>
      </form>
    </Sheet>
  )
}
