import type {
  DocumentFormData,
  Invoice,
  InvoiceStatus,
  Quote,
  QuoteStatus,
} from '../types/document'
import type { Payment, PaymentFormData, Purchase, PurchaseFormData, WorkDay, WorkDayFormData } from '../types/finance'
import type { Project, ProjectFormData, ProjectGeneralUpdate, ProjectStatus } from '../types/project'
import type { Technician, TechnicianFormData } from '../types/technician'
import { linesTotal, nextDocumentNumber } from './documents'
import { computeProjectTotals } from './finance'

const STORAGE_KEY = 'demo-proyecto-facil-data-v3'
const LEGACY_STORAGE_KEYS = ['demo-proyecto-facil-data-v2', 'demo-proyecto-facil-data']
const SEED_PROJECT_IDS = new Set(['proj-1', 'proj-2', 'proj-3', 'proj-4'])
const SEED_TECH_IDS = new Set(['tech-1', 'tech-2', 'tech-3'])
const SEED_QUOTE_IDS = new Set(['quote-1', 'quote-2'])
const SEED_INVOICE_IDS = new Set(['inv-1', 'inv-2'])

export interface DemoState {
  projects: Project[]
  technicians: Technician[]
  workDays: Record<string, WorkDay[]>
  purchases: Record<string, Purchase[]>
  payments: Record<string, Payment[]>
  quotes: Quote[]
  invoices: Invoice[]
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

