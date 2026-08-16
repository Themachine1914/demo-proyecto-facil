import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Project, ProjectStatus } from '../../types/project'
import { ProjectCard } from './ProjectCard'

interface ColumnProps {
  id: ProjectStatus
  label: string
  projects: Project[]
  onMoveProject?: (projectId: string, status: ProjectStatus) => Promise<void>
}

export function Column({ id, label, projects, onMoveProject }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'column', status: id },
  })

  return (
    <section
      className={`flex w-[min(85vw,18rem)] shrink-0 snap-start flex-col rounded-[10px] border bg-white/60 sm:w-72 ${
        isOver ? 'border-facil-accent/50 bg-facil-accent/5' : 'border-facil-border'
      }`}
    >
      <header className="flex items-center justify-between px-3 py-3">
        <h2 className="text-sm font-medium text-facil-text">{label}</h2>
        <span className="rounded-md bg-facil-bg px-2 py-0.5 text-xs text-facil-text-secondary">
          {projects.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className="fa-scroll flex min-h-[200px] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3"
      >
        <SortableContext items={projects.map((project) => project.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onMoveProject={onMoveProject} />
          ))}
        </SortableContext>
      </div>
    </section>
  )
}
