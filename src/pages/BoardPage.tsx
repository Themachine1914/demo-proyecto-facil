import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Board } from '../components/kanban/Board'
import { NewProjectModal } from '../components/kanban/NewProjectModal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useProjects } from '../hooks/useProjects'
import { BOARD_COLUMNS } from '../lib/constants'
import { isFirebaseConfigured } from '../lib/firebase'
import type { ProjectFormData, ProjectStatus } from '../types/project'

export function BoardPage() {
  const { projects, loading, createProject, reorderColumn, moveProjectToColumn } = useProjects()
  const [modalOpen, setModalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return projects.filter((project) => {
      if (statusFilter !== 'all' && project.status !== statusFilter) return false
      if (!term) return true
      return (
        project.clientName.toLowerCase().includes(term) ||
        project.projectName.toLowerCase().includes(term)
      )
    })
  }, [projects, query, statusFilter])

  async function handleCreate(data: ProjectFormData) {
    try {
      await createProject(data)
      toast.success('Proyecto creado')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el proyecto'
      toast.error(message)
      throw error
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-facil-text sm:text-xl">Tablero</h1>
            <p className="mt-1 text-xs text-facil-text-secondary sm:text-sm">
              Arrastra por el icono o usa Mover en el celular.
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            disabled={!isFirebaseConfigured}
            className="w-full shrink-0 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nuevo proyecto
          </Button>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-facil-text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente o proyecto"
            className="w-full rounded-[10px] border border-facil-border bg-facil-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-facil-accent focus:ring-2 focus:ring-facil-accent/20"
          />
        </label>

        <div className="fa-scroll flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            label="Todos"
          />
          {BOARD_COLUMNS.map((column) => (
            <FilterChip
              key={column.id}
              active={statusFilter === column.id}
              onClick={() => setStatusFilter(column.id)}
              label={column.label}
            />
          ))}
        </div>
      </div>

      {!isFirebaseConfigured ? (
        <div className="mx-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:mx-6">
          Configura Firebase en <code>.env</code> para cargar y guardar proyectos.
        </div>
      ) : loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <Board
          projects={filtered}
          onReorderColumn={reorderColumn}
          onMoveProject={moveProjectToColumn}
        />
      )}

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-[10px] px-3 py-2 text-xs font-medium transition ${
        active
          ? 'bg-facil-primary text-white'
          : 'bg-facil-surface text-facil-text-secondary ring-1 ring-facil-border'
      }`}
    >
      {label}
    </button>
  )
}
