import { FileText, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { DocumentFormSheet } from '../components/documents/DocumentFormSheet'
import { QuoteStatusBadge } from '../components/documents/DocumentStatusBadge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useQuotes } from '../hooks/useQuotes'
import { formatDate, formatMoney } from '../lib/format'
import type { DocumentFormData } from '../types/document'

export function QuotesPage() {
  const { quotes, projects, createQuote } = useQuotes()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const list = [...quotes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    if (!term) return list
    return list.filter(
      (quote) =>
        quote.clientName.toLowerCase().includes(term) ||
        quote.projectName.toLowerCase().includes(term) ||
        quote.number.toLowerCase().includes(term),
    )
  }, [quotes, query])

  async function handleCreate(data: DocumentFormData) {
    try {
      await createQuote(data)
      toast.success('Cotización creada')
    } catch {
      toast.error('No se pudo crear la cotización')
      throw new Error('create failed')
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto fa-scroll">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-facil-text sm:text-xl">Cotizar</h1>
            <p className="mt-1 text-xs text-facil-text-secondary sm:text-sm">
              Arma la cotización, envíala y acéptala para pasarla a proyecto.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="w-full shrink-0 sm:w-auto">
            <Plus className="h-4 w-4" />
            Nueva cotización
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
                No hay cotizaciones. Crea la primera para enviársela al cliente.
              </p>
            </Card>
          </li>
        )}
        {filtered.map((quote) => (
          <li key={quote.id}>
            <Link
              to={`/cotizar/${quote.id}`}
              className="block rounded-[10px] border border-facil-border bg-facil-surface p-3 shadow-[var(--fa-shadow)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1 text-xs text-facil-text-secondary">
                    <FileText className="h-3.5 w-3.5" />
                    {quote.number}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-facil-text">
                    {quote.projectName}
                  </p>
                  <p className="truncate text-xs text-facil-text-secondary">{quote.clientName}</p>
                </div>
                <QuoteStatusBadge status={quote.status} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-facil-text-secondary">{formatDate(quote.date)}</span>
                <span className="font-semibold tabular-nums text-facil-text">
                  {formatMoney(quote.total)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <DocumentFormSheet
        open={open}
        title="Nueva cotización"
        submitLabel="Guardar cotización"
        projects={projects}
        allowProjectSelect
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
