import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, receipt_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

// Define needed types locally
export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Waiting'
  | 'Paid'
  | 'Not_paying';

export interface AppointmentScheduleItem {
  id: number;
  appointmentId?: number | null;
  consultationId?: number | null;
  staffId: number | null;
  consultantName: string;
  appointmentDate: string | null;
  timeSelect: string | null;
  contact: string;
  status: string;
  avatarLabel: string;
  avatarUrl: string | null;
  appointmentType: string | null;
  paymentStatus: string | null;
  medicinePaymentStatus: string | null;
  receiptId: number | null;
  totalPrice: number | null;
  meetLink: string | null;
  hasPrescription: boolean;
  hasConsultation: boolean;
}

export interface AppointmentScheduleResponse {
  upcoming: AppointmentScheduleItem[];
  past: AppointmentScheduleItem[];
}

interface TimeRange {
  startMinutes: number;
  endMinutes: number;
}

interface GetAvailableSlotsOptions {
  excludeAppointmentId?: number;
  staffId?: number;
  durationMins?: number;
  requestUserId?: number;
}

@Injectable()
export class AppointmentsService {
  private readonly clinicTimeSlots: string[] = [
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

  constructor(private readonly prisma: PrismaService) {}

  // --- Helper Methods ---
  private dateToIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private tryParseTimeRange(timeSelect: string | null): TimeRange | null {
    if (!timeSelect) return null;
    const match = timeSelect.match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/);
    if (!match) return null;
    return {
      startMinutes: parseInt(match[1]) * 60 + parseInt(match[2]),
      endMinutes: parseInt(match[3]) * 60 + parseInt(match[4]),
    };
  }

