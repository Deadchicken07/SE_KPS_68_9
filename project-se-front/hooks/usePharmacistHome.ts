'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/components/providers/AuthProvider'
import type { PharmacistHomeOrdersResponse } from '@/types/pharmacist.types'
import {
  PHARMACIST_HOME_STATUS_RANK,
  formatPharmacistHomeDateTime,
  getPharmacistHomeErrorMessage,
  isOutstandingPharmacistHomeStatus,
  pharmacistHomeDisplayStatus,
} from '@/utils/pharmacistHome'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export const usePharmacistHome = () => {
  const router = useRouter()
  const { me, loading: authLoading } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [data, setData] = useState<PharmacistHomeOrdersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

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
      router.replace('/staff/admin/admin-home')
      return
    }

    if (roleId !== 5) {
      router.replace('/user')
      return
    }

    setHasAccess(true)
  }, [authLoading, me?.role_id, router])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get<PharmacistHomeOrdersResponse>(
        `${API_URL}/phama-home/orders`,
        {
          withCredentials: true,
        },
      )
      setData(response.data)
      return { ok: true as const }
    } catch (error) {
      const message = getPharmacistHomeErrorMessage(
        error,
        'โหลดข้อมูลคิวจ่ายยาไม่สำเร็จ',
      )
      setError(message)
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

    void fetchOrders()
  }, [hasAccess])

  const consultations = data?.consultations ?? []
  const generatedAtLabel = formatPharmacistHomeDateTime(data?.generatedAt)

  const outstandingConsultations = useMemo(
    () =>
      consultations.filter((item) =>
        isOutstandingPharmacistHomeStatus(pharmacistHomeDisplayStatus(item)),
      ),
    [consultations],
  )

  const queueCount = outstandingConsultations.length

  const onlineDeliveryCount = useMemo(
    () =>
      outstandingConsultations.filter(
        (item) => pharmacistHomeDisplayStatus(item) === 'pending_delivery',
      ).length,
    [outstandingConsultations],
  )

  const clinicPickupCount = useMemo(
    () =>
      outstandingConsultations.filter(
        (item) => pharmacistHomeDisplayStatus(item) === 'pending_pickup',
      ).length,
    [outstandingConsultations],
  )

  const filteredConsultations = useMemo(() => {
    return [...outstandingConsultations].sort((left, right) => {
      const leftStatus = pharmacistHomeDisplayStatus(left)
      const rightStatus = pharmacistHomeDisplayStatus(right)

      return (
        PHARMACIST_HOME_STATUS_RANK[leftStatus] -
          PHARMACIST_HOME_STATUS_RANK[rightStatus] ||
        new Date(right.created_at ?? 0).getTime() -
          new Date(left.created_at ?? 0).getTime()
      )
    })
  }, [outstandingConsultations])

  useEffect(() => {
    if (!filteredConsultations.length) {
      setSelectedId(null)
      setIsDetailModalOpen(false)
      return
    }

    if (!filteredConsultations.some((item) => item.id === selectedId)) {
      setSelectedId(filteredConsultations[0].id)
    }
  }, [filteredConsultations, selectedId])

  const selected = useMemo(
    () =>
      filteredConsultations.find((item) => item.id === selectedId) ??
      consultations.find((item) => item.id === selectedId) ??
      null,
    [consultations, filteredConsultations, selectedId],
  )

  useEffect(() => {
    if (!isDetailModalOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDetailModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDetailModalOpen])

  const openConsultation = (consultationId: number) => {
    setSelectedId(consultationId)
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
  }

  const openOrderPage = (consultationId: number) => {
    setIsDetailModalOpen(false)
    router.push(`/staff/pharmacist/order?consultationId=${consultationId}`)
  }

  return {
    currentUserId: me?.sub ?? null,
    data,
    error,
    filteredConsultations,
    generatedAtLabel,
    hasAccess,
    isDetailModalOpen,
    clinicPickupCount,
    loading,
    onlineDeliveryCount,
    openConsultation,
    openOrderPage,
    queueCount,
    selected,
    closeDetailModal,
  }
}
