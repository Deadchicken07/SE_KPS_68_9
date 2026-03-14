export interface Medication {
  id: number;
  name: string;
  retail: number | null;
  price: number | null;
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
