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
import {
  amountToCollect,
  amountToInvest,
  computeDashboardStats,
  isCollectableStatus,
  isOpenInvestmentStatus,
} from '../lib/finance'
import { APP_VERSION } from '../lib/appVersion'
import { currentMonthKey, formatMoney, monthLabel } from '../lib/format'
import type { ProjectFormData } from '../types/project'

export function DashboardPage() {
  const { projects, loading, createProject } = useProjects()
  const period = currentMonthKey()
  const { monthProfit } = useMonthCashflow(period)
  const [modalOpen, setModalOpen] = useState(false)

  const stats = useMemo(() => computeDashboardStats(projects), [projects])

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
          <p className="mt-0.5 text-[10px] text-facil-text-secondary/80">Versión {APP_VERSION}</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full shrink-0 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Button>
      </div>

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
              label="Falta por cobrar"
              hint="Saldo pendiente de cotizados, en proceso y por cobrar"
              value={formatMoney(stats.toCollect)}
            />
            <StatCard
              icon={<Landmark className="h-4 w-4 text-blue-700" />}
              label="Falta por invertir"
              hint="Materiales y mano de obra pendientes de cotizados y en proceso"
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
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-facil-text-secondary">Presupuesto</span>
                        <span className="font-medium tabular-nums text-facil-text">
                          {formatMoney(project.budget)}
                        </span>
                      </div>
                      {isCollectableStatus(project.status) && (
                        <div className="flex items-center justify-between">
                          <span className="text-facil-text-secondary">Falta por cobrar</span>
                          <Money
                            amount={amountToCollect(project)}
                            className="text-xs font-medium text-amber-700"
                          />
                        </div>
                      )}
                      {isOpenInvestmentStatus(project.status) && (
                        <div className="flex items-center justify-between">
                          <span className="text-facil-text-secondary">Falta por invertir</span>
                          <span className="font-medium tabular-nums text-blue-800">
                            {formatMoney(amountToInvest(project))}
                          </span>
                        </div>
                      )}
                    </div>
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
  hint,
  value,
  valueNode,
}: {
  icon: ReactNode
  label: string
  hint?: string
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
      {hint && <p className="mt-1 text-[11px] leading-snug text-facil-text-secondary">{hint}</p>}
    </Card>
  )
}
