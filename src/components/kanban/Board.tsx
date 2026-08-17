import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { BOARD_COLUMNS } from '../../lib/constants'
import type { Project, ProjectStatus } from '../../types/project'
import {
  applyDragEndItems,
  columnIds,
  findStatus,
  insertIndexForOver,
  isColumnId,
  moveProjectInList,
  statusFromOver,
} from './boardMove'
import { Column } from './Column'
import { ProjectCardContent } from './ProjectCard'

interface BoardProps {
  projects: Project[]
  onReorderColumn: (
    status: ProjectStatus,
    orderedIds: string[],
    movedProjectId?: string,
  ) => Promise<void>
  onReorderColumns?: (
    columns: { status: ProjectStatus; orderedIds: string[] }[],
    movedProjectId?: string,
  ) => Promise<void>
  onMoveProject?: (projectId: string, status: ProjectStatus) => Promise<void>
}

export function Board({
  projects,
  onReorderColumn,
  onReorderColumns,
  onMoveProject,
}: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState<Project[]>(projects)
  const activeIdRef = useRef<string | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef(false)

  activeIdRef.current = activeId

  useEffect(() => {
    if (activeIdRef.current) return
    setItems(projects)
  }, [projects])

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [items])

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

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerHits = pointerWithin(args)
      const pointerCard = pointerHits.find((hit) => !isColumnId(hit.id))
      if (pointerCard) {
        lastOverId.current = pointerCard.id
        return [pointerCard]
      }

      const intersections = pointerHits.length > 0 ? pointerHits : rectIntersection(args)
      let overId = getFirstCollision(intersections, 'id')

      if (overId != null) {
        if (isColumnId(overId)) {
          const containerItems = items.filter(
            (project) => project.status === overId && project.id !== activeId,
          )
          if (containerItems.length > 0) {
            const closest = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter((container) =>
                containerItems.some((project) => project.id === container.id),
              ),
            })[0]
            if (closest) overId = closest.id
          }
        }

        lastOverId.current = overId
        return [{ id: overId }]
      }

      if (recentlyMovedToNewContainer.current && activeId) {
        lastOverId.current = activeId
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeId, items],
  )

  const activeProject = activeId ? (items.find((project) => project.id === activeId) ?? null) : null

  function handleDragStart(event: DragStartEvent) {
    lastOverId.current = null
    recentlyMovedToNewContainer.current = false
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
      const toStatus = statusFromOver(over, prev)
      if (!fromStatus || !toStatus || fromStatus === toStatus) return prev

      recentlyMovedToNewContainer.current = true
      return moveProjectInList(
        prev,
        activeProjectId,
        toStatus,
        insertIndexForOver(prev, activeProjectId, overId, toStatus),
      )
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const draggedId = String(active.id)
    const original = projects.find((project) => project.id === draggedId)
    const fromStatus = original?.status

    setActiveId(null)
    lastOverId.current = null

    if (!fromStatus) {
      setItems(projects)
      return
    }

    const nextItems = applyDragEndItems(items, projects, draggedId, over)

    const toStatus = nextItems.find((project) => project.id === draggedId)?.status
    if (!toStatus) {
      setItems(projects)
      return
    }

    setItems(nextItems)

    const destIds = columnIds(nextItems, toStatus)
    const sourceIds = columnIds(nextItems, fromStatus)
    const originalDestIds = columnIds(projects, toStatus)
    const originalSourceIds = columnIds(projects, fromStatus)
    const unchanged =
      fromStatus === toStatus
        ? destIds.join() === originalDestIds.join()
        : destIds.join() === originalDestIds.join() && sourceIds.join() === originalSourceIds.join()

    if (unchanged) return

    try {
      if (onReorderColumns) {
        const columns =
          fromStatus === toStatus
            ? [{ status: toStatus, orderedIds: destIds }]
            : [
                { status: toStatus, orderedIds: destIds },
                { status: fromStatus, orderedIds: sourceIds },
              ]
        await onReorderColumns(columns, draggedId)
      } else {
        await onReorderColumn(toStatus, destIds, draggedId)
        if (fromStatus !== toStatus) {
          await onReorderColumn(fromStatus, sourceIds)
        }
      }
    } catch {
      toast.error('No se pudo guardar el movimiento')
      setItems(projects)
    }
  }

  function handleDragCancel() {
    setActiveId(null)
    lastOverId.current = null
    recentlyMovedToNewContainer.current = false
    setItems(projects)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
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
