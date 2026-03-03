"use client";

import { CSSProperties, useMemo, useState } from "react";
import "./appointment-ui.css";

type TabKey = "upcoming" | "past";
type AppointmentStatus = "pending" | "confirmed" | "completed";

type AppointmentItem = {
  id: number;
  consultantName: string;
  dateText: string;
  contact: string;
  status: AppointmentStatus;
  avatarLabel: string;
};

const upcomingAppointments: AppointmentItem[] = [
  {
    id: 1,
    consultantName: "ชื่อผู้ให้คำปรึกษา",
    dateText: "12 ก.พ. 2026",
    contact: "test@sss.com",
    status: "pending",
    avatarLabel: "CS",
  },
  {
    id: 2,
    consultantName: "ชื่อผู้ให้คำปรึกษา",
    dateText: "20 ก.พ. 2026",
    contact: "demo@sss.com",
    status: "confirmed",
    avatarLabel: "DA",
  },
];

const pastAppointments: AppointmentItem[] = [
  {
    id: 3,
    consultantName: "ชื่อผู้ให้คำปรึกษา",
    dateText: "5 ม.ค. 2026",
    contact: "history1@sss.com",
    status: "completed",
    avatarLabel: "NA",
  },
  {
    id: 4,
    consultantName: "ชื่อผู้ให้คำปรึกษา",
    dateText: "22 ธ.ค. 2025",
    contact: "history2@sss.com",
    status: "completed",
    avatarLabel: "PP",
  },
];

const statusText: Record<AppointmentStatus, string> = {
  pending: "กำลังรออนุมัติ",
  confirmed: "ยืนยันแล้ว",
  completed: "เสร็จสิ้น",
};

export default function AppointmentSchedulePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  const appointments = useMemo(
    () => (activeTab === "upcoming" ? upcomingAppointments : pastAppointments),
    [activeTab]
  );

  return (
    <section className="appt-shell">
      <div className="appt-shell__glow appt-shell__glow--left" />
      <div className="appt-shell__glow appt-shell__glow--right" />

      <header className="appt-header">
        <h1 className="appt-title">ตารางนัดหมาย</h1>
        <div className="appt-divider" />
        <div className="appt-tabs" role="tablist" aria-label="Appointment tabs">
          <button
            aria-selected={activeTab === "upcoming"}
            className={`appt-tab ${activeTab === "upcoming" ? "is-active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
            role="tab"
            type="button"
          >
            Upcoming
          </button>
          <button
            aria-selected={activeTab === "past"}
            className={`appt-tab ${activeTab === "past" ? "is-active" : ""}`}
            onClick={() => setActiveTab("past")}
            role="tab"
            type="button"
          >
            Past
          </button>
        </div>
      </header>

      <div className="appt-list">
        {appointments.map((item, index) => (
          <article
            className="appt-card"
            key={item.id}
            style={{ "--delay": `${index * 80}ms` } as CSSProperties}
          >
            <div className="appt-card__left">
              <div aria-hidden="true" className="appt-avatar">
                {item.avatarLabel}
              </div>
              <div className="appt-meta">
                <h2 className="appt-meta__name">{item.consultantName}</h2>
                <p className="appt-meta__line">
                  วันนัดหมาย: <span>{item.dateText}</span>
                </p>
                <p className="appt-meta__line">
                  ติดต่อ: <span>{item.contact}</span>
                </p>
              </div>
            </div>

            <div className="appt-card__right">
              <p className="appt-status">
                สถานะ:{" "}
                <span className={`appt-status__pill is-${item.status}`}>{statusText[item.status]}</span>
              </p>
              <div className="appt-actions">
                <button className="appt-btn appt-btn--ghost" type="button">
                  เลื่อน
                </button>
                <button className="appt-btn appt-btn--solid" type="button">
                  ยกเลิก
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
