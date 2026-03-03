import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { appointments_type_enum, pay_type_enum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentTabQueryDto } from './dto/appointment-tab-query.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

type AppointmentTab = 'upcoming' | 'past';
type AppointmentDisplayStatus = 'pending' | 'confirmed' | 'completed';

type AppointmentResponseItem = {
  id: number;
  appointmentDate: string | null;
  timeSelect: string | null;
  appointmentType: appointments_type_enum | null;
  paymentStatus: pay_type_enum | null;
  displayStatus: AppointmentDisplayStatus;
  staff: {
    userId: number;
    name: string;
    surName: string;
    email: string | null;
    fileName: string | null;
  } | null;
};

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMyAppointments(userId: number, query: AppointmentTabQueryDto) {
    const tab: AppointmentTab = query.tab === 'past' ? 'past' : 'upcoming';
    const today = this.getStartOfToday();

    const appointments = await this.prisma.appointments.findMany({
      where: {
        user_id: userId,
        appointment_date: tab === 'past' ? { lt: today } : { gte: today },
      },
      include: {
        users_appointments_staff_idTousers: {
          select: {
            user_id: true,
            name: true,
            sur_name: true,
            email: true,
            file_name: true,
          },
        },
      },
      orderBy: [
        { appointment_date: tab === 'past' ? 'desc' : 'asc' },
        { id: 'desc' },
      ],
    });

    return {
      data: appointments.map((appointment) =>
        this.toResponseItem(appointment, today),
      ),
    };
  }

  async rescheduleMyAppointment(
    userId: number,
    appointmentId: number,
    body: RescheduleAppointmentDto,
  ) {
    const appointmentDate = this.parseAppointmentDate(body.appointmentDate);
    const today = this.getStartOfToday();

    if (appointmentDate < today) {
      throw new BadRequestException(
        'appointmentDate must be today or in the future',
      );
    }

    const existing = await this.prisma.appointments.findFirst({
      where: {
        id: appointmentId,
        user_id: userId,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    const updated = await this.prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        appointment_date: appointmentDate,
        ...(body.timeSelect !== undefined
          ? { time_select: body.timeSelect.trim() || null }
          : {}),
      },
      include: {
        users_appointments_staff_idTousers: {
          select: {
            user_id: true,
            name: true,
            sur_name: true,
            email: true,
            file_name: true,
          },
        },
      },
    });

    return {
      message: 'Appointment updated',
      data: this.toResponseItem(updated, today),
    };
  }

  async cancelMyAppointment(userId: number, appointmentId: number) {
    const existing = await this.prisma.appointments.findFirst({
      where: {
        id: appointmentId,
        user_id: userId,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    await this.prisma.appointments.delete({
      where: { id: appointmentId },
    });

    return { message: 'Appointment cancelled' };
  }

  private getStartOfToday() {
    const now = new Date();
    return new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );
  }

  private parseAppointmentDate(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      throw new BadRequestException('Invalid appointmentDate format');
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      throw new BadRequestException('Invalid appointmentDate value');
    }

    return parsed;
  }

  private mapDisplayStatus(
    appointmentDate: Date | null,
    paymentStatus: pay_type_enum | null,
    today: Date,
  ): AppointmentDisplayStatus {
    if (appointmentDate && appointmentDate < today) {
      return 'completed';
    }

    if (paymentStatus === 'Paid') {
      return 'confirmed';
    }

    return 'pending';
  }

  private toResponseItem(
    appointment: {
      id: number;
      appointment_date: Date | null;
      time_select: string | null;
      appointment_type: appointments_type_enum | null;
      status: pay_type_enum | null;
      users_appointments_staff_idTousers: {
        user_id: number;
        name: string;
        sur_name: string;
        email: string | null;
        file_name: string | null;
      } | null;
    },
    today: Date,
  ): AppointmentResponseItem {
    return {
      id: appointment.id,
      appointmentDate: appointment.appointment_date
        ? this.formatDateOnly(appointment.appointment_date)
        : null,
      timeSelect: appointment.time_select,
      appointmentType: appointment.appointment_type,
      paymentStatus: appointment.status,
      displayStatus: this.mapDisplayStatus(
        appointment.appointment_date,
        appointment.status,
        today,
      ),
      staff: appointment.users_appointments_staff_idTousers
        ? {
            userId: appointment.users_appointments_staff_idTousers.user_id,
            name: appointment.users_appointments_staff_idTousers.name,
            surName: appointment.users_appointments_staff_idTousers.sur_name,
            email: appointment.users_appointments_staff_idTousers.email,
            fileName: appointment.users_appointments_staff_idTousers.file_name,
          }
        : null,
    };
  }

  private formatDateOnly(value: Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
