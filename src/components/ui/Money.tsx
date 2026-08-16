import { formatMoney } from '../../lib/format'

export function Money({
  amount,
  signed = false,
  className = '',
}: {
  amount: number
  signed?: boolean
  className?: string
}) {
  const color =
    signed && amount > 0
      ? 'text-emerald-600'
      : signed && amount < 0
        ? 'text-red-600'
        : 'text-facil-text'

  return (
    <span className={`tabular-nums ${color} ${className}`}>{formatMoney(amount)}</span>
  )
}
