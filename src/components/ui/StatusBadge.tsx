import { BOARD_COLUMNS } from '../../lib/constants'
import type { ProjectStatus } from '../../types/project'

const styles: Record<ProjectStatus, string> = {
  quoted: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-50 text-blue-800',
  to_collect: 'bg-amber-50 text-amber-800',
  finished: 'bg-emerald-50 text-emerald-800',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const label = BOARD_COLUMNS.find((column) => column.id === status)?.label ?? status

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      {label}
    </span>
  )
}
