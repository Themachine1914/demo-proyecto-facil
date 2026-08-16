import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export function Accordion({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean
  badge?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="overflow-hidden rounded-[10px] border border-facil-border bg-facil-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        {icon}
        <span className="min-w-0 flex-1 text-sm font-semibold text-facil-text">
          {title}
        </span>
        {badge}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-facil-text-secondary transition ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className="border-t border-facil-border px-4 py-4">{children}</div>}
    </section>
  )
}
