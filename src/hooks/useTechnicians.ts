import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { TECHNICIANS_COLLECTION } from '../lib/constants'
import { db } from '../lib/firebase'
import { mapTechnician } from '../lib/mappers'
import type { Technician, TechnicianFormData } from '../types/technician'

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      setTechnicians([])
      setLoading(false)
      return
    }

    const q = query(collection(db, TECHNICIANS_COLLECTION), orderBy('name', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTechnicians(snapshot.docs.map((item) => mapTechnician(item.id, item.data())))
        setLoading(false)
      },
      (error) => {
        console.error(error)
        toast.error('No se pudieron cargar los técnicos')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const createTechnician = useCallback(async (data: TechnicianFormData) => {
    if (!db) throw new Error('Firebase no está configurado')
    await addDoc(collection(db, TECHNICIANS_COLLECTION), {
      name: data.name.trim(),
      dailyRate: data.dailyRate,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [])

  const updateTechnician = useCallback(async (id: string, data: TechnicianFormData) => {
    if (!db) throw new Error('Firebase no está configurado')
    await updateDoc(doc(db, TECHNICIANS_COLLECTION, id), {
      name: data.name.trim(),
      dailyRate: data.dailyRate,
      updatedAt: serverTimestamp(),
    })
  }, [])

  const setTechnicianActive = useCallback(async (id: string, active: boolean) => {
    if (!db) throw new Error('Firebase no está configurado')
    await updateDoc(doc(db, TECHNICIANS_COLLECTION, id), {
      active,
      updatedAt: serverTimestamp(),
    })
  }, [])

  return {
    technicians,
    loading,
    createTechnician,
    updateTechnician,
    setTechnicianActive,
  }
}
