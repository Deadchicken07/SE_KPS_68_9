import type {
  AppointmentItem,
  DailyStat,
  DashboardSummary,
  DayTone,
  EventTone,
  KpiCard,
  MonthWeekOption,
  ParsedTimeRange,
  StaffScheduleFormState,
  TimelineBounds,
  TimelineEvent,
} from "@/types/staffAdminHome.types";

const DAY_TONES: DayTone[] = [
  { fill: "#f8d16c", ink: "#5e3f00" },
  { fill: "#f89bc4", ink: "#65203d" },
  { fill: "#65d7a0", ink: "#14492d" },
  { fill: "#ffc449", ink: "#694500" },
  { fill: "#79c4ff", ink: "#113a63" },
  { fill: "#b7a3ff", ink: "#36246f" },
  { fill: "#ff8e8a", ink: "#5f201d" },
];

const EVENT_TONES: EventTone[] = [
  { fill: "#fce79b", border: "#c6a84a" },
  { fill: "#f6b8dd", border: "#b76894" },
  { fill: "#b8efd1", border: "#4c9f71" },
  { fill: "#ffd97f", border: "#d39f2a" },
  { fill: "#c7e4ff", border: "#6297c5" },
];

const DEFAULT_TIMELINE_START = 8 * 60;
const DEFAULT_TIMELINE_END = 18 * 60;
const TIMELINE_EVENT_ROW_HEIGHT = 68;
const TIMELINE_EVENT_TOP_OFFSET = 10;
const TIMELINE_MIN_LANE_HEIGHT = 92;
const TIMELINE_COLLAPSED_TRACK_COUNT = 1;

export const WEEKDAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export const PAGE_BACKGROUND =
  "radial-gradient(circle at top left, rgba(74, 124, 110, 0.18), transparent 26rem), radial-gradient(circle at bottom right, rgba(224, 182, 107, 0.18), transparent 24rem), linear-gradient(180deg, #f5efe4 0%, #efe6d8 100%)";
export const HERO_BACKGROUND =
  "linear-gradient(135deg, rgba(255, 248, 232, 0.3), rgba(255, 248, 232, 0.04)), linear-gradient(135deg, #183f36 0%, #24584b 56%, #2f7060 100%)";
export const BOARD_BACKGROUND =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(250, 245, 236, 0.96)), repeating-linear-gradient(0deg, rgba(126, 126, 126, 0.03) 0, rgba(126, 126, 126, 0.03) 2px, transparent 2px, transparent 6px)";
export const BOARD_HEADER_BACKGROUND =
  "linear-gradient(180deg, #fffefb 0%, #f7f1e7 100%)";
export const TIMELINE_LANE_BACKGROUND =
  "linear-gradient(180deg, rgba(255, 253, 247, 0.6), rgba(247, 242, 232, 0.84)), repeating-linear-gradient(0deg, rgba(128, 120, 106, 0.03) 0, rgba(128, 120, 106, 0.03) 1px, transparent 1px, transparent 52px)";
export const TIMELINE_LANE_SELECTED_BACKGROUND =
  "linear-gradient(180deg, rgba(229, 245, 239, 0.92), rgba(241, 246, 239, 0.92)), repeating-linear-gradient(0deg, rgba(128, 120, 106, 0.03) 0, rgba(128, 120, 106, 0.03) 1px, transparent 1px, transparent 52px)";

export const PANEL_CLASS =
  "rounded-[28px] border border-[#585c5124] bg-[#fffbf3] shadow-[0_18px_36px_rgba(51,56,48,0.08)]";
export const INPUT_CLASS =
  "min-h-[46px] w-full rounded-[14px] border border-[#3c524c29] bg-[#fffdf8] px-3.5 text-[#173630] outline-none transition focus:border-[#2d6a5c] focus:ring-4 focus:ring-[#2d6a5c1f]";
export const TEXTAREA_CLASS =
  "min-h-[132px] w-full rounded-[14px] border border-[#3c524c29] bg-[#fffdf8] px-3.5 py-3 text-[#173630] leading-7 outline-none transition focus:border-[#2d6a5c] focus:ring-4 focus:ring-[#2d6a5c1f] resize-y";
export const PANEL_META_CLASS =
  "inline-flex items-center justify-center rounded-full bg-[#edf3ee] px-3.5 py-2.5 text-[0.84rem] font-extrabold text-[#33554d]";
export const EMPTY_CLASS =
  "rounded-[20px] border border-dashed border-[#4b615a38] bg-[rgba(255,252,246,0.92)] p-[22px] leading-7 text-[#5f6b62]";

export const EMPTY_SUMMARY: DashboardSummary = {
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

export function createStaffScheduleFormState(
  dateKey: string,
  staffId = "",
): StaffScheduleFormState {
  return {
    staffId,
    workDate: dateKey,
    status: "working",
    note: "",
  };
}

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function getCurrentMonthKey() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0")].join(
    "-",
  );
}

export function getCurrentDateKey() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function clampToTodayOrLater(dateKey: string) {
  const today = getCurrentDateKey();
  return dateKey && dateKey >= today ? dateKey : today;
}

export function getDefaultSelectedDate() {
  const today = getCurrentDateKey();
  return today.slice(0, 7) === getCurrentMonthKey()
    ? today
    : `${getCurrentMonthKey()}-01`;
}

export function formatMonthLabel(monthKey: string) {
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
}

export function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCompactDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
  });
}

