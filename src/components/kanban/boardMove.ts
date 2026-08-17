import { BOARD_COLUMNS } from '../../lib/constants'
import type { Project, ProjectStatus } from '../../types/project'
import type { UniqueIdentifier } from '@dnd-kit/core'

const COLUMN_IDS = new Set<string>(BOARD_COLUMNS.map((column) => column.id))

export function isColumnId(id: UniqueIdentifier | string): id is ProjectStatus {
  return COLUMN_IDS.has(String(id))
}

export function findStatus(list: Project[], id: UniqueIdentifier | string): ProjectStatus | null {
  const key = String(id)
  if (isColumnId(key)) return key
  return list.find((project) => project.id === key)?.status ?? null
}

export function statusFromOver(
  over: {
    id: UniqueIdentifier
    data: { current?: { sortable?: { containerId?: UniqueIdentifier } } | null }
  },
  list: Project[],
): ProjectStatus | null {
  const overId = String(over.id)
  if (isColumnId(overId)) return overId
  const containerId = over.data.current?.sortable?.containerId
  if (containerId && isColumnId(containerId)) return containerId
  return findStatus(list, overId)
}

export function insertIndexForOver(
  list: Project[],
  projectId: string,
  overId: string,
  toStatus: ProjectStatus,
): number {
  const without = list.filter((project) => project.id !== projectId)
  const columnProjects = without
    .filter((project) => project.status === toStatus)
    .sort((a, b) => a.order - b.order)

  if (isColumnId(overId) || overId === projectId) {
    return columnProjects.length
  }

  const overIndex = columnProjects.findIndex((project) => project.id === overId)
  return overIndex >= 0 ? overIndex : columnProjects.length
}

export function moveProjectInList(
  list: Project[],
  projectId: string,
  toStatus: ProjectStatus,
  insertIndex: number,
): Project[] {
  const moving = list.find((project) => project.id === projectId)
  if (!moving) return list
  if (moving.status === toStatus && moving.order === insertIndex) {
    const column = list
      .filter((project) => project.status === toStatus)
      .sort((a, b) => a.order - b.order)
    if (column[insertIndex]?.id === projectId) return list
  }

  const without = list.filter((project) => project.id !== projectId)
  const column = without
    .filter((project) => project.status === toStatus)
    .sort((a, b) => a.order - b.order)
  const clamped = Math.max(0, Math.min(insertIndex, column.length))
  const nextColumn = [
    ...column.slice(0, clamped),
    { ...moving, status: toStatus },
    ...column.slice(clamped),
  ].map((project, index) => ({ ...project, order: index }))
  const others = without.filter((project) => project.status !== toStatus)
  return [...others, ...nextColumn]
}

export function applyDragEndItems(
  items: Project[],
  originals: Project[],
  draggedId: string,
  over: {
    id: UniqueIdentifier
    data: { current?: { sortable?: { containerId?: UniqueIdentifier } } | null }
  } | null,
): Project[] {
  const fromStatus = originals.find((project) => project.id === draggedId)?.status
  if (!fromStatus) return originals

  const optimisticStatus = items.find((project) => project.id === draggedId)?.status ?? null
  const overId = over ? String(over.id) : null
  const overStatus = over ? statusFromOver(over, items) : null

  if (optimisticStatus && optimisticStatus !== fromStatus) {
    return items
  }
  if (overId && overStatus && overStatus !== fromStatus) {
    return moveProjectInList(
      items,
      draggedId,
      overStatus,
      insertIndexForOver(items, draggedId, overId, overStatus),
    )
  }
  if (overId && overStatus === fromStatus && overId !== draggedId) {
    return moveProjectInList(
      items,
      draggedId,
      fromStatus,
      insertIndexForOver(items, draggedId, overId, fromStatus),
    )
  }
  return items
}

export function columnIds(list: Project[], status: ProjectStatus): string[] {
  return list
    .filter((project) => project.status === status)
    .sort((a, b) => a.order - b.order)
    .map((project) => project.id)
}
