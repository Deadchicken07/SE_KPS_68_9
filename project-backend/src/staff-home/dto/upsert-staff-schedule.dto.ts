export class UpsertStaffScheduleDto {
  staffId!: number;
  workDate!: string;
  status!: 'working' | 'leave';
  note?: string | null;
}
