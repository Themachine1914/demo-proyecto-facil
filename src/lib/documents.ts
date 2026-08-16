import type { InvoiceStatus, QuoteStatus } from '../types/document'

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  paid: 'Pagada',
}

export const QUOTE_STATUS_STYLES: Record<QuoteStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-50 text-blue-800',
  accepted: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-red-50 text-red-800',
}

export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  issued: 'bg-amber-50 text-amber-800',
  paid: 'bg-emerald-50 text-emerald-800',
}

export function linesTotal(lines: { amount: number }[]): number {
  return lines.reduce((acc, line) => acc + (Number.isFinite(line.amount) ? line.amount : 0), 0)
}

export function nextDocumentNumber(prefix: string, existing: string[]): string {
  let max = 0
  const pattern = new RegExp(`^${prefix}-(\\d+)$`)
  for (const value of existing) {
    const match = pattern.exec(value)
    if (!match) continue
    const parsed = Number(match[1])
    if (Number.isFinite(parsed) && parsed > max) max = parsed
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}
