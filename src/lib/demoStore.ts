import type { Payment, PaymentFormData, Purchase, PurchaseFormData, WorkDay, WorkDayFormData } from '../types/finance'
import type { Project, ProjectFormData, ProjectGeneralUpdate, ProjectStatus } from '../types/project'
import type { Technician, TechnicianFormData } from '../types/technician'
import { computeProjectTotals } from './finance'

const STORAGE_KEY = 'demo-proyecto-facil-data-v3'

export interface DemoState {
  projects: Project[]
  technicians: Technician[]
  workDays: Record<string, WorkDay[]>
  purchases: Record<string, Purchase[]>
  payments: Record<string, Payment[]>
}

type Listener = () => void

const listeners = new Set<Listener>()

function daysAgo(days: number): Date {
  const date = new Date()
  date.setHours(9, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

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

function seedState(): DemoState {
  const technicians: Technician[] = [
    {
      id: 'tech-1',
      name: 'Carlos Peña',
      dailyRate: 2500,
      active: true,
      createdAt: daysAgo(40),
      updatedAt: daysAgo(10),
    },
    {
      id: 'tech-2',
      name: 'Luis Martínez',
      dailyRate: 2200,
      active: true,
      createdAt: daysAgo(35),
      updatedAt: daysAgo(8),
    },
    {
      id: 'tech-3',
      name: 'Ana Rosario',
      dailyRate: 2800,
      active: true,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(4),
    },
  ]

  const projects: Project[] = [
    {
      id: 'proj-1',
      clientName: 'Familia Reyes',
      projectName: 'Puertas y ventanas',
      address: 'Residencial Palma Real',
      startDate: daysAgo(4),
      status: 'quoted',
      order: 0,
      budget: 185000,
      materialsBudget: 110000,
      laborBudget: 75000,
      physicalProgress: 0,
      laborCost: 0,
      materialsPurchased: 0,
      paymentsReceived: 0,
      realCost: 0,
      pendingBalance: 185000,
      estimatedProfit: 185000,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
    },
    {
      id: 'proj-2',
      clientName: 'Villa del Este',
      projectName: 'Closets a medida',
      address: 'Autopista Las Américas',
      startDate: daysAgo(18),
      status: 'in_progress',
      order: 0,
      budget: 240000,
      materialsBudget: 150000,
      laborBudget: 90000,
      physicalProgress: 55,
      laborCost: 0,
      materialsPurchased: 0,
      paymentsReceived: 0,
      realCost: 0,
      pendingBalance: 240000,
      estimatedProfit: 240000,
      createdAt: daysAgo(18),
      updatedAt: daysAgo(1),
    },
    {
      id: 'proj-3',
      clientName: 'Oficina Centro',
      projectName: 'Terminaciones interiores',
      address: 'Av. Winston Churchill',
      startDate: daysAgo(32),
      status: 'to_collect',
      order: 0,
      budget: 320000,
      materialsBudget: 190000,
      laborBudget: 130000,
      physicalProgress: 100,
      laborCost: 0,
      materialsPurchased: 0,
      paymentsReceived: 0,
      realCost: 0,
      pendingBalance: 320000,
      estimatedProfit: 320000,
      createdAt: daysAgo(32),
      updatedAt: daysAgo(2),
    },
    {
      id: 'proj-4',
      clientName: 'Apartamento Naco',
      projectName: 'Baño principal',
      address: 'Naco, Santo Domingo',
      startDate: daysAgo(60),
      status: 'finished',
      order: 0,
      budget: 145000,
      materialsBudget: 90000,
      laborBudget: 55000,
      physicalProgress: 100,
      laborCost: 0,
      materialsPurchased: 0,
      paymentsReceived: 0,
      realCost: 0,
      pendingBalance: 145000,
      estimatedProfit: 145000,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(12),
    },
  ]

  const workDays: Record<string, WorkDay[]> = {
    'proj-2': [
      {
        id: 'wd-1',
        technicianId: 'tech-1',
        technicianName: 'Carlos Peña',
        date: daysAgo(3),
        dailyValue: 2500,
        notes: 'Instalación de módulos',
        createdAt: daysAgo(3),
      },
      {
        id: 'wd-2',
        technicianId: 'tech-3',
        technicianName: 'Ana Rosario',
        date: daysAgo(2),
        dailyValue: 2800,
        createdAt: daysAgo(2),
      },
    ],
    'proj-3': [
      {
        id: 'wd-3',
        technicianId: 'tech-2',
        technicianName: 'Luis Martínez',
        date: daysAgo(8),
        dailyValue: 2200,
        createdAt: daysAgo(8),
      },
    ],
    'proj-4': [
      {
        id: 'wd-4',
        technicianId: 'tech-1',
        technicianName: 'Carlos Peña',
        date: daysAgo(20),
        dailyValue: 2500,
        createdAt: daysAgo(20),
      },
    ],
  }

  const purchases: Record<string, Purchase[]> = {
    'proj-2': [
      {
        id: 'pu-1',
        amount: 42000,
        date: daysAgo(10),
        paymentType: 'cash',
        notes: 'Melamina y herrajes',
        createdAt: daysAgo(10),
      },
    ],
    'proj-3': [
      {
        id: 'pu-2',
        amount: 88000,
        date: daysAgo(16),
        paymentType: 'credit',
        notes: 'Pisos y pintura',
        createdAt: daysAgo(16),
      },
    ],
    'proj-4': [
      {
        id: 'pu-3',
        amount: 61000,
        date: daysAgo(40),
        paymentType: 'cash',
        createdAt: daysAgo(40),
      },
    ],
  }

  const payments: Record<string, Payment[]> = {
    'proj-2': [
      {
        id: 'pa-1',
        amount: 80000,
        date: daysAgo(15),
        method: 'transferencia',
        notes: 'Avance inicial',
        createdAt: daysAgo(15),
      },
    ],
    'proj-3': [
      {
        id: 'pa-2',
        amount: 200000,
        date: daysAgo(20),
        method: 'transferencia',
        createdAt: daysAgo(20),
      },
    ],
    'proj-4': [
      {
        id: 'pa-3',
        amount: 145000,
        date: daysAgo(14),
        method: 'efectivo',
        notes: 'Pago final',
        createdAt: daysAgo(14),
      },
    ],
  }

  const next: DemoState = { projects, technicians, workDays, purchases, payments }
  next.projects = next.projects.map((project) => withTotals(project, next))
  return next
}

function reviveDates(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value)
  }
  return value
}

function loadState(): DemoState {
  if (typeof window === 'undefined') return seedState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw, reviveDates) as DemoState
    if (!parsed.projects?.length) return seedState()
    return parsed
  } catch {
    return seedState()
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
