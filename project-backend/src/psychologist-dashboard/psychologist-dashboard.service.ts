import { Prisma } from '@prisma/client';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

type SessionItem = {
  time: string;
  user: string;
  id: string;
  type: string;
  status: string;
  summary: string;
};

type InsightItem = {
  title: string;
  responseId: string;
  userId: string;
  submittedAt: string;
  insight: string;
};

type ActiveConsultationItem = {
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

type RecentResponseItem = {
  patient: string;
  questionnaire: string;
  submittedAt: string;
  summary: string;
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
};

type PsychologistDashboardResponse = {
  summaryCards: SummaryCard[];
  sessions: SessionItem[];
  insights: InsightItem[];
  activeConsultations: ActiveConsultationItem[];
  therapistSchedule: ScheduleItem[];
  recentResponses: RecentResponseItem[];
};

@Injectable()
export class PsychologistDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(staffId?: number): Promise<PsychologistDashboardResponse> {
    if (!this.prisma.isDatabaseConfigured()) {
      throw new ServiceUnavailableException('DATABASE_URL is not configured');
    }

    const staffIds = await this.resolveStaffIds(staffId, [
      'Psychologist',
      'psychologist',
      'นักจิตวิทยา',
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

    const [todaySessions, consultationRows, scheduleRows] = await Promise.all([
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
              u.sur_name AS patient_surname
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

    const activeConsultations = consultationRows;
    const relatedUserIds = uniqueNumbers([
      ...todaySessions.map((item) => item.user_id),
      ...activeConsultations.map((item) => item.user_id),
    ]);

    const responseRows = relatedUserIds.length
      ? await this.prisma.responses.findMany({
          where: {
            user_id: { in: relatedUserIds },
          },
          select: {
            id: true,
            user_id: true,
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
          take: 6,
        })
      : [];

    const sessions = todaySessions.map((item) => {
      const sessionType = formatPsychologistSessionType(item.appointment_type);

      return {
        time: formatTimeLabel(item.time_select),
        user: formatFullName(item.patient_name, item.patient_surname),
        id: formatAppointmentCode(item.appointment_date, item.id),
        type: sessionType,
        status: formatAppointmentPaymentStatus(item.status),
        summary:
          item.appointment_type === 'follow_up'
            ? 'นัดต่อเนื่องสำหรับติดตามความคืบหน้าของแผนบำบัด'
            : `เตรียม session สำหรับ ${sessionType.toLowerCase()} และตรวจ response ล่าสุดก่อนเริ่ม`,
      };
    });

    const insights = responseRows.slice(0, 3).map((item) => ({
      title: item.questionnaires?.title ?? 'แบบประเมินล่าสุด',
      responseId: formatResponseCode(item.id),
      userId: formatUserCode(item.user_id),
      submittedAt: formatIsoDate(item.submitted_at),
      insight: buildInsightSummary(item.questionnaires?.title, item.submitted_at),
    }));

    const activeConsultationCards = activeConsultations.slice(0, 3).map((item) => ({
      id: formatConsultationCode(item.id),
      userId: formatUserCode(item.user_id),
      status: derivePsychologistConsultationStatus(item.note, item.created_at),
      note: item.note ?? 'ยังไม่มีบันทึกเพิ่มเติมสำหรับเคสนี้',
    }));

    const therapistSchedule = scheduleRows.map((item) => ({
      date: formatThaiDate(item.work_date),
      status: formatStatusLabel(item.status),
      note:
        item.note ??
        (item.status === 'leave'
          ? 'วันลา ไม่เปิดรับ session ใหม่'
          : item.status === 'holiday'
            ? 'วันหยุด ไม่เปิดรับ session ใหม่'
          : 'เปิดตาราง session ตามเวลางานปกติ'),
    }));

    const recentResponses = responseRows.slice(0, 3).map((item) => ({
      patient: formatFullName(item.users?.name, item.users?.sur_name),
      questionnaire: item.questionnaires?.title ?? 'แบบประเมินล่าสุด',
      submittedAt: formatIsoDate(item.submitted_at),
      summary: buildResponseSummary(item.questionnaires?.title, item.submitted_at),
    }));

    const summaryCards: SummaryCard[] = [
      {
        label: 'session วันนี้',
        value: String(todaySessions.length),
        detail: 'appointments ที่ต้องเปิดต่อเป็น session ของวันนี้',
      },
      {
        label: 'questionnaires ใหม่',
        value: String(responseRows.length),
        detail: 'แบบประเมินหรือคำตอบล่าสุดที่เพิ่งเข้ามาให้อ่านก่อนพบ',
      },
      {
        label: 'response รออ่าน',
        value: String(responseRows.length),
        detail: 'responses ล่าสุดของผู้รับบริการที่อยู่ในคิวหรืออยู่ในแผนต่อเนื่อง',
      },
      {
        label: 'consultations active',
        value: String(activeConsultations.length),
        detail: 'เคสที่ยังอยู่ในแผนบำบัดและต้องติดตามต่อเนื่อง',
      },
    ];

    return {
      summaryCards,
      sessions,
      insights,
      activeConsultations: activeConsultationCards,
      therapistSchedule,
      recentResponses,
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
      select: { user_id: true },
      orderBy: { user_id: 'asc' },
    });

    if (matchedStaff.length) {
      return matchedStaff.map((item) => item.user_id);
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

  return value || 'ผู้รับบริการที่ยังไม่ระบุชื่อ';
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

function formatResponseCode(id: number) {
  return `RES-${id}`;
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

function buildInsightSummary(
  questionnaireTitle?: string | null,
  submittedAt?: Date | null,
) {
  const title = questionnaireTitle ?? 'แบบประเมินล่าสุด';
  const dateLabel = submittedAt ? formatIsoDate(submittedAt) : 'รอบล่าสุด';

  return `มีคำตอบจาก ${title} เมื่อ ${dateLabel} ควรเปิดอ่านก่อนเริ่ม session เพื่อจับประเด็นต่อได้ไวขึ้น`;
}

function buildResponseSummary(
  questionnaireTitle?: string | null,
  submittedAt?: Date | null,
) {
  const title = questionnaireTitle ?? 'แบบประเมินล่าสุด';
  const dateLabel = submittedAt ? formatIsoDate(submittedAt) : 'รอบล่าสุด';

  return `ผลตอบจาก ${title} เข้าระบบเมื่อ ${dateLabel} เหมาะใช้ประกอบการวางแผน session ถัดไป`;
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

function formatPsychologistSessionType(value?: string | null) {
  const normalized = normalizeStatus(value);

  if (normalized === 'online') {
    return 'online session';
  }

  if (normalized === 'onsite') {
    return 'onsite session';
  }

  return 'therapy session';
}

function derivePsychologistConsultationStatus(
  note?: string | null,
  createdAt?: Date | null,
) {
  const normalizedNote = (note ?? '').toLowerCase();

  if (normalizedNote.includes('ติดตาม')) {
    return 'follow_up';
  }

  if (!note) {
    return 'active';
  }

  if (createdAt && getDayDifference(createdAt, new Date()) >= 14) {
    return 'needs_update';
  }

  return 'active';
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
