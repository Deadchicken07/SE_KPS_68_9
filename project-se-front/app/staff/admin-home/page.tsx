"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WEEKDAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const DAY_TONES = [
  { fill: "#f8d16c", ink: "#5e3f00" },
  { fill: "#f89bc4", ink: "#65203d" },
  { fill: "#65d7a0", ink: "#14492d" },
  { fill: "#ffc449", ink: "#694500" },
  { fill: "#79c4ff", ink: "#113a63" },
  { fill: "#b7a3ff", ink: "#36246f" },
  { fill: "#ff8e8a", ink: "#5f201d" },
] as const;
const EVENT_TONES = [
  { fill: "#fce79b", border: "#c6a84a" },
  { fill: "#f6b8dd", border: "#b76894" },
  { fill: "#b8efd1", border: "#4c9f71" },
  { fill: "#ffd97f", border: "#d39f2a" },
  { fill: "#c7e4ff", border: "#6297c5" },
] as const;
const DEFAULT_TIMELINE_START = 8 * 60;
const DEFAULT_TIMELINE_END = 18 * 60;
const TIMELINE_EVENT_ROW_HEIGHT = 68;
const TIMELINE_EVENT_TOP_OFFSET = 10;

const PAGE_BACKGROUND =
  "radial-gradient(circle at top left, rgba(74, 124, 110, 0.18), transparent 26rem), radial-gradient(circle at bottom right, rgba(224, 182, 107, 0.18), transparent 24rem), linear-gradient(180deg, #f5efe4 0%, #efe6d8 100%)";
const HERO_BACKGROUND =
  "linear-gradient(135deg, rgba(255, 248, 232, 0.3), rgba(255, 248, 232, 0.04)), linear-gradient(135deg, #183f36 0%, #24584b 56%, #2f7060 100%)";
const BOARD_BACKGROUND =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(250, 245, 236, 0.96)), repeating-linear-gradient(0deg, rgba(126, 126, 126, 0.03) 0, rgba(126, 126, 126, 0.03) 2px, transparent 2px, transparent 6px)";
const BOARD_HEADER_BACKGROUND = "linear-gradient(180deg, #fffefb 0%, #f7f1e7 100%)";
const TIMELINE_LANE_BACKGROUND =
  "linear-gradient(180deg, rgba(255, 253, 247, 0.6), rgba(247, 242, 232, 0.84)), repeating-linear-gradient(0deg, rgba(128, 120, 106, 0.03) 0, rgba(128, 120, 106, 0.03) 1px, transparent 1px, transparent 52px)";
const TIMELINE_LANE_SELECTED_BACKGROUND =
  "linear-gradient(180deg, rgba(229, 245, 239, 0.92), rgba(241, 246, 239, 0.92)), repeating-linear-gradient(0deg, rgba(128, 120, 106, 0.03) 0, rgba(128, 120, 106, 0.03) 1px, transparent 1px, transparent 52px)";

const PANEL_CLASS =
  "rounded-[28px] border border-[#585c5124] bg-[#fffbf3] shadow-[0_18px_36px_rgba(51,56,48,0.08)]";
const INPUT_CLASS =
  "min-h-[46px] w-full rounded-[14px] border border-[#3c524c29] bg-[#fffdf8] px-3.5 text-[#173630] outline-none transition focus:border-[#2d6a5c] focus:ring-4 focus:ring-[#2d6a5c1f]";
const PANEL_META_CLASS =
  "inline-flex items-center justify-center rounded-full bg-[#edf3ee] px-3.5 py-2.5 text-[0.84rem] font-extrabold text-[#33554d]";
const EMPTY_CLASS =
  "rounded-[20px] border border-dashed border-[#4b615a38] bg-[rgba(255,252,246,0.92)] p-[22px] leading-7 text-[#5f6b62]";

type DashboardSummary = {
  totalAppointments: number;
  uniquePatients: number;
  activeStaffCount: number;
  registeredStaffCount: number;
  paidAppointments: number;
  pendingPayments: number;
  onlineAppointments: number;
  onsiteAppointments: number;
  daysWithAppointments: number;
};

type StaffOption = {
  id: number;
  name: string;
  role: string | null;
  roleLabel: string;
  specialty: string | null;
  avatarUrl: string | null;
};

type DailyStat = {
  date: string;
  totalAppointments: number;
  paidAppointments: number;
  pendingPayments: number;
  onlineAppointments: number;
  onsiteAppointments: number;
  uniquePatients: number;
  staffCount: number;
};

type AppointmentItem = {
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
  appointmentType: string | null;
  appointmentTypeLabel: string;
  paymentStatus: string | null;
  paymentStatusLabel: string;
  displayStatus: "pending" | "confirmed" | "completed";
  displayStatusLabel: string;
};

type StaffOverviewItem = {
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
  scheduleStatus: string;
};

