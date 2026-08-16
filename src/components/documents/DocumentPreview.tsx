import { Logo } from '../brand/Logo'
import { formatDate, formatMoney } from '../../lib/format'
import type { Invoice, Quote } from '../../types/document'

export function DocumentPreview({
  kind,
  document,
}: {
  kind: 'quote' | 'invoice'
  document: Quote | Invoice
}) {
  const title = kind === 'quote' ? 'Cotización' : 'Factura'

  return (
    <article className="rounded-[10px] border border-facil-border bg-facil-surface p-4 shadow-[var(--fa-shadow)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <Logo height={36} />
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-facil-text-secondary">
            {title}
          </p>
          <p className="text-sm font-semibold text-facil-text">{document.number}</p>
          <p className="text-xs text-facil-text-secondary">{formatDate(document.date)}</p>
        </div>
      </div>

      <div className="mb-4 space-y-1 text-sm">
        <p className="font-semibold text-facil-text">{document.clientName}</p>
        <p className="text-facil-text">{document.projectName}</p>
        {document.address && (
          <p className="text-xs text-facil-text-secondary">{document.address}</p>
        )}
      </div>

      <ul className="divide-y divide-facil-border border-y border-facil-border">
        {document.lines.map((line) => (
          <li key={line.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
            <span className="min-w-0 text-facil-text">{line.description}</span>
            <span className="shrink-0 font-medium tabular-nums">{formatMoney(line.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-facil-text">Total</span>
        <span className="text-lg font-bold tabular-nums text-facil-text">
          {formatMoney(document.total)}
        </span>
      </div>

      {document.notes && (
        <p className="mt-3 text-xs text-facil-text-secondary">{document.notes}</p>
      )}
    </article>
  )
}
