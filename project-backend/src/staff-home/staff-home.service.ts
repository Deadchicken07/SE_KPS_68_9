import { BadRequestException, Injectable } from '@nestjs/common';
import {
  appointments_type_enum,
  pay_type_enum,
  schedule_status,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteClinicHolidayDto } from './dto/delete-clinic-holiday.dto';
import { DeleteStaffScheduleDto } from './dto/delete-staff-schedule.dto';
import { StaffHomeQueryDto } from './dto/staff-home-query.dto';
import { UpsertClinicHolidayDto } from './dto/upsert-clinic-holiday.dto';
import { UpsertStaffScheduleDto } from './dto/upsert-staff-schedule.dto';

type DashboardStatus = 'pending' | 'confirmed' | 'completed';
const CLINIC_TIME_ZONE = 'Asia/Bangkok';

type TimeRange = {
  startMinutes: number;
  endMinutes: number;
  startText: string;
  endText: string;
};

type StaffHomeAppointment = {
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

type StaffHomeDay = {
  date: string;
  totalAppointments: number;
  paidAppointments: number;
  pendingPayments: number;
  onlineAppointments: number;
  onsiteAppointments: number;
  uniquePatients: number;
  staffCount: number;
};

type StaffHomeStaffSummary = {
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

type StaffHomeScheduleEntry = {
  id: number;
  staffId: number;
  workDate: string;
  status: schedule_status;
  note: string | null;
};

@Injectable()
export class StaffHomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getClinicSchedule(query: StaffHomeQueryDto) {
    const month = this.normalizeMonth(query.month);
    const { monthStart, monthEndExclusive, dayKeys } =
      this.getMonthBounds(month);
    const selectedDate = this.resolveSelectedDate(query.date, month, dayKeys);
    const selectedDateValue = this.toDateOnlyUtc(selectedDate);
    const {
      weekStart,
      weekEndExclusive,
      dayKeys: weekDayKeys,
    } = this.getWeekBounds(selectedDate);
    const staffId = this.parseStaffId(query.staffId);

    const appointmentWhere = {
      appointment_date: {
        gte: monthStart,
        lt: monthEndExclusive,
      },
      ...(staffId ? { staff_id: staffId } : {}),
    };

    const [
      appointments,
      weekAppointments,
      selectedDateClinicAppointments,
      staffRows,
      holidayStaffRows,
    ] = await Promise.all([
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
      this.prisma.appointments.findMany({
        where: {
          appointment_date: selectedDateValue,
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
        where: {
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
      this.getClinicHolidayStaffRows(),
    ]);

    const scheduleRows = await this.prisma.schedule.findMany({
      where: {
        ...(staffId ? { staff_id: staffId } : {}),
        work_date: {
          gte: monthStart,
          lt: monthEndExclusive,
        },
      },
      orderBy: [{ work_date: 'asc' }, { staff_id: 'asc' }],
      select: {
        id: true,
        staff_id: true,
        work_date: true,
        status: true,
        note: true,
      },
    });

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
      } satisfies StaffHomeAppointment;
    };

    const appointmentItems = appointments.map(mapAppointmentRecord);
    const weekAppointmentItems = weekAppointments.map(mapAppointmentRecord);
    const selectedDateClinicAppointmentItems =
      selectedDateClinicAppointments.map(mapAppointmentRecord);
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

    const holidayStaffOptions = holidayStaffRows.map((staff) => ({
      id: staff.user_id,
      name: this.buildFullName(staff.name, staff.sur_name),
      role: staff.roles?.name ?? null,
      roleLabel: this.toRoleLabel(staff.roles?.name),
      specialty: staff.info ?? null,
      avatarUrl: staff.file_name ?? null,
    }));

    const staffOverview = staffRows
      .map((staff) => {
        const staffAppointments = selectedDateClinicAppointmentItems
          .filter((item) => item.staffId === staff.user_id)
          .sort(
            (left, right) => this.getSortValue(left) - this.getSortValue(right),
          );
        const nextAppointment =
          staffAppointments.find(
            (item) =>
              !this.isPastAppointment(
                item.appointmentDate,
                this.tryParseTimeRange(item.timeSelect),
              ),
          ) ?? null;

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
          scheduleStatus: staff.schedule[0]?.status ?? ('unassigned' as const),
        } satisfies StaffHomeStaffSummary;
      })
      .sort((left, right) => {
        if (right.totalAppointments !== left.totalAppointments) {
          return right.totalAppointments - left.totalAppointments;
        }

        return left.staffName.localeCompare(right.staffName, 'th');
      });

    const selectedDateAppointments = appointmentItems
      .filter((item) => item.appointmentDate === selectedDate)
      .sort(
        (left, right) => this.getSortValue(left) - this.getSortValue(right),
      );

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

    const scheduleEntries = scheduleRows.map(
      (schedule): StaffHomeScheduleEntry => ({
        id: schedule.id,
        staffId: schedule.staff_id,
        workDate: this.dateToIsoDate(schedule.work_date),
        status: schedule.status ?? schedule_status.working,
        note: schedule.note,
      }),
    );

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
      holidayStaffOptions,
      dailyStats,
      scheduleEntries,
      weekStats,
      weekAppointments: weekAppointmentItems,
      selectedDateAppointments,
      upcomingAppointments,
      staffOverview,
    };
  }

  async upsertStaffSchedule(input: UpsertStaffScheduleDto) {
    const staffId = Number(input?.staffId);
    const workDate = input?.workDate?.trim();
    const status = input?.status;
    const note = input?.note?.trim() || null;

    if (!Number.isInteger(staffId) || staffId <= 0) {
      throw new BadRequestException('staffId must be a positive integer');
    }

    if (!workDate || !/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
      throw new BadRequestException('workDate must be in YYYY-MM-DD format');
    }

    if (workDate < this.getClinicNowParts(new Date()).dateKey) {
      throw new BadRequestException('ไม่สามารถบันทึกตารางงานย้อนหลังได้');
    }

    if (status !== 'working' && status !== 'leave' && status !== 'holiday') {
      throw new BadRequestException(
        'status must be working, leave, or holiday',
      );
    }

    if (note && note.length > 255) {
      throw new BadRequestException('note must not exceed 255 characters');
    }

    const workDateValue = this.toDateOnlyUtc(workDate);
    const staff = await this.prisma.users.findUnique({
      where: { user_id: staffId },
      select: {
        user_id: true,
        name: true,
        sur_name: true,
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!staff) {
      throw new BadRequestException('ไม่พบบุคลากรที่ต้องการบันทึกตารางงาน');
    }

    const existingSchedule = await this.prisma.schedule.findUnique({
      where: {
        staff_id_work_date: {
          staff_id: staffId,
          work_date: workDateValue,
        },
      },
      select: { id: true },
    });

    const schedule = await this.prisma.schedule.upsert({
      where: {
        staff_id_work_date: {
          staff_id: staffId,
          work_date: workDateValue,
        },
      },
      update: {
        status: status as schedule_status,
        note,
      },
      create: {
        staff_id: staffId,
        work_date: workDateValue,
        status: status as schedule_status,
        note,
      },
      select: {
        id: true,
        staff_id: true,
        work_date: true,
        status: true,
        note: true,
      },
    });

    return {
      message: existingSchedule
        ? 'อัปเดตตารางเข้างาน/ลาเรียบร้อยแล้ว'
        : 'บันทึกตารางเข้างาน/ลาเรียบร้อยแล้ว',
      schedule: {
        id: schedule.id,
        staffId: schedule.staff_id,
        staffName: this.buildFullName(staff.name, staff.sur_name),
        staffRoleLabel: this.toRoleLabel(staff.roles?.name),
        workDate: this.dateToIsoDate(schedule.work_date),
        status: schedule.status,
        note: schedule.note,
      },
    };
  }

  async deleteStaffSchedule(input: DeleteStaffScheduleDto) {
    const staffId = Number(input?.staffId);
    const workDate = input?.workDate?.trim();

    if (!Number.isInteger(staffId) || staffId <= 0) {
      throw new BadRequestException('staffId must be a positive integer');
    }

    if (!workDate || !/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
      throw new BadRequestException('workDate must be in YYYY-MM-DD format');
    }

    if (workDate < this.getClinicNowParts(new Date()).dateKey) {
      throw new BadRequestException('ไม่สามารถลบตารางงานย้อนหลังได้');
    }

    const workDateValue = this.toDateOnlyUtc(workDate);
    const existingSchedule = await this.prisma.schedule.findUnique({
      where: {
        staff_id_work_date: {
          staff_id: staffId,
          work_date: workDateValue,
        },
      },
      select: { id: true },
    });

    if (!existingSchedule) {
      throw new BadRequestException('ไม่พบสถานะที่บันทึกไว้สำหรับวันนี้');
    }

    await this.prisma.schedule.delete({
      where: {
        staff_id_work_date: {
          staff_id: staffId,
          work_date: workDateValue,
        },
      },
    });

    return {
      message: 'ลบสถานะวันทำงาน/วันลาเรียบร้อยแล้ว',
    };
  }

  async upsertClinicHoliday(input: UpsertClinicHolidayDto) {
    const month = this.normalizeMonth(input?.month);
    const weekday = this.parseClinicHolidayWeekday(input?.weekday);
    const scope = this.parseClinicHolidayScope(input?.scope);
    const note = input?.note?.trim() || null;

    if (note && note.length > 255) {
      throw new BadRequestException('note must not exceed 255 characters');
    }

    const workDates = this.getClinicHolidayDateKeys(month, weekday);
    const staffIds = await this.getClinicHolidayTargetStaffIds(
      scope,
      input?.staffId,
    );

    await this.prisma.$transaction(
      staffIds.flatMap((staffId) =>
        workDates.map((workDate) =>
          this.prisma.schedule.upsert({
            where: {
              staff_id_work_date: {
                staff_id: staffId,
                work_date: this.toDateOnlyUtc(workDate),
              },
            },
            update: {
              status: schedule_status.holiday,
              note,
            },
            create: {
              staff_id: staffId,
              work_date: this.toDateOnlyUtc(workDate),
              status: schedule_status.holiday,
              note,
            },
          }),
        ),
      ),
    );

    return {
      message: 'บันทึกวันหยุดรายเดือนเรียบร้อยแล้ว',
      affectedStaffCount: staffIds.length,
      affectedDateCount: workDates.length,
      month,
      weekday,
      scope,
    };
  }

  async deleteClinicHoliday(input: DeleteClinicHolidayDto) {
    const month = this.normalizeMonth(input?.month);
    const weekday = this.parseClinicHolidayWeekday(input?.weekday);
    const scope = this.parseClinicHolidayScope(input?.scope);
    const workDates = this.getClinicHolidayDateKeys(month, weekday);
    const staffIds = await this.getClinicHolidayTargetStaffIds(
      scope,
      input?.staffId,
    );

    const deleted = await this.prisma.schedule.deleteMany({
      where: {
        staff_id: {
          in: staffIds,
        },
        work_date: {
          in: workDates.map((workDate) => this.toDateOnlyUtc(workDate)),
        },
        status: schedule_status.holiday,
      },
    });

    if (!deleted.count) {
      throw new BadRequestException(
        'ยังไม่มีวันหยุดตามเงื่อนไขนี้ในเดือนที่เลือก',
      );
    }

    return {
      message: 'ลบวันหยุดรายเดือนเรียบร้อยแล้ว',
      affectedStaffCount: deleted.count,
      affectedDateCount: workDates.length,
      month,
      weekday,
      scope,
    };
  }

  private async getClinicHolidayStaffRows() {
    return this.prisma.users.findMany({
      where: {
        NOT: {
          OR: [{ role_id: 2 }, { role_id: null }],
        },
      },
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
      orderBy: [{ name: 'asc' }, { sur_name: 'asc' }],
    });
  }

  private async getClinicHolidayStaffIds() {
    const staffRows = await this.prisma.users.findMany({
      where: {
        NOT: {
          OR: [{ role_id: 2 }, { role_id: null }],
        },
      },
      select: {
        user_id: true,
      },
      orderBy: {
        user_id: 'asc',
      },
    });

    const staffIds = staffRows.map((staff) => staff.user_id);

    if (!staffIds.length) {
      throw new BadRequestException('ไม่พบบุคลากรสำหรับตั้งวันหยุด');
    }

    return staffIds;
  }

  private async getClinicHolidayTargetStaffIds(
    scope: 'all' | 'individual',
    requestedStaffId?: number | null,
  ) {
    if (scope === 'all') {
      return this.getClinicHolidayStaffIds();
    }

    const staffId = Number(requestedStaffId);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      throw new BadRequestException('กรุณาเลือกบุคลากร');
    }

    const staffIds = await this.getClinicHolidayStaffIds();

    if (!staffIds.includes(staffId)) {
      throw new BadRequestException('ไม่พบบุคลากรที่ต้องการตั้งวันหยุด');
    }

    return [staffId];
  }

  private parseClinicHolidayScope(value?: string | null): 'all' | 'individual' {
    if (value === 'all' || value === 'individual') {
      return value;
    }

    throw new BadRequestException('scope must be all or individual');
  }

  private parseClinicHolidayWeekday(
    value: number | string | undefined,
  ): number {
    const weekday = Number(value);

    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      throw new BadRequestException(
        'weekday must be an integer between 0 and 6',
      );
    }

    return weekday;
  }

  private getClinicHolidayDateKeys(month: string, weekday: number) {
    const today = this.getClinicNowParts(new Date()).dateKey;
    const { dayKeys } = this.getMonthBounds(month);
    const matchingDates = dayKeys.filter((dateKey) => {
      const dateValue = this.toDateOnlyUtc(dateKey);

      return dateKey >= today && dateValue.getUTCDay() === weekday;
    });

    if (!matchingDates.length) {
      throw new BadRequestException(
        'ไม่มีวันที่ตรงกับวันในสัปดาห์นี้ที่ยังแก้ไขได้ในเดือนที่เลือก',
      );
    }

    return matchingDates;
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

    if (
      Number.isNaN(parsedDate.getTime()) ||
      this.toMonthKey(parsedDate) !== trimmed
    ) {
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
    appointmentItems: StaffHomeAppointment[],
  ): StaffHomeDay[] {
    const dailyStatsMap = new Map<
      string,
      StaffHomeDay & {
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

    if (startHour > 23 || endHour > 23 || startMinute > 59 || endMinute > 59) {
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