type ClinicScheduleResponse = {
  month: string;
  selectedDate: string;
  weekRange: {
    start: string;
    end: string;
  };
  summary: DashboardSummary;
  staffOptions: StaffOption[];
  weekStats: DailyStat[];
  weekAppointments: AppointmentItem[];
  selectedDateAppointments: AppointmentItem[];
  upcomingAppointments: AppointmentItem[];
  staffOverview: StaffOverviewItem[];
};

type ParsedTimeRange = {
  startMinutes: number;
  endMinutes: number;
  label: string;
};

type TimelineBounds = {
  start: number;
  end: number;
  span: number;
};

type TimelineEvent = {
  appointment: AppointmentItem;
  left: number;
  width: number;
  top: number;
  range: ParsedTimeRange;
  tone: (typeof EVENT_TONES)[number];
};

type MonthWeekOption = {
  index: number;
  start: string;
  end: string;
  anchorDate: string;
  rangeLabel: string;
};

type JwtPayload = {
  role_id?: number;
  exp?: number;
};

const EMPTY_SUMMARY: DashboardSummary = {
  totalAppointments: 0,
  uniquePatients: 0,
  activeStaffCount: 0,
  registeredStaffCount: 0,
  paidAppointments: 0,
  pendingPayments: 0,
  onlineAppointments: 0,
  onsiteAppointments: 0,
  daysWithAppointments: 0,
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getCurrentMonthKey() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0")].join("-");
}

function getCurrentDateKey() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function getDefaultSelectedDate() {
  const today = getCurrentDateKey();
  return today.slice(0, 7) === getCurrentMonthKey() ? today : `${getCurrentMonthKey()}-01`;
}

function getTokenFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("access_token");
}

function getRoleIdFromToken(token: string | null) {
  if (!token || typeof window === "undefined") {
    return null;
  }

  const segments = token.split(".");

  if (segments.length < 2) {
    return null;
  }

  try {
    const normalized = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(window.atob(padded)) as JwtPayload;
    const expiresAt = Number(payload?.exp);
    const roleId = Number(payload?.role_id);

    if (Number.isInteger(expiresAt) && expiresAt > 0 && Date.now() >= expiresAt * 1000) {
      window.localStorage.removeItem("access_token");
      return null;
    }

    if (!Number.isInteger(roleId) || roleId <= 0) {
      return null;
    }

    return roleId;
  } catch {
    return null;
  }
}

function formatMonthLabel(monthKey: string) {
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
}

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCompactDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
  });
}

function formatTimeLabel(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
  }

  return "โหลดข้อมูลไม่สำเร็จ";
}

function toDateKey(value: Date) {
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function toMonthKey(value: Date) {
  return [value.getUTCFullYear(), String(value.getUTCMonth() + 1).padStart(2, "0")].join("-");
}

function formatWeekRangeLabel(startDateKey: string, endDateKey: string) {
  return `${formatCompactDateLabel(startDateKey)} - ${formatCompactDateLabel(endDateKey)}`;
}

function getMonthWeekOptions(monthKey: string): MonthWeekOption[] {
  const monthStart = new Date(`${monthKey}-01T00:00:00Z`);
  const nextMonthStart = new Date(monthStart);
  nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);

  const calendarStart = new Date(monthStart);
  calendarStart.setUTCDate(calendarStart.getUTCDate() - calendarStart.getUTCDay());

  const options: MonthWeekOption[] = [];
  const cursor = new Date(calendarStart);

  while (cursor < nextMonthStart) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    const weekDaysInMonth: string[] = [];
    const dayCursor = new Date(weekStart);

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      if (toMonthKey(dayCursor) === monthKey) {
        weekDaysInMonth.push(toDateKey(dayCursor));
      }
      dayCursor.setUTCDate(dayCursor.getUTCDate() + 1);
    }

    if (weekDaysInMonth.length) {
      options.push({
        index: options.length + 1,
        start: toDateKey(weekStart),
        end: toDateKey(weekEnd),
        anchorDate: weekDaysInMonth[0],
        rangeLabel: formatWeekRangeLabel(toDateKey(weekStart), toDateKey(weekEnd)),
      });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  return options;
}

function parseTimeRange(item: AppointmentItem): ParsedTimeRange | null {
  const startText = item.startTime ?? item.timeSelect?.split("-")[0]?.trim() ?? null;
  const endText = item.endTime ?? item.timeSelect?.split("-")[1]?.trim() ?? null;

  if (!startText || !endText) {
    return null;
  }

  const normalizedStart = startText.replace(/\./g, ":").trim();
  const normalizedEnd = endText.replace(/\./g, ":").trim();
  const matchStart = normalizedStart.match(/^(\d{1,2}):(\d{2})$/);
  const matchEnd = normalizedEnd.match(/^(\d{1,2}):(\d{2})$/);

  if (!matchStart || !matchEnd) {
    return null;
  }

  const startMinutes = Number(matchStart[1]) * 60 + Number(matchStart[2]);
  const endMinutes = Number(matchEnd[1]) * 60 + Number(matchEnd[2]);

  if (
    Number(matchStart[1]) > 23 ||
    Number(matchEnd[1]) > 23 ||
    Number(matchStart[2]) > 59 ||
    Number(matchEnd[2]) > 59 ||
    endMinutes <= startMinutes
  ) {
    return null;
  }

  return {
    startMinutes,
    endMinutes,
    label: `${String(Number(matchStart[1])).padStart(2, "0")}:${matchStart[2]} - ${String(
      Number(matchEnd[1]),
    ).padStart(2, "0")}:${matchEnd[2]}`,
  };
}

