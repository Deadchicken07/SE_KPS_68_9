'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import type { Medication } from '@/types/pharmacist.types'

const API_URL = 'http://localhost:4000'

export type MedicationFormValues = {
  name: string
  retail: number | null
  price: number | null
}

const normalizeErrorMessage = (message: unknown): string => {
  if (Array.isArray(message)) {
    return message
      .map((item) => normalizeErrorMessage(item))
      .filter(Boolean)
      .join(', ')
  }

  if (typeof message === 'string') {
    return message
  }

  if (message && typeof message === 'object') {
    const nestedMessage = (message as { message?: unknown }).message
    if (nestedMessage !== undefined) {
      return normalizeErrorMessage(nestedMessage)
    }
  }

  return ''
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = normalizeErrorMessage(error.response?.data?.message)
    return message || fallback
  }

  return fallback
}

export const usePharmacistMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([])
  const [medicationsLoading, setMedicationsLoading] = useState(false)
  const [savingMedication, setSavingMedication] = useState(false)
  const [medicationSearch, setMedicationSearch] = useState('')
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false)

  const medicationSummary = useMemo(
    () => ({
      total: medications.length,
      avgRetail:
        medications.length > 0
          ? medications.reduce((sum, item) => sum + (item.retail ?? 0), 0) /
            medications.length
          : 0,
    }),
    [medications],
  )

  useEffect(() => {
    void fetchMedications()
  }, [])

  const fetchMedications = async (search = medicationSearch) => {
    setMedicationsLoading(true)

    try {
      const response = await axios.get<Medication[]>(`${API_URL}/pharmacist/medications`, {
        params: search.trim() ? { search: search.trim() } : undefined,
        withCredentials: true,
      })
      setMedications(response.data)
      return { ok: true as const }
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, 'โหลดรายการยาไม่สำเร็จ'),
      }
    } finally {
      setMedicationsLoading(false)
    }
  }

  const createMedication = async (values: MedicationFormValues) => {
    setSavingMedication(true)

    try {
      await axios.post(`${API_URL}/pharmacist/medications`, values)
      await fetchMedications()
      closeMedicationModal()
      return { ok: true as const, message: 'เพิ่มรายการยาแล้ว' }
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, 'บันทึกรายการยาไม่สำเร็จ'),
      }
    } finally {
      setSavingMedication(false)
    }
  }

  const updateMedication = async (
    medicationId: number,
    values: MedicationFormValues,
  ) => {
    setSavingMedication(true)

    try {
      await axios.patch(`${API_URL}/pharmacist/medications/${medicationId}`, values)
      await fetchMedications()
      closeMedicationModal()
      return { ok: true as const, message: 'อัปเดตรายการยาแล้ว' }
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, 'บันทึกรายการยาไม่สำเร็จ'),
      }
    } finally {
      setSavingMedication(false)
    }
  }

  const deleteMedication = async (medicationId: number) => {
    try {
      await axios.delete(`${API_URL}/pharmacist/medications/${medicationId}`)
      await fetchMedications()
      return { ok: true as const, message: 'ลบรายการยาแล้ว' }
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, 'ลบรายการยาไม่สำเร็จ'),
      }
    }
  }

  const openCreateMedicationModal = () => {
    setEditingMedication(null)
    setIsMedicationModalOpen(true)
  }

  const openEditMedicationModal = (medication: Medication) => {
    setEditingMedication(medication)
    setIsMedicationModalOpen(true)
  }

  const closeMedicationModal = () => {
    setEditingMedication(null)
    setIsMedicationModalOpen(false)
  }

  return {
    medications,
    medicationsLoading,
    savingMedication,
    medicationSearch,
    setMedicationSearch,
    editingMedication,
    isMedicationModalOpen,
    medicationSummary,
    fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    openCreateMedicationModal,
    openEditMedicationModal,
    closeMedicationModal,
  }
}
