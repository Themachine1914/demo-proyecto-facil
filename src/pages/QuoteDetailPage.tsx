import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DocumentFormSheet } from '../components/documents/DocumentFormSheet'
import { DocumentPreview } from '../components/documents/DocumentPreview'
import { QuoteStatusBadge } from '../components/documents/DocumentStatusBadge'
import { Button } from '../components/ui/Button'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { useInvoices } from '../hooks/useInvoices'
import { useQuote, useQuotes } from '../hooks/useQuotes'
import type { DocumentFormData } from '../types/document'

export function QuoteDetailPage() {
  const { quoteId } = useParams()
  const navigate = useNavigate()
  const { quote, project, updateQuote, setStatus, removeQuote } = useQuote(quoteId)
  const { projects } = useQuotes()
  const { createFromQuote } = useInvoices()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSave(data: DocumentFormData) {
    if (!quote) return
    await updateQuote(quote.id, data)
    toast.success('Cotización actualizada')
  }

  async function handleStatus(next: 'sent' | 'accepted' | 'rejected' | 'draft') {
    if (!quote) return
    setBusy(true)
    try {
      await setStatus(quote.id, next)
      if (next === 'accepted') toast.success('Aceptada. Se creó o vinculó el proyecto.')
      else if (next === 'sent') toast.success('Marcada como enviada')
      else if (next === 'rejected') toast.success('Marcada como rechazada')
      else toast.success('Volvió a borrador')
    } catch {
      toast.error('No se pudo actualizar')
    } finally {
      setBusy(false)
    }
  }

  async function handleInvoice() {
    if (!quote) return
    setBusy(true)
    try {
      const id = await createFromQuote(quote.id)
      toast.success('Factura creada')
      navigate(`/facturar/${id}`)
    } catch {
      toast.error('No se pudo crear la factura')
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!quote) return
    setBusy(true)
    try {
      await removeQuote(quote.id)
      toast.success('Cotización eliminada')
      navigate('/cotizar', { replace: true })
    } catch {
      toast.error('No se pudo eliminar')
      setBusy(false)
    }
  }

  if (!quote) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-facil-text-secondary">Cotización no encontrada.</p>
        <Link to="/cotizar" className="mt-3 inline-block text-sm font-medium text-facil-primary">
          Volver a Cotizar
        </Link>
      </div>
    )
  }

  const canEdit = quote.status === 'draft' || quote.status === 'sent'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto fa-scroll">
      <div className="px-4 py-4 sm:px-6">
        <Link
          to="/cotizar"
          className="mb-3 inline-flex items-center gap-1 text-sm text-facil-text-secondary hover:text-facil-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Cotizar
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-facil-text">{quote.number}</h1>
            <p className="mt-1 text-sm text-facil-text-secondary">{quote.clientName}</p>
          </div>
          <QuoteStatusBadge status={quote.status} />
        </div>
      </div>

      <div className="space-y-3 px-4 pb-8 sm:px-6">
        <DocumentPreview kind="quote" document={quote} />

        {project && (
          <Link
            to={`/proyectos/${project.id}`}
            className="block rounded-[10px] border border-facil-border bg-facil-surface px-4 py-3 text-sm font-medium text-facil-primary"
          >
            Ver proyecto en el tablero
          </Link>
        )}

        {quote.status === 'draft' && (
          <Button className="w-full" disabled={busy} onClick={() => void handleStatus('sent')}>
            Marcar enviada
          </Button>
        )}
        {quote.status === 'sent' && (
          <>
            <Button className="w-full" disabled={busy} onClick={() => void handleStatus('accepted')}>
              Aceptar y crear proyecto
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => void handleStatus('rejected')}
            >
              Rechazar
            </Button>
          </>
        )}
        {quote.status === 'accepted' && (
          <Button className="w-full" disabled={busy} onClick={() => void handleInvoice()}>
            Crear factura
          </Button>
        )}
        {quote.status === 'rejected' && (
          <Button
            variant="secondary"
            className="w-full"
            disabled={busy}
            onClick={() => void handleStatus('draft')}
          >
            Volver a borrador
          </Button>
        )}

        {canEdit && (
          <Button variant="secondary" className="w-full" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
        <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" />
          Eliminar cotización
        </Button>
      </div>

      <DocumentFormSheet
        open={editing}
        title="Editar cotización"
        submitLabel="Guardar cambios"
        document={quote}
        projects={projects}
        allowProjectSelect
        onClose={() => setEditing(false)}
        onSubmit={handleSave}
      />
      <ConfirmSheet
        open={confirmDelete}
        title="Eliminar cotización"
        message="Se borra esta cotización. El proyecto vinculado, si existe, se queda."
        confirmLabel="Eliminar"
        danger
        busy={busy}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
