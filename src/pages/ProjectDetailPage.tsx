import { ArrowLeft, Hammer, MapPin, Package, Percent, Trash2, User, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FinancialSummary } from '../components/project/FinancialSummary'
import { GeneralForm } from '../components/project/GeneralForm'
import { LaborSection } from '../components/project/LaborSection'
import { PaymentsSection } from '../components/project/PaymentsSection'
import { ProgressSection } from '../components/project/ProgressSection'
import { PurchasesSection } from '../components/project/PurchasesSection'
import { Accordion } from '../components/ui/Accordion'
import { Button } from '../components/ui/Button'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { Spinner } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useProject } from '../hooks/useProject'
import { useTechnicians } from '../hooks/useTechnicians'
import { BOARD_COLUMNS } from '../lib/constants'
import { formatDate } from '../lib/format'
import type { ProjectGeneralUpdate, ProjectStatus } from '../types/project'

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const {
    project,
    workDays,
    purchases,
    payments,
    liveTotals,
    loading,
    addWorkDay,
    deleteWorkDay,
    addPurchase,
    deletePurchase,
    addPayment,
    deletePayment,
    updateGeneral,
    updatePhysicalProgress,
    moveProject,
    removeProject,
  } = useProject(projectId)
  const { technicians } = useTechnicians()
  const [progress, setProgress] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (project) setProgress(project.physicalProgress)
  }, [project])

  async function handleSaveGeneral(data: ProjectGeneralUpdate) {
    try {
      await updateGeneral(data)
      toast.success('Datos guardados')
    } catch {
      toast.error('No se pudieron guardar los datos')
      throw new Error('save failed')
    }
  }

  async function persistProgress(value: number) {
    setProgress(value)
    try {
      await updatePhysicalProgress(value)
    } catch {
      toast.error('No se pudo guardar el avance')
    }
  }

  async function handleStatusChange(status: ProjectStatus) {
    try {
      await moveProject(status)
      const label = BOARD_COLUMNS.find((column) => column.id === status)?.label ?? status
      toast.success(`Movido a ${label}`)
    } catch {
      toast.error('No se pudo cambiar el estado')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await removeProject()
      toast.success('Proyecto eliminado')
      navigate('/tablero', { replace: true })
    } catch {
      toast.error('No se pudo eliminar el proyecto')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-facil-text-secondary">Proyecto no encontrado.</p>
        <Link to="/tablero" className="mt-3 inline-block text-sm font-medium text-facil-primary">
          Volver al tablero
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto fa-scroll">
      <div className="px-4 py-4 sm:px-6">
        <Link
          to="/tablero"
          className="mb-3 inline-flex items-center gap-1 text-sm text-facil-text-secondary hover:text-facil-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Tablero
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-facil-text">{project.projectName}</h1>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-facil-text-secondary">
              <User className="h-3.5 w-3.5" />
              {project.clientName}
            </p>
            {project.address && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-facil-text-secondary">
                <MapPin className="h-3.5 w-3.5" />
                {project.address}
              </p>
            )}
            <p className="mt-1 text-xs text-facil-text-secondary">
              Inicio: {formatDate(project.startDate)}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="space-y-3 px-4 pb-8 sm:px-6">
        <FinancialSummary
          budget={project.budget}
          materialsBudget={project.materialsBudget}
          laborBudget={project.laborBudget}
          totals={liveTotals}
        />

        <Accordion
          title="General"
          defaultOpen
          icon={<User className="h-4 w-4 text-facil-primary" />}
        >
          <GeneralForm
            project={project}
            onSave={handleSaveGeneral}
            onStatusChange={handleStatusChange}
          />
        </Accordion>

        <Accordion
          title="Avance físico"
          icon={<Percent className="h-4 w-4 text-facil-primary" />}
          badge={
            <span className="text-xs text-facil-text-secondary">{Math.round(progress)}%</span>
          }
        >
          <ProgressSection
            physicalProgress={progress}
            materialsPurchased={liveTotals.materialsPurchased}
            materialsBudget={project.materialsBudget}
            onChange={(value) => void persistProgress(value)}
            onApplySuggestion={(value) => persistProgress(value)}
          />
        </Accordion>

        <Accordion
          title="Materiales y compras"
          icon={<Package className="h-4 w-4 text-facil-primary" />}
          badge={
            <span className="text-xs text-facil-text-secondary">
              {purchases.length}
            </span>
          }
        >
          <PurchasesSection
            purchases={purchases}
            materialsBudget={project.materialsBudget}
            materialsPurchased={liveTotals.materialsPurchased}
            onAdd={addPurchase}
            onDelete={deletePurchase}
          />
        </Accordion>

        <Accordion
          title="Mano de obra"
          icon={<Hammer className="h-4 w-4 text-facil-primary" />}
          badge={
            <span className="text-xs text-facil-text-secondary">{workDays.length}</span>
          }
        >
          <LaborSection
            workDays={workDays}
            laborCost={liveTotals.laborCost}
            laborBudget={project.laborBudget}
            technicians={technicians}
            onAdd={addWorkDay}
            onDelete={deleteWorkDay}
          />
        </Accordion>

        <Accordion
          title="Pagos del cliente"
          icon={<Wallet className="h-4 w-4 text-facil-primary" />}
          badge={
            <span className="text-xs text-facil-text-secondary">{payments.length}</span>
          }
        >
          <PaymentsSection
            payments={payments}
            received={liveTotals.paymentsReceived}
            pending={liveTotals.pendingBalance}
            onAdd={addPayment}
            onDelete={deletePayment}
          />
        </Accordion>

        <Button
          variant="danger"
          className="w-full"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar proyecto
        </Button>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        title="Eliminar proyecto"
        message="Se borra este proyecto con sus compras, jornadas y pagos. No se puede deshacer."
        confirmLabel="Eliminar"
        danger
        busy={deleting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
