"use client";

import { useMemo } from "react";
import { Typography } from "antd";
import { useAdminWorkSchedule } from "@/hooks/useAdminWorkSchedule";
import type {
  ClinicHolidayScope,
  ScheduleStatus,
  StaffScheduleEntry,
} from "@/types/staffAdminHome.types";

type CalendarCell =
  | {
      kind: "empty";
      key: string;
    }
  | {
      kind: "day";
      key: string;
      dateKey: string;
      dayNumber: number;
      isToday: boolean;
      isPast: boolean;
      isSelected: boolean;
      scheduleStatus: ScheduleStatus | null;
    };

const PANEL_CLASS =
  "rounded-[28px] border border-[rgba(15,118,110,0.14)] bg-white shadow-[0_18px_34px_rgba(15,118,110,0.08)]";
const INPUT_CLASS =
  "min-h-[46px] w-full rounded-2xl border border-[rgba(15,118,110,0.18)] bg-[#f8fcfb] px-4 text-[#173630] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)]";
const TEXTAREA_CLASS =
  "min-h-[144px] w-full rounded-2xl border border-[rgba(15,118,110,0.18)] bg-[#f8fcfb] px-4 py-3 text-[#173630] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)]";

const WEEKDAY_LABELS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const WEEKDAY_FULL_LABELS = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusLabel(
  status: ScheduleStatus | null,
  scope: ClinicHolidayScope,
  selectedStaffName: string | null,
) {
  if (status !== "holiday") {
    return "เปิดทำการ";
  }

  if (scope === "all") {
    return "หยุดทั้งคลินิก";
  }

  return selectedStaffName ? `${selectedStaffName} หยุด` : "หยุดรายคน";
}

function getCalendarStatusLabel(status: ScheduleStatus | null) {
  if (status === "holiday") {
    return "หยุด";
  }

  return "เปิด";
}

function getStatusBadgeClass(status: ScheduleStatus | null) {
  return cx(
    "inline-flex max-w-full items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-none sm:px-3 sm:py-1.5 sm:text-xs",
    status === "holiday" && "bg-[#fff7e6] text-[#b45309]",
    !status && "bg-[#eef4f2] text-[#53655f]",
  );
}

