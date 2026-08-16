import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PROJECTS_COLLECTION } from '../lib/constants'
import { db } from '../lib/firebase'
import { mapProject } from '../lib/mappers'
import type { Project, ProjectFormData, ProjectStatus } from '../types/project'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      setProjects([])
      setLoading(false)
      return
    }

    const q = query(collection(db, PROJECTS_COLLECTION), orderBy('order', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setProjects(snapshot.docs.map((docSnap) => mapProject(docSnap.id, docSnap.data())))
        setLoading(false)
      },
      (error) => {
        console.error(error)
        toast.error('No se pudieron cargar los proyectos')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const createProject = useCallback(
    async (data: ProjectFormData) => {
      if (!db) throw new Error('Firebase no está configurado')

      const quoted = projects.filter((project) => project.status === 'quoted')
      const nextOrder =
        quoted.length > 0 ? Math.max(...quoted.map((project) => project.order)) + 1 : 0
      const budget = data.budget

      await addDoc(collection(db, PROJECTS_COLLECTION), {
        clientName: data.clientName.trim(),
        projectName: data.projectName.trim(),
        address: data.address?.trim() || null,
        startDate: data.startDate,
        status: 'quoted',
        order: nextOrder,
        budget,
        materialsBudget: data.materialsBudget,
        laborBudget: data.laborBudget,
        physicalProgress: 0,
        laborCost: 0,
        materialsPurchased: 0,
        paymentsReceived: 0,
        realCost: 0,
        pendingBalance: budget,
        estimatedProfit: budget,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    },
    [projects],
  )

  const reorderColumn = useCallback(
    async (status: ProjectStatus, orderedIds: string[], movedProjectId?: string) => {
      if (!db) return
      const batch = writeBatch(db)
      const now = serverTimestamp()

      orderedIds.forEach((id, index) => {
        const ref = doc(db!, PROJECTS_COLLECTION, id)
        const payload: Record<string, unknown> = {
          status,
          order: index,
          updatedAt: now,
        }
        if (movedProjectId && id === movedProjectId) {
          payload.updatedAt = now
        }
        batch.update(ref, payload)
      })

      await batch.commit()
    },
    [],
  )

  const moveProjectToColumn = useCallback(
    async (projectId: string, newStatus: ProjectStatus) => {
      if (!db) throw new Error('Firebase no está configurado')

      const project = projects.find((item) => item.id === projectId)
      if (!project || project.status === newStatus) return

      const oldStatus = project.status
      const batch = writeBatch(db)
      const now = serverTimestamp()

      const oldColumnIds = projects
        .filter((item) => item.status === oldStatus && item.id !== projectId)
        .sort((a, b) => a.order - b.order)
        .map((item) => item.id)

      oldColumnIds.forEach((id, index) => {
        batch.update(doc(db!, PROJECTS_COLLECTION, id), { order: index, updatedAt: now })
      })

      const newColumnCount = projects.filter((item) => item.status === newStatus).length
      batch.update(doc(db, PROJECTS_COLLECTION, projectId), {
        status: newStatus,
        order: newColumnCount,
        updatedAt: now,
      })

      await batch.commit()
    },
    [projects],
  )

  return {
    projects,
    loading,
    createProject,
    reorderColumn,
    moveProjectToColumn,
  }
}
