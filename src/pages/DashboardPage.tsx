import { Banknote, Briefcase, ClipboardList, Landmark, LayoutGrid, Plus, TrendingUp } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { NewProjectModal } from '../components/kanban/NewProjectModal'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Money } from '../components/ui/Money'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Spinner } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useMonthCashflow } from '../hooks/useProject'
import { useProjects } from '../hooks/useProjects'
import { amountToInvest, isActiveProjectStatus, isOpenInvestmentStatus } from '../lib/finance'
import { currentMonthKey, formatMoney, monthLabel } from '../lib/format'
import { isFirebaseConfigured } from '../lib/firebase'
import type { ProjectFormData } from '../types/project'

export function DashboardPage() {
  const { projects, loading, createProject } = useProjects()
  const period = currentMonthKey()
  const { monthProfit } = useMonthCashflow(period)
  const [modalOpen, setModalOpen] = useState(false)

  const stats = useMemo(() => {
    const active = projects.filter((project) => isActiveProjectStatus(project.status))
    const collectable = projects.filter(
      (project) => project.status === 'in_progress' || project.status === 'to_collect',
    )
    const quotedTotal = projects
      .filter((project) => project.status === 'quoted')
      .reduce((acc, project) => acc + project.budget, 0)
    const toCollect = collectable.reduce((acc, project) => acc + project.pendingBalance, 0)
    const toInvest = projects
      .filter((project) => isOpenInvestmentStatus(project.status))
      .reduce((acc, project) => acc + amountToInvest(project), 0)
    const recent = [...projects]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 6)
    return { activeCount: active.length, quotedTotal, toCollect, toInvest, recent }
  }, [projects])

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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto fa-scroll">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h1 className="text-lg font-semibold text-facil-text sm:text-xl">Dashboard</h1>
          <p className="mt-1 text-xs text-facil-text-secondary sm:text-sm">
            Resumen de proyectos y caja de {monthLabel(period)}
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

      {!isFirebaseConfigured && (
        <div className="mx-4 mb-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:mx-6">
          Configura Firebase en <code>.env</code> para cargar y guardar datos.
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4 px-4 pb-8 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              icon={<Briefcase className="h-4 w-4 text-facil-primary" />}
              label="Proyectos activos"
              value={String(stats.activeCount)}
            />
            <StatCard
              icon={<ClipboardList className="h-4 w-4 text-facil-accent" />}
              label="Total cotizado"
              value={formatMoney(stats.quotedTotal)}
            />
            <StatCard
              icon={<Banknote className="h-4 w-4 text-amber-600" />}
              label="Total por cobrar"
              value={formatMoney(stats.toCollect)}
            />
            <StatCard
              icon={<Landmark className="h-4 w-4 text-blue-700" />}
              label="Total por invertir"
              value={formatMoney(stats.toInvest)}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
              label="Utilidad del mes"
              valueNode={<Money amount={monthProfit} signed className="text-lg font-bold" />}
            />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-facil-text">Proyectos recientes</h2>
            <Link
              to="/tablero"
              className="inline-flex items-center gap-1 text-xs font-medium text-facil-primary"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Ver tablero
            </Link>
          </div>

          {stats.recent.length === 0 ? (
            <Card>
              <p className="text-sm text-facil-text-secondary">
                Todavía no hay proyectos. Crea el primero para empezar.
              </p>
            </Card>
          ) : (
            <ul className="space-y-2">
              {stats.recent.map((project) => (
                <li key={project.id}>
                  <Link
                    to={`/proyectos/${project.id}`}
                    className="block rounded-[10px] border border-facil-border bg-facil-surface p-3 shadow-[var(--fa-shadow)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-facil-text">
                          {project.projectName}
                        </p>
                        <p className="truncate text-xs text-facil-text-secondary">
                          {project.clientName}
                        </p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-facil-text-secondary">
                        {formatMoney(project.budget)}
                      </span>
                      <Money amount={project.pendingBalance} signed className="text-xs font-medium" />
                    </div>
                    {isOpenInvestmentStatus(project.status) && (
                      <div className="mt-1 flex items-center justify-between text-[11px] text-facil-text-secondary">
                        <span>Por invertir</span>
                        <span className="font-medium tabular-nums text-blue-800">
                          {formatMoney(amountToInvest(project))}
                        </span>
                      </div>
                    )}
                    <ProgressBar value={project.physicalProgress} className="mt-2" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  valueNode,
}: {
  icon: ReactNode
  label: string
  value?: string
  valueNode?: ReactNode
}) {
  return (
    <Card>
      <div className="mb-2 flex items-center gap-2 text-facil-text-secondary">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      {valueNode ?? <p className="text-lg font-bold text-facil-text">{value}</p>}
    </Card>
  )
}
