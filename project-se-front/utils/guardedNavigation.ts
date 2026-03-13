"use client";

import { Modal } from "antd";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function navigateToAppointmentsWithLoginGuard(router: AppRouterInstance) {
  const accessToken = window.localStorage.getItem("access_token");

  if (accessToken) {
    router.push("/user/appointments");
    return;
  }

  Modal.confirm({
    title: "กรุณาเข้าสู่ระบบก่อน",
    content: "คุณต้องเข้าสู่ระบบก่อนจึงจะเข้าใช้งานหน้านัดหมายได้",
    okText: "เข้าสู่ระบบ",
    cancelText: "ยกเลิก",
    centered: true,
    onOk: () => {
      router.push("/login?redirect=/user/appointments");
    },
  });
}
