export class DeleteClinicHolidayDto {
  month!: string;
  weekday!: number;
  scope!: 'all' | 'individual';
  staffId?: number | null;
}
