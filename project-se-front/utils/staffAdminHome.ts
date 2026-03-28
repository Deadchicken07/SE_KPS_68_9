import type {
  AppointmentItem,
  MonthWeekOption,
  ParsedTimeRange,
  StaffScheduleFormState,
  TimelineBounds,
} from '@/types/staffAdminHome.types'

const EVENT_TONES = [
  { fill: '#e6fffb', border: '#0f766e' },
  { fill: '#dff8f2', border: '#115e59' },
  { fill: '#e9f7f4', border: '#155e75' },
  { fill: '#edf7f3', border: '#1f6b5f' },
  { fill: '#f1faf7', border: '#2f6f64' },
]

const DEFAULT_TIMELINE_START = 8 * 60
const DEFAULT_TIMELINE_END = 18 * 60
const TIMELINE_EVENT_ROW_HEIGHT = 68
const TIMELINE_EVENT_TOP_OFFSET = 10

export function createStaffScheduleFormState(
  dateKey: string,
  staffId = '',
): StaffScheduleFormState {
  return {
    staffId,
    workDate: dateKey,
    status: 'working',
    note: '',
  }
}

export function getCurrentMonthKey() {
  const now = new Date()
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0')].join(
    '-',
  )
}

export function getCurrentDateKey() {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

export function clampToTodayOrLater(dateKey: string) {
  const today = getCurrentDateKey()
  return dateKey && dateKey >= today ? dateKey : today
}

export function getDefaultSelectedDate() {
  const today = getCurrentDateKey()
  return today.slice(0, 7) === getCurrentMonthKey()
    ? today
    : `${getCurrentMonthKey()}-01`
}

export function parseStaffAdminHomeErrorMessage(payload: unknown) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message

    if (typeof message === 'string') {
      return message
    }

    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0]
    }
  }

  return 'โหลดข้อมูลไม่สำเร็จ'
}

function toDateKey(value: Date) {
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, '0'),
    String(value.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

function toMonthKey(value: Date) {
  return [value.getUTCFullYear(), String(value.getUTCMonth() + 1).padStart(2, '0')].join(
    '-',
  )
}

function formatCompactDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
  })
}

function formatWeekRangeLabel(startDateKey: string, endDateKey: string) {
  return `${formatCompactDateLabel(startDateKey)} - ${formatCompactDateLabel(endDateKey)}`
}

export function getMonthWeekOptions(monthKey: string): MonthWeekOption[] {
  const monthStart = new Date(`${monthKey}-01T00:00:00Z`)
  const nextMonthStart = new Date(monthStart)
  nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1)

  const calendarStart = new Date(monthStart)
  calendarStart.setUTCDate(
    calendarStart.getUTCDate() - calendarStart.getUTCDay(),
  )

  const options: MonthWeekOption[] = []
  const cursor = new Date(calendarStart)

  while (cursor < nextMonthStart) {
    const weekStart = new Date(cursor)
    const weekEnd = new Date(cursor)
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)

    const weekDaysInMonth: string[] = []
    const dayCursor = new Date(weekStart)

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      if (toMonthKey(dayCursor) === monthKey) {
        weekDaysInMonth.push(toDateKey(dayCursor))
      }
      dayCursor.setUTCDate(dayCursor.getUTCDate() + 1)
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
      })
    }

    cursor.setUTCDate(cursor.getUTCDate() + 7)
  }

  return options
}