  const quotes: Quote[] = [
    {
      id: 'quote-1',
      number: 'COT-001',
      clientName: 'Familia Reyes',
      projectName: 'Puertas y ventanas',
      address: 'Residencial Palma Real',
      date: daysAgo(4),
      notes: 'Incluye instalación.',
      lines: [
        { id: 'ql-1', description: 'Puertas interiores y marcos', amount: 95000 },
        { id: 'ql-2', description: 'Ventanas de aluminio', amount: 90000 },
      ],
      total: 185000,
      status: 'accepted',
      projectId: 'proj-1',
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
    },
    {
      id: 'quote-2',
      number: 'COT-002',
      clientName: 'Residencial Las Palmas',
      projectName: 'Closet habitación principal',
      address: 'Km 12, Autopista Duarte',
      date: daysAgo(1),
      lines: [
        { id: 'ql-3', description: 'Closet a medida en melamina', amount: 48000 },
        { id: 'ql-4', description: 'Herrajes y correderas', amount: 20000 },
      ],
      total: 68000,
      status: 'sent',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ]

  const invoices: Invoice[] = [
    {
      id: 'inv-1',
      number: 'FAC-001',
      clientName: 'Oficina Centro',
      projectName: 'Terminaciones interiores',
      address: 'Av. Winston Churchill',
      date: daysAgo(2),
      notes: 'Saldo según avance de obra.',
      lines: [
        { id: 'il-1', description: 'Terminaciones interiores', amount: 320000 },
      ],
      total: 320000,
      status: 'issued',
      projectId: 'proj-3',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: 'inv-2',
      number: 'FAC-002',
      clientName: 'Apartamento Naco',
      projectName: 'Baño principal',
      address: 'Naco, Santo Domingo',
      date: daysAgo(14),
      lines: [
        { id: 'il-2', description: 'Baño principal — trabajo completo', amount: 145000 },
      ],
      total: 145000,
      status: 'paid',
      projectId: 'proj-4',
      createdAt: daysAgo(14),
      updatedAt: daysAgo(14),
    },
  ]

  const next: DemoState = { projects, technicians, workDays, purchases, payments, quotes, invoices }
  next.projects = next.projects.map((project) => withTotals(project, next))
  return next
}

const DATE_KEYS = new Set(['startDate', 'createdAt', 'updatedAt', 'date'])

function reviveDates(key: string, value: unknown): unknown {
  if (DATE_KEYS.has(key) && typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return value
}

function ensureDate(value: Date | string | undefined, fallback = new Date()): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return fallback
}

function normalizeLines(lines: Quote['lines'] | undefined): Quote['lines'] {
  if (!Array.isArray(lines)) return []
  return lines.map((line, index) => ({
    id: line.id || `line-${index}`,
    description: line.description?.trim() || 'Partida',
    amount: Number.isFinite(line.amount) ? line.amount : 0,
  }))
}

function normalizeQuote(quote: Quote): Quote {
  const lines = normalizeLines(quote.lines)
  return {
    ...quote,
    lines,
    total: linesTotal(lines),
    date: ensureDate(quote.date),
    createdAt: ensureDate(quote.createdAt),
    updatedAt: ensureDate(quote.updatedAt),
    address: quote.address?.trim() || undefined,
    notes: quote.notes?.trim() || undefined,
  }
}

function normalizeInvoice(invoice: Invoice): Invoice {
  const lines = normalizeLines(invoice.lines)
  return {
    ...invoice,
    lines,
    total: linesTotal(lines),
    date: ensureDate(invoice.date),
    createdAt: ensureDate(invoice.createdAt),
    updatedAt: ensureDate(invoice.updatedAt),
    address: invoice.address?.trim() || undefined,
    notes: invoice.notes?.trim() || undefined,
  }
}

function seedDocuments(): Pick<DemoState, 'quotes' | 'invoices'> {
  const seeded = seedState()
  return { quotes: seeded.quotes, invoices: seeded.invoices }
}

function withSeedDocuments(state: DemoState): DemoState {
  const seed = seedDocuments()
  return {
    ...state,
    quotes: state.quotes.length > 0 ? state.quotes : seed.quotes,
    invoices: state.invoices.length > 0 ? state.invoices : seed.invoices,
  }
}

function normalizeState(input: DemoState): DemoState {
  const workDays = input.workDays ?? {}
  const purchases = input.purchases ?? {}
  const payments = input.payments ?? {}
  const next: DemoState = {
    projects: input.projects ?? [],
    technicians: input.technicians ?? [],
    workDays,
    purchases,
    payments,
    quotes: (input.quotes ?? []).map(normalizeQuote),
    invoices: (input.invoices ?? []).map(normalizeInvoice),
  }
  next.projects = next.projects.map((project) => {
    const totals = computeProjectTotals({
      budget: project.budget,
      workDays: workDays[project.id] ?? [],
      purchases: purchases[project.id] ?? [],
      payments: payments[project.id] ?? [],
    })
    return {
      ...project,
      ...totals,
      startDate: ensureDate(project.startDate),
      createdAt: ensureDate(project.createdAt),
      updatedAt: ensureDate(project.updatedAt),
    }
  })
  return next
}

function readStoredState(key: string): DemoState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw, reviveDates) as DemoState
    if (!parsed || !Array.isArray(parsed.projects)) return null
    return normalizeState(parsed)
  } catch {
    return null
  }
}

function mergeUserProjects(base: DemoState, extra: DemoState): DemoState {
  const projectIds = new Set(base.projects.map((project) => project.id))
  const techIds = new Set(base.technicians.map((technician) => technician.id))
  const quoteIds = new Set((base.quotes ?? []).map((quote) => quote.id))
  const invoiceIds = new Set((base.invoices ?? []).map((invoice) => invoice.id))
  const userProjects = extra.projects.filter(
    (project) => !SEED_PROJECT_IDS.has(project.id) && !projectIds.has(project.id),
  )
  const userTechnicians = extra.technicians.filter(
    (technician) => !SEED_TECH_IDS.has(technician.id) && !techIds.has(technician.id),
  )
  const userQuotes = (extra.quotes ?? []).filter(
    (quote) => !SEED_QUOTE_IDS.has(quote.id) && !quoteIds.has(quote.id),
  )
  const userInvoices = (extra.invoices ?? []).filter(
    (invoice) => !SEED_INVOICE_IDS.has(invoice.id) && !invoiceIds.has(invoice.id),
  )
  if (
    userProjects.length === 0 &&
    userTechnicians.length === 0 &&
    userQuotes.length === 0 &&
    userInvoices.length === 0
  ) {
    return base
  }

  const workDays = { ...base.workDays }
  const purchases = { ...base.purchases }
  const payments = { ...base.payments }
  for (const project of userProjects) {
    workDays[project.id] = extra.workDays[project.id] ?? []
    purchases[project.id] = extra.purchases[project.id] ?? []
    payments[project.id] = extra.payments[project.id] ?? []
  }

  return {
    projects: [...userProjects, ...base.projects],
    technicians: [...base.technicians, ...userTechnicians],
    workDays,
    purchases,
    payments,
    quotes: [...userQuotes, ...base.quotes],
    invoices: [...userInvoices, ...base.invoices],
  }
}

