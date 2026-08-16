import { useEffect, useState, type FormEvent } from 'react'
import { parseDateInput, toDateInput } from '../../lib/format'
import { parseAmount } from '../../lib/parse'
import type { DocumentFormData, Invoice, Quote } from '../../types/document'
import type { Project } from '../../types/project'
import { Button } from '../ui/Button'
import { Field, SelectField, TextAreaField } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { emptyLine, LineItemsFields, type LineDraft } from './LineItemsFields'

export function DocumentFormSheet({
  open,
  title,
  submitLabel,
  document,
  projects,
  allowProjectSelect = false,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  submitLabel: string
  document?: Quote | Invoice | null
  projects?: Project[]
  allowProjectSelect?: boolean
  onClose: () => void
  onSubmit: (data: DocumentFormData) => Promise<void>
}) {
  const [clientName, setClientName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [address, setAddress] = useState('')
  const [date, setDate] = useState(toDateInput(new Date()))
  const [notes, setNotes] = useState('')
  const [projectId, setProjectId] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setClientName(document?.clientName ?? '')
    setProjectName(document?.projectName ?? '')
    setAddress(document?.address ?? '')
    setDate(toDateInput(document?.date ?? new Date()))
    setNotes(document?.notes ?? '')
    setProjectId(document?.projectId ?? '')
    setLines(
      document?.lines.length
        ? document.lines.map((line) => ({
            key: line.id,
            description: line.description,
            amount: String(line.amount),
          }))
        : [emptyLine()],
    )
  }, [open, document])

  function applyProject(id: string) {
    setProjectId(id)
    const project = projects?.find((item) => item.id === id)
    if (!project) return
    setClientName(project.clientName)
    setProjectName(project.projectName)
    setAddress(project.address ?? '')
    if (!document) {
      setLines([
        {
          key: crypto.randomUUID(),
          description: project.projectName,
          amount: String(project.budget),
        },
      ])
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsedLines = lines
      .map((line) => ({
        description: line.description.trim(),
        amount: parseAmount(line.amount),
      }))
      .filter((line) => line.description && line.amount > 0)
    if (parsedLines.length === 0) return
    setSubmitting(true)
    try {
      await onSubmit({
        clientName,
        projectName,
        address: address.trim() || undefined,
        date: parseDateInput(date),
        notes: notes.trim() || undefined,
        lines: parsedLines,
        projectId: projectId || undefined,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        {allowProjectSelect && projects && projects.length > 0 && (
          <SelectField
            label="Usar un proyecto (opcional)"
            value={projectId}
            onChange={(event) => applyProject(event.target.value)}
          >
            <option value="">Sin proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName} — {project.clientName}
              </option>
            ))}
          </SelectField>
        )}
        <Field
          label="Cliente"
          required
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          placeholder="Nombre del cliente"
        />
        <Field
          label="Trabajo"
          required
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="Puertas, baño, closet…"
        />
        <Field
          label="Dirección (opcional)"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <Field
          label="Fecha"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <LineItemsFields lines={lines} onChange={setLines} />
        <TextAreaField
          label="Notas (opcional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Guardando…' : submitLabel}
        </Button>
      </form>
    </Sheet>
  )
}