  private minutesToTimeText(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private toDateOnlyUtc(dateKey: string): Date {
    return new Date(`${dateKey}T00:00:00.000Z`);
  }

  private expandRangeToSlotStarts(range: TimeRange): string[] {
    const slots: string[] = [];

    for (
      let minute = range.startMinutes;
      minute < range.endMinutes;
      minute += 30
    ) {
      slots.push(this.minutesToTimeText(minute));
    }

    return slots;
  }

  private isOverlappingRange(a: TimeRange, b: TimeRange): boolean {
    return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
  }

  private async ensureStaffTimeAvailable(
    staffId: number | null | undefined,
    appointmentDate: string | Date,
    timeSelect: string,
    excludedAppointmentId?: number,
  ) {
    if (!staffId) {
      throw new BadRequestException('Staff is required');
    }

    const requestedRange = this.tryParseTimeRange(timeSelect);

    if (!requestedRange) {
      throw new BadRequestException('Invalid time range');
    }

    const targetDate =
      appointmentDate instanceof Date
        ? new Date(appointmentDate)
        : new Date(appointmentDate);

    if (Number.isNaN(targetDate.getTime())) {
      throw new BadRequestException('Invalid appointment date');
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointments.findMany({
      where: {
        staff_id: staffId,
        appointment_date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'Not_paying' },
        ...(excludedAppointmentId
          ? { id: { not: excludedAppointmentId } }
          : {}),
      },
      select: {
        id: true,
        time_select: true,
      },
    });

    const hasConflict = appointments.some((appointment) => {
      const occupiedRange = this.tryParseTimeRange(appointment.time_select);
      return occupiedRange
        ? this.isOverlappingRange(requestedRange, occupiedRange)
        : false;
    });

    if (hasConflict) {
      throw new BadRequestException(
        'Selected time slot is no longer available',
      );
    }
  }

  private async ensureStaffScheduleAvailable(
    staffId: number | null | undefined,
    appointmentDate: string | Date,
  ) {
    if (!staffId) {
      throw new BadRequestException('Staff is required');
    }

    const dateKey =
      appointmentDate instanceof Date
        ? this.dateToIsoDate(appointmentDate)
        : appointmentDate;

    const scheduleEntry = await this.prisma.schedule.findUnique({
      where: {
        staff_id_work_date: {
          staff_id: staffId,
          work_date: this.toDateOnlyUtc(dateKey),
        },
      },
      select: {
        status: true,
      },
    });

    if (scheduleEntry?.status && scheduleEntry.status !== 'working') {
      throw new BadRequestException(
        'Staff is not available on the selected date',
      );
    }
  }

  private async ensureUserTimeAvailable(
    userId: number | null | undefined,
    appointmentDate: string | Date,
    timeSelect: string,
    excludedAppointmentId?: number,
  ) {
    if (!userId) {
      return;
    }

    const requestedRange = this.tryParseTimeRange(timeSelect);

    if (!requestedRange) {
      throw new BadRequestException('Invalid time range');
    }

    const targetDate =
      appointmentDate instanceof Date
        ? new Date(appointmentDate)
        : new Date(appointmentDate);

    if (Number.isNaN(targetDate.getTime())) {
      throw new BadRequestException('Invalid appointment date');
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const userAppointments = await this.prisma.appointments.findMany({
      where: {
        user_id: userId,
        appointment_date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'Not_paying' },
        ...(excludedAppointmentId
          ? { id: { not: excludedAppointmentId } }
          : {}),
      },
      select: {
        id: true,
        time_select: true,
      },
    });

    const hasConflict = userAppointments.some((appointment) => {
      const occupiedRange = this.tryParseTimeRange(appointment.time_select);
      return occupiedRange
        ? this.isOverlappingRange(requestedRange, occupiedRange)
        : false;
    });

    if (hasConflict) {
      throw new BadRequestException(
        'You already have another appointment during the selected time',
      );
    }
  }

  private buildConsultantName(name?: string, sur_name?: string): string {
    if (!name && !sur_name) return 'Unknown Consultant';
    return `${name || ''} ${sur_name || ''}`.trim();
  }

  private buildPatientName(
    title?: string | null,
    name?: string | null,
    sur_name?: string | null,
    userId?: number,
  ): string {
    if (!name && !sur_name) return `Patient #${userId}`;
    return `${title ? title + ' ' : ''}${name || ''} ${sur_name || ''}`.trim();
  }

  private toAvatarLabel(name?: string, sur_name?: string): string {
    const n = (name || '').charAt(0);
    const s = (sur_name || '').charAt(0);
    return (n + s).toUpperCase() || '?';
  }

  private toDisplayStatus(status: string | null, isPast: boolean): string {
    if (isPast) return 'เสร็จสิ้น';
    switch (status) {
      case 'Paid':
        return 'ยืนยันแล้ว';
      case 'Pending':
        return 'รอการตรวจสอบ';
      case 'Not_paying':
        return 'ถูกปฏิเสธ';
      default:
        return 'รอชำระเงิน';
    }
  }

  private getSortValue(
    dateStr: string | null,
    timeRange: TimeRange | null,
  ): number {
    if (!dateStr) return Number.MAX_SAFE_INTEGER;
    const datePart = parseInt(dateStr.replace(/-/g, ''));
    const timePart = timeRange?.startMinutes ?? 0;
    return datePart * 10000 + timePart;
  }

  // --- Core Methods ---
  async getMySchedule(userId: number): Promise<AppointmentScheduleResponse> {
    const clinicMeetUrl = process.env.CLINIC_MEET_URL ?? null;

    // 1. Fetch upcoming appointments
    const appointmentRecords = await this.prisma.appointments.findMany({
      where: { user_id: userId },
      include: {
        users_appointments_staff_idTousers: {
          select: { name: true, sur_name: true, email: true, file_name: true },
        },
      },
    });

    // 2. Fetch consultations for this user
    const consultationRecords = (await this.prisma.consultations.findMany({
      where: { user_id: userId },
      include: {
        users_consultations_staff_idTousers: {
          select: { name: true, sur_name: true, email: true, file_name: true },
        },
        appointments: {
          select: { time_select: true, appointment_type: true, status: true },
        },
        _count: { select: { prescription_items: true } },
        receipts: {
          include: { receipt_details: true },
          orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    })) as any[];

    const consultedAppointmentIds = new Set(
      consultationRecords
        .map((c) => c.appointment_id)
        .filter((id) => id !== null),
    );

    const upcomingMapped = appointmentRecords
      .map((record) => {
        // If this appointment already has a consultation, it belongs in "Past"
        if (consultedAppointmentIds.has(record.id)) return null;

        const appointmentDate = record.appointment_date
          ? this.dateToIsoDate(record.appointment_date)
          : null;
        const parsedRange = this.tryParseTimeRange(record.time_select);

        return {
          item: {
            id: record.id,
            appointmentId: record.id,
            consultationId: null,
            staffId: record.staff_id,
            consultantName: this.buildConsultantName(
              record.users_appointments_staff_idTousers?.name,
              record.users_appointments_staff_idTousers?.sur_name,
            ),
            appointmentDate,
            timeSelect: record.time_select ?? null,
            contact: record.users_appointments_staff_idTousers?.email ?? '-',
            status: this.toDisplayStatus(record.status, false),
            avatarLabel: this.toAvatarLabel(
              record.users_appointments_staff_idTousers?.name,
              record.users_appointments_staff_idTousers?.sur_name,
            ),
            avatarUrl:
              record.users_appointments_staff_idTousers?.file_name ?? null,
            appointmentType: record.appointment_type ?? null,
            paymentStatus: record.status ?? null,
            medicinePaymentStatus: null,
            meetLink:
              record.appointment_type === 'online'
                ? record.meet_url || clinicMeetUrl
                : null,
            hasPrescription: false,
            hasConsultation: false,
          },
          sortValue: this.getSortValue(appointmentDate, parsedRange),
        };
      })
      .filter((entry): entry is any => entry !== null)
      .sort((a, b) => a.sortValue - b.sortValue)
      .map((entry) => entry.item);

    const pastMapped = consultationRecords
      .map((c: any) => {
        const dateKey = this.dateToIsoDate(c.created_at);
        const firstReceipt = c.receipts?.[0];
        const medicineTotal = firstReceipt?.receipt_details
          ? firstReceipt.receipt_details
              .filter((d: any) => d.item_type === 'medicine')
              .reduce(
                (sum: number, d: any) => sum + Number(d.total_price || 0),
                0,
              )
          : null;

        return {
          item: {
            id: c.id,
            appointmentId: c.appointment_id ?? null,
            consultationId: c.id,
            staffId: c.staff_id,
            consultantName: this.buildConsultantName(
              c.users_consultations_staff_idTousers?.name,
              c.users_consultations_staff_idTousers?.sur_name,
            ),
            appointmentDate: dateKey,
            timeSelect: c.appointments?.time_select ?? null,
            contact: c.users_consultations_staff_idTousers?.email ?? '-',
            status: 'เสร็จสิ้น',
            avatarLabel: this.toAvatarLabel(
              c.users_consultations_staff_idTousers?.name,
              c.users_consultations_staff_idTousers?.sur_name,
            ),
            avatarUrl: c.users_consultations_staff_idTousers?.file_name ?? null,
            appointmentType: c.appointments?.appointment_type ?? null,
            paymentStatus: c.appointments?.status ?? 'Paid',
            medicinePaymentStatus: firstReceipt?.payment_status ?? null,
            receiptId: firstReceipt?.id ?? null,
            totalPrice: medicineTotal,
            meetLink: null,
            hasPrescription: (c._count?.prescription_items || 0) > 0,
            hasConsultation: true,
          },
          sortValue: this.getSortValue(dateKey, null),
        };
      })
      .map((entry) => entry.item);

    return { upcoming: upcomingMapped, past: pastMapped };
  }

  async getAvailableSlots(
    date: string,
    userId: number,
    options: GetAvailableSlotsOptions = {},
  ): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointments.findMany({
      where: {
        appointment_date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'Not_paying' },
        ...(options.excludeAppointmentId
          ? { id: { not: options.excludeAppointmentId } }
          : {}),
      },
    });

    const bookedSlots = appointments.flatMap((appointment) => {
      if (!appointment.staff_id) {
        return [];
      }

      const range = this.tryParseTimeRange(appointment.time_select);

      if (!range) {
        return appointment.time_select
          ? [`${appointment.staff_id}_${appointment.time_select}`]
          : [];
      }

      return this.expandRangeToSlotStarts(range).map(
        (slot) => `${appointment.staff_id}_${slot}`,
      );
    });

    if (!options.staffId || !options.durationMins) {
      return { bookedSlots };
    }

    const scheduleEntry = await this.prisma.schedule.findUnique({
      where: {
        staff_id_work_date: {
          staff_id: options.staffId,
          work_date: this.toDateOnlyUtc(date),
        },
      },
      select: {
        status: true,
      },
    });

    if (scheduleEntry?.status && scheduleEntry.status !== 'working') {
      return { bookedSlots, availableTimes: [] };
    }

    const occupiedSlots = new Set(
      bookedSlots
        .filter((booking) => booking.startsWith(`${options.staffId}_`))
        .map((booking) => booking.slice(`${options.staffId}_`.length))
        .filter((slot) => /^\d{2}:\d{2}$/.test(slot)),
    );

    let availableTimes = this.clinicTimeSlots.filter(
      (slot) => !occupiedSlots.has(slot),
    );

    if (options.requestUserId) {
      const userAppointments = await this.prisma.appointments.findMany({
        where: {
          user_id: options.requestUserId,
          appointment_date: { gte: startOfDay, lte: endOfDay },
          status: { not: 'Not_paying' },
          ...(options.excludeAppointmentId
            ? { id: { not: options.excludeAppointmentId } }
            : {}),
        },
        select: {
          time_select: true,
        },
      });

      const userOccupiedSlots = new Set(
        userAppointments.flatMap((appointment) => {
          const range = this.tryParseTimeRange(appointment.time_select);
          return range ? this.expandRangeToSlotStarts(range) : [];
        }),
      );

      availableTimes = availableTimes.filter(
        (slot) => !userOccupiedSlots.has(slot),
      );
    }

    if (options.durationMins === 60) {
      availableTimes = availableTimes.filter((slot) => {
        const [hh, mm] = slot.split(':').map(Number);
        const nextSlot = this.minutesToTimeText(hh * 60 + mm + 30);
        return availableTimes.includes(nextSlot);
      });
    }

    return { bookedSlots, availableTimes };
  }

  async getAllPaidAppointments(): Promise<any[]> {
    // Fetch all fees to map by id manually
    const fees = await this.prisma.fees.findMany();
    const feeMap = new Map(
      fees.map((f) => [f.id, Number(f.price_per_hours || 0)]),
    );

    // Admin needs to see all appointments for verification history
    const appointments = (await this.prisma.appointments.findMany({
      include: {
        users_appointments_user_idTousers: {
          select: { name: true, sur_name: true, user_id: true, title: true },
        },
        users_appointments_staff_idTousers: {
          include: {
            roles: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    })) as any[];

    const defaultRate = 500;

    return appointments.map((a) => {
      let amount = defaultRate;
      const range = this.tryParseTimeRange(a.time_select);
      if (range) {
        const durationHours = (range.endMinutes - range.startMinutes) / 60;
        const feeId = a.users_appointments_staff_idTousers?.roles?.fee_id;
        const hourlyRate =
          feeId && feeMap.has(feeId) ? feeMap.get(feeId)! : defaultRate;
        amount = durationHours * hourlyRate;
      }

      return {
        id: a.id,
        patientName: this.buildPatientName(
          a.users_appointments_user_idTousers?.title,
          a.users_appointments_user_idTousers?.name,
          a.users_appointments_user_idTousers?.sur_name,
          a.users_appointments_user_idTousers?.user_id || a.user_id || 0,
        ),
        staffName: this.buildConsultantName(
          a.users_appointments_staff_idTousers?.name,
          a.users_appointments_staff_idTousers?.sur_name,
        ),
        date: a.appointment_date
          ? this.dateToIsoDate(a.appointment_date)
          : null,
        time: a.time_select,
        appointmentType: a.appointment_type,
        status: a.status,
        slipUrl: a.deposit_slip_file,
        amount,
      };
    });
  }

  async getAllMedicinePayments(): Promise<any[]> {
    const receipts = await this.prisma.receipts.findMany({
      where: { payment_status: { in: ['Not_paying', 'Pending'] } },
      include: {
        users: {
          select: {
            user_id: true,
            title: true,
            name: true,
            sur_name: true,
            phone: true,
            nation_id: true,
          },
        },
        consultations: {
          include: {
            appointments: {
              select: { appointment_date: true, appointment_type: true },
            },
            users_consultations_staff_idTousers: {
              select: { name: true, sur_name: true },
            },
            prescription_items: { include: { medications: true } },
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });

    return receipts
      .map((r) => {
        const items =
          r.consultations?.prescription_items.map((p) => ({
            name: p.medications?.name || 'Unknown',
            quantity: p.quantity || 0,
            unitPrice: p.medications?.price ? Number(p.medications.price) : 0,
            totalPrice:
              (p.medications?.price ? Number(p.medications.price) : 0) *
              (p.quantity || 0),
          })) || [];
        const medicineCost = items.reduce(
          (sum, item) => sum + item.totalPrice,
          0,
        );
        const hasPrescription = items.length > 0;

        return {
          id: r.id,
          user_id: r.user_id,
          total: r.total ? Number(r.total) : medicineCost,
          created_at: r.created_at,
          date:
            r.consultations?.appointments?.appointment_date?.toISOString() ??
            null,
          appointmentType:
            r.consultations?.appointments?.appointment_type ?? 'onsite',
          patientName: this.buildPatientName(
            r.users?.title,
            r.users?.name,
            r.users?.sur_name,
            r.users?.user_id || r.user_id || 0,
          ),
          phone: r.users?.phone ?? null,
          nation_id: r.users?.nation_id ?? null,
          staffName: this.buildConsultantName(
            r.consultations?.users_consultations_staff_idTousers?.name,
            r.consultations?.users_consultations_staff_idTousers?.sur_name,
          ),
          medicineCost,
          hasPrescription,
          slipUrl: r.slip_file ?? null,
          status: r.status ?? null,
          paymentStatus: r.payment_status ?? null,
          tracking: r.tracking ?? null,
          payment_status: r.payment_status,
          medicineItems: items,
          receipt_details: [],
        };
      })
      .filter((receipt) => receipt.hasPrescription);
  }

  async getMedicinePaymentDetails(
    userId: number,
    receiptId: number,
  ): Promise<any> {
    const receipt = await this.prisma.receipts.findUnique({
      where: { id: receiptId },
      include: {
        consultations: {
          include: {
            prescription_items: { include: { medications: true } },
          },
        },
      },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async createAppointment(userId: number, data: any) {
    const appointmentDate = data.appointmentDate ?? data.date;
    if (!appointmentDate) {
      throw new BadRequestException('appointmentDate is required');
    }

    await this.ensureStaffScheduleAvailable(data.staffId, appointmentDate);
    await this.ensureStaffTimeAvailable(
      data.staffId,
      appointmentDate,
      data.timeSelect,
    );
    await this.ensureUserTimeAvailable(
      userId,
      appointmentDate,
      data.timeSelect,
    );

    return this.prisma.appointments.create({
      data: {
        user_id: userId,
        staff_id: data.staffId,
        appointment_date: new Date(appointmentDate),
        time_select: data.timeSelect,
        appointment_type: data.appointmentType,
        status: 'Pending',
      },
    });
  }

  async createWalkinUser(data: any) {
    return this.prisma.users.create({
      data: {
        name: data.name,
        sur_name: data.sur_name,
        phone: data.phone,
        nation_id: data.nation_id,
        medical_condition: data.medical_condition,
        allergy_drug: data.allergy_drug,
        // Removed unsupported current_address and nation_address for now as per schema error
        role_id: 2,
      },
    });
  }

  async rescheduleAppointment(
    userId: number,
    appointmentId: number,
    dto: RescheduleAppointmentDto,
  ) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        staff_id: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.ensureStaffScheduleAvailable(
      appointment.staff_id,
      dto.appointmentDate,
    );
    await this.ensureStaffTimeAvailable(
      appointment.staff_id,
      dto.appointmentDate,
      dto.timeSelect,
      appointmentId,
    );
    await this.ensureUserTimeAvailable(
      userId,
      dto.appointmentDate,
      dto.timeSelect,
      appointmentId,
    );

    return this.prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        appointment_date: new Date(dto.appointmentDate),
        time_select: dto.timeSelect,
        status: 'Pending',
      },
    });
  }

  async deleteMeetUrl(staffId: number, appointmentId: number) {
    return this.prisma.appointments.update({
      where: { id: appointmentId },
      data: { meet_url: null },
    });
  }

  async updateMeetUrl(staffId: number, appointmentId: number, meetUrl: string) {
    return this.prisma.appointments.update({
      where: { id: appointmentId },
      data: { meet_url: meetUrl },
    });
  }

  async confirmPayment(appointmentId: number) {
    return this.prisma.appointments.update({
      where: { id: appointmentId },
      data: { status: 'Paid' } as any,
    });
  }

  async rejectPayment(appointmentId: number) {
    return this.prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        status: 'Not_paying',
        deposit_slip_file: null,
      } as any,
    });
  }

  async confirmMedicinePayment(receiptId: number, slipUrl?: string) {
    const receipt = await this.prisma.receipts.findUnique({
      where: { id: receiptId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (
      receipt.status !== receipt_status.pending_delivery &&
      receipt.status !== receipt_status.picked_up
    ) {
      throw new BadRequestException(
        'Medicine payment can only be confirmed for pending delivery or picked up receipts',
      );
    }

    return this.prisma.receipts.update({
      where: { id: receiptId },
      data: {
        payment_status: 'Paid',
        slip_file: slipUrl,
      } as any,
    });
  }

  async rejectMedicinePayment(receiptId: number) {
    return this.prisma.receipts.update({
      where: { id: receiptId },
      data: { payment_status: 'Not_paying' } as any,
    });
  }

  async markAppointmentPaid(
    userId: number,
    appointmentId: number,
    slipUrl: string,
    isAdmin: boolean,
  ) {
    return this.prisma.appointments.update({
      where: { id: appointmentId },
      data: { status: 'Pending', deposit_slip_file: slipUrl } as any,
    });
  }

  async payMedicine(
    userId: number,
    appointmentId: number,
    slipUrl: string,
    isAdmin: boolean,
  ) {
    // Note: Found by searching receipts for this consultation/user
    const consultation = await this.prisma.consultations.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { receipts: true },
    });
    if (!consultation || !consultation.receipts[0])
      throw new NotFoundException('No recent medicine receipt found');
    return this.prisma.receipts.update({
      where: { id: consultation.receipts[0].id },
      data: { payment_status: 'Pending', slip_file: slipUrl } as any,
    });
  }

  async payMedicineByReceipt(
    userId: number,
    receiptId: number,
    slipUrl: string,
  ) {
    return this.prisma.receipts.update({
      where: { id: receiptId },
      data: { payment_status: 'Pending', slip_file: slipUrl } as any,
    });
  }

  async getAppointmentDetails(
    userId: number,
    appointmentId: number,
    isAdmin: boolean,
  ) {
    const fees = await this.prisma.fees.findMany();
    const feeMap = new Map(
      fees.map((f) => [f.id, Number(f.price_per_hours || 0)]),
    );
    const appt = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
      include: {
        users_appointments_staff_idTousers: {
          include: {
            roles: true,
          },
        },
      },
    });
    if (!appt) throw new NotFoundException('Appointment not found');

    const timeRange = this.tryParseTimeRange(appt.time_select);
    const durationMinutes = timeRange
      ? timeRange.endMinutes - timeRange.startMinutes
      : 0;
    const defaultRate = 500;
    const feeId = appt.users_appointments_staff_idTousers?.roles?.fee_id;
    const hourlyRate =
      feeId && feeMap.has(feeId) ? feeMap.get(feeId)! : defaultRate;
    const price =
      durationMinutes > 0 ? (durationMinutes / 60) * hourlyRate : defaultRate;
    const staffName = this.buildConsultantName(
      appt.users_appointments_staff_idTousers?.name,
      appt.users_appointments_staff_idTousers?.sur_name,
    );

    return {
      ...appt,
      consultantName: staffName,
      staffName,
      date: appt.appointment_date
        ? this.dateToIsoDate(appt.appointment_date)
        : null,
      time: appt.time_select ?? null,
      duration: durationMinutes,
      price,
    };
  }

  async getConsultationForAppointment(
    userId: number,
    appointmentId: number,
    receiptId?: number,
  ) {
    const appt = await this.prisma.appointments.findFirst({
      where: {
        id: appointmentId,
        user_id: userId,
      },
      include: {
        users_appointments_staff_idTousers: {
          include: {
            roles: true,
          },
        },
      },
    });
    if (!appt || !appt.appointment_date) {
      throw new NotFoundException('Appointment or date not found');
    }

    const startOfDay = new Date(appt.appointment_date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appt.appointment_date);
    endOfDay.setHours(23, 59, 59, 999);

    const consultationLookupConditions: Prisma.consultationsWhereInput[] = [
      { appointment_id: appointmentId },
    ];
    if (appt.staff_id !== null) {
      consultationLookupConditions.push({
        appointment_id: null,
        staff_id: appt.staff_id,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

    const consultation = await this.prisma.consultations.findFirst({
      where: {
        user_id: userId,
        OR: consultationLookupConditions,
      },
      orderBy: { created_at: 'desc' },
      include: {
        prescription_items: { include: { medications: true } },
        receipts: {
          include: { receipt_details: true },
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    if (!consultation) {
      return {
        consultation: null,
        prescriptionItems: [],
        receipt: null,
        receiptDetails: [],
        serviceFee: 0,
        medicineCost: 0,
      };
    }

    const fallbackReceipt = consultation.receipts?.[0] ?? null;
    const selectedReceipt = receiptId
      ? await this.prisma.receipts.findFirst({
          where: {
            id: receiptId,
            consultation_id: consultation.id,
            user_id: userId,
          },
          include: { receipt_details: true },
        })
      : fallbackReceipt;
    const receipt = selectedReceipt ?? fallbackReceipt;

    const receiptDetails = (receipt?.receipt_details ?? []).map(
      (detail: any) => ({
        id: detail.id,
        itemName: detail.item_name ?? detail.name ?? '-',
        itemType: detail.item_type ?? null,
        quantity: Number(detail.quantity ?? 0),
        unitPrice: Number(detail.unit_price ?? 0),
        totalPrice: Number(detail.total_price ?? 0),
      }),
    );

    const medicineReceiptDetails = receiptDetails.filter(
      (detail) => detail.itemType === 'medicine',
    );

    const prescriptionItems = medicineReceiptDetails.map((detail) => ({
      id: detail.id,
      medicationName: detail.itemName,
      quantity: detail.quantity,
      comment: '',
      price: detail.unitPrice,
    }));

    const medicineCost = medicineReceiptDetails.reduce(
      (sum: number, detail) => sum + detail.totalPrice,
      0,
    );

    const fees = await this.prisma.fees.findMany();
    const feeMap = new Map(
      fees.map((f) => [f.id, Number(f.price_per_hours || 0)]),
    );
    const defaultRate = 500;
    const timeRange = this.tryParseTimeRange(appt.time_select);
    const durationHours = timeRange
      ? (timeRange.endMinutes - timeRange.startMinutes) / 60
      : 0;
    const feeId = appt.users_appointments_staff_idTousers?.roles?.fee_id;
    const hourlyRate =
      feeId && feeMap.has(feeId) ? feeMap.get(feeId)! : defaultRate;
    const serviceFee =
      durationHours > 0 ? durationHours * hourlyRate : defaultRate;

    return {
      consultation: {
        id: consultation.id,
        note: consultation.note ?? '',
        createdAt: consultation.created_at,
      },
      prescriptionItems,
      receipt: receipt
        ? {
            id: receipt.id,
            total: Number(receipt.total ?? 0) || serviceFee + medicineCost,
            status: receipt.payment_status ?? '-',
            tracking: receipt.tracking ?? null,
            slipUrl: receipt.slip_file ?? null,
          }
        : null,
      receiptDetails,
      serviceFee,
      medicineCost,
    };
  }

  async findByPatient(userId: number, staffId?: number) {
    const records = await this.prisma.appointments.findMany({
      where: {
        user_id: userId,
        ...(staffId ? { staff_id: staffId } : {}),
      },
      include: {
        users_appointments_staff_idTousers: {
          select: { name: true, sur_name: true },
        },
        consultations: { select: { appointment_id: true } },
      },
      orderBy: { appointment_date: 'asc' },
    });

    const consultedIds = new Set(
      records
        .flatMap((r) => r.consultations.map((c) => c.appointment_id))
        .filter(Boolean),
    );

    return records
      .filter((r) => !consultedIds.has(r.id))
      .map((r) => ({
        id: r.id,
        appointmentDate: r.appointment_date
          ? this.dateToIsoDate(r.appointment_date)
          : null,
        timeSelect: r.time_select,
        appointmentType: r.appointment_type,
      }));
  }

  async findAllByStaff(staffId: number) {
    const records = await this.prisma.appointments.findMany({
      where: { staff_id: staffId },
      include: {
        users_appointments_user_idTousers: {
          select: { name: true, sur_name: true, title: true },
        },
        consultations: { select: { id: true, appointment_id: true } },
      },
      orderBy: { appointment_date: 'asc' },
    });

    const consultationAppointmentIds = new Set(
      records
        .flatMap((r) => r.consultations.map((c) => c.appointment_id))
        .filter(Boolean),
    );

    return records.map((r) => {
      const u = r.users_appointments_user_idTousers;
      const patientName = [u?.title, u?.name, u?.sur_name]
        .filter(Boolean)
        .join(' ');
      return {
        id: r.id,
        userId: r.user_id,
        staffId: r.staff_id,
        patientName,
        appointmentDate: r.appointment_date
          ? this.dateToIsoDate(r.appointment_date)
          : null,
        appointmentType: r.appointment_type,
        status: r.status,
        timeSelect: r.time_select,
        meetUrl: r.meet_url,
        hasConsultation: consultationAppointmentIds.has(r.id),
      };
    });
  }
}
