"use client";

import { useState } from "react";
import { Card, Empty, Spin, Typography } from "antd";
import type { UseAdminReportResult } from "@/hooks/useAdminReport";
import type {
  AdminReportBreakdownItem,
  AdminReportDisplayTrendPoint,
  AdminReportPeriodMode,
  AdminReportStaffMetric,
} from "@/types/adminReport.types";

type AdminReportState = UseAdminReportResult;

const FILTER_INPUT_CLASS =
  "min-h-[46px] w-full rounded-[14px] border border-[rgba(15,118,110,0.16)] bg-white px-3.5 text-[#173f35] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[rgba(15,118,110,0.12)]";

const PERIOD_OPTIONS: Array<{
  value: AdminReportPeriodMode;
  label: string;
  caption: string;
}> = [
  {
    value: "month",
    label: "รายเดือน",
    caption: "ดูภาพรวมทั้งเดือนและแนวโน้มรายวัน",
  },
  {
    value: "year",
    label: "รายปี",
    caption: "สรุปทั้งปีและจัดกลุ่มแนวโน้มเป็นรายเดือน",
  },
];

const BREAKDOWN_COLORS = [
  "#0f766e",
  "#22a39a",
  "#7aa39a",
  "#d2a05f",
  "#5b8c83",
];

function formatNumber(value: number) {
  return value.toLocaleString("th-TH");
}

