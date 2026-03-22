"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ReceiptStatusValue =
  | "pending_delivery"
  | "delivered"
  | "pending_pickup"
  | "picked_up"
  | "cancelled";

type DisplayStatus = ReceiptStatusValue | "no_receipt";

type PersonRecord = {
  user_id: number;
  name: string;
  sur_name: string;
  email?: string | null;
  phone?: string | null;
  allergy_drug?: string | null;
  info?: string | null;
  role_name?: string | null;
};

type MedicationRecord = {
  id: number;
  name: string;
  price: number | null;
  retail: number | null;
};

type PrescriptionItemRecord = {
  id: number;
  consultation_id: number | null;
  medication_id: number | null;
  comment: string | null;
  quantity: number | null;
  medication: MedicationRecord | null;
};

type ReceiptRecord = {
  id: number;
  consultation_id: number | null;
  user_id: number | null;
  created_at: string | null;
  slip_file: string | null;
  total: number | null;
  tracking: string | null;
  status: string | null;
};

type ConsultationRecord = {
  id: number;
  user_id: number | null;
  staff_id: number | null;
  pharmacist_id: number | null;
  note: string | null;
  created_at: string | null;
  patient: PersonRecord | null;
  staff: PersonRecord | null;
  pharmacist: PersonRecord | null;
  prescription_items: PrescriptionItemRecord[];
  receipts: ReceiptRecord[];
};

type OrdersResponse = {
  generatedAt: string;
  totalConsultations: number;
  consultations: ConsultationRecord[];
};

const STATUS_META: Record<
  DisplayStatus,
  { label: string; tone: string; rank: number }
> = {
  no_receipt: {
    label: "ยังไม่มีใบเสร็จ",
    tone: "border-slate-200 bg-slate-100 text-slate-700",
    rank: 0,
  },
  pending_pickup: {
    label: "รอรับที่คลินิก",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    rank: 1,
  },
  pending_delivery: {
    label: "รอจัดส่ง",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
    rank: 2,
  },
  delivered: {
    label: "จัดส่งแล้ว",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rank: 3,
  },
  picked_up: {
    label: "รับยาแล้ว",
    tone: "border-teal-200 bg-teal-50 text-teal-700",
    rank: 4,
  },
  cancelled: {
    label: "ยกเลิก",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
    rank: 5,
  },
};

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("access_token") ?? "session";
}

function formatDateTime(value?: string | null) {
  return value
    ? new Date(value).toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
}

function formatMoney(value: number | null) {
  return value === null
    ? "-"
    : new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 2,
      }).format(value);
}

function fullName(person: PersonRecord | null) {
  return person ? `${person.name} ${person.sur_name}`.trim() || "-" : "-";
}

function textValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

function getStatus(value?: string | null): DisplayStatus {
  return [
    "pending_delivery",
    "delivered",
    "pending_pickup",
    "picked_up",
    "cancelled",
  ].includes(value ?? "")
    ? (value as ReceiptStatusValue)
    : "no_receipt";
}

function latestReceipt(consultation: ConsultationRecord) {
  return consultation.receipts[0] ?? null;
}

function displayStatus(consultation: ConsultationRecord) {
  return getStatus(latestReceipt(consultation)?.status);
}

function isOutstanding(status: DisplayStatus) {
  return (
    status === "no_receipt" ||
    status === "pending_delivery" ||
    status === "pending_pickup"
  );
}

function deliveryModeLabel(status: DisplayStatus) {
  if (status === "pending_delivery" || status === "delivered") {
    return "จัดส่ง";
  }

  if (status === "pending_pickup" || status === "picked_up") {
    return "รับที่คลินิก";
  }

  return "รอยืนยัน";
}

