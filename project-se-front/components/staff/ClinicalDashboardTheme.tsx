"use client";

import { useMemo, useState } from "react";

type MetricCard = {
  label: string;
  value: string;
  detail: string;
};

type PrimaryItemMeta = {
  label: string;
  value: string;
};

type PrimaryItem = {
  key: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  badge?: string;
  meta?: PrimaryItemMeta[];
};

type DashboardItem = {
  key: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  badge?: string;
  meta?: string[];
};

type DashboardSection = {
  eyebrow: string;
  title: string;
  description?: string;
  items: DashboardItem[];
  emptyText: string;
  columns?: 1 | 2;
};

type ClinicalDashboardThemeProps = {
  kicker: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  metrics: MetricCard[];
  primarySection: {
    title: string;
    description: string;
    items: PrimaryItem[];
    emptyText: string;
  };
  detailSection: {
    title: string;
    description: string;
    emptyText: string;
  };
  sideSections: DashboardSection[];
  bottomSections: DashboardSection[];
};

export function ClinicalDashboardTheme({
  kicker,
  title,
  subtitle,
  updatedAt,
  metrics,
  primarySection,
  detailSection,
  sideSections,
  bottomSections,
}: ClinicalDashboardThemeProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(
    primarySection.items[0]?.key ?? null,
  );

  const selectedItem = useMemo(
    () =>
      primarySection.items.find((item) => item.key === selectedKey) ??
      primarySection.items[0] ??
      null,
    [primarySection.items, selectedKey],
  );

  return (
    <main className="staff-shell text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="mb-2">
          <p className="staff-kicker">{kicker}</p>
          <h1 className="mt-4 text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-tight tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500">
            {subtitle}
          </p>
          <p className="mt-2 text-sm text-slate-400">อัปเดตล่าสุด {updatedAt}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricSummaryCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {primarySection.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {primarySection.description}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {primarySection.items.length}
                </span>
              </div>
            </div>

            <div className="max-h-[780px] overflow-y-auto p-3">
              {primarySection.items.length ? (
                <div className="space-y-3">
                  {primarySection.items.map((item) => (
                    <PrimaryQueueCard
                      key={item.key}
                      active={item.key === selectedItem?.key}
                      item={item}
                      onSelect={setSelectedKey}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState body={primarySection.emptyText} />
              )}
            </div>
          </aside>

          <div className="grid gap-6">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {detailSection.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {detailSection.description}
                </p>
              </div>

              <div className="p-5">
                {selectedItem ? (
                  <SelectedItemPanel item={selectedItem} />
                ) : (
                  <EmptyState body={detailSection.emptyText} />
                )}
              </div>
            </section>

            {sideSections.map((section) => (
              <DashboardSectionCard key={section.title} section={section} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {bottomSections.map((section) => (
            <DashboardSectionCard key={section.title} section={section} />
          ))}
        </section>
      </div>
    </main>
  );
}

function MetricSummaryCard({ metric }: { metric: MetricCard }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{metric.label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {metric.value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{metric.detail}</p>
    </article>
  );
}

function PrimaryQueueCard({
  active,
  item,
  onSelect,
}: {
  active: boolean;
  item: PrimaryItem;
  onSelect: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.key)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 xl:w-[220px]">
            {item.eyebrow ? (
              <p
                className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                  active ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {item.eyebrow}
              </p>
            ) : null}
            <p className="mt-2 text-base font-semibold">{item.title}</p>
            {item.subtitle ? (
              <p
                className={`mt-1 text-sm ${
                  active ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {item.subtitle}
              </p>
            ) : null}
          </div>

          {item.badge ? (
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                active
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {item.badge}
            </span>
          ) : null}
        </div>

        {item.meta?.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {item.meta.map((meta) => (
              <QueueMetaCard
                key={`${item.key}-${meta.label}`}
                active={active}
                label={meta.label}
                value={meta.value}
              />
            ))}
          </div>
        ) : null}

        {item.body ? (
          <p
            className={`text-sm leading-6 ${
              active ? "text-slate-200" : "text-slate-600"
            }`}
          >
            {item.body}
          </p>
        ) : null}
      </div>
    </button>
  );
}

function QueueMetaCard({
  active,
  label,
  value,
}: {
  active: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        active
          ? "border-white/10 bg-white/5 text-slate-100"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <p
        className={`text-[11px] uppercase tracking-[0.14em] ${
          active ? "text-slate-300" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function SelectedItemPanel({ item }: { item: PrimaryItem }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          {item.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {item.eyebrow}
            </p>
          ) : null}
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            {item.title}
          </h3>
          {item.subtitle ? (
            <p className="mt-2 text-sm text-slate-500">{item.subtitle}</p>
          ) : null}
        </div>

        {item.badge ? (
          <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
            {item.badge}
          </span>
        ) : null}
      </div>

      {item.meta?.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {item.meta.map((meta) => (
            <section
              key={`${item.key}-detail-${meta.label}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {meta.label}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {meta.value}
              </p>
            </section>
          ))}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="border-b border-slate-200 pb-4">
          <h4 className="text-base font-semibold text-slate-900">
            รายละเอียดรายการที่เลือก
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            ส่วนนี้ใช้สำหรับสรุปข้อมูลของรายการที่เลือกจากฝั่งซ้ายในโทนเดียวกับหน้าเภสัช
          </p>
        </div>
        <div className="pt-4">
          <p className="text-sm leading-7 text-slate-600">
            {item.body || "ยังไม่มีรายละเอียดเพิ่มเติมสำหรับรายการนี้"}
          </p>
        </div>
      </section>
    </div>
  );
}

function DashboardSectionCard({ section }: { section: DashboardSection }) {
  const layoutClass =
    section.columns === 2 ? "grid gap-3 md:grid-cols-2" : "space-y-3";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {section.eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          {section.title}
        </h2>
        {section.description ? (
          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
        ) : null}
      </div>

      <div className="p-4">
        {section.items.length ? (
          <div className={layoutClass}>
            {section.items.map((item) => (
              <article
                key={item.key}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {item.eyebrow ? (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {item.eyebrow}
                      </p>
                    ) : null}
                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    {item.subtitle ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {item.subtitle}
                      </p>
                    ) : null}
                  </div>
                  {item.badge ? (
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                {item.body ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.body}
                  </p>
                ) : null}

                {item.meta?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.meta.map((value) => (
                      <span
                        key={`${item.key}-${value}`}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState body={section.emptyText} />
        )}
      </div>
    </section>
  );
}

function EmptyState({ body }: { body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
      {body}
    </div>
  );
}
