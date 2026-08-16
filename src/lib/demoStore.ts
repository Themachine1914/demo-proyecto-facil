import type { Payment, PaymentFormData, Purchase, PurchaseFormData, WorkDay, WorkDayFormData } from '../types/finance'
import type { Project, ProjectFormData, ProjectGeneralUpdate, ProjectStatus } from '../types/project'
import type { Technician, TechnicianFormData } from '../types/technician'
import { computeProjectTotals } from './finance'

const STORAGE_KEY = 'demo-proyecto-facil-data-v2'

export interface DemoState {
  projects: Project[]
  technicians: Technician[]
  workDays: Record<string, WorkDay[]>
  purchases: Record<string, Purchase[]>
  payments: Record<string, Payment[]>
}

type Listener = () => void

const listeners = new Set<Listener>()

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function withTotals(project: Project, state: DemoState): Project {
  const totals = computeProjectTotals({
    budget: project.budget,
    workDays: state.workDays[project.id] ?? [],
    purchases: state.purchases[project.id] ?? [],
    payments: state.payments[project.id] ?? [],
  })
  return { ...project, ...totals, updatedAt: new Date() }
}

function emptyState(): DemoState {
  return {
    projects: [],
    technicians: [],
    workDays: {},
    purchases: {},
    payments: {},
  }
}

function reviveDates(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value)
  }
  return value
}

function loadState(): DemoState {
  if (typeof window === 'undefined') return emptyState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    return JSON.parse(raw, reviveDates) as DemoState
  } catch {
    return emptyState()
  }
}

let state = loadState()

function persist() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function emit() {
  persist()
  listeners.forEach((listener) => listener())
}

