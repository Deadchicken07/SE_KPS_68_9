"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type {
  ClinicHolidayFormState,
  ClinicScheduleResponse,
  StaffOption,
} from "@/types/staffAdminHome.types";
import { mapRoleIdToRole, roleHome } from "@/types/role.types";
import {
  getCurrentDateKey,
  getCurrentMonthKey,
  normalizeScheduleNoteText,
  parseStaffAdminHomeErrorMessage,
} from "@/utils/staffAdminHome";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WEEKDAY_LABELS = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

function getFirstDateOfMonth(monthKey: string) {
  return `${monthKey}-01`;
}

function getWeekdayFromDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`).getUTCDay();
}

function getMonthDateKeys(monthKey: string) {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const nextMonth = new Date(Date.UTC(year, monthIndex + 1, 1));
  const cursor = new Date(Date.UTC(year, monthIndex, 1));
  const dateKeys: string[] = [];

  while (cursor < nextMonth) {
    dateKeys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dateKeys;
}

function getNormalizedMonthDate(monthKey: string, todayDateKey: string) {
  return monthKey === getCurrentMonthKey()
    ? todayDateKey
    : getFirstDateOfMonth(monthKey);
}

export const useAdminWorkSchedule = () => {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const todayDateKey = getCurrentDateKey();
  const currentMonthKey = getCurrentMonthKey();
  const [hasAccess, setHasAccess] = useState(false);
  const [month, setMonth] = useState(currentMonthKey);
  const [selectedDate, setSelectedDate] = useState(todayDateKey);
  const [data, setData] = useState<ClinicScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState<ClinicHolidayFormState>({
    staffId: "",
    note: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const roleId = me?.role_id ?? null;

    if (!roleId) {
      router.replace("/login");
      return;
    }

    if (roleId !== 1) {
      const role = mapRoleIdToRole(roleId);
      router.replace(role ? roleHome[role] : "/user");
      return;
    }

    setHasAccess(true);
  }, [authLoading, me?.role_id, router]);

  useEffect(() => {
    if (!hasAccess) {
      return;
    }

    let ignore = false;

    async function loadDashboard() {
      if (isLoading) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }
      setError(null);

      const query = new URLSearchParams({
        month,
        date: selectedDate,
      });

      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await fetch(
          `${API_URL}/staff-home/clinic-schedule?${query.toString()}`,
          {
            credentials: "include",
            headers: { ...authHeaders },
          },
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(parseStaffAdminHomeErrorMessage(payload));
        }

        if (!ignore) {
          setData(payload as ClinicScheduleResponse);
        }
      } catch (caught) {
        if (ignore) {
          return;
        }

        setError(
          caught instanceof Error
            ? caught.message
            : "โหลดข้อมูลวันหยุดรายเดือนไม่สำเร็จ",
        );
        setData(null);
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [hasAccess, month, selectedDate, reloadKey]);

  const holidayStaffOptions = useMemo(
    () =>
      data?.holidayStaffOptions?.length
        ? data.holidayStaffOptions
        : (data?.staffOptions ?? []),
    [data?.holidayStaffOptions, data?.staffOptions],
  );

  useEffect(() => {
    if (form.staffId) {
      return;
    }

    const firstStaffId = holidayStaffOptions[0]?.id;

    if (!firstStaffId) {
      return;
    }

    setForm((current) => ({
      ...current,
      staffId: String(firstStaffId),
    }));
  }, [form.staffId, holidayStaffOptions]);

  const selectedStaff = useMemo<StaffOption | null>(
    () =>
      holidayStaffOptions.find((staff) => String(staff.id) === form.staffId) ??
      null,
    [form.staffId, holidayStaffOptions],
  );

  const scheduleEntries = useMemo(() => {
    if (!selectedStaff) {
      return [];
    }

    return (data?.scheduleEntries ?? [])
      .filter(
        (entry) =>
          entry.status === "holiday" && entry.staffId === selectedStaff.id,
      )
      .sort((left, right) => left.workDate.localeCompare(right.workDate));
  }, [data?.scheduleEntries, selectedStaff]);

  const selectedSchedule = useMemo(
    () =>
      scheduleEntries.find((entry) => entry.workDate === selectedDate) ?? null,
    [scheduleEntries, selectedDate],
  );

  const weekdayOptions = useMemo(() => {
    const monthDateKeys = getMonthDateKeys(month);

    return WEEKDAY_LABELS.map((label, value) => {
      const matchingDates = monthDateKeys.filter(
        (dateKey) =>
          dateKey >= todayDateKey && getWeekdayFromDateKey(dateKey) === value,
      );
      const anchorDate = matchingDates[0] ?? null;

      return {
        value,
        label,
        anchorDate,
        disabled: !anchorDate,
      };
    });
  }, [month, todayDateKey]);

  const selectedWeekday = useMemo(
    () => getWeekdayFromDateKey(selectedDate),
    [selectedDate],
  );

  useEffect(() => {
    setForm((current) => {
      const nextNote = normalizeScheduleNoteText(selectedSchedule?.note);

      if (current.note === nextNote) {
        return current;
      }

      return {
        ...current,
        note: nextNote,
      };
    });
  }, [selectedSchedule]);

  const handleMonthChange = (nextMonth: string) => {
    if (!nextMonth) {
      return;
    }

    const normalizedMonth =
      nextMonth < currentMonthKey ? currentMonthKey : nextMonth;

    setMonth(normalizedMonth);
    setSelectedDate(getNormalizedMonthDate(normalizedMonth, todayDateKey));
    setFormError(null);
  };

  const handleSelectWeekday = (weekday: number) => {
    const option = weekdayOptions.find((item) => item.value === weekday);

    if (!option?.anchorDate) {
      return;
    }

    setSelectedDate(option.anchorDate);
    setFormError(null);
  };

  const handleStaffChange = (staffId: string) => {
    setForm((current) => ({
      ...current,
      staffId,
    }));
    setFormError(null);
  };

  const handleNoteChange = (note: string) => {
    setForm((current) => ({
      ...current,
      note,
    }));
    setFormError(null);
  };

  const buildClinicHolidayPayload = () => {
    if (!selectedStaff) {
      throw new Error("กรุณาเลือกบุคลากร");
    }

    return {
      month,
      weekday: getWeekdayFromDateKey(selectedDate),
      scope: "individual" as const,
      staffId: selectedStaff.id,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (selectedDate < todayDateKey) {
      setFormError("ไม่สามารถแก้ไขวันย้อนหลังได้");
      return;
    }

    setSubmitting(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const payload = buildClinicHolidayPayload();
      const response = await fetch(`${API_URL}/staff-home/clinic-holiday`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          ...payload,
          note: form.note.trim() || null,
        }),
      });

      const responsePayload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseStaffAdminHomeErrorMessage(responsePayload));
      }

      setReloadKey((current) => current + 1);
    } catch (caught) {
      setFormError(
        caught instanceof Error
          ? caught.message
          : "บันทึกวันหยุดรายเดือนไม่สำเร็จ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setFormError(null);

    if (!selectedSchedule) {
      setFormError("ยังไม่มีวันหยุดของบุคลากรในวันที่เลือก");
      return;
    }

    setDeleting(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const payload = buildClinicHolidayPayload();
      const response = await fetch(`${API_URL}/staff-home/clinic-holiday`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseStaffAdminHomeErrorMessage(responsePayload));
      }

      setReloadKey((current) => current + 1);
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "ลบวันหยุดรายเดือนไม่สำเร็จ",
      );
    } finally {
      setDeleting(false);
    }
  };

  return {
    currentMonthKey,
    deleting,
    error,
    form,
    formError,
    handleDelete,
    handleMonthChange,
    handleNoteChange,
    handleSelectWeekday,
    handleStaffChange,
    handleSubmit,
    hasAccess,
    holidayStaffOptions,
    isFetching,
    isLoading,
    month,
    scheduleEntries,
    selectedDate,
    selectedSchedule,
    selectedStaff,
    selectedWeekday,
    submitting,
    todayDateKey,
    weekdayOptions,
  };
};
