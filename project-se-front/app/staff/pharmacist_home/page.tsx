"use client";

import { useEffect, useMemo, useState } from "react";
import {
  consultationTotal,
  displayStatus,
  fetchPhamaOrders,
  formatDateTime,
  formatMoney,
  fullName,
  getToken,
  isOutstanding,
  latestReceipt,
  medicationComment,
  medicationSummary,
  OrdersResponse,
  STATUS_META,
} from "./shared";

export default function PharmacistHomePage() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);

      const accessToken = getToken();

      if (!accessToken) {
        setLoading(false);
        setError("ไม่พบ access_token สำหรับเรียก API");
        return;
      }

      try {
        const payload = await fetchPhamaOrders(accessToken);

        if (!ignore) {
          setData(payload);
        }
      } catch (caught) {
        if (!ignore) {
          setError(
            caught instanceof Error ? caught.message : "โหลดข้อมูลคิวจ่ายยาไม่สำเร็จ",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const consultations = data?.consultations ?? [];

  const queueCount = useMemo(
    () => consultations.filter((item) => isOutstanding(displayStatus(item))).length,
    [consultations],
  );

  const lineCount = useMemo(
    () => consultations.reduce((sum, item) => sum + item.prescription_items.length, 0),
    [consultations],
  );

  const filteredConsultations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return consultations
      .filter((consultation) => {
        const status = displayStatus(consultation);
        if (!isOutstanding(status)) {
          return false;
        }

        const haystack = [
          consultation.id,
          consultation.patient?.name,
          consultation.patient?.sur_name,
          consultation.staff?.name,
          consultation.staff?.sur_name,
          ...consultation.prescription_items.map((item) => item.medication?.name),
          ...consultation.prescription_items.map((item) => item.comment),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return !keyword || haystack.includes(keyword);
      })
      .sort((left, right) => {
        const leftStatus = displayStatus(left);
        const rightStatus = displayStatus(right);

        return (
          STATUS_META[leftStatus].rank - STATUS_META[rightStatus].rank ||
          new Date(right.created_at ?? 0).getTime() -
            new Date(left.created_at ?? 0).getTime()
        );
      });
  }, [consultations, search]);

  useEffect(() => {
    if (!filteredConsultations.length) {
      setSelectedId(null);
      return;
    }

    if (!filteredConsultations.some((item) => item.id === selectedId)) {
      setSelectedId(filteredConsultations[0].id);
    }
  }, [filteredConsultations, selectedId]);

  const selected =
    filteredConsultations.find((item) => item.id === selectedId) ??
    consultations.find((item) => item.id === selectedId) ??
    null;

  const selectedStatus = selected ? displayStatus(selected) : "no_receipt";
  const selectedReceipt = selected ? latestReceipt(selected) : null;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                PHAMA-HOME
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">ดูคิวจ่ายยา</h1>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="คิวที่ต้องทำ" value={queueCount} />
              <StatCard label="consultations" value={data?.totalConsultations ?? 0} />
              <StatCard label="รายการยา" value={lineCount} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาคนไข้ / consultation / ยา"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

            <InfoPill label="อัปเดตล่าสุด" value={formatDateTime(data?.generatedAt)} />
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            กำลังโหลดข้อมูลคิวจ่ายยา...
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">รายการคิว</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {filteredConsultations.length}
              </span>
            </div>

            <div className="space-y-2">
              {filteredConsultations.length ? (
                filteredConsultations.map((consultation) => {
                  const active = consultation.id === selected?.id;
                  const status = displayStatus(consultation);

                  return (
                    <button
                      key={consultation.id}
                      type="button"
                      onClick={() => setSelectedId(consultation.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">Consultation {consultation.id}</p>
                          <p className={`mt-1 text-sm ${active ? "text-slate-100" : "text-slate-700"}`}>
                            {fullName(consultation.patient)}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            active
                              ? "border-white/20 bg-white/10 text-white"
                              : STATUS_META[status].tone
                          }`}
                        >
                          {STATUS_META[status].label}
                        </span>
                      </div>

                      <div className={`mt-3 space-y-1 text-xs ${active ? "text-slate-200" : "text-slate-500"}`}>
                        <p>แพทย์ {fullName(consultation.staff)}</p>
                        <p>{medicationSummary(consultation)}</p>
                        <p>รวม {formatMoney(consultationTotal(consultation))}</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <EmptyState body="ไม่พบคิวที่ยังไม่ได้จัดส่งตามตัวกรองนี้" />
              )}
            </div>
          </aside>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            {selected ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Consultation {selected.id}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                      {fullName(selected.patient)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      วันที่ {formatDateTime(selected.created_at)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium ${STATUS_META[selectedStatus].tone}`}
                  >
                    {STATUS_META[selectedStatus].label}
                  </span>
                </div>

                <dl className="grid max-w-2xl grid-cols-[96px_minmax(0,1fr)] gap-y-3 text-sm sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-x-6">
                  <dt className="font-medium text-slate-500">คนไข้</dt>
                  <dd className="font-medium text-slate-900">{fullName(selected.patient)}</dd>

                  <dt className="font-medium text-slate-500">แพทย์</dt>
                  <dd className="font-medium text-slate-900">{fullName(selected.staff)}</dd>

                  <dt className="font-medium text-slate-500">เภสัชกร</dt>
                  <dd className="font-medium text-slate-900">
                    {selected.pharmacist ? fullName(selected.pharmacist) : "ยังไม่รับคิว"}
                  </dd>

                  <dt className="font-medium text-slate-500">ยอดรวม</dt>
                  <dd className="font-medium text-slate-900">
                    {formatMoney(consultationTotal(selected))}
                  </dd>
                </dl>

                {selected.patient?.allergy_drug ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    แพ้ยา: {selected.patient.allergy_drug}
                  </div>
                ) : null}

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-semibold text-slate-900">รายการยาคร่าว ๆ</h3>
                  </div>

                  {selected.prescription_items.length ? (
                    <div className="divide-y divide-slate-200">
                      {selected.prescription_items.map((item) => (
                        <article
                          key={item.id}
                          className="flex items-start justify-between gap-4 px-5 py-4 text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {item.medication?.name ?? `medication #${item.medication_id}`}
                            </p>
                            <p className="mt-1 text-slate-500">
                              {medicationComment(item.comment)}
                            </p>
                          </div>
                          <div className="text-right text-slate-600">
                            <p>{item.quantity ?? 0} แผง</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5">
                      <EmptyState body="consultation นี้ไม่มีรายการยา" />
                    </div>
                  )}
                </section>

                <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">receipt ล่าสุด</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedReceipt
                        ? `อัปเดตเมื่อ ${formatDateTime(selectedReceipt.created_at)}`
                        : "คิวนี้ยังไม่มี receipt"}
                    </p>
                  </div>

                  <div className="md:items-end">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
                    >
                      ไปหน้าจ่ายยา
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState body="เลือก consultation ทางซ้ายเพื่อดูรายละเอียด" />
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

function InfoPill({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm leading-6 text-slate-900">{value ?? "-"}</p>
    </div>
  );
}

function EmptyState({ body }: { body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
      {body}
    </div>
  );
}