function formatCurrency(value: number) {
  return `฿${value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateLabel(dateKey?: string | null) {
  if (!dateKey) {
    return "-";
  }

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMetricCards(state: AdminReportState) {
  const summary = state.data?.summary;

  if (!summary) {
    return [];
  }

  return [
    {
      label: "ผู้รับบริการ",
      value: formatNumber(summary.uniquePatients),
      tone:
        "bg-[linear-gradient(135deg,#0f766e_0%,#134e4a_100%)] text-white shadow-[0_18px_40px_rgba(15,118,110,0.24)]",
    },
    {
      label: "นัดหมายทั้งหมด",
      value: formatNumber(summary.totalAppointments),
      tone:
        "bg-[linear-gradient(135deg,#def6f0_0%,#caebe2_100%)] text-[#173630]",
    },
    {
      label: "เคสปรึกษา",
      value: formatNumber(summary.totalConsultations),
      tone:
        "bg-[linear-gradient(135deg,#edf5f1_0%,#dfeae5_100%)] text-[#173630]",
    },
    {
      label: "รายรับรวม",
      value: formatCurrency(summary.totalRevenue),
      tone:
        "bg-[linear-gradient(135deg,#fcf1e4_0%,#f3e1ca_100%)] text-[#173630]",
    },
  ];
}

function getBreakdownColor(index: number) {
  return BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length];
}

function buildConicGradient(items: AdminReportBreakdownItem[]) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  if (!total) {
    return "conic-gradient(#e5e7eb 0deg 360deg)";
  }

  let current = 0;

  const segments = items.map((item, index) => {
    const start = current;
    const span = (item.count / total) * 360;
    current += span;

    return `${getBreakdownColor(index)} ${start}deg ${current}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function buildRevenuePath(
  points: AdminReportDisplayTrendPoint[],
  width: number,
  height: number,
  maxRevenue: number,
) {
  if (!points.length) {
    return "";
  }

  const left = 24;
  const top = 18;
  const innerWidth = width - left - 24;
  const innerHeight = height - top - 30;
  const step = innerWidth / Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = left + step * index;
      const y =
        top +
        innerHeight -
        (maxRevenue > 0 ? (point.revenue / maxRevenue) * innerHeight : 0);

      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

function getStaffProgress(metric: AdminReportStaffMetric, maxValue: number) {
  const workload = metric.appointmentCount + metric.consultationCount;

  if (maxValue <= 0) {
    return 0;
  }

  return Math.max(8, (workload / maxValue) * 100);
}

function shouldShowTrendLabel(
  index: number,
  total: number,
  mode: AdminReportPeriodMode,
) {
  if (mode === "year") {
    return true;
  }

  return index === 0 || index === total - 1 || index % 2 === 1;
}

export function AdminReportHeader() {
  return (
    <section className="staff-page-header">
      <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
        รายงานภาพรวม
      </Typography.Title>
    </section>
  );
}

export function AdminReportFilterSection({
  state,
}: {
  state: AdminReportState;
}) {
  return (
    <Card
      className="staff-content-card !mx-0 !max-w-none w-full overflow-hidden"
      variant="borderless"
      styles={{
        body: {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,249,247,0.96) 100%)",
        },
      }}
    >
      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <Typography.Title level={3} style={{ margin: 0 }}>
                {state.periodLabel}
              </Typography.Title>
              <Typography.Text className="staff-section-muted">
                เลือกรูปแบบรายงานและช่วงเวลาที่ต้องการวิเคราะห์
              </Typography.Text>
            </div>

            <div className="inline-flex shrink-0 flex-wrap gap-2 rounded-full border border-[rgba(15,118,110,0.12)] bg-[#f6fbfa] p-2">
              {PERIOD_OPTIONS.map((option) => {
                const isActive = state.reportMode === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => state.handleReportModeChange(option.value)}
                    className={[
                      "rounded-full px-4 py-2.5 text-sm font-bold transition",
                      isActive
                        ? "bg-[#0f766e] text-white shadow-[0_12px_24px_rgba(15,118,110,0.2)]"
                        : "bg-white text-[#33554d] hover:bg-[#ecf8f4]",
                    ].join(" ")}
                    title={option.caption}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid h-full content-start gap-4 rounded-[24px] border border-[rgba(15,118,110,0.12)] bg-white/80 p-4">
          {state.reportMode === "month" ? (
            <label className="grid gap-2">
              <span className="text-[0.88rem] font-bold text-[#33554d]">
                เดือน
              </span>
              <input
                type="month"
                className={FILTER_INPUT_CLASS}
                value={state.selectedMonth}
                onChange={(event) =>
                  state.handleSelectedMonthChange(event.target.value)
                }
              />
            </label>
          ) : null}

          {state.reportMode === "year" ? (
            <label className="grid gap-2">
              <span className="text-[0.88rem] font-bold text-[#33554d]">
                ปี
              </span>
              <input
                type="number"
                inputMode="numeric"
                min="2020"
                max="2100"
                className={FILTER_INPUT_CLASS}
                value={state.selectedYear}
                onChange={(event) =>
                  state.handleSelectedYearChange(event.target.value)
                }
              />
            </label>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function AdminReportErrorPanel({
  state,
}: {
  state: AdminReportState;
}) {
  if (!state.error) {
    return null;
  }

  return (
    <Card
      className="staff-content-card !mx-0 !max-w-none w-full"
      variant="borderless"
    >
      <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-[#be123c]">
        <p className="m-0 font-semibold">{state.error}</p>
        {state.authRequired ? (
          <button
            type="button"
            onClick={state.goToLogin}
            className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#0f766e] px-4 text-sm font-bold text-white"
          >
            ไปหน้าเข้าสู่ระบบ
          </button>
        ) : null}
      </div>
    </Card>
  );
}

export function AdminReportLoadingSection() {
  return (
    <Card
      className="staff-content-card !mx-0 !max-w-none w-full"
      variant="borderless"
    >
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <Spin size="large" />
        <Typography.Text className="staff-section-muted">
          กำลังโหลดรายงานจากฐานข้อมูล...
        </Typography.Text>
      </div>
    </Card>
  );
}

export function AdminReportSummarySection({
  state,
}: {
  state: AdminReportState;
}) {
  const cards = getMetricCards(state);

  return (
    <section className="mt-5 grid gap-4">
      <div className="grid gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className={`rounded-[22px] px-5 py-5 ${card.tone}`}
          >
            <p className="m-0 text-sm font-semibold opacity-80">{card.label}</p>
            <h3 className="m-0 mt-3 text-[2rem] font-bold leading-none">
              {card.value}
            </h3>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdminReportDashboardSection({
  state,
}: {
  state: AdminReportState;
}) {
  return (
    <section className="mt-5 grid gap-5">
      <TrendOverviewCard state={state} />

      <div className="grid items-stretch gap-5 xl:grid-cols-3">
        <div className="min-w-0">
          <BreakdownDonutCard
            title="ช่องทางการนัดหมาย"
            items={state.data?.appointmentTypeBreakdown ?? []}
          />
        </div>

        <div className="min-w-0">
          <BreakdownDonutCard
            title="สถานะการชำระเงิน"
            items={state.data?.paymentBreakdown ?? []}
          />
        </div>

        <div className="min-w-0">
          <ReportSnapshotCard state={state} />
        </div>
      </div>

      <div className="min-w-0">
        <TopStaffCard state={state} />
      </div>

      <div className="min-w-0">
        <ActivityFeedCardsSection state={state} />
      </div>
    </section>
  );
}

function TrendOverviewCard({ state }: { state: AdminReportState }) {
  const points = state.displayTrend;
  const maxCount = Math.max(
    1,
    ...points.map((point) =>
      Math.max(point.appointmentCount, point.consultationCount),
    ),
  );
  const maxRevenue = Math.max(1, ...points.map((point) => point.revenue));
  const countChartWidth = 1000;
  const countChartHeight = 284;
  const countLeft = 40;
  const countTop = 16;
  const countRight = 16;
  const countBottom = 28;
  const countInnerWidth = countChartWidth - countLeft - countRight;
  const countInnerHeight = countChartHeight - countTop - countBottom;
  const countStep = countInnerWidth / Math.max(points.length, 1);
  const groupWidth = Math.min(24, countStep * 0.64);
  const barGap = Math.min(4, groupWidth * 0.16);
  const barWidth = Math.max(5, (groupWidth - barGap) / 2);

  const revenueChartWidth = 1000;
  const revenueChartHeight = 168;
  const revenuePath = buildRevenuePath(
    points,
    revenueChartWidth,
    revenueChartHeight,
    maxRevenue,
  );

  return (
    <Card
      className="staff-content-card !mt-0 !mx-0 !max-w-none w-full min-w-0 overflow-hidden"
      variant="borderless"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            สถิติการนัดหมาย/ปรึกษา
          </Typography.Title>
        </div>
      </div>

      {points.length ? (
        <div className="mt-5 grid gap-4">
          <div className="rounded-[24px] border border-slate-100 bg-[#fcfefd] p-4">
            <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" />
                นัดหมาย
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#86b7ab]" />
                เคสปรึกษา
              </span>
            </div>

            <svg
              viewBox={`0 0 ${countChartWidth} ${countChartHeight}`}
              className="h-[284px] w-full"
              preserveAspectRatio="none"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = countTop + countInnerHeight * ratio;

                return (
                  <g key={ratio}>
                    <line
                      x1={countLeft}
                      y1={y}
                      x2={countChartWidth - countRight}
                      y2={y}
                      stroke="#dce8e4"
                      strokeDasharray="4 6"
                    />
                    <text x={6} y={y + 4} fontSize="12" fill="#74818a">
                      {Math.round(maxCount * (1 - ratio))}
                    </text>
                  </g>
                );
              })}

              {points.map((point, index) => {
                const centerX = countLeft + index * countStep + countStep / 2;
                const appointmentHeight =
                  (point.appointmentCount / maxCount) * countInnerHeight;
                const consultationHeight =
                  (point.consultationCount / maxCount) * countInnerHeight;

                return (
                  <g key={point.key}>
                    <rect
                      x={centerX - groupWidth / 2}
                      y={countTop + countInnerHeight - appointmentHeight}
                      width={barWidth}
                      height={appointmentHeight}
                      rx="4"
                      fill="#0f766e"
                    />
                    <rect
                      x={centerX - groupWidth / 2 + barWidth + barGap}
                      y={countTop + countInnerHeight - consultationHeight}
                      width={barWidth}
                      height={consultationHeight}
                      rx="4"
                      fill="#86b7ab"
                    />

                    {shouldShowTrendLabel(index, points.length, state.reportMode) ? (
                      <text
                        x={centerX}
                        y={countChartHeight - 8}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#68756c"
                      >
                        {point.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-[#fbf6ef] p-4">
            <div className="mb-3">
              <div>
                <p className="m-0 text-sm font-semibold text-[#173630]">แนวโน้มรายรับ</p>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${revenueChartWidth} ${revenueChartHeight}`}
              className="h-[168px] w-full"
              preserveAspectRatio="none"
            >
              <line
                x1="24"
                y1={revenueChartHeight - 30}
                x2={revenueChartWidth - 24}
                y2={revenueChartHeight - 30}
                stroke="#e6d3b4"
                strokeDasharray="4 6"
              />

              <path
                d={revenuePath}
                fill="none"
                stroke="#c58b45"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {points.map((point, index) => {
                const stepX =
                  (revenueChartWidth - 48) / Math.max(points.length - 1, 1);
                const x = 24 + stepX * index;
                const y =
                  18 +
                  (revenueChartHeight - 48) -
                  (maxRevenue > 0
                    ? (point.revenue / maxRevenue) * (revenueChartHeight - 48)
                    : 0);

                return (
                  <g key={`revenue-${point.key}`}>
                    <circle cx={x} cy={y} r="3.5" fill="#c58b45" />
                    {shouldShowTrendLabel(index, points.length, state.reportMode) ? (
                      <text
                        x={x}
                        y={revenueChartHeight - 8}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#85633b"
                      >
                        {point.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex h-full items-center">
          <Empty description="ยังไม่มีข้อมูลแนวโน้มในช่วงที่เลือก" />
        </div>
      )}
    </Card>
  );
}

function BreakdownDonutCard({
  items,
  title,
}: {
  items: AdminReportBreakdownItem[];
  title: string;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card
      className="staff-content-card !mt-0 !mx-0 !max-w-none w-full h-full min-w-0 overflow-hidden"
      variant="borderless"
      styles={{ body: { height: "100%" } }}
    >
      <Typography.Title level={4} style={{ margin: 0 }}>
        {title}
      </Typography.Title>

      {items.length ? (
        <div className="mt-5 grid h-full content-start gap-5">
          <div className="flex items-center justify-center">
            <div
              className="relative h-[180px] w-[180px] rounded-full"
              style={{ background: buildConicGradient(items) }}
            >
              <div className="absolute inset-[24px] flex items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(15,118,110,0.08)]">
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    ทั้งหมด
                  </p>
                  <p className="m-0 mt-1 text-[1.6rem] font-bold text-[#173630]">
                    {formatNumber(total)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {items.map((item, index) => {
              const percent = total > 0 ? (item.count / total) * 100 : 0;

              return (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-slate-100 bg-[#f8fbfa] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-semibold text-[#173630]">
                      <span
                        className="inline-flex h-3 w-3 rounded-full"
                        style={{ backgroundColor: getBreakdownColor(index) }}
                      />
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex h-full items-center">
          <Empty description="ยังไม่มีข้อมูลในช่วงที่เลือก" />
        </div>
      )}
    </Card>
  );
}

function TopStaffCard({ state }: { state: AdminReportState }) {
  const rows = (state.data?.topStaff ?? []).slice(0, 6);
  const maxWorkload = Math.max(
    1,
    ...rows.map((row) => row.appointmentCount + row.consultationCount),
  );

  return (
    <Card
      className="staff-content-card !mt-0 !mx-0 !max-w-none w-full h-full min-w-0 overflow-hidden"
      variant="borderless"
      styles={{ body: { height: "100%" } }}
    >
      <Typography.Title level={4} style={{ margin: 0 }}>
        บุคลากรที่มีภาระงานสูงสุด
      </Typography.Title>

      {rows.length ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {rows.map((row, index) => (
            <article
              key={row.staffId}
              className="rounded-[20px] border border-slate-100 bg-[#fbfdfc] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eefbf8] text-sm font-bold text-[#0f766e]">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="m-0 truncate text-[1rem] font-semibold text-[#173630]">
                        {row.staffName}
                      </p>
                      <p className="m-0 mt-1 text-sm text-slate-500">
                        {row.roleLabel}
                      </p>
                    </div>

                    <div className="text-right text-sm text-slate-600">
                      <div>{formatNumber(row.appointmentCount)} นัด</div>
                      <div>{formatNumber(row.consultationCount)} เคส</div>
                      <div className="font-semibold text-[#173630]">
                        {formatCurrency(row.revenue)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#7dbcae_0%,#0f766e_100%)]"
                      style={{
                        width: `${getStaffProgress(row, maxWorkload)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex h-full items-center">
          <Empty description="ยังไม่มีข้อมูลภาระงานในช่วงที่เลือก" />
        </div>
      )}
    </Card>
  );
}

function ReportSnapshotCard({ state }: { state: AdminReportState }) {
  const summary = state.data?.summary;

  return (
    <Card
      className="staff-content-card !mt-0 !mx-0 !max-w-none w-full h-full min-w-0 overflow-hidden"
      variant="borderless"
      styles={{ body: { height: "100%" } }}
    >
      <Typography.Title level={4} style={{ margin: 0 }}>
        ภาพรวมช่วงรายงาน
      </Typography.Title>

      <div className="mt-5 grid h-full content-start gap-3">
        <SnapshotItem
          label="รูปแบบ"
          value={state.reportMode === "month" ? "รายเดือน" : "รายปี"}
        />
        <SnapshotItem
          label="ช่วงข้อมูล"
          value={`${formatDateLabel(state.fromDate)} - ${formatDateLabel(state.toDate)}`}
        />
        <SnapshotItem
          label="นัดชำระแล้ว"
          value={`${formatNumber(summary?.paidAppointments ?? 0)} นัด`}
        />
        <SnapshotItem
          label="รอตรวจสอบ"
          value={`${formatNumber(summary?.pendingAppointments ?? 0)} นัด`}
        />
        <SnapshotItem
          label="ใบเสร็จทั้งหมด"
          value={`${formatNumber(summary?.totalReceipts ?? 0)} รายการ`}
        />
      </div>
    </Card>
  );
}

function SnapshotItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-[#f8fbfa] px-4 py-3">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="m-0 mt-2 text-sm font-semibold text-[#173630]">{value}</p>
    </div>
  );
}

function ActivityFeedCardsSection({ state }: { state: AdminReportState }) {
  return (
    <div className="grid w-full items-stretch gap-2 md:grid-cols-2 xl:grid-cols-3">
      <ActivityCard
        title="ใบเสร็จล่าสุด"
        tone="bg-[#faf1e5] text-[#a56a2b]"
        items={(state.data?.recentReceipts ?? []).slice(0, 5).map((row) => ({
          key: row.id,
          title: row.receiptNo,
          subtitle: row.patientName,
          badge: "การเงิน",
        }))}
      />

      <ActivityCard
        title="นัดหมายล่าสุด"
        tone="bg-[#eefbf8] text-[#0f766e]"
        items={(state.data?.recentAppointments ?? []).slice(0, 5).map((row) => ({
          key: row.id,
          title: row.patientName,
          subtitle: `${row.timeSelect ?? "-"} • ${row.staffName}`,
          badge: "นัดหมาย",
        }))}
      />

      <ActivityCard
        title="เคสปรึกษาล่าสุด"
        tone="bg-[#edf7f4] text-[#2f6e5d]"
        items={(state.data?.recentConsultations ?? []).slice(0, 5).map((row) => ({
          key: row.id,
          title: row.patientName,
          subtitle: row.staffName,
          badge: "เคส",
        }))}
      />
    </div>
  );
}

function ActivityCard({
  items,
  title,
  subtitle,
  tone,
}: {
  items: Array<{
    key: number;
    title: string;
    subtitle: string;
    badge: string;
  }>;
  title: string;
  subtitle?: string;
  tone: string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card
      className="staff-content-card !mt-0 !mx-0 !max-w-none w-full h-full min-w-0 overflow-hidden"
      variant="borderless"
      styles={{ body: { height: "100%" } }}
    >
      <div className="flex h-full min-h-[420px] flex-col">
        <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Typography.Title level={4} style={{ margin: 0, fontSize: "1.08rem" }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text className="staff-section-muted">
              {subtitle}
            </Typography.Text>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#e6fffb] px-2.5 py-1 text-[11px] font-bold text-[#0f766e]">
            {formatNumber(items.length)} รายการ
          </span>
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `ขยาย${title}` : `ย่อ${title}`}
            title={isCollapsed ? `ขยาย${title}` : `ย่อ${title}`}
            className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[rgba(15,118,110,0.16)] bg-white text-[#0f766e] transition hover:-translate-y-0.5"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className={[
                "h-[16px] w-[16px] transition-transform duration-200",
                isCollapsed ? "rotate-180" : "",
              ].join(" ")}
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

        {!isCollapsed ? <ActivitySection items={items} tone={tone} /> : null}
      </div>
    </Card>
  );
}

function ActivitySection({
  items,
  tone,
}: {
  items: Array<{
    key: number;
    title: string;
    subtitle: string;
    badge: string;
  }>;
  tone: string;
}) {
  return (
    <div className="mt-4 flex min-h-[320px] flex-1 flex-col rounded-[20px] border border-slate-100 bg-[#fbfdfc] p-4">
      {items.length ? (
        <div className="grid h-full auto-rows-fr gap-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex h-full items-center justify-between gap-3 rounded-[16px] border border-slate-100 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-semibold text-[#173630]">
                  {item.title}
                </p>
                <p className="m-0 truncate text-xs text-slate-500">
                  {item.subtitle}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="ยังไม่มีรายการล่าสุด" />
        </div>
      )}
    </div>
  );
}
