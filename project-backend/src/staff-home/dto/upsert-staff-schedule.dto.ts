export class UpsertStaffScheduleDto {
  staffId!: number;
  workDate!: string;
  status!: 'working' | 'leave' | 'holiday';
  note?: string | null;
}
