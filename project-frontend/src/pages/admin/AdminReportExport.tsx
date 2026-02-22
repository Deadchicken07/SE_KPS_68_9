import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AdminReportExport.css";

type FormatType = "pdf" | "xlsx" | "csv";
type SourceType = "overview" | "finance";

const OVERVIEW_STATUS_OPTIONS = ["ทั้งหมด", "สำเร็จ", "รออนุมัติ", "ยกเลิก"];
const FINANCE_STATUS_OPTIONS = ["ทั้งหมด", "ชำระแล้ว", "ค้างชำระ", "เกินกำหนด"];
const OVERVIEW_SERVICE_OPTIONS = ["ทั้งหมด", "Online", "Onsite"];
const FINANCE_SERVICE_OPTIONS = ["ทั้งหมด", "ใบเสร็จ", "ใบแจ้งหนี้"];
const OVERVIEW_STAFF_OPTIONS = ["ทั้งหมด", "ดร. อรอนงค์", "ดร. ณิชา", "ดร. กรรณิการ์"];

function formatDate(date: string): string {
  if (!date) {
    return "-";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ensureOption(value: string, options: string[]): string {
  return options.includes(value) ? value : options[0];
}

export default function AdminReportExport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const source: SourceType = searchParams.get("source") === "finance" ? "finance" : "overview";

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const statusOptions = source === "finance" ? FINANCE_STATUS_OPTIONS : OVERVIEW_STATUS_OPTIONS;
  const serviceOptions = source === "finance" ? FINANCE_SERVICE_OPTIONS : OVERVIEW_SERVICE_OPTIONS;
  const staffOptions = OVERVIEW_STAFF_OPTIONS;
  const showStaffField = source !== "finance";

  const [status, setStatus] = useState(() => ensureOption(searchParams.get("status") ?? "ทั้งหมด", statusOptions));
  const [service, setService] = useState(() => ensureOption(searchParams.get("service") ?? "ทั้งหมด", serviceOptions));
  const [staff, setStaff] = useState(() => ensureOption(searchParams.get("staff") ?? "ทั้งหมด", staffOptions));
  const [format, setFormat] = useState<FormatType>("pdf");
  const [includeChart, setIncludeChart] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);

  const contextTitle = source === "finance" ? "ตั้งค่าการออกรายงานการเงิน" : "ตั้งค่าการออกรายงาน";
  const contextDesc =
    source === "finance"
      ? "โหมดนี้เน้นข้อมูลการเงิน เช่น ใบเสร็จ ยอดชำระ และยอดค้างชำระ"
      : "เลือกประเภทไฟล์และเนื้อหาที่ต้องการก่อนสร้างรายงานสำหรับผู้บริหาร";

  const statusLabel = source === "finance" ? "สถานะการชำระเงิน" : "สถานะ";
  const serviceLabel = source === "finance" ? "ประเภทรายการ" : "ประเภทบริการ";
  const staffLabel = "บุคลากร";

  const fileName = useMemo(() => {
    const suffix = from && to ? `${from}_to_${to}` : "snapshot";
    const prefix = source === "finance" ? "finance-report" : "admin-report";
    return `${prefix}_${suffix}.${format}`;
  }, [from, to, source, format]);

  return (
    <div className="export-page">
      <div className="export-orb export-orb-1" />
      <div className="export-orb export-orb-2" />

      <header className="export-header">
        <div className="export-brand">JitDee.com</div>
        <button type="button" className="back-btn" onClick={() => navigate("/admin/report")}>
          กลับไปหน้า Admin Report
        </button>
      </header>

      <main className="export-shell">
        <section className="export-panel hero">
          <p className="export-eyebrow">{source === "finance" ? "FINANCE EXPORT" : "REPORT EXPORT"}</p>
          <h1>{contextTitle}</h1>
          <p>{contextDesc}</p>
        </section>

        <section className="export-grid">
          <article className="export-panel">
            <h2>1) ขอบเขตรายงาน</h2>
            <div className="meta-list">
              <div className="meta-field">
                <span>ช่วงวันที่</span>
                <strong>
                  {formatDate(from)} - {formatDate(to)}
                </strong>
              </div>

              <div className="meta-field">
                <label htmlFor="export-status">{statusLabel}</label>
                <select id="export-status" className="meta-control" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="meta-field">
                <label htmlFor="export-service">{serviceLabel}</label>
                <select id="export-service" className="meta-control" value={service} onChange={(event) => setService(event.target.value)}>
                  {serviceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {showStaffField ? (
                <div className="meta-field">
                  <label htmlFor="export-staff">{staffLabel}</label>
                  <select id="export-staff" className="meta-control" value={staff} onChange={(event) => setStaff(event.target.value)}>
                    {staffOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </article>

          <article className="export-panel">
            <h2>2) เลือกประเภทไฟล์</h2>
            <div className="format-grid">
              <button
                type="button"
                className={format === "pdf" ? "format-card active" : "format-card"}
                onClick={() => setFormat("pdf")}
              >
                <strong>PDF</strong>
                <span>เหมาะสำหรับส่งผู้บริหาร</span>
              </button>
              <button
                type="button"
                className={format === "xlsx" ? "format-card active" : "format-card"}
                onClick={() => setFormat("xlsx")}
              >
                <strong>Excel (.xlsx)</strong>
                <span>เหมาะสำหรับวิเคราะห์ต่อ</span>
              </button>
              <button
                type="button"
                className={format === "csv" ? "format-card active" : "format-card"}
                onClick={() => setFormat("csv")}
              >
                <strong>CSV</strong>
                <span>ไฟล์ข้อมูลเบาและนำเข้าได้ง่าย</span>
              </button>
            </div>
          </article>
        </section>

        <section className="export-panel">
          <h2>3) เนื้อหาที่ต้องการ</h2>
          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={includeChart}
                onChange={(event) => setIncludeChart(event.target.checked)}
              />
              {source === "finance" ? "รวมกราฟรายได้/ค้างชำระ" : "รวมกราฟสถิติ"}
            </label>
            <label>
              <input
                type="checkbox"
                checked={includeTables}
                onChange={(event) => setIncludeTables(event.target.checked)}
              />
              {source === "finance" ? "รวมตารางใบเสร็จ/ยอดชำระ" : "รวมตารางนัดหมาย/เคส/การเงิน"}
            </label>
          </div>
        </section>

        <section className="export-panel summary">
          <div>
            <h2>ตัวอย่างไฟล์ที่จะได้</h2>
            <p className="filename">{fileName}</p>
            <p className="small-note">
              ขอบเขตปัจจุบัน: {statusLabel} {status} | {serviceLabel} {service}
              {showStaffField ? ` | ${staffLabel} ${staff}` : ""}
            </p>
            <p className="small-note">หมายเหตุ: ตอนนี้เป็นหน้าออกแบบตัวอย่าง UI การ export ยังไม่เชื่อม backend จริง</p>
          </div>
          <div className="action-row">
            <button type="button" className="create-btn">
              สร้างรายงาน
            </button>
            <button type="button" className="ghost-btn" onClick={() => navigate("/admin/report")}>
              ย้อนกลับ
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
