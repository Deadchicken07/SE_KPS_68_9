export interface ConsultationPrescriptionItem {
  id: number;
  medication_id: number | null;
  quantity: number | null;
  comment: string | null;
  medications: { id: number; name: string } | null;
}

export interface Consultation {
  id: number;
  user_id: number;
  staff_id: number | null;
  pharmacist_id: number | null;
  note: string | null;
  created_at: string | null;
  prescription_items?: ConsultationPrescriptionItem[];
}

export interface ConsultationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PrescriptionItem {
  medication_id: number;
  quantity: number;
  comment?: string;
}

export interface CreateConsultation {
  user_id: number;
  staff_id: number;
  note: string;
  is_online: boolean;
  appointment_id?: number | null;
  prescription_item?: PrescriptionItem[];
}

export interface PrescriptionFormItem {
  id: number;
  medication_id: number | null;
  quantity: number | null;
  comment: string;
}