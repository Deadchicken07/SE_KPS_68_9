export class PatientConsultationRecordDto {
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

export class PatientHistoryResponseDto {
  patientId: number;
  patientName: string;
  phone: string | null;
  medicalCondition: string | null;
  allergyDrug: string | null;
  latestConsultedAt: string | null;
  latestNote: string | null;
  recordCount: number;
  records: PatientConsultationRecordDto[];
}
