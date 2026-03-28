import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { pay_type_enum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

type AppointmentStatus =
  | 'รอการชำระเงิน'
  | 'รอการตรวจสอบ'
  | 'ชำระเงินแล้ว'
  | 'ยกเลิกแล้ว'
  | 'เสร็จสิ้น'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'waiting';

type AppointmentScheduleItem = {
  id: number;
  staffId: number | null;
  consultantName: string;
  appointmentDate: string | null;
  timeSelect: string | null;
  contact: string;
  status: AppointmentStatus;
  avatarLabel: string;
  avatarUrl: string | null;
  appointmentType: 'online' | 'onsite' | null;
  paymentStatus: string | null;
  medicinePaymentStatus?: string | null;
  receiptId?: number | null;
  totalPrice?: number | null;
  meetLink: string | null;
  hasPrescription: boolean;
  hasConsultation: boolean;
};

type AppointmentScheduleResponse = {
  upcoming: AppointmentScheduleItem[];
  past: AppointmentScheduleItem[];
};

type StaffAppointmentItem = {
  id: number;
  staffId: number | null;
  patientId: number | null;
  patientName: string;
  appointmentDate: string | null;
  timeSelect: string | null;
  appointmentType: 'online' | 'onsite' | null;
  paymentStatus: string | null;
  depositSlipFile: string | null;
  meetUrl: string | null;
  hasConsultation: boolean;
};

type TimeRange = {
  startMinutes: number;
  endMinutes: number;
};

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) { }

  async getMySchedule(userId: number): Promise<AppointmentScheduleResponse> {
    try {
      const clinicMeetUrl = process.env.CLINIC_MEET_URL ?? null;

      // 1. Fetch upcoming appointments (driven by appointments table)
      const appointmentRecords = await this.prisma.appointments.findMany({
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

      const upcomingMapped = appointmentRecords
        .map((record) => {
          const appointmentDate = record.appointment_date
            ? this.dateToIsoDate(record.appointment_date)
            : null;
          const parsedRange = this.tryParseTimeRange(record.time_select);
          const isPast = this.isPastAppointment(appointmentDate, parsedRange);

          if (isPast) return null; // Skip past appointments here

          const consultantName = this.buildConsultantName(
            record.users_appointments_staff_idTousers?.name,
            record.users_appointments_staff_idTousers?.sur_name,
          );

          const item: AppointmentScheduleItem = {
            id: record.id,
            staffId: record.staff_id,
            consultantName,
            appointmentDate,
            timeSelect: record.time_select ?? null,
            contact: record.users_appointments_staff_idTousers?.email ?? '-',
            status: this.toDisplayStatus(record.status, false),
            avatarLabel: this.toAvatarLabel(
              record.users_appointments_staff_idTousers?.name,
              record.users_appointments_staff_idTousers?.sur_name,
            ),
            avatarUrl: record.users_appointments_staff_idTousers?.file_name ?? null,
            appointmentType: record.appointment_type ?? null,
            paymentStatus: record.status ?? null,
            medicinePaymentStatus: null,
            meetLink: record.appointment_type === 'online' ? clinicMeetUrl : null,
            hasPrescription: false,
            hasConsultation: false,
          };

          return {
            item,
            sortValue: this.getSortValue(appointmentDate, parsedRange),
          };
        })
        .filter((entry): entry is { item: AppointmentScheduleItem; sortValue: number } => entry !== null)
        .sort((a, b) => a.sortValue - b.sortValue)
        .map((entry) => entry.item);

      // 2. Fetch past history (driven by consultations table)
      const consultationRecords = (await this.prisma.consultations.findMany({
        where: { user_id: userId },
        include: {
          users_consultations_staff_idTousers: {
            select: {
              name: true,
              sur_name: true,
              email: true,
              file_name: true,
            },
          },
          _count: {
            select: { prescription_items: true },
          },
          receipts: {
            select: {
              id: true,
              total: true,
              status: true,
              payment_status: true,
              receipt_details: {
                select: {
                  item_type: true,
                  total_price: true,
                },
              },
            },
            take: 1,
          },
        },
      } as any)) as any[];

      const pastMapped = consultationRecords
        .map((c) => {
          const dateKey = c.created_at ? this.dateToIsoDate(c.created_at) : null;

          // Try to link this consultation back to an appointment item for the frontend modal
          // Logic: Match by staff_id and dateKey
          const matchedAppt = appointmentRecords.find(a =>
            a.staff_id === c.staff_id &&
            (a.appointment_date ? this.dateToIsoDate(a.appointment_date) : null) === dateKey
          );

          const consultantName = this.buildConsultantName(
            c.users_consultations_staff_idTousers?.name,
            c.users_consultations_staff_idTousers?.sur_name,
          );

          const firstReceipt = c.receipts?.[0];
          const medicineTotal = firstReceipt?.receipt_details
            ? firstReceipt.receipt_details
              .filter((d: any) => d.item_type === 'medicine')
              .reduce((sum: number, d: any) => sum + (d.total_price ? Number(d.total_price) : 0), 0)
            : null;

          const item: AppointmentScheduleItem = {
            // Use consultation ID for direct mapping to clinical data
            id: c.id,
            staffId: c.staff_id,
            consultantName,
            appointmentDate: dateKey,
            timeSelect: matchedAppt?.time_select ?? null,
            contact: c.users_consultations_staff_idTousers?.email ?? '-',
            status: 'เสร็จสิ้น',
            avatarLabel: this.toAvatarLabel(
              c.users_consultations_staff_idTousers?.name,
              c.users_consultations_staff_idTousers?.sur_name,
            ),
            avatarUrl: c.users_consultations_staff_idTousers?.file_name ?? null,
            appointmentType: matchedAppt?.appointment_type ?? null,
            paymentStatus: matchedAppt?.status ?? 'Paid',
            medicinePaymentStatus: firstReceipt?.payment_status ?? null,
            receiptId: firstReceipt?.id ?? null,
            totalPrice: medicineTotal,
            meetLink: null,
            hasPrescription: c._count?.prescription_items > 0,
            hasConsultation: true,
          };

          return {
            item,
            sortValue: this.getSortValue(dateKey, null), // Sort by date
          };
        })
        .sort((a, b) => b.sortValue - a.sortValue)
        .map((entry) => entry.item);

      return {
        upcoming: upcomingMapped,
        past: pastMapped,
      };
    } catch (error) {
      console.error('Error in getMySchedule:', error);
      throw error;
    }
  }

  async createAppointment(userId: number, body: any) {
    const { staffId, date, timeSelect } = body;
    const dateValue = this.toDateOnlyUtc(this.normalizeDate(date));
    const normalizedTime = this.normalizeTimeSelect(timeSelect);

    await this.ensureNoConflicts({
      appointmentId: 0,
      userId,
      staffId,
      dateValue,
      timeSelect: normalizedTime,
    });

    const appointment = await this.prisma.appointments.create({
      data: {
        user_id: userId,
        staff_id: staffId,
        appointment_date: dateValue,
        time_select: normalizedTime,
        status: 'Not_paying',
        appointment_type:
          body.appointmentType === 'onsite' ? 'onsite' : 'online',
      },
    });

    return {
      message: 'Appointment created successfully',
      appointmentId: appointment.id,
    };
  }

  async createWalkinUser(data: {
    name: string;
    sur_name: string;
    phone?: string;
    nation_id?: string;
    medical_condition?: string;
    allergy_drug?: string;
    current_address?: string;
    nation_address?: string;
  }) {
    if (!data.name || !data.sur_name) {
      throw new BadRequestException(
        'name and sur_name are required for walk-in patients',
      );
    }

    // Create addresses if provided
    let currentAddressId: number | null = null;
    let nationAddressId: number | null = null;
    if (data.current_address) {
      const addr = await this.prisma.addresses.create({
        data: { detail: data.current_address },
      });
      currentAddressId = addr.id;
    }
    if (data.nation_address) {
      const addr = await this.prisma.addresses.create({
        data: { detail: data.nation_address },
      });
      nationAddressId = addr.id;
    }

    return this.prisma.users.create({
      data: {
        name: data.name,
        sur_name: data.sur_name,
        phone: data.phone || null,
        nation_id: data.nation_id || null,
        medical_condition: data.medical_condition || null,
        allergy_drug: data.allergy_drug || null,
        address_id: currentAddressId,
        address_id_nation: nationAddressId,
        role_id: 2, // Assuming 2 is 'user' role
      },
    });
  }

  async getAvailableSlots(dateString: string) {
    const trimmed = dateString?.trim();
    if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      throw new BadRequestException('date must be in YYYY-MM-DD format');
    }
    const dateValue = this.toDateOnlyUtc(trimmed);

    // Every 30 minutes slots map
    const allTimes = [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
    ];

    const staffs = await this.prisma.users.findMany({
      where: {
        roles: { name: { in: ['psychiatrist', 'psychologist'] } },
      },
      select: { user_id: true },
    });

    const staffIds = staffs.map((s) => s.user_id);

    const leaves = await this.prisma.schedule.findMany({
      where: {
        work_date: dateValue,
        status: { in: ['leave', 'holiday'] },
        staff_id: { in: staffIds },
      },
    });
    const staffOnLeave = new Set(leaves.map((l) => l.staff_id));

    const appointments = await this.prisma.appointments.findMany({
      where: {
        appointment_date: dateValue,
        staff_id: { in: staffIds },
      },
    });

    const result: Record<number, string[]> = {};

    for (const staffId of staffIds) {
      if (staffOnLeave.has(staffId)) {
        result[staffId] = [];
        continue;
      }

      const bookedRanges = appointments
        .filter((a) => a.staff_id === staffId && a.time_select)
        .map((a) => this.tryParseTimeRange(a.time_select));

      // filter
      const available = allTimes.filter((t) => {
        const hh = parseInt(t.substring(0, 2), 10);
        const mm = parseInt(t.substring(3, 5), 10);
        const startMin = hh * 60 + mm;

        // check if this slot is covered by any booked range
        const isBooked = bookedRanges.some(
          (r) => r && startMin >= r.startMinutes && startMin < r.endMinutes,
        );

        // Also reject past times if it's today (using Bangkok timezone)
        const nowInThai = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
        const todayInThai = this.toLocalDateKey(nowInThai);

        if (todayInThai === trimmed) {
          const nowMinutes = nowInThai.getHours() * 60 + nowInThai.getMinutes();
          if (startMin <= nowMinutes) return false;
        }

        return !isBooked;
      });

      result[staffId] = available;
    }

    return result;
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

  async getAllPaidAppointments() {
    const fees = await this.prisma.fees.findMany();
    const feeMap = new Map(
      fees.map((f) => [
        f.id,
        f.price_per_hours ? Number(f.price_per_hours) : 0,
      ]),
    );

    const records = await this.prisma.appointments.findMany({
      where: {},
      include: {
        users_appointments_user_idTousers: {
          select: {
            name: true,
            sur_name: true,
          },
        },
        users_appointments_staff_idTousers: {
          select: {
            name: true,
            sur_name: true,
            roles: true,
          },
        },
      },
      orderBy: {
        id: 'desc'
      }
    });

    return records.map((r) => {
      const role = (r.users_appointments_staff_idTousers as any)?.roles;
      const pricePerHour =
        role && role.fee_id ? (feeMap.get(role.fee_id) ?? 0) : 0;

      const parsedRange = this.tryParseTimeRange(r.time_select);
      let durationMinutes = 0;
      if (parsedRange) {
        durationMinutes = parsedRange.endMinutes - parsedRange.startMinutes;
      }
      const price = (durationMinutes / 60) * pricePerHour;

      return {
        id: r.id,
        patientName: this.buildConsultantName(
          r.users_appointments_user_idTousers?.name,
          r.users_appointments_user_idTousers?.sur_name,
        ),
        staffName: this.buildConsultantName(
          r.users_appointments_staff_idTousers?.name,
          r.users_appointments_staff_idTousers?.sur_name,
        ),
        date: r.appointment_date
          ? this.dateToIsoDate(r.appointment_date)
          : null,
        time: r.time_select,
        status: r.status,
        slipUrl: r.deposit_slip_file,
        price: price,
      };
    });
  }

  async getAllMedicinePayments() {
    const receipts = await this.prisma.receipts.findMany({
      orderBy: {
        id: 'desc'
      },
      include: {
        users: {
          select: {
            name: true,
            sur_name: true,
          },
        },
        consultations: {
          select: {
            staff_id: true,
            users_consultations_staff_idTousers: {
              select: {
                name: true,
                sur_name: true,
              },
            },
          },
        },
        receipt_details: {
          where: { item_type: 'medicine' },
          include: {
            medications: true,
          },
        },
      },
    });

    return receipts.map((r) => {
      const patientName = this.buildConsultantName(
        r.users?.name,
        r.users?.sur_name,
      );
      const staffName = this.buildConsultantName(
        r.consultations?.users_consultations_staff_idTousers?.name,
        r.consultations?.users_consultations_staff_idTousers?.sur_name,
      );

      const medicineCost = r.receipt_details.reduce(
        (sum, d) => sum + (d.total_price ? Number(d.total_price) : 0),
        0,
      );

      const medicineItems = r.receipt_details.map((d) => ({
        name: d.item_name ?? d.medications?.name ?? '-',
        quantity: d.quantity ?? 0,
        unitPrice: d.unit_price ? Number(d.unit_price) : 0,
        totalPrice: d.total_price ? Number(d.total_price) : 0,
      }));

      return {
        id: r.id,
        patientName,
        staffName,
        date: r.created_at ? r.created_at.toISOString().split('T')[0] : null,
        medicineCost,
        medicineItems,
        total: r.total ? Number(r.total) : 0,
        slipUrl: r.slip_file,
        status: r.status,
        paymentStatus: (r as any).payment_status,
        tracking: r.tracking,
      };
    });
  }

  async getAppointmentDetails(userId: number, appointmentId: number, isAdmin = false) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
      include: {
        users_appointments_staff_idTousers: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (!isAdmin && appointment.user_id !== userId) {
      throw new ForbiddenException('Appointment does not belong to this user');
    }

    const staff = appointment.users_appointments_staff_idTousers;
    const role = staff?.roles;
    let pricePerHour = 0;

    if (role?.fee_id) {
      const fee = await this.prisma.fees.findUnique({
        where: { id: role.fee_id },
      });
      pricePerHour = fee?.price_per_hours ? Number(fee.price_per_hours) : 0;
    }

    const parsedRange = this.tryParseTimeRange(appointment.time_select);
    let durationMinutes = 0;
    if (parsedRange) {
      durationMinutes = parsedRange.endMinutes - parsedRange.startMinutes;
    }

    const totalPrice = (durationMinutes / 60) * pricePerHour;

    return {
      id: appointment.id,
      staffName: this.buildConsultantName(staff?.name, staff?.sur_name),
      date: appointment.appointment_date
        ? this.dateToIsoDate(appointment.appointment_date)
        : null,
      time: appointment.time_select,
      duration: durationMinutes,
      price: totalPrice,
      status: appointment.status,
    };
  }

  async confirmPayment(appointmentId: number) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        status: pay_type_enum.Paid,
      },
    });

    return {
      message: 'Payment confirmed successfully',
      appointmentId,
      status: pay_type_enum.Paid,
    };
  }

  async rejectPayment(appointmentId: number) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    try {
      await this.prisma.appointments.delete({
        where: { id: appointmentId },
      });
    } catch (error) {
      console.error('Failed to delete appointment on reject:', error);
      throw new BadRequestException('Cannot delete appointment. It may have dependent data.');
    }

    return {
      message: 'Appointment deleted successfully on rejection',
      appointmentId,
    };
  }

  async confirmMedicinePayment(receiptId: number) {
    const receipt = await this.prisma.receipts.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    const newStatus = receipt.status === 'pending_delivery' ? 'delivered' : 'picked_up';

    await this.prisma.receipts.update({
      where: { id: receiptId },
      data: {
        status: newStatus as any,
        payment_status: 'Paid',
      } as any,
    });

    return {
      message: 'Medicine payment confirmed successfully',
      receiptId,
      status: newStatus,
    };
  }

  async rejectMedicinePayment(receiptId: number) {
    const receipt = await this.prisma.receipts.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    try {
      await this.prisma.receipts.delete({
        where: { id: receiptId },
      });
    } catch (error) {
      console.error('Failed to delete receipt on reject:', error);
      throw new BadRequestException('Cannot delete receipt. It may have dependent data.');
    }

    return {
      message: 'Receipt deleted successfully on rejection',
      receiptId,
      status: 'deleted',
    };
  }

  async markAppointmentPaid(
    userId: number,
    appointmentId: number,
    slipUrl: string,
  ) {
    const appointment = await this.getOwnedAppointment(appointmentId, userId);

    if (appointment.status === pay_type_enum.Paid) {
      return {
        message: 'Appointment is already marked as paid',
        appointmentId,
        status: pay_type_enum.Paid,
      };
    }

    if (appointment.status === pay_type_enum.Pending) {
      return {
        message: 'Appointment is already pending verification',
        appointmentId,
        status: pay_type_enum.Pending,
      };
    }

    const appointmentDate = appointment.appointment_date
      ? this.dateToIsoDate(appointment.appointment_date)
      : null;
    const parsedRange = this.tryParseTimeRange(appointment.time_select);

    if (this.isPastAppointment(appointmentDate, parsedRange)) {
      throw new BadRequestException(
        'Cannot update payment for an appointment that has already ended',
      );
    }

    await this.prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        status: pay_type_enum.Pending,
        deposit_slip_file: slipUrl,
      },
    });

    return {
      message: 'Payment slip uploaded successfully, awaiting verification',
      appointmentId,
      status: pay_type_enum.Pending,
    };
  }

  private async getOwnedAppointment(appointmentId: number, userId: number) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        user_id: true,
        staff_id: true,
        status: true,
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
    const parsedNew = this.tryParseTimeRange(input.timeSelect);
    if (!parsedNew) {
      throw new BadRequestException('Invalid timeSelect format');
    }

    const startMin = parsedNew.startMinutes;
    const endMin = parsedNew.endMinutes;

    // Fetch overlapping appointments for the user
    const userAppointments = await this.prisma.appointments.findMany({
      where: {
        user_id: input.userId,
        appointment_date: input.dateValue,
        NOT: { id: input.appointmentId },
      },
      select: { time_select: true },
    });

    const hasUserConflict = userAppointments.some((a) => {
      const r = this.tryParseTimeRange(a.time_select);
      if (!r) return false;
      return startMin < r.endMinutes && endMin > r.startMinutes;
    });

    if (hasUserConflict) {
      throw new BadRequestException(
        'ไม่สามารถนัดหมายได้ เนื่องจากมีนัดหมายในช่วงเวลานี้แล้ว',
      );
    }

    // Fetch overlapping appointments for the staff
    if (input.staffId) {
      const staffAppointments = await this.prisma.appointments.findMany({
        where: {
          staff_id: input.staffId,
          appointment_date: input.dateValue,
          NOT: { id: input.appointmentId },
        },
        select: { time_select: true },
      });

      const hasStaffConflict = staffAppointments.some((a) => {
        const r = this.tryParseTimeRange(a.time_select);
        if (!r) return false;
        return startMin < r.endMinutes && endMin > r.startMinutes;
      });

      if (hasStaffConflict) {
        throw new BadRequestException(
          'This consultant is not available in this slot',
        );
      }

      const leaveRecord = await this.prisma.schedule.findUnique({
        where: {
          staff_id_work_date: {
            staff_id: input.staffId,
            work_date: input.dateValue,
          },
        },
      });

      if (
        leaveRecord?.status === 'leave' ||
        leaveRecord?.status === 'holiday'
      ) {
        throw new BadRequestException(
          'This consultant is unavailable for the selected date',
        );
      }
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

    if (paymentStatus === pay_type_enum.Pending) {
      return 'waiting';
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
      throw new BadRequestException(
        'appointmentDate must be in YYYY-MM-DD format',
      );
    }

    const asDate = new Date(`${trimmed}T00:00:00.000Z`);

    if (
      Number.isNaN(asDate.getTime()) ||
      this.dateToIsoDate(asDate) !== trimmed
    ) {
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

  async deleteMeetUrl(staffId: number, appointmentId: number) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
      select: { id: true, staff_id: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.staff_id !== staffId) {
      throw new ForbiddenException(
        'You do not have permission to update this appointment',
      );
    }

    await this.prisma.appointments.update({
      where: { id: appointmentId },
      data: { meet_url: null },
    });

    return { message: 'Meet URL deleted successfully', appointmentId };
  }

  async updateMeetUrl(staffId: number, appointmentId: number, meetUrl: string) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
      select: { id: true, staff_id: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.staff_id !== staffId) {
      throw new ForbiddenException(
        'You do not have permission to update this appointment',
      );
    }

    await this.prisma.appointments.update({
      where: { id: appointmentId },
      data: { meet_url: meetUrl },
    });

    return { message: 'Meet URL updated successfully', appointmentId, meetUrl };
  }

  async findAllByStaff(staffId: number): Promise<StaffAppointmentItem[]> {
    const records = await this.prisma.appointments.findMany({
      where: {
        staff_id: staffId,
      },
      include: {
        users_appointments_user_idTousers: {
          select: {
            user_id: true,
            name: true,
            sur_name: true,
          },
        },
      },
      orderBy: [
        {
          appointment_date: 'asc',
        },
        {
          time_select: 'asc',
        },
      ],
    });

    return records.map((record) => ({
      id: record.id,
      staffId: record.staff_id ?? null,
      patientId: record.user_id ?? null,
      patientName: this.buildPatientName(
        record.users_appointments_user_idTousers?.name,
        record.users_appointments_user_idTousers?.sur_name,
        record.users_appointments_user_idTousers?.user_id ??
        record.user_id ??
        null,
      ),
      appointmentDate: record.appointment_date
        ? this.dateToIsoDate(record.appointment_date)
        : null,
      timeSelect: record.time_select ?? null,
      appointmentType: record.appointment_type ?? null,
      paymentStatus: record.status ?? null,
      depositSlipFile: record.deposit_slip_file ?? null,
      meetUrl: record.meet_url ?? null,
    }));
  }

  async payMedicine(userId: number, appointmentId: number, slipUrl: string) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.user_id !== userId) {
      throw new ForbiddenException('Appointment does not belong to this user');
    }

    if (!appointment.user_id || !appointment.staff_id) {
      throw new BadRequestException('Appointment data is incomplete');
    }

    // Find the consultation matching this appointment
    const consultation = await this.prisma.consultations.findFirst({
      where: {
        user_id: appointment.user_id,
        staff_id: appointment.staff_id,
      },
      orderBy: { created_at: 'desc' },
      include: {
        receipts: true,
      },
    });

    if (!consultation) {
      throw new NotFoundException('No consultation found for this appointment');
    }

    const receipt = consultation.receipts?.[0];
    if (!receipt) {
      throw new NotFoundException('No receipt found for this consultation');
    }

    // Update the receipt with the slip file
    await this.prisma.receipts.update({
      where: { id: receipt.id },
      data: {
        slip_file: slipUrl,
        payment_status: 'Pending',
      } as any,
    });

    return {
      message: 'Medicine payment slip uploaded successfully',
      receiptId: receipt.id,
    };
  }

  async getConsultationForAppointment(userId: number, id: number) {
    let consultation = await this.prisma.consultations.findUnique({
      where: { id: id, user_id: userId },
      include: {
        prescription_items: {
          include: {
            medications: true,
          },
        },
        receipts: {
          include: {
            receipt_details: {
              include: {
                medications: true,
              },
            },
          },
        },
      },
    });

    if (!consultation) {
      const appointment = await this.prisma.appointments.findUnique({
        where: { id: id, user_id: userId },
      });

      if (appointment) {
        consultation = await this.prisma.consultations.findFirst({
          where: {
            user_id: userId,
            staff_id: appointment.staff_id,
          },
          orderBy: { created_at: 'desc' },
          include: {
            prescription_items: {
              include: {
                medications: true,
              },
            },
            receipts: {
              include: {
                receipt_details: {
                  include: {
                    medications: true,
                  },
                },
              },
            },
          },
        });
      }
    }

    if (!consultation) {
      return { consultation: null, prescriptionItems: [], receipt: null, receiptDetails: [] };
    }

    const prescriptionItems = consultation.prescription_items.map((item) => ({
      id: item.id,
      medicationName: item.medications?.name ?? '-',
      quantity: item.quantity ?? 0,
      comment: item.comment ?? '',
      price: item.medications?.retail ? Number(item.medications.retail) : (item.medications?.price ? Number(item.medications.price) : 0),
    }));

    const receipt = consultation.receipts?.[0] ?? null;
    const receiptDetails = receipt?.receipt_details?.map((d) => ({
      id: d.id,
      itemName: d.item_name ?? '-',
      itemType: d.item_type ?? null,
      quantity: d.quantity ?? 0,
      unitPrice: d.unit_price ? Number(d.unit_price) : 0,
      totalPrice: d.total_price ? Number(d.total_price) : 0,
    })) ?? [];

    const serviceFee = receiptDetails
      .filter((d) => d.itemType === 'fee' || d.itemType === 'service')
      .reduce((sum, d) => sum + d.totalPrice, 0);

    const medicineCost = receiptDetails
      .filter((d) => d.itemType === 'medicine')
      .reduce((sum, d) => sum + d.totalPrice, 0);

    return {
      consultation: {
        id: consultation.id,
        note: consultation.note ?? '',
        createdAt: consultation.created_at,
      },
      prescriptionItems,
      receipt: receipt ? {
        id: receipt.id,
        total: receipt.total ? Number(receipt.total) : 0,
        status: receipt.status,
        tracking: receipt.tracking,
      } : null,
      receiptDetails,
      serviceFee,
      medicineCost,
    };
  }

  private buildPatientName(
    firstName?: string | null,
    lastName?: string | null,
    patientId?: number | null,
  ): string {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    if (fullName) {
      return fullName;
    }

    if (patientId) {
      return `ผู้ป่วย #${patientId}`;
    }

    return 'ผู้ป่วย';
  }
}
