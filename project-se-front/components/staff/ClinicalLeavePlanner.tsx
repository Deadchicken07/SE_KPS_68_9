'use client';

import { useMemo } from 'react';
import { Typography } from 'antd';
import { useClinicalLeaveSchedule } from '@/hooks/useClinicalLeaveSchedule';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { cx, formatDateLabel } from '@/utils/staffAdminHome';
import type {
  ScheduleStatus,
  StaffScheduleEntry,
} from '@/types/staffAdminHome.types';

type ClinicalRole = 'psychiatrist' | 'psychologist';

type ClinicalLeavePlannerProps = {
  role: ClinicalRole;
  kicker: string;
  title: string;
};

type CalendarCell =
  | {
      kind: 'empty';
      key: string;
    }
  | {
      kind: 'day';
      key: string;
      dateKey: string;
      dayNumber: number;
      isToday: boolean;
      isPast: boolean;
      isSelected: boolean;
      scheduleStatus: ScheduleStatus | null;
    };

const PANEL_CLASS =
  'rounded-[28px] border border-[rgba(15,118,110,0.14)] bg-white shadow-[0_18px_34px_rgba(15,118,110,0.08)]';
const INPUT_CLASS =
  'min-h-[46px] w-full rounded-2xl border border-[rgba(15,118,110,0.18)] bg-[#f8fcfb] px-4 text-[#173630] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)]';
const TEXTAREA_CLASS =
  'min-h-[144px] w-full rounded-2xl border border-[rgba(15,118,110,0.18)] bg-[#f8fcfb] px-4 py-3 text-[#173630] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)]';
const WEEKDAY_LABELS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

function getStatusLabel(status: ScheduleStatus | null) {
  if (status === 'working') {
    return 'ทำงาน';
  }

  if (status === 'leave') {
    return 'ลา';
  }

  if (status === 'holiday') {
    return 'ลา';
  }

  return 'ยังไม่ลงตาราง';
}

function getStatusBadgeClass(status: ScheduleStatus | null) {
  return cx(
    'inline-flex max-w-full items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-none sm:px-3 sm:py-1.5 sm:text-xs',
    status === 'working' && 'bg-[#e6fffb] text-[#0f766e]',
    status === 'leave' && 'bg-[#fff1f2] text-[#be123c]',
    status === 'holiday' && 'bg-[#fff7d6] text-[#9a6700]',
    !status && 'bg-[#eef4f2] text-[#53655f]',
  );
}

