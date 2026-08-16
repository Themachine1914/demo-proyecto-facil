export function formatGrouped(amount: number): string {
  const n = Math.round(Math.abs(amount))
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
}

export function formatMoney(amount: number): string {
  const grouped = formatGrouped(amount)
  return amount < 0 ? `-RD$ ${grouped}` : `RD$ ${grouped}`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function toDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d)
}

export function monthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function currentMonthKey(): string {
  return monthKey(new Date())
}

export function monthLabel(period: string): string {
  const [y, m] = period.split('-').map(Number)
  if (!y || !m) return period
  return new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1),
  )
}
