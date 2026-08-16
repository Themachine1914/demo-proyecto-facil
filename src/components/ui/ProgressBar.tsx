export function ProgressBar({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      className={`h-2 overflow-hidden rounded-full bg-facil-border ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-facil-accent transition-[width]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
