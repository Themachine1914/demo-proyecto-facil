import type { Payment, ProjectTotals, Purchase, WorkDay } from '../types/finance'
import type { Project, ProjectStatus } from '../types/project'

export function computeProjectTotals(input: {
  budget: number
  workDays: WorkDay[]
  purchases: Purchase[]
  payments: Payment[]
}): ProjectTotals {
  const laborCost = input.workDays.reduce((acc, day) => acc + day.dailyValue, 0)
  const materialsPurchased = input.purchases.reduce((acc, item) => acc + item.amount, 0)
  const paymentsReceived = input.payments.reduce((acc, item) => acc + item.amount, 0)
  const realCost = laborCost + materialsPurchased

  return {
    laborCost,
    materialsPurchased,
    paymentsReceived,
    realCost,
    pendingBalance: input.budget - paymentsReceived,
    estimatedProfit: input.budget - realCost,
  }
}

export function profitPercent(budget: number, estimatedProfit: number): number {
  if (budget <= 0) return 0
  return (estimatedProfit / budget) * 100
}

export function suggestedPhysicalProgress(
  materialsPurchased: number,
  materialsBudget: number,
): number | null {
  if (materialsBudget <= 0) return null
  return Math.min(100, Math.round((materialsPurchased / materialsBudget) * 100))
}

export function budgetDelta(spent: number, budget: number): number {
  return spent - budget
}

export function remainingToSpend(spent: number, budget: number): number {
  if (budget <= 0) return 0
  return Math.max(0, budget - spent)
}

export function amountToInvest(input: {
  budget?: number
  materialsBudget: number
  materialsPurchased: number
  laborBudget: number
  laborCost: number
}): number {
  const fromLineBudgets =
    remainingToSpend(input.materialsPurchased, input.materialsBudget) +
    remainingToSpend(input.laborCost, input.laborBudget)
  if (fromLineBudgets > 0) return fromLineBudgets
  return remainingToSpend(
    input.materialsPurchased + input.laborCost,
    input.budget ?? 0,
  )
}

export function amountToCollect(input: { pendingBalance: number }): number {
  return Math.max(0, input.pendingBalance)
}

export function isActiveProjectStatus(status: ProjectStatus): boolean {
  return status === 'quoted' || status === 'in_progress' || status === 'to_collect'
}

export function isCollectableStatus(status: ProjectStatus): boolean {
  return status === 'quoted' || status === 'in_progress' || status === 'to_collect'
}

export function isOpenInvestmentStatus(status: ProjectStatus): boolean {
  return status === 'quoted' || status === 'in_progress'
}

export function isApprovedStatus(status: ProjectStatus): boolean {
  return status === 'in_progress' || status === 'to_collect' || status === 'finished'
}

export function computeDashboardStats(projects: Project[]) {
  const active = projects.filter((project) => isActiveProjectStatus(project.status))
  const quotedTotal = projects
    .filter((project) => project.status === 'quoted')
    .reduce((acc, project) => acc + project.budget, 0)
  const approvedTotal = projects
    .filter((project) => isApprovedStatus(project.status))
    .reduce((acc, project) => acc + project.budget, 0)
  const toCollect = projects
    .filter((project) => isCollectableStatus(project.status))
    .reduce((acc, project) => acc + amountToCollect(project), 0)
  const toInvest = projects
    .filter((project) => isOpenInvestmentStatus(project.status))
    .reduce((acc, project) => acc + amountToInvest(project), 0)
  const recent = [...projects]
    .sort((a, b) => timestamp(b.updatedAt) - timestamp(a.updatedAt))
    .slice(0, 6)

  return {
    activeCount: active.length,
    quotedTotal,
    approvedTotal,
    toCollect,
    toInvest,
    recent,
  }
}

function timestamp(value: Date | string | number | undefined): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = new Date(value).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

export function materialsBudgetDelta(
  materialsPurchased: number,
  materialsBudget: number,
): number {
  return budgetDelta(materialsPurchased, materialsBudget)
}