function getTimelineBounds(appointments: AppointmentItem[]): TimelineBounds {
  const ranges = appointments.map(parseTimeRange).filter((range): range is ParsedTimeRange => Boolean(range));

  if (!ranges.length) {
    return {
      start: DEFAULT_TIMELINE_START,
      end: DEFAULT_TIMELINE_END,
      span: DEFAULT_TIMELINE_END - DEFAULT_TIMELINE_START,
    };
  }

  const minStart = Math.min(...ranges.map((item) => item.startMinutes));
  const maxEnd = Math.max(...ranges.map((item) => item.endMinutes));
  const start = Math.min(
    DEFAULT_TIMELINE_START,
    Math.max(0, Math.floor((minStart - 30) / 60) * 60),
  );
  const end = Math.max(
    start + 4 * 60,
    Math.ceil((maxEnd + 30) / 60) * 60,
  );

  return {
    start,
    end,
    span: Math.max(end - start, 60),
  };
}

function buildTimeMarkers(bounds: TimelineBounds) {
  const markers: number[] = [];

  for (let minute = bounds.start; minute <= bounds.end; minute += 60) {
    markers.push(minute);
  }

  if (markers[markers.length - 1] !== bounds.end) {
    markers.push(bounds.end);
  }

  return markers;
}

function getDayTone(dateKey: string) {
  const day = new Date(`${dateKey}T00:00:00`).getDay();
  return DAY_TONES[day];
}

function getEventTone(value: number) {
  return EVENT_TONES[Math.abs(value) % EVENT_TONES.length];
}

function getTimelineEvents(appointments: AppointmentItem[], bounds: TimelineBounds) {
  const prepared = appointments
    .map((appointment) => ({ appointment, range: parseTimeRange(appointment) }))
    .filter(
      (entry): entry is { appointment: AppointmentItem; range: ParsedTimeRange } =>
        Boolean(entry.range),
    )
    .sort((left, right) => left.range.startMinutes - right.range.startMinutes);

  const trackEnds: number[] = [];

  const events = prepared.map(({ appointment, range }, index) => {
    let trackIndex = trackEnds.findIndex((end) => end <= range.startMinutes);

    if (trackIndex === -1) {
      trackIndex = trackEnds.length;
      trackEnds.push(range.endMinutes);
    } else {
      trackEnds[trackIndex] = range.endMinutes;
    }

    const left = ((range.startMinutes - bounds.start) / bounds.span) * 100;
    const width = Math.min(
      100 - left,
      Math.max(((range.endMinutes - range.startMinutes) / bounds.span) * 100, 11),
    );

    return {
      appointment,
      left,
      width,
      top: trackIndex * TIMELINE_EVENT_ROW_HEIGHT + TIMELINE_EVENT_TOP_OFFSET,
      range,
      tone: getEventTone(appointment.staffId ?? appointment.id ?? index),
    } satisfies TimelineEvent;
  });

  return {
    events,
    laneHeight: Math.max(
      trackEnds.length * TIMELINE_EVENT_ROW_HEIGHT + TIMELINE_EVENT_TOP_OFFSET * 2,
      92,
    ),
  };
}

function getStatusBadgeClasses(status: AppointmentItem["displayStatus"]) {
  return cx(
    "inline-flex items-center justify-center rounded-full px-3 py-2 text-[0.8rem] font-extrabold whitespace-nowrap",
    status === "pending" && "bg-[#fff1d6] text-[#9b5e00]",
    status === "confirmed" && "bg-[#dff5e8] text-[#146746]",
    status === "completed" && "bg-[#e8edf1] text-[#42515a]",
  );
}

function getScheduleStatusLabel(value: string) {
  if (value === "working") {
    return "เข้าเวร";
  }

  if (value === "leave") {
    return "ลา";
  }

  return "ยังไม่ลงตาราง";
}

function getScheduleBadgeClasses(value: string) {
  return cx(
    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.8rem] font-extrabold",
    value === "working" && "bg-[#dff5e8] text-[#146746]",
    value === "leave" && "bg-[#ffe4e1] text-[#a23d34]",
    value !== "working" && value !== "leave" && "bg-[#ece8df] text-[#685e51]",
  );
}

