"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./schedule-ui.css";
import Badge from "@/components/ui/Badge";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";

type TabKey = "upcoming" | "past";
type AppointmentStatus = "pending" | "confirmed" | "completed" | "waiting";

type AppointmentItem = {
  id: number;
  staffId: number | null;
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

type RescheduleFormState = {
  appointmentId: number;
  staffId: number | null;
  consultantName: string;
  appointmentDate: string;
  startTime: string;
  durationMins: number;
};

type PaymentFormState = {
  appointmentId: number;
  consultantName: string;
  slipFile: File | null;
  slipPreviewUrl: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const DEFAULT_MEET_LINK =
  process.env.NEXT_PUBLIC_CLINIC_MEET_URL ?? "https://meet.google.com/new";
const JOIN_LEAD_MS = 30 * 60 * 1000;

const statusText: Record<AppointmentStatus, string> = {
  pending: "รอชำระเงิน",
  confirmed: "ยืนยันแล้ว",
  completed: "สำเร็จแล้ว",
  waiting: "รอการตรวจสอบ",
};

const appointmentTypeText: Record<NonNullable<AppointmentItem["appointmentType"]>, string> = {
  online: "ออนไลน์",
  onsite: "ที่คลินิก",
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
    return `${hours} ชม. ${minutes} นาที ${seconds} วินาที`;
  }

  return `${minutes} นาที ${seconds} วินาที`;
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
      message: "นัดหมายที่คลินิก กรุณามาถึงก่อนเวลาประมาณ 10 นาที",
    };
  }

  if (item.paymentStatus !== "Paid") {
    if (item.paymentStatus === "Pending") {
      return {
        state: "payment-required",
        message: "อยู่ระหว่างการพิจารณาตรวจสอบการชำระเงินของท่าน โดยเจ้าหน้าที่",
      };
    }
    return {
      state: "payment-required",
      message: "กรุณาชำระเงินก่อน จึงจะเปิดลิงก์ Google Meet ได้",
    };
  }

  if (!item.appointmentDate) {
    return {
      state: "invalid",
      message: "ไม่พบวันที่นัดหมาย กรุณาติดต่อเจ้าหน้าที่",
    };
  }

  const parsedRange = parseTimeRange(item.timeSelect);

  if (!parsedRange) {
    return {
      state: "invalid",
      message: "เวลานัดหมายไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่",
    };
  }

  const startAt = toDateTime(item.appointmentDate, parsedRange.startText);
  const endAt = toDateTime(item.appointmentDate, parsedRange.endText);

  if (!startAt || !endAt) {
    return {
      state: "invalid",
      message: "เวลานัดหมายไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่",
    };
  }

  const openAt = new Date(startAt.getTime() - JOIN_LEAD_MS);

  if (now < openAt) {
    return {
      state: "waiting",
      message: `จะเริ่มในอีก ${formatCountdown(openAt.getTime() - now.getTime())}`,
    };
  }

  if (now >= openAt && now < endAt) {
    return {
      state: "open",
      message: "ห้องประชุมเปิดแล้ว สามารถเข้าร่วมได้ทันที",
    };
  }

  return {
    state: "closed",
    message: "หมดเวลานัดหมายแล้ว ลิงก์เข้าห้องถูกปิด",
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallback = "ไม่สามารถดำเนินการรายการนี้ได้";

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

function buildInitialRescheduleForm(item: AppointmentItem): RescheduleFormState {
  const parsedRange = parseTimeRange(item.timeSelect);
  const durationMins = parsedRange ? parsedRange.endMinutes - parsedRange.startMinutes : 30;

  return {
    appointmentId: item.id,
    staffId: item.staffId,
    consultantName: item.consultantName,
    appointmentDate: item.appointmentDate ?? toLocalDateKey(new Date()),
    startTime: parsedRange?.startText ?? "09:00",
    durationMins,
  };
}

function buildInitialPaymentForm(item: AppointmentItem): PaymentFormState {
  return {
    appointmentId: item.id,
    consultantName: item.consultantName,
    slipFile: null,
    slipPreviewUrl: null,
  };
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
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleFormState | null>(null);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [fetchingTimes, setFetchingTimes] = useState(false);

  const fetchAvailableTimes = useCallback(async (dateStr: string, staffId: number, durationMins: number) => {
    setFetchingTimes(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/appointments/available-slots?date=${dateStr}`, {
        credentials: "include"
      });
      if (resp.ok) {
        const data = await resp.json();
        const baseSlots: string[] = data[staffId] || [];
        
        let validSlots = baseSlots;
        if (durationMins === 60) {
          validSlots = baseSlots.filter(t => {
            const [hh, mm] = t.split(":");
            const nextSlot = dayjs().hour(Number(hh)).minute(Number(mm)).add(30, "minute").format("HH:mm");
            return baseSlots.includes(nextSlot);
          });
        }
        setAvailableTimes(validSlots);
      } else {
        setAvailableTimes([]);
      }
    } catch {
      setAvailableTimes([]);
    } finally {
      setFetchingTimes(false);
    }
  }, []);

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
          : item.paymentStatus === "Pending"
            ? "waiting"
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
    setIsAuthRequired(false);
    setError(null);

    if (withLoading) {
      setLoading(true);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthRequired(true);
        }

        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as AppointmentScheduleApiResponse;

      setSchedule({
        upcoming: normalizeApiItems(payload.upcoming),
        past: normalizeApiItems(payload.past),
      });
    } catch (err: unknown) {
      setSchedule(defaultSchedule);
      setError(
        err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลนัดหมายได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const openRescheduleDialog = useCallback((item: AppointmentItem) => {
    const initForm = buildInitialRescheduleForm(item);
    setRescheduleForm(initForm);
    setIsRescheduleDialogOpen(true);
    if (initForm.appointmentDate && initForm.staffId) {
      void fetchAvailableTimes(initForm.appointmentDate, initForm.staffId, initForm.durationMins);
    }
  }, [fetchAvailableTimes]);

  const closeRescheduleDialog = useCallback(() => {
    setIsRescheduleDialogOpen(false);
    setRescheduleForm(null);
    setAvailableTimes([]);
  }, []);

  const openPaymentDialog = useCallback((item: AppointmentItem) => {
    setPaymentFormError(null);
    setPaymentForm(buildInitialPaymentForm(item));
    setIsPaymentDialogOpen(true);
  }, []);

  const closePaymentDialog = useCallback(() => {
    setIsPaymentDialogOpen(false);
    setPaymentForm((prev) => {
      if (prev?.slipPreviewUrl) {
        URL.revokeObjectURL(prev.slipPreviewUrl);
      }
      return null;
    });
    setPaymentFormError(null);
  }, []);

  const handleRescheduleSubmit = useCallback(async () => {
    if (!rescheduleForm) {
      return;
    }

    const item = rescheduleForm;

    setProcessingRescheduleId(item.appointmentId);
    const normalizedDate = item.appointmentDate.trim();
    const normalizedStart = item.startTime.trim();

    const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate);
    const isTimeValid = /^([01]\d|2[0-3]):([0-5]\d)$/.test(normalizedStart);

    if (!isDateValid || !isTimeValid) {
      setError("กรุณาเลือกวันและเวลาให้ถูกต้อง");
      return;
    }

    const [hh, mm] = normalizedStart.split(":").map(Number);
    const endTotalMins = hh * 60 + mm + item.durationMins;
    const endHh = Math.floor(endTotalMins / 60).toString().padStart(2, "0");
    const endMm = (endTotalMins % 60).toString().padStart(2, "0");
    const normalizedEnd = `${endHh}:${endMm}`;

    const normalizedTime = `${normalizedStart} - ${normalizedEnd}`;

    setProcessingRescheduleId(item.appointmentId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${item.appointmentId}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          appointmentDate: normalizedDate,
          timeSelect: normalizedTime,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      setSuccessMessage("เลื่อนนัดหมายสำเร็จ");
      closeRescheduleDialog();
      await fetchAppointments(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ไม่สามารถเลื่อนนัดหมายได้";
      setError(message);
    } finally {
      setProcessingRescheduleId(null);
    }
  }, [rescheduleForm, closeRescheduleDialog, fetchAppointments]);

  const handleReschedule = useCallback(
    async (item: AppointmentItem) => {
      openRescheduleDialog(item);
    },
    [openRescheduleDialog],
  );

  const handlePayAppointment = useCallback(
    async (item: AppointmentItem) => {
      openPaymentDialog(item);
    },
    [openPaymentDialog],
  );

  const handleConfirmMockPayment = useCallback(async () => {
    if (!paymentForm) {
      return;
    }

    if (!paymentForm.slipFile) {
      setPaymentFormError("กรุณาแนบสลิปก่อนยืนยันการชำระเงิน");
      return;
    }

    setProcessingPayId(paymentForm.appointmentId);
    setError(null);
    setSuccessMessage(null);
    setPaymentFormError(null);

    const slipFileName = paymentForm.slipFile.name;
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${paymentForm.appointmentId}/pay`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      setSuccessMessage(
        `ยืนยันการชำระเงินสำเร็จ แนบสลิป "${slipFileName}" แล้ว ลิงก์ Google Meet จะเปิดก่อนเวลานัด 30 นาที`,
      );
      closePaymentDialog();
      await fetchAppointments(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ไม่สามารถยืนยันการชำระเงินได้";
      setError(message);
    } finally {
      setProcessingPayId(null);
    }
  }, [paymentForm, closePaymentDialog, fetchAppointments]);

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
          <Badge>Schedule</Badge>
          <h1 className="appt-title">ตารางนัดหมาย</h1>
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
            กำลังจะมาถึง
          </button>
          <button
            aria-selected={activeTab === "past"}
            className={`appt-tab ${activeTab === "past" ? "is-active" : ""}`}
            onClick={() => setActiveTab("past")}
            role="tab"
            type="button"
          >
            ประวัติการนัดหมาย
          </button>
        </div>
      </header>

      {error && (
        <div className="appt-feedback is-error" role="alert">
          {error}
          {isAuthRequired ? (
            <Link className="appt-inline-link" href="/login">
              เข้าสู่ระบบ
            </Link>
          ) : null}
        </div>
      )}

      {successMessage && (
        <div className="appt-feedback is-success" role="status">
          {successMessage}
        </div>
      )}

      {activeTab === "upcoming" ? (
        <section className="appt-support-grid" aria-label="ข้อมูลเตรียมตัวก่อนพบผู้เชี่ยวชาญ">
          <article className="appt-support-card">
            <h2 className="appt-support-card__title">ก่อนเริ่มนัดหมายออนไลน์</h2>
            <ul className="appt-checklist">
              <li>เลือกสถานที่เงียบและเป็นส่วนตัว</li>
              <li>ทดสอบอินเทอร์เน็ต กล้อง และไมโครโฟน</li>
            </ul>
          </article>
        </section>
      ) : null}

      {loading ? (
        <div className="appt-feedback">กำลังโหลดข้อมูลนัดหมาย...</div>
      ) : appointments.length === 0 ? (
        <div className="appt-feedback">
          {activeTab === "upcoming" ? "ยังไม่มีนัดหมายที่กำลังจะมาถึง" : "ยังไม่มีประวัติการนัดหมาย"}
        </div>
      ) : (
        <div className="appt-list">
          {appointments.map((item, index) => {
            const isPaid = item.paymentStatus === "Paid";
            const isPending = item.paymentStatus === "Pending";
            const joinInfo = getJoinAccessInfo(item, clock);
            const canJoin = joinInfo.state === "open";
            const isRescheduling = processingRescheduleId === item.id;
            const isPaying = processingPayId === item.id;
            const isBusy = isRescheduling || isPaying;
            const joinLink = item.meetLink ?? DEFAULT_MEET_LINK;
            const secondaryActionLabel = !isPaid && !isPending
              ? "ชำระเงิน"
              : canJoin
                ? "เข้าร่วม Google Meet"
                : joinInfo.state === "not-online"
                  ? "นัดที่คลินิก"
                  : joinInfo.state === "waiting"
                    ? "ยังไม่ถึงเวลาเข้า"
                    : joinInfo.state === "closed"
                      ? "หมดเวลาแล้ว"
                      : "ไม่พร้อมใช้งาน";

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
                      วันที่: <span>{formatDate(item.appointmentDate)}</span>
                    </p>
                    <p className="appt-meta__line">
                      เวลา: <span>{item.timeSelect ?? "-"}</span>
                    </p>
                    <p className="appt-meta__line">
                      รูปแบบ:{" "}
                      <span>{item.appointmentType ? appointmentTypeText[item.appointmentType] : "-"}</span>
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

                  <p className="appt-payment">
                    การชำระเงิน:{" "}
                    <span className={`appt-payment__pill ${isPaid ? "is-paid" : isPending ? "is-pending" : "is-unpaid"}`}>
                      {isPaid ? "ชำระแล้ว" : isPending ? "รอตรวจสอบ" : "ยังไม่ชำระ"}
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
                          {isRescheduling ? "กำลังดำเนินการ..." : "เลื่อนนัด"}
                        </button>
                        {!isPaid && !isPending ? (
                          <Link
                            className="appt-btn appt-btn--primary"
                            href={`/user/payment?appointmentId=${item.id}`}
                          >
                            ไปหน้าชำระเงิน
                          </Link>
                        ) : isPending ? (
                          <button className="appt-btn appt-btn--disabled" disabled type="button">
                            รอตรวจสอบสลิป
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
                    <>
                      <div className="appt-actions" style={{ gridTemplateColumns: '1fr' }}>
                        <Link
                          className="appt-btn appt-btn--ghost"
                          href={`/user/medical-records?appointmentId=${item.id}`}
                          style={{ padding: '0 40px', width: 'auto', marginLeft: 'auto' }}
                        >
                          ดูรายละเอียดการปรึกษา
                        </Link>
                      </div>
                      <p className="appt-note">
                        ดูรายละเอียดการรักษา การจ่ายยา และบันทึกทางการแพทย์ของนัดหมายครั้งนี้
                      </p>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isRescheduleDialogOpen && rescheduleForm ? (
        <div
          aria-modal="true"
          className="appt-modal-backdrop"
          onClick={closeRescheduleDialog}
          role="dialog"
        >
          <div className="appt-modal" onClick={(event) => event.stopPropagation()}>
            <h3 className="appt-modal__title">เลื่อนนัดหมาย</h3>
            <p className="appt-modal__subtitle">{rescheduleForm.consultantName}</p>

            <label className="appt-modal__label" htmlFor="appt-date">
              วันที่
            </label>
            <DatePicker
              style={{ width: "100%", height: 42, marginBottom: 16, fontFamily: "inherit" }}
              format="YYYY-MM-DD"
              value={rescheduleForm.appointmentDate ? dayjs(rescheduleForm.appointmentDate) : null}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
              onChange={(date) => {
                setRescheduleForm((prev) => {
                  if (!prev) return prev;
                  const newDate = date ? date.format("YYYY-MM-DD") : prev.appointmentDate;
                  if (prev.staffId && newDate !== prev.appointmentDate) {
                     void fetchAvailableTimes(newDate, prev.staffId, prev.durationMins);
                  }
                  return {
                    ...prev,
                    appointmentDate: newDate,
                    startTime: newDate !== prev.appointmentDate ? "" : prev.startTime,
                  };
                });
              }}
            />

            <div>
              <label className="appt-modal__label" htmlFor="appt-start-time">
                เวลาเริ่ม (ระยะเวลาเดิม {rescheduleForm.durationMins} นาที)
              </label>
              <Select
                id="appt-start-time"
                value={rescheduleForm.startTime || undefined}
                placeholder="เลือกเวลา"
                loading={fetchingTimes}
                style={{ width: "100%", height: 42 }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                onChange={(val) =>
                  setRescheduleForm((prev) =>
                    prev
                      ? {
                        ...prev,
                        startTime: val,
                      }
                      : prev,
                  )
                }
              >
                {availableTimes.length > 0 ? (
                  availableTimes.map((t) => (
                    <Select.Option key={t} value={t}>
                      {t}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option disabled value={rescheduleForm.startTime}>
                    {rescheduleForm.startTime || "ไม่มีเวลาว่าง"} {rescheduleForm.startTime ? "(เวลาเดิม)" : ""}
                  </Select.Option>
                )}
              </Select>
            </div>

            <div className="appt-modal__actions">
              <button className="appt-modal__btn is-ghost" onClick={closeRescheduleDialog} type="button">
                ยกเลิก
              </button>
              <button
                className="appt-modal__btn is-primary"
                disabled={processingRescheduleId === rescheduleForm.appointmentId}
                onClick={() => void handleRescheduleSubmit()}
                type="button"
              >
                {processingRescheduleId === rescheduleForm.appointmentId ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isPaymentDialogOpen && paymentForm ? (
        <div
          aria-modal="true"
          className="appt-modal-backdrop"
          onClick={closePaymentDialog}
          role="dialog"
        >
          <div className="appt-modal appt-pay-modal" onClick={(event) => event.stopPropagation()}>
            <h3 className="appt-modal__title">คิวอาร์โค้ดชำระเงิน</h3>
            <p className="appt-modal__subtitle">{paymentForm.consultantName}</p>

            <div className="appt-pay-box">
              <img
                alt="คิวอาร์โค้ดชำระเงิน"
                className="appt-qr-image"
                src="/images/payment/mock-qr.png"
              />
              <p className="appt-pay-box__label">สแกนคิวอาร์เพื่อจำลองการชำระเงิน</p>
              <p className="appt-pay-box__meta">ยอดชำระ (จำลอง): 500.00 บาท</p>
            </div>

            <label className="appt-modal__label" htmlFor="appt-slip-file">
              แนบสลิป
            </label>
            <input
              accept="image/*,.pdf"
              className="appt-modal__input"
              id="appt-slip-file"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setPaymentForm((prev) => {
                  if (!prev) {
                    return prev;
                  }

                  if (prev.slipPreviewUrl) {
                    URL.revokeObjectURL(prev.slipPreviewUrl);
                  }

                  const previewUrl = file && file.type.startsWith("image/")
                    ? URL.createObjectURL(file)
                    : null;

                  return {
                    ...prev,
                    slipFile: file,
                    slipPreviewUrl: previewUrl,
                  };
                });
                setPaymentFormError(null);
              }}
              type="file"
            />

            {paymentForm.slipFile ? (
              <p className="appt-modal__file-name">ไฟล์ที่เลือก: {paymentForm.slipFile.name}</p>
            ) : null}

            {paymentForm.slipPreviewUrl ? (
              <img
                alt="ตัวอย่างสลิป"
                className="appt-slip-preview"
                src={paymentForm.slipPreviewUrl}
              />
            ) : null}

            {paymentFormError ? <p className="appt-modal__error">{paymentFormError}</p> : null}

            <div className="appt-modal__actions">
              <button className="appt-modal__btn is-ghost" onClick={closePaymentDialog} type="button">
                ยกเลิก
              </button>
              <button
                className="appt-modal__btn is-primary"
                disabled={processingPayId === paymentForm.appointmentId}
                onClick={() => void handleConfirmMockPayment()}
                type="button"
              >
                {processingPayId === paymentForm.appointmentId ? "กำลังยืนยัน..." : "ยืนยันการชำระเงิน"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
