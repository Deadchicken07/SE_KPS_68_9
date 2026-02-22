import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminReport.css";

type KPI = {
  label: string;
  value: string;
  trend?: string;
};

type BarPoint = {
  label: string;
  value: number;
};

type LabeledValue = {
  label: string;
  value: number;
};

type Appointment = {
  time: string;
  patient: string;
  service: string;
  status: string;
};

type CaseRow = {
  id: string;
  patient: string;
  topic: string;
  owner: string;
};

type Invoice = {
  no: string;
  customer: string;
  amount: string;
  status: string;
};

type DashboardData = {
  kpis: KPI[];
  caseStats: BarPoint[];
  revenueStats: BarPoint[];
  appointmentStatus: LabeledValue[];
  channelStats: LabeledValue[];
  todayAppointments: Appointment[];
  latestCases: CaseRow[];
  invoices: Invoice[];
  openCases: number;
  followUpCases: number;
  financeTotal: string;
  financeOutstanding: string;
};

const STATUS_OPTIONS = ["ทั้งหมด", "สำเร็จ", "รออนุมัติ", "ยกเลิก"];
const SERVICE_OPTIONS = ["ทั้งหมด", "Online", "Onsite"];
const STAFF_OPTIONS = ["ทั้งหมด", "ดร. อรอนงค์", "ดร. ณิชา", "ดร. กรรณิการ์"];

const APPOINTMENT_TIMES = ["09:00", "10:30", "13:00", "15:45", "17:00"];
const PATIENT_NAMES = [
  "นภัสสร ศรีสุข",
  "กิตติพงษ์ บุญมา",
  "พีรดา คงมั่น",
  "อดิศร โพธิ์ทอง",
  "ธิดารัตน์ สายคำ",
  "สุเมธ แก้วดี",
  "ปราณี วงษ์งาม",
  "สุนีย์ จันทรา",
  "กมลวรรณ สุขใจ",
];
const CASE_TOPICS = [
  "ภาวะเครียดสะสม",
  "ซึมเศร้า",
  "ความสัมพันธ์ครอบครัว",
  "ปรับตัวในที่ทำงาน",
  "ความมั่นใจในตนเอง",
];
const CUSTOMERS = ["บริษัท GreenMind", "บริษัท Wellness Co.", "คุณธนพล ลีลา", "คุณสุภาวดี บุญเรือง", "นายกิตติภพ ทองดี"];

