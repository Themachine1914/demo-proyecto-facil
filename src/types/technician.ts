export interface Technician {
  id: string
  name: string
  dailyRate: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TechnicianFormData {
  name: string
  dailyRate: number
}
