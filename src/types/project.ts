export type ProjectStatus = 'quoted' | 'in_progress' | 'to_collect' | 'finished'

export interface Project {
  id: string
  clientName: string
  projectName: string
  address?: string
  startDate: Date
  status: ProjectStatus
  order: number
  budget: number
  materialsBudget: number
  laborBudget: number
  physicalProgress: number
  laborCost: number
  materialsPurchased: number
  paymentsReceived: number
  realCost: number
  pendingBalance: number
  estimatedProfit: number
  createdAt: Date
  updatedAt: Date
}

export interface ProjectFormData {
  clientName: string
  projectName: string
  address?: string
  startDate: Date
  budget: number
  materialsBudget: number
  laborBudget: number
}

export interface ProjectGeneralUpdate {
  clientName: string
  projectName: string
  address?: string
  startDate: Date
  budget: number
  materialsBudget: number
  laborBudget: number
  physicalProgress: number
}
