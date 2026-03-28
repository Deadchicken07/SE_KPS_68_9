"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type {
  PsychiatristDashboardData,
  PsychologistDashboardData,
} from "@/lib/role-dashboard-api";
import { mapRoleIdToRole, roleHome } from "@/types/role.types";
import type {
  AppointmentItem,
  ClinicScheduleResponse,
  DailyStat,
} from "@/types/staffAdminHome.types";
import {
  BOARD_BACKGROUND,
  BOARD_HEADER_BACKGROUND,
  EMPTY_CLASS,
  HERO_BACKGROUND,
  INPUT_CLASS,
  PAGE_BACKGROUND,
  PANEL_CLASS,
  PANEL_META_CLASS,
  TIMELINE_LANE_BACKGROUND,
  TIMELINE_LANE_SELECTED_BACKGROUND,
  WEEKDAY_LABELS,
  buildTimeMarkers,
  cx,
  formatCompactDateLabel,
  formatDateLabel,
  formatMonthLabel,
  formatTimeLabel,
  getDayTone,
  getMonthWeekOptions,
  getStatusBadgeClasses,
  getTimelineBounds,
  getTimelineEvents,
  parseErrorMessage,
} from "@/utils/staffAdminHome";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type SupportedRole = "psychiatrist" | "psychologist";
type RoleDashboardData = PsychiatristDashboardData | PsychologistDashboardData;

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

type InsightSectionItem = {
  key: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  badge?: string;
};

type InsightSection = {
  eyebrow: string;
  title: string;
  description: string;
  emptyText: string;
  items: InsightSectionItem[];
  columns?: 1 | 2;
};

type ClinicalRoleWeeklyDashboardProps = {
  role: SupportedRole;
};

const ROLE_CONFIG = {
  psychiatrist: {
    roleId: 4,
    dashboardPath: "/psychiatrist-dashboard",
    kicker: "CLINICAL PSYCHIATRY",
    title: "ตารางงานจิตแพทย์รายสัปดาห์",
    description:
      "อ้างอิงภาษาดีไซน์จากหน้า admin-home พร้อมคงข้อมูลนัดและข้อมูลสรุปจาก backend ของจิตแพทย์ตามคนที่ล็อกอินอยู่",
    queueTitle: "รายการนัดของวันที่เลือก",
    queueDescription:
      "เลือกวันจากตารางด้านบนเพื่อดูนัดของจิตแพทย์แบบละเอียดในโครงหน้าเดียวกับ admin",
    detailTitle: "รายละเอียดนัดหมายที่เลือก",
    detailDescription:
      "ใช้ข้อมูลนัดจริงจาก backend เพื่อดูภาพรวมเคสและข้อมูลติดต่อที่จำเป็น",
  },
  psychologist: {
    roleId: 3,
    dashboardPath: "/psychologist-dashboard",
    kicker: "CLINICAL PSYCHOLOGY",
    title: "ตารางงานนักจิตวิทยารายสัปดาห์",
    description:
      "อ้างอิงภาษาดีไซน์จากหน้า admin-home พร้อมคงข้อมูล session และข้อมูลสรุปจาก backend ของนักจิตวิทยาตามคนที่ล็อกอินอยู่",
    queueTitle: "รายการ session ของวันที่เลือก",
    queueDescription:
      "เลือกวันจากตารางด้านบนเพื่อดู session ของนักจิตวิทยาแบบละเอียดในโครงหน้าเดียวกับ admin",
    detailTitle: "รายละเอียด session ที่เลือก",
    detailDescription:
      "ใช้ข้อมูลนัดจริงจาก backend เพื่อดูภาพรวม session และข้อมูลติดต่อที่จำเป็น",
  },
} satisfies Record<
  SupportedRole,
  {
    roleId: number;
    dashboardPath: string;
    kicker: string;
    title: string;
    description: string;
    queueTitle: string;
    queueDescription: string;
    detailTitle: string;
    detailDescription: string;
  }
>;

