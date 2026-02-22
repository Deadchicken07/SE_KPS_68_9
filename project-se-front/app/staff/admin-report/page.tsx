"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type KPI = { label: string; value: string; trend: string };
type BarPoint = { label: string; value: number };
type LabeledValue = { label: string; value: number };
type Appointment = { time: string; patient: string; service: string; status: string };
type CaseRow = { id: string; patient: string; topic: string; owner: string };
type Invoice = { no: string; customer: string; amount: string; status: string };

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

const NAMES = ["นภัสสร ศรีสุข", "กิตติพงษ์ บุญมา", "พีรดา คงมั่น", "อดิศร โพธิ์ทอง", "ธิดารัตน์ สายคำ", "สุเมธ แก้วดี"];
const TOPICS = ["ภาวะเครียดสะสม", "ซึมเศร้า", "ความสัมพันธ์ครอบครัว", "ปรับตัวในที่ทำงาน"];
const CUSTOMERS = ["บริษัท GreenMind", "คุณสุภาวดี บุญเรือง", "นายกิตติภพ ทองดี", "บริษัท Wellness Co."];

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

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pickOne<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length)];
}

function formatCurrency(value: number): string {
  return `฿${value.toLocaleString("th-TH")}`;
}

function createData(seedKey: string, filters: { fromDate: string; toDate: string; status: string; serviceType: string; staff: string }): DashboardData {
  const rand = mulberry32(hashString(seedKey));
  const start = new Date(filters.fromDate || "2026-02-01");
  const end = new Date(filters.toDate || "2026-02-22");
  const diffDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);

  const scale = (filters.status === "ทั้งหมด" ? 1 : 0.75) * (filters.serviceType === "ทั้งหมด" ? 1 : 0.84) * (filters.staff === "ทั้งหมด" ? 1 : 0.8);

  const users = randInt(rand, 2500, 5200);
  const todayUsers = Math.max(1, Math.round(randInt(rand, 15, 90) * scale));
  const weekUsers = todayUsers * randInt(rand, 4, 7);
  const appointments = Math.max(1, Math.round(diffDays * randInt(rand, 18, 40) * scale));
  const consults = Math.round(appointments * (0.56 + rand() * 0.25));
  const total = Math.round(diffDays * randInt(rand, 30000, 68000) * scale);
  const pendingAmount = Math.round(total * (0.06 + rand() * 0.14));

  const caseStats = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map((label) => ({ label, value: randInt(rand, 28, 92) }));
  const revenueStats = ["W1", "W2", "W3", "W4"].map((label) => ({ label, value: randInt(rand, 35, 95) }));

  const successRaw = randInt(rand, 50, 80);
  const pendingRaw = randInt(rand, 10, 30);
  const cancelRaw = randInt(rand, 8, 20);
  const sum = successRaw + pendingRaw + cancelRaw;
  const success = Math.round((successRaw / sum) * 100);
  const pending = Math.round((pendingRaw / sum) * 100);
  const cancel = 100 - success - pending;

  const online = randInt(rand, 45, 82);

  const appointmentStatus = [
    { label: "สำเร็จ", value: success },
    { label: "รออนุมัติ", value: pending },
    { label: "ยกเลิก", value: cancel },
  ];

  const channelStats = [
    { label: "Online", value: online },
    { label: "Onsite", value: 100 - online },
  ];

  const allowedStatus = filters.status === "ทั้งหมด" ? STATUS_OPTIONS.slice(1) : [filters.status];
  const allowedService = filters.serviceType === "ทั้งหมด" ? ["Video Call", "Onsite"] : [filters.serviceType === "Online" ? "Video Call" : filters.serviceType];

  const todayAppointments = ["09:00", "10:30", "13:00", "15:45"].map((time) => ({
    time,
    patient: pickOne(rand, NAMES),
    service: pickOne(rand, allowedService),
    status: pickOne(rand, allowedStatus),
  }));

  const latestCases = Array.from({ length: 3 }).map((_, i) => ({
    id: `CS-${randInt(rand, 1000, 9999)}${i}`,
    patient: pickOne(rand, NAMES),
    topic: pickOne(rand, TOPICS),
    owner: filters.staff === "ทั้งหมด" ? pickOne(rand, STAFF_OPTIONS.slice(1)) : filters.staff,
  }));

  const invoices = Array.from({ length: 3 }).map((_, i) => ({
    no: `INV-${randInt(rand, 7000, 9999)}${i}`,
    customer: pickOne(rand, CUSTOMERS),
    amount: formatCurrency(randInt(rand, 1800, 52000)),
    status: rand() > 0.35 ? "ชำระแล้ว" : "ค้างชำระ",
  }));

  const kpis: KPI[] = [
    { label: "จำนวนผู้ใช้ทั้งหมด", value: users.toLocaleString("th-TH"), trend: `${(rand() * 18 - 2).toFixed(1)}% จากช่วงก่อนหน้า` },
    { label: "ผู้ใช้ใหม่วันนี้ / สัปดาห์นี้", value: `${todayUsers.toLocaleString("th-TH")} / ${weekUsers.toLocaleString("th-TH")}`, trend: `${(rand() * 12 + 1).toFixed(1)}%` },
    { label: "จำนวนการนัดหมาย", value: appointments.toLocaleString("th-TH"), trend: `เฉลี่ยวันละ ${Math.round(appointments / diffDays).toLocaleString("th-TH")} นัด` },
    { label: "จำนวนการปรึกษา (เคส)", value: consults.toLocaleString("th-TH"), trend: `เปิดอยู่ ${Math.round(consults * 0.14).toLocaleString("th-TH")} เคส` },
    { label: "รายได้รวม", value: formatCurrency(total), trend: `${(rand() * 22 + 3).toFixed(1)}% จากช่วงก่อนหน้า` },
    { label: "ยอดค้างชำระ", value: formatCurrency(pendingAmount), trend: `ยังไม่ชำระ ${randInt(rand, 8, 58)} รายการ` },
  ];

  return {
    kpis,
    caseStats,
    revenueStats,
    appointmentStatus,
    channelStats,
    todayAppointments,
    latestCases,
    invoices,
    openCases: Math.round(consults * 0.14),
    followUpCases: Math.round(consults * 0.05),
    financeTotal: formatCurrency(total),
    financeOutstanding: formatCurrency(pendingAmount),
  };
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "สำเร็จ" || status === "ชำระแล้ว"
      ? `${styles.statusBadge} ${styles.success}`
      : status === "รออนุมัติ"
        ? `${styles.statusBadge} ${styles.pending}`
        : `${styles.statusBadge} ${styles.cancel}`;

  return <span className={cls}>{status}</span>;
}

