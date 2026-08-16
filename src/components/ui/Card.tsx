import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-[10px] border border-facil-border bg-facil-surface p-4 shadow-[var(--fa-shadow)] ${className}`}
    >
      {children}
    </div>
  )
}
