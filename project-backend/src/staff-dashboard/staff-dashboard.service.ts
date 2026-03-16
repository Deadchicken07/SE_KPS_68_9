import { BadRequestException, Injectable } from '@nestjs/common';
import {
  appointments_type_enum,
  pay_type_enum,
  schedule_status,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StaffDashboardQueryDto } from './dto/staff-dashboard-query.dto';

type DashboardStatus = 'pending' | 'confirmed' | 'completed';
const CLINIC_TIME_ZONE = 'Asia/Bangkok';

type TimeRange = {
  startMinutes: number;
  endMinutes: number;
  startText: string;
  endText: string;
};

type StaffDashboardAppointment = {
  id: number;
  patientId: number | null;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  staffId: number | null;
  staffName: string;
  staffRole: string | null;
  staffRoleLabel: string;
  staffSpecialty: string | null;
  staffAvatarUrl: string | null;
  appointmentDate: string | null;
  timeSelect: string | null;
  startTime: string | null;
  endTime: string | null;
  appointmentType: appointments_type_enum | null;
  appointmentTypeLabel: string;
  paymentStatus: pay_type_enum | null;
  paymentStatusLabel: string;
  displayStatus: DashboardStatus;
  displayStatusLabel: string;
};

type StaffDashboardDay = {
  date: string;
  totalAppointments: number;
  paidAppointments: number;
  pendingPayments: number;
  onlineAppointments: number;
  onsiteAppointments: number;
  uniquePatients: number;
  staffCount: number;
};

type StaffDashboardStaffSummary = {
  staffId: number;
  staffName: string;
  role: string | null;
  roleLabel: string;
  specialty: string | null;
  avatarUrl: string | null;
  totalAppointments: number;
  paidAppointments: number;
  pendingAppointments: number;
  onlineAppointments: number;
  onsiteAppointments: number;
  nextAppointmentDate: string | null;
  nextAppointmentTime: string | null;
  scheduleStatus: schedule_status | 'unassigned';
};

@Injectable()
export class StaffDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getClinicSchedule(query: StaffDashboardQueryDto) {
    const month = this.normalizeMonth(query.month);
    const { monthStart, monthEndExclusive, dayKeys } =
      this.getMonthBounds(month);
    const selectedDate = this.resolveSelectedDate(query.date, month, dayKeys);
    const selectedDateValue = this.toDateOnlyUtc(selectedDate);
    const { weekStart, weekEndExclusive, dayKeys: weekDayKeys } =
      this.getWeekBounds(selectedDate);
    const staffId = this.parseStaffId(query.staffId);

    const appointmentWhere = {
      appointment_date: {
        gte: monthStart,
        lt: monthEndExclusive,
      },
      ...(staffId ? { staff_id: staffId } : {}),
    };

