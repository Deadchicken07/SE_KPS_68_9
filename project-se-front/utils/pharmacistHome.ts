import axios from 'axios'
import type {
  PharmacistHomeConsultation,
  PharmacistHomeDisplayStatus,
  PharmacistHomePerson,
  PharmacistHomePrescriptionItem,
  PharmacistHomeReceipt,
} from '@/types/pharmacist.types'

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
})

const dateTimeFormatter = new Intl.DateTimeFormat('th-TH', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const PHARMACIST_HOME_STATUS_META: Record<
  PharmacistHomeDisplayStatus,
  { label: string; tone: string }
> = {
  no_receipt: {
    label: 'ยังไม่มีใบเสร็จ',
    tone: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  pending_pickup: {
    label: 'รอรับที่คลินิก',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  pending_delivery: {
    label: 'รอจัดส่ง',
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  delivered: {
    label: 'จัดส่งแล้ว',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  picked_up: {
    label: 'รับยาแล้ว',
    tone: 'border-teal-200 bg-teal-50 text-teal-700',
  },
  cancelled: {
    label: 'ยกเลิก',
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

export const PHARMACIST_HOME_STATUS_RANK: Record<
  PharmacistHomeDisplayStatus,
  number
> = {
  no_receipt: 0,
  pending_pickup: 1,
  pending_delivery: 2,
  delivered: 3,
  picked_up: 4,
  cancelled: 5,
}

export function formatPharmacistHomeDateTime(value?: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : '-'
}

export function formatPharmacistHomeMoney(value: number | null) {
  return value === null ? '-' : currencyFormatter.format(value)
}

export function pharmacistHomeFullName(person: PharmacistHomePerson | null) {
  return person ? `${person.name} ${person.sur_name}`.trim() || '-' : '-'
}

export function pharmacistHomeTextValue(
  value: string | number | null | undefined,
) {
  return value === null || value === undefined || value === ''
    ? '-'
    : String(value)
}

export function pharmacistHomeMedicineTotal(
  consultation: PharmacistHomeConsultation,
) {
  return consultation.prescription_items.reduce((sum, item) => {
    return sum + (item.medication?.retail ?? 0) * (item.quantity ?? 0)
  }, 0)
}

export function pharmacistHomeMedicationName(
  item: PharmacistHomePrescriptionItem,
) {
  return item.medication?.name ?? `ยา #${item.medication_id}`
}

export function pharmacistHomeMedicationComment(value?: string | null) {
  const trimmed = value?.trim()

  if (!trimmed || trimmed.includes('???') || trimmed.includes('\uFFFD')) {
    return 'xxx'
  }

  return trimmed
}

export function latestPharmacistHomeReceipt(
  consultation: PharmacistHomeConsultation,
): PharmacistHomeReceipt | null {
  return consultation.receipts[0] ?? null
}

export function pharmacistHomeLatestPaymentStatus(
  consultation: PharmacistHomeConsultation,
) {
  return latestPharmacistHomeReceipt(consultation)?.payment_status ?? null
}

export function pharmacistHomeDisplayStatus(
  consultation: PharmacistHomeConsultation,
): PharmacistHomeDisplayStatus {
  const value = latestPharmacistHomeReceipt(consultation)?.status ?? null

  switch (value) {
    case 'pending_delivery':
    case 'delivered':
    case 'pending_pickup':
    case 'picked_up':
    case 'cancelled':
      return value
    default:
      return 'no_receipt'
  }
}

export function isOutstandingPharmacistHomeStatus(
  status: PharmacistHomeDisplayStatus,
) {
  return status === 'pending_delivery' || status === 'pending_pickup'
}

export function isPaidOutstandingPharmacistHomeConsultation(
  consultation: PharmacistHomeConsultation,
) {
  return (
    pharmacistHomeLatestPaymentStatus(consultation) === 'Paid' &&
    isOutstandingPharmacistHomeStatus(pharmacistHomeDisplayStatus(consultation))
  )
}

export function pharmacistHomeDeliveryModeLabel(
  status: PharmacistHomeDisplayStatus,
) {
  if (status === 'pending_delivery' || status === 'delivered') {
    return 'จัดส่ง'
  }

  if (status === 'pending_pickup' || status === 'picked_up') {
    return 'รับที่คลินิก'
  }

  return 'รอยืนยัน'
}

export function pharmacistHomeQueueOwnerLabel(
  consultation: PharmacistHomeConsultation,
  currentUserId?: number | null,
) {
  if (!consultation.pharmacist_id || !consultation.pharmacist) {
    return 'ยังไม่มีผู้รับคิว'
  }

  if (consultation.pharmacist_id === currentUserId) {
    return 'คุณรับคิวนี้'
  }

  return `รับคิวโดย ${pharmacistHomeFullName(consultation.pharmacist)}`
}

function normalizePharmacistHomeErrorMessage(message: unknown): string {
  if (Array.isArray(message)) {
    return message
      .map((item) => normalizePharmacistHomeErrorMessage(item))
      .filter(Boolean)
      .join(', ')
  }

  if (typeof message === 'string') {
    return message
  }

  if (message && typeof message === 'object' && 'message' in message) {
    return normalizePharmacistHomeErrorMessage(
      (message as { message?: unknown }).message,
    )
  }

  return ''
}

export function getPharmacistHomeErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (axios.isAxiosError(error)) {
    return (
      normalizePharmacistHomeErrorMessage(error.response?.data?.message) ||
      fallback
    )
  }

  return fallback
}
