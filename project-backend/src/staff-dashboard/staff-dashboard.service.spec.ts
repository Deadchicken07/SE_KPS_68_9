import { PrismaService } from '../prisma/prisma.service';
import { StaffDashboardService } from './staff-dashboard.service';

describe('StaffDashboardService', () => {
  let service: StaffDashboardService;

  beforeEach(() => {
    service = new StaffDashboardService({} as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('parses flexible time formats into normalized ranges', () => {
    const parse = (value: string) =>
      (service as any).tryParseTimeRange(value) as
        | {
            startMinutes: number;
            endMinutes: number;
            startText: string;
            endText: string;
          }
        | null;

    expect(parse('9:00 - 10:30')).toEqual({
      startMinutes: 540,
      endMinutes: 630,
      startText: '09:00',
      endText: '10:30',
    });
    expect(parse('09.00–10.30')).toEqual({
      startMinutes: 540,
      endMinutes: 630,
      startText: '09:00',
      endText: '10:30',
    });
    expect(parse('09:00 ถึง 10:30')).toEqual({
      startMinutes: 540,
      endMinutes: 630,
      startText: '09:00',
      endText: '10:30',
    });
  });

  it('rejects invalid time ranges', () => {
    const parse = (value: string) => (service as any).tryParseTimeRange(value);

    expect(parse('25:00 - 26:00')).toBeNull();
    expect(parse('10:30 - 09:30')).toBeNull();
    expect(parse('not-a-time')).toBeNull();
  });

  it('uses Asia/Bangkok when defaulting month and selected date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-31T17:30:00.000Z'));

    expect((service as any).normalizeMonth(undefined)).toBe('2026-04');
    expect(
      (service as any).resolveSelectedDate(undefined, '2026-04', [
        '2026-04-01',
        '2026-04-02',
      ]),
    ).toBe('2026-04-01');
  });

  it('uses Asia/Bangkok when checking whether an appointment is in the past', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-15T17:30:00.000Z'));

    expect(
      (service as any).isPastAppointment('2026-03-15', {
        startMinutes: 540,
        endMinutes: 600,
        startText: '09:00',
        endText: '10:00',
      }),
    ).toBe(true);

    expect(
      (service as any).isPastAppointment('2026-03-16', {
        startMinutes: 15,
        endMinutes: 20,
        startText: '00:15',
        endText: '00:20',
      }),
    ).toBe(true);

    expect(
      (service as any).isPastAppointment('2026-03-16', {
        startMinutes: 45,
        endMinutes: 75,
        startText: '00:45',
        endText: '01:15',
      }),
    ).toBe(false);
  });
});
