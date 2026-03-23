import type {
  PharmacistHomeConsultation,
  PharmacistHomeDisplayStatus,
  PharmacistHomePerson,
  PharmacistHomePrescriptionItem,
  PharmacistHomeReceipt,
} from "@/types/pharmacist.types";
import type { ReceiptStatus } from "@/types/receipt-status.types";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const receiptStatuses: ReceiptStatus[] = [
  "pending_delivery",
  "delivered",
  "pending_pickup",
  "picked_up",
  "cancelled",
];

export const pharmacistHomeStatusMeta: Record<
  PharmacistHomeDisplayStatus,
  { label: string; tone: string; rank: number }
> = {
  no_receipt: {
    label: "ยังไม่มีใบเสร็จ",
    tone: "border-slate-200 bg-slate-100 text-slate-700",
    rank: 0,
  },
  pending_pickup: {
    label: "รอรับที่คลินิก",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    rank: 1,
  },
  pending_delivery: {
    label: "รอจัดส่ง",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
    rank: 2,
  },
  delivered: {
    label: "จัดส่งแล้ว",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rank: 3,
  },
  picked_up: {
    label: "รับยาแล้ว",
    tone: "border-teal-200 bg-teal-50 text-teal-700",
    rank: 4,
  },
  cancelled: {
    label: "ยกเลิก",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
    rank: 5,
  },
};

export function formatPharmacistHomeDateTime(value?: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : "-";
}

export function formatPharmacistHomeMoney(value: number | null) {
  return value === null ? "-" : currencyFormatter.format(value);
}

export function pharmacistHomeFullName(person: PharmacistHomePerson | null) {
  return person ? `${person.name} ${person.sur_name}`.trim() || "-" : "-";
}

export function pharmacistHomeTextValue(
  value: string | number | null | undefined,
) {
  return value === null || value === undefined || value === ""
    ? "-"
    : String(value);
}

export function getPharmacistHomeStatus(
  value?: string | null,
): PharmacistHomeDisplayStatus {
  return receiptStatuses.includes((value ?? "") as ReceiptStatus)
    ? (value as ReceiptStatus)
    : "no_receipt";
}

export function latestPharmacistHomeReceipt(
  consultation: PharmacistHomeConsultation,
): PharmacistHomeReceipt | null {
  return consultation.receipts[0] ?? null;
}

export function pharmacistHomeDisplayStatus(
  consultation: PharmacistHomeConsultation,
): PharmacistHomeDisplayStatus {
  return getPharmacistHomeStatus(
    latestPharmacistHomeReceipt(consultation)?.status,
  );
}

export function isOutstandingPharmacistHomeStatus(
  status: PharmacistHomeDisplayStatus,
) {
  return (
    status === "no_receipt" ||
    status === "pending_delivery" ||
    status === "pending_pickup"
  );
}

export function pharmacistHomeDeliveryModeLabel(
  status: PharmacistHomeDisplayStatus,
) {
  if (status === "pending_delivery" || status === "delivered") {
    return "จัดส่ง";
  }

  if (status === "pending_pickup" || status === "picked_up") {
    return "รับที่คลินิก";
  }

  return "รอยืนยัน";
}

export function pharmacistHomeQueueOwnerLabel(
  consultation: PharmacistHomeConsultation,
  currentUserId?: number | null,
) {
  if (!consultation.pharmacist_id || !consultation.pharmacist) {
    return "ยังไม่มีผู้รับคิว";
  }

  if (consultation.pharmacist_id === currentUserId) {
    return "คุณรับคิวนี้";
  }

  return `รับคิวโดย ${pharmacistHomeFullName(consultation.pharmacist)}`;
}

export function pharmacistHomeConsultationTotal(
  consultation: PharmacistHomeConsultation,
) {
  const receipt = latestPharmacistHomeReceipt(consultation);

  if (receipt?.total !== null && receipt?.total !== undefined) {
    return receipt.total;
  }

  return consultation.prescription_items.reduce((sum, item) => {
    return sum + (item.medication?.retail ?? 0) * (item.quantity ?? 0);
  }, 0);
}

export function pharmacistHomeMedicationName(
  item: PharmacistHomePrescriptionItem,
) {
  return item.medication?.name ?? `ยา #${item.medication_id}`;
}

export function pharmacistHomeMedicationComment(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "xxx";
  }

  if (trimmed.includes("???") || trimmed.includes("\uFFFD")) {
    return "xxx";
  }

  return trimmed;
}