function userProjectsOf(state: DemoState | null): Project[] {
  if (!state) return []
  return state.projects.filter((project) => !SEED_PROJECT_IDS.has(project.id))
}

function stripSeedProjects(state: DemoState): DemoState {
  const projects = userProjectsOf(state)
  const workDays = { ...state.workDays }
  const purchases = { ...state.purchases }
  const payments = { ...state.payments }
  for (const id of SEED_PROJECT_IDS) {
    delete workDays[id]
    delete purchases[id]
    delete payments[id]
  }
  return { ...state, projects, workDays, purchases, payments }
}

function loadState(): DemoState {
  const current = readStoredState(STORAGE_KEY)
  const legacyStates = LEGACY_STORAGE_KEYS.map((key) => readStoredState(key)).filter(
    (item): item is DemoState => item !== null,
  )
  const withUserProjects = [current, ...legacyStates].filter(
    (item): item is DemoState => Boolean(item && userProjectsOf(item).length > 0),
  )

  if (withUserProjects.length > 0) {
    let next = stripSeedProjects(withUserProjects[0])
    for (const extra of withUserProjects.slice(1)) {
      next = mergeUserProjects(next, extra)
    }
    return withSeedDocuments(next)
  }

  return withSeedDocuments(current ?? seedState())
}

let state = loadState()

function persist() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

persist()

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
  return project.id
}

export function reorderDemoColumns(
  columns: { status: ProjectStatus; orderedIds: string[] }[],
  movedProjectId?: string,
) {
  const now = new Date()
  const nextById = new Map<string, { status: ProjectStatus; order: number }>()
  for (const column of columns) {
    column.orderedIds.forEach((id, order) => {
      nextById.set(id, { status: column.status, order })
    })
  }

  state = {
    ...state,
    projects: state.projects.map((project) => {
      const update = nextById.get(project.id)
      if (!update) return project
      return {
        ...project,
        status: update.status,
        order: update.order,
        updatedAt: movedProjectId === project.id ? now : project.updatedAt,
      }
    }),
  }
  emit()
}

export function reorderDemoColumn(
  status: ProjectStatus,
  orderedIds: string[],
  movedProjectId?: string,
) {
  reorderDemoColumns([{ status, orderedIds }], movedProjectId)
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

export function deleteDemoProject(projectId: string) {
  const workDays = { ...state.workDays }
  const purchases = { ...state.purchases }
  const payments = { ...state.payments }
  delete workDays[projectId]
  delete purchases[projectId]
  delete payments[projectId]
  state = {
    ...state,
    projects: state.projects.filter((project) => project.id !== projectId),
    workDays,
    purchases,
    payments,
  }
  emit()
}

export function resetDemoState() {
  if (typeof window !== 'undefined') {
    for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
      window.localStorage.removeItem(key)
    }
  }
  state = seedState()
  emit()
}

function documentFromForm(
  data: DocumentFormData,
): Pick<Quote, 'clientName' | 'projectName' | 'address' | 'date' | 'notes' | 'lines' | 'total' | 'projectId'> {
  const lines = data.lines
    .filter((line) => line.description.trim() && line.amount > 0)
    .map((line) => ({
      id: newId('line'),
      description: line.description.trim(),
      amount: line.amount,
    }))
  return {
    clientName: data.clientName.trim(),
    projectName: data.projectName.trim(),
    address: data.address?.trim() || undefined,
    date: data.date,
    notes: data.notes?.trim() || undefined,
    lines,
    total: linesTotal(lines),
    projectId: data.projectId,
  }
}

