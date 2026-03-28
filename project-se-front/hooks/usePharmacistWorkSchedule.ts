'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import type {
  ClinicScheduleResponse,
  StaffScheduleFormState,
} from '@/types/staffAdminHome.types'
import {
  createStaffScheduleFormState,
  getCurrentDateKey,
  getCurrentMonthKey,
  parseStaffAdminHomeErrorMessage,
} from '@/utils/staffAdminHome'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

function getFirstDateOfMonth(monthKey: string) {
  return `${monthKey}-01`
}

type PharmacistEditableStatus = Extract<
  StaffScheduleFormState['status'],
  'working' | 'leave'
>

export const usePharmacistWorkSchedule = () => {
  const router = useRouter()
  const { me, loading: authLoading } = useAuth()
  const todayDateKey = getCurrentDateKey()
  const currentMonthKey = getCurrentMonthKey()
  const [hasAccess, setHasAccess] = useState(false)
  const [month, setMonth] = useState(currentMonthKey)
  const [selectedDate, setSelectedDate] = useState(todayDateKey)
  const [data, setData] = useState<ClinicScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [form, setForm] = useState<StaffScheduleFormState>(() =>
    createStaffScheduleFormState(todayDateKey),
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (authLoading) {
      return
    }

    const roleId = me?.role_id ?? null

    if (!roleId) {
      router.replace('/login')
      return
    }

    if (roleId === 1) {
      router.replace('/staff/admin-home')
      return
    }

    if (roleId !== 5) {
      router.replace('/user')
      return
    }

    setHasAccess(true)
  }, [authLoading, me?.role_id, router])

  useEffect(() => {
    if (!hasAccess || !me?.sub) {
      return
    }

    const staffId = me.sub
    let ignore = false

    async function loadDashboard() {
      setLoading(true)
      setError(null)

      const query = new URLSearchParams({
        month,
        date: selectedDate,
        staffId: String(staffId),
      })

      try {
        const response = await fetch(
          `${API_URL}/phama-home/clinic-schedule?${query.toString()}`,
          {
            credentials: 'include',
          },
        )

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(parseStaffAdminHomeErrorMessage(payload))
        }

        if (!ignore) {
          setData(payload as ClinicScheduleResponse)
        }
      } catch (caught) {
        if (ignore) {
          return
        }

        setError(
          caught instanceof Error
            ? caught.message
            : 'โหลดตารางวันทำงานไม่สำเร็จ',
        )
        setData(null)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      ignore = true
    }
  }, [hasAccess, me?.sub, month, selectedDate, reloadKey])

  const scheduleEntries = data?.scheduleEntries ?? []
  const dailyStats = data?.dailyStats ?? []
  const selectedDateAppointments = data?.selectedDateAppointments ?? []
  const upcomingAppointments = data?.upcomingAppointments ?? []
  const staffOverview = data?.staffOverview ?? []

  const selectedSchedule = useMemo(
    () =>
      scheduleEntries.find((entry) => entry.workDate === selectedDate) ?? null,
    [scheduleEntries, selectedDate],
  )
  const isHolidayLocked = selectedSchedule?.status === 'holiday'

  useEffect(() => {
    if (!me?.sub) {
      return
    }

    const nextForm = {
      ...createStaffScheduleFormState(selectedDate, String(me.sub)),
      status: selectedSchedule?.status === 'leave' ? 'leave' : 'working',
      note: selectedSchedule?.note ?? '',
    } satisfies StaffScheduleFormState

    setForm((current) => {
      if (
        current.staffId === nextForm.staffId &&
        current.workDate === nextForm.workDate &&
        current.status === nextForm.status &&
        current.note === nextForm.note
      ) {
        return current
      }

      return nextForm
    })
  }, [me?.sub, selectedDate, selectedSchedule])

  const selectedDayStats = useMemo(
    () => dailyStats.find((item) => item.date === selectedDate) ?? null,
    [dailyStats, selectedDate],
  )

  const currentUserOverview = useMemo(
    () => staffOverview.find((item) => item.staffId === me?.sub) ?? null,
    [me?.sub, staffOverview],
  )

  const workingDays = useMemo(
    () => scheduleEntries.filter((entry) => entry.status === 'working').length,
    [scheduleEntries],
  )

  const leaveDays = useMemo(
    () => scheduleEntries.filter((entry) => entry.status === 'leave').length,
    [scheduleEntries],
  )

  const orderedScheduleEntries = useMemo(
    () =>
      [...scheduleEntries].sort((left, right) =>
        left.workDate.localeCompare(right.workDate),
      ),
    [scheduleEntries],
  )

  const handleMonthChange = (nextMonth: string) => {
    if (!nextMonth) {
      return
    }

    const normalizedMonth =
      nextMonth < currentMonthKey ? currentMonthKey : nextMonth
    const nextDate =
      normalizedMonth === currentMonthKey
        ? todayDateKey
        : getFirstDateOfMonth(normalizedMonth)

    setMonth(normalizedMonth)
    setSelectedDate(nextDate)
    setFormError(null)
  }

  const handleSelectDate = (dateKey: string) => {
    if (!dateKey || dateKey < todayDateKey) {
      return
    }

    setSelectedDate(dateKey)
    setMonth(dateKey.slice(0, 7))
    setFormError(null)
  }

  const handleStatusChange = (status: PharmacistEditableStatus) => {
    setForm((current) => ({
      ...current,
      status,
    }))
    setFormError(null)
  }

  const handleNoteChange = (note: string) => {
    setForm((current) => ({
      ...current,
      note,
    }))
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!me?.sub) {
      setFormError('กรุณาเข้าสู่ระบบอีกครั้ง')
      return
    }

    if (!form.workDate) {
      setFormError('กรุณาเลือกวันที่')
      return
    }

    if (form.workDate < todayDateKey) {
      setFormError('ไม่สามารถแก้ไขวันย้อนหลังได้')
      return
    }

    if (selectedSchedule?.status === 'holiday') {
      setFormError('วันนี้ถูกกำหนดเป็นวันหยุด')
      return
    }

    if (form.status === 'leave' && !form.note.trim()) {
      setFormError('กรุณากรอกหมายเหตุ')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/phama-home/schedule`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: me.sub,
          workDate: form.workDate,
          status: form.status,
          note: form.note.trim() || null,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(parseStaffAdminHomeErrorMessage(payload))
      }

      setSelectedDate(form.workDate)
      setMonth(form.workDate.slice(0, 7))
      setReloadKey((current) => current + 1)
    } catch (caught) {
      setFormError(
        caught instanceof Error
          ? caught.message
          : 'บันทึกตารางวันทำงานไม่สำเร็จ',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setFormError(null)

    if (!me?.sub) {
      setFormError('กรุณาเข้าสู่ระบบอีกครั้ง')
      return
    }

    if (!selectedSchedule) {
      setFormError('ยังไม่มีสถานะที่บันทึกไว้สำหรับวันนี้')
      return
    }

    if (selectedSchedule.status === 'holiday') {
      setFormError('วันนี้ถูกกำหนดเป็นวันหยุด')
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`${API_URL}/phama-home/schedule`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: me.sub,
          workDate: selectedDate,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(parseStaffAdminHomeErrorMessage(payload))
      }

      setReloadKey((current) => current + 1)
    } catch (caught) {
      setFormError(
        caught instanceof Error
          ? caught.message
          : 'ลบสถานะวันทำงาน/วันลาไม่สำเร็จ',
      )
    } finally {
      setDeleting(false)
    }
  }

  return {
    currentMonthKey,
    currentUserOverview,
    dailyStats,
    deleting,
    error,
    form,
    formError,
    handleDelete,
    handleMonthChange,
    handleNoteChange,
    handleSelectDate,
    handleStatusChange,
    handleSubmit,
    hasAccess,
    isHolidayLocked,
    leaveDays,
    loading,
    month,
    orderedScheduleEntries,
    scheduleEntries,
    selectedDate,
    selectedDateAppointments,
    selectedDayStats,
    selectedSchedule,
    submitting,
    summary: data?.summary ?? null,
    todayDateKey,
    upcomingAppointments,
    workingDays,
  }
}
