export class OrderResponseItemDto {
  receiptDetailId: number;
  medicationId: number | null;
  itemName: string;
  itemType: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
}

export class OrderResponseDto {
  receiptId: number;
  consultationId: number | null;
  patientId: number | null;
  patientName: string;
  tracking: string | null;
  status: string | null;
  total: number | null;
  createdAt: string | null;
  items: OrderResponseItemDto[];
}