function formatCurrency(value: number): string {
  return `฿${value.toLocaleString("th-TH")}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickOne<T>(rand: () => number, list: T[]): T {
  const index = Math.floor(rand() * list.length);
  return list[index];
}

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function createDashboardData(
  seedKey: string,
  filters: {
    fromDate: string;
    toDate: string;
    status: string;
    serviceType: string;
    staff: string;
  }
): DashboardData {
  const rand = mulberry32(hashString(seedKey));

  const from = new Date(filters.fromDate);
  const to = new Date(filters.toDate);
  const start = Number.isNaN(from.getTime()) ? new Date("2026-02-01") : from;
  const end = Number.isNaN(to.getTime()) ? new Date("2026-02-22") : to;
  const diffDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);

  const statusFactor = filters.status === "ทั้งหมด" ? 1 : 0.72;
  const serviceFactor = filters.serviceType === "ทั้งหมด" ? 1 : 0.84;
  const staffFactor = filters.staff === "ทั้งหมด" ? 1 : 0.78;
  const scopeFactor = statusFactor * serviceFactor * staffFactor;

  const totalUsers = randInt(rand, 2600, 5200);
  const newUsersToday = Math.round(randInt(rand, 14, 90) * scopeFactor);
  const newUsersWeek = Math.round(newUsersToday * randInt(rand, 4, 7));
  const appointments = Math.round(diffDays * randInt(rand, 18, 36) * scopeFactor);
  const consultations = Math.round(appointments * (0.56 + rand() * 0.22));

  const revenueBase = Math.round(diffDays * randInt(rand, 30000, 68000) * scopeFactor);
  const revenueTotal = clamp(revenueBase, 95000, 6200000);
  const outstandingAmount = Math.round(revenueTotal * (0.05 + rand() * 0.14));
  const outstandingInvoices = randInt(rand, 8, 58);

  const growth = (rand() * 18 - 2).toFixed(1);

  const kpis: KPI[] = [
    { label: "จำนวนผู้ใช้ทั้งหมด", value: totalUsers.toLocaleString("th-TH"), trend: `${growth}% จากช่วงก่อนหน้า` },
    {
      label: "ผู้ใช้ใหม่วันนี้ / สัปดาห์นี้",
      value: `${newUsersToday.toLocaleString("th-TH")} / ${newUsersWeek.toLocaleString("th-TH")}`,
      trend: `${(rand() * 12 + 1).toFixed(1)}%`,
    },
    {
      label: "จำนวนการนัดหมาย",
      value: appointments.toLocaleString("th-TH"),
      trend: `เฉลี่ยวันละ ${Math.max(1, Math.round(appointments / diffDays)).toLocaleString("th-TH")} นัด`,
    },
    {
      label: "จำนวนการปรึกษา (เคส)",
      value: consultations.toLocaleString("th-TH"),
      trend: `เปิดอยู่ ${Math.round(consultations * 0.14).toLocaleString("th-TH")} เคส`,
    },
    {
      label: "รายได้รวม",
      value: formatCurrency(revenueTotal),
      trend: `${(rand() * 22 + 3).toFixed(1)}% จากช่วงก่อนหน้า`,
    },
    {
      label: "ยอดค้างชำระ",
      value: formatCurrency(outstandingAmount),
      trend: `ยังไม่ชำระ ${outstandingInvoices.toLocaleString("th-TH")} รายการ`,
    },
  ];

  const caseStats: BarPoint[] = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map((label) => ({
    label,
    value: randInt(rand, 28, 92),
  }));

  const revenueStats: BarPoint[] = ["W1", "W2", "W3", "W4"].map((label) => ({
    label,
    value: randInt(rand, 35, 95),
  }));

  const successRaw = randInt(rand, 52, 78);
  const pendingRaw = randInt(rand, 12, 34);
  const cancelRaw = randInt(rand, 8, 22);
  const statusSum = successRaw + pendingRaw + cancelRaw;
  const successPct = Math.round((successRaw / statusSum) * 100);
  const pendingPct = Math.round((pendingRaw / statusSum) * 100);
  const cancelPct = 100 - successPct - pendingPct;

  const appointmentStatus: LabeledValue[] = [
    { label: "สำเร็จ", value: successPct },
    { label: "รออนุมัติ", value: pendingPct },
    { label: "ยกเลิก", value: cancelPct },
  ];

  const onlinePct = randInt(rand, 45, 82);
  const channelStats: LabeledValue[] = [
    { label: "Online", value: onlinePct },
    { label: "Onsite", value: 100 - onlinePct },
  ];

  const allowedStatuses = filters.status === "ทั้งหมด" ? STATUS_OPTIONS.slice(1) : [filters.status];
  const allowedServices = filters.serviceType === "ทั้งหมด" ? ["Online", "Onsite"] : [filters.serviceType];
  const preferredOwner = filters.staff === "ทั้งหมด" ? null : filters.staff;

  const todayAppointments: Appointment[] = APPOINTMENT_TIMES.slice(0, 4).map((time) => ({
    time,
    patient: pickOne(rand, PATIENT_NAMES),
    service: pickOne(rand, allowedServices).replace("Online", "Video Call"),
    status: pickOne(rand, allowedStatuses),
  }));

  const latestCases: CaseRow[] = Array.from({ length: 3 }).map((_, index) => ({
    id: `CS-${randInt(rand, 2000, 9999)}${index}`,
    patient: pickOne(rand, PATIENT_NAMES),
    topic: pickOne(rand, CASE_TOPICS),
    owner: preferredOwner ?? pickOne(rand, STAFF_OPTIONS.slice(1)),
  }));

  const invoices: Invoice[] = Array.from({ length: 3 }).map((_, index) => {
    const amount = randInt(rand, 1600, 52000);
    const paidChance = rand();
    const paidStatuses = ["ชำระแล้ว", "ค้างชำระ"];

    return {
      no: `INV-${randInt(rand, 7000, 9999)}${index}`,
      customer: pickOne(rand, CUSTOMERS),
      amount: formatCurrency(amount),
      status: paidChance > 0.35 ? paidStatuses[0] : paidStatuses[1],
    };
  });

  return {
    kpis,
    caseStats,
    revenueStats,
    appointmentStatus,
    channelStats,
    todayAppointments,
    latestCases,
    invoices,
    openCases: Math.round(consultations * 0.14),
    followUpCases: Math.round(consultations * 0.05),
    financeTotal: formatCurrency(revenueTotal),
    financeOutstanding: formatCurrency(outstandingAmount),
  };
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "สำเร็จ" || status === "ชำระแล้ว"
      ? "status-badge status-success"
      : status === "รออนุมัติ"
        ? "status-badge status-pending"
        : "status-badge status-cancel";

  return <span className={className}>{status}</span>;
}

export default function AdminReport() {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const [fromDate, setFromDate] = useState("2026-02-01");
  const [toDate, setToDate] = useState("2026-02-22");
  const [status, setStatus] = useState("ทั้งหมด");
  const [serviceType, setServiceType] = useState("ทั้งหมด");
  const [staff, setStaff] = useState("ทั้งหมด");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dashboardData = useMemo(() => {
    const seedKey = `${fromDate}|${toDate}|${status}|${serviceType}|${staff}`;
    return createDashboardData(seedKey, { fromDate, toDate, status, serviceType, staff });
  }, [fromDate, toDate, status, serviceType, staff]);

  const {
    kpis,
    caseStats,
    revenueStats,
    appointmentStatus,
    channelStats,
    todayAppointments,
    latestCases,
    invoices,
    openCases,
    followUpCases,
    financeTotal,
    financeOutstanding,
  } = dashboardData;

  const handleExportNavigate = (source: "overview" | "finance") => {
    const params = new URLSearchParams({
      from: fromDate,
      to: toDate,
      status,
      service: serviceType,
      staff,
      source,
    });

    navigate(`/admin/report/export?${params.toString()}`);
  };

  return (
    <div className="admin-report-page">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      <header className="admin-header">
        <div className="brand">JitDee.com</div>
        <div className="header-actions" ref={profileMenuRef}>
          <span className="report-chip">Admin Report</span>
          <button
            type="button"
            className="profile-button"
            aria-label="admin menu"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          >
            AD
          </button>
          {isProfileMenuOpen ? (
            <div className="profile-menu">
              <button type="button">ข้อมูลบัญชี</button>
              <button type="button" className="signout-button">
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="admin-report-shell">
        <section className="panel section-intro">
          <div>
            <p className="eyebrow">ADMIN REPORT</p>
            <h1>ภาพรวมการบริการและการดำเนินงานระบบ</h1>
            <p className="subtitle">สรุปข้อมูลผู้ใช้ การนัดหมาย เคสปรึกษา และรายได้ในหน้าเดียว</p>
          </div>
          <button className="btn-primary" type="button" onClick={() => handleExportNavigate("overview")}>
            Export รายงาน
          </button>
        </section>

        <section className="kpi-grid">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="panel kpi-card">
              <p>{kpi.label}</p>
              <h3>{kpi.value}</h3>
              <span>{kpi.trend}</span>
            </article>
          ))}
        </section>

        <section className="panel">
          <div className="section-head">
            <h2>ตัวกรองข้อมูล</h2>
          </div>
          <div className="filter-grid">
            <label>
              ช่วงวันที่
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </label>
            <label>
              ถึงวันที่
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </label>
            <label>
              สถานะ
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              ประเภทบริการ
              <select value={serviceType} onChange={(event) => setServiceType(event.target.value)}>
                {SERVICE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              บุคลากร
              <select value={staff} onChange={(event) => setStaff(event.target.value)}>
                {STAFF_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="stats-grid">
          <article className="panel chart-card">
            <div className="section-head">
              <h2>จำนวนเคสต่อวัน</h2>
            </div>
            <div className="bars">
              {caseStats.map((item) => (
                <div key={item.label} className="bar-wrap">
                  <div className="bar" style={{ height: `${item.value}%` }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel chart-card">
            <div className="section-head">
              <h2>รายได้ต่อสัปดาห์</h2>
            </div>
            <div className="bars">
              {revenueStats.map((item) => (
                <div key={item.label} className="bar-wrap">
                  <div className="bar secondary" style={{ height: `${item.value}%` }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel mini-chart-card">
            <div className="section-head">
              <h2>นัดหมายตามสถานะ</h2>
            </div>
            <ul className="legend-list">
              {appointmentStatus.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel mini-chart-card">
            <div className="section-head">
              <h2>Online vs Onsite</h2>
            </div>
            <ul className="legend-list">
              {channelStats.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="monitor-grid">
          <article className="panel table-card">
            <div className="section-head">
              <h2>การจัดการนัดหมาย</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>เวลา</th>
                  <th>ผู้รับบริการ</th>
                  <th>ประเภท</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((row) => (
                  <tr key={`${row.time}-${row.patient}`}>
                    <td>{row.time}</td>
                    <td>{row.patient}</td>
                    <td>{row.service}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="panel table-card">
            <div className="section-head">
              <h2>การติดตามเคส</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>รหัสเคส</th>
                  <th>ผู้รับบริการ</th>
                  <th>หัวข้อ</th>
                  <th>ผู้ดูแล</th>
                </tr>
              </thead>
              <tbody>
                {latestCases.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.patient}</td>
                    <td>{row.topic}</td>
                    <td>{row.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="foot-notes">
              <span>เคสยังไม่ปิด: {openCases.toLocaleString("th-TH")}</span>
              <span>เคสที่ต้องติดตาม: {followUpCases.toLocaleString("th-TH")}</span>
            </div>
          </article>
        </section>

        <section className="panel finance-card">
          <div className="section-head">
            <h2>การเงิน (Finance Summary)</h2>
            <button className="btn-primary" type="button" onClick={() => handleExportNavigate("finance")}>
              Export รายงาน
            </button>
          </div>
          <div className="finance-kpi">
            <div>
              <p>รายได้รวม</p>
              <h3>{financeTotal}</h3>
            </div>
            <div>
              <p>ยอดที่ยังไม่ชำระ</p>
              <h3>{financeOutstanding}</h3>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>เลขที่ใบเสร็จ</th>
                <th>ลูกค้า</th>
                <th>ยอดเงิน</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((row) => (
                <tr key={row.no}>
                  <td>{row.no}</td>
                  <td>{row.customer}</td>
                  <td>{row.amount}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
