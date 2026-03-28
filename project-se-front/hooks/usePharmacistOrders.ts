'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import type {
  CreateOrderPayload,
  OrderFormConsultation,
  OrderFormData,
  PharmacistOrder,
} from '@/types/pharmacist.types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

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

  if (message && typeof message === 'object' && 'message' in message) {
    return normalizeErrorMessage((message as { message?: unknown }).message)
  }

  return ''
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return normalizeErrorMessage(error.response?.data?.message) || fallback
  }

  return fallback
}

export const usePharmacistOrders = () => {
  const [consultations, setConsultations] = useState<OrderFormConsultation[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const consultationOptions = useMemo(
    () =>
      consultations.map((consultation) => ({
        label: `#${consultation.consultationId} ${consultation.patientName}`,
        value: consultation.consultationId,
      })),
    [consultations],
  )

  useEffect(() => {
    void fetchOrderForm()
  }, [])

  const fetchOrderForm = async () => {
    setLoading(true)

    try {
      const response = await axios.get<OrderFormData>(`${API_URL}/pharmacist/order-form`)
      setConsultations(response.data.consultations)
      return { ok: true as const }
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, 'โหลดรายการที่ยังต้องจัดส่งไม่สำเร็จ'),
      }
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (payload: CreateOrderPayload) => {
    setSaving(true)

    try {
      const response = await axios.post<PharmacistOrder>(`${API_URL}/pharmacist/orders`, payload)
      await fetchOrderForm()
      return {
        ok: true as const,
        message: 'อัปเดตสถานะการส่งยาเรียบร้อยแล้ว',
        order: response.data,
      }
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, 'อัปเดตสถานะการส่งยาไม่สำเร็จ'),
      }
    } finally {
      setSaving(false)
    }
  }

  return {
    consultations,
    loading,
    saving,
    consultationOptions,
    fetchOrderForm,
    createOrder,
  }
}
