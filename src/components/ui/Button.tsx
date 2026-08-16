import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'fa-gradient text-white shadow-[var(--fa-shadow)] hover:opacity-95 disabled:opacity-60',
  secondary:
    'bg-facil-surface text-facil-text border border-facil-border hover:border-facil-primary-soft/40 disabled:opacity-60',
  ghost:
    'bg-transparent text-facil-text-secondary hover:bg-facil-border/40 hover:text-facil-text disabled:opacity-60',
  danger:
    'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-60',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-facil-accent/40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
