"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./appointment-ui.css";

type TabKey = "upcoming" | "past";
type AppointmentStatus = "pending" | "confirmed" | "completed";

type AppointmentItem = {
  id: number;
  consultantName: string;
  appointmentDate: string | null;
  timeSelect: string | null;
  contact: string;
  status: AppointmentStatus;
  avatarLabel: string;
  avatarUrl: string | null;
  appointmentType: "online" | "onsite" | null;
  paymentStatus: string | null;
};

type AppointmentScheduleResponse = {
  upcoming: AppointmentItem[];
  past: AppointmentItem[];
};

type ApiErrorPayload = {
  message?: string | string[];
};

const API_BASE_URL = "http://localhost:4000";

const statusText: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
};

const appointmentTypeText: Record<NonNullable<AppointmentItem["appointmentType"]>, string> = {
  online: "Online",
  onsite: "Onsite",
};

const defaultSchedule: AppointmentScheduleResponse = {
  upcoming: [],
  past: [],
};

function formatDate(dateKey: string | null): string {
  if (!dateKey) {
    return "-";
  }

  const date = new Date(`${dateKey}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallback = "Unable to complete the request";

  try {
    const payload = (await response.json()) as ApiErrorPayload;

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }

    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message.join(", ");
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export default function AppointmentSchedulePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [schedule, setSchedule] = useState<AppointmentScheduleResponse>(defaultSchedule);
  const [loading, setLoading] = useState(true);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionAppointmentId, setActionAppointmentId] = useState<number | null>(null);

  const appointments = useMemo(() => schedule[activeTab], [activeTab, schedule]);

  const fetchAppointments = useCallback(async (withLoading: boolean) => {
    if (typeof window === "undefined") {
      return;
    }

    const token = window.localStorage.getItem("access_token");

    if (!token) {
      setIsAuthRequired(true);
      setError("Please login to view your appointment schedule.");
      setLoading(false);
      return;
    }

    setIsAuthRequired(false);
    setError(null);

    if (withLoading) {
      setLoading(true);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthRequired(true);
          setSchedule(defaultSchedule);
          setError("Your session has expired. Please login again.");
          return;
        }

        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as AppointmentScheduleResponse;
      setSchedule({
        upcoming: payload.upcoming ?? [],
        past: payload.past ?? [],
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to load appointments";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReschedule = useCallback(
    async (item: AppointmentItem) => {
      const nextDate = window.prompt(
        "New date (YYYY-MM-DD)",
        item.appointmentDate ?? ""
      );

      if (!nextDate) {
        return;
      }

      const nextTime = window.prompt("New time (HH:mm - HH:mm)", item.timeSelect ?? "");

      if (!nextTime) {
        return;
      }

      const normalizedDate = nextDate.trim();
      const normalizedTime = nextTime.trim().replace(/\s*-\s*/, " - ");
      const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate);
      const isTimeValid = /^([01]\d|2[0-3]):([0-5]\d)\s-\s([01]\d|2[0-3]):([0-5]\d)$/.test(
        normalizedTime
      );

      if (!isDateValid || !isTimeValid) {
        setError("Mockup: please use YYYY-MM-DD and HH:mm - HH:mm format.");
        return;
      }

      setActionAppointmentId(item.id);
      setError(null);
      setSuccessMessage(null);

      setSchedule((prev) => ({
        ...prev,
        upcoming: prev.upcoming.map((appointment) =>
          appointment.id === item.id
            ? {
                ...appointment,
                appointmentDate: normalizedDate,
                timeSelect: normalizedTime,
              }
            : appointment
        ),
      }));

      setSuccessMessage("Mockup only: updated on screen (not saved to database).");
      setActionAppointmentId(null);
    },
    []
  );

  useEffect(() => {
    void fetchAppointments(true);
  }, [fetchAppointments]);

  return (
    <section className="appt-shell">
      <div className="appt-shell__glow appt-shell__glow--left" />
      <div className="appt-shell__glow appt-shell__glow--right" />

      <header className="appt-header">
        <h1 className="appt-title">Appointment Schedule</h1>
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

      {error && (
        <div className="appt-feedback is-error" role="alert">
          {error}
          {isAuthRequired ? (
            <Link className="appt-inline-link" href="/login">
              Login
            </Link>
          ) : null}
        </div>
      )}

      {successMessage && (
        <div className="appt-feedback is-success" role="status">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="appt-feedback">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="appt-feedback">
          {activeTab === "upcoming"
            ? "No upcoming appointments."
            : "No past appointments."}
        </div>
      ) : (
        <div className="appt-list">
          {appointments.map((item, index) => {
            const isBusy = actionAppointmentId === item.id;

            return (
              <article
                className="appt-card"
                key={item.id}
                style={{ "--delay": `${index * 80}ms` } as CSSProperties}
              >
                <div className="appt-card__left">
                  {item.avatarUrl ? (
                    <img alt={item.consultantName} className="appt-avatar appt-avatar--image" src={item.avatarUrl} />
                  ) : (
                    <div aria-hidden="true" className="appt-avatar">
                      {item.avatarLabel}
                    </div>
                  )}
                  <div className="appt-meta">
                    <h2 className="appt-meta__name">{item.consultantName}</h2>
                    <p className="appt-meta__line">
                      Date: <span>{formatDate(item.appointmentDate)}</span>
                    </p>
                    <p className="appt-meta__line">
                      Time: <span>{item.timeSelect ?? "-"}</span>
                    </p>
                    <p className="appt-meta__line">
                      Type:{" "}
                      <span>{item.appointmentType ? appointmentTypeText[item.appointmentType] : "-"}</span>
                    </p>
                    <p className="appt-meta__line">
                      Contact: <span>{item.contact}</span>
                    </p>
                  </div>
                </div>

                <div className="appt-card__right">
                  <p className="appt-status">
                    Status:{" "}
                    <span className={`appt-status__pill is-${item.status}`}>{statusText[item.status]}</span>
                  </p>

                  {activeTab === "upcoming" ? (
                    <div className="appt-actions">
                      <button
                        className="appt-btn appt-btn--ghost"
                        disabled={isBusy}
                        onClick={() => void handleReschedule(item)}
                        type="button"
                      >
                        {isBusy ? "Processing..." : "Reschedule"}
                      </button>
                    </div>
                  ) : (
                    <p className="appt-meta__line">This appointment is already completed.</p>
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