export function ClinicalRoleWeeklyDashboard({
  role,
}: ClinicalRoleWeeklyDashboardProps) {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const config = ROLE_CONFIG[role];
  const [month, setMonth] = useState(() => getCurrentMonthKey());
  const [selectedDate, setSelectedDate] = useState(() => getCurrentDateKey());
  const [scheduleData, setScheduleData] = useState<ClinicScheduleResponse | null>(
    null,
  );
  const [roleData, setRoleData] = useState<RoleDashboardData | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!me?.role_id) {
      router.replace("/login");
      return;
    }

    if (me.role_id !== config.roleId) {
      const mappedRole = mapRoleIdToRole(me.role_id);
      router.replace(mappedRole ? roleHome[mappedRole] : "/user");
    }
  }, [authLoading, config.roleId, me?.role_id, router]);

  useEffect(() => {
    const staffId = me?.sub ?? null;

    if (authLoading || !staffId || me?.role_id !== config.roleId) {
      return;
    }

    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      setAuthRequired(false);

      const scheduleQuery = new URLSearchParams({
        month,
        date: selectedDate,
        staffId: String(staffId),
      });
      const dashboardQuery = new URLSearchParams({
        staffId: String(staffId),
      });

      try {
        const [scheduleResponse, roleResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/staff-home/clinic-schedule?${scheduleQuery.toString()}`,
            {
              cache: "no-store",
              credentials: "include",
            },
          ),
          fetch(
            `${API_BASE_URL}${config.dashboardPath}?${dashboardQuery.toString()}`,
            {
              cache: "no-store",
              credentials: "include",
            },
          ),
        ]);

        const [schedulePayload, rolePayload] = await Promise.all([
          scheduleResponse.json().catch(() => null),
          roleResponse.json().catch(() => null),
        ]);

        if (!scheduleResponse.ok) {
          if (scheduleResponse.status === 401 || scheduleResponse.status === 403) {
            throw new Error("__AUTH__");
          }

          throw new Error(parseErrorMessage(schedulePayload));
        }

        if (!roleResponse.ok) {
          if (roleResponse.status === 401 || roleResponse.status === 403) {
            throw new Error("__AUTH__");
          }

          throw new Error(parseErrorMessage(rolePayload));
        }

        if (ignore) {
          return;
        }

        const nextScheduleData = schedulePayload as ClinicScheduleResponse;
        setScheduleData(nextScheduleData);
        setRoleData(rolePayload as RoleDashboardData);
        setSelectedDate(nextScheduleData.selectedDate ?? selectedDate);
      } catch (caught) {
        if (ignore) {
          return;
        }

        if (caught instanceof Error && caught.message === "__AUTH__") {
          setAuthRequired(true);
          setError("session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        } else if (caught instanceof Error) {
          setError(caught.message || "โหลดข้อมูล dashboard ไม่สำเร็จ");
        } else {
          setError("โหลดข้อมูล dashboard ไม่สำเร็จ");
        }

        setScheduleData(null);
        setRoleData(null);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [
    authLoading,
    config.dashboardPath,
    config.roleId,
    me?.role_id,
    me?.sub,
    month,
    reloadKey,
    selectedDate,
  ]);

  useEffect(() => {
    const selectedDateAppointments = scheduleData?.selectedDateAppointments ?? [];

    if (!selectedDateAppointments.length) {
      setSelectedAppointmentId(null);
      return;
    }

    setSelectedAppointmentId((current) => {
      if (
        current &&
        selectedDateAppointments.some((appointment) => appointment.id === current)
      ) {
        return current;
      }

      return selectedDateAppointments[0].id;
    });
  }, [scheduleData?.selectedDateAppointments]);

  const weekStats = useMemo(() => scheduleData?.weekStats ?? [], [scheduleData]);
  const weekAppointments = useMemo(
    () => scheduleData?.weekAppointments ?? [],
    [scheduleData],
  );
  const selectedDateAppointments = useMemo(
    () => scheduleData?.selectedDateAppointments ?? [],
    [scheduleData],
  );
  const upcomingAppointments = useMemo(
    () => scheduleData?.upcomingAppointments ?? [],
    [scheduleData],
  );
  const summaryCards = roleData?.summaryCards ?? [];

  const timelineBounds = useMemo(
    () => getTimelineBounds(weekAppointments),
    [weekAppointments],
  );
  const timeMarkers = useMemo(
    () => buildTimeMarkers(timelineBounds),
    [timelineBounds],
  );
  const weekRows = useMemo(
    () =>
      weekStats.map((day) => ({
        ...day,
        ...getTimelineEvents(
          weekAppointments.filter((item) => item.appointmentDate === day.date),
          timelineBounds,
        ),
      })),
    [timelineBounds, weekAppointments, weekStats],
  );
  const monthWeekOptions = useMemo(() => getMonthWeekOptions(month), [month]);
  const activeWeekStart =
    scheduleData?.weekRange?.start ??
    monthWeekOptions.find(
      (option) => selectedDate >= option.start && selectedDate <= option.end,
    )?.start ??
    null;
  const selectedDayStats =
    weekStats.find((item) => item.date === selectedDate) ?? null;
  const selectedAppointment =
    selectedDateAppointments.find((item) => item.id === selectedAppointmentId) ??
    null;
  const currentStaffName = [me?.name, me?.sur_name].filter(Boolean).join(" ");
  const extraSections = useMemo(
    () => buildRoleSections(role, roleData, upcomingAppointments),
    [role, roleData, upcomingAppointments],
  );

  const handleDateChange = (dateKey: string) => {
    setSelectedDate(dateKey);
    setMonth(dateKey.slice(0, 7));
  };

  const handleMonthChange = (nextMonth: string) => {
    if (!nextMonth) {
      return;
    }

    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  };

  return (
    <main
      className="min-h-screen px-4 pb-10 pt-6 text-[#18312c] sm:px-6 lg:px-7 lg:pb-14 lg:pt-8"
      style={{ background: PAGE_BACKGROUND }}
    >
      <div className="mx-auto grid max-w-[1420px] gap-6">
        <HeroSection
          kicker={config.kicker}
          title={config.title}
          description={config.description}
          selectedStaffName={currentStaffName || "-"}
          weekRange={scheduleData?.weekRange ?? null}
        />

        <FilterSection
          loading={loading}
          month={month}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onMonthChange={handleMonthChange}
          onReload={() => setReloadKey((current) => current + 1)}
        />

        {error ? (
          <ErrorPanel
            authRequired={authRequired}
            error={error}
            onLogin={() => router.push("/login")}
          />
        ) : null}

        <SummarySection cards={summaryCards} loading={loading} />

        <TimelineSection
          activeWeekStart={activeWeekStart}
          month={month}
          monthWeekOptions={monthWeekOptions}
          onDateChange={handleDateChange}
          onSelectAppointment={setSelectedAppointmentId}
          selectedAppointmentId={selectedAppointment?.id ?? null}
          selectedDate={selectedDate}
          timeMarkers={timeMarkers}
          timelineBounds={timelineBounds}
          weekRows={weekRows}
        />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SelectedAppointmentsSection
            appointments={selectedDateAppointments}
            onSelect={setSelectedAppointmentId}
            selectedAppointmentId={selectedAppointment?.id ?? null}
            selectedDate={selectedDate}
            selectedDayStats={selectedDayStats}
            title={config.queueTitle}
            description={config.queueDescription}
          />
          <SelectedAppointmentDetailSection
            appointment={selectedAppointment}
            description={config.detailDescription}
            title={config.detailTitle}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {extraSections.map((section) => (
            <InsightSectionCard key={section.title} section={section} />
          ))}
        </section>
      </div>
    </main>
  );
}

function HeroSection({
  kicker,
  title,
  description,
  selectedStaffName,
  weekRange,
}: {
  kicker: string;
  title: string;
  description: string;
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
            {kicker}
          </span>
          <h1 className="mt-4 text-[clamp(2rem,3vw,3.1rem)] font-semibold leading-[1.08]">
            {title}
          </h1>
          <p className="mt-3 leading-7 text-[rgba(255,253,248,0.82)]">
            {description}
          </p>
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
              บุคลากรที่กำลังดู
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

function FilterSection({
  loading,
  month,
  selectedDate,
  onDateChange,
  onMonthChange,
  onReload,
}: {
  loading: boolean;
  month: string;
  selectedDate: string;
  onDateChange: (dateKey: string) => void;
  onMonthChange: (monthKey: string) => void;
  onReload: () => void;
}) {
  return (
    <section
      className={cx(
        PANEL_CLASS,
        "grid grid-cols-1 gap-4 p-[22px] md:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]",
      )}
    >
      <label className="grid gap-2" htmlFor="role-dashboard-month">
        <span className="text-[0.88rem] font-bold text-[#33554d]">เลือกเดือน</span>
        <input
          id="role-dashboard-month"
          type="month"
          value={month}
          onChange={(event) => onMonthChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </label>

      <label className="grid gap-2" htmlFor="role-dashboard-date">
        <span className="text-[0.88rem] font-bold text-[#33554d]">
          วันที่กำลังดู
        </span>
        <input
          id="role-dashboard-date"
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </label>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onReload}
          disabled={loading}
          className="min-h-[46px] w-full rounded-[14px] bg-gradient-to-br from-[#1f5d4f] to-[#2e7464] px-4 font-bold text-[#fffdfa] shadow-[0_14px_28px_rgba(31,93,79,0.18)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
        </button>
      </div>
    </section>
  );
}

function ErrorPanel({
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
          className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-xl bg-[#1f5d4f] px-4 font-bold text-[#fffdfa]"
        >
          ไปหน้าเข้าสู่ระบบ
        </button>
      ) : null}
    </div>
  );
}

function SummarySection({
  cards,
  loading,
}: {
  cards: SummaryCard[];
  loading: boolean;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.length ? (
        cards.map((card) => (
          <article key={card.label} className={cx(PANEL_CLASS, "p-5")}>
            <span className="mb-2 block text-[0.78rem] font-bold text-[#68756c]">
              {card.label}
            </span>
            <strong className="block text-[1.95rem] leading-none">
              {card.value}
            </strong>
            <p className="mt-2 text-[0.84rem] leading-6 text-[#6d776f]">
              {card.detail}
            </p>
          </article>
        ))
      ) : (
        <article className={cx(PANEL_CLASS, "p-5 md:col-span-2 xl:col-span-4")}>
          <span className="text-[0.9rem] text-[#5f6b62]">
            {loading
              ? "กำลังโหลดสรุปข้อมูลจาก backend..."
              : "ยังไม่มีสรุปข้อมูลจาก backend ในตอนนี้"}
          </span>
        </article>
      )}
    </section>
  );
}

function TimelineSection({
  activeWeekStart,
  month,
  monthWeekOptions,
  onDateChange,
  onSelectAppointment,
  selectedAppointmentId,
  selectedDate,
  timeMarkers,
  timelineBounds,
  weekRows,
}: {
  activeWeekStart: string | null;
  month: string;
  monthWeekOptions: Array<{
    index: number;
    start: string;
    end: string;
    anchorDate: string;
    rangeLabel: string;
  }>;
  onDateChange: (dateKey: string) => void;
  onSelectAppointment: (appointmentId: number) => void;
  selectedAppointmentId: number | null;
  selectedDate: string;
  timeMarkers: number[];
  timelineBounds: { start: number; end: number; span: number };
  weekRows: Array<
    DailyStat & {
      events: ReturnType<typeof getTimelineEvents>["events"];
      laneHeight: number;
    }
  >;
}) {
  return (
    <article className={PANEL_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
        <div>
          <h2 className="text-[1.32rem] font-semibold text-[#173630]">
            ปฏิทินตารางงานรายสัปดาห์
          </h2>
          <p className="mt-2 text-[0.94rem] leading-7 text-[#68756c]">
            เลือกสัปดาห์และวันเพื่อดูตารางนัดจริงจาก backend ของบุคลากรที่ล็อกอินอยู่
          </p>
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
              onClick={() => onDateChange(option.anchorDate)}
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
              {timeMarkers.map((minute) => (
                <div
                  key={minute}
                  className="absolute top-[18px] -translate-x-1/2 text-[0.76rem] font-extrabold text-[#776b58]"
                  style={{
                    left: `${((minute - timelineBounds.start) / timelineBounds.span) * 100}%`,
                  }}
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
                    onClick={() => onDateChange(day.date)}
                    className={cx(
                      "border-r border-[#62635b24] px-[14px] py-[18px] text-left",
                      isSelected &&
                        "shadow-[inset_0_0_0_3px_rgba(255,255,255,0.78)]",
                    )}
                    style={{ background: tone.fill, color: tone.ink }}
                  >
                    <span className="mb-1.5 block text-[0.72rem] font-extrabold tracking-[0.08em]">
                      {WEEKDAY_LABELS[new Date(`${day.date}T00:00:00`).getDay()]}
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
                    onClick={() => onDateChange(day.date)}
                  >
                    {laneLines.map((minute) => (
                      <span
                        key={`${day.date}-${minute}`}
                        className="absolute inset-y-0 w-px bg-[#68655b1a]"
                        style={{
                          left: `${((minute - timelineBounds.start) / timelineBounds.span) * 100}%`,
                        }}
                      />
                    ))}

                    {day.events.length ? (
                      day.events.map((event) => {
                        const isActive =
                          event.appointment.id === selectedAppointmentId;

                        return (
                          <button
                            key={event.appointment.id}
                            type="button"
                            title={`${event.range.label} • ${event.appointment.patientName} • ${event.appointment.staffName}`}
                            className={cx(
                              "absolute flex h-[60px] flex-col justify-between overflow-hidden rounded-2xl border px-2.5 py-2 text-left shadow-[0_8px_14px_rgba(114,93,46,0.08)] transition hover:-translate-y-0.5",
                              isActive &&
                                "shadow-[0_0_0_2px_rgba(30,94,79,0.24),0_14px_22px_rgba(72,65,49,0.14)]",
                            )}
                            style={{
                              left: `${event.left}%`,
                              width: `${event.width}%`,
                              top: `${event.top}px`,
                              background: event.tone.fill,
                              borderColor: event.tone.border,
                            }}
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              onDateChange(day.date);
                              onSelectAppointment(event.appointment.id);
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
                        ยังไม่มีนัดในวันนี้
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

function SelectedAppointmentsSection({
  appointments,
  onSelect,
  selectedAppointmentId,
  selectedDate,
  selectedDayStats,
  title,
  description,
}: {
  appointments: AppointmentItem[];
  onSelect: (appointmentId: number) => void;
  selectedAppointmentId: number | null;
  selectedDate: string;
  selectedDayStats: DailyStat | null;
  title: string;
  description: string;
}) {
  return (
    <article className={PANEL_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-4 p-[24px_24px_18px]">
        <div>
          <h2 className="text-[1.32rem] font-semibold text-[#173630]">{title}</h2>
          <p className="mt-2 text-[0.94rem] leading-7 text-[#68756c]">
            {formatDateLabel(selectedDate)} • {description}
          </p>
        </div>
        <span className={PANEL_META_CLASS}>{appointments.length} รายการ</span>
      </div>

      <div className="grid gap-3.5 px-[22px] pb-[22px]">
        {appointments.length ? (
          appointments.map((appointment) => (
            <article
              key={appointment.id}
              onClick={() => onSelect(appointment.id)}
              className={cx(
                "cursor-pointer rounded-[22px] border border-[#4b615a1f] bg-[#fffdfa] p-4",
                appointment.id === selectedAppointmentId &&
                  "border-[#236b5a42] shadow-[0_12px_22px_rgba(30,94,79,0.08)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-[#eff5f0] px-3 py-2 text-[0.85rem] font-extrabold text-[#1f5d4f]">
                  {getAppointmentTimeLabel(appointment)}
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
                <InfoBox label="รูปแบบ" value={appointment.appointmentTypeLabel} />
                <InfoBox label="ชำระเงิน" value={appointment.paymentStatusLabel} />
                <InfoBox label="อีเมล" value={appointment.patientEmail ?? "-"} />
                <InfoBox label="เบอร์โทร" value={appointment.patientPhone ?? "-"} />
              </div>
            </article>
          ))
        ) : (
          <div className={EMPTY_CLASS}>
            ยังไม่มีรายการนัดในวันที่เลือก หรือ backend ยังไม่มีข้อมูลสำหรับวันดังกล่าว
          </div>
        )}
      </div>

      <div className="px-[22px] pb-[22px] text-[0.84rem] leading-6 text-[#6d776f]">
        ภาพรวมวันนี้: ชำระแล้ว {selectedDayStats?.paidAppointments ?? 0} นัด •
        ออนไลน์ {selectedDayStats?.onlineAppointments ?? 0} นัด • ผู้รับบริการ{" "}
        {selectedDayStats?.uniquePatients ?? 0} คน
      </div>
    </article>
  );
}

function SelectedAppointmentDetailSection({
  appointment,
  description,
  title,
}: {
  appointment: AppointmentItem | null;
  description: string;
  title: string;
}) {
  return (
    <article className={PANEL_CLASS}>
      <div className="border-b border-[#4b615a1c] p-[24px_24px_18px]">
        <h2 className="text-[1.32rem] font-semibold text-[#173630]">{title}</h2>
        <p className="mt-2 text-[0.94rem] leading-7 text-[#68756c]">
          {description}
        </p>
      </div>

      <div className="p-[22px]">
        {appointment ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-[#edf3ee] px-3 py-1 text-[0.76rem] font-extrabold tracking-[0.12em] text-[#33554d]">
                  {formatDateLabel(appointment.appointmentDate ?? getCurrentDateKey())}
                </span>
                <h3 className="mt-3 text-[1.7rem] font-semibold text-[#173630]">
                  {appointment.patientName}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-7 text-[#6d776f]">
                  ดูแลโดย {appointment.staffName}
                  {appointment.staffRoleLabel ? ` • ${appointment.staffRoleLabel}` : ""}
                </p>
              </div>
              <span className={getStatusBadgeClasses(appointment.displayStatus)}>
                {appointment.displayStatusLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoBox label="เวลา" value={getAppointmentTimeLabel(appointment)} />
              <InfoBox label="รูปแบบนัด" value={appointment.appointmentTypeLabel} />
              <InfoBox label="สถานะชำระเงิน" value={appointment.paymentStatusLabel} />
              <InfoBox label="อีเมล" value={appointment.patientEmail ?? "-"} />
              <InfoBox label="เบอร์โทร" value={appointment.patientPhone ?? "-"} />
              <InfoBox label="ความเชี่ยวชาญ" value={appointment.staffSpecialty ?? "-"} />
            </div>
          </div>
        ) : (
          <div className={EMPTY_CLASS}>
            เลือกรายการนัดจากแผงด้านซ้ายหรือจากตารางด้านบนเพื่อดูรายละเอียด
          </div>
        )}
      </div>
    </article>
  );
}

function InsightSectionCard({ section }: { section: InsightSection }) {
  const layoutClass =
    section.columns === 2 ? "grid gap-3 md:grid-cols-2" : "space-y-3";

  return (
    <article className={PANEL_CLASS}>
      <div className="border-b border-[#4b615a1c] p-[24px_24px_18px]">
        <p className="text-[0.76rem] font-extrabold uppercase tracking-[0.12em] text-[#5a6d66]">
          {section.eyebrow}
        </p>
        <h2 className="mt-2 text-[1.32rem] font-semibold text-[#173630]">
          {section.title}
        </h2>
        <p className="mt-2 text-[0.94rem] leading-7 text-[#68756c]">
          {section.description}
        </p>
      </div>

      <div className="p-[22px]">
        {section.items.length ? (
          <div className={layoutClass}>
            {section.items.map((item) => (
              <article
                key={item.key}
                className="rounded-[22px] border border-[#4b615a1f] bg-[#fffdfa] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {item.eyebrow ? (
                      <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-[#6d776f]">
                        {item.eyebrow}
                      </p>
                    ) : null}
                    <h3 className="mt-1 text-[1.02rem] font-semibold text-[#173630]">
                      {item.title}
                    </h3>
                    {item.subtitle ? (
                      <p className="mt-1 text-[0.9rem] text-[#5e6c65]">
                        {item.subtitle}
                      </p>
                    ) : null}
                  </div>
                  {item.badge ? (
                    <span className="inline-flex rounded-full bg-[#edf3ee] px-3 py-1 text-[0.75rem] font-extrabold text-[#33554d]">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                {item.body ? (
                  <p className="mt-3 text-[0.92rem] leading-7 text-[#6d776f]">
                    {item.body}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className={EMPTY_CLASS}>{section.emptyText}</div>
        )}
      </div>
    </article>
  );
}

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#f6f4ed] px-[13px] py-3">
      <span className="mb-1 block text-[0.76rem] font-bold text-[#6a736c]">
        {label}
      </span>
      <strong className="text-[0.95rem] text-[#18312c]">{value}</strong>
    </div>
  );
}

function buildRoleSections(
  role: SupportedRole,
  dashboard: RoleDashboardData | null,
  upcomingAppointments: AppointmentItem[],
) {
  const sections: InsightSection[] = [
    buildUpcomingAppointmentsSection(upcomingAppointments),
  ];

  if (!dashboard) {
    return sections;
  }

  if (role === "psychiatrist") {
    const data = dashboard as PsychiatristDashboardData;

    sections.push(
      {
        eyebrow: "Consultations",
        title: "เคสที่ต้องตัดสินใจต่อ",
        description:
          "consultation ที่ backend สรุปว่ายังต้องปิดงานหรือยืนยันแผนรักษาต่อ",
        emptyText: "ยังไม่มี consultation ที่ต้องตัดสินใจต่อในตอนนี้",
        items: data.consultations.map((item) => ({
          key: item.id,
          eyebrow: item.userId,
          title: item.id,
          body: item.note,
          badge: item.status,
        })),
      },
      {
        eyebrow: "Assessments",
        title: "ผลประเมินล่าสุดของผู้รับบริการ",
        description:
          "ผลแบบประเมินที่เชื่อมจาก backend เพื่อใช้เตรียมประเด็นก่อนนัดติดตาม",
        emptyText: "ยังไม่มีผลประเมินล่าสุดในตอนนี้",
        items: data.recentAssessments.map((item) => ({
          key: `${item.patient}-${item.questionnaire}-${item.submittedAt}`,
          title: item.patient,
          subtitle: item.questionnaire,
          body: item.summary,
          badge: item.submittedAt,
        })),
      },
      {
        eyebrow: "Medication Review",
        title: "รายการยาที่ควรทบทวน",
        description:
          "รายการยาที่ backend สรุปขึ้นมาเพื่อช่วยทบทวนก่อนปรับยาหรือสั่งจ่ายต่อ",
        emptyText: "ยังไม่มีรายการยาที่ต้องทบทวนในตอนนี้",
        columns: 2,
        items: data.medicationReview.map((item) => ({
          key: `${item.name}-${item.quantity}`,
          title: item.name,
          subtitle: `จำนวน ${item.quantity}`,
          badge: `${item.quantity} หน่วย`,
        })),
      },
    );

    return sections;
  }

  const data = dashboard as PsychologistDashboardData;

  sections.push(
    {
      eyebrow: "Insights",
      title: "Insight ที่ควรอ่านก่อนเริ่ม session",
      description:
        "สรุป insight จากแบบประเมินที่ backend ส่งกลับมาเพื่อใช้เตรียมหัวข้อคุย",
      emptyText: "ยังไม่มี insight ใหม่จาก backend ในตอนนี้",
      items: data.insights.map((item) => ({
        key: item.responseId,
        title: item.title,
        subtitle: `${item.responseId} • ${item.userId}`,
        body: item.insight,
        badge: item.submittedAt,
      })),
    },
    {
      eyebrow: "Consultations",
      title: "เคสที่กำลังติดตามต่อเนื่อง",
      description:
        "consultation ที่ยัง active หรือยังต้องอัปเดต note ต่อจาก backend",
      emptyText: "ยังไม่มี consultation ที่ต้องติดตามต่อเนื่องในตอนนี้",
      items: data.activeConsultations.map((item) => ({
        key: item.id,
        eyebrow: item.userId,
        title: item.id,
        body: item.note,
        badge: item.status,
      })),
    },
    {
      eyebrow: "Recent Responses",
      title: "ผลตอบแบบประเมินล่าสุด",
      description:
        "ผลตอบล่าสุดจากผู้รับบริการที่ backend สรุปไว้เพื่อใช้ประกอบการเตรียม session ถัดไป",
      emptyText: "ยังไม่มีผลตอบแบบประเมินล่าสุดในตอนนี้",
      items: data.recentResponses.map((item) => ({
        key: `${item.patient}-${item.questionnaire}-${item.submittedAt}`,
        title: item.patient,
        subtitle: item.questionnaire,
        body: item.summary,
        badge: item.submittedAt,
      })),
    },
  );

  return sections;
}

function buildUpcomingAppointmentsSection(
  upcomingAppointments: AppointmentItem[],
): InsightSection {
  return {
    eyebrow: "Upcoming",
    title: "นัดหมายถัดไปของสัปดาห์นี้",
    description:
      "รายการนัดถัดไปจาก backend ของบุคลากรที่ล็อกอินอยู่ เพื่อให้เห็นคิวต่อจากตารางด้านบน",
    emptyText: "ยังไม่มีนัดหมายถัดไปในช่วงเวลานี้",
    items: upcomingAppointments.map((appointment) => ({
      key: String(appointment.id),
      title: appointment.patientName,
      subtitle: `${formatDateLabel(
        appointment.appointmentDate ?? getCurrentDateKey(),
      )} • ${getAppointmentTimeLabel(appointment)}`,
      body: appointment.staffName,
      badge: appointment.displayStatusLabel,
    })),
  };
}

function getAppointmentTimeLabel(appointment: AppointmentItem) {
  const rangeLabel =
    [appointment.startTime, appointment.endTime].filter(Boolean).join(" - ") || "-";

  return appointment.timeSelect ?? rangeLabel;
}

function getCurrentMonthKey() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0")].join(
    "-",
  );
}

function getCurrentDateKey() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}