function queueOwnerLabel(
  consultation: ConsultationRecord,
  currentUserId?: number | null,
) {
  if (!consultation.pharmacist_id || !consultation.pharmacist) {
    return "ยังไม่มีผู้รับคิว";
  }

  if (consultation.pharmacist_id === currentUserId) {
    return "คุณรับคิวนี้";
  }

  return `รับคิวโดย ${fullName(consultation.pharmacist)}`;
}

function consultationTotal(consultation: ConsultationRecord) {
  const receipt = latestReceipt(consultation);

  if (receipt?.total !== null && receipt?.total !== undefined) {
    return receipt.total;
  }

  return consultation.prescription_items.reduce((sum, item) => {
    return sum + (item.medication?.retail ?? 0) * (item.quantity ?? 0);
  }, 0);
}

function medicationName(item: PrescriptionItemRecord) {
  return item.medication?.name ?? `ยา #${item.medication_id}`;
}

function medicationComment(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "xxx";
  }

  if (trimmed.includes("???") || trimmed.includes("ï¿½")) {
    return "xxx";
  }

  return trimmed;
}

async function fetchPhamaOrders(_accessToken?: string) {
  const response = await fetch(`${API_BASE_URL}/phama-home/orders`, {
    credentials: "include",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof payload?.message === "string"
        ? payload.message
        : "โหลดข้อมูลคิวจ่ายยาไม่สำเร็จ",
    );
  }

  return payload as OrdersResponse;
}

