export type AdminReportPeriodMode = "month" | "year";

export type AdminReportSummary = {
  uniquePatients: number;
  totalAppointments: number;
  totalConsultations: number;
  paidAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  totalReceipts: number;
};

export type AdminReportStaffOption = {
  id: number;
  name: string;
  roleLabel: string;
};

export type AdminReportTrendPoint = {
  dateKey: string;
  appointmentCount: number;
  consultationCount: number;
  revenue: number;
};

export type AdminReportDisplayTrendPoint = {
  key: string;
  label: string;
  appointmentCount: number;
  consultationCount: number;
  revenue: number;
};

export type AdminReportBreakdownItem = {
  label: string;
  count: number;
};

export type AdminReportStaffMetric = {
  staffId: number;
  staffName: string;
  roleLabel: string;
  appointmentCount: number;
  consultationCount: number;
  revenue: number;
};

export type AdminReportAppointmentRow = {
  id: number;
  patientId: number | null;
  patientName: string;
  staffId: number | null;
  staffName: string;
  staffRoleLabel: string;
  appointmentDate: string | null;
  timeSelect: string | null;
  appointmentTypeLabel: string;
  paymentStatusLabel: string;
};

export type AdminReportConsultationRow = {
  id: number;
  patientId: number | null;
  patientName: string;
  staffId: number | null;
  staffName: string;
  pharmacistName: string | null;
  createdAt: string | null;
  createdDateKey: string | null;
  notePreview: string | null;
};

export type AdminReportReceiptRow = {
  id: number;
  receiptNo: string;
  patientName: string;
  staffId: number | null;
  staffName: string;
  createdAt: string | null;
  createdDateKey: string | null;
  total: number;
  statusLabel: string;
  tracking: string | null;
};

export type AdminReportResponse = {
  filters: {
    from: string;
    to: string;
    staffId: number | null;
  };
  summary: AdminReportSummary;
  staffOptions: AdminReportStaffOption[];
  trend: AdminReportTrendPoint[];
  appointmentTypeBreakdown: AdminReportBreakdownItem[];
  paymentBreakdown: AdminReportBreakdownItem[];
  topStaff: AdminReportStaffMetric[];
  recentAppointments: AdminReportAppointmentRow[];
  recentConsultations: AdminReportConsultationRow[];
  recentReceipts: AdminReportReceiptRow[];
};
