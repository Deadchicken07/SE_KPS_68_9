import { type CSSProperties } from "react";
import type { useStaffAdminHome } from "@/hooks/useStaffAdminHome";
import type {
  AppointmentItem,
  StaffOverviewItem,
  StaffScheduleFormState,
} from "@/types/staffAdminHome.types";

type StaffAdminHomeState = ReturnType<typeof useStaffAdminHome>;

const DAY_TONES = [
  { fill: "#d9f3ef", ink: "#0f4c49" },
  { fill: "#ecf8f4", ink: "#115e59" },
  { fill: "#dff4ee", ink: "#155e75" },
  { fill: "#e8f6f1", ink: "#0f4c49" },
  { fill: "#e5f1ef", ink: "#1f4d46" },
  { fill: "#d7ede7", ink: "#134e4a" },
  { fill: "#eef7f4", ink: "#234b44" },
];

const WEEKDAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export const PAGE_BACKGROUND =
  "radial-gradient(circle at top left, rgba(63, 127, 109, 0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(192, 144, 87, 0.12), transparent 28%), linear-gradient(180deg, #f7f1ea 0%, #f3ede4 100%)";
const HERO_BACKGROUND =
  "linear-gradient(135deg, rgba(230, 255, 251, 0.32), rgba(255, 255, 255, 0.06)), linear-gradient(135deg, #0f766e 0%, #115e59 56%, #134e4a 100%)";
const BOARD_BACKGROUND =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(242, 249, 247, 0.98)), repeating-linear-gradient(0deg, rgba(15, 118, 110, 0.03) 0, rgba(15, 118, 110, 0.03) 2px, transparent 2px, transparent 6px)";
const BOARD_HEADER_BACKGROUND =
  "linear-gradient(180deg, #fbfefd 0%, #edf7f4 100%)";
const TIMELINE_LANE_BACKGROUND =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(244, 250, 248, 0.94)), repeating-linear-gradient(0deg, rgba(15, 118, 110, 0.03) 0, rgba(15, 118, 110, 0.03) 1px, transparent 1px, transparent 52px)";
const TIMELINE_LANE_SELECTED_BACKGROUND =
  "linear-gradient(180deg, rgba(230, 255, 251, 0.92), rgba(240, 253, 250, 0.95)), repeating-linear-gradient(0deg, rgba(15, 118, 110, 0.03) 0, rgba(15, 118, 110, 0.03) 1px, transparent 1px, transparent 52px)";
const PANEL_CLASS =
  "rounded-[28px] border border-[rgba(15,118,110,0.14)] bg-white shadow-[0_18px_36px_rgba(15,118,110,0.08)]";
const INPUT_CLASS =
  "min-h-[46px] w-full rounded-[14px] border border-[rgba(15,118,110,0.18)] bg-[#f9fcfb] px-3.5 text-[#173f35] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)]";
const TEXTAREA_CLASS =
  "min-h-[132px] w-full rounded-[14px] border border-[rgba(15,118,110,0.18)] bg-[#f9fcfb] px-3.5 py-3 text-[#173f35] leading-7 outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)] resize-y";
const PANEL_META_CLASS =
  "inline-flex items-center justify-center rounded-full bg-[#e6fffb] px-3.5 py-2.5 text-[0.84rem] font-extrabold text-[#0f766e]";
const EMPTY_CLASS =
  "rounded-[20px] border border-dashed border-[rgba(15,118,110,0.18)] bg-[#f7fbfa] p-[22px] leading-7 text-[#47655e]";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
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

function getDayTone(dateKey: string) {
  const day = new Date(`${dateKey}T00:00:00`).getDay();
  return DAY_TONES[day];
}

function getStatusBadgeClasses(status: AppointmentItem["displayStatus"]) {
  return cx(
    "inline-flex items-center justify-center rounded-full px-3 py-2 text-[0.8rem] font-extrabold whitespace-nowrap",
    status === "pending" && "bg-[#eff7f4] text-[#0f766e]",
    status === "confirmed" && "bg-[#e6fffb] text-[#115e59]",
    status === "completed" && "bg-[#edf4f2] text-[#47655e]",
  );
}

