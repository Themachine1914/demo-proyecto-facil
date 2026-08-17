import { useCallback, useSyncExternalStore } from 'react'
import {
  createDemoProject,
  getDemoState,
  moveDemoProject,
  reorderDemoColumn,
  reorderDemoColumns,
  resetDemoState,
  subscribeDemoStore,
} from '../lib/demoStore'
import type { ProjectFormData, ProjectStatus } from '../types/project'

export function useProjects() {
  const state = useSyncExternalStore(subscribeDemoStore, getDemoState, getDemoState)

  const createProject = useCallback(async (data: ProjectFormData) => {
    createDemoProject(data)
  }, [])

  const reorderColumn = useCallback(
    async (status: ProjectStatus, orderedIds: string[], movedProjectId?: string) => {
      reorderDemoColumn(status, orderedIds, movedProjectId)
    },
    [],
  )

  const reorderColumns = useCallback(
    async (
      columns: { status: ProjectStatus; orderedIds: string[] }[],
      movedProjectId?: string,
    ) => {
      reorderDemoColumns(columns, movedProjectId)
    },
    [],
  )

  const moveProjectToColumn = useCallback(async (projectId: string, newStatus: ProjectStatus) => {
    moveDemoProject(projectId, newStatus)
  }, [])

  const restoreDemoData = useCallback(async () => {
    resetDemoState()
  }, [])

  return {
    projects: state.projects,
    loading: false,
    createProject,
    reorderColumn,
    reorderColumns,
    moveProjectToColumn,
    restoreDemoData,
  }
}
