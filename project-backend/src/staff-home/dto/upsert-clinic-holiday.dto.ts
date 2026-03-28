export class UpsertClinicHolidayDto {
  month!: string;
  weekday!: number;
  scope!: 'all' | 'individual';
  staffId?: number | null;
  note?: string | null;
}
