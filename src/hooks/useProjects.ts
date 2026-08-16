import { useCallback, useSyncExternalStore } from 'react'
import {
  createDemoProject,
  getDemoState,
  moveDemoProject,
  reorderDemoColumn,
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

  const moveProjectToColumn = useCallback(async (projectId: string, newStatus: ProjectStatus) => {
    moveDemoProject(projectId, newStatus)
  }, [])

  return {
    projects: state.projects,
    loading: false,
    createProject,
    reorderColumn,
    moveProjectToColumn,
  }
}