function getScheduleStatusLabel(value: string) {
  if (value === "working") {
    return "เข้าเวร";
  }

  if (value === "leave") {
    return "ลา";
  }

  if (value === "holiday") {
    return "วันหยุด";
  }

  return "ยังไม่ลงตาราง";
}

function getScheduleBadgeClasses(value: string) {
  return cx(
    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.8rem] font-extrabold",
    value === "working" && "bg-[#e6fffb] text-[#115e59]",
    value === "leave" && "bg-[#fff1f2] text-[#be123c]",
    value === "holiday" && "bg-[#fff7d6] text-[#9a6700]",
    value !== "working" &&
      value !== "leave" &&
      value !== "holiday" &&
      "bg-[#edf4f2] text-[#47655e]",
  );
}

function shouldShowStaffAppointmentMetrics(staff: StaffOverviewItem) {
  const normalizedRole = staff.role?.trim().toLowerCase() ?? "";
  const roleLabel = staff.roleLabel.trim();

  return (
    normalizedRole === "psychiatrist" ||
    normalizedRole === "psychologist" ||
    roleLabel === "จิตแพทย์" ||
    roleLabel === "นักจิตวิทยา"
  );
}

function buildDashboardSummaryCards(
  summary: NonNullable<StaffAdminHomeState["summary"]>,
) {
  return [
    {
      label: "นัดหมายทั้งหมด",
      value: summary.totalAppointments,
    },
    {
      label: "ผู้รับบริการ",
      value: summary.uniquePatients,
    },
    {
      label: "บุคลากรที่มีนัด",
      value: summary.activeStaffCount,
    },
    {
      label: "ชำระแล้ว",
      value: summary.paidAppointments,
    },
    {
      label: "ออนไลน์",
      value: summary.onlineAppointments,
    },
  ];
}

export function DashboardSummarySection({
  summary,
}: {
  summary: StaffAdminHomeState["summary"];
}) {
  if (!summary) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {buildDashboardSummaryCards(summary).map((card) => (
        <article key={card.label} className={cx(PANEL_CLASS, "p-5")}>
          <span className="mb-2 block text-[0.78rem] font-bold text-[#68756c]">
            {card.label}
          </span>
          <strong className="block text-[1.95rem] leading-none">
            {card.value}
          </strong>
        </article>
      ))}
    </section>
  );
}