function buildCalendarDays(
  monthKey: string,
  selectedDate: string,
  todayDateKey: string,
  scheduleMap: Map<string, StaffScheduleEntry>,
) {
  const [yearText, monthText] = monthKey.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
  const leadingEmpty = firstDay.getUTCDay();
  const daysInMonth = lastDay.getUTCDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < leadingEmpty; index += 1) {
    cells.push({
      kind: 'empty',
      key: `empty-${index}`,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
    const schedule = scheduleMap.get(dateKey) ?? null;

    cells.push({
      kind: 'day',
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

export function ClinicalLeavePlanner({
  role,
  kicker,
  title,
}: ClinicalLeavePlannerProps) {
  const {
    currentMonthKey,
    deleting,
    error,
    form,
    formError,
    handleDelete,
    handleMonthChange,
    handleNoteChange,
    handleSelectDate,
    handleStatusChange,
    handleSubmit,
    hasAccess,
    isFetching,
    isLoading,
    month,
    scheduleEntries,
    selectedDate,
    selectedSchedule,
    submitting,
    todayDateKey,
  } = useClinicalLeaveSchedule(role);

  const scheduleMap = useMemo(
    () => new Map(scheduleEntries.map((entry) => [entry.workDate, entry])),
    [scheduleEntries],
  );

  const calendarCells = useMemo(
    () => buildCalendarDays(month, selectedDate, todayDateKey, scheduleMap),
    [month, scheduleMap, selectedDate, todayDateKey],
  );

  if (isLoading) {
    return <PageSkeleton cards={[{ rows: 4 }, { rows: 8 }]} />;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <main className="staff-shell text-[#173630]">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section className="staff-page-header">
          <Typography.Text className="staff-kicker">{kicker}</Typography.Text>
          <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
            {title}
          </Typography.Title>
        </section>

        {error ? (
          <section
            className={cx(
              PANEL_CLASS,
              'border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm leading-7 text-[#be123c]',
            )}
          >
            {error}
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
          <article className={cx(PANEL_CLASS, 'p-5 md:p-6')}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[1.35rem] font-semibold text-[#173630]">
                  ปฏิทินการลางานรายเดือน
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

            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-bold tracking-[0.12em] text-[#6a736c]">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="px-2 py-2">
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarCells.map((cell) =>
                cell.kind === 'empty' ? (
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
                      'min-h-[116px] rounded-[22px] border px-3 py-3 text-left transition',
                      cell.isSelected
                        ? 'border-[#0f766e] bg-[#e6fffb] shadow-[0_14px_24px_rgba(15,118,110,0.1)]'
                        : 'border-[rgba(15,118,110,0.12)] bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_18px_rgba(15,118,110,0.08)]',
                      cell.isPast &&
                        'cursor-not-allowed border-[rgba(100,116,139,0.12)] bg-[#f8fafc] text-[#94a3b8] shadow-none hover:translate-y-0 hover:shadow-none',
                    )}
                  >
                    <div className="flex flex-col items-start gap-2">
                      <span
                        className={cx(
                          'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          cell.isToday
                            ? 'bg-[#0f766e] text-white'
                            : cell.isSelected
                              ? 'bg-white text-[#0f766e]'
                              : 'bg-[#f1f5f4] text-[#173630]',
                        )}
                      >
                        {cell.dayNumber}
                      </span>
                      <span className={cx(getStatusBadgeClass(cell.scheduleStatus), 'w-fit')}>
                        {getStatusLabel(cell.scheduleStatus)}
                      </span>
                    </div>
                  </button>
                ),
              )}
            </div>
          </article>

          <article className={cx(PANEL_CLASS, 'p-5 md:p-6')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-[1.35rem] font-semibold text-[#173630]">
                จัดการวันลา
              </h2>

              <span className={getStatusBadgeClass(selectedSchedule?.status ?? null)}>
                {selectedSchedule
                  ? getStatusLabel(selectedSchedule.status)
                  : 'ยังไม่ลงตาราง'}
              </span>
            </div>

            <div className="mt-5 rounded-[24px] border border-[rgba(15,118,110,0.12)] bg-[#f7fbfa] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6a736c]">
                วันที่เลือก
              </p>
              <strong className="mt-2 block text-lg text-[#173630]">
                {formatDateLabel(selectedDate)}
              </strong>
            </div>

            <form className="mt-6 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
              <div>
                <label className="mb-2 block text-sm font-bold text-[#33554d]">
                  สถานะตารางงาน
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('working')}
                    className={cx(
                      'rounded-2xl border px-4 py-3 text-left transition',
                      form.status === 'working'
                        ? 'border-[#0f766e] bg-[#e6fffb] text-[#0f766e]'
                        : 'border-[rgba(15,118,110,0.12)] bg-white text-[#173630]',
                    )}
                  >
                    <strong className="block text-sm">ทำงาน</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('leave')}
                    className={cx(
                      'rounded-2xl border px-4 py-3 text-left transition',
                      form.status === 'leave'
                        ? 'border-[#be123c] bg-[#fff1f2] text-[#be123c]'
                        : 'border-[rgba(15,118,110,0.12)] bg-white text-[#173630]',
                    )}
                  >
                    <strong className="block text-sm">ลา</strong>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#33554d]">
                  หมายเหตุ
                </label>
                <textarea
                  value={form.note}
                  onChange={(event) => handleNoteChange(event.target.value)}
                  className={TEXTAREA_CLASS}
                  placeholder="เหตุผล ผู้ติดต่อแทน หรือหมายเหตุสำหรับคลินิก"
                />
              </div>

              {formError ? (
                <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
                  {formError}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <button
                  type="submit"
                  disabled={submitting || isFetching}
                  className="min-h-[48px] rounded-2xl bg-[#0f766e] px-5 font-semibold text-white transition hover:bg-[#0d6760] disabled:cursor-wait disabled:opacity-70"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกวันลา'}
                </button>

                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={!selectedSchedule || deleting || isFetching}
                  className="min-h-[48px] rounded-2xl border border-[rgba(15,118,110,0.18)] px-5 font-semibold text-[#173630] transition hover:border-[#0f766e] hover:text-[#0f766e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? 'กำลังล้างข้อมูล...' : 'ล้างข้อมูลวันดังกล่าว'}
                </button>
              </div>
            </form>
          </article>
        </section>
      </div>
    </main>
  );
}

function ClinicalLeavePlannerSkeleton() {
  return <PageSkeleton cards={[{ rows: 4 }, { rows: 8 }]} />;
}
