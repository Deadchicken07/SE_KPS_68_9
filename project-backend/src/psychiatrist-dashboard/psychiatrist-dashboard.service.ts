import { Prisma } from '@prisma/client';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

type PsychiatristAppointment = {
  time: string;
  patient: string;
  id: string;
  type: string;
  status: string;
  summary: string;
};

type PsychiatristConsultation = {
  id: string;
  userId: string;
  status: string;
  note: string;
};

type ScheduleItem = {
  date: string;
  status: string;
  note: string;
};

type AssessmentItem = {
  patient: string;
  questionnaire: string;
  submittedAt: string;
  summary: string;
};

type MedicationReviewItem = {
  name: string;
  quantity: number;
};

type AppointmentRow = {
  id: number;
  user_id: number | null;
  appointment_type: string | null;
  status: string | null;
  appointment_date: Date | null;
  time_select: string | null;
  patient_name: string | null;
  patient_surname: string | null;
  medical_condition: string | null;
};

type PsychiatristDashboardResponse = {
  summaryCards: SummaryCard[];
  appointments: PsychiatristAppointment[];
  consultations: PsychiatristConsultation[];
  workSchedule: ScheduleItem[];
  recentAssessments: AssessmentItem[];
  medicationReview: MedicationReviewItem[];
};

@Injectable()
export class PsychiatristDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(staffId?: number): Promise<PsychiatristDashboardResponse> {
    if (!this.prisma.isDatabaseConfigured()) {
      throw new ServiceUnavailableException('DATABASE_URL is not configured');
    }

    const staffIds = await this.resolveStaffIds(staffId, [
      'Psychiatrist',
      'psychiatrist',
      'จิตแพทย์',
    ]);
    const today = startOfDay(new Date());
    const focusDateLiteral = await this.resolveFocusDate(staffIds);
    const scheduleStartDate = parseDateLiteralAsUtc(
      focusDateLiteral ?? formatDateLiteral(today),
    );

    const consultationFilter = staffIds.length
      ? { staff_id: { in: staffIds } }
      : {};
    const scheduleFilter = {
      work_date: { gte: scheduleStartDate },
      ...(staffIds.length ? { staff_id: { in: staffIds } } : {}),
    };

    const [todayAppointments, consultationRows, scheduleRows] = await Promise.all([
      staffIds.length && focusDateLiteral
        ? this.prisma.$queryRaw<AppointmentRow[]>(Prisma.sql`
            SELECT
              a.id,
              a.user_id,
              a.appointment_type::text AS appointment_type,
              a.status::text AS status,
              a.appointment_date,
              a.time_select,
              u.name AS patient_name,
              u.sur_name AS patient_surname,
              u.medical_condition
            FROM appointments a
            LEFT JOIN users u ON u.user_id = a.user_id
            WHERE a.staff_id IN (${Prisma.join(staffIds)})
              AND a.appointment_date = ${focusDateLiteral}::date
            ORDER BY a.time_select ASC, a.id ASC
            LIMIT 8
          `)
        : Promise.resolve<AppointmentRow[]>([]),
      this.prisma.consultations.findMany({
        where: consultationFilter,
        select: {
          id: true,
          user_id: true,
          note: true,
          created_at: true,
        },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        take: 12,
      }),
      this.prisma.schedule.findMany({
        where: scheduleFilter,
        select: {
          work_date: true,
          status: true,
          note: true,
        },
        orderBy: [{ work_date: 'asc' }],
        take: 3,
      }),
    ]);

    const openConsultations = consultationRows;

    const consultationIds = openConsultations.map((item) => item.id);
    const relatedUserIds = uniqueNumbers([
      ...todayAppointments.map((item) => item.user_id),
      ...openConsultations.map((item) => item.user_id),
    ]);

