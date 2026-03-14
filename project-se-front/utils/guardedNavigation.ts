"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

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

export function navigateToAppointmentsWithLoginGuard(
  router: AppRouterInstance,
  modalApi: ModalApi,
) {
  const accessToken = window.localStorage.getItem("access_token");

  if (accessToken) {
    router.push("/user/appointments");
    return;
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
