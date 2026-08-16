import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BOARD_COLUMNS } from '../../lib/constants'
import type { Project, ProjectStatus } from '../../types/project'
import { Column } from './Column'
import { ProjectCardContent } from './ProjectCard'

const COLUMN_IDS = new Set<string>(BOARD_COLUMNS.map((column) => column.id))

function isColumnId(id: UniqueIdentifier | string): id is ProjectStatus {
  return COLUMN_IDS.has(String(id))
}

const boardCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args)
  if (pointerHits.length > 0) {
    const overCard = pointerHits.find((hit) => !isColumnId(hit.id))
    if (overCard) return [overCard]
    const overColumn = pointerHits.find((hit) => isColumnId(hit.id))
    if (overColumn) return [overColumn]
    return pointerHits
  }
  return closestCorners(args)
}

interface BoardProps {
  projects: Project[]
  onReorderColumn: (
    status: ProjectStatus,
    orderedIds: string[],
    movedProjectId?: string,
  ) => Promise<void>
  onMoveProject?: (projectId: string, status: ProjectStatus) => Promise<void>
}

export function Board({ projects, onReorderColumn, onMoveProject }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState<Project[]>(projects)

  useEffect(() => {
    if (!activeId) {
      setItems(projects)
    }
  }, [projects, activeId])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  )

  const projectsByStatus = useMemo(() => {
    const map = Object.fromEntries(BOARD_COLUMNS.map((col) => [col.id, [] as Project[]])) as Record<
      ProjectStatus,
      Project[]
    >

    for (const project of items) {
      if (map[project.status]) {
        map[project.status].push(project)
      }
    }

    for (const col of BOARD_COLUMNS) {
      map[col.id].sort((a, b) => a.order - b.order)
    }

    return map
  }, [items])

  const activeProject = activeId ? (items.find((project) => project.id === activeId) ?? null) : null

  function findStatus(list: Project[], id: string): ProjectStatus | null {
    if (isColumnId(id)) return id
    return list.find((project) => project.id === id)?.status ?? null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
    setItems(projects)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeProjectId = String(active.id)
    const overId = String(over.id)

    setItems((prev) => {
      const fromStatus = findStatus(prev, activeProjectId)
      const toStatus = findStatus(prev, overId)
      if (!fromStatus || !toStatus || fromStatus === toStatus) return prev

      const moving = prev.find((project) => project.id === activeProjectId)
      if (!moving) return prev

      const without = prev.filter((project) => project.id !== activeProjectId)
      const overIsColumn = isColumnId(overId)

      let insertIndex: number
      if (overIsColumn) {
        insertIndex = without.filter((project) => project.status === toStatus).length
      } else {
        const columnProjects = without.filter((project) => project.status === toStatus)
        const overIndex = columnProjects.findIndex((project) => project.id === overId)
        insertIndex = overIndex >= 0 ? overIndex : columnProjects.length
      }

      const updated: Project = { ...moving, status: toStatus }
      const before = without.filter((project) => project.status === toStatus)
      const others = without.filter((project) => project.status !== toStatus)
      const nextColumn = [...before]
      nextColumn.splice(insertIndex, 0, updated)

      const renumbered = nextColumn.map((project, index) => ({ ...project, order: index }))
      return [...others, ...renumbered]
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const draggedId = String(active.id)
    const original = projects.find((project) => project.id === draggedId)
    const fromStatus = original?.status

    if (!over || !fromStatus) {
      setActiveId(null)
      setItems(projects)
      return
    }

    const overId = String(over.id)
    const toStatus = isColumnId(overId)
      ? overId
      : findStatus(items, overId) ?? findStatus(items, draggedId)

    if (!toStatus) {
      setActiveId(null)
      setItems(projects)
      return
    }

    const moving =
      items.find((project) => project.id === draggedId) ??
      (original ? { ...original, status: toStatus } : null)
    if (!moving) {
      setActiveId(null)
      setItems(projects)
      return
    }

    let column = items
      .filter((project) => project.status === toStatus && project.id !== draggedId)
      .sort((a, b) => a.order - b.order)

    let insertIndex = column.length
    if (!isColumnId(overId)) {
      const overIndex = column.findIndex((project) => project.id === overId)
      if (overIndex >= 0) insertIndex = overIndex
    }

    column = [
      ...column.slice(0, insertIndex),
      { ...moving, status: toStatus },
      ...column.slice(insertIndex),
    ]

    const renumbered = column.map((project, index) => ({ ...project, order: index }))
    const others = items.filter((project) => project.status !== toStatus && project.id !== draggedId)
    const nextItems = [...others, ...renumbered]
    setItems(nextItems)
    setActiveId(null)

    try {
      await onReorderColumn(
        toStatus,
        renumbered.map((project) => project.id),
        draggedId,
      )

      if (fromStatus !== toStatus) {
        const sourceIds = nextItems
          .filter((project) => project.status === fromStatus)
          .sort((a, b) => a.order - b.order)
          .map((project) => project.id)
        await onReorderColumn(fromStatus, sourceIds)
      }
    } catch {
      toast.error('No se pudo guardar el movimiento')
      setItems(projects)
    }
  }

  function handleDragCancel() {
    setActiveId(null)
    setItems(projects)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={(event) => void handleDragEnd(event)}
      onDragCancel={handleDragCancel}
    >
      <div className="fa-scroll flex min-h-0 flex-1 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 pt-1 snap-x snap-proximity scroll-pl-4 sm:gap-4 sm:px-6 sm:pb-6 sm:pt-2">
        {BOARD_COLUMNS.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            label={column.label}
            projects={projectsByStatus[column.id]}
            onMoveProject={onMoveProject}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="w-72">
            <ProjectCardContent project={activeProject} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
