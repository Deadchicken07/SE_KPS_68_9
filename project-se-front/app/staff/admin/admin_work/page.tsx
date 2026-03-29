"use client";

import { Typography } from "antd";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { useAdminWorkSchedule } from "@/hooks/useAdminWorkSchedule";
import type { ScheduleStatus } from "@/types/staffAdminHome.types";

const PANEL_CLASS =
  "rounded-[28px] border border-[rgba(15,118,110,0.14)] bg-white shadow-[0_18px_34px_rgba(15,118,110,0.08)]";
const INPUT_CLASS =
  "min-h-[46px] w-full rounded-2xl border border-[rgba(15,118,110,0.18)] bg-[#f8fcfb] px-4 text-[#173630] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)]";
const TEXTAREA_CLASS =
  "min-h-[144px] w-full rounded-2xl border border-[rgba(15,118,110,0.18)] bg-[#f8fcfb] px-4 py-3 text-[#173630] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)]";
const WEEKDAY_SHORT_LABELS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getStatusLabel(
  status: ScheduleStatus | null,
  selectedStaffName: string | null,
) {
  if (status !== "holiday") {
    return "เปิดทำการ";
  }

  return selectedStaffName ? `${selectedStaffName} หยุด` : "วันหยุด";
}

function getStatusBadgeClass(status: ScheduleStatus | null) {
  return cx(
    "inline-flex max-w-full items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold leading-none",
    status === "holiday" && "bg-[#fff7e6] text-[#b45309]",
    !status && "bg-[#eef4f2] text-[#53655f]",
  );
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
    handleSelectWeekday,
    handleStaffChange,
    handleSubmit,
    hasAccess,
    holidayStaffOptions,
    isFetching,
    isLoading,
    month,
    selectedSchedule,
    selectedStaff,
    selectedWeekday,
    submitting,
    weekdayOptions,
  } = useAdminWorkSchedule();

  if (isLoading) {
    return <PageSkeleton cards={[{ rows: 6 }, { rows: 8 }]} />;
  }

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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)]">
          <article className={cx(PANEL_CLASS, "p-5 md:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-[34rem]">
                <h2 className="text-[1.35rem] font-semibold text-[#173630]">
                  เลือกวันหยุดประจำสัปดาห์
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#64748b]">
                  เลือกวันในสัปดาห์เพื่อกำหนดให้บุคลากรที่เลือกหยุดทุกสัปดาห์ของเดือนนี้
                </p>
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

            <div className="mt-6 rounded-[28px] border border-[rgba(15,118,110,0.12)] bg-[radial-gradient(circle_at_top_left,rgba(230,255,251,0.8),rgba(255,255,255,0.94)_48%),linear-gradient(180deg,#f8fcfb_0%,#eef8f5_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                    <div className="flex items-start gap-3">
                      <span
                        className={cx(
                          "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-[0.76rem] font-extrabold tracking-[0.08em]",
                          selectedWeekday === option.value
                            ? "bg-[#0f766e] text-white"
                            : "bg-[#eef4f2] text-[#47655e]",
                          option.disabled && "bg-[#eef2f7] text-[#94a3b8]",
                        )}
                      >
                        {WEEKDAY_SHORT_LABELS[option.value]}
                      </span>
                    </div>

                    <strong className="mt-4 block text-[1rem] font-semibold">
                      {option.label}
                    </strong>
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className={cx(PANEL_CLASS, "p-5 md:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[1.35rem] font-semibold text-[#173630]">
                  ตั้งวันหยุดรายบุคคล
                </h2>
              </div>
              <span className={getStatusBadgeClass(selectedSchedule?.status ?? null)}>
                {getStatusLabel(
                  selectedSchedule?.status ?? null,
                  selectedStaff?.name ?? null,
                )}
              </span>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#33554d]">
                  บุคลากร
                </span>
                <select
                  value={form.staffId}
                  onChange={(event) => handleStaffChange(event.target.value)}
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

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#33554d]">
                  หมายเหตุวันหยุด
                </span>
                <textarea
                  maxLength={255}
                  value={form.note}
                  onChange={(event) => handleNoteChange(event.target.value)}
                  className={TEXTAREA_CLASS}
                  placeholder="เช่น หยุดประจำทุกวันในสัปดาห์ที่เลือกของเดือนนี้"
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
                  disabled={submitting || deleting || isFetching}
                  className="inline-flex min-h-[48px] min-w-[220px] items-center justify-center rounded-full bg-[#0f766e] px-8 text-sm font-bold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-[#b9c9c4]"
                >
                  {submitting ? "กำลังบันทึก..." : "บันทึกทั้งเดือน"}
                </button>

                {selectedSchedule ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting || deleting || isFetching}
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
