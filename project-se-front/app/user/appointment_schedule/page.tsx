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
  meetLink: string | null;
};

type AppointmentScheduleResponse = {
  upcoming: AppointmentItem[];
  past: AppointmentItem[];
};

type AppointmentScheduleApiResponse = {
  upcoming?: Array<Omit<AppointmentItem, "meetLink"> & { meetLink?: string | null }>;
  past?: Array<Omit<AppointmentItem, "meetLink"> & { meetLink?: string | null }>;
};

type ApiErrorPayload = {
  message?: string | string[];
};

type ParsedTimeRange = {
  startText: string;
  endText: string;
  startMinutes: number;
  endMinutes: number;
};

type JoinAccessState =
  | "not-online"
  | "payment-required"
  | "waiting"
  | "open"
  | "closed"
  | "invalid";

type JoinAccessInfo = {
  state: JoinAccessState;
  message: string;
};

type EnrichedAppointment = AppointmentItem & {
  isPastByClock: boolean;
  sortValue: number;
};

const API_BASE_URL = "http://localhost:4000";
const DEFAULT_MEET_LINK =
  process.env.NEXT_PUBLIC_CLINIC_MEET_URL ?? "https://meet.google.com/new";
const JOIN_LEAD_MS = 30 * 60 * 1000;

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

function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("access_token");
}

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