export default function AdminReportPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [fromDate, setFromDate] = useState("2026-02-01");
  const [toDate, setToDate] = useState("2026-02-22");
  const [status, setStatus] = useState("ทั้งหมด");
  const [serviceType, setServiceType] = useState("ทั้งหมด");
  const [staff, setStaff] = useState("ทั้งหมด");
  const [savedProfile, setSavedProfile] = useState({
    name: "สมชาย",
    lastname: "กิจเจริญ",
    birthdate: "12/05/1995",
    phone: "089-111-2233",
    address: "123 ถนนสุขุมวิท เขตวัฒนา กรุงเทพมหานคร",
  });
  const [profileForm, setProfileForm] = useState(savedProfile);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const data = useMemo(() => {
    const key = `${fromDate}|${toDate}|${status}|${serviceType}|${staff}`;
    return createData(key, { fromDate, toDate, status, serviceType, staff });
  }, [fromDate, toDate, status, serviceType, staff]);

  const goExport = (source: "overview" | "finance") => {
    const params = new URLSearchParams({ from: fromDate, to: toDate, status, service: serviceType, staff, source });
    router.push(`/staff/admin-report/export?${params.toString()}`);
  };

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartEditProfile = () => {
    setProfileForm(savedProfile);
    setIsProfileEditing(true);
  };

  const handleSaveProfile = () => {
    setSavedProfile(profileForm);
    setIsProfileEditing(false);
  };

  const handleCancelProfile = () => {
    setProfileForm(savedProfile);
    setIsProfileEditing(false);
  };

  return (
    <div className={styles.page}>
      {isProfileOpen ? (
        <div className={styles.profileOverlay}>
          <section className={styles.profilePanel}>
            <div className={styles.profileTop}>
              <div>
                <p className={styles.profileBreadcrumb}>admin - ข้อมูลบัญชี</p>
                <h2>Hello ADMIN</h2>
                <p className={styles.profileRole}>ตำแหน่ง: เจ้าหน้าที่ธุรการ</p>
              </div>
              <div className={styles.profileActions}>
                {isProfileEditing ? (
                  <>
                    <button
                      className={styles.saveProfileBtn}
                      type="button"
                      onClick={handleSaveProfile}
                    >
                      บันทึก
                    </button>
                    <button
                      className={styles.cancelProfileBtn}
                      type="button"
                      onClick={handleCancelProfile}
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <button
                    className={styles.editProfileBtn}
                    type="button"
                    onClick={handleStartEditProfile}
                  >
                    แก้ไขข้อมูล
                  </button>
                )}
                <button
                  className={styles.closeProfileBtn}
                  type="button"
                  onClick={() => {
                    handleCancelProfile();
                    setIsProfileOpen(false);
                  }}
                >
                  ปิด
                </button>
              </div>
            </div>
            <div className={styles.profileGrid}>
              <label>
                Name
                <input
                  value={profileForm.name}
                  readOnly={!isProfileEditing}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                />
              </label>
              <label>
                Lastname
                <input
                  value={profileForm.lastname}
                  readOnly={!isProfileEditing}
                  onChange={(e) => handleProfileChange("lastname", e.target.value)}
                />
              </label>
              <label>
                Birthdate
                <input
                  value={profileForm.birthdate}
                  readOnly={!isProfileEditing}
                  onChange={(e) => handleProfileChange("birthdate", e.target.value)}
                />
              </label>
              <label>
                Phone
                <input
                  value={profileForm.phone}
                  readOnly={!isProfileEditing}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                />
              </label>
              <label className={styles.fullWidth}>
                Address
                <input
                  value={profileForm.address}
                  readOnly={!isProfileEditing}
                  onChange={(e) => handleProfileChange("address", e.target.value)}
                />
              </label>
            </div>
          </section>
        </div>
      ) : null}

      <header className={styles.header}>
        <div className={styles.brand}>JitDee.com</div>
        <div className={styles.headerActions} ref={menuRef}>
          <span className={styles.chip}>Admin Report</span>
          <button className={styles.avatar} type="button" onClick={() => setIsMenuOpen((v) => !v)}>AD</button>
          {isMenuOpen ? (
            <div className={styles.menu}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                ข้อมูลบัญชี
              </button>
              <button type="button" className={styles.signout}>Sign out</button>
            </div>
          ) : null}
        </div>
      </header>

      <main className={styles.shell}>
        <section className={`${styles.panel} ${styles.intro}`}>
          <div>
            <p className={styles.eyebrow}>ADMIN REPORT</p>
            <h1>ภาพรวมการบริการและการดำเนินงานระบบ</h1>
            <p>สรุปข้อมูลผู้ใช้ การนัดหมาย เคสปรึกษา และรายได้ในหน้าเดียว</p>
          </div>
          <button className={styles.primaryBtn} type="button" onClick={() => goExport("overview")}>Export รายงาน</button>
        </section>

        <section className={styles.kpiGrid}>
          {data.kpis.map((kpi) => (
            <article key={kpi.label} className={`${styles.panel} ${styles.kpi}`}>
              <p>{kpi.label}</p>
              <h3>{kpi.value}</h3>
              <span>{kpi.trend}</span>
            </article>
          ))}
        </section>

        <section className={styles.panel}>
          <h2>ตัวกรองข้อมูล</h2>
          <div className={styles.filterGrid}>
            <label>ช่วงวันที่<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
            <label>ถึงวันที่<input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
            <label>สถานะ<select value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS_OPTIONS.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label>ประเภทบริการ<select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>{SERVICE_OPTIONS.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label>บุคลากร<select value={staff} onChange={(e) => setStaff(e.target.value)}>{STAFF_OPTIONS.map((v) => <option key={v}>{v}</option>)}</select></label>
          </div>
        </section>

        <section className={styles.statsGrid}>
          <article className={`${styles.panel} ${styles.chartCard}`}>
            <h2>จำนวนเคสต่อวัน</h2>
            <div className={styles.bars}>
              {data.caseStats.map((item) => (
                <div key={item.label} className={styles.barWrap}>
                  <div className={styles.bar} style={{ height: `${item.value}%` }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.panel} ${styles.chartCard}`}>
            <h2>รายได้ต่อสัปดาห์</h2>
            <div className={styles.bars}>
              {data.revenueStats.map((item) => (
                <div key={item.label} className={styles.barWrap}>
                  <div className={`${styles.bar} ${styles.secondary}`} style={{ height: `${item.value}%` }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.panel} ${styles.miniCard}`}>
            <h2>นัดหมายตามสถานะ</h2>
            <ul className={styles.legendList}>
              {data.appointmentStatus.map((item) => <li key={item.label}><span>{item.label}</span><strong>{item.value}%</strong></li>)}
            </ul>
          </article>

          <article className={`${styles.panel} ${styles.miniCard}`}>
            <h2>Online vs Onsite</h2>
            <ul className={styles.legendList}>
              {data.channelStats.map((item) => <li key={item.label}><span>{item.label}</span><strong>{item.value}%</strong></li>)}
            </ul>
          </article>
        </section>

        <section className={styles.monitorGrid}>
          <article className={`${styles.panel} ${styles.tableCard}`}>
            <h2>การจัดการนัดหมาย</h2>
            <table>
              <thead><tr><th>เวลา</th><th>ผู้รับบริการ</th><th>ประเภท</th><th>สถานะ</th></tr></thead>
              <tbody>
                {data.todayAppointments.map((row) => (
                  <tr key={`${row.time}-${row.patient}`}>
                    <td>{row.time}</td><td>{row.patient}</td><td>{row.service}</td><td><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className={`${styles.panel} ${styles.tableCard}`}>
            <h2>การติดตามเคส</h2>
            <table>
              <thead><tr><th>รหัสเคส</th><th>ผู้รับบริการ</th><th>หัวข้อ</th><th>ผู้ดูแล</th></tr></thead>
              <tbody>
                {data.latestCases.map((row) => (
                  <tr key={row.id}><td>{row.id}</td><td>{row.patient}</td><td>{row.topic}</td><td>{row.owner}</td></tr>
                ))}
              </tbody>
            </table>
            <div className={styles.notes}><span>เคสยังไม่ปิด: {data.openCases.toLocaleString("th-TH")}</span><span>เคสที่ต้องติดตาม: {data.followUpCases.toLocaleString("th-TH")}</span></div>
          </article>
        </section>

        <section className={`${styles.panel} ${styles.finance}`}>
          <div className={styles.sectionHead}>
            <h2>การเงิน (Finance Summary)</h2>
            <button className={styles.primaryBtn} type="button" onClick={() => goExport("finance")}>Export รายงาน</button>
          </div>
          <div className={styles.financeKpi}>
            <div><p>รายได้รวม</p><h3>{data.financeTotal}</h3></div>
            <div><p>ยอดที่ยังไม่ชำระ</p><h3>{data.financeOutstanding}</h3></div>
          </div>
          <table>
            <thead><tr><th>เลขที่ใบเสร็จ</th><th>ลูกค้า</th><th>ยอดเงิน</th><th>สถานะ</th></tr></thead>
            <tbody>
              {data.invoices.map((row) => (
                <tr key={row.no}><td>{row.no}</td><td>{row.customer}</td><td>{row.amount}</td><td><StatusBadge status={row.status} /></td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
