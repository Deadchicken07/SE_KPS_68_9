export class DeliveryHistoryItemDto {
  receiptDetailId: number;
  itemName: string;
  itemType: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  medicineId: number | null;
  medicineName: string | null;
}

export class DeliveryHistoryResponseDto {
  receiptId: number;
  consultationId: number | null;
  patientId: number | null;
  patientName: string;
  pharmacistName: string;
  tracking: string | null;
  status: string | null;
  total: number | null;
  createdAt: string | null;
  items: DeliveryHistoryItemDto[];
}
