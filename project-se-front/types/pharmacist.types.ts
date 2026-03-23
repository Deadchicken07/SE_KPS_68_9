import type { ReceiptStatus } from "./receipt-status.types";

export interface Medication {
  id: number;
  name: string;
  retail: number | null;
  price: number | null;
}

export interface OrderFormConsultationItem {
  medicationId: number | null;
  medicationName: string;
  quantity: number;
  unitPrice: number | null;
  comment: string | null;
}

export interface OrderFormConsultation {
  consultationId: number;
  patientId: number | null;
  patientName: string;
  patientPhone: string | null;
  patientAddress: string | null;
  medicalCondition: string | null;
  allergyDrug: string | null;
  pharmacistId: number | null;
  pharmacistName: string;
  note: string | null;
  createdAt: string | null;
  latestReceiptStatus: string | null;
  receiptCount: number;
  suggestedItems: OrderFormConsultationItem[];
}

export interface OrderFormData {
  consultations: OrderFormConsultation[];
}

export interface CreateOrderPayload {
  consultationId: number;
  tracking?: string | null;
  status?: string | null;
}

export interface PharmacistOrder {
  receiptId: number;
  consultationId: number | null;
  patientId: number | null;
  patientName: string;
  tracking: string | null;
  status: string | null;
  total: number | null;
  createdAt: string | null;
  items: {
    receiptDetailId: number;
    medicationId: number | null;
    itemName: string;
    itemType: string | null;
    quantity: number;
    unitPrice: number | null;
    totalPrice: number | null;
  }[];
}

export interface DeliveryHistoryItem {
  receiptDetailId: number;
  itemName: string;
  itemType: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  medicineId: number | null;
  medicineName: string | null;
}

export interface DeliveryHistory {
  receiptId: number;
  consultationId: number | null;
  patientId: number | null;
  patientName: string;
  pharmacistName: string;
  tracking: string | null;
  status: string | null;
  total: number | null;
  createdAt: string | null;
  items: DeliveryHistoryItem[];
}

export type PharmacistHomeDisplayStatus = ReceiptStatus | "no_receipt";

export interface PharmacistHomePerson {
  user_id: number;
  name: string;
  sur_name: string;
  email?: string | null;
  phone?: string | null;
  allergy_drug?: string | null;
  info?: string | null;
  role_name?: string | null;
}

export interface PharmacistHomeMedication {
  id: number;
  name: string;
  price: number | null;
  retail: number | null;
}

export interface PharmacistHomePrescriptionItem {
  id: number;
  consultation_id: number | null;
  medication_id: number | null;
  comment: string | null;
  quantity: number | null;
  medication: PharmacistHomeMedication | null;
}

export interface PharmacistHomeReceipt {
  id: number;
  consultation_id: number | null;
  user_id: number | null;
  created_at: string | null;
  slip_file: string | null;
  total: number | null;
  tracking: string | null;
  status: ReceiptStatus | null;
}

export interface PharmacistHomeConsultation {
  id: number;
  user_id: number | null;
  staff_id: number | null;
  pharmacist_id: number | null;
  note: string | null;
  created_at: string | null;
  patient: PharmacistHomePerson | null;
  staff: PharmacistHomePerson | null;
  pharmacist: PharmacistHomePerson | null;
  prescription_items: PharmacistHomePrescriptionItem[];
  receipts: PharmacistHomeReceipt[];
}

export interface PharmacistHomeOrdersResponse {
  generatedAt: string;
  totalConsultations: number;
  consultations: PharmacistHomeConsultation[];
}

export interface PatientConsultationRecord {
  consultationId: number;
  note: string | null;
  createdAt: string | null;
  pharmacistName: string;
  medicines: {
    id: number;
    name: string;
    quantity: number;
    comment: string | null;
  }[];
  receipts: {
    receiptId: number;
    tracking: string | null;
    status: string | null;
    total: number | null;
    createdAt: string | null;
  }[];
}

export interface PatientHistory {
  patientId: number;
  patientName: string;
  phone: string | null;
  medicalCondition: string | null;
  allergyDrug: string | null;
  latestConsultedAt: string | null;
  latestNote: string | null;
  recordCount: number;
  records: PatientConsultationRecord[];
}