function buildCalendarDays(
  monthKey: string,
  selectedDate: string,
  todayDateKey: string,
  scheduleMap: Map<string, StaffScheduleEntry>,
) {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
  const leadingEmpty = firstDay.getUTCDay();
  const daysInMonth = lastDay.getUTCDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < leadingEmpty; index += 1) {
    cells.push({
      kind: "empty",
      key: `empty-${index}`,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
    const schedule = scheduleMap.get(dateKey) ?? null;

    cells.push({
      kind: "day",
      key: dateKey,
      dateKey,
      dayNumber: day,
      isToday: dateKey === todayDateKey,
      isPast: dateKey < todayDateKey,
      isSelected: dateKey === selectedDate,
      scheduleStatus: schedule?.status ?? null,
    });
  }

  return cells;
}

export default function AdminWorkSchedulePage() {
  const {
    currentMonthKey,
    deleting,
    error,
    form,
    formError,
    handleDelete,
    handleMonthChange,
    handleNoteChange,
    handleScopeChange,
    handleSelectDate,
    handleSelectWeekday,
    handleStaffChange,
    handleSubmit,
    hasAccess,
    holidayStaffOptions,
    loading,
    month,
    scheduleEntries,
    selectedDate,
    selectedSchedule,
    selectedStaff,
    selectedWeekday,
    submitting,
    todayDateKey,
    weekdayOptions,
  } = useAdminWorkSchedule();

  const scheduleMap = useMemo(
    () => new Map(scheduleEntries.map((entry) => [entry.workDate, entry])),
    [scheduleEntries],
  );

  const calendarCells = useMemo(() => {
    return buildCalendarDays(month, selectedDate, todayDateKey, scheduleMap);
  }, [month, scheduleMap, selectedDate, todayDateKey]);

  if (!hasAccess) {
    return null;
  }

  return (
    <main className="staff-shell text-[#173630]">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section className="staff-page-header">
          <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
            ตั้งวันหยุดรายเดือน
          </Typography.Title>
        </section>

        {error ? (
          <section
            className={cx(
              PANEL_CLASS,
              "border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm leading-7 text-[#be123c]",
            )}
          >
            {error}
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)]">
          <article className={cx(PANEL_CLASS, "p-5 md:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[1.35rem] font-semibold text-[#173630]">
                  {form.scope === "individual"
                    ? "เลือกวันในสัปดาห์"
                    : "ปฏิทินวันหยุดของเดือนที่เลือก"}
                </h2>
              </div>

              <div className="min-w-[220px]">
                <label className="mb-2 block text-sm font-bold text-[#33554d]">
                  เดือน
                </label>
                <input
                  type="month"
                  min={currentMonthKey}
                  value={month}
                  onChange={(event) => handleMonthChange(event.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {form.scope === "individual" ? (
              <div className="mt-6 rounded-[28px] border border-[rgba(15,118,110,0.12)] bg-[radial-gradient(circle_at_top_left,rgba(230,255,251,0.8),rgba(255,255,255,0.94)_48%),linear-gradient(180deg,#f8fcfb_0%,#eef8f5_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
                <div className="max-w-[28rem]">
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-[0.7rem] font-extrabold tracking-[0.12em] text-[#0f766e] shadow-[0_8px_18px_rgba(15,118,110,0.08)]">
                    INDIVIDUAL MODE
                  </span>
                  <h3 className="mt-3 text-[1.02rem] font-semibold text-[#173630]">
                    เลือกวันหยุดประจำของ {selectedStaff?.name ?? "บุคลากร"}
                  </h3>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {weekdayOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectWeekday(option.value)}
                      disabled={option.disabled}
                      className={cx(
                        "group min-h-[102px] rounded-[24px] border px-4 py-4 text-left transition",
                        selectedWeekday === option.value
                          ? "border-[#0f766e] bg-[linear-gradient(135deg,#dffaf5_0%,#f4fffd_100%)] text-[#0f766e] shadow-[0_16px_30px_rgba(15,118,110,0.14)]"
                          : "border-[rgba(15,118,110,0.12)] bg-white/92 text-[#47655e] shadow-[0_10px_20px_rgba(15,118,110,0.05)] hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(15,118,110,0.1)]",
                        option.disabled &&
                          "cursor-not-allowed border-[rgba(100,116,139,0.12)] bg-[#f8fafc] text-[#94a3b8] shadow-none hover:translate-y-0 hover:shadow-none",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cx(
                            "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-[0.76rem] font-extrabold tracking-[0.08em]",
                            selectedWeekday === option.value
                              ? "bg-[#0f766e] text-white"
                              : "bg-[#eef4f2] text-[#47655e]",
                            option.disabled && "bg-[#eef2f7] text-[#94a3b8]",
                          )}
                        >
                          {WEEKDAY_LABELS[option.value]}
                        </span>
                        <span
                          className={cx(
                            "inline-flex rounded-full px-2.5 py-1 text-[0.74rem] font-bold",
                            selectedWeekday === option.value
                              ? "bg-white text-[#0f766e]"
                              : "bg-[#f4f7f6] text-[#6a736c]",
                            option.disabled && "bg-[#eef2f7] text-[#94a3b8]",
                          )}
                        >
                          {option.count ? `${option.count} วัน` : "ไม่มีวัน"}
                        </span>
                      </div>

                      <strong className="mt-4 block text-[1rem] font-semibold">
                        {option.label}
                      </strong>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-bold tracking-[0.12em] text-[#6a736c]">
                  {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="px-2 py-2">
                      {label}
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-2">
                  {calendarCells.map((cell) =>
                    cell.kind === "empty" ? (
                      <div
                        key={cell.key}
                        className="min-h-[116px] rounded-[22px] border border-transparent"
                      />
                    ) : (
                      <button
                        key={cell.key}
                        type="button"
                        disabled={cell.isPast}
                        onClick={() => handleSelectDate(cell.dateKey)}
                        className={cx(
                          "min-h-[116px] rounded-[22px] border px-3 py-3 text-left transition",
                          cell.isSelected
                            ? "border-[#0f766e] bg-[#e6fffb] shadow-[0_14px_24px_rgba(15,118,110,0.1)]"
                            : "border-[rgba(15,118,110,0.12)] bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_18px_rgba(15,118,110,0.08)]",
                          cell.isPast &&
                            "cursor-not-allowed border-[rgba(100,116,139,0.12)] bg-[#f8fafc] text-[#94a3b8] shadow-none hover:translate-y-0 hover:shadow-none",
                        )}
                      >
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={cx(
                              "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                              cell.isToday
                                ? "bg-[#0f766e] text-white"
                                : cell.isSelected
                                  ? "bg-white text-[#0f766e]"
                                  : "bg-[#f1f5f4] text-[#173630]",
                            )}
                          >
                            {cell.dayNumber}
                          </span>
                          <span
                            className={cx(
                              getStatusBadgeClass(cell.scheduleStatus),
                              "w-fit",
                            )}
                          >
                            {getCalendarStatusLabel(cell.scheduleStatus)}
                          </span>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </>
            )}
          </article>

          <article className={cx(PANEL_CLASS, "p-5 md:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[1.35rem] font-semibold text-[#173630]">
                  ตั้งวันหยุดทั้งคลินิก / รายบุคคล
                </h2>
              </div>
              <span
                className={getStatusBadgeClass(
                  selectedSchedule?.status ?? null,
                )}
              >
                {getStatusLabel(
                  selectedSchedule?.status ?? null,
                  form.scope,
                  selectedStaff?.name ?? null,
                )}
              </span>
            </div>

            <div className="mt-5 space-y-4 rounded-[24px] border border-[rgba(15,118,110,0.12)] bg-[#f7fbfa] p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6a736c]">
                  วันที่ตัวอย่าง
                </p>
                <strong className="mt-2 block text-lg text-[#173630]">
                  {formatDateLabel(selectedDate)}
                </strong>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#33554d]">
                  รูปแบบการตั้งวันหยุด
                </span>
                <select
                  value={form.scope}
                  onChange={(event) =>
                    handleScopeChange(event.target.value as ClinicHolidayScope)
                  }
                  className={INPUT_CLASS}
                >
                  <option value="all">หยุดทั้งคลินิก</option>
                  <option value="individual">หยุดรายบุคคล</option>
                </select>
              </label>

              {form.scope === "individual" ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[#33554d]">
                      บุคลากร
                    </span>
                    <select
                      value={form.staffId}
                      onChange={(event) =>
                        handleStaffChange(event.target.value)
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="">เลือกบุคลากร</option>
                      {holidayStaffOptions.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                          {staff.roleLabel ? ` • ${staff.roleLabel}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#33554d]">
                  หมายเหตุวันหยุด
                </span>
                <textarea
                  maxLength={255}
                  value={form.note}
                  onChange={(event) => handleNoteChange(event.target.value)}
                  className={TEXTAREA_CLASS}
                  placeholder={
                    form.scope === "all"
                      ? "เช่น ปิดคลินิกทุกวันพุธของเดือนนี้"
                      : "เช่น หยุดประจำทุกวันในสัปดาห์ที่เลือกของเดือนนี้"
                  }
                />
              </label>

              {formError ? (
                <div className="rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting || deleting || loading}
                  className="inline-flex min-h-[48px] min-w-[220px] items-center justify-center rounded-full bg-[#0f766e] px-8 text-sm font-bold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-[#b9c9c4]"
                >
                  {submitting ? "กำลังบันทึก..." : "บันทึกทั้งเดือน"}
                </button>

                {selectedSchedule ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting || deleting || loading}
                    className="inline-flex min-h-[48px] min-w-[220px] items-center justify-center rounded-full border border-[#fda4af] bg-white px-8 text-sm font-bold text-[#be123c] transition hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:text-[#9ca3af]"
                  >
                    {deleting ? "กำลังลบ..." : "ลบทั้งเดือน"}
                  </button>
                ) : null}
              </div>
            </form>
          </article>
        </section>
      </div>
    </main>
  );
}
