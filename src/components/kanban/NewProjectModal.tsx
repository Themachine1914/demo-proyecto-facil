import { useState, type FormEvent } from 'react'
import type { ProjectFormData } from '../../types/project'
import { Button } from '../ui/Button'
import { Field, MoneyField } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { parseAmount } from '../../lib/parse'
import { parseDateInput, toDateInput } from '../../lib/format'

interface NewProjectModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => Promise<void>
}

export function NewProjectModal({ open, onClose, onSubmit }: NewProjectModalProps) {
  const [clientName, setClientName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [address, setAddress] = useState('')
  const [startDate, setStartDate] = useState(toDateInput(new Date()))
  const [budget, setBudget] = useState('')
  const [materialsBudget, setMaterialsBudget] = useState('')
  const [laborBudget, setLaborBudget] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setClientName('')
    setProjectName('')
    setAddress('')
    setStartDate(toDateInput(new Date()))
    setBudget('')
    setMaterialsBudget('')
    setLaborBudget('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        clientName,
        projectName,
        address: address.trim() || undefined,
        startDate: parseDateInput(startDate),
        budget: parseAmount(budget),
        materialsBudget: parseAmount(materialsBudget),
        laborBudget: parseAmount(laborBudget),
      })
      reset()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} title="Nuevo proyecto" onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <Field
          label="Cliente"
          required
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          placeholder="Nombre del cliente"
        />
        <Field
          label="Proyecto"
          required
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="Puertas, baño, closet…"
        />
        <Field
          label="Dirección (opcional)"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Calle, sector"
        />
        <Field
          label="Fecha de inicio"
          type="date"
          required
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <MoneyField
          label="Presupuesto total (RD$)"
          required
          value={budget}
          onValueChange={setBudget}
          placeholder="0"
        />
        <MoneyField
          label="Presupuesto de materiales (RD$)"
          required
          value={materialsBudget}
          onValueChange={setMaterialsBudget}
          placeholder="0"
        />
        <MoneyField
          label="Presupuesto de mano de obra (RD$)"
          required
          value={laborBudget}
          onValueChange={setLaborBudget}
          placeholder="0"
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Crear proyecto'}
        </Button>
      </form>
    </Sheet>
  )
}
