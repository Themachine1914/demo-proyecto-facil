import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DocumentFormSheet } from '../components/documents/DocumentFormSheet'
import { DocumentPreview } from '../components/documents/DocumentPreview'
import { InvoiceStatusBadge } from '../components/documents/DocumentStatusBadge'
import { Button } from '../components/ui/Button'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { useInvoice, useInvoices } from '../hooks/useInvoices'
import type { DocumentFormData } from '../types/document'

export function InvoiceDetailPage() {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { invoice, project, quote, updateInvoice, setStatus, removeInvoice } = useInvoice(invoiceId)
  const { projects } = useInvoices()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSave(data: DocumentFormData) {
    if (!invoice) return
    await updateInvoice(invoice.id, data)
    toast.success('Factura actualizada')
  }

  async function handleStatus(next: 'issued' | 'paid' | 'draft') {
    if (!invoice) return
    setBusy(true)
    try {
      await setStatus(invoice.id, next)
      if (next === 'issued') toast.success('Factura emitida')
      else if (next === 'paid') toast.success('Marcada como pagada')
      else toast.success('Volvió a borrador')
    } catch {
      toast.error('No se pudo actualizar')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!invoice) return
    setBusy(true)
    try {
      await removeInvoice(invoice.id)
      toast.success('Factura eliminada')
      navigate('/facturar', { replace: true })
    } catch {
      toast.error('No se pudo eliminar')
      setBusy(false)
    }
  }

  if (!invoice) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-facil-text-secondary">Factura no encontrada.</p>
        <Link to="/facturar" className="mt-3 inline-block text-sm font-medium text-facil-primary">
          Volver a Facturar
        </Link>
      </div>
    )
  }

  const canEdit = invoice.status === 'draft'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto fa-scroll">
      <div className="px-4 py-4 sm:px-6">
        <Link
          to="/facturar"
          className="mb-3 inline-flex items-center gap-1 text-sm text-facil-text-secondary hover:text-facil-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Facturar
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-facil-text">{invoice.number}</h1>
            <p className="mt-1 text-sm text-facil-text-secondary">{invoice.clientName}</p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
      </div>

      <div className="space-y-3 px-4 pb-8 sm:px-6">
        <DocumentPreview kind="invoice" document={invoice} />

        {quote && (
          <Link
            to={`/cotizar/${quote.id}`}
            className="block rounded-[10px] border border-facil-border bg-facil-surface px-4 py-3 text-sm font-medium text-facil-primary"
          >
            Ver cotización {quote.number}
          </Link>
        )}
        {project && (
          <Link
            to={`/proyectos/${project.id}`}
            className="block rounded-[10px] border border-facil-border bg-facil-surface px-4 py-3 text-sm font-medium text-facil-primary"
          >
            Ver proyecto
          </Link>
        )}

        {invoice.status === 'draft' && (
          <Button className="w-full" disabled={busy} onClick={() => void handleStatus('issued')}>
            Emitir factura
          </Button>
        )}
        {invoice.status === 'issued' && (
          <Button className="w-full" disabled={busy} onClick={() => void handleStatus('paid')}>
            Marcar pagada
          </Button>
        )}
        {invoice.status === 'paid' && (
          <p className="text-center text-xs text-facil-text-secondary">
            Si está vinculada a un proyecto, el pago ya quedó registrado.
          </p>
        )}

        {canEdit && (
          <Button variant="secondary" className="w-full" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
        <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" />
          Eliminar factura
        </Button>
      </div>

      <DocumentFormSheet
        open={editing}
        title="Editar factura"
        submitLabel="Guardar cambios"
        document={invoice}
        projects={projects}
        allowProjectSelect
        onClose={() => setEditing(false)}
        onSubmit={handleSave}
      />
      <ConfirmSheet
        open={confirmDelete}
        title="Eliminar factura"
        message="Se borra esta factura. Los pagos ya registrados en el proyecto se quedan."
        confirmLabel="Eliminar"
        danger
        busy={busy}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
