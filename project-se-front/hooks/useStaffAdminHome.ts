"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type {
  AppointmentItem,
  ClinicScheduleResponse,
  StaffScheduleFormState,
} from "@/types/staffAdminHome.types";
import {
  buildTimeMarkers,
  clampToTodayOrLater,
  createStaffScheduleFormState,
  getCurrentDateKey,
  getCurrentMonthKey,
  getDefaultSelectedDate,
  getMonthWeekOptions,
  getTimelineBounds,
  getTimelineEvents,
  parseStaffAdminHomeErrorMessage,
} from "@/utils/staffAdminHome";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const useStaffAdminHome = () => {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [month, setMonth] = useState(getCurrentMonthKey);
  const [selectedDate, setSelectedDate] = useState(getDefaultSelectedDate);
  const [staffFilter, setStaffFilter] = useState("");
  const [data, setData] = useState<ClinicScheduleResponse | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSelectedAppointmentsCollapsed, setIsSelectedAppointmentsCollapsed] =
    useState(false);
  const [isStaffWorkModalOpen, setIsStaffWorkModalOpen] = useState(false);
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] =
    useState(false);
  const [appointmentDetail, setAppointmentDetail] =
    useState<AppointmentItem | null>(null);
  const [staffScheduleForm, setStaffScheduleForm] =
    useState<StaffScheduleFormState>(() =>
      createStaffScheduleFormState(getDefaultSelectedDate()),
    );
  const [staffScheduleError, setStaffScheduleError] = useState<string | null>(
    null,
  );
  const [staffScheduleSubmitting, setStaffScheduleSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const roleId = me?.role_id ?? null;

    if (!roleId) {
      router.replace("/login");
      return;
    }

    if (roleId === 5) {
      router.replace("/staff/pharmacist/pharmacist_home");
      return;
    }

    if (roleId !== 1) {
      router.replace("/user");
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
      setAuthRequired(false);

      const query = new URLSearchParams({
        month,
        date: selectedDate,
      });

      if (staffFilter) {
        query.set("staffId", staffFilter);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await fetch(
          `${API_BASE_URL}/staff-home/clinic-schedule?${query.toString()}`,
          {
            credentials: "include",
            headers: { ...authHeaders },
          },
        );

        const payload = await response.json().catch(() => { return null; });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("__AUTH__");
          }
          throw new Error(parseStaffAdminHomeErrorMessage(payload));
        }

        if (!ignore) {
          const dashboard = payload as ClinicScheduleResponse;
          setData(dashboard);
          setSelectedDate(dashboard.selectedDate ?? selectedDate);
        }
      } catch (caught) {
        if (ignore) {
          return;
        }

        if (caught instanceof Error && caught.message === "__AUTH__") {
          setAuthRequired(true);
          setError("กรุณาเข้าสู่ระบบด้วยบัญชีบุคลากรเพื่อดูตารางงาน");
          setData(null);
        } else if (caught instanceof Error) {
          setError(
            caught.message ||
              "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่",
          );
          setData(null);
        } else {
          setError(
            "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่",
          );
          setData(null);
        }
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
  }, [hasAccess, month, selectedDate, staffFilter, reloadKey]);

  const weekStats = data?.weekStats ?? [];
  const weekAppointments = data?.weekAppointments ?? [];
  const selectedDateAppointments = data?.selectedDateAppointments ?? [];
  const staffOptions = data?.staffOptions ?? [];
  const staffOverview = data?.staffOverview ?? [];
  const upcomingAppointments = data?.upcomingAppointments ?? [];

  const staffScheduleOptions = useMemo(() => {
    const entries = new Map<
      number,
      { id: number; name: string; roleLabel: string }
    >();

    staffOptions.forEach((staff) => {
      entries.set(staff.id, {
        id: staff.id,
        name: staff.name,
        roleLabel: staff.roleLabel,
      });
    });

    staffOverview.forEach((staff) => {
      if (!entries.has(staff.staffId)) {
        entries.set(staff.staffId, {
          id: staff.staffId,
          name: staff.staffName,
          roleLabel: staff.roleLabel,
        });
      }
    });

    return Array.from(entries.values()).sort((left, right) =>
      left.name.localeCompare(right.name, "th"),
    );
  }, [staffOptions, staffOverview]);

  useEffect(() => {
    if (!selectedDateAppointments.length) {
      setSelectedAppointmentId(null);
      return;
    }

    setSelectedAppointmentId((current) => {
      if (
        current &&
        selectedDateAppointments.some((item) => item.id === current)
      ) {
        return current;
      }

      return selectedDateAppointments[0].id;
    });
  }, [selectedDateAppointments]);

  const timelineBounds = useMemo(
    () => getTimelineBounds(weekAppointments),
    [weekAppointments],
  );
  const timeMarkers = useMemo(
    () => buildTimeMarkers(timelineBounds),
    [timelineBounds],
  );
  const weekRows = useMemo(() => {
    return weekStats.map((day) => ({
      ...day,
      ...getTimelineEvents(
        weekAppointments.filter((item) => item.appointmentDate === day.date),
        timelineBounds,
      ),
    }));
  }, [timelineBounds, weekAppointments, weekStats]);
  const monthWeekOptions = useMemo(() => getMonthWeekOptions(month), [month]);
  const selectedStaff =
    staffOptions.find((item) => String(item.id) === staffFilter) ?? null;
  const selectedAppointment =
    selectedDateAppointments.find(
      (item) => item.id === selectedAppointmentId,
    ) ?? null;
  const activeWeekStart =
    data?.weekRange?.start ??
    monthWeekOptions.find(
      (option) => selectedDate >= option.start && selectedDate <= option.end,
    )?.start ??
    null;
  const todayDateKey = getCurrentDateKey();

  useEffect(() => {
    if (!isStaffWorkModalOpen && !isAppointmentDetailModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsStaffWorkModalOpen(false);
        setIsAppointmentDetailModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAppointmentDetailModalOpen, isStaffWorkModalOpen]);

  useEffect(() => {
    if (!isAppointmentDetailModalOpen || !appointmentDetail) {
      return;
    }

    const nextAppointment =
      selectedDateAppointments.find(
        (item) => item.id === appointmentDetail.id,
      ) ?? null;

    if (nextAppointment) {
      setAppointmentDetail(nextAppointment);
    }
  }, [
    appointmentDetail,
    isAppointmentDetailModalOpen,
    selectedDateAppointments,
  ]);

  const handleDateChange = (dateKey: string) => {
    setSelectedDate(dateKey);
    setMonth(dateKey.slice(0, 7));
  };

  const handleMonthChange = (nextMonth: string) => {
    if (!nextMonth) {
      return;
    }

    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  };

  const openStaffWorkModal = () => {
    setStaffScheduleError(null);
    setStaffScheduleForm(
      createStaffScheduleFormState(
        clampToTodayOrLater(selectedDate),
        staffFilter,
      ),
    );
    setIsStaffWorkModalOpen(true);
  };

  const closeStaffWorkModal = () => {
    setIsStaffWorkModalOpen(false);
    setStaffScheduleError(null);
  };

  const openAppointmentDetailModal = (
    appointment: AppointmentItem,
    dateKey?: string,
  ) => {
    if (dateKey) {
      handleDateChange(dateKey);
    }

    setSelectedAppointmentId(appointment.id);
    setAppointmentDetail(appointment);
    setIsAppointmentDetailModalOpen(true);
  };

  const closeAppointmentDetailModal = () => {
    setIsAppointmentDetailModalOpen(false);
  };

  const handleStaffScheduleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setStaffScheduleError(null);

    if (!staffScheduleForm.staffId) {
      setStaffScheduleError("กรุณาเลือกบุคลากร");
      return;
    }

    if (!staffScheduleForm.workDate) {
      setStaffScheduleError("กรุณาเลือกวันที่");
      return;
    }

    if (staffScheduleForm.workDate < todayDateKey) {
      setStaffScheduleError("ไม่สามารถบันทึกตารางงานย้อนหลังได้");
      return;
    }

    setStaffScheduleSubmitting(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await fetch(`${API_BASE_URL}/staff-home/schedule`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          staffId: Number(staffScheduleForm.staffId),
          workDate: staffScheduleForm.workDate,
          status: staffScheduleForm.status,
          note: staffScheduleForm.note.trim() || null,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseStaffAdminHomeErrorMessage(payload));
      }

      setMonth(staffScheduleForm.workDate.slice(0, 7));
      setSelectedDate(staffScheduleForm.workDate);
      setReloadKey((current) => current + 1);
      closeStaffWorkModal();
    } catch (caught) {
      setStaffScheduleError(
        caught instanceof Error
          ? caught.message
          : "บันทึกตารางเข้างาน/ลาไม่สำเร็จ",
      );
    } finally {
      setStaffScheduleSubmitting(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  const toggleSelectedAppointmentsCollapsed = () => {
    setIsSelectedAppointmentsCollapsed((current) => !current);
  };

  const selectAppointment = (appointmentId: number, dateKey?: string) => {
    if (dateKey) {
      handleDateChange(dateKey);
    }
    setSelectedAppointmentId(appointmentId);
  };

  return {
    activeWeekStart,
    appointmentDetail,
    authRequired,
    closeAppointmentDetailModal,
    data,
    error,
    goToLogin,
    handleDateChange,
    handleMonthChange,
    handleStaffScheduleSubmit,
    hasAccess,
    isAppointmentDetailModalOpen,
    isSelectedAppointmentsCollapsed,
    isStaffWorkModalOpen,
    isFetching,
    isLoading,
    month,
    monthWeekOptions,
    openAppointmentDetailModal,
    openStaffWorkModal,
    closeStaffWorkModal,
    selectedAppointment,
    selectedDate,
    selectedDateAppointments,
    selectedStaff,
    selectAppointment,
    setStaffFilter,
    setStaffScheduleForm,
    staffFilter,
    staffOptions,
    staffOverview,
    staffScheduleError,
    staffScheduleForm,
    staffScheduleOptions,
    staffScheduleSubmitting,
    summary: data?.summary ?? null,
    timeMarkers,
    timelineBounds,
    todayDateKey,
    toggleSelectedAppointmentsCollapsed,
    upcomingAppointments,
    weekRows,
  };
};
