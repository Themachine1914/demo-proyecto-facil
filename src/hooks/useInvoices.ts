import { useCallback, useSyncExternalStore } from 'react'
import {
  createDemoInvoice,
  createDemoInvoiceFromQuote,
  deleteDemoInvoice,
  getDemoState,
  setDemoInvoiceStatus,
  subscribeDemoStore,
  updateDemoInvoice,
} from '../lib/demoStore'
import type { DocumentFormData, InvoiceStatus } from '../types/document'

export function useInvoices() {
  const state = useSyncExternalStore(subscribeDemoStore, getDemoState, getDemoState)

  const createInvoice = useCallback(
    async (data: DocumentFormData, quoteId?: string) => createDemoInvoice(data, quoteId),
    [],
  )
  const createFromQuote = useCallback(
    async (quoteId: string) => createDemoInvoiceFromQuote(quoteId),
    [],
  )
  const updateInvoice = useCallback(
    async (id: string, data: DocumentFormData) => updateDemoInvoice(id, data),
    [],
  )
  const setStatus = useCallback(
    async (id: string, status: InvoiceStatus) => setDemoInvoiceStatus(id, status),
    [],
  )
  const removeInvoice = useCallback(async (id: string) => deleteDemoInvoice(id), [])

  return {
    invoices: state.invoices,
    quotes: state.quotes,
    projects: state.projects,
    createInvoice,
    createFromQuote,
    updateInvoice,
    setStatus,
    removeInvoice,
  }
}

export function useInvoice(invoiceId: string | undefined) {
  const { invoices, projects, quotes, updateInvoice, setStatus, removeInvoice } = useInvoices()
  const invoice = invoices.find((item) => item.id === invoiceId) ?? null
  const project = invoice?.projectId
    ? (projects.find((item) => item.id === invoice.projectId) ?? null)
    : null
  const quote = invoice?.quoteId
    ? (quotes.find((item) => item.id === invoice.quoteId) ?? null)
    : null
  return { invoice, project, quote, updateInvoice, setStatus, removeInvoice }
}