export function createDemoQuote(data: DocumentFormData) {
  const now = new Date()
  const fields = documentFromForm(data)
  const quote: Quote = {
    id: newId('quote'),
    number: nextDocumentNumber(
      'COT',
      state.quotes.map((item) => item.number),
    ),
    ...fields,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
  state = { ...state, quotes: [quote, ...state.quotes] }
  emit()
  return quote.id
}

export function updateDemoQuote(quoteId: string, data: DocumentFormData) {
  const fields = documentFromForm(data)
  state = {
    ...state,
    quotes: state.quotes.map((quote) =>
      quote.id === quoteId ? { ...quote, ...fields, updatedAt: new Date() } : quote,
    ),
  }
  emit()
}

export function setDemoQuoteStatus(quoteId: string, status: QuoteStatus) {
  const quote = state.quotes.find((item) => item.id === quoteId)
  if (!quote) return
  let projectId = quote.projectId
  if (status === 'accepted' && !projectId) {
    projectId = createDemoProject({
      clientName: quote.clientName,
      projectName: quote.projectName,
      address: quote.address,
      startDate: quote.date,
      budget: quote.total,
      materialsBudget: quote.total,
      laborBudget: 0,
    })
  }
  state = {
    ...state,
    quotes: state.quotes.map((item) =>
      item.id === quoteId ? { ...item, status, projectId, updatedAt: new Date() } : item,
    ),
  }
  emit()
}

export function deleteDemoQuote(quoteId: string) {
  state = { ...state, quotes: state.quotes.filter((quote) => quote.id !== quoteId) }
  emit()
}

export function createDemoInvoice(data: DocumentFormData, quoteId?: string) {
  const now = new Date()
  const fields = documentFromForm(data)
  const invoice: Invoice = {
    id: newId('inv'),
    number: nextDocumentNumber(
      'FAC',
      state.invoices.map((item) => item.number),
    ),
    ...fields,
    status: 'draft',
    quoteId,
    createdAt: now,
    updatedAt: now,
  }
  state = { ...state, invoices: [invoice, ...state.invoices] }
  emit()
  return invoice.id
}

export function createDemoInvoiceFromQuote(quoteId: string) {
  const quote = state.quotes.find((item) => item.id === quoteId)
  if (!quote) throw new Error('Cotización no encontrada')
  return createDemoInvoice(
    {
      clientName: quote.clientName,
      projectName: quote.projectName,
      address: quote.address,
      date: new Date(),
      notes: quote.notes,
      lines: quote.lines.map((line) => ({ description: line.description, amount: line.amount })),
      projectId: quote.projectId,
    },
    quote.id,
  )
}

export function updateDemoInvoice(invoiceId: string, data: DocumentFormData) {
  const fields = documentFromForm(data)
  state = {
    ...state,
    invoices: state.invoices.map((invoice) =>
      invoice.id === invoiceId ? { ...invoice, ...fields, updatedAt: new Date() } : invoice,
    ),
  }
  emit()
}

export function setDemoInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const invoice = state.invoices.find((item) => item.id === invoiceId)
  if (!invoice) return
  if (status === 'paid' && invoice.status !== 'paid' && invoice.projectId) {
    addDemoPayment(invoice.projectId, {
      amount: invoice.total,
      date: new Date(),
      method: 'transferencia',
      notes: `Factura ${invoice.number}`,
    })
  }
  state = {
    ...state,
    invoices: state.invoices.map((item) =>
      item.id === invoiceId ? { ...item, status, updatedAt: new Date() } : item,
    ),
  }
  emit()
}

export function deleteDemoInvoice(invoiceId: string) {
  state = { ...state, invoices: state.invoices.filter((invoice) => invoice.id !== invoiceId) }
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
