"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { mapRoleIdToRole, roleHome } from "@/types/role.types";
import type {
  AdminReportDisplayTrendPoint,
  AdminReportPeriodMode,
  AdminReportResponse,
} from "@/types/adminReport.types";
import {
  getCurrentDateKey,
  getCurrentMonthKey,
  parseStaffAdminHomeErrorMessage,
} from "@/utils/staffAdminHome";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const CURRENT_MONTH_KEY = getCurrentMonthKey();
const CURRENT_YEAR_KEY = getCurrentDateKey().slice(0, 4);

function getMonthLastDateKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0);

  return `${monthKey}-${String(lastDay.getDate()).padStart(2, "0")}`;
}

function getYearRange(yearKey: string) {
  return {
    from: `${yearKey}-01-01`,
    to: `${yearKey}-12-31`,
  };
}

function getReportRange(
  mode: AdminReportPeriodMode,
  monthKey: string,
  yearKey: string,
) {
  if (mode === "year") {
    return getYearRange(yearKey);
  }

  return {
    from: `${monthKey}-01`,
    to: getMonthLastDateKey(monthKey),
  };
}

function formatPeriodRangeLabel(
  mode: AdminReportPeriodMode,
  fromDate: string,
  _toDate: string,
) {
  if (mode === "month") {
    return new Date(`${fromDate}T00:00:00`).toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric",
    });
  }

  return new Date(`${fromDate}T00:00:00`).toLocaleDateString("th-TH", {
    year: "numeric",
  });
}

function buildDisplayTrend(
  points: NonNullable<AdminReportResponse["trend"]>,
  mode: AdminReportPeriodMode,
): AdminReportDisplayTrendPoint[] {
  if (mode === "year") {
    const monthMap = new Map<string, AdminReportDisplayTrendPoint>();

    points.forEach((point) => {
      const monthKey = point.dateKey.slice(0, 7);
      const current =
        monthMap.get(monthKey) ??
        {
          key: monthKey,
          label: new Date(`${monthKey}-01T00:00:00`).toLocaleDateString(
            "th-TH",
            { month: "short" },
          ),
          appointmentCount: 0,
          consultationCount: 0,
          revenue: 0,
        };

      current.appointmentCount += point.appointmentCount;
      current.consultationCount += point.consultationCount;
      current.revenue += point.revenue;
      monthMap.set(monthKey, current);
    });

    return Array.from(monthMap.values());
  }

  return points.map((point) => ({
    key: point.dateKey,
    label: String(new Date(`${point.dateKey}T00:00:00`).getDate()),
    appointmentCount: point.appointmentCount,
    consultationCount: point.consultationCount,
    revenue: point.revenue,
  }));
}

export function useAdminReport() {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [reportMode, setReportMode] = useState<AdminReportPeriodMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH_KEY);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR_KEY);
  const [staffFilter, setStaffFilter] = useState("");
  const [data, setData] = useState<AdminReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const { from: fromDate, to: toDate } = useMemo(
    () => getReportRange(reportMode, selectedMonth, selectedYear),
    [reportMode, selectedMonth, selectedYear],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const role = mapRoleIdToRole(me?.role_id ?? null);

    if (!role) {
      router.replace("/login");
      return;
    }

    if (role !== "admin") {
      router.replace(roleHome[role]);
      return;
    }

    setHasAccess(true);
  }, [authLoading, me?.role_id, router]);

  useEffect(() => {
    if (!hasAccess) {
      return;
    }

    let ignore = false;

    async function loadReport() {
      setLoading(true);
      setError(null);
      setAuthRequired(false);

      const query = new URLSearchParams({
        from: fromDate,
        to: toDate,
      });

      if (staffFilter) {
        query.set("staffId", staffFilter);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/staff-home/admin-report?${query.toString()}`,
          {
            credentials: "include",
          },
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("__AUTH__");
          }

          throw new Error(parseStaffAdminHomeErrorMessage(payload));
        }

        if (!ignore) {
          setData(payload as AdminReportResponse);
        }
      } catch (caught) {
        if (ignore) {
          return;
        }

        if (caught instanceof Error && caught.message === "__AUTH__") {
          setAuthRequired(true);
          setError("กรุณาเข้าสู่ระบบด้วยบัญชีแอดมินเพื่อดูรายงาน");
          setData(null);
        } else if (caught instanceof Error) {
          setError(caught.message || "โหลดรายงานไม่สำเร็จ");
          setData(null);
        } else {
          setError("โหลดรายงานไม่สำเร็จ");
          setData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      ignore = true;
    };
  }, [fromDate, hasAccess, staffFilter, toDate]);

  const selectedStaff = useMemo(
    () => data?.staffOptions.find((staff) => String(staff.id) === staffFilter) ?? null,
    [data?.staffOptions, staffFilter],
  );
  const periodLabel = useMemo(
    () => formatPeriodRangeLabel(reportMode, fromDate, toDate),
    [fromDate, reportMode, toDate],
  );
  const displayTrend = useMemo(
    () => buildDisplayTrend(data?.trend ?? [], reportMode),
    [data?.trend, reportMode],
  );

  const handleReportModeChange = (nextMode: AdminReportPeriodMode) => {
    setReportMode(nextMode);
  };

  const handleSelectedMonthChange = (nextMonth: string) => {
    if (!nextMonth) {
      return;
    }

    setSelectedMonth(nextMonth);
    setSelectedYear(nextMonth.slice(0, 4));
  };

  const handleSelectedYearChange = (nextYear: string) => {
    if (!nextYear || !/^\d{4}$/.test(nextYear)) {
      return;
    }

    setSelectedYear(nextYear);
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return {
    authRequired,
    data,
    displayTrend,
    error,
    fromDate,
    goToLogin,
    handleReportModeChange,
    handleSelectedMonthChange,
    handleSelectedYearChange,
    hasAccess,
    loading,
    periodLabel,
    reportMode,
    selectedStaff,
    selectedMonth,
    selectedYear,
    setStaffFilter,
    staffFilter,
    toDate,
  };
}

export type UseAdminReportResult = ReturnType<typeof useAdminReport>;
