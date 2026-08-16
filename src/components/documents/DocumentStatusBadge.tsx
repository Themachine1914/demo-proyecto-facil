import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_STYLES,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_STYLES,
} from '../../lib/documents'
import type { InvoiceStatus, QuoteStatus } from '../../types/document'

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${QUOTE_STATUS_STYLES[status]}`}
    >
      {QUOTE_STATUS_LABELS[status]}
    </span>
  )
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${INVOICE_STATUS_STYLES[status]}`}
    >
      {INVOICE_STATUS_LABELS[status]}
    </span>
  )
}
