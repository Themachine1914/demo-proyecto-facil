import type { DocumentData } from 'firebase/firestore'
import type { Payment, Purchase, WorkDay } from '../types/finance'
import type { Project, ProjectStatus } from '../types/project'
import type { Technician } from '../types/technician'
import { BOARD_COLUMNS } from './constants'
import { toDate, toNumber, toOptionalString } from './parse'

const STATUS_IDS = new Set(BOARD_COLUMNS.map((column) => column.id))

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && STATUS_IDS.has(value as ProjectStatus)
}

export function mapProject(id: string, data: DocumentData): Project {
  return {
    id,
    clientName: typeof data.clientName === 'string' ? data.clientName : '',
    projectName: typeof data.projectName === 'string' ? data.projectName : '',
    address: toOptionalString(data.address),
    startDate: toDate(data.startDate),
    status: isProjectStatus(data.status) ? data.status : 'quoted',
    order: toNumber(data.order),
    budget: toNumber(data.budget),
    materialsBudget: toNumber(data.materialsBudget),
    laborBudget: toNumber(data.laborBudget),
    physicalProgress: Math.min(100, Math.max(0, toNumber(data.physicalProgress))),
    laborCost: toNumber(data.laborCost),
    materialsPurchased: toNumber(data.materialsPurchased),
    paymentsReceived: toNumber(data.paymentsReceived),
    realCost: toNumber(data.realCost),
    pendingBalance: toNumber(data.pendingBalance, toNumber(data.budget)),
    estimatedProfit: toNumber(data.estimatedProfit, toNumber(data.budget)),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export function mapTechnician(id: string, data: DocumentData): Technician {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : '',
    dailyRate: toNumber(data.dailyRate),
    active: data.active !== false,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export function mapWorkDay(id: string, data: DocumentData): WorkDay {
  return {
    id,
    technicianId: typeof data.technicianId === 'string' ? data.technicianId : '',
    technicianName: typeof data.technicianName === 'string' ? data.technicianName : '',
    date: toDate(data.date),
    dailyValue: toNumber(data.dailyValue),
    notes: toOptionalString(data.notes),
    createdAt: toDate(data.createdAt),
  }
}

function isPurchasePaymentType(value: unknown): value is Purchase['paymentType'] {
  return value === 'cash' || value === 'credit'
}

export function mapPurchase(id: string, data: DocumentData): Purchase {
  return {
    id,
    amount: toNumber(data.amount),
    date: toDate(data.date),
    paymentType: isPurchasePaymentType(data.paymentType) ? data.paymentType : 'cash',
    notes: toOptionalString(data.notes),
    createdAt: toDate(data.createdAt),
  }
}

function isPaymentMethod(value: unknown): value is NonNullable<Payment['method']> {
  return (
    value === 'efectivo' ||
    value === 'transferencia' ||
    value === 'cheque' ||
    value === 'otro'
  )
}

export function mapPayment(id: string, data: DocumentData): Payment {
  return {
    id,
    amount: toNumber(data.amount),
    date: toDate(data.date),
    method: isPaymentMethod(data.method) ? data.method : undefined,
    notes: toOptionalString(data.notes),
    createdAt: toDate(data.createdAt),
  }
}
