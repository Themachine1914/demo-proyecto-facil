import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PAYMENTS_SUBCOLLECTION,
  PROJECTS_COLLECTION,
  PURCHASES_SUBCOLLECTION,
  WORK_DAYS_SUBCOLLECTION,
} from '../lib/constants'
import { computeProjectTotals } from '../lib/finance'
import { db } from '../lib/firebase'
import { mapPayment, mapProject, mapPurchase, mapWorkDay } from '../lib/mappers'
import type {
  Payment,
  PaymentFormData,
  ProjectTotals,
  Purchase,
  PurchaseFormData,
  WorkDay,
  WorkDayFormData,
} from '../types/finance'
import type { Project, ProjectGeneralUpdate } from '../types/project'

function emptyTotals(budget: number): ProjectTotals {
  return {
    laborCost: 0,
    materialsPurchased: 0,
    paymentsReceived: 0,
    realCost: 0,
    pendingBalance: budget,
    estimatedProfit: budget,
  }
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [workDays, setWorkDays] = useState<WorkDay[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !projectId) {
      setProject(null)
      setWorkDays([])
      setPurchases([])
      setPayments([])
      setLoading(false)
      return
    }

    setLoading(true)
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId)

    const unsubProject = onSnapshot(
      projectRef,
      (snapshot) => {
        setProject(snapshot.exists() ? mapProject(snapshot.id, snapshot.data()) : null)
        setLoading(false)
      },
      (error) => {
        console.error(error)
        toast.error('No se pudo cargar el proyecto')
        setLoading(false)
      },
    )

    const unsubWorkDays = onSnapshot(
      query(collection(projectRef, WORK_DAYS_SUBCOLLECTION), orderBy('date', 'desc')),
      (snapshot) => {
        setWorkDays(snapshot.docs.map((item) => mapWorkDay(item.id, item.data())))
      },
      (error) => {
        console.error(error)
        toast.error('No se pudieron cargar las jornadas')
      },
    )

    const unsubPurchases = onSnapshot(
      query(collection(projectRef, PURCHASES_SUBCOLLECTION), orderBy('date', 'desc')),
      (snapshot) => {
        setPurchases(snapshot.docs.map((item) => mapPurchase(item.id, item.data())))
      },
      (error) => {
        console.error(error)
        toast.error('No se pudieron cargar las compras')
      },
    )

    const unsubPayments = onSnapshot(
      query(collection(projectRef, PAYMENTS_SUBCOLLECTION), orderBy('date', 'desc')),
      (snapshot) => {
        setPayments(snapshot.docs.map((item) => mapPayment(item.id, item.data())))
      },
      (error) => {
        console.error(error)
        toast.error('No se pudieron cargar los pagos')
      },
    )

    return () => {
      unsubProject()
      unsubWorkDays()
      unsubPurchases()
      unsubPayments()
    }
  }, [projectId])

  const liveTotals = useMemo(() => {
    if (!project) return emptyTotals(0)
    return computeProjectTotals({
      budget: project.budget,
      workDays,
      purchases,
      payments,
    })
  }, [project, workDays, purchases, payments])

  const persistTotals = useCallback(
    (
      nextWorkDays: WorkDay[],
      nextPurchases: Purchase[],
      nextPayments: Payment[],
      budget = project?.budget ?? 0,
    ): ProjectTotals => {
      return computeProjectTotals({
        budget,
        workDays: nextWorkDays,
        purchases: nextPurchases,
        payments: nextPayments,
      })
    },
    [project?.budget],
  )

  const addWorkDay = useCallback(
    async (data: WorkDayFormData) => {
      if (!db || !projectId || !project) throw new Error('Firebase no está configurado')
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
      const itemRef = doc(collection(projectRef, WORK_DAYS_SUBCOLLECTION))
      const nextWorkDays: WorkDay[] = [
        {
          id: itemRef.id,
          ...data,
          createdAt: new Date(),
        },
        ...workDays,
      ]
      const totals = persistTotals(nextWorkDays, purchases, payments)
      const batch = writeBatch(db)
      batch.set(itemRef, {
        technicianId: data.technicianId,
        technicianName: data.technicianName,
        date: data.date,
        dailyValue: data.dailyValue,
        notes: data.notes?.trim() || null,
        createdAt: serverTimestamp(),
      })
      batch.update(projectRef, { ...totals, updatedAt: serverTimestamp() })
      await batch.commit()
    },
    [payments, persistTotals, project, projectId, purchases, workDays],
  )

  const deleteWorkDay = useCallback(
    async (workDayId: string) => {
      if (!db || !projectId) throw new Error('Firebase no está configurado')
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
      const nextWorkDays = workDays.filter((item) => item.id !== workDayId)
      const totals = persistTotals(nextWorkDays, purchases, payments)
      const batch = writeBatch(db)
      batch.delete(doc(projectRef, WORK_DAYS_SUBCOLLECTION, workDayId))
      batch.update(projectRef, { ...totals, updatedAt: serverTimestamp() })
      await batch.commit()
    },
    [payments, persistTotals, projectId, purchases, workDays],
  )

  const addPurchase = useCallback(
    async (data: PurchaseFormData) => {
      if (!db || !projectId || !project) throw new Error('Firebase no está configurado')
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
      const itemRef = doc(collection(projectRef, PURCHASES_SUBCOLLECTION))
      const nextPurchases: Purchase[] = [
        { id: itemRef.id, ...data, createdAt: new Date() },
        ...purchases,
      ]
      const totals = persistTotals(workDays, nextPurchases, payments)
      const batch = writeBatch(db)
      batch.set(itemRef, {
        amount: data.amount,
        date: data.date,
        paymentType: data.paymentType,
        notes: data.notes?.trim() || null,
        createdAt: serverTimestamp(),
      })
      batch.update(projectRef, { ...totals, updatedAt: serverTimestamp() })
      await batch.commit()
    },
    [payments, persistTotals, project, projectId, purchases, workDays],
  )

  const deletePurchase = useCallback(
    async (purchaseId: string) => {
      if (!db || !projectId) throw new Error('Firebase no está configurado')
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
      const nextPurchases = purchases.filter((item) => item.id !== purchaseId)
      const totals = persistTotals(workDays, nextPurchases, payments)
      const batch = writeBatch(db)
      batch.delete(doc(projectRef, PURCHASES_SUBCOLLECTION, purchaseId))
      batch.update(projectRef, { ...totals, updatedAt: serverTimestamp() })
      await batch.commit()
    },
    [payments, persistTotals, projectId, purchases, workDays],
  )

  const addPayment = useCallback(
    async (data: PaymentFormData) => {
      if (!db || !projectId || !project) throw new Error('Firebase no está configurado')
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
      const itemRef = doc(collection(projectRef, PAYMENTS_SUBCOLLECTION))
      const nextPayments: Payment[] = [
        { id: itemRef.id, ...data, createdAt: new Date() },
        ...payments,
      ]
      const totals = persistTotals(workDays, purchases, nextPayments)
      const batch = writeBatch(db)
      batch.set(itemRef, {
        amount: data.amount,
        date: data.date,
        method: data.method ?? null,
        notes: data.notes?.trim() || null,
        createdAt: serverTimestamp(),
      })
      batch.update(projectRef, { ...totals, updatedAt: serverTimestamp() })
      await batch.commit()
    },
    [payments, persistTotals, project, projectId, purchases, workDays],
  )

  const deletePayment = useCallback(
    async (paymentId: string) => {
      if (!db || !projectId) throw new Error('Firebase no está configurado')
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
      const nextPayments = payments.filter((item) => item.id !== paymentId)
      const totals = persistTotals(workDays, purchases, nextPayments)
      const batch = writeBatch(db)
      batch.delete(doc(projectRef, PAYMENTS_SUBCOLLECTION, paymentId))
      batch.update(projectRef, { ...totals, updatedAt: serverTimestamp() })
      await batch.commit()
    },
    [payments, persistTotals, projectId, purchases, workDays],
  )

  const updateGeneral = useCallback(
    async (data: ProjectGeneralUpdate) => {
      if (!db || !projectId) throw new Error('Firebase no está configurado')
      const totals = persistTotals(workDays, purchases, payments, data.budget)
      await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
        clientName: data.clientName.trim(),
        projectName: data.projectName.trim(),
        address: data.address?.trim() || null,
        startDate: data.startDate,
        budget: data.budget,
        materialsBudget: data.materialsBudget,
        laborBudget: data.laborBudget,
        physicalProgress: data.physicalProgress,
        ...totals,
        updatedAt: serverTimestamp(),
      })
    },
    [payments, persistTotals, projectId, purchases, workDays],
  )

  const updatePhysicalProgress = useCallback(
    async (physicalProgress: number) => {
      if (!db || !projectId) throw new Error('Firebase no está configurado')
      await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
        physicalProgress,
        updatedAt: serverTimestamp(),
      })
    },
    [projectId],
  )

  return {
    project,
    workDays,
    purchases,
    payments,
    liveTotals,
    loading,
    addWorkDay,
    deleteWorkDay,
    addPurchase,
    deletePurchase,
    addPayment,
    deletePayment,
    updateGeneral,
    updatePhysicalProgress,
  }
}

