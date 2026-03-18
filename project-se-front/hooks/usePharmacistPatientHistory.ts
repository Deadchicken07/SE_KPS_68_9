'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import type { PatientHistory } from '@/types/pharmacist.types'

const API_URL = 'http://localhost:4000'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback
  }

  return fallback
}

export const usePharmacistPatientHistory = () => {
  const [patients, setPatients] = useState<PatientHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.patientId === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  )

  useEffect(() => {
    void fetchPatients()
  }, [])

  useEffect(() => {
    if (patients.length > 0 && selectedPatientId === null) {
      setSelectedPatientId(patients[0].patientId)
    }
  }, [patients, selectedPatientId])

  const fetchPatients = async (nextSearch = search) => {
    setLoading(true)

    try {
      const response = await axios.get<PatientHistory[]>(
        `${API_URL}/pharmacist/patient-history`,
        {
          params: nextSearch.trim() ? { search: nextSearch.trim() } : undefined,
        },
      )

      setPatients(response.data)
      setSelectedPatientId((currentId) => {
        if (response.data.length === 0) {
          return null
        }

        if (currentId && response.data.some((patient) => patient.patientId === currentId)) {
          return currentId
        }

        return response.data[0].patientId
      })

      return { ok: true as const }
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, 'โหลดประวัติผู้ป่วยไม่สำเร็จ'),
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    patients,
    loading,
    search,
    setSearch,
    selectedPatient,
    selectedPatientId,
    setSelectedPatientId,
    fetchPatients,
  }
}
