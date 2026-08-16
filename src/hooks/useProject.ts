import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { computeProjectTotals } from '../lib/finance'
import {
  addDemoPayment,
  addDemoPurchase,
  addDemoWorkDay,
  deleteDemoPayment,
  deleteDemoPurchase,
  deleteDemoWorkDay,
  getDemoState,
  subscribeDemoStore,
  updateDemoGeneral,
  updateDemoProgress,
} from '../lib/demoStore'
import type {
  PaymentFormData,
  ProjectTotals,
  PurchaseFormData,
  WorkDayFormData,
} from '../types/finance'
import type { ProjectGeneralUpdate } from '../types/project'

function emptyTotals(budget: number): ProjectTotals {
  return {
    laborCost: 0,
    materialsPurchased: 0,
    paymentsReceived: 0,
    realCost: 0,
    pendingBalance: budget,
    estimatedProfit: budget,
  }
}

export function useProject(projectId: string | undefined) {
  const state = useSyncExternalStore(subscribeDemoStore, getDemoState, getDemoState)
  const project = state.projects.find((item) => item.id === projectId) ?? null
  const workDays = projectId ? (state.workDays[projectId] ?? []) : []
  const purchases = projectId ? (state.purchases[projectId] ?? []) : []
  const payments = projectId ? (state.payments[projectId] ?? []) : []

  const liveTotals = useMemo(() => {
    if (!project) return emptyTotals(0)
    return computeProjectTotals({
      budget: project.budget,
      workDays,
      purchases,
      payments,
    })
  }, [project, workDays, purchases, payments])

  const addWorkDay = useCallback(
    async (data: WorkDayFormData) => {
      if (!projectId) throw new Error('Proyecto no encontrado')
      addDemoWorkDay(projectId, data)
    },
    [projectId],
  )

  const deleteWorkDay = useCallback(
    async (workDayId: string) => {
      if (!projectId) throw new Error('Proyecto no encontrado')
      deleteDemoWorkDay(projectId, workDayId)
    },
    [projectId],
  )

  const addPurchase = useCallback(
    async (data: PurchaseFormData) => {
      if (!projectId) throw new Error('Proyecto no encontrado')
      addDemoPurchase(projectId, data)
    },
    [projectId],
  )

  const deletePurchase = useCallback(
    async (purchaseId: string) => {
      if (!projectId) throw new Error('Proyecto no encontrado')
      deleteDemoPurchase(projectId, purchaseId)
    },
    [projectId],
  )

  const addPayment = useCallback(
    async (data: PaymentFormData) => {
      if (!projectId) throw new Error('Proyecto no encontrado')
      addDemoPayment(projectId, data)
    },
    [projectId],
  )

  const deletePayment = useCallback(
    async (paymentId: string) => {
      if (!projectId) throw new Error('Proyecto no encontrado')
      deleteDemoPayment(projectId, paymentId)
    },
    [projectId],
  )

  const updateGeneral = useCallback(
    async (data: ProjectGeneralUpdate) => {
      if (!projectId) throw new Error('Proyecto no encontrado')
      updateDemoGeneral(projectId, data)
    },
    [projectId],
  )

  const updatePhysicalProgress = useCallback(
    async (physicalProgress: number) => {
      if (!projectId) throw new Error('Proyecto no encontrado')
      updateDemoProgress(projectId, physicalProgress)
    },
    [projectId],
  )

  return {
    project,
    workDays,
    purchases,
    payments,
    liveTotals,
    loading: false,
    addWorkDay,
    deleteWorkDay,
    addPurchase,
    deletePurchase,
    addPayment,
    deletePayment,
    updateGeneral,
    updatePhysicalProgress,
  }
}

export function useMonthCashflow(period: string) {
  const state = useSyncExternalStore(subscribeDemoStore, getDemoState, getDemoState)

  const paymentsTotal = Object.values(state.payments)
    .flat()
    .reduce((acc, item) => (monthMatches(item.date, period) ? acc + item.amount : acc), 0)
  const purchasesTotal = Object.values(state.purchases)
    .flat()
    .reduce((acc, item) => (monthMatches(item.date, period) ? acc + item.amount : acc), 0)
  const laborTotal = Object.values(state.workDays)
    .flat()
    .reduce((acc, item) => (monthMatches(item.date, period) ? acc + item.dailyValue : acc), 0)

  return {
    paymentsTotal,
    purchasesTotal,
    laborTotal,
    monthProfit: paymentsTotal - purchasesTotal - laborTotal,
  }
}

function monthMatches(date: Date, period: string): boolean {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}` === period
}
