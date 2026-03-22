"use client";

import { usePharmacistHome } from "@/hooks/usePharmacistHome";
import { formatPharmacistHomeDateTime } from "@/utils/pharmacistHome";
import {
  EmptyState,
  PharmacistHomeDetailModal,
  PharmacistHomeMetricCard,
  PharmacistHomeQueueCard,
} from "@/components/staff/PharmacistHome";

export default function PharmacistHomePage() {
  const {
    currentUserId,
    data,
    error,
    filteredConsultations,
    hasAccess,
    isDetailModalOpen,
    loading,
    myQueueCount,
    openConsultation,
    openOrderPage,
    queueCount,
    selected,
    unassignedCount,
    closeDetailModal,
  } = usePharmacistHome();

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
            อัปเดตล่าสุด {formatPharmacistHomeDateTime(data?.generatedAt)}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <PharmacistHomeMetricCard label="คิวคงค้าง" value={queueCount} />
          <PharmacistHomeMetricCard label="คิวของฉัน" value={myQueueCount} />
          <PharmacistHomeMetricCard
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
                  <h2 className="text-lg font-semibold text-slate-900">
                    รายการคิวแบบกดดูรายละเอียด
                  </h2>
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
                  {filteredConsultations.map((consultation) => (
                    <PharmacistHomeQueueCard
                      key={consultation.id}
                      active={consultation.id === selected?.id}
                      consultation={consultation}
                      currentUserId={currentUserId}
                      onOpen={openConsultation}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-3">
                  <EmptyState body="ไม่พบคิวที่ตรงกับคำค้นหาหรือสถานะปัจจุบัน" />
                </div>
              )}
            </div>
          </aside>

          <PharmacistHomeDetailModal
            consultation={selected}
            currentUserId={currentUserId}
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            onGoToOrder={openOrderPage}
          />
        </section>
      </div>
    </main>
  );
}
