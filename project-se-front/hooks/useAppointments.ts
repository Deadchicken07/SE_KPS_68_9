import axios, { AxiosError } from "axios";

const API = "http://localhost:4000";

export type AppointmentTab = "upcoming" | "past";
export type AppointmentStatus = "pending" | "confirmed" | "completed";

export type AppointmentItem = {
  id: number;
  appointmentDate: string | null;
  timeSelect: string | null;
  appointmentType: "online" | "onsite" | null;
  paymentStatus: "Paid" | "Not_paying" | null;
  displayStatus: AppointmentStatus;
  staff: {
    userId: number;
    name: string;
    surName: string;
    email: string | null;
    fileName: string | null;
  } | null;
};

type AppointmentListResponse = {
  data: AppointmentItem[];
};

type AppointmentDetailResponse = {
  message: string;
  data: AppointmentItem;
};

type ErrorResponse = {
  message?: string | string[];
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("ยังไม่พบ access token กรุณาเข้าสู่ระบบก่อน");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchMyAppointments = async (
  tab: AppointmentTab
): Promise<AppointmentItem[]> => {
  const response = await axios.get<AppointmentListResponse>(`${API}/appointments/my`, {
    params: { tab },
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

export const rescheduleMyAppointment = async (
  appointmentId: number,
  payload: { appointmentDate: string; timeSelect?: string }
): Promise<AppointmentItem> => {
  const response = await axios.patch<AppointmentDetailResponse>(
    `${API}/appointments/${appointmentId}/reschedule`,
    payload,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
};

export const cancelMyAppointment = async (appointmentId: number): Promise<void> => {
  await axios.delete(`${API}/appointments/${appointmentId}`, {
    headers: getAuthHeaders(),
  });
};

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const message = axiosError.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    return message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
};