export function subscribeDemoStore(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getDemoState(): DemoState {
  return state
}

export function createDemoProject(data: ProjectFormData) {
  const quoted = state.projects.filter((project) => project.status === 'quoted')
  const nextOrder =
    quoted.length > 0 ? Math.max(...quoted.map((project) => project.order)) + 1 : 0
  const now = new Date()
  const project: Project = {
    id: newId('proj'),
    clientName: data.clientName.trim(),
    projectName: data.projectName.trim(),
    address: data.address?.trim() || undefined,
    startDate: data.startDate,
    status: 'quoted',
    order: nextOrder,
    budget: data.budget,
    materialsBudget: data.materialsBudget,
    laborBudget: data.laborBudget,
    physicalProgress: 0,
    laborCost: 0,
    materialsPurchased: 0,
    paymentsReceived: 0,
    realCost: 0,
    pendingBalance: data.budget,
    estimatedProfit: data.budget,
    createdAt: now,
    updatedAt: now,
  }
  state = {
    ...state,
    projects: [...state.projects, project],
    workDays: { ...state.workDays, [project.id]: [] },
    purchases: { ...state.purchases, [project.id]: [] },
    payments: { ...state.payments, [project.id]: [] },
  }
  emit()
}

export function reorderDemoColumn(
  status: ProjectStatus,
  orderedIds: string[],
  movedProjectId?: string,
) {
  const now = new Date()
  state = {
    ...state,
    projects: state.projects.map((project) => {
      const index = orderedIds.indexOf(project.id)
      if (index === -1) return project
      return {
        ...project,
        status,
        order: index,
        updatedAt: movedProjectId === project.id ? now : project.updatedAt,
      }
    }),
  }
  emit()
}

export function moveDemoProject(projectId: string, newStatus: ProjectStatus) {
  const project = state.projects.find((item) => item.id === projectId)
  if (!project || project.status === newStatus) return

  const oldStatus = project.status
  const oldColumnIds = state.projects
    .filter((item) => item.status === oldStatus && item.id !== projectId)
    .sort((a, b) => a.order - b.order)
    .map((item) => item.id)
  const newColumnCount = state.projects.filter((item) => item.status === newStatus).length

  state = {
    ...state,
    projects: state.projects.map((item) => {
      if (item.id === projectId) {
        return { ...item, status: newStatus, order: newColumnCount, updatedAt: new Date() }
      }
      const oldIndex = oldColumnIds.indexOf(item.id)
      if (oldIndex !== -1) {
        return { ...item, order: oldIndex, updatedAt: new Date() }
      }
      return item
    }),
  }
  emit()
}

export function addDemoWorkDay(projectId: string, data: WorkDayFormData) {
  const item: WorkDay = { id: newId('wd'), ...data, createdAt: new Date() }
  const nextWorkDays = [item, ...(state.workDays[projectId] ?? [])]
  patchProjectItems(projectId, { workDays: nextWorkDays })
}

export function deleteDemoWorkDay(projectId: string, workDayId: string) {
  patchProjectItems(projectId, {
    workDays: (state.workDays[projectId] ?? []).filter((item) => item.id !== workDayId),
  })
}

export function addDemoPurchase(projectId: string, data: PurchaseFormData) {
  const item: Purchase = { id: newId('pu'), ...data, createdAt: new Date() }
  patchProjectItems(projectId, { purchases: [item, ...(state.purchases[projectId] ?? [])] })
}

export function deleteDemoPurchase(projectId: string, purchaseId: string) {
  patchProjectItems(projectId, {
    purchases: (state.purchases[projectId] ?? []).filter((item) => item.id !== purchaseId),
  })
}

export function addDemoPayment(projectId: string, data: PaymentFormData) {
  const item: Payment = { id: newId('pa'), ...data, createdAt: new Date() }
  patchProjectItems(projectId, { payments: [item, ...(state.payments[projectId] ?? [])] })
}

export function deleteDemoPayment(projectId: string, paymentId: string) {
  patchProjectItems(projectId, {
    payments: (state.payments[projectId] ?? []).filter((item) => item.id !== paymentId),
  })
}

export function updateDemoGeneral(projectId: string, data: ProjectGeneralUpdate) {
  state = {
    ...state,
    projects: state.projects.map((project) => {
      if (project.id !== projectId) return project
      const next = {
        ...project,
        clientName: data.clientName.trim(),
        projectName: data.projectName.trim(),
        address: data.address?.trim() || undefined,
        startDate: data.startDate,
        budget: data.budget,
        materialsBudget: data.materialsBudget,
        laborBudget: data.laborBudget,
        physicalProgress: data.physicalProgress,
      }
      return withTotals(next, state)
    }),
  }
  emit()
}

export function updateDemoProgress(projectId: string, physicalProgress: number) {
  state = {
    ...state,
    projects: state.projects.map((project) =>
      project.id === projectId
        ? { ...project, physicalProgress, updatedAt: new Date() }
        : project,
    ),
  }
  emit()
}

export function createDemoTechnician(data: TechnicianFormData) {
  const now = new Date()
  const technician: Technician = {
    id: newId('tech'),
    name: data.name.trim(),
    dailyRate: data.dailyRate,
    active: true,
    createdAt: now,
    updatedAt: now,
  }
  state = { ...state, technicians: [...state.technicians, technician] }
  emit()
}

export function updateDemoTechnician(id: string, data: TechnicianFormData) {
  state = {
    ...state,
    technicians: state.technicians.map((item) =>
      item.id === id
        ? { ...item, name: data.name.trim(), dailyRate: data.dailyRate, updatedAt: new Date() }
        : item,
    ),
  }
  emit()
}

export function setDemoTechnicianActive(id: string, active: boolean) {
  state = {
    ...state,
    technicians: state.technicians.map((item) =>
      item.id === id ? { ...item, active, updatedAt: new Date() } : item,
    ),
  }
  emit()
}

function patchProjectItems(
  projectId: string,
  next: {
    workDays?: WorkDay[]
    purchases?: Purchase[]
    payments?: Payment[]
  },
) {
  state = {
    ...state,
    workDays: next.workDays
      ? { ...state.workDays, [projectId]: next.workDays }
      : state.workDays,
    purchases: next.purchases
      ? { ...state.purchases, [projectId]: next.purchases }
      : state.purchases,
    payments: next.payments
      ? { ...state.payments, [projectId]: next.payments }
      : state.payments,
  }
  state = {
    ...state,
    projects: state.projects.map((project) =>
      project.id === projectId ? withTotals(project, state) : project,
    ),
  }
  emit()
}
