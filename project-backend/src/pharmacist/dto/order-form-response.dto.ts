export class OrderFormConsultationItemDto {
  medicationId: number | null;
  medicationName: string;
  quantity: number;
  unitPrice: number | null;
  comment: string | null;
}

export class OrderFormConsultationDto {
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
  latestPaymentStatus: string | null;
  latestReceiptStatus: string | null;
  receiptCount: number;
  suggestedItems: OrderFormConsultationItemDto[];
}

export class OrderFormResponseDto {
  consultations: OrderFormConsultationDto[];
}