    const [appointments, weekAppointments, staffRows] = await Promise.all([
      this.prisma.appointments.findMany({
        where: appointmentWhere,
        orderBy: [{ appointment_date: 'asc' }, { time_select: 'asc' }],
        include: {
          users_appointments_user_idTousers: {
            select: {
              user_id: true,
              name: true,
              sur_name: true,
              email: true,
              phone: true,
            },
          },
          users_appointments_staff_idTousers: {
            select: {
              user_id: true,
              name: true,
              sur_name: true,
              info: true,
              file_name: true,
              roles: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.appointments.findMany({
        where: {
          appointment_date: {
            gte: weekStart,
            lt: weekEndExclusive,
          },
          ...(staffId ? { staff_id: staffId } : {}),
        },
        orderBy: [{ appointment_date: 'asc' }, { time_select: 'asc' }],
        include: {
          users_appointments_user_idTousers: {
            select: {
              user_id: true,
              name: true,
              sur_name: true,
              email: true,
              phone: true,
            },
          },
          users_appointments_staff_idTousers: {
            select: {
              user_id: true,
              name: true,
              sur_name: true,
              info: true,
              file_name: true,
              roles: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.users.findMany({
        where: staffId
          ? { user_id: staffId }
          : {
              OR: [
                { role_id: { in: [3, 4] } },
                {
                  roles: {
                    name: {
                      in: [
                        'psychiatrist',
                        'psychologist',
                        'จิตแพทย์',
                        'นักจิตวิทยา',
                      ],
                    },
                  },
                },
                {
                  appointments_appointments_staff_idTousers: {
                    some: {
                      appointment_date: {
                        gte: monthStart,
                        lt: monthEndExclusive,
                      },
                    },
                  },
                },
                {
                  schedule: {
                    some: {
                      work_date: {
                        gte: monthStart,
                        lt: monthEndExclusive,
                      },
                    },
                  },
                },
              ],
            },
        orderBy: [{ name: 'asc' }, { sur_name: 'asc' }],
        select: {
          user_id: true,
          name: true,
          sur_name: true,
          info: true,
          file_name: true,
          roles: {
            select: {
              name: true,
            },
          },
          schedule: {
            where: {
              work_date: selectedDateValue,
            },
            select: {
              status: true,
            },
          },
        },
      }),
    ]);

    const mapAppointmentRecord = (record: (typeof appointments)[number]) => {
      const appointmentDate = record.appointment_date
        ? this.dateToIsoDate(record.appointment_date)
        : null;
      const timeRange = this.tryParseTimeRange(record.time_select);
      const isPast = this.isPastAppointment(appointmentDate, timeRange);
      const patient = record.users_appointments_user_idTousers;
      const staff = record.users_appointments_staff_idTousers;

      return {
        id: record.id,
        patientId: record.user_id ?? null,
        patientName: this.buildFullName(patient?.name, patient?.sur_name),
        patientEmail: patient?.email ?? null,
        patientPhone: patient?.phone ?? null,
        staffId: record.staff_id ?? null,
        staffName: this.buildFullName(staff?.name, staff?.sur_name),
        staffRole: staff?.roles?.name ?? null,
        staffRoleLabel: this.toRoleLabel(staff?.roles?.name),
        staffSpecialty: staff?.info ?? null,
        staffAvatarUrl: staff?.file_name ?? null,
        appointmentDate,
        timeSelect: record.time_select ?? null,
        startTime: timeRange?.startText ?? null,
        endTime: timeRange?.endText ?? null,
        appointmentType: record.appointment_type ?? null,
        appointmentTypeLabel: this.toAppointmentTypeLabel(
          record.appointment_type ?? null,
        ),
        paymentStatus: record.status ?? null,
        paymentStatusLabel: this.toPaymentStatusLabel(record.status ?? null),
        displayStatus: this.toDisplayStatus(record.status ?? null, isPast),
        displayStatusLabel: this.toDisplayStatusLabel(
          this.toDisplayStatus(record.status ?? null, isPast),
        ),
      } satisfies StaffDashboardAppointment;
    };

    const appointmentItems = appointments.map(mapAppointmentRecord);
    const weekAppointmentItems = weekAppointments.map(mapAppointmentRecord);
    const dailyStats = this.buildDailyStats(dayKeys, appointmentItems);
    const weekStats = this.buildDailyStats(weekDayKeys, weekAppointmentItems);

    const summary = {
      totalAppointments: appointmentItems.length,
      uniquePatients: new Set(
        appointmentItems
          .map((item) => item.patientId)
          .filter((value): value is number => Number.isInteger(value)),
      ).size,
      activeStaffCount: new Set(
        appointmentItems
          .map((item) => item.staffId)
          .filter((value): value is number => Number.isInteger(value)),
      ).size,
      registeredStaffCount: staffRows.length,
      paidAppointments: appointmentItems.filter(
        (item) => item.paymentStatus === pay_type_enum.Paid,
      ).length,
      pendingPayments: appointmentItems.filter(
        (item) => item.paymentStatus !== pay_type_enum.Paid,
      ).length,
      onlineAppointments: appointmentItems.filter(
        (item) => item.appointmentType === appointments_type_enum.online,
      ).length,
      onsiteAppointments: appointmentItems.filter(
        (item) => item.appointmentType === appointments_type_enum.onsite,
      ).length,
      daysWithAppointments: dailyStats.filter(
        (item) => item.totalAppointments > 0,
      ).length,
    };

    const staffOptions = staffRows.map((staff) => ({
      id: staff.user_id,
      name: this.buildFullName(staff.name, staff.sur_name),
      role: staff.roles?.name ?? null,
      roleLabel: this.toRoleLabel(staff.roles?.name),
      specialty: staff.info ?? null,
      avatarUrl: staff.file_name ?? null,
    }));

    const staffOverview = staffRows
      .map((staff) => {
        const staffAppointments = appointmentItems
          .filter((item) => item.staffId === staff.user_id)
          .sort(
            (left, right) => this.getSortValue(left) - this.getSortValue(right),
          );
        const nextAppointment =
          staffAppointments.find((item) => !this.isPastAppointment(
            item.appointmentDate,
            this.tryParseTimeRange(item.timeSelect),
          )) ?? null;

        return {
          staffId: staff.user_id,
          staffName: this.buildFullName(staff.name, staff.sur_name),
          role: staff.roles?.name ?? null,
          roleLabel: this.toRoleLabel(staff.roles?.name),
          specialty: staff.info ?? null,
          avatarUrl: staff.file_name ?? null,
          totalAppointments: staffAppointments.length,
          paidAppointments: staffAppointments.filter(
            (item) => item.paymentStatus === pay_type_enum.Paid,
          ).length,
          pendingAppointments: staffAppointments.filter(
            (item) => item.paymentStatus !== pay_type_enum.Paid,
          ).length,
          onlineAppointments: staffAppointments.filter(
            (item) => item.appointmentType === appointments_type_enum.online,
          ).length,
          onsiteAppointments: staffAppointments.filter(
            (item) => item.appointmentType === appointments_type_enum.onsite,
          ).length,
          nextAppointmentDate: nextAppointment?.appointmentDate ?? null,
          nextAppointmentTime: nextAppointment?.timeSelect ?? null,
          scheduleStatus:
            staff.schedule[0]?.status ?? ('unassigned' as const),
        } satisfies StaffDashboardStaffSummary;
      })
      .sort((left, right) => {
        if (right.totalAppointments !== left.totalAppointments) {
          return right.totalAppointments - left.totalAppointments;
        }

        return left.staffName.localeCompare(right.staffName, 'th');
      });

    const selectedDateAppointments = appointmentItems
      .filter((item) => item.appointmentDate === selectedDate)
      .sort((left, right) => this.getSortValue(left) - this.getSortValue(right));

    const upcomingAppointments = appointmentItems
      .filter(
        (item) =>
          !this.isPastAppointment(
            item.appointmentDate,
            this.tryParseTimeRange(item.timeSelect),
          ),
      )
      .sort((left, right) => this.getSortValue(left) - this.getSortValue(right))
      .slice(0, 8);

    return {
      month,
      selectedDate,
      weekRange: {
        start: weekDayKeys[0],
        end: weekDayKeys[weekDayKeys.length - 1],
      },
      filters: {
        staffId,
      },
      summary,
      staffOptions,
      dailyStats,
      weekStats,
      weekAppointments: weekAppointmentItems,
      selectedDateAppointments,
      upcomingAppointments,
      staffOverview,
    };
  }

  private normalizeMonth(value?: string): string {
    const trimmed = value?.trim();

    if (!trimmed) {
      return this.getClinicNowParts(new Date()).monthKey;
    }

    if (!/^\d{4}-\d{2}$/.test(trimmed)) {
      throw new BadRequestException('month must be in YYYY-MM format');
    }

    const parsedDate = new Date(`${trimmed}-01T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime()) || this.toMonthKey(parsedDate) !== trimmed) {
      throw new BadRequestException('month is invalid');
    }

    return trimmed;
  }

  private resolveSelectedDate(
    value: string | undefined,
    month: string,
    dayKeys: string[],
  ): string {
    const trimmed = value?.trim();

    if (trimmed) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        throw new BadRequestException('date must be in YYYY-MM-DD format');
      }

      if (!trimmed.startsWith(`${month}-`) || !dayKeys.includes(trimmed)) {
        throw new BadRequestException('date must belong to the selected month');
      }

      return trimmed;
    }

    const today = this.getClinicNowParts(new Date()).dateKey;

    if (today.startsWith(`${month}-`) && dayKeys.includes(today)) {
      return today;
    }

    return dayKeys[0];
  }

  private parseStaffId(value?: string): number | null {
    const trimmed = value?.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('staffId must be a positive integer');
    }

    return parsed;
  }

  private getMonthBounds(month: string): {
    monthStart: Date;
    monthEndExclusive: Date;
    dayKeys: string[];
  } {
    const [yearText, monthText] = month.split('-');
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;
    const monthStart = new Date(Date.UTC(year, monthIndex, 1));
    const monthEndExclusive = new Date(Date.UTC(year, monthIndex + 1, 1));
    const dayKeys: string[] = [];
    const cursor = new Date(monthStart);

    while (cursor < monthEndExclusive) {
      dayKeys.push(this.dateToIsoDate(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return {
      monthStart,
      monthEndExclusive,
      dayKeys,
    };
  }

  private getWeekBounds(selectedDate: string): {
    weekStart: Date;
    weekEndExclusive: Date;
    dayKeys: string[];
  } {
    const selectedDateValue = this.toDateOnlyUtc(selectedDate);
    const weekday = selectedDateValue.getUTCDay();
    const weekStart = new Date(selectedDateValue);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekday);
    const weekEndExclusive = new Date(weekStart);
    weekEndExclusive.setUTCDate(weekEndExclusive.getUTCDate() + 7);
    const dayKeys: string[] = [];
    const cursor = new Date(weekStart);

    while (cursor < weekEndExclusive) {
      dayKeys.push(this.dateToIsoDate(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return {
      weekStart,
      weekEndExclusive,
      dayKeys,
    };
  }

  private buildDailyStats(
    dayKeys: string[],
    appointmentItems: StaffDashboardAppointment[],
  ): StaffDashboardDay[] {
    const dailyStatsMap = new Map<
      string,
      StaffDashboardDay & {
        patientIds: Set<number>;
        staffIds: Set<number>;
      }
    >();

    dayKeys.forEach((dateKey) => {
      dailyStatsMap.set(dateKey, {
        date: dateKey,
        totalAppointments: 0,
        paidAppointments: 0,
        pendingPayments: 0,
        onlineAppointments: 0,
        onsiteAppointments: 0,
        uniquePatients: 0,
        staffCount: 0,
        patientIds: new Set<number>(),
        staffIds: new Set<number>(),
      });
    });

    appointmentItems.forEach((item) => {
      if (!item.appointmentDate) {
        return;
      }

      const day = dailyStatsMap.get(item.appointmentDate);

      if (!day) {
        return;
      }

      day.totalAppointments += 1;
      if (item.paymentStatus === pay_type_enum.Paid) {
        day.paidAppointments += 1;
      } else {
        day.pendingPayments += 1;
      }
      if (item.appointmentType === appointments_type_enum.online) {
        day.onlineAppointments += 1;
      }
      if (item.appointmentType === appointments_type_enum.onsite) {
        day.onsiteAppointments += 1;
      }
      if (item.patientId) {
        day.patientIds.add(item.patientId);
      }
      if (item.staffId) {
        day.staffIds.add(item.staffId);
      }
    });

    return dayKeys.map((dateKey) => {
      const day = dailyStatsMap.get(dateKey);

      if (!day) {
        return {
          date: dateKey,
          totalAppointments: 0,
          paidAppointments: 0,
          pendingPayments: 0,
          onlineAppointments: 0,
          onsiteAppointments: 0,
          uniquePatients: 0,
          staffCount: 0,
        };
      }

      return {
        date: day.date,
        totalAppointments: day.totalAppointments,
        paidAppointments: day.paidAppointments,
        pendingPayments: day.pendingPayments,
        onlineAppointments: day.onlineAppointments,
        onsiteAppointments: day.onsiteAppointments,
        uniquePatients: day.patientIds.size,
        staffCount: day.staffIds.size,
      };
    });
  }

  private buildFullName(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return fullName || 'ไม่ระบุชื่อ';
  }

  private toRoleLabel(role?: string | null): string {
    const normalized = role?.trim().toLowerCase();

    if (normalized === 'psychiatrist' || role === 'จิตแพทย์') {
      return 'จิตแพทย์';
    }

    if (normalized === 'psychologist' || role === 'นักจิตวิทยา') {
      return 'นักจิตวิทยา';
    }

    if (normalized === 'pharmacist' || role === 'เภสัชกร') {
      return 'เภสัชกร';
    }

    if (normalized === 'admin' || role === 'ADMIN') {
      return 'แอดมิน';
    }

    return role?.trim() || 'ไม่ระบุตำแหน่ง';
  }

  private toAppointmentTypeLabel(
    appointmentType: appointments_type_enum | null,
  ): string {
    if (appointmentType === appointments_type_enum.online) {
      return 'ออนไลน์';
    }

    if (appointmentType === appointments_type_enum.onsite) {
      return 'ที่คลินิก';
    }

    return 'ยังไม่ระบุ';
  }

  private toPaymentStatusLabel(status: pay_type_enum | null): string {
    if (status === pay_type_enum.Paid) {
      return 'ชำระแล้ว';
    }

    if (status === pay_type_enum.Not_paying) {
      return 'รอชำระ';
    }

    return 'ยังไม่ระบุ';
  }

  private toDisplayStatus(
    paymentStatus: pay_type_enum | null,
    isPast: boolean,
  ): DashboardStatus {
    if (isPast) {
      return 'completed';
    }

    if (paymentStatus === pay_type_enum.Paid) {
      return 'confirmed';
    }

    return 'pending';
  }

  private toDisplayStatusLabel(status: DashboardStatus): string {
    if (status === 'completed') {
      return 'เสร็จสิ้นแล้ว';
    }

    if (status === 'confirmed') {
      return 'ยืนยันแล้ว';
    }

    return 'รอชำระ';
  }

  private tryParseTimeRange(value?: string | null): TimeRange | null {
    if (!value) {
      return null;
    }

    const normalized = value
      .trim()
      .replace(/(?:–|—|−|~|ถึง)/g, '-')
      .replace(/\./g, ':')
      .replace(/\s+/g, ' ');
    const match = normalized.match(
      /^(\d{1,2})\s*:\s*([0-5]\d)\s*-\s*(\d{1,2})\s*:\s*([0-5]\d)$/,
    );

    if (!match) {
      return null;
    }

    const startHour = Number(match[1]);
    const startMinute = Number(match[2]);
    const endHour = Number(match[3]);
    const endMinute = Number(match[4]);

    if (
      startHour > 23 ||
      endHour > 23 ||
      startMinute > 59 ||
      endMinute > 59
    ) {
      return null;
    }

    const startText = `${String(startHour).padStart(2, '0')}:${String(
      startMinute,
    ).padStart(2, '0')}`;
    const endText = `${String(endHour).padStart(2, '0')}:${String(
      endMinute,
    ).padStart(2, '0')}`;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      return null;
    }

    return {
      startMinutes,
      endMinutes,
      startText,
      endText,
    };
  }

  private isPastAppointment(
    appointmentDate: string | null,
    timeRange: TimeRange | null,
  ): boolean {
    if (!appointmentDate) {
      return false;
    }

    const clinicNow = this.getClinicNowParts(new Date());
    const today = clinicNow.dateKey;

    if (appointmentDate < today) {
      return true;
    }

    if (appointmentDate > today) {
      return false;
    }

    if (!timeRange) {
      return false;
    }

    return timeRange.endMinutes <= clinicNow.minutes;
  }

  private getSortValue(item: {
    appointmentDate: string | null;
    timeSelect: string | null;
  }): number {
    if (!item.appointmentDate) {
      return Number.MAX_SAFE_INTEGER;
    }

    const datePart = Number(item.appointmentDate.replace(/-/g, ''));
    const parsedRange = this.tryParseTimeRange(item.timeSelect);
    return datePart * 10000 + (parsedRange?.startMinutes ?? 0);
  }

  private toDateOnlyUtc(dateKey: string): Date {
    return new Date(`${dateKey}T00:00:00.000Z`);
  }

  private dateToIsoDate(value: Date): string {
    return [
      value.getUTCFullYear(),
      String(value.getUTCMonth() + 1).padStart(2, '0'),
      String(value.getUTCDate()).padStart(2, '0'),
    ].join('-');
  }

  private toMonthKey(value: Date): string {
    return [
      value.getUTCFullYear(),
      String(value.getUTCMonth() + 1).padStart(2, '0'),
    ].join('-');
  }

  private getClinicNowParts(value: Date): {
    dateKey: string;
    monthKey: string;
    minutes: number;
  } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: CLINIC_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(value);
    const partMap = Object.fromEntries(
      parts
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, part.value]),
    ) as Record<string, string>;
    const year = partMap.year;
    const month = partMap.month;
    const day = partMap.day;
    const hour = Number(partMap.hour ?? '0');
    const minute = Number(partMap.minute ?? '0');

    return {
      dateKey: `${year}-${month}-${day}`,
      monthKey: `${year}-${month}`,
      minutes: hour * 60 + minute,
    };
  }
}