    const [medicationItems, recentResponses] = await Promise.all([
      consultationIds.length
        ? this.prisma.prescription_items.findMany({
            where: {
              consultation_id: { in: consultationIds },
            },
            select: {
              quantity: true,
              medications: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: [{ id: 'desc' }],
            take: 6,
          })
        : Promise.resolve([]),
      relatedUserIds.length
        ? this.prisma.responses.findMany({
            where: {
              user_id: { in: relatedUserIds },
            },
            select: {
              submitted_at: true,
              users: {
                select: {
                  name: true,
                  sur_name: true,
                },
              },
              questionnaires: {
                select: {
                  title: true,
                },
              },
            },
            orderBy: [{ submitted_at: 'desc' }, { id: 'desc' }],
            take: 3,
          })
        : Promise.resolve([]),
    ]);

    const appointments = todayAppointments.map((item) => {
      const typeLabel = formatPsychiatristAppointmentType(item.appointment_type);
      const patientName = formatFullName(item.patient_name, item.patient_surname);
      const condition = item.medical_condition;

      return {
        time: formatTimeLabel(item.time_select),
        patient: patientName,
        id: formatAppointmentCode(item.appointment_date, item.id),
        type: typeLabel,
        status: formatAppointmentPaymentStatus(item.status),
        summary: condition
          ? `ติดตามอาการด้าน ${condition} และประเมินการตอบสนองจากแผนเดิม`
          : `${typeLabel} เพื่อประเมินอาการและแผนรักษาต่อ`,
      };
    });

    const consultations = openConsultations.slice(0, 3).map((item) => ({
      id: formatConsultationCode(item.id),
      userId: formatUserCode(item.user_id),
      status: derivePsychiatristConsultationStatus(item.note, item.created_at),
      note: item.note ?? 'ยังไม่มีบันทึกเพิ่มเติมสำหรับเคสนี้',
    }));

    const workSchedule = scheduleRows.map((item) => ({
      date: formatThaiDate(item.work_date),
      status: formatStatusLabel(item.status),
      note:
        item.note ??
        (item.status === 'leave'
          ? 'วันลา ไม่เปิดรับนัดใหม่'
          : 'เปิดตารางตรวจตามเวลางานปกติ'),
    }));

    const recentAssessments = recentResponses.map((item) => ({
      patient: formatFullName(item.users?.name, item.users?.sur_name),
      questionnaire: item.questionnaires?.title ?? 'แบบประเมินล่าสุด',
      submittedAt: formatIsoDate(item.submitted_at),
      summary: buildAssessmentSummary(item.questionnaires?.title, item.submitted_at),
    }));

    const medicationReview = medicationItems.map((item) => ({
      name: item.medications?.name ?? 'รายการยาที่ยังไม่ระบุชื่อ',
      quantity: item.quantity ?? 0,
    }));

    const summaryCards: SummaryCard[] = [
      {
        label: 'นัดหมายวันนี้',
        value: String(todayAppointments.length),
        detail: 'appointments ของจิตแพทย์ที่ต้องเปิดดูในวันนี้',
      },
      {
        label: 'คิวตรวจพร้อมเริ่ม',
        value: String(
          todayAppointments.filter((item) =>
            ['confirmed', 'arrived', 'waiting'].includes(
              normalizeStatus(formatAppointmentPaymentStatus(item.status)),
            ),
          ).length,
        ),
        detail: 'สรุปจากสถานะนัดหมายที่พร้อมเข้าตรวจต่อได้',
      },
      {
        label: 'เคสรอปิด consultation',
        value: String(openConsultations.length),
        detail: 'consultations ที่ยังไม่อยู่ในสถานะปิดหรือเสร็จสิ้น',
      },
      {
        label: 'รายการยาที่ต้อง review',
        value: String(medicationItems.length),
        detail: 'ดึงจาก prescription_items และ medications ของเคสที่ยังเปิดอยู่',
      },
    ];

    return {
      summaryCards,
      appointments,
      consultations,
      workSchedule,
      recentAssessments,
      medicationReview,
    };
  }

