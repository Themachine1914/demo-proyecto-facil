import { useEffect, useState, type FormEvent } from 'react'
import { BOARD_COLUMNS } from '../../lib/constants'
import { parseDateInput, toDateInput } from '../../lib/format'
import { parseAmount } from '../../lib/parse'
import type { Project, ProjectGeneralUpdate, ProjectStatus } from '../../types/project'
import { Button } from '../ui/Button'
import { Field, MoneyField, SelectField } from '../ui/Field'

export function GeneralForm({
  project,
  onSave,
  onStatusChange,
}: {
  project: Project
  onSave: (data: ProjectGeneralUpdate) => Promise<void>
  onStatusChange: (status: ProjectStatus) => Promise<void>
}) {
  const [clientName, setClientName] = useState(project.clientName)
  const [projectName, setProjectName] = useState(project.projectName)
  const [address, setAddress] = useState(project.address ?? '')
  const [startDate, setStartDate] = useState(toDateInput(project.startDate))
  const [budget, setBudget] = useState(String(project.budget))
  const [materialsBudget, setMaterialsBudget] = useState(String(project.materialsBudget))
  const [laborBudget, setLaborBudget] = useState(String(project.laborBudget))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setClientName(project.clientName)
    setProjectName(project.projectName)
    setAddress(project.address ?? '')
    setStartDate(toDateInput(project.startDate))
    setBudget(String(project.budget))
    setMaterialsBudget(String(project.materialsBudget))
    setLaborBudget(String(project.laborBudget))
  }, [project])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onSave({
        clientName,
        projectName,
        address: address.trim() || undefined,
        startDate: parseDateInput(startDate),
        budget: parseAmount(budget),
        materialsBudget: parseAmount(materialsBudget),
        laborBudget: parseAmount(laborBudget),
        physicalProgress: project.physicalProgress,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <Field
        label="Cliente"
        required
        value={clientName}
        onChange={(event) => setClientName(event.target.value)}
      />
      <Field
        label="Proyecto"
        required
        value={projectName}
        onChange={(event) => setProjectName(event.target.value)}
      />
      <Field
        label="Dirección"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
      <Field
        label="Fecha de inicio"
        type="date"
        required
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
      />
      <SelectField
        label="Estado"
        value={project.status}
        onChange={(event) => {
          const next = event.target.value as ProjectStatus
          if (next === project.status) return
          void onStatusChange(next)
        }}
      >
        {BOARD_COLUMNS.map((column) => (
          <option key={column.id} value={column.id}>
            {column.label}
          </option>
        ))}
      </SelectField>
      <p className="text-[11px] text-facil-text-secondary">
        También puedes moverlo desde el tablero (arrastrar o Mover).
      </p>
      <MoneyField
        label="Presupuesto total (RD$)"
        required
        value={budget}
        onValueChange={setBudget}
      />
      <MoneyField
        label="Presupuesto de materiales (RD$)"
        required
        value={materialsBudget}
        onValueChange={setMaterialsBudget}
      />
      <MoneyField
        label="Presupuesto de mano de obra (RD$)"
        required
        value={laborBudget}
        onValueChange={setLaborBudget}
      />
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Guardar datos'}
      </Button>
    </form>
  )
}