export default function PharmacistHomePage() {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const roleId = me?.role_id ?? null;

    if (!roleId) {
      router.replace("/login");
      return;
    }

    if (roleId === 1) {
      router.replace("/staff/admin-home");
      return;
    }

    if (roleId !== 5) {
      router.replace("/user");
      return;
    }

    setHasAccess(true);
  }, [authLoading, me?.role_id, router]);

  useEffect(() => {
    if (!hasAccess) {
      return;
    }

    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);

      const accessToken = getToken();

      if (!accessToken) {
        setLoading(false);
        setError("ไม่พบโทเค็นเข้าสู่ระบบสำหรับเรียกข้อมูล");
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
  }, [hasAccess]);

  const consultations = data?.consultations ?? [];

  const outstandingConsultations = useMemo(
    () => consultations.filter((item) => isOutstanding(displayStatus(item))),
    [consultations],
  );

  const queueCount = outstandingConsultations.length;

  const unassignedCount = useMemo(
    () => outstandingConsultations.filter((item) => !item.pharmacist_id).length,
    [outstandingConsultations],
  );

  const myQueueCount = useMemo(
    () =>
      outstandingConsultations.filter((item) => item.pharmacist_id === me?.sub).length,
    [outstandingConsultations, me?.sub],
  );

  const filteredConsultations = useMemo(() => {
    return outstandingConsultations
      .sort((left, right) => {
        const leftStatus = displayStatus(left);
        const rightStatus = displayStatus(right);

        return (
          STATUS_META[leftStatus].rank - STATUS_META[rightStatus].rank ||
          new Date(right.created_at ?? 0).getTime() -
            new Date(left.created_at ?? 0).getTime()
        );
      });
  }, [outstandingConsultations]);

  useEffect(() => {
    if (!filteredConsultations.length) {
      setSelectedId(null);
      setIsDetailModalOpen(false);
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
  const selectedOwnerLabel = selected
    ? queueOwnerLabel(selected, me?.sub ?? null)
    : "-";

  useEffect(() => {
    if (!isDetailModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDetailModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDetailModalOpen]);

  if (!hasAccess) {
    return null;
  }

  return (
    <main className="staff-shell text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="mb-2">
          <p className="staff-kicker">STAFF / PHARMACIST / DASHBOARD</p>
          <h1 className="mt-4 text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-tight tracking-tight text-slate-900">
            รายการคิวจ่ายยา
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            อัปเดตล่าสุด {formatDateTime(data?.generatedAt)}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="คิวคงค้าง"
            value={queueCount}
          />
          <MetricCard
            label="คิวของฉัน"
            value={myQueueCount}
          />
          <MetricCard
            label="ยังไม่รับคิว"
            value={unassignedCount}
          />
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

        <section className="space-y-6">
          <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">รายการคิวแบบกดดูรายละเอียด</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    แสดงเฉพาะเคสที่ยังต้องดำเนินการ กดที่แต่ละแถวเพื่อเปิดรายละเอียด
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {filteredConsultations.length}
                </span>
              </div>
            </div>

            <div className="max-h-[780px] overflow-y-auto p-3">
              {filteredConsultations.length ? (
                <div className="space-y-3">
                  {filteredConsultations.map((consultation) => {
                    const active = consultation.id === selected?.id;
                    const status = displayStatus(consultation);

                    return (
                      <button
                      key={consultation.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(consultation.id);
                        setIsDetailModalOpen(true);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 xl:w-[240px]">
                          <p
                            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                              active ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            Case #{consultation.id}
                          </p>
                          <p className="mt-2 truncate text-base font-semibold">
                            {fullName(consultation.patient)}
                          </p>
                          <p
                            className={`mt-1 truncate text-sm ${
                              active ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {textValue(
                              consultation.patient?.phone || consultation.patient?.email,
                            )}
                          </p>
                        </div>

                        <div className="grid flex-1 gap-2 sm:grid-cols-2 2xl:grid-cols-4">
                          <QueueMeta
                            label="รูปแบบ"
                            value={deliveryModeLabel(status)}
                            active={active}
                          />
                          <QueueMeta
                            label="ผู้รับคิว"
                            value={queueOwnerLabel(consultation, me?.sub ?? null)}
                            active={active}
                          />
                          <QueueMeta
                            label="ผู้ให้คำปรึกษา"
                            value={fullName(consultation.staff)}
                            active={active}
                          />
                          <QueueMeta
                            label="ยอดรวม"
                            value={formatMoney(consultationTotal(consultation))}
                            active={active}
                          />
                        </div>

                        <div className="flex min-w-[220px] flex-col items-start gap-3 xl:items-end">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${
                              active
                                ? "border-white/20 bg-white/10 text-white"
                                : STATUS_META[status].tone
                            }`}
                          >
                            {STATUS_META[status].label}
                          </span>

                          <div
                            className={`flex flex-wrap items-center gap-2 text-xs ${
                              active ? "text-slate-200" : "text-slate-500"
                            }`}
                          >
                            <span>{formatDateTime(consultation.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3">
                  <EmptyState body="ไม่พบคิวที่ตรงกับคำค้นหาหรือสถานะปัจจุบัน" />
                </div>
              )}
            </div>
          </aside>

          <section
            className={
              isDetailModalOpen && selected
                ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
                : "hidden"
            }
            onClick={() => setIsDetailModalOpen(false)}
          >
            {selected ? (
              <section
                className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-slate-200 px-6 py-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Case #{selected.id}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        {fullName(selected.patient)}
                      </h2>
                      <p className="mt-3 text-sm text-slate-500">
                        รายละเอียดด้านขวานี้จะแสดงตามเคสที่คุณเลือกจากลิสต์ทางซ้าย
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                          {deliveryModeLabel(selectedStatus)}
                        </span>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                          {selectedOwnerLabel}
                        </span>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                          {fullName(selected.staff)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row xl:items-center">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          สถานะล่าสุด
                        </p>
                        <span
                          className={`mt-2 inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-medium ${STATUS_META[selectedStatus].tone}`}
                        >
                          {STATUS_META[selectedStatus].label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          router.push(`/staff/pharmacist/order?consultationId=${selected.id}`);
                        }}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        ไปหน้าจ่ายยา
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDetailModalOpen(false)}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        ปิด
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-6 py-6">
                  <div className="grid gap-4 xl:grid-cols-3">
                    <SurfaceCard title="ข้อมูลผู้ป่วย" subtitle="ข้อมูลติดต่อและข้อมูลพื้นฐาน">
                      <InfoRow label="ชื่อผู้ป่วย" value={fullName(selected.patient)} />
                      <InfoRow label="เบอร์ติดต่อ" value={selected.patient?.phone} />
                      <InfoRow label="อีเมล" value={selected.patient?.email} />
                      <InfoRow
                        label="ประวัติแพ้ยา"
                        value={selected.patient?.allergy_drug || "ไม่พบข้อมูล"}
                      />
                    </SurfaceCard>

                    <SurfaceCard title="สถานะการทำงาน" subtitle="ข้อมูลที่ใช้ตัดสินใจงานถัดไป">
                      <InfoRow
                        label="รูปแบบรับยา"
                        value={deliveryModeLabel(selectedStatus)}
                      />
                      <InfoRow label="ผู้รับคิว" value={selectedOwnerLabel} />
                      <InfoRow label="ผู้ให้คำปรึกษา" value={fullName(selected.staff)} />
                      <InfoRow
                        label="เวลาที่บันทึก"
                        value={formatDateTime(selected.created_at)}
                      />
                    </SurfaceCard>

                    <SurfaceCard title="การติดตามคำสั่งยา" subtitle="สรุปสถานะล่าสุดของเคสนี้">
                      <InfoRow
                        label="สถานะล่าสุด"
                        value={STATUS_META[selectedStatus].label}
                      />
                      <InfoRow
                        label="Tracking"
                        value={selectedReceipt?.tracking || "ยังไม่มีเลขพัสดุ"}
                      />
                      <InfoRow
                        label="ยอดรวม"
                        value={formatMoney(consultationTotal(selected))}
                      />
                      <InfoRow
                        label="อัปเดตใบเสร็จ"
                        value={
                          selectedReceipt
                            ? formatDateTime(selectedReceipt.created_at)
                            : "ยังไม่มีใบเสร็จ"
                        }
                      />
                    </SurfaceCard>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <SurfaceCard title="หมายเหตุเคส" subtitle="ข้อความจากการปรึกษา">
                      <p className="text-sm leading-7 text-slate-600">
                        {selected.note?.trim() || "ไม่มีหมายเหตุเพิ่มเติมจากการปรึกษา"}
                      </p>
                    </SurfaceCard>

                    <SurfaceCard
                      title="รายการยา"
                      subtitle={`${selected.prescription_items.length} รายการในเคสนี้`}
                    >
                      {selected.prescription_items.length ? (
                        <div className="divide-y divide-slate-200">
                          {selected.prescription_items.map((item) => (
                            <div
                              key={item.id}
                              className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_110px_130px]"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {medicationName(item)}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  {medicationComment(item.comment)}
                                </p>
                              </div>
                              <div className="text-sm text-slate-500">
                                จำนวน {item.quantity ?? 0}
                              </div>
                              <div className="text-sm font-medium text-slate-900 sm:text-right">
                                {formatMoney((item.medication?.retail ?? 0) * (item.quantity ?? 0))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState body="เคสนี้ยังไม่มีรายการยา" />
                      )}
                    </SurfaceCard>
                  </div>
                </div>
              </section>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <EmptyState body="เลือกคิวจากรายการด้านซ้ายเพื่อดูรายละเอียดผู้ป่วยและสถานะงาน" />
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </article>
  );
}

function QueueMeta({
  label,
  value,
  active,
}: {
  label: string;
  value: string | number | null | undefined;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        active
          ? "border-white/10 bg-white/5 text-slate-100"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <p className={`text-[11px] uppercase tracking-[0.14em] ${active ? "text-slate-300" : "text-slate-400"}`}>
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium">{textValue(value)}</p>
    </div>
  );
}

function SurfaceCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="max-w-[70%] break-words text-right text-sm font-medium text-slate-900">
        {textValue(value)}
      </p>
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
