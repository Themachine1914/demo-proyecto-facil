import type { ProjectStatus } from '../types/project'

export interface BoardColumn {
  id: ProjectStatus
  label: string
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'quoted', label: 'Cotizado' },
  { id: 'in_progress', label: 'En Proceso' },
  { id: 'to_collect', label: 'Por Cobrar' },
  { id: 'finished', label: 'Finalizado' },
]

export const PROJECTS_COLLECTION = 'projects'
export const TECHNICIANS_COLLECTION = 'technicians'
export const WORK_DAYS_SUBCOLLECTION = 'workDays'
export const PURCHASES_SUBCOLLECTION = 'purchases'
export const PAYMENTS_SUBCOLLECTION = 'payments'

export const PURCHASE_PAYMENT_LABELS: Record<'cash' | 'credit', string> = {
  cash: 'Contado',
  credit: 'Crédito',
}

export const PAYMENT_METHOD_LABELS: Record<
  'efectivo' | 'transferencia' | 'cheque' | 'otro',
  string
> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  otro: 'Otro',
}
