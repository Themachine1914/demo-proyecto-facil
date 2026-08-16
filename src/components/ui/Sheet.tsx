import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-facil-text/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-[16px] border-t border-facil-border bg-facil-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgb(15_23_42_/_12%)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[10px] sm:border sm:pb-5"
        role="dialog"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-facil-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] p-2 text-facil-text-secondary hover:bg-facil-bg"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
