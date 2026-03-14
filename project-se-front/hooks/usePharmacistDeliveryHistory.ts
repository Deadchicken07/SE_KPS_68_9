'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import type { DeliveryHistory } from '@/types/pharmacist.types'

const API_URL = 'http://localhost:4000'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback
  }

  return fallback
}

export const usePharmacistDeliveryHistory = () => {
  const [deliveries, setDeliveries] = useState<DeliveryHistory[]>([])
  const [deliveriesLoading, setDeliveriesLoading] = useState(false)
  const [deliverySearch, setDeliverySearch] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState('all')

  const deliverySummary = useMemo(() => {
    const totalValue = deliveries.reduce((sum, item) => sum + (item.total ?? 0), 0)
    return {
      totalRows: deliveries.length,
      totalValue,
    }
  }, [deliveries])

  useEffect(() => {
    void fetchDeliveries()
  }, [])

  const fetchDeliveries = async (
    search = deliverySearch,
    status = deliveryStatus,
  ) => {
    setDeliveriesLoading(true)

    try {
      const response = await axios.get<DeliveryHistory[]>(
        `${API_URL}/pharmacist/delivery-history`,
        {
          params: {
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(status !== 'all' ? { status } : {}),
          },
        },
      )
      setDeliveries(response.data)
      return { ok: true as const }
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, 'โหลดประวัติการส่งยาไม่สำเร็จ'),
      }
    } finally {
      setDeliveriesLoading(false)
    }
  }

  return {
    deliveries,
    deliveriesLoading,
    deliverySearch,
    setDeliverySearch,
    deliveryStatus,
    setDeliveryStatus,
    deliverySummary,
    fetchDeliveries,
  }
}