export function useMonthCashflow(period: string) {
  const [paymentsTotal, setPaymentsTotal] = useState(0)
  const [purchasesTotal, setPurchasesTotal] = useState(0)
  const [laborTotal, setLaborTotal] = useState(0)

  useEffect(() => {
    if (!db) {
      setPaymentsTotal(0)
      setPurchasesTotal(0)
      setLaborTotal(0)
      return
    }

    const unsubPayments = onSnapshot(
      collectionGroup(db, PAYMENTS_SUBCOLLECTION),
      (snapshot) => {
        const total = snapshot.docs.reduce((acc, item) => {
          const payment = mapPayment(item.id, item.data())
          return monthMatches(payment.date, period) ? acc + payment.amount : acc
        }, 0)
        setPaymentsTotal(total)
      },
      (error) => console.error(error),
    )

    const unsubPurchases = onSnapshot(
      collectionGroup(db, PURCHASES_SUBCOLLECTION),
      (snapshot) => {
        const total = snapshot.docs.reduce((acc, item) => {
          const purchase = mapPurchase(item.id, item.data())
          return monthMatches(purchase.date, period) ? acc + purchase.amount : acc
        }, 0)
        setPurchasesTotal(total)
      },
      (error) => console.error(error),
    )

    const unsubWorkDays = onSnapshot(
      collectionGroup(db, WORK_DAYS_SUBCOLLECTION),
      (snapshot) => {
        const total = snapshot.docs.reduce((acc, item) => {
          const workDay = mapWorkDay(item.id, item.data())
          return monthMatches(workDay.date, period) ? acc + workDay.dailyValue : acc
        }, 0)
        setLaborTotal(total)
      },
      (error) => console.error(error),
    )

    return () => {
      unsubPayments()
      unsubPurchases()
      unsubWorkDays()
    }
  }, [period])

  return {
    paymentsTotal,
    purchasesTotal,
    laborTotal,
    monthProfit: paymentsTotal - purchasesTotal - laborTotal,
  }
}

function monthMatches(date: Date, period: string): boolean {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}` === period
}