export function HeroSection({
  selectedStaffName,
  weekRange,
}: {
  selectedStaffName: string;
  weekRange: { start: string; end: string } | null;
}) {
  return (
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
            ตารางงานทั้งคลินิกรายสัปดาห์
          </h1>
        </div>

        <div className="flex flex-wrap gap-3.5">
          <div className="min-w-[170px] rounded-[20px] border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-[10px]">
            <span className="block text-[0.82rem] text-[rgba(255,253,248,0.7)]">
              สัปดาห์ที่กำลังดู
            </span>
            <strong className="mt-2 block text-[1.1rem] leading-[1.4]">
              {weekRange
                ? `${formatCompactDateLabel(weekRange.start)} - ${formatCompactDateLabel(
                    weekRange.end,
                  )}`
                : "-"}
            </strong>
          </div>
          <div className="min-w-[170px] rounded-[20px] border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-[10px]">
            <span className="block text-[0.82rem] text-[rgba(255,253,248,0.7)]">
              ตัวกรองบุคลากร
            </span>
            <strong className="mt-2 block text-[1.1rem] leading-[1.4]">
              {selectedStaffName}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FilterSection({ state }: { state: StaffAdminHomeState }) {
  return (
    <section
      className={cx(
        PANEL_CLASS,
        "grid grid-cols-1 gap-4 p-[22px] md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      <div className="grid gap-2">
        <label
          className="text-[0.88rem] font-bold text-[#33554d]"
          htmlFor="month"
        >
          เลือกเดือน
        </label>
        <input
          id="month"
          type="month"
          value={state.month}
          onChange={(event) => state.handleMonthChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid gap-2">
        <label
          className="text-[0.88rem] font-bold text-[#33554d]"
          htmlFor="selectedDate"
        >
          วันที่กำลังดู
        </label>
        <input
          id="selectedDate"
          type="date"
          value={state.selectedDate}
          onChange={(event) => state.handleDateChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid gap-2">
        <label
          className="text-[0.88rem] font-bold text-[#33554d]"
          htmlFor="staffFilter"
        >
          เลือกบุคลากร
        </label>
        <select
          id="staffFilter"
          value={state.staffFilter}
          onChange={(event) => state.setStaffFilter(event.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">ทั้งหมด</option>
          {state.staffOptions.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name}
              {staff.roleLabel ? ` • ${staff.roleLabel}` : ""}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

export function ErrorPanel({
  authRequired,
  error,
  onLogin,
}: {
  authRequired: boolean;
  error: string;
  onLogin: () => void;
}) {
  return (
    <div
      className={cx(
        PANEL_CLASS,
        "border-[#bf4c3d3d] bg-[#fff0ee] p-[18px_22px] leading-7 text-[#8a2f23]",
      )}
    >
      <div>{error}</div>
      {authRequired ? (
        <button
          type="button"
          onClick={onLogin}
          className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-xl bg-[#0f766e] px-4 font-bold text-white"
        >
          ไปหน้าเข้าสู่ระบบ
        </button>
      ) : null}
    </div>
  );
}

export function TimelineSection({ state }: { state: StaffAdminHomeState }) {
  return (
    <article className={PANEL_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
        <div>
          <h2 className="text-[1.32rem] font-semibold text-[#173630]">
            ปฏิทินตารางงานรายสัปดาห์
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <span className={PANEL_META_CLASS}>
            {formatMonthLabel(state.month)}
          </span>
        </div>
      </div>

      <div className="grid gap-3 px-6 pb-[18px]">
        <div className="flex flex-wrap gap-2.5">
          {state.monthWeekOptions.map((option) => (
            <button
              key={`${option.start}-${option.end}`}
              type="button"
              onClick={() => state.handleDateChange(option.anchorDate)}
              className={cx(
                "min-w-[124px] rounded-[18px] border px-[14px] py-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_18px_rgba(67,71,62,0.08)]",
                state.activeWeekStart === option.start
                  ? "border-[rgba(15,118,110,0.24)] bg-gradient-to-b from-[#e6fffb] to-[#f7fbfa] shadow-[0_14px_24px_rgba(15,118,110,0.08)]"
                  : "border-[rgba(15,118,110,0.12)] bg-white",
              )}
            >
              <strong className="block text-[0.9rem] font-extrabold text-[#1d4338]">
                สัปดาห์ {option.index}
              </strong>
              <span className="mt-1.5 block text-[0.78rem] text-[#6a7066]">
                {option.rangeLabel}
              </span>
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
              {state.timeMarkers.map((minute) => (
                <div
                  key={minute}
                  className="absolute top-[18px] -translate-x-1/2 text-[0.76rem] font-extrabold text-[#776b58]"
                  style={{
                    left: `${((minute - state.timelineBounds.start) / state.timelineBounds.span) * 100}%`,
                  }}
                >
                  {formatTimeLabel(minute)}
                </div>
              ))}
            </div>
          </div>

          <div className="grid">
            {state.weekRows.map((day) => {
              const tone = getDayTone(day.date);
              const isSelected = day.date === state.selectedDate;
              const laneLines = state.timeMarkers.slice(0, -1);

              return (
                <div
                  key={day.date}
                  className="grid grid-cols-[132px_minmax(0,1fr)] border-t border-[#62635b1a] first:border-t-0 max-[760px]:grid-cols-[102px_minmax(0,1fr)]"
                >
                  <button
                    type="button"
                    onClick={() => state.handleDateChange(day.date)}
                    className={cx(
                      "border-r border-[#62635b24] px-[14px] py-[18px] text-left",
                      isSelected &&
                        "shadow-[inset_0_0_0_3px_rgba(255,255,255,0.78)]",
                    )}
                    style={{ background: tone.fill, color: tone.ink }}
                  >
                    <span className="mb-1.5 block text-[0.72rem] font-extrabold tracking-[0.08em]">
                      {
                        WEEKDAY_LABELS[
                          new Date(`${day.date}T00:00:00`).getDay()
                        ]
                      }
                    </span>
                    <strong className="block text-base font-bold">
                      {formatCompactDateLabel(day.date)}
                    </strong>
                    <small className="mt-1.5 block text-[0.82rem]">
                      {day.totalAppointments} นัด
                    </small>
                  </button>

                  <div
                    className="relative cursor-pointer"
                    style={{
                      minHeight: `${day.laneHeight}px`,
                      background: isSelected
                        ? TIMELINE_LANE_SELECTED_BACKGROUND
                        : TIMELINE_LANE_BACKGROUND,
                    }}
                    onClick={() => state.handleDateChange(day.date)}
                  >
                    {laneLines.map((minute) => (
                      <span
                        key={`${day.date}-${minute}`}
                        className="absolute inset-y-0 w-px bg-[#68655b1a]"
                        style={{
                          left: `${((minute - state.timelineBounds.start) / state.timelineBounds.span) * 100}%`,
                        }}
                      />
                    ))}
                    {day.events.length ? (
                      day.events.map((event) => {
                        const isActive =
                          event.appointment.id ===
                          state.selectedAppointment?.id;
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
                              state.selectAppointment(
                                event.appointment.id,
                                day.date,
                              );
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
  );
}

export function SelectedAppointmentsSection({
  state,
}: {
  state: StaffAdminHomeState;
}) {
  return (
    <article className={PANEL_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
        <div>
          <h2 className="text-[1.32rem] font-semibold text-[#173630]">
            รายการนัดของวันที่เลือก
          </h2>
          <p className="mt-2 text-[0.94rem] leading-7 text-[#68756c]">
            {formatDateLabel(state.selectedDate)}
            {state.selectedStaff
              ? ` • ${state.selectedStaff.name}`
              : " • แสดงทั้งคลินิก"}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={PANEL_META_CLASS}>
            {state.selectedDateAppointments.length} รายการ
          </span>
          <button
            type="button"
            onClick={state.toggleSelectedAppointmentsCollapsed}
            aria-expanded={!state.isSelectedAppointmentsCollapsed}
            aria-label={
              state.isSelectedAppointmentsCollapsed
                ? "ขยายรายการนัด"
                : "ย่อรายการนัด"
            }
            title={
              state.isSelectedAppointmentsCollapsed
                ? "ขยายรายการนัด"
                : "ย่อรายการนัด"
            }
            className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[rgba(15,118,110,0.16)] bg-white text-[#0f766e] transition hover:-translate-y-0.5"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className={cx(
                "h-[18px] w-[18px] transition-transform duration-200",
                state.isSelectedAppointmentsCollapsed ? "rotate-180" : "",
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

      {!state.isSelectedAppointmentsCollapsed ? (
        <>
          <div className="grid gap-3.5 px-[22px] pb-[22px]">
            {state.selectedDateAppointments.length ? (
              state.selectedDateAppointments.map((appointment) => (
                <article
                  key={appointment.id}
                  onClick={() => state.selectAppointment(appointment.id)}
                  className={cx(
                    "cursor-pointer rounded-[22px] border border-[rgba(15,118,110,0.12)] bg-white p-4",
                    appointment.id === state.selectedAppointment?.id &&
                      "border-[rgba(15,118,110,0.28)] shadow-[0_12px_22px_rgba(15,118,110,0.08)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-[#e6fffb] px-3 py-2 text-[0.85rem] font-extrabold text-[#0f766e]">
                      {appointment.timeSelect ??
                        `${appointment.startTime ?? "--"} - ${appointment.endTime ?? "--"}`}
                    </span>
                    <span
                      className={getStatusBadgeClasses(
                        appointment.displayStatus,
                      )}
                    >
                      {appointment.displayStatusLabel}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[1.05rem] font-semibold text-[#173630]">
                    {appointment.patientName}
                  </h3>
                  <p className="mt-1 leading-7 text-[#6d776f]">
                    {appointment.staffName}
                    {appointment.staffRoleLabel
                      ? ` • ${appointment.staffRoleLabel}`
                      : ""}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoBox
                      label="รูปแบบ"
                      value={appointment.appointmentTypeLabel}
                    />
                    <InfoBox
                      label="ชำระเงิน"
                      value={appointment.paymentStatusLabel}
                    />
                    <InfoBox
                      label="อีเมล"
                      value={appointment.patientEmail ?? "-"}
                    />
                    <InfoBox
                      label="เบอร์โทร"
                      value={appointment.patientPhone ?? "-"}
                    />
                  </div>
                </article>
              ))
            ) : (
              <div className={EMPTY_CLASS}>
                วันนี้ยังไม่มีนัดหมายในตัวกรองที่เลือก
                หรือฐานข้อมูลยังไม่มีรายการในวันดังกล่าว
              </div>
            )}
          </div>
        </>
      ) : null}
    </article>
  );
}

export function StaffOverviewSection({
  onOpenStaffWorkModal,
  staffOverview,
}: {
  onOpenStaffWorkModal: () => void;
  staffOverview: StaffOverviewItem[];
}) {
  return (
    <article className={PANEL_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
        <div>
          <h2 className="text-[1.32rem] font-semibold text-[#173630]">
            ภาระงานของบุคลากร
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenStaffWorkModal}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0f766e] px-4 text-[0.9rem] font-extrabold text-white shadow-[0_10px_24px_rgba(15,118,110,0.18)] transition hover:bg-[#115e59]"
          >
            แก้ไข
          </button>
          <span className={PANEL_META_CLASS}>{staffOverview.length} คน</span>
        </div>
      </div>

      <div className="grid gap-3.5 px-[22px] pb-[22px]">
        {staffOverview.length ? (
          staffOverview.map((staff) => (
            <article
              key={staff.staffId}
              className="rounded-[22px] border border-[rgba(15,118,110,0.12)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[1.04rem] font-semibold text-[#173630]">
                    {staff.staffName}
                  </h3>
                  <div className="mt-1.5 text-[0.92rem] text-[#5e6c65]">
                    {staff.roleLabel}
                    {staff.specialty ? ` • ${staff.specialty}` : ""}
                  </div>
                </div>
                <span className={getScheduleBadgeClasses(staff.scheduleStatus)}>
                  {getScheduleStatusLabel(staff.scheduleStatus)}
                </span>
              </div>

              {shouldShowStaffAppointmentMetrics(staff) ? (
                <div className="mt-4 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                  <InfoBox label="นัดทั้งหมด" value={staff.totalAppointments} />
                  <InfoBox label="ชำระแล้ว" value={staff.paidAppointments} />
                  <InfoBox label="ออนไลน์" value={staff.onlineAppointments} />
                  <InfoBox
                    label="นัดถัดไป"
                    value={staff.nextAppointmentTime ?? "-"}
                  />
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className={EMPTY_CLASS}>
            ยังไม่พบบุคลากรที่ตรงกับบทบาททางคลินิกในฐานข้อมูล
            หรือยังไม่มีนัดหมายในเดือนนี้
          </div>
        )}
      </div>
    </article>
  );
}

export function UpcomingAppointmentsSection({
  selectedDate,
  upcomingAppointments,
}: {
  selectedDate: string;
  upcomingAppointments: AppointmentItem[];
}) {
  return (
    <article className={PANEL_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
        <div>
          <h2 className="text-[1.32rem] font-semibold text-[#173630]">
            นัดหมายถัดไปของคลินิก
          </h2>
        </div>
        <span className={PANEL_META_CLASS}>
          {upcomingAppointments.length} รายการ
        </span>
      </div>

      <div className="grid gap-3.5 px-[22px] pb-[22px]">
        {upcomingAppointments.length ? (
          upcomingAppointments.map((appointment) => (
            <article
              key={appointment.id}
              className="rounded-[22px] border border-[rgba(15,118,110,0.12)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[1.04rem] font-semibold text-[#173630]">
                    {appointment.patientName}
                  </h3>
                  <div className="mt-1.5 text-[0.92rem] text-[#5e6c65]">
                    {formatDateLabel(
                      appointment.appointmentDate ?? selectedDate,
                    )}{" "}
                    • {appointment.timeSelect ?? "-"}
                  </div>
                </div>
                <span
                  className={getStatusBadgeClasses(appointment.displayStatus)}
                >
                  {appointment.displayStatusLabel}
                </span>
              </div>
              <p className="mt-2 leading-7 text-[#6d776f]">
                {appointment.staffName}
                {appointment.staffRoleLabel
                  ? ` • ${appointment.staffRoleLabel}`
                  : ""}
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
  );
}

export function StaffWorkModal({ state }: { state: StaffAdminHomeState }) {
  if (!state.isStaffWorkModalOpen) {
    return null;
  }

  const updateStaffScheduleForm = <Key extends keyof StaffScheduleFormState>(
    field: Key,
    value: StaffScheduleFormState[Key],
  ) => {
    state.setStaffScheduleForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(25,36,32,0.46)] p-4 backdrop-blur-sm"
      onClick={state.closeStaffWorkModal}
    >
      <section
        className="w-full max-w-2xl rounded-[30px] border border-[rgba(15,118,110,0.14)] bg-white shadow-[0_26px_70px_rgba(15,118,110,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#4b615a1c] px-6 py-5">
          <div>
            <span className="inline-flex rounded-full bg-[#edf3ee] px-3 py-1 text-[0.76rem] font-extrabold tracking-[0.12em] text-[#33554d]">
              STAFF WORKLOAD
            </span>
            <h3 className="mt-3 text-[1.5rem] font-semibold text-[#173630]">
              บันทึกเข้างาน / ลา
            </h3>
            <p className="mt-2 max-w-[38rem] text-[0.95rem] leading-7 text-[#5f6b62]">
              บันทึกสถานะการปฏิบัติงานของบุคลากร
            </p>
          </div>
          <button
            type="button"
            onClick={state.closeStaffWorkModal}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#3c524c24] bg-white text-[1.2rem] text-[#33554d] transition hover:bg-[#f6f4ed]"
            aria-label="ปิด popup"
          >
            ×
          </button>
        </div>

        <form onSubmit={state.handleStaffScheduleSubmit}>
          <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[0.88rem] font-bold text-[#33554d]">
                บุคลากร
              </span>
              <select
                className={INPUT_CLASS}
                value={state.staffScheduleForm.staffId}
                onChange={(event) => {
                  updateStaffScheduleForm("staffId", event.target.value);
                }}
              >
                <option value="">เลือกบุคลากร</option>
                {state.staffScheduleOptions.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} • {staff.roleLabel}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[0.88rem] font-bold text-[#33554d]">
                วันที่
              </span>
              <input
                type="date"
                className={INPUT_CLASS}
                min={state.todayDateKey}
                value={state.staffScheduleForm.workDate}
                onChange={(event) => {
                  updateStaffScheduleForm("workDate", event.target.value);
                }}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[0.88rem] font-bold text-[#33554d]">
                สถานะ
              </span>
              <select
                className={INPUT_CLASS}
                value={state.staffScheduleForm.status}
                onChange={(event) => {
                  updateStaffScheduleForm(
                    "status",
                    event.target.value as StaffScheduleFormState["status"],
                  );
                }}
              >
                <option value="working">เข้างาน</option>
                <option value="leave">ลา</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-[0.88rem] font-bold text-[#33554d]">
                หมายเหตุ
              </span>
              <textarea
                rows={4}
                maxLength={255}
                className={TEXTAREA_CLASS}
                placeholder="ระบุรายละเอียดเพิ่มเติม เช่น  ลาป่วย ติดประชุม หรือข้อมูลประกอบการบันทึก"
                value={state.staffScheduleForm.note}
                onChange={(event) => {
                  updateStaffScheduleForm("note", event.target.value);
                }}
              />
            </label>
          </div>

          {state.staffScheduleError ? (
            <div className="px-6 pb-2">
              <div className="rounded-[18px] border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-[0.92rem] text-[#be123c]">
                {state.staffScheduleError}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#4b615a1c] px-6 py-5">
            <button
              type="button"
              onClick={state.closeStaffWorkModal}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[rgba(15,118,110,0.16)] bg-white px-5 text-[0.95rem] font-bold text-[#47655e] transition hover:bg-[#f7fbfa]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={state.staffScheduleSubmitting}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#0f766e] px-5 text-[0.95rem] font-bold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-[#b7c8c1]"
            >
              {state.staffScheduleSubmitting
                ? "กำลังบันทึก..."
                : "บันทึกตารางงาน"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#f7fbfa] px-[13px] py-3">
      <span className="mb-1 block text-[0.76rem] font-bold text-[#6a736c]">
        {label}
      </span>
      <strong className="text-[0.95rem] text-[#18312c]">{value}</strong>
    </div>
  );
}
