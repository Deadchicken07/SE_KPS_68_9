"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { mapRoleIdToRole, roleHome } from "@/types/role.types";
import type {
  AdminStaffFormValues,
  AdminStaffRecord,
  AdminStaffStatus,
} from "@/types/adminStaffManagement.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const normalizeErrorMessage = (message: unknown): string => {
  if (Array.isArray(message)) {
    return message
      .map((item) => normalizeErrorMessage(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof message === "string") {
    return message;
  }

  if (message && typeof message === "object") {
    const nestedMessage = (message as { message?: unknown }).message;
    if (nestedMessage !== undefined) {
      return normalizeErrorMessage(nestedMessage);
    }
  }

  return "";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = normalizeErrorMessage(error.response?.data?.message);
    return message || fallback;
  }

  return fallback;
};

export const useAdminStaffManagement = () => {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [staffs, setStaffs] = useState<AdminStaffRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminStaffStatus>(
    "all",
  );
  const [editingStaff, setEditingStaff] = useState<AdminStaffRecord | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

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

    void fetchStaffs();
  }, [hasAccess, statusFilter]);

  const fetchStaffs = async (
    search = staffSearch,
    status: "all" | AdminStaffStatus = statusFilter,
  ) => {
    setIsFetching(true);

    try {
      const response = await axios.get<AdminStaffRecord[]>(
        `${API_URL}/admin-staff-management`,
        {
          params: {
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(status !== "all" ? { status } : {}),
          },
          withCredentials: true,
        },
      );

      setStaffs(response.data);
      return { ok: true as const };
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, "โหลดข้อมูลบุคลากรไม่สำเร็จ"),
      };
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  const createStaff = async (values: AdminStaffFormValues) => {
    setSavingStaff(true);

    try {
      await axios.post(`${API_URL}/admin-staff-management`, values, {
        withCredentials: true,
      });
      await fetchStaffs();
      closeStaffModal();
      return { ok: true as const, message: "เพิ่มบุคลากรแล้ว" };
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, "บันทึกข้อมูลบุคลากรไม่สำเร็จ"),
      };
    } finally {
      setSavingStaff(false);
    }
  };

  const updateStaff = async (staffId: number, values: AdminStaffFormValues) => {
    setSavingStaff(true);

    try {
      await axios.patch(
        `${API_URL}/admin-staff-management/${staffId}`,
        {
          ...values,
          password: values.password?.trim() ? values.password : undefined,
        },
        {
          withCredentials: true,
        },
      );
      await fetchStaffs();
      closeStaffModal();
      return { ok: true as const, message: "อัปเดตข้อมูลบุคลากรแล้ว" };
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, "อัปเดตข้อมูลบุคลากรไม่สำเร็จ"),
      };
    } finally {
      setSavingStaff(false);
    }
  };

  const deactivateStaff = async (staffId: number) => {
    setSavingStaff(true);

    try {
      await axios.delete(`${API_URL}/admin-staff-management/${staffId}`, {
        withCredentials: true,
      });
      await fetchStaffs();
      return { ok: true as const, message: "ปิดใช้งานบุคลากรแล้ว" };
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, "ปิดใช้งานบุคลากรไม่สำเร็จ"),
      };
    } finally {
      setSavingStaff(false);
    }
  };

  const setStaffStatus = async (staffId: number, status: AdminStaffStatus) => {
    setSavingStaff(true);

    try {
      await axios.patch(
        `${API_URL}/admin-staff-management/${staffId}`,
        { status },
        { withCredentials: true },
      );
      await fetchStaffs();
      return {
        ok: true as const,
        message:
          status === "ACTIVE"
            ? "เปิดใช้งานบุคลากรแล้ว"
            : "ปิดใช้งานบุคลากรแล้ว",
      };
    } catch (error) {
      return {
        ok: false as const,
        message: getErrorMessage(error, "อัปเดตสถานะบุคลากรไม่สำเร็จ"),
      };
    } finally {
      setSavingStaff(false);
    }
  };

  const openCreateStaffModal = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = (staff: AdminStaffRecord) => {
    setEditingStaff(staff);
    setIsStaffModalOpen(true);
  };

  const closeStaffModal = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(false);
  };

  const staffSummary = useMemo(
    () => ({
      total: staffs.length,
      active: staffs.filter((item) => item.status === "ACTIVE").length,
      inactive: staffs.filter((item) => item.status === "INACTIVE").length,
    }),
    [staffs],
  );

  return {
    hasAccess,
    staffs,
    isLoading,
    isFetching,
    savingStaff,
    staffSearch,
    setStaffSearch,
    statusFilter,
    setStatusFilter,
    editingStaff,
    isStaffModalOpen,
    staffSummary,
    fetchStaffs,
    createStaff,
    updateStaff,
    deactivateStaff,
    setStaffStatus,
    openCreateStaffModal,
    openEditStaffModal,
    closeStaffModal,
  };
};
