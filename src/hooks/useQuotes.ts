import { useCallback, useSyncExternalStore } from 'react'
import {
  createDemoQuote,
  deleteDemoQuote,
  getDemoState,
  setDemoQuoteStatus,
  subscribeDemoStore,
  updateDemoQuote,
} from '../lib/demoStore'
import type { DocumentFormData, QuoteStatus } from '../types/document'

export function useQuotes() {
  const state = useSyncExternalStore(subscribeDemoStore, getDemoState, getDemoState)

  const createQuote = useCallback(async (data: DocumentFormData) => createDemoQuote(data), [])
  const updateQuote = useCallback(
    async (id: string, data: DocumentFormData) => updateDemoQuote(id, data),
    [],
  )
  const setStatus = useCallback(
    async (id: string, status: QuoteStatus) => setDemoQuoteStatus(id, status),
    [],
  )
  const removeQuote = useCallback(async (id: string) => deleteDemoQuote(id), [])

  return {
    quotes: state.quotes,
    projects: state.projects,
    createQuote,
    updateQuote,
    setStatus,
    removeQuote,
  }
}

export function useQuote(quoteId: string | undefined) {
  const { quotes, projects, updateQuote, setStatus, removeQuote } = useQuotes()
  const quote = quotes.find((item) => item.id === quoteId) ?? null
  const project = quote?.projectId
    ? (projects.find((item) => item.id === quote.projectId) ?? null)
    : null
  return { quote, project, updateQuote, setStatus, removeQuote }
}
