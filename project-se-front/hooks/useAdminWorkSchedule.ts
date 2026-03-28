"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type {
  ClinicHolidayFormState,
  ClinicHolidayScope,
  ClinicScheduleResponse,
  StaffOption,
  StaffScheduleEntry,
} from "@/types/staffAdminHome.types";
import { mapRoleIdToRole, roleHome } from "@/types/role.types";
import {
  getCurrentDateKey,
  getCurrentMonthKey,
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

function buildAllScopeHolidayEntries(
  entries: StaffScheduleEntry[],
  targetStaffIds: number[],
) {
  const targetStaffIdSet = new Set(targetStaffIds);
  const groupedEntries = new Map<
    string,
    {
      id: number;
      note: string | null;
      staffIds: Set<number>;
    }
  >();

  for (const entry of entries) {
    if (entry.status !== "holiday" || !targetStaffIdSet.has(entry.staffId)) {
      continue;
    }

    const existing = groupedEntries.get(entry.workDate);

    if (existing) {
      existing.staffIds.add(entry.staffId);
      if (!existing.note && entry.note) {
        existing.note = entry.note;
      }
      continue;
    }

    groupedEntries.set(entry.workDate, {
      id: entry.id,
      note: entry.note,
      staffIds: new Set([entry.staffId]),
    });
  }

  return Array.from(groupedEntries.entries())
    .filter(([, value]) => value.staffIds.size === targetStaffIds.length)
    .map(
      ([workDate, value]): StaffScheduleEntry => ({
        id: value.id,
        staffId: 0,
        workDate,
        status: "holiday",
        note: value.note,
      }),
    )
    .sort((left, right) => left.workDate.localeCompare(right.workDate));
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState<ClinicHolidayFormState>({
    scope: "all",
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
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({
        month,
        date: selectedDate,
      });

      try {
        const response = await fetch(
          `${API_URL}/staff-home/clinic-schedule?${query.toString()}`,
          {
            credentials: "include",
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
          setLoading(false);
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
    if (form.scope !== "individual") {
      return;
    }

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
  }, [form.scope, form.staffId, holidayStaffOptions]);

  const targetStaffIds = useMemo(() => {
    if (form.scope === "all") {
      return holidayStaffOptions.map((staff) => staff.id);
    }

    const staffId = Number(form.staffId);
    return Number.isInteger(staffId) && staffId > 0 ? [staffId] : [];
  }, [form.scope, form.staffId, holidayStaffOptions]);

  const scheduleEntries = useMemo(() => {
    const entries = data?.scheduleEntries ?? [];

    if (!targetStaffIds.length) {
      return [];
    }

    if (form.scope === "all") {
      return buildAllScopeHolidayEntries(entries, targetStaffIds);
    }

    const targetStaffId = targetStaffIds[0];

    return entries
      .filter(
        (entry) =>
          entry.status === "holiday" && entry.staffId === targetStaffId,
      )
      .sort((left, right) => left.workDate.localeCompare(right.workDate));
  }, [data?.scheduleEntries, form.scope, targetStaffIds]);

  const selectedSchedule = useMemo(
    () =>
      scheduleEntries.find((entry) => entry.workDate === selectedDate) ?? null,
    [scheduleEntries, selectedDate],
  );

  const selectedStaff = useMemo<StaffOption | null>(() => {
    if (form.scope !== "individual") {
      return null;
    }

    return (
      holidayStaffOptions.find((staff) => String(staff.id) === form.staffId) ??
      null
    );
  }, [form.scope, form.staffId, holidayStaffOptions]);

  const weekdayOptions = useMemo(() => {
    const monthDateKeys = getMonthDateKeys(month);

    return WEEKDAY_LABELS.map((label, value) => {
      const matchingDates = monthDateKeys.filter(
        (dateKey) =>
          dateKey >= todayDateKey && getWeekdayFromDateKey(dateKey) === value,
      );
      const anchorDate =
        matchingDates.find((dateKey) => dateKey >= todayDateKey) ?? null;

      return {
        value,
        label,
        anchorDate,
        count: matchingDates.length,
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
      const nextNote = selectedSchedule?.note ?? "";

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

  const handleSelectDate = (dateKey: string) => {
    if (!dateKey || dateKey < todayDateKey) {
      return;
    }

    setSelectedDate(dateKey);
    setMonth(dateKey.slice(0, 7));
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

  const handleScopeChange = (scope: ClinicHolidayScope) => {
    setForm((current) => ({
      ...current,
      scope,
      staffId:
        scope === "individual"
          ? current.staffId || String(holidayStaffOptions[0]?.id ?? "")
          : "",
    }));
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
    if (form.scope === "individual") {
      const staffId = Number(form.staffId);

      if (!Number.isInteger(staffId) || staffId <= 0) {
        throw new Error("กรุณาเลือกบุคลากร");
      }

      return {
        month,
        weekday: getWeekdayFromDateKey(selectedDate),
        scope: form.scope,
        staffId,
      };
    }

    return {
      month,
      weekday: getWeekdayFromDateKey(selectedDate),
      scope: form.scope,
      staffId: null,
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

    try {
      const payload = buildClinicHolidayPayload();
      const response = await fetch(`${API_URL}/staff-home/clinic-holiday`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
      setFormError("ยังไม่มีวันหยุดตามเงื่อนไขนี้ในวันที่เลือก");
      return;
    }

    setDeleting(true);

    try {
      const payload = buildClinicHolidayPayload();
      const response = await fetch(`${API_URL}/staff-home/clinic-holiday`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
    handleScopeChange,
    handleSelectDate,
    handleSelectWeekday,
    handleStaffChange,
    handleSubmit,
    hasAccess,
    holidayStaffOptions,
    loading,
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
