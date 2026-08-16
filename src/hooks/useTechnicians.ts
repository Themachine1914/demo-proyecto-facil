import { useCallback, useSyncExternalStore } from 'react'
import {
  createDemoTechnician,
  getDemoState,
  setDemoTechnicianActive,
  subscribeDemoStore,
  updateDemoTechnician,
} from '../lib/demoStore'
import type { TechnicianFormData } from '../types/technician'

export function useTechnicians() {
  const state = useSyncExternalStore(subscribeDemoStore, getDemoState, getDemoState)

  const createTechnician = useCallback(async (data: TechnicianFormData) => {
    createDemoTechnician(data)
  }, [])

  const updateTechnician = useCallback(async (id: string, data: TechnicianFormData) => {
    updateDemoTechnician(id, data)
  }, [])

  const setTechnicianActive = useCallback(async (id: string, active: boolean) => {
    setDemoTechnicianActive(id, active)
  }, [])

  return {
    technicians: state.technicians,
    loading: false,
    createTechnician,
    updateTechnician,
    setTechnicianActive,
  }
}
