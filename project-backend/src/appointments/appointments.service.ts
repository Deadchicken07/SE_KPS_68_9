import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class AppointmentsService {
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

  async getAvailableSlots(date: string, userId: number): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointments.findMany({
      where: {
        appointment_date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'Not_paying' },
      },
    });

    const bookedSlots = appointments.map(
      (a) => `${a.staff_id}_${a.time_select}`,
    );
    return { bookedSlots };
  }

  async getAllPaidAppointments(): Promise<any[]> {
    // Fetch all fees to map by id manually
    const fees = await this.prisma.fees.findMany();
    const feeMap = new Map(fees.map((f) => [f.id, Number(f.price_per_hours || 0)]));

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
        date: a.appointment_date ? this.dateToIsoDate(a.appointment_date) : null,
        time: a.time_select,
        appointmentType: a.appointment_type,
        status: a.status,
        slipUrl: a.deposit_slip_file,
        amount,
      };
    });
  }

  async getAllMedicinePayments(): Promise<any[]> {
    const pendingReceipts = await this.prisma.receipts.findMany({
      where: { payment_status: { in: ['Not_paying', 'Pending'] } },
      include: {
        users: {
          select: { user_id: true, title: true, name: true, sur_name: true },
        },
        consultations: {
          include: {
            users_consultations_staff_idTousers: {
              select: { name: true, sur_name: true },
            },
            prescription_items: { include: { medications: true } },
          },
        },
      },
    });

    return pendingReceipts.map((r) => {
      const items =
        r.consultations?.prescription_items.map((p) => ({
          name: p.medications?.name || 'Unknown',
          quantity: p.quantity || 0,
          price: p.medications?.retail ? Number(p.medications.retail) : 0,
        })) || [];
      const medicineCost = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      return {
        id: r.id,
        appointmentType: 'onsite',
        patientName: this.buildPatientName(
          r.users?.title,
          r.users?.name,
          r.users?.sur_name,
          r.users?.user_id || r.user_id || 0,
        ),
        staffName: this.buildConsultantName(
          r.consultations?.users_consultations_staff_idTousers?.name,
          r.consultations?.users_consultations_staff_idTousers?.sur_name,
        ),
        medicineCost,
        payment_status: r.payment_status,
        medicineItems: items,
      };
    });
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
    return this.prisma.appointments.create({
      data: {
        user_id: userId,
        staff_id: data.staffId,
        appointment_date: new Date(data.appointmentDate),
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
    return this.prisma.receipts.update({
      where: { id: receiptId },
      data: {
        payment_status: 'Paid',
        status: 'picked_up',
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
      data: { status: 'Paid', deposit_slip_file: slipUrl } as any,
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
    const appt = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
      include: {
        users_appointments_staff_idTousers: {
          select: { name: true, sur_name: true, file_name: true, email: true },
        },
      },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    return {
      ...appt,
      consultantName: this.buildConsultantName(
        appt.users_appointments_staff_idTousers?.name,
        appt.users_appointments_staff_idTousers?.sur_name,
      ),
    };
  }

  async getConsultationForAppointment(userId: number, appointmentId: number) {
    const appt = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
    });
    if (!appt || !appt.appointment_date)
      throw new NotFoundException('Appointment or date not found');

    const startOfDay = new Date(appt.appointment_date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appt.appointment_date);
    endOfDay.setHours(23, 59, 59, 999);

    const consultation = await this.prisma.consultations.findFirst({
      where: {
        user_id: appt.user_id,
        staff_id: appt.staff_id,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        prescription_items: { include: { medications: true } },
        receipts: { include: { receipt_details: true } },
      },
    });
    return consultation;
  }

  async findByPatient(userId: number, staffId?: number) {
    return this.prisma.appointments.findMany({
      where: {
        user_id: userId,
        ...(staffId ? { staff_id: staffId } : {}),
      },
      include: {
        users_appointments_staff_idTousers: {
          select: { name: true, sur_name: true },
        },
      },
    });
  }

  async findAllByStaff(staffId: number) {
    return this.prisma.appointments.findMany({
      where: { staff_id: staffId },
      include: {
        users_appointments_user_idTousers: {
          select: { name: true, sur_name: true, title: true },
        },
      },
    });
  }
}
