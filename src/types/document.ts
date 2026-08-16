export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'
export type InvoiceStatus = 'draft' | 'issued' | 'paid'

export interface DocumentLine {
  id: string
  description: string
  amount: number
}

export interface DocumentLineInput {
  description: string
  amount: number
}

export interface Quote {
  id: string
  number: string
  clientName: string
  projectName: string
  address?: string
  date: Date
  notes?: string
  lines: DocumentLine[]
  total: number
  status: QuoteStatus
  projectId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  number: string
  clientName: string
  projectName: string
  address?: string
  date: Date
  notes?: string
  lines: DocumentLine[]
  total: number
  status: InvoiceStatus
  projectId?: string
  quoteId?: string
  createdAt: Date
  updatedAt: Date
}

export interface DocumentFormData {
  clientName: string
  projectName: string
  address?: string
  date: Date
  notes?: string
  lines: DocumentLineInput[]
  projectId?: string
}
