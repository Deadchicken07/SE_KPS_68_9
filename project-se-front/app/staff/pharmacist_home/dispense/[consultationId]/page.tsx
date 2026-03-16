"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
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
  medicationName,
  OrdersResponse,
  PHARMACIST_STATUS_OPTIONS,
  STATUS_META,
  textValue,
} from "../../shared";

export default function PharmacistDispensePage() {
  const params = useParams<{ consultationId: string }>();
  const consultationId = Number(params.consultationId);

  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [trackingDraft, setTrackingDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [reloadKey]);

  const consultation = useMemo(() => {
    if (!Number.isFinite(consultationId)) {
      return null;
    }

    return (
      data?.consultations.find(
        (item) =>
          item.id === consultationId && isOutstanding(displayStatus(item)),
      ) ?? null
    );
  }, [consultationId, data]);

  const selectedReceipt = consultation ? latestReceipt(consultation) : null;
  const selectedStatus = consultation ? displayStatus(consultation) : "no_receipt";

  useEffect(() => {
    setStatusDraft(selectedStatus === "no_receipt" ? "pending_delivery" : selectedStatus);
    setTrackingDraft(selectedReceipt?.tracking ?? "");
  }, [selectedReceipt?.id, selectedReceipt?.tracking, selectedStatus]);

  async function updateReceiptStatus() {
    if (!consultation) {
      return;
    }

    const accessToken = getToken();

    if (!accessToken) {
      setError("ไม่พบ access_token สำหรับอัปเดต receipts.status");
      return;
    }

    const trimmed = statusDraft.trim();
    const tracking = trackingDraft.trim();

    if (!trimmed) {
      setError("กรอก receipts.status ก่อนบันทึก");
      return;
    }

    if (trimmed === "delivered" && !tracking) {
      setError("กรอกเลขพัสดุก่อนปิดงาน");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/phama-home/orders/${consultation.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: trimmed, tracking }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof payload?.message === "string"
            ? payload.message
            : "อัปเดต receipts.status ไม่สำเร็จ",
        );
      }

      setReloadKey((value) => value + 1);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "อัปเดต receipts.status ไม่สำเร็จ",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              PHAMA-HOME
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">หน้าจ่ายยา</h1>
          </div>

          <Link
            href="/staff/pharmacist_home"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            กลับหน้าคิวจ่ายยา
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            กำลังโหลดข้อมูล...
          </div>
        ) : null}

        {!loading && !consultation ? (
          <EmptyState body="ไม่พบ consultation นี้ หรือคิวนี้ถูกจัดส่งแล้ว" />
        ) : null}

        {consultation ? (
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Consultation {consultation.id}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                      {fullName(consultation.patient)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      วันที่ {formatDateTime(consultation.created_at)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium ${STATUS_META[selectedStatus].tone}`}
                  >
                    {STATUS_META[selectedStatus].label}
                  </span>
                </div>

                <dl className="mt-5 grid max-w-2xl grid-cols-[96px_minmax(0,1fr)] gap-y-3 text-sm sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-x-6">
                  <dt className="font-medium text-slate-500">คนไข้</dt>
                  <dd className="font-medium text-slate-900">{fullName(consultation.patient)}</dd>

                  <dt className="font-medium text-slate-500">แพทย์</dt>
                  <dd className="font-medium text-slate-900">{fullName(consultation.staff)}</dd>

                  <dt className="font-medium text-slate-500">เภสัชกร</dt>
                  <dd className="font-medium text-slate-900">
                    {consultation.pharmacist
                      ? fullName(consultation.pharmacist)
                      : "ยังไม่รับคิว"}
                  </dd>

                  <dt className="font-medium text-slate-500">ยอดรวม</dt>
                  <dd className="font-medium text-slate-900">
                    {formatMoney(consultationTotal(consultation))}
                  </dd>
                </dl>

                {consultation.patient?.allergy_drug ? (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    แพ้ยา: {consultation.patient.allergy_drug}
                  </div>
                ) : null}
              </section>

              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-lg font-semibold text-slate-900">รายการยาที่ต้องจ่าย</h3>
                </div>

                {consultation.prescription_items.length ? (
                  <div className="divide-y divide-slate-200">
                    {consultation.prescription_items.map((item) => {
                      const subtotal =
                        (item.medication?.retail ?? 0) * (item.quantity ?? 0);

                      return (
                        <article
                          key={item.id}
                          className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between"
                        >
                          <div>
                            <h4 className="text-base font-semibold text-slate-900">
                              {medicationName(item)}
                            </h4>
                            <p className="mt-1 text-sm text-slate-600">
                              จำนวน {item.quantity ?? 0} แผง
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              วิธีใช้: {medicationComment(item.comment)}
                            </p>
                          </div>

                          <div className="text-sm text-slate-600 md:text-right">
                            <p>ราคาต่อแผง {formatMoney(item.medication?.retail ?? null)}</p>
                            <p className="mt-1 font-medium text-slate-900">
                              รวม {formatMoney(subtotal)}
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5">
                    <EmptyState body="consultation นี้ไม่มีรายการยา" />
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-lg font-semibold text-slate-900">receipt ล่าสุด</h3>
                </div>

                <div className="p-5">
                  {selectedReceipt ? (
                    <div className="space-y-3">
                      <InfoCard label="สถานะ" value={STATUS_META[selectedStatus].label} />
                      <InfoCard label="เวลา" value={formatDateTime(selectedReceipt.created_at)} />
                      <InfoCard label="tracking" value={selectedReceipt.tracking} />
                      <InfoCard label="ยอดรวม" value={formatMoney(selectedReceipt.total)} />
                    </div>
                  ) : (
                    <EmptyState body="consultation นี้ยังไม่มี receipt" />
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-lg font-semibold text-slate-900">จัดส่งและปิดงาน</h3>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap gap-2">
                    {PHARMACIST_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusDraft(status)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                          statusDraft === status
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {status}
                      </button>
                      ))}
                  </div>

                  <input
                    value={trackingDraft}
                    onChange={(event) => setTrackingDraft(event.target.value)}
                    placeholder="เลขพัสดุ"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
                  />

                  <button
                    type="button"
                    onClick={updateReceiptStatus}
                    disabled={saving}
                    className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "กำลังบันทึก..."
                      : statusDraft.trim() === "delivered"
                        ? "บันทึกและปิดงาน"
                        : "บันทึกสถานะ"}
                  </button>
                </div>
              </section>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm leading-6 text-slate-900">{textValue(value)}</p>
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
