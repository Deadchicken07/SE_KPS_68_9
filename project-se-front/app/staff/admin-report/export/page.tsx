"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

type FormatType = "pdf" | "xlsx" | "csv";
type SourceType = "overview" | "finance";

const OVERVIEW_STATUS = ["ทั้งหมด", "สำเร็จ", "รออนุมัติ", "ยกเลิก"];
const FINANCE_STATUS = ["ทั้งหมด", "ชำระแล้ว", "ค้างชำระ", "เกินกำหนด"];
const OVERVIEW_SERVICE = ["ทั้งหมด", "Online", "Onsite"];
const FINANCE_SERVICE = ["ทั้งหมด", "ใบเสร็จ", "ใบแจ้งหนี้"];
const STAFF = ["ทั้งหมด", "ดร. อรอนงค์", "ดร. ณิชา", "ดร. กรรณิการ์"];

function ensureOption(value: string, options: string[]): string {
  return options.includes(value) ? value : options[0];
}

function formatDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
}

function ExportContent() {
  const router = useRouter();
  const params = useSearchParams();

  const source: SourceType = params.get("source") === "finance" ? "finance" : "overview";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  const statusOptions = source === "finance" ? FINANCE_STATUS : OVERVIEW_STATUS;
  const serviceOptions = source === "finance" ? FINANCE_SERVICE : OVERVIEW_SERVICE;
  const showStaff = source !== "finance";

  const [status, setStatus] = useState(() => ensureOption(params.get("status") ?? "ทั้งหมด", statusOptions));
  const [service, setService] = useState(() => ensureOption(params.get("service") ?? "ทั้งหมด", serviceOptions));
  const [staff, setStaff] = useState(() => ensureOption(params.get("staff") ?? "ทั้งหมด", STAFF));
  const [format, setFormat] = useState<FormatType>("pdf");
  const [includeChart, setIncludeChart] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);

  const fileName = useMemo(() => {
    const suffix = from && to ? `${from}_to_${to}` : "snapshot";
    const prefix = source === "finance" ? "finance-report" : "admin-report";
    return `${prefix}_${suffix}.${format}`;
  }, [format, from, to, source]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>JitDee.com</div>
        <button type="button" className={styles.backBtn} onClick={() => router.push("/staff/admin-report")}>กลับไปหน้า Admin Report</button>
      </header>

      <main className={styles.shell}>
        <section className={`${styles.panel} ${styles.hero}`}>
          <p className={styles.eyebrow}>{source === "finance" ? "FINANCE EXPORT" : "REPORT EXPORT"}</p>
          <h1>{source === "finance" ? "ตั้งค่าการออกรายงานการเงิน" : "ตั้งค่าการออกรายงาน"}</h1>
          <p>{source === "finance" ? "โหมดนี้เน้นข้อมูลการเงิน เช่น ใบเสร็จ ยอดชำระ และยอดค้างชำระ" : "เลือกประเภทไฟล์และเนื้อหาที่ต้องการก่อนสร้างรายงานสำหรับผู้บริหาร"}</p>
        </section>

        <section className={styles.grid}>
          <article className={styles.panel}>
            <h2>1) ขอบเขตรายงาน</h2>
            <div className={styles.metaList}>
              <div className={styles.row}><span>ช่วงวันที่</span><strong>{formatDate(from)} - {formatDate(to)}</strong></div>
              <div className={styles.row}><label>สถานะ</label><select value={status} onChange={(e) => setStatus(e.target.value)}>{statusOptions.map((v) => <option key={v}>{v}</option>)}</select></div>
              <div className={styles.row}><label>{source === "finance" ? "ประเภทรายการ" : "ประเภทบริการ"}</label><select value={service} onChange={(e) => setService(e.target.value)}>{serviceOptions.map((v) => <option key={v}>{v}</option>)}</select></div>
              {showStaff ? <div className={styles.row}><label>บุคลากร</label><select value={staff} onChange={(e) => setStaff(e.target.value)}>{STAFF.map((v) => <option key={v}>{v}</option>)}</select></div> : null}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>2) เลือกประเภทไฟล์</h2>
            <div className={styles.formatGrid}>
              <button type="button" className={`${styles.formatCard} ${format === "pdf" ? styles.active : ""}`} onClick={() => setFormat("pdf")}><strong>PDF</strong><span>เหมาะสำหรับส่งผู้บริหาร</span></button>
              <button type="button" className={`${styles.formatCard} ${format === "xlsx" ? styles.active : ""}`} onClick={() => setFormat("xlsx")}><strong>Excel (.xlsx)</strong><span>เหมาะสำหรับวิเคราะห์ต่อ</span></button>
              <button type="button" className={`${styles.formatCard} ${format === "csv" ? styles.active : ""}`} onClick={() => setFormat("csv")}><strong>CSV</strong><span>ไฟล์ข้อมูลเบาและนำเข้าได้ง่าย</span></button>
            </div>
          </article>
        </section>

        <section className={styles.panel}>
          <h2>3) เนื้อหาที่ต้องการ</h2>
          <div className={styles.checkboxRow}>
            <label><input type="checkbox" checked={includeChart} onChange={(e) => setIncludeChart(e.target.checked)} />{source === "finance" ? "รวมกราฟรายได้/ค้างชำระ" : "รวมกราฟสถิติ"}</label>
            <label><input type="checkbox" checked={includeTables} onChange={(e) => setIncludeTables(e.target.checked)} />{source === "finance" ? "รวมตารางใบเสร็จ/ยอดชำระ" : "รวมตารางนัดหมาย/เคส/การเงิน"}</label>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.summary}`}>
          <div>
            <h2>ตัวอย่างไฟล์ที่จะได้</h2>
            <p className={styles.fileName}>{fileName}</p>
            <p className={styles.note}>ขอบเขตปัจจุบัน: สถานะ {status} | {source === "finance" ? "ประเภทรายการ" : "ประเภทบริการ"} {service}{showStaff ? ` | บุคลากร ${staff}` : ""}</p>
            <p className={styles.note}>หมายเหตุ: ตอนนี้เป็นหน้าออกแบบตัวอย่าง UI การ export ยังไม่เชื่อม backend จริง</p>
          </div>
          <div className={styles.actionRow}>
            <button type="button" className={styles.primaryBtn}>สร้างรายงาน</button>
            <button type="button" className={styles.ghostBtn} onClick={() => router.push("/staff/admin-report")}>ย้อนกลับ</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AdminReportExportPage() {
  return (
    <Suspense fallback={<div className={styles.page}>กำลังโหลด...</div>}>
      <ExportContent />
    </Suspense>
  );
}
