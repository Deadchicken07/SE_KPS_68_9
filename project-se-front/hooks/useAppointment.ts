'use client'

import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type AppointmentStatus = 'pending' | 'confirmed' | 'completed'

export type AppointmentItem = {
  id: number
  consultantName: string
  appointmentDate: string | null
  timeSelect: string | null
  contact: string
  status: AppointmentStatus
  avatarLabel: string
  avatarUrl: string | null
  appointmentType: 'online' | 'onsite' | null
  paymentStatus: string | null
  meetLink: string | null
}

type AppointmentScheduleResponse = {
  upcoming: AppointmentItem[]
  past: AppointmentItem[]
}

const EMPTY_SCHEDULE: AppointmentScheduleResponse = {
  upcoming: [],
  past: [],
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export const useAppointment = (selectedDate: string | null) => {
  const router = useRouter()
  const { me, loading: authLoading } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [schedule, setSchedule] =
    useState<AppointmentScheduleResponse>(EMPTY_SCHEDULE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!me?.sub) {
      router.replace('/login')
      return
    }

    setHasAccess(true)
  }, [authLoading, me?.sub, router])

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get<AppointmentScheduleResponse>(
        `${API_URL}/appointments/me`,
        {
          withCredentials: true,
        },
      )

      setSchedule({
        upcoming: response.data.upcoming ?? [],
        past: response.data.past ?? [],
      })

      return { ok: true as const }
    } catch (error) {
      const message = getErrorMessage(error, 'โหลดข้อมูลการนัดหมายไม่สำเร็จ')
      setError(message)
      setSchedule(EMPTY_SCHEDULE)
      return {
        ok: false as const,
        message,
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasAccess) {
      return
    }

    void fetchAppointments()
  }, [hasAccess])

  const filteredAppointments = useMemo(() => {
    const allAppointments = [...schedule.upcoming, ...schedule.past]

    return allAppointments.filter((appointment) => {
      if (!selectedDate) {
        return true
      }

      return appointment.appointmentDate === selectedDate
    })
  }, [schedule.past, schedule.upcoming, selectedDate])

  return {
    error,
    filteredAppointments,
    hasAccess,
    loading,
    refetchAppointments: fetchAppointments,
  }
}