function toLocalDateKey(value: Date): string {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseTimeRange(timeSelect: string | null): ParsedTimeRange | null {
  if (!timeSelect) {
    return null;
  }

  const match = timeSelect
    .trim()
    .match(/^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$/);

  if (!match) {
    return null;
  }

  const startText = `${match[1]}:${match[2]}`;
  const endText = `${match[3]}:${match[4]}`;
  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const endMinutes = Number(match[3]) * 60 + Number(match[4]);

  if (endMinutes <= startMinutes) {
    return null;
  }

  return {
    startText,
    endText,
    startMinutes,
    endMinutes,
  };
}

function toDateTime(dateKey: string, timeText: string): Date | null {
  const value = new Date(`${dateKey}T${timeText}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

function isPastByClock(item: AppointmentItem, now: Date): boolean {
  if (!item.appointmentDate) {
    return false;
  }

  const parsedRange = parseTimeRange(item.timeSelect);
  const today = toLocalDateKey(now);

  if (item.appointmentDate < today) {
    return true;
  }

  if (item.appointmentDate > today) {
    return false;
  }

  if (!parsedRange) {
    return false;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return parsedRange.endMinutes <= nowMinutes;
}

function getSortValue(item: AppointmentItem): number {
  if (!item.appointmentDate) {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsedRange = parseTimeRange(item.timeSelect);
  const datePart = Number(item.appointmentDate.replace(/-/g, ""));
  const timePart = parsedRange?.startMinutes ?? 0;
  return datePart * 10000 + timePart;
}

function getJoinAccessInfo(item: AppointmentItem, now: Date): JoinAccessInfo {
  if (item.appointmentType !== "online") {
    return {
      state: "not-online",
      message: "This is an onsite appointment. Please arrive at clinic 10 minutes early.",
    };
  }

  if (item.paymentStatus !== "Paid") {
    return {
      state: "payment-required",
      message: "Please complete payment first to unlock Google Meet.",
    };
  }

  if (!item.appointmentDate) {
    return {
      state: "invalid",
      message: "Appointment date is missing. Please contact support.",
    };
  }

  const parsedRange = parseTimeRange(item.timeSelect);

  if (!parsedRange) {
    return {
      state: "invalid",
      message: "Appointment time is invalid. Please contact support.",
    };
  }

  const startAt = toDateTime(item.appointmentDate, parsedRange.startText);
  const endAt = toDateTime(item.appointmentDate, parsedRange.endText);

  if (!startAt || !endAt) {
    return {
      state: "invalid",
      message: "Appointment time is invalid. Please contact support.",
    };
  }

  const openAt = new Date(startAt.getTime() - JOIN_LEAD_MS);

  if (now < openAt) {
    return {
      state: "waiting",
      message: `Google Meet opens in ${formatCountdown(openAt.getTime() - now.getTime())}.`,
    };
  }

  if (now >= openAt && now < endAt) {
    return {
      state: "open",
      message: "Meeting room is open now. You can join until session end time.",
    };
  }

  return {
    state: "closed",
    message: "Session window ended. Meeting link is no longer available.",
  };
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

function normalizeApiItems(
  items: Array<Omit<AppointmentItem, "meetLink"> & { meetLink?: string | null }> = [],
): AppointmentItem[] {
  return items.map((item) => ({
    ...item,
    meetLink: item.meetLink ?? null,
  }));
}

export default function AppointmentSchedulePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [schedule, setSchedule] = useState<AppointmentScheduleResponse>(defaultSchedule);
  const [clock, setClock] = useState<Date>(() => new Date());
  const [loading, setLoading] = useState(true);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingRescheduleId, setProcessingRescheduleId] = useState<number | null>(null);
  const [processingPayId, setProcessingPayId] = useState<number | null>(null);

  const normalizedSchedule = useMemo<AppointmentScheduleResponse>(() => {
    const byId = new Map<number, AppointmentItem>();
    const all = [...schedule.upcoming, ...schedule.past];

    all.forEach((item) => {
      byId.set(item.id, item);
    });

    const computed: EnrichedAppointment[] = Array.from(byId.values()).map((item) => {
      const past = isPastByClock(item, clock);
      const status: AppointmentStatus = past
        ? "completed"
        : item.paymentStatus === "Paid"
          ? "confirmed"
          : "pending";

      return {
        ...item,
        status,
        isPastByClock: past,
        sortValue: getSortValue(item),
      };
    });

    const upcoming = computed
      .filter((item) => !item.isPastByClock)
      .sort((a, b) => a.sortValue - b.sortValue)
      .map(({ isPastByClock, sortValue, ...item }) => item);

    const past = computed
      .filter((item) => item.isPastByClock)
      .sort((a, b) => b.sortValue - a.sortValue)
      .map(({ isPastByClock, sortValue, ...item }) => item);

    return { upcoming, past };
  }, [schedule, clock]);

  const appointments = useMemo(
    () => normalizedSchedule[activeTab],
    [activeTab, normalizedSchedule],
  );

  const fetchAppointments = useCallback(async (withLoading: boolean) => {
    const token = getTokenFromStorage();

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

      const payload = (await response.json()) as AppointmentScheduleApiResponse;

      setSchedule({
        upcoming: normalizeApiItems(payload.upcoming),
        past: normalizeApiItems(payload.past),
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
      const token = getTokenFromStorage();

      if (!token) {
        setIsAuthRequired(true);
        setError("Please login to continue.");
        return;
      }

      const nextDate = window.prompt("New date (YYYY-MM-DD)", item.appointmentDate ?? "");

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
        normalizedTime,
      );

      if (!isDateValid || !isTimeValid) {
        setError("Please use YYYY-MM-DD and HH:mm - HH:mm format.");
        return;
      }

      setProcessingRescheduleId(item.id);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/appointments/${item.id}/reschedule`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentDate: normalizedDate,
            timeSelect: normalizedTime,
          }),
        });

        if (!response.ok) {
          throw new Error(await parseErrorMessage(response));
        }

        setSuccessMessage("Appointment rescheduled successfully.");
        await fetchAppointments(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to reschedule appointment";
        setError(message);
      } finally {
        setProcessingRescheduleId(null);
      }
    },
    [fetchAppointments],
  );

  const handlePayAppointment = useCallback(
    async (item: AppointmentItem) => {
      const token = getTokenFromStorage();

      if (!token) {
        setIsAuthRequired(true);
        setError("Please login to continue.");
        return;
      }

      setProcessingPayId(item.id);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/appointments/${item.id}/pay`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(await parseErrorMessage(response));
        }

        setSuccessMessage(
          "Payment completed. Google Meet link will open 30 minutes before your appointment.",
        );
        await fetchAppointments(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to process payment";
        setError(message);
      } finally {
        setProcessingPayId(null);
      }
    },
    [fetchAppointments],
  );

  useEffect(() => {
    void fetchAppointments(true);
  }, [fetchAppointments]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="appt-shell">
      <div className="appt-shell__glow appt-shell__glow--left" />
      <div className="appt-shell__glow appt-shell__glow--right" />

      <header className="appt-header">
        <div className="appt-header__top">
          <h1 className="appt-title">ตารางนัดหมาย</h1>
          <button
            className="appt-refresh-btn"
            onClick={() => void fetchAppointments(true)}
            type="button"
          >
            Refresh
          </button>
        </div>
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

      <section className="appt-support-grid" aria-label="Mental health support">
        <article className="appt-support-card">
          <h2 className="appt-support-card__title">Before your online session</h2>
          <ul className="appt-checklist">
            <li>Choose a quiet and private space</li>
            <li>Test internet, camera, and microphone</li>
            <li>Prepare water and a short note of topics you want to discuss</li>
          </ul>
        </article>
      </section>

      {loading ? (
        <div className="appt-feedback">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="appt-feedback">
          {activeTab === "upcoming" ? "No upcoming appointments." : "No past appointments."}
        </div>
      ) : (
        <div className="appt-list">
          {appointments.map((item, index) => {
            const isPaid = item.paymentStatus === "Paid";
            const joinInfo = getJoinAccessInfo(item, clock);
            const canJoin = joinInfo.state === "open";
            const isRescheduling = processingRescheduleId === item.id;
            const isPaying = processingPayId === item.id;
            const isBusy = isRescheduling || isPaying;
            const joinLink = item.meetLink ?? DEFAULT_MEET_LINK;
            const secondaryActionLabel = !isPaid
              ? "Pay now"
              : canJoin
                ? "Join Google Meet"
                : joinInfo.state === "not-online"
                  ? "Onsite only"
                  : joinInfo.state === "waiting"
                    ? "Join locked"
                    : joinInfo.state === "closed"
                      ? "Session ended"
                      : "Unavailable";

            return (
              <article
                className="appt-card"
                key={item.id}
                style={{ "--delay": `${index * 80}ms` } as CSSProperties}
              >
                <div className="appt-card__left">
                  {item.avatarUrl ? (
                    <img
                      alt={item.consultantName}
                      className="appt-avatar appt-avatar--image"
                      src={item.avatarUrl}
                    />
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

                  <p className="appt-payment">
                    Payment:{" "}
                    <span className={`appt-payment__pill ${isPaid ? "is-paid" : "is-unpaid"}`}>
                      {isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </p>

                  {activeTab === "upcoming" ? (
                    <>
                      <div className="appt-actions">
                        <button
                          className="appt-btn appt-btn--ghost"
                          disabled={isBusy}
                          onClick={() => void handleReschedule(item)}
                          type="button"
                        >
                          {isRescheduling ? "Processing..." : "Reschedule"}
                        </button>
                        {!isPaid ? (
                          <button
                            className="appt-btn appt-btn--primary"
                            disabled={isBusy}
                            onClick={() => void handlePayAppointment(item)}
                            type="button"
                          >
                            {isPaying ? "Processing..." : secondaryActionLabel}
                          </button>
                        ) : canJoin ? (
                          <a
                            className="appt-btn appt-btn--join"
                            href={joinLink}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {secondaryActionLabel}
                          </a>
                        ) : (
                          <button className="appt-btn appt-btn--disabled" disabled type="button">
                            {secondaryActionLabel}
                          </button>
                        )}
                      </div>
                      <p className="appt-note">{joinInfo.message}</p>
                    </>
                  ) : (
                    <p className="appt-note">
                      Session window ended. This appointment is now marked as completed.
                    </p>
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