export function formatTimeLabel(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function parseErrorMessage(payload: unknown) {
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

export const parseStaffAdminHomeErrorMessage = parseErrorMessage;

export function normalizeScheduleNoteText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ?? "";
}

function toDateKey(value: Date) {
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function toMonthKey(value: Date) {
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
  ].join("-");
}

function formatWeekRangeLabel(startDateKey: string, endDateKey: string) {
  return `${formatCompactDateLabel(startDateKey)} - ${formatCompactDateLabel(endDateKey)}`;
}

export function getMonthWeekOptions(monthKey: string): MonthWeekOption[] {
  const monthStart = new Date(`${monthKey}-01T00:00:00Z`);
  const nextMonthStart = new Date(monthStart);
  nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);

  const calendarStart = new Date(monthStart);
  calendarStart.setUTCDate(
    calendarStart.getUTCDate() - calendarStart.getUTCDay(),
  );

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
        rangeLabel: formatWeekRangeLabel(
          toDateKey(weekStart),
          toDateKey(weekEnd),
        ),
      });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  return options;
}

function parseTimeRange(item: AppointmentItem): ParsedTimeRange | null {
  const startText =
    item.startTime ?? item.timeSelect?.split("-")[0]?.trim() ?? null;
  const endText =
    item.endTime ?? item.timeSelect?.split("-")[1]?.trim() ?? null;

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

export function getTimelineBounds(appointments: AppointmentItem[]): TimelineBounds {
  const ranges = appointments
    .map(parseTimeRange)
    .filter((range): range is ParsedTimeRange => Boolean(range));

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
  const end = Math.max(start + 4 * 60, Math.ceil((maxEnd + 30) / 60) * 60);

  return {
    start,
    end,
    span: Math.max(end - start, 60),
  };
}

export function buildTimeMarkers(bounds: TimelineBounds) {
  const markers: number[] = [];

  for (let minute = bounds.start; minute <= bounds.end; minute += 60) {
    markers.push(minute);
  }

  if (markers[markers.length - 1] !== bounds.end) {
    markers.push(bounds.end);
  }

  return markers;
}

export function getDayTone(dateKey: string) {
  const day = new Date(`${dateKey}T00:00:00`).getDay();
  return DAY_TONES[day];
}

function getEventTone(value: number) {
  return EVENT_TONES[Math.abs(value) % EVENT_TONES.length];
}

function getTimelineLaneHeight(trackCount: number) {
  return Math.max(
    trackCount * TIMELINE_EVENT_ROW_HEIGHT + TIMELINE_EVENT_TOP_OFFSET * 2,
    TIMELINE_MIN_LANE_HEIGHT,
  );
}

export function getTimelineEvents(
  appointments: AppointmentItem[],
  bounds: TimelineBounds,
) {
  const prepared = appointments
    .map((appointment) => ({ appointment, range: parseTimeRange(appointment) }))
    .filter(
      (
        entry,
      ): entry is { appointment: AppointmentItem; range: ParsedTimeRange } =>
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
      Math.max(
        ((range.endMinutes - range.startMinutes) / bounds.span) * 100,
        11,
      ),
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

  const trackCount = trackEnds.length;

  return {
    collapsedLaneHeight: getTimelineLaneHeight(
      Math.min(Math.max(trackCount, 1), TIMELINE_COLLAPSED_TRACK_COUNT),
    ),
    events,
    laneHeight: getTimelineLaneHeight(trackCount),
    trackCount,
  };
}

export function getStatusBadgeClasses(status: AppointmentItem["displayStatus"]) {
  return cx(
    "inline-flex items-center justify-center rounded-full px-3 py-2 text-[0.8rem] font-extrabold whitespace-nowrap",
    status === "pending" && "bg-[#fff1d6] text-[#9b5e00]",
    status === "confirmed" && "bg-[#dff5e8] text-[#146746]",
    status === "completed" && "bg-[#e8edf1] text-[#42515a]",
  );
}

export function getScheduleStatusLabel(value: string) {
  if (value === "working") {
    return "ทำงาน";
  }

  if (value === "leave" || value === "holiday") {
    return "ลา";
  }

  return "ยังไม่ลงตาราง";
}

export function getScheduleBadgeClasses(value: string) {
  return cx(
    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.8rem] font-extrabold",
    value === "working" && "bg-[#dff5e8] text-[#146746]",
    (value === "leave" || value === "holiday") && "bg-[#ffe4e1] text-[#a23d34]",
    value !== "working" &&
      value !== "leave" &&
      value !== "holiday" &&
      "bg-[#ece8df] text-[#685e51]",
  );
}

export function getKpiCards(
  summary: DashboardSummary,
  selectedDate: string,
  selectedDayStats: DailyStat | null,
): KpiCard[] {
  return [
    {
      label: "นัดหมายทั้งหมด",
      value: summary.totalAppointments,
      note: `${summary.daysWithAppointments} วันที่มีการนัด`,
    },
    {
      label: "ผู้รับบริการ",
      value: summary.uniquePatients,
      note: "นับตามคนไข้ไม่ซ้ำ",
    },
    {
      label: "บุคลากรที่มีนัด",
      value: summary.activeStaffCount,
      note: `จากในระบบทั้งหมด ${summary.registeredStaffCount} คน`,
    },
    {
      label: "ชำระแล้ว",
      value: summary.paidAppointments,
      note: `รอชำระ ${summary.pendingPayments} นัด`,
    },
    {
      label: "ออนไลน์",
      value: summary.onlineAppointments,
      note: `ที่คลินิก ${summary.onsiteAppointments} นัด`,
    },
    {
      label: "วันที่เลือก",
      value: selectedDayStats?.totalAppointments ?? 0,
      note: formatDateLabel(selectedDate),
    },
  ];
}
