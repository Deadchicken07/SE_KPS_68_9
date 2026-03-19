"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function PharmacistDispensePlaceholderPage() {
  const params = useParams<{ consultationId: string }>();
  const consultationId = params?.consultationId ?? "-";

  return (
    <main className="min-h-screen bg-[#f3f5f7] px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Case #{consultationId}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            หน้าจ่ายยา
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            หน้านี้ยังไม่ได้ทำ flow จ่ายยาจริงเพิ่มเติมในรอบนี้ แต่ปุ่มจากหน้าแรกสามารถเข้ามาที่หน้านี้ได้แล้ว
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/staff/pharmacist_home"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              กลับหน้าแรกเภสัช
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