function getKpiCards(summary: DashboardSummary, selectedDate: string, selectedDayStats: DailyStat | null) {
  return [
    { label: "นัดหมายทั้งหมด", value: summary.totalAppointments, note: `${summary.daysWithAppointments} วันที่มีการนัด` },
    { label: "ผู้รับบริการ", value: summary.uniquePatients, note: "นับตามคนไข้ไม่ซ้ำ" },
    {
      label: "บุคลากรที่มีนัด",
      value: summary.activeStaffCount,
      note: `จากในระบบทั้งหมด ${summary.registeredStaffCount} คน`,
    },
    { label: "ชำระแล้ว", value: summary.paidAppointments, note: `รอชำระ ${summary.pendingPayments} นัด` },
    { label: "ออนไลน์", value: summary.onlineAppointments, note: `ที่คลินิก ${summary.onsiteAppointments} นัด` },
    { label: "วันที่เลือก", value: selectedDayStats?.totalAppointments ?? 0, note: formatDateLabel(selectedDate) },
  ];
}

export default function StaffAdminHomePage() {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [month, setMonth] = useState(getCurrentMonthKey);
  const [selectedDate, setSelectedDate] = useState(getDefaultSelectedDate);
  const [staffFilter, setStaffFilter] = useState("");
  const [data, setData] = useState<ClinicScheduleResponse | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSelectedAppointmentsCollapsed, setIsSelectedAppointmentsCollapsed] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const roleId = me?.role_id ?? null;

    if (!roleId) {
      router.replace("/login");
      return;
    }

    if (roleId === 5) {
      router.replace("/staff/pharmacist_home");
      return;
    }

    if (roleId !== 1) {
      router.replace("/user");
      return;
    }

    setHasAccess(true);
  }, [authLoading, me?.role_id, router]);

  useEffect(() => {
    if (!hasAccess) {
      return;
    }

    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      setAuthRequired(false);

      const query = new URLSearchParams({
        month,
        date: selectedDate,
      });

      if (staffFilter) {
        query.set("staffId", staffFilter);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/staff-dashboard/clinic-schedule?${query.toString()}`,
          {
            credentials: "include",
          },
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("__AUTH__");
          }
          throw new Error(parseErrorMessage(payload));
        }

        if (!ignore) {
          const dashboard = payload as ClinicScheduleResponse;
          setData(dashboard);
          setSelectedDate(dashboard.selectedDate ?? selectedDate);
        }
      } catch (caught) {
        if (ignore) {
          return;
        }

        if (caught instanceof Error && caught.message === "__AUTH__") {
          setAuthRequired(true);
          setError("กรุณาเข้าสู่ระบบด้วยบัญชีบุคลากรเพื่อดูตารางงาน");
          setData(null);
        } else if (caught instanceof Error) {
          setError(caught.message || "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่");
          setData(null);
        } else {
          setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่");
          setData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [hasAccess, month, selectedDate, staffFilter, reloadKey]);

  const summary = data?.summary ?? EMPTY_SUMMARY;
  const weekStats = data?.weekStats ?? [];
  const weekAppointments = data?.weekAppointments ?? [];
  const selectedDateAppointments = data?.selectedDateAppointments ?? [];
  const staffOptions = data?.staffOptions ?? [];
  const staffOverview = data?.staffOverview ?? [];
  const upcomingAppointments = data?.upcomingAppointments ?? [];

  useEffect(() => {
    if (!selectedDateAppointments.length) {
      setSelectedAppointmentId(null);
      return;
    }

    setSelectedAppointmentId((current) => {
      if (current && selectedDateAppointments.some((item) => item.id === current)) {
        return current;
      }

      return selectedDateAppointments[0].id;
    });
  }, [selectedDateAppointments]);

  const timelineBounds = useMemo(() => getTimelineBounds(weekAppointments), [weekAppointments]);
  const timeMarkers = useMemo(() => buildTimeMarkers(timelineBounds), [timelineBounds]);
  const weekRows = useMemo(() => {
    return weekStats.map((day) => ({
      ...day,
      ...getTimelineEvents(
        weekAppointments.filter((item) => item.appointmentDate === day.date),
        timelineBounds,
      ),
    }));
  }, [timelineBounds, weekAppointments, weekStats]);
  const monthWeekOptions = useMemo(() => getMonthWeekOptions(month), [month]);

  const selectedDayStats = weekStats.find((item) => item.date === selectedDate) ?? null;
  const selectedStaff = staffOptions.find((item) => String(item.id) === staffFilter) ?? null;
  const selectedAppointment =
    selectedDateAppointments.find((item) => item.id === selectedAppointmentId) ?? null;
  const activeWeekStart =
    data?.weekRange?.start ??
    monthWeekOptions.find((option) => selectedDate >= option.start && selectedDate <= option.end)?.start ??
    null;

  const kpiCards = getKpiCards(summary, selectedDate, selectedDayStats);

  function handleDateChange(dateKey: string) {
    setSelectedDate(dateKey);
    setMonth(dateKey.slice(0, 7));
  }

  function handleMonthChange(nextMonth: string) {
    if (!nextMonth) {
      return;
    }

    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <main
      className="min-h-screen px-4 pb-10 pt-6 text-[#18312c] sm:px-6 lg:px-7 lg:pb-14 lg:pt-8"
      style={{ background: PAGE_BACKGROUND }}
    >
      <div className="mx-auto grid max-w-[1420px] gap-6">
        <section
          className="overflow-hidden rounded-[28px] px-7 py-7 text-[#fffdf8] shadow-[0_28px_60px_rgba(24,63,54,0.2)]"
          style={{ background: HERO_BACKGROUND }}
        >
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-[760px]">
              <span className="inline-flex rounded-full bg-white/15 px-3.5 py-2 text-[0.82rem] font-extrabold uppercase tracking-[0.08em] text-[#f8e7be]">
                ตารางงานคลินิก
              </span>
              <h1 className="mt-4 text-[clamp(2rem,3vw,3.1rem)] font-semibold leading-[1.08]">
                ตารางงานทั้งคลินิกแบบรายสัปดาห์
              </h1>
              <p className="mt-3 leading-7 text-[rgba(255,253,248,0.82)]">
                มุมมองรายสัปดาห์ตามช่วงเวลาในแต่ละวัน กดที่บล็อกนัดหมายเพื่อดูรายละเอียดในรายการด้านล่างได้ทันที
              </p>
            </div>

            <div className="flex flex-wrap gap-3.5">
              <div className="min-w-[170px] rounded-[20px] border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-[10px]">
                <span className="block text-[0.82rem] text-[rgba(255,253,248,0.7)]">สัปดาห์ที่กำลังดู</span>
                <strong className="mt-2 block text-[1.1rem] leading-[1.4]">
                  {data?.weekRange
                    ? `${formatCompactDateLabel(data.weekRange.start)} - ${formatCompactDateLabel(data.weekRange.end)}`
                    : "-"}
                </strong>
              </div>
              <div className="min-w-[170px] rounded-[20px] border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-[10px]">
                <span className="block text-[0.82rem] text-[rgba(255,253,248,0.7)]">ตัวกรองบุคลากร</span>
                <strong className="mt-2 block text-[1.1rem] leading-[1.4]">
                  {selectedStaff?.name ?? "ทั้งคลินิก"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className={cx(PANEL_CLASS, "grid grid-cols-1 gap-4 p-[22px] md:grid-cols-2 xl:grid-cols-4")}>
          <div className="grid gap-2">
            <label className="text-[0.88rem] font-bold text-[#33554d]" htmlFor="month">
              เลือกเดือน
            </label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(event) => handleMonthChange(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[0.88rem] font-bold text-[#33554d]" htmlFor="selectedDate">
              วันที่กำลังดู
            </label>
            <input
              id="selectedDate"
              type="date"
              value={selectedDate}
              onChange={(event) => handleDateChange(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[0.88rem] font-bold text-[#33554d]" htmlFor="staffFilter">
              เลือกบุคลากร
            </label>
            <select
              id="staffFilter"
              value={staffFilter}
              onChange={(event) => setStaffFilter(event.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">ทั้งหมด</option>
              {staffOptions.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                  {staff.roleLabel ? ` • ${staff.roleLabel}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading}
              className="min-h-[46px] w-full rounded-[14px] bg-gradient-to-br from-[#1f5d4f] to-[#2e7464] px-4 font-bold text-[#fffdfa] shadow-[0_14px_28px_rgba(31,93,79,0.18)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
            </button>
          </div>
        </section>

        {error ? (
          <div className={cx(PANEL_CLASS, "border-[#bf4c3d3d] bg-[#fff0ee] p-[18px_22px] leading-7 text-[#8a2f23]")}>
            <div>{error}</div>
            {authRequired ? (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-xl bg-[#1f5d4f] px-4 font-bold text-[#fffdfa]"
              >
                ไปหน้าเข้าสู่ระบบ
              </button>
            ) : null}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          {kpiCards.map((card) => (
            <article key={card.label} className={cx(PANEL_CLASS, "p-5")}>
              <span className="mb-2 block text-[0.78rem] font-bold text-[#68756c]">{card.label}</span>
              <strong className="block text-[1.95rem] leading-none">{card.value}</strong>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6">
          <article className={PANEL_CLASS}>
            <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
              <div>
                <h2 className="text-[1.32rem] font-semibold text-[#173630]">ปฏิทินตารางงานรายสัปดาห์</h2>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <span className={PANEL_META_CLASS}>{formatMonthLabel(month)}</span>
              </div>
            </div>

            <div className="grid gap-3 px-6 pb-[18px]">
              <div className="flex flex-wrap gap-2.5">
                {monthWeekOptions.map((option) => (
                  <button
                    key={`${option.start}-${option.end}`}
                    type="button"
                    onClick={() => handleDateChange(option.anchorDate)}
                    className={cx(
                      "min-w-[124px] rounded-[18px] border px-[14px] py-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_18px_rgba(67,71,62,0.08)]",
                      activeWeekStart === option.start
                        ? "border-[#2165554d] bg-gradient-to-b from-[#e8f3ee] to-[#f4faf7] shadow-[0_14px_24px_rgba(31,93,79,0.1)]"
                        : "border-[#3d605524] bg-[#fffdfa]",
                    )}
                  >
                    <strong className="block text-[0.9rem] font-extrabold text-[#1d4338]">
                      สัปดาห์ {option.index}
                    </strong>
                    <span className="mt-1.5 block text-[0.78rem] text-[#6a7066]">{option.rangeLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto px-6 pb-6">
              <div
                className="min-w-[880px] overflow-hidden rounded-[28px] border border-[#5458501f] shadow-[inset_0_-18px_28px_rgba(140,126,100,0.06)]"
                style={{ background: BOARD_BACKGROUND }}
              >
                <div
                  className="sticky top-0 z-10 grid grid-cols-[132px_minmax(0,1fr)] border-b border-[#62635b24] max-[760px]:grid-cols-[102px_minmax(0,1fr)]"
                  style={{ background: BOARD_HEADER_BACKGROUND }}
                >
                  <div className="border-r border-[#62635b24] px-4 py-[14px] text-[0.72rem] font-extrabold tracking-[0.12em] text-[#716652]">
                    วัน
                  </div>
                  <div className="relative min-h-14">
                    {timeMarkers.map((minute) => (
                      <div
                        key={minute}
                        className="absolute top-[18px] -translate-x-1/2 text-[0.76rem] font-extrabold text-[#776b58]"
                        style={{ left: `${((minute - timelineBounds.start) / timelineBounds.span) * 100}%` }}
                      >
                        {formatTimeLabel(minute)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid">
                  {weekRows.map((day) => {
                    const tone = getDayTone(day.date);
                    const isSelected = day.date === selectedDate;
                    const laneLines = timeMarkers.slice(0, -1);

                    return (
                      <div
                        key={day.date}
                        className="grid grid-cols-[132px_minmax(0,1fr)] border-t border-[#62635b1a] first:border-t-0 max-[760px]:grid-cols-[102px_minmax(0,1fr)]"
                      >
                        <button
                          type="button"
                          onClick={() => handleDateChange(day.date)}
                          className={cx(
                            "border-r border-[#62635b24] px-[14px] py-[18px] text-left",
                            isSelected && "shadow-[inset_0_0_0_3px_rgba(255,255,255,0.78)]",
                          )}
                          style={{ background: tone.fill, color: tone.ink }}
                        >
                          <span className="mb-1.5 block text-[0.72rem] font-extrabold tracking-[0.08em]">
                            {WEEKDAY_LABELS[new Date(`${day.date}T00:00:00`).getDay()]}
                          </span>
                          <strong className="block text-base font-bold">{formatCompactDateLabel(day.date)}</strong>
                          <small className="mt-1.5 block text-[0.82rem]">{day.totalAppointments} นัด</small>
                        </button>

                        <div
                          className="relative cursor-pointer"
                          style={{
                            minHeight: `${day.laneHeight}px`,
                            background: isSelected
                              ? TIMELINE_LANE_SELECTED_BACKGROUND
                              : TIMELINE_LANE_BACKGROUND,
                          }}
                          onClick={() => handleDateChange(day.date)}
                        >
                          {laneLines.map((minute) => (
                            <span
                              key={`${day.date}-${minute}`}
                              className="absolute inset-y-0 w-px bg-[#68655b1a]"
                              style={{ left: `${((minute - timelineBounds.start) / timelineBounds.span) * 100}%` }}
                            />
                          ))}
                          {day.events.length ? (
                            day.events.map((event) => {
                              const isActive = event.appointment.id === selectedAppointmentId;
                              const eventStyle = {
                                left: `${event.left}%`,
                                width: `${event.width}%`,
                                top: `${event.top}px`,
                                background: event.tone.fill,
                                borderColor: event.tone.border,
                              } satisfies CSSProperties;

                              return (
                                <button
                                  key={event.appointment.id}
                                  type="button"
                                  style={eventStyle}
                                  title={`${event.range.label} • ${event.appointment.patientName} • ${event.appointment.staffName}`}
                                  className={cx(
                                    "absolute flex h-[60px] flex-col justify-between overflow-hidden rounded-2xl border px-2.5 py-2 text-left shadow-[0_8px_14px_rgba(114,93,46,0.08)] transition hover:-translate-y-0.5",
                                    isActive &&
                                      "shadow-[0_0_0_2px_rgba(30,94,79,0.24),0_14px_22px_rgba(72,65,49,0.14)]",
                                  )}
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    handleDateChange(day.date);
                                    setSelectedAppointmentId(event.appointment.id);
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="block truncate text-[0.68rem] font-bold leading-none text-[rgba(64,48,34,0.82)]">
                                      {event.range.label}
                                    </span>
                                    <span
                                      className={cx(
                                        "h-2.5 w-2.5 shrink-0 rounded-full",
                                        event.appointment.appointmentType === "online"
                                          ? "bg-[#2f8f6b]"
                                          : "bg-[#cc9541]",
                                      )}
                                    />
                                  </div>
                                  <strong className="block truncate text-[0.88rem] leading-tight text-[#3b2d1f]">
                                    {event.appointment.patientName}
                                  </strong>
                                  <small className="block truncate text-[0.72rem] leading-none text-[rgba(64,48,34,0.76)]">
                                    {event.appointment.staffName}
                                  </small>
                                </button>
                              );
                            })
                          ) : (
                            <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[0.88rem] text-[#8a8478]">
                              ยังไม่มีนัดหมายในวันนี้
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>

          <article className={PANEL_CLASS}>
            <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
              <div>
                <h2 className="text-[1.32rem] font-semibold text-[#173630]">รายการนัดของวันที่เลือก</h2>
                <p className="mt-2 text-[0.94rem] leading-7 text-[#68756c]">
                  {formatDateLabel(selectedDate)}
                  {selectedStaff ? ` • ${selectedStaff.name}` : " • แสดงทั้งคลินิก"}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={PANEL_META_CLASS}>{selectedDateAppointments.length} รายการ</span>
                <button
                  type="button"
                  onClick={() =>
                    setIsSelectedAppointmentsCollapsed((current) => !current)
                  }
                  aria-expanded={!isSelectedAppointmentsCollapsed}
                  aria-label={isSelectedAppointmentsCollapsed ? "ขยายรายการนัด" : "ย่อรายการนัด"}
                  title={isSelectedAppointmentsCollapsed ? "ขยายรายการนัด" : "ย่อรายการนัด"}
                  className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#355a4e29] bg-[#fffdfa] text-[#244d44] transition hover:-translate-y-0.5"
                >
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className={cx(
                      "h-[18px] w-[18px] transition-transform duration-200",
                      isSelectedAppointmentsCollapsed ? "rotate-180" : "",
                    )}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 8L10 13L15 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {!isSelectedAppointmentsCollapsed ? (
              <>
                <div className="grid gap-3.5 px-[22px] pb-[22px]">
                  {selectedDateAppointments.length ? (
                    selectedDateAppointments.map((appointment) => (
                      <article
                        key={appointment.id}
                        onClick={() => setSelectedAppointmentId(appointment.id)}
                        className={cx(
                          "cursor-pointer rounded-[22px] border border-[#4b615a1f] bg-[#fffdfa] p-4",
                          appointment.id === selectedAppointment?.id &&
                            "border-[#236b5a42] shadow-[0_12px_22px_rgba(30,94,79,0.08)]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex items-center rounded-full bg-[#eff5f0] px-3 py-2 text-[0.85rem] font-extrabold text-[#1f5d4f]">
                            {appointment.timeSelect ??
                              `${appointment.startTime ?? "--"} - ${appointment.endTime ?? "--"}`}
                          </span>
                          <span className={getStatusBadgeClasses(appointment.displayStatus)}>
                            {appointment.displayStatusLabel}
                          </span>
                        </div>
                        <h3 className="mt-3 text-[1.05rem] font-semibold text-[#173630]">
                          {appointment.patientName}
                        </h3>
                        <p className="mt-1 leading-7 text-[#6d776f]">
                          {appointment.staffName}
                          {appointment.staffRoleLabel ? ` • ${appointment.staffRoleLabel}` : ""}
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-[#f6f4ed] px-[13px] py-3">
                            <span className="mb-1 block text-[0.76rem] font-bold text-[#6a736c]">รูปแบบ</span>
                            <strong className="text-[0.95rem] text-[#18312c]">{appointment.appointmentTypeLabel}</strong>
                          </div>
                          <div className="rounded-2xl bg-[#f6f4ed] px-[13px] py-3">
                            <span className="mb-1 block text-[0.76rem] font-bold text-[#6a736c]">ชำระเงิน</span>
                            <strong className="text-[0.95rem] text-[#18312c]">{appointment.paymentStatusLabel}</strong>
                          </div>
                          <div className="rounded-2xl bg-[#f6f4ed] px-[13px] py-3">
                            <span className="mb-1 block text-[0.76rem] font-bold text-[#6a736c]">อีเมล</span>
                            <strong className="text-[0.95rem] text-[#18312c]">{appointment.patientEmail ?? "-"}</strong>
                          </div>
                          <div className="rounded-2xl bg-[#f6f4ed] px-[13px] py-3">
                            <span className="mb-1 block text-[0.76rem] font-bold text-[#6a736c]">เบอร์โทร</span>
                            <strong className="text-[0.95rem] text-[#18312c]">{appointment.patientPhone ?? "-"}</strong>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className={EMPTY_CLASS}>
                      วันนี้ยังไม่มีนัดหมายในตัวกรองที่เลือก หรือฐานข้อมูลยังไม่มีรายการในวันดังกล่าว
                    </div>
                  )}
                </div>

                <div className="px-[22px] pb-[22px] text-[0.84rem] leading-6 text-[#6d776f]">
                  ภาพรวมวันนี้: ชำระแล้ว {selectedDayStats?.paidAppointments ?? 0} นัด • ออนไลน์{" "}
                  {selectedDayStats?.onlineAppointments ?? 0} นัด
                </div>
              </>
            ) : (
              <div className="px-[22px] pb-[22px] text-[0.88rem] leading-7 text-[#6d776f]">
                ย่อรายละเอียดไว้แล้ว • วันนี้มี {selectedDateAppointments.length} รายการ
              </div>
            )}
          </article>
        </section>

        <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
          <article className={PANEL_CLASS}>
            <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
              <div>
                <h2 className="text-[1.32rem] font-semibold text-[#173630]">ภาระงานของบุคลากร</h2>
              </div>
              <span className={PANEL_META_CLASS}>{staffOverview.length} คน</span>
            </div>

            <div className="grid gap-3.5 px-[22px] pb-[22px]">
              {staffOverview.length ? (
                staffOverview.map((staff) => (
                  <article
                    key={staff.staffId}
                    className="rounded-[22px] border border-[#4b615a1f] bg-[#fffdfa] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[1.04rem] font-semibold text-[#173630]">{staff.staffName}</h3>
                        <div className="mt-1.5 text-[0.92rem] text-[#5e6c65]">
                          {staff.roleLabel}
                          {staff.specialty ? ` • ${staff.specialty}` : ""}
                        </div>
                      </div>
                      <span className={getScheduleBadgeClasses(staff.scheduleStatus)}>
                        {getScheduleStatusLabel(staff.scheduleStatus)}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                      <div className="rounded-2xl bg-[#f6f4ed] px-3 py-2.5">
                        <span className="mb-1.5 block text-[0.74rem] font-bold text-[#6a736c]">นัดทั้งหมด</span>
                        <strong className="text-[#173630]">{staff.totalAppointments}</strong>
                      </div>
                      <div className="rounded-2xl bg-[#f6f4ed] px-3 py-2.5">
                        <span className="mb-1.5 block text-[0.74rem] font-bold text-[#6a736c]">ชำระแล้ว</span>
                        <strong className="text-[#173630]">{staff.paidAppointments}</strong>
                      </div>
                      <div className="rounded-2xl bg-[#f6f4ed] px-3 py-2.5">
                        <span className="mb-1.5 block text-[0.74rem] font-bold text-[#6a736c]">ออนไลน์</span>
                        <strong className="text-[#173630]">{staff.onlineAppointments}</strong>
                      </div>
                      <div className="rounded-2xl bg-[#f6f4ed] px-3 py-2.5">
                        <span className="mb-1.5 block text-[0.74rem] font-bold text-[#6a736c]">นัดถัดไป</span>
                        <strong className="text-[#173630]">{staff.nextAppointmentTime ?? "-"}</strong>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className={EMPTY_CLASS}>
                  ยังไม่พบบุคลากรที่ตรงกับบทบาททางคลินิกในฐานข้อมูล หรือยังไม่มีนัดหมายในเดือนนี้
                </div>
              )}
            </div>
          </article>

          <article className={PANEL_CLASS}>
            <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
              <div>
                <h2 className="text-[1.32rem] font-semibold text-[#173630]">นัดหมายถัดไปของคลินิก</h2>
              </div>
              <span className={PANEL_META_CLASS}>{upcomingAppointments.length} รายการ</span>
            </div>

            <div className="grid gap-3.5 px-[22px] pb-[22px]">
              {upcomingAppointments.length ? (
                upcomingAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-[22px] border border-[#4b615a1f] bg-[#fffdfa] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[1.04rem] font-semibold text-[#173630]">
                          {appointment.patientName}
                        </h3>
                        <div className="mt-1.5 text-[0.92rem] text-[#5e6c65]">
                          {formatDateLabel(appointment.appointmentDate ?? selectedDate)} •{" "}
                          {appointment.timeSelect ?? "-"}
                        </div>
                      </div>
                      <span className={getStatusBadgeClasses(appointment.displayStatus)}>
                        {appointment.displayStatusLabel}
                      </span>
                    </div>
                    <p className="mt-2 leading-7 text-[#6d776f]">
                      {appointment.staffName}
                      {appointment.staffRoleLabel ? ` • ${appointment.staffRoleLabel}` : ""}
                    </p>
                  </article>
                ))
              ) : (
                <div className={EMPTY_CLASS}>
                  ยังไม่มีนัดหมายถัดไปในเดือนนี้ หรือทุกนัดในเดือนนี้ผ่านเวลาไปแล้ว
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
