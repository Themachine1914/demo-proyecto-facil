export type PurchasePaymentType = 'cash' | 'credit'

export type PaymentMethod = 'efectivo' | 'transferencia' | 'cheque' | 'otro'

export interface WorkDay {
  id: string
  technicianId: string
  technicianName: string
  date: Date
  dailyValue: number
  notes?: string
  createdAt: Date
}

export interface WorkDayFormData {
  technicianId: string
  technicianName: string
  date: Date
  dailyValue: number
  notes?: string
}

export interface Purchase {
  id: string
  amount: number
  date: Date
  paymentType: PurchasePaymentType
  notes?: string
  createdAt: Date
}

export interface PurchaseFormData {
  amount: number
  date: Date
  paymentType: PurchasePaymentType
  notes?: string
}

export interface Payment {
  id: string
  amount: number
  date: Date
  method?: PaymentMethod
  notes?: string
  createdAt: Date
}

export interface PaymentFormData {
  amount: number
  date: Date
  method?: PaymentMethod
  notes?: string
}

export interface ProjectTotals {
  laborCost: number
  materialsPurchased: number
  paymentsReceived: number
  realCost: number
  pendingBalance: number
  estimatedProfit: number
}
