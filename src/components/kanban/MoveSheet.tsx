import { ArrowRightLeft, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { BOARD_COLUMNS } from '../../lib/constants'
import type { ProjectStatus } from '../../types/project'

interface MoveSheetProps {
  open: boolean
  projectName: string
  currentStatus: ProjectStatus
  onClose: () => void
  onMove: (status: ProjectStatus) => void
  moving?: boolean
}

export function MoveSheet({
  open,
  projectName,
  currentStatus,
  onClose,
  onMove,
  moving,
}: MoveSheetProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] sm:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-facil-text/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-hidden rounded-t-[16px] border-t border-facil-border bg-facil-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgb(15_23_42_/_12%)]"
        role="dialog"
        aria-label="Mover proyecto"
      >
        <div className="flex items-center justify-between border-b border-facil-border px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-facil-text-secondary">Mover tarjeta</p>
            <p className="truncate text-sm font-semibold text-facil-text">{projectName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] p-2 text-facil-text-secondary hover:bg-facil-bg"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="overflow-y-auto p-2">
          {BOARD_COLUMNS.map((column) => {
            const isCurrent = column.id === currentStatus
            return (
              <li key={column.id}>
                <button
                  type="button"
                  disabled={moving || isCurrent}
                  onClick={() => onMove(column.id)}
                  className={`mb-1 flex min-h-[52px] w-full items-center justify-between rounded-[10px] px-4 text-left text-sm font-medium transition ${
                    isCurrent
                      ? 'bg-facil-primary/10 text-facil-primary'
                      : 'text-facil-text hover:bg-facil-bg active:bg-facil-bg'
                  } disabled:opacity-60`}
                >
                  {column.label}
                  {isCurrent ? (
                    <span className="text-xs font-normal opacity-70">Actual</span>
                  ) : (
                    <ArrowRightLeft className="h-4 w-4 shrink-0 opacity-40" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>,
    document.body,
  )
}
