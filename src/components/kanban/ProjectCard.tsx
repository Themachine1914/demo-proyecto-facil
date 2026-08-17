import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowRightLeft, GripVertical, User } from 'lucide-react'
import type { MouseEvent, PointerEvent, ReactNode, TouchEvent } from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { formatMoney } from '../../lib/format'
import {
  amountToCollect,
  amountToInvest,
  isCollectableStatus,
  isOpenInvestmentStatus,
} from '../../lib/finance'
import type { Project, ProjectStatus } from '../../types/project'
import { Money } from '../ui/Money'
import { ProgressBar } from '../ui/ProgressBar'
import { MoveSheet } from './MoveSheet'

function stopDrag() {
  return {
    onPointerDown: (e: PointerEvent) => e.stopPropagation(),
    onMouseDown: (e: MouseEvent) => e.stopPropagation(),
    onTouchStart: (e: TouchEvent) => e.stopPropagation(),
  }
}

export function ProjectCardContent({
  project,
  dragging = false,
  dragHandle,
  onOpenMove,
  moving,
}: {
  project: Project
  dragging?: boolean
  dragHandle?: ReactNode
  onOpenMove?: () => void
  moving?: boolean
}) {
  const actionBtn =
    'flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-[10px] border px-2 py-2 text-xs font-medium transition active:scale-[0.98]'

  return (
    <article
      className={`rounded-[10px] border bg-facil-surface p-3 shadow-[var(--fa-shadow)] ${
        dragging ? 'border-facil-accent ring-1 ring-facil-accent/20' : 'border-facil-border'
      }`}
    >
      <div className="mb-2 flex items-start gap-1.5">
        {dragHandle}
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1 text-xs text-facil-text-secondary">
            <User className="h-3 w-3" />
            {project.clientName}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-facil-text">
            {project.projectName}
          </h3>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-facil-text-secondary">Presupuesto</span>
        <span className="font-medium tabular-nums text-facil-text">
          {formatMoney(project.budget)}
        </span>
      </div>

      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-[11px] text-facil-text-secondary">
          <span>Avance</span>
          <span>{Math.round(project.physicalProgress)}%</span>
        </div>
        <ProgressBar value={project.physicalProgress} />
      </div>

      <div className="mb-3 space-y-1">
        {isCollectableStatus(project.status) && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-facil-text-secondary">Falta por cobrar</span>
            <Money
              amount={amountToCollect(project)}
              className="text-xs font-semibold text-amber-700"
            />
          </div>
        )}
        {isOpenInvestmentStatus(project.status) && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-facil-text-secondary">Falta por invertir</span>
            <span className="font-semibold tabular-nums text-blue-800">
              {formatMoney(amountToInvest(project))}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {onOpenMove && (
          <button
            type="button"
            onClick={onOpenMove}
            disabled={moving}
            {...stopDrag()}
            className={`${actionBtn} shrink-0 border-facil-border bg-facil-bg text-facil-text sm:hidden`}
            aria-label="Mover tarjeta"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
            Mover
          </button>
        )}
        <Link
          to={`/proyectos/${project.id}`}
          {...stopDrag()}
          className={`${actionBtn} border-facil-accent/30 bg-facil-accent/5 text-facil-primary hover:bg-facil-accent/10`}
        >
          Ver detalle
        </Link>
      </div>
    </article>
  )
}

export function ProjectCard({
  project,
  onMoveProject,
}: {
  project: Project
  onMoveProject?: (projectId: string, status: ProjectStatus) => Promise<void>
}) {
  const [moveOpen, setMoveOpen] = useState(false)
  const [moving, setMoving] = useState(false)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: project.id,
      data: { type: 'project', status: project.status, project },
      animateLayoutChanges: () => false,
    })

  const dragHandle = (
    <span
      ref={setActivatorNodeRef}
      className="mt-0.5 inline-flex shrink-0 cursor-grab touch-none rounded-[10px] p-1.5 text-facil-text-secondary active:cursor-grabbing sm:p-1"
      aria-label="Arrastrar"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5 sm:h-4 sm:w-4" />
    </span>
  )

  async function handleMove(status: ProjectStatus) {
    if (!onMoveProject) return
    setMoving(true)
    try {
      await onMoveProject(project.id, status)
      toast.success('Proyecto movido')
      setMoveOpen(false)
    } catch {
      toast.error('No se pudo mover el proyecto')
    } finally {
      setMoving(false)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: isDragging ? undefined : CSS.Transform.toString(transform),
          transition,
        }}
        className={isDragging ? 'opacity-0' : ''}
      >
        <ProjectCardContent
          project={project}
          dragHandle={dragHandle}
          onOpenMove={onMoveProject ? () => setMoveOpen(true) : undefined}
          moving={moving}
        />
      </div>
      {onMoveProject && (
        <MoveSheet
          open={moveOpen}
          projectName={project.projectName}
          currentStatus={project.status}
          onClose={() => setMoveOpen(false)}
          onMove={(status) => void handleMove(status)}
          moving={moving}
        />
      )}
    </>
  )
}
