"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import {
  AppointmentItem,
  AppointmentStatus,
  AppointmentTab,
  cancelMyAppointment,
  fetchMyAppointments,
  getApiErrorMessage,
  rescheduleMyAppointment,
} from "@/hooks/useAppointments";
import "./appointment-ui.css";

type ViewAppointment = {
  id: number;
  consultantName: string;
  dateText: string;
  timeText: string;
  contact: string;
  appointmentTypeText: string;
  status: AppointmentStatus;
  avatarLabel: string;
  raw: AppointmentItem;
};

const statusText: Record<AppointmentStatus, string> = {
  pending: "กำลังรออนุมัติ",
  confirmed: "ยืนยันแล้ว",
  completed: "เสร็จสิ้น",
};

export default function AppointmentSchedulePage() {
  const [activeTab, setActiveTab] = useState<AppointmentTab>("upcoming");
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyAppointments(activeTab);
      setAppointments(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const viewAppointments = useMemo<ViewAppointment[]>(
    () =>
      appointments.map((item) => {
        const fullName = [item.staff?.name, item.staff?.surName].filter(Boolean).join(" ").trim();

        return {
          id: item.id,
          consultantName: fullName || "รอจับคู่ผู้ให้คำปรึกษา",
          dateText: formatThaiDate(item.appointmentDate),
          timeText: item.timeSelect || "-",
          contact: item.staff?.email || "-",
          appointmentTypeText: formatAppointmentType(item.appointmentType),
          status: item.displayStatus,
          avatarLabel: getAvatarLabel(item.staff?.name, item.staff?.surName),
          raw: item,
        };
      }),
    [appointments]
  );

  const handleCancel = async (appointmentId: number) => {
    const accepted = window.confirm("ยืนยันการยกเลิกนัดหมายนี้?");
    if (!accepted) return;

    try {
      setActionId(appointmentId);
      setError(null);
      await cancelMyAppointment(appointmentId);
      setAppointments((prev) => prev.filter((item) => item.id !== appointmentId));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleReschedule = async (item: AppointmentItem) => {
    const suggestedDate = toDateInputValue(item.appointmentDate);
    const nextDate = window.prompt("กรอกวันนัดใหม่ (YYYY-MM-DD)", suggestedDate);
    if (!nextDate) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) {
      setError("รูปแบบวันนัดต้องเป็น YYYY-MM-DD");
      return;
    }

    const nextTime = window.prompt(
      "กรอกช่วงเวลาใหม่ (ตัวอย่าง 09:00 - 10:00)",
      item.timeSelect || ""
    );
    if (nextTime === null) return;

    try {
      setActionId(item.id);
      setError(null);
      const updated = await rescheduleMyAppointment(item.id, {
        appointmentDate: nextDate,
        timeSelect: nextTime,
      });

      setAppointments((prev) => prev.map((current) => (current.id === updated.id ? updated : current)));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

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

      {error ? (
        <div className="appt-banner appt-banner--error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="appt-state-card">กำลังโหลดข้อมูลนัดหมาย...</div>
      ) : viewAppointments.length === 0 ? (
        <div className="appt-state-card">ยังไม่มีรายการนัดหมายในแท็บนี้</div>
      ) : (
        <div className="appt-list">
          {viewAppointments.map((item, index) => {
            const isBusy = actionId === item.id;
            const isClosed = item.status === "completed" || activeTab === "past";

            return (
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
                      เวลา: <span>{item.timeText}</span>
                    </p>
                    <p className="appt-meta__line">
                      ประเภท: <span>{item.appointmentTypeText}</span>
                    </p>
                    <p className="appt-meta__line">
                      ติดต่อ: <span>{item.contact}</span>
                    </p>
                  </div>
                </div>

                <div className="appt-card__right">
                  <p className="appt-status">
                    สถานะ: <span className={`appt-status__pill is-${item.status}`}>{statusText[item.status]}</span>
                  </p>

                  {isClosed ? (
                    <p className="appt-card__note">รายการนี้ปิดแล้ว</p>
                  ) : (
                    <div className="appt-actions">
                      <button
                        className="appt-btn appt-btn--ghost"
                        onClick={() => void handleReschedule(item.raw)}
                        type="button"
                        disabled={isBusy}
                      >
                        เลื่อน
                      </button>
                      <button
                        className="appt-btn appt-btn--solid"
                        onClick={() => void handleCancel(item.id)}
                        type="button"
                        disabled={isBusy}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatThaiDate(value: string | null) {
  if (!value) return "-";

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toDateInputValue(value: string | null) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getAvatarLabel(name?: string, surName?: string) {
  const source = [name, surName].filter(Boolean).join(" ").trim();
  if (!source) return "NA";

  return source
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatAppointmentType(type: AppointmentItem["appointmentType"]) {
  if (type === "online") return "ออนไลน์";
  if (type === "onsite") return "พบที่คลินิก";
  return "-";
}
