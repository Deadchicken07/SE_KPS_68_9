class CreatePrescriptionItemDto {
  medication_id: number;
  quantity : number
  comment : string ;
}
export class CreateConsultationDto {
  user_id: number;
  staff_id: number;
  note: string;
  is_online: boolean;
  appointment_id?: number;
  prescription_item? : CreatePrescriptionItemDto[];
}
