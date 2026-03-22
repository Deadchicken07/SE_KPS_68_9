export interface PrescriptionItem {
  medication_id: number;
  quantity: number;
  comment?: string;
}

export interface CreateConsultation {
  user_id: number;
  staff_id: number;
  note: string;
  prescription_item?: PrescriptionItem[];
}

export interface PrescriptionFormItem {
  id: number;
  medication_id: number | null;
  quantity: number | null;
  comment: string;
}