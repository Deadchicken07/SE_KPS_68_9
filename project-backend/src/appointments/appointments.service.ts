import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { pay_type_enum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed';

type AppointmentScheduleItem = {
  id: number;
  consultantName: string;
  appointmentDate: string | null;
  timeSelect: string | null;
  contact: string;
  status: AppointmentStatus;
  avatarLabel: string;
  avatarUrl: string | null;
  appointmentType: 'online' | 'onsite' | null;
  paymentStatus: string | null;
};

type AppointmentScheduleResponse = {
  upcoming: AppointmentScheduleItem[];
  past: AppointmentScheduleItem[];
};

type TimeRange = {
  startMinutes: number;
  endMinutes: number;
};

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMySchedule(userId: number): Promise<AppointmentScheduleResponse> {
    const records = await this.prisma.appointments.findMany({
      where: { user_id: userId },
      include: {
        users_appointments_staff_idTousers: {
          select: {
            name: true,
            sur_name: true,
            email: true,
            file_name: true,
          },
        },
      },
    });

    const mapped = records.map((record) => {
      const appointmentDate = record.appointment_date
        ? this.dateToIsoDate(record.appointment_date)
        : null;
      const parsedRange = this.tryParseTimeRange(record.time_select);
      const isPast = this.isPastAppointment(appointmentDate, parsedRange);
      const consultantName = this.buildConsultantName(
        record.users_appointments_staff_idTousers?.name,
        record.users_appointments_staff_idTousers?.sur_name,
      );

      const item: AppointmentScheduleItem = {
        id: record.id,
        consultantName,
        appointmentDate,
        timeSelect: record.time_select ?? null,
        contact: record.users_appointments_staff_idTousers?.email ?? '-',
        status: this.toDisplayStatus(record.status, isPast),
        avatarLabel: this.toAvatarLabel(
          record.users_appointments_staff_idTousers?.name,
          record.users_appointments_staff_idTousers?.sur_name,
        ),
        avatarUrl: record.users_appointments_staff_idTousers?.file_name ?? null,
        appointmentType: record.appointment_type ?? null,
        paymentStatus: record.status ?? null,
      };

      return {
        item,
        isPast,
        sortValue: this.getSortValue(appointmentDate, parsedRange),
      };
    });

    const upcoming = mapped
      .filter((entry) => !entry.isPast)
      .sort((a, b) => a.sortValue - b.sortValue)
      .map((entry) => entry.item);

    const past = mapped
      .filter((entry) => entry.isPast)
      .sort((a, b) => b.sortValue - a.sortValue)
      .map((entry) => entry.item);

    return {
      upcoming,
      past,
    };
  }

  async rescheduleAppointment(
    userId: number,
    appointmentId: number,
    dto: RescheduleAppointmentDto,
  ) {
    const appointment = await this.getOwnedAppointment(appointmentId, userId);
    const appointmentDate = this.normalizeDate(dto.appointmentDate);
    const dateValue = this.toDateOnlyUtc(appointmentDate);
    const timeSelect = this.normalizeTimeSelect(dto.timeSelect);
    const parsedRange = this.tryParseTimeRange(timeSelect);

    if (!parsedRange) {
      throw new BadRequestException('Invalid timeSelect format');
    }

    if (this.isPastAppointment(appointmentDate, parsedRange)) {
      throw new BadRequestException('Cannot move appointment to a past time');
    }

    await this.ensureNoConflicts({
      appointmentId,
      userId,
      staffId: appointment.staff_id ?? null,
      dateValue,
      timeSelect,
    });

    const updated = await this.prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        appointment_date: dateValue,
        time_select: timeSelect,
      },
      include: {
        users_appointments_staff_idTousers: {
          select: {
            name: true,
            sur_name: true,
            email: true,
            file_name: true,
          },
        },
      },
    });

    return {
      message: 'Appointment rescheduled successfully',
      appointment: {
        id: updated.id,
        appointmentDate: updated.appointment_date
          ? this.dateToIsoDate(updated.appointment_date)
          : null,
        timeSelect: updated.time_select ?? null,
      },
    };
  }

  private async getOwnedAppointment(appointmentId: number, userId: number) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        user_id: true,
        staff_id: true,
        appointment_date: true,
        time_select: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.user_id !== userId) {
      throw new ForbiddenException('Appointment does not belong to this user');
    }

    return appointment;
  }

  private async ensureNoConflicts(input: {
    appointmentId: number;
    userId: number;
    staffId: number | null;
    dateValue: Date;
    timeSelect: string;
  }) {
    const [userConflict, staffConflict, leaveRecord] = await Promise.all([
      this.prisma.appointments.findFirst({
        where: {
          user_id: input.userId,
          appointment_date: input.dateValue,
          time_select: input.timeSelect,
          NOT: { id: input.appointmentId },
        },
        select: { id: true },
      }),
      input.staffId
        ? this.prisma.appointments.findFirst({
            where: {
              staff_id: input.staffId,
              appointment_date: input.dateValue,
              time_select: input.timeSelect,
              NOT: { id: input.appointmentId },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
      input.staffId
        ? this.prisma.schedule.findUnique({
            where: {
              staff_id_work_date: {
                staff_id: input.staffId,
                work_date: input.dateValue,
              },
            },
            select: { status: true },
          })
        : Promise.resolve(null),
    ]);

    if (userConflict) {
      throw new BadRequestException('You already have an appointment in this slot');
    }

    if (staffConflict) {
      throw new BadRequestException('This consultant is not available in this slot');
    }

    if (leaveRecord?.status === 'leave') {
      throw new BadRequestException('This consultant is on leave for the selected date');
    }
  }

  private toDisplayStatus(
    paymentStatus: pay_type_enum | null,
    isPast: boolean,
  ): AppointmentStatus {
    if (isPast) {
      return 'completed';
    }

    if (paymentStatus === pay_type_enum.Paid) {
      return 'confirmed';
    }

    return 'pending';
  }

  private buildConsultantName(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return fullName || 'Unknown consultant';
  }

  private toAvatarLabel(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const first = firstName?.trim().charAt(0) ?? '';
    const last = lastName?.trim().charAt(0) ?? '';
    const value = `${first}${last}`.toUpperCase().trim();
    return value || 'NA';
  }

  private normalizeDate(value: string): string {
    const trimmed = value?.trim();

    if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      throw new BadRequestException('appointmentDate must be in YYYY-MM-DD format');
    }

    const asDate = new Date(`${trimmed}T00:00:00.000Z`);

    if (Number.isNaN(asDate.getTime()) || this.dateToIsoDate(asDate) !== trimmed) {
      throw new BadRequestException('appointmentDate is invalid');
    }

    return trimmed;
  }

  private normalizeTimeSelect(value: string): string {
    const trimmed = value?.trim();

    if (!trimmed) {
      throw new BadRequestException('timeSelect is required');
    }

    const parsed = this.tryParseTimeRange(trimmed);

    if (!parsed) {
      throw new BadRequestException(
        'timeSelect must match HH:mm - HH:mm and end time must be after start time',
      );
    }

    const [startTextRaw, endTextRaw] = trimmed.split('-');
    const startText = startTextRaw.trim();
    const endText = endTextRaw.trim();

    return `${startText} - ${endText}`;
  }

  private tryParseTimeRange(value?: string | null): TimeRange | null {
    if (!value) {
      return null;
    }

    const match = value
      .trim()
      .match(/^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$/);

    if (!match) {
      return null;
    }

    const startMinutes = Number(match[1]) * 60 + Number(match[2]);
    const endMinutes = Number(match[3]) * 60 + Number(match[4]);

    if (endMinutes <= startMinutes) {
      return null;
    }

    return {
      startMinutes,
      endMinutes,
    };
  }

  private isPastAppointment(
    appointmentDate: string | null,
    timeRange: TimeRange | null,
  ): boolean {
    if (!appointmentDate) {
      return false;
    }

    const now = new Date();
    const today = this.toLocalDateKey(now);

    if (appointmentDate < today) {
      return true;
    }

    if (appointmentDate > today) {
      return false;
    }

    if (!timeRange) {
      return false;
    }

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return timeRange.endMinutes <= nowMinutes;
  }

  private getSortValue(
    appointmentDate: string | null,
    timeRange: TimeRange | null,
  ): number {
    if (!appointmentDate) {
      return Number.MAX_SAFE_INTEGER;
    }

    const datePart = Number(appointmentDate.replace(/-/g, ''));
    const timePart = timeRange?.startMinutes ?? 0;
    return datePart * 10000 + timePart;
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

  private toLocalDateKey(value: Date): string {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