  private async resolveStaffIds(staffId: number | undefined, roleNames: string[]) {
    if (staffId) {
      return [staffId];
    }

    const matchedStaff = await this.prisma.users.findMany({
      where: {
        roles: {
          is: {
            name: {
              in: roleNames,
            },
          },
        },
      },
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    if (matchedStaff.length) {
      return matchedStaff.map((item) => item.id);
    }

    const fallbackAppointment = await this.prisma.appointments.findFirst({
      where: {
        staff_id: {
          not: null,
        },
      },
      select: { staff_id: true },
      orderBy: [{ appointment_date: 'desc' }, { id: 'desc' }],
    });

    return fallbackAppointment?.staff_id ? [fallbackAppointment.staff_id] : [];
  }

  private async resolveFocusDate(staffIds: number[]) {
    if (!staffIds.length) {
      return null;
    }

    const [row] = await this.prisma.$queryRaw<Array<{ focus_date: Date | string | null }>>(
      Prisma.sql`
        SELECT COALESCE(
          MIN(appointment_date) FILTER (WHERE appointment_date >= CURRENT_DATE),
          MAX(appointment_date)
        ) AS focus_date
        FROM appointments
        WHERE staff_id IN (${Prisma.join(staffIds)})
      `,
    );

    if (!row?.focus_date) {
      return null;
    }

    return formatDateLiteral(new Date(row.focus_date));
  }
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function formatFullName(name?: string | null, surName?: string | null) {
  const value = [name, surName].filter(Boolean).join(' ').trim();

  return value || 'ผู้ป่วยที่ยังไม่ระบุชื่อ';
}

function formatAppointmentCode(date: Date | null, id: number) {
  const base = date ?? new Date();
  const year = String(base.getUTCFullYear()).slice(-2);
  const month = String(base.getUTCMonth() + 1).padStart(2, '0');
  const day = String(base.getUTCDate()).padStart(2, '0');

  return `APT-${year}${month}${day}-${String(id).padStart(2, '0')}`;
}

function formatConsultationCode(id: number) {
  return `CON-${id}`;
}

function formatUserCode(id?: number | null) {
  return id ? `USR-${id}` : 'USR-NA';
}

function formatThaiDate(date: Date) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatIsoDate(date?: Date | null) {
  if (!date) {
    return 'ไม่ระบุวันที่';
  }

  return date.toISOString().slice(0, 10);
}

function formatTimeLabel(timeSelect?: string | null) {
  if (!timeSelect) {
    return '--:--';
  }

  return timeSelect.split(' - ')[0]?.trim() || timeSelect.slice(0, 5);
}

function normalizeStatus(value?: string | null) {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, '_');
}

function formatStatusLabel(value?: string | null) {
  const normalized = normalizeStatus(value);

  if (!normalized) {
    return 'pending';
  }

  return normalized;
}

function uniqueNumbers(values: Array<number | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is number => typeof value === 'number')),
  );
}

function buildAssessmentSummary(
  questionnaireTitle?: string | null,
  submittedAt?: Date | null,
) {
  const title = questionnaireTitle ?? 'แบบประเมินล่าสุด';
  const dateLabel = submittedAt ? formatIsoDate(submittedAt) : 'รอบล่าสุด';

  return `มีผลตอบจาก ${title} เข้าระบบเมื่อ ${dateLabel} ควรเปิดดูประกอบการวางแผนรักษา`;
}

function formatPsychiatristAppointmentType(value?: string | null) {
  const normalized = normalizeStatus(value);

  if (normalized === 'online') {
    return 'นัดติดตามออนไลน์';
  }

  if (normalized === 'onsite') {
    return 'นัดตรวจที่คลินิก';
  }

  return 'นัดติดตามอาการ';
}

function formatAppointmentPaymentStatus(value?: string | null) {
  const normalized = normalizeStatus(value);

  if (normalized === 'paid') {
    return 'confirmed';
  }

  if (normalized === 'not_paying') {
    return 'waiting';
  }

  return formatStatusLabel(value);
}

function derivePsychiatristConsultationStatus(
  note?: string | null,
  createdAt?: Date | null,
) {
  if (!note) {
    return 'awaiting_plan';
  }

  if (createdAt && getDayDifference(createdAt, new Date()) >= 14) {
    return 'pending_review';
  }

  return 'in_progress';
}

function getDayDifference(from: Date, to: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

function formatDateLiteral(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateLiteralAsUtc(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
