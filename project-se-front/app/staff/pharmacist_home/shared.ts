export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const RECEIPT_STATUS_OPTIONS = [
  "pending_delivery",
  "delivered",
  "pending_pickup",
  "picked_up",
  "cancelled",
] as const;

export type ReceiptStatusValue = (typeof RECEIPT_STATUS_OPTIONS)[number];
export type DisplayStatus = ReceiptStatusValue | "no_receipt";
export type StatusFilter = "all" | "to_dispense" | DisplayStatus;

export type PersonRecord = {
  user_id: number;
  name: string;
  sur_name: string;
  email?: string | null;
  phone?: string | null;
  allergy_drug?: string | null;
  info?: string | null;
  role_name?: string | null;
};

export type MedicationRecord = {
  id: number;
  name: string;
  price: number | null;
  retail: number | null;
};

export type PrescriptionItemRecord = {
  id: number;
  consultation_id: number | null;
  medication_id: number | null;
  comment: string | null;
  quantity: number | null;
  medication: MedicationRecord | null;
};

export type ReceiptRecord = {
  id: number;
  consultation_id: number | null;
  user_id: number | null;
  created_at: string | null;
  slip_file: string | null;
  total: number | null;
  tracking: string | null;
  status: string | null;
};

export type ConsultationRecord = {
  id: number;
  user_id: number | null;
  staff_id: number | null;
  pharmacist_id: number | null;
  note: string | null;
  created_at: string | null;
  patient: PersonRecord | null;
  staff: PersonRecord | null;
  pharmacist: PersonRecord | null;
  prescription_items: PrescriptionItemRecord[];
  receipts: ReceiptRecord[];
};

export type OrdersResponse = {
  generatedAt: string;
  totalConsultations: number;
  consultations: ConsultationRecord[];
};

export const STATUS_META: Record<
  DisplayStatus,
  { label: string; tone: string; rank: number }
> = {
  no_receipt: {
    label: "ยังไม่มี receipt",
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

export const FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "to_dispense", label: "คิวที่ต้องจ่ายยา" },
  { value: "no_receipt", label: "ยังไม่มี receipt" },
  { value: "pending_delivery", label: "รอจัดส่ง" },
];

export const PHARMACIST_STATUS_OPTIONS = [
  "pending_delivery",
  "delivered",
] as const;

export const getToken = () =>
  typeof window === "undefined"
    ? null
    : window.localStorage.getItem("access_token");

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export const formatMoney = (value: number | null) =>
  value === null
    ? "-"
    : new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 2,
      }).format(value);

export const fullName = (person: PersonRecord | null) =>
  person ? `${person.name} ${person.sur_name}`.trim() || "-" : "-";

export const textValue = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

export function getStatus(value?: string | null): DisplayStatus {
  if (value === "pending_pickup") {
    return "pending_delivery";
  }

  if (value === "picked_up") {
    return "delivered";
  }

  return RECEIPT_STATUS_OPTIONS.includes(value as ReceiptStatusValue)
    ? (value as ReceiptStatusValue)
    : "no_receipt";
}

export function latestReceipt(consultation: ConsultationRecord) {
  return consultation.receipts[0] ?? null;
}

export function displayStatus(consultation: ConsultationRecord) {
  return getStatus(latestReceipt(consultation)?.status);
}

export function isOutstanding(status: DisplayStatus) {
  return status === "no_receipt" || status === "pending_delivery";
}

export function consultationTotal(consultation: ConsultationRecord) {
  const receipt = latestReceipt(consultation);

  if (receipt?.total !== null && receipt?.total !== undefined) {
    return receipt.total;
  }

  return consultation.prescription_items.reduce((sum, item) => {
    return sum + (item.medication?.retail ?? 0) * (item.quantity ?? 0);
  }, 0);
}

export function medicationName(item: PrescriptionItemRecord) {
  return item.medication?.name ?? `medication #${item.medication_id}`;
}

export function medicationSummary(consultation: ConsultationRecord) {
  const names = consultation.prescription_items.map(medicationName);

  if (!names.length) {
    return "-";
  }

  if (names.length <= 2) {
    return names.join(", ");
  }

  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

export function medicationComment(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "xxx";
  }

  if (trimmed.includes("???") || trimmed.includes("�")) {
    return "xxx";
  }

  return trimmed;
}

export async function fetchPhamaOrders(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/phama-home/orders`, {
    credentials: "include",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof payload?.message === "string"
        ? payload.message
        : "โหลดข้อมูลคิวจ่ายยาไม่สำเร็จ",
    );
  }

  return payload as OrdersResponse;
}
