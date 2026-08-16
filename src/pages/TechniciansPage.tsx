import { Plus, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field, MoneyField } from '../components/ui/Field'
import { Money } from '../components/ui/Money'
import { Sheet } from '../components/ui/Sheet'
import { Spinner } from '../components/ui/Spinner'
import { useTechnicians } from '../hooks/useTechnicians'
import { isFirebaseConfigured } from '../lib/firebase'
import { parseAmount } from '../lib/parse'
import type { Technician, TechnicianFormData } from '../types/technician'

export function TechniciansPage() {
  const { technicians, loading, createTechnician, updateTechnician, setTechnicianActive } =
    useTechnicians()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Technician | null>(null)

  async function handleSave(data: TechnicianFormData) {
    try {
      if (editing) {
        await updateTechnician(editing.id, data)
        toast.success('Técnico actualizado')
      } else {
        await createTechnician(data)
        toast.success('Técnico agregado')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar'
      toast.error(message)
      throw error
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto fa-scroll">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h1 className="text-lg font-semibold text-facil-text sm:text-xl">Técnicos</h1>
          <p className="mt-1 text-xs text-facil-text-secondary sm:text-sm">
            Valor diario base. En cada jornada puedes cambiar el monto.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
          disabled={!isFirebaseConfigured}
          className="w-full shrink-0 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Agregar técnico
        </Button>
      </div>

      {!isFirebaseConfigured && (
        <div className="mx-4 mb-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:mx-6">
          Configura Firebase en <code>.env</code> para gestionar técnicos.
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <ul className="space-y-2 px-4 pb-8 sm:px-6">
          {technicians.length === 0 && (
            <li>
              <Card>
                <p className="text-sm text-facil-text-secondary">
                  No hay técnicos. Agrega el primero para cargar jornadas.
                </p>
              </Card>
            </li>
          )}
          {technicians.map((technician) => (
            <li
              key={technician.id}
              className={`rounded-[10px] border bg-facil-surface p-4 shadow-[var(--fa-shadow)] ${
                technician.active ? 'border-facil-border' : 'border-facil-border opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-facil-bg text-facil-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-facil-text">{technician.name}</p>
                  <p className="text-sm text-facil-text-secondary">
                    Valor diario: <Money amount={technician.dailyRate} className="font-medium" />
                  </p>
                  {!technician.active && (
                    <p className="mt-1 text-xs font-medium text-amber-700">Inactivo</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setEditing(technician)
                    setOpen(true)
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant={technician.active ? 'danger' : 'secondary'}
                  className="flex-1"
                  onClick={() =>
                    void setTechnicianActive(technician.id, !technician.active).then(() =>
                      toast.success(technician.active ? 'Técnico desactivado' : 'Técnico activado'),
                    )
                  }
                >
                  {technician.active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <TechnicianFormSheet
        open={open}
        technician={editing}
        onClose={() => {
          setOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSave}
      />
    </div>
  )
}

function TechnicianFormSheet({
  open,
  technician,
  onClose,
  onSubmit,
}: {
  open: boolean
  technician: Technician | null
  onClose: () => void
  onSubmit: (data: TechnicianFormData) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [dailyRate, setDailyRate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const title = technician ? 'Editar técnico' : 'Nuevo técnico'

  useEffect(() => {
    if (!open) return
    setName(technician?.name ?? '')
    setDailyRate(technician ? String(technician.dailyRate) : '')
  }, [open, technician])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        name,
        dailyRate: parseAmount(dailyRate),
      })
      setName('')
      setDailyRate('')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <Field
          label="Nombre"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre del técnico"
        />
        <MoneyField
          label="Valor diario base (RD$)"
          required
          value={dailyRate}
          onValueChange={setDailyRate}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar'}
        </Button>
      </form>
    </Sheet>
  )
}
