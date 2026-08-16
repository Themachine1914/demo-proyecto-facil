import { Receipt, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { DocumentFormSheet } from '../components/documents/DocumentFormSheet'
import { InvoiceStatusBadge } from '../components/documents/DocumentStatusBadge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useInvoices } from '../hooks/useInvoices'
import { formatDate, formatMoney } from '../lib/format'
import type { DocumentFormData } from '../types/document'

export function InvoicesPage() {
  const { invoices, projects, createInvoice } = useInvoices()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const list = [...invoices].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    if (!term) return list
    return list.filter(
      (invoice) =>
        invoice.clientName.toLowerCase().includes(term) ||
        invoice.projectName.toLowerCase().includes(term) ||
        invoice.number.toLowerCase().includes(term),
    )
  }, [invoices, query])

  async function handleCreate(data: DocumentFormData) {
    try {
      await createInvoice(data)
      toast.success('Factura creada')
    } catch {
      toast.error('No se pudo crear la factura')
      throw new Error('create failed')
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto fa-scroll">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-facil-text sm:text-xl">Facturar</h1>
            <p className="mt-1 text-xs text-facil-text-secondary sm:text-sm">
              Emite la factura y márcala pagada cuando el cliente salde.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="w-full shrink-0 sm:w-auto">
            <Plus className="h-4 w-4" />
            Nueva factura
          </Button>
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-facil-text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente, trabajo o número"
            className="w-full rounded-[10px] border border-facil-border bg-facil-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-facil-accent focus:ring-2 focus:ring-facil-accent/20"
          />
        </label>
      </div>

      <ul className="space-y-2 px-4 pb-8 sm:px-6">
        {filtered.length === 0 && (
          <li>
            <Card>
              <p className="text-sm text-facil-text-secondary">
                No hay facturas. Crea una o genera una desde una cotización aceptada.
              </p>
            </Card>
          </li>
        )}
        {filtered.map((invoice) => (
          <li key={invoice.id}>
            <Link
              to={`/facturar/${invoice.id}`}
              className="block rounded-[10px] border border-facil-border bg-facil-surface p-3 shadow-[var(--fa-shadow)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1 text-xs text-facil-text-secondary">
                    <Receipt className="h-3.5 w-3.5" />
                    {invoice.number}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-facil-text">
                    {invoice.projectName}
                  </p>
                  <p className="truncate text-xs text-facil-text-secondary">{invoice.clientName}</p>
                </div>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-facil-text-secondary">{formatDate(invoice.date)}</span>
                <span className="font-semibold tabular-nums text-facil-text">
                  {formatMoney(invoice.total)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <DocumentFormSheet
        open={open}
        title="Nueva factura"
        submitLabel="Guardar factura"
        projects={projects}
        allowProjectSelect
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
