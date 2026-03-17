"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ModalApi = {
  confirm: (config: {
    title: string;
    content: string;
    okText: string;
    cancelText: string;
    centered?: boolean;
    onOk?: () => void;
    okButtonProps?: {
      type?: "primary" | "default" | "dashed" | "link" | "text";
      className?: string;
      style?: React.CSSProperties;
    };
  }) => void;
};

export async function navigateToAppointmentsWithLoginGuard(
  router: AppRouterInstance,
  modalApi: ModalApi,
) {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    if (response.ok) {
      router.push("/user/appointments");
      return;
    }
  } catch {
    // fall through to login modal
  }

  modalApi.confirm({
    title: "กรุณาเข้าสู่ระบบก่อน",
    content: "คุณต้องเข้าสู่ระบบก่อนจึงจะเข้าใช้งานหน้าการนัดหมายได้",
    okText: "เข้าสู่ระบบ",
    cancelText: "ยกเลิก",
    centered: true,
    okButtonProps: {
      type: "primary",
      className: "btn-primary",
      style: {
        width: "auto",
        minWidth: 0,
        height: 32,
        border: "none",
        paddingInline: 15,
      },
    },
    onOk: () => {
      router.push("/login?redirect=/user/appointments");
    },
  });
}