function parseTimeRange(item: AppointmentItem): ParsedTimeRange | null {
  const startText = item.startTime ?? item.timeSelect?.split('-')[0]?.trim() ?? null
  const endText = item.endTime ?? item.timeSelect?.split('-')[1]?.trim() ?? null

  if (!startText || !endText) {
    return null
  }

  const normalizedStart = startText.replace(/\./g, ':').trim()
  const normalizedEnd = endText.replace(/\./g, ':').trim()
  const matchStart = normalizedStart.match(/^(\d{1,2}):(\d{2})$/)
  const matchEnd = normalizedEnd.match(/^(\d{1,2}):(\d{2})$/)

  if (!matchStart || !matchEnd) {
    return null
  }

  const startMinutes = Number(matchStart[1]) * 60 + Number(matchStart[2])
  const endMinutes = Number(matchEnd[1]) * 60 + Number(matchEnd[2])

  if (
    Number(matchStart[1]) > 23 ||
    Number(matchEnd[1]) > 23 ||
    Number(matchStart[2]) > 59 ||
    Number(matchEnd[2]) > 59 ||
    endMinutes <= startMinutes
  ) {
    return null
  }

  return {
    startMinutes,
    endMinutes,
    label: `${String(Number(matchStart[1])).padStart(2, '0')}:${matchStart[2]} - ${String(
      Number(matchEnd[1]),
    ).padStart(2, '0')}:${matchEnd[2]}`,
  }
}

export function getTimelineBounds(
  appointments: AppointmentItem[],
): TimelineBounds {
  const ranges = appointments
    .map(parseTimeRange)
    .filter((range): range is ParsedTimeRange => Boolean(range))

  if (!ranges.length) {
    return {
      start: DEFAULT_TIMELINE_START,
      end: DEFAULT_TIMELINE_END,
      span: DEFAULT_TIMELINE_END - DEFAULT_TIMELINE_START,
    }
  }

  const minStart = Math.min(...ranges.map((item) => item.startMinutes))
  const maxEnd = Math.max(...ranges.map((item) => item.endMinutes))
  const start = Math.min(
    DEFAULT_TIMELINE_START,
    Math.max(0, Math.floor((minStart - 30) / 60) * 60),
  )
  const end = Math.max(start + 4 * 60, Math.ceil((maxEnd + 30) / 60) * 60)

  return {
    start,
    end,
    span: Math.max(end - start, 60),
  }
}

export function buildTimeMarkers(bounds: TimelineBounds) {
  const markers: number[] = []

  for (let minute = bounds.start; minute <= bounds.end; minute += 60) {
    markers.push(minute)
  }

  if (markers[markers.length - 1] !== bounds.end) {
    markers.push(bounds.end)
  }

  return markers
}

function getEventTone(value: number) {
  return EVENT_TONES[Math.abs(value) % EVENT_TONES.length]
}

export function getTimelineEvents(
  appointments: AppointmentItem[],
  bounds: TimelineBounds,
) {
  const prepared = appointments
    .map((appointment) => ({ appointment, range: parseTimeRange(appointment) }))
    .filter(
      (entry): entry is { appointment: AppointmentItem; range: ParsedTimeRange } =>
        Boolean(entry.range),
    )
    .sort((left, right) => left.range.startMinutes - right.range.startMinutes)

  const trackEnds: number[] = []

  const events = prepared.map(({ appointment, range }, index) => {
    let trackIndex = trackEnds.findIndex((end) => end <= range.startMinutes)

    if (trackIndex === -1) {
      trackIndex = trackEnds.length
      trackEnds.push(range.endMinutes)
    } else {
      trackEnds[trackIndex] = range.endMinutes
    }

    const left = ((range.startMinutes - bounds.start) / bounds.span) * 100
    const width = Math.min(
      100 - left,
      Math.max(((range.endMinutes - range.startMinutes) / bounds.span) * 100, 11),
    )

    return {
      appointment,
      left,
      width,
      top: trackIndex * TIMELINE_EVENT_ROW_HEIGHT + TIMELINE_EVENT_TOP_OFFSET,
      range,
      tone: getEventTone(appointment.staffId ?? appointment.id ?? index),
    }
  })

  return {
    events,
    laneHeight: Math.max(
      trackEnds.length * TIMELINE_EVENT_ROW_HEIGHT + TIMELINE_EVENT_TOP_OFFSET * 2,
      92,
    ),
  }
}
