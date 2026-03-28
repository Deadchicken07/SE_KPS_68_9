export type DashboardSummary = {
  totalAppointments: number;
  uniquePatients: number;
  activeStaffCount: number;
  registeredStaffCount: number;
  paidAppointments: number;
  pendingPayments: number;
  onlineAppointments: number;
  onsiteAppointments: number;
  daysWithAppointments: number;
};

export type StaffOption = {
  id: number;
  name: string;
  role: string | null;
  roleLabel: string;
  specialty: string | null;
  avatarUrl: string | null;
};

export type DailyStat = {
  date: string;
  totalAppointments: number;
  paidAppointments: number;
  pendingPayments: number;
  onlineAppointments: number;
  onsiteAppointments: number;
  uniquePatients: number;
  staffCount: number;
};

export type AppointmentItem = {
  id: number;
  patientId: number | null;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  staffId: number | null;
  staffName: string;
  staffRole: string | null;
  staffRoleLabel: string;
  staffSpecialty: string | null;
  staffAvatarUrl: string | null;
  appointmentDate: string | null;
  timeSelect: string | null;
  startTime: string | null;
  endTime: string | null;
  appointmentType: string | null;
  appointmentTypeLabel: string;
  paymentStatus: string | null;
  paymentStatusLabel: string;
  displayStatus: "pending" | "confirmed" | "completed";
  displayStatusLabel: string;
};

export type StaffOverviewItem = {
  staffId: number;
  staffName: string;
  role: string | null;
  roleLabel: string;
  specialty: string | null;
  avatarUrl: string | null;
  totalAppointments: number;
  paidAppointments: number;
  pendingAppointments: number;
  onlineAppointments: number;
  onsiteAppointments: number;
  nextAppointmentDate: string | null;
  nextAppointmentTime: string | null;
  scheduleStatus: string;
};

export type ClinicScheduleResponse = {
  month: string;
  selectedDate: string;
  weekRange: {
    start: string;
    end: string;
  };
  summary: DashboardSummary;
  staffOptions: StaffOption[];
  weekStats: DailyStat[];
  weekAppointments: AppointmentItem[];
  selectedDateAppointments: AppointmentItem[];
  upcomingAppointments: AppointmentItem[];
  staffOverview: StaffOverviewItem[];
};

export type StaffScheduleFormState = {
  staffId: string;
  workDate: string;
  status: "working" | "leave";
  note: string;
};

export type ParsedTimeRange = {
  startMinutes: number;
  endMinutes: number;
  label: string;
};

export type TimelineBounds = {
  start: number;
  end: number;
  span: number;
};

export type DayTone = {
  fill: string;
  ink: string;
};

export type EventTone = {
  fill: string;
  border: string;
};

export type TimelineEvent = {
  appointment: AppointmentItem;
  left: number;
  width: number;
  top: number;
  range: ParsedTimeRange;
  tone: EventTone;
};

export type TimelineWeekRow = DailyStat & {
  events: TimelineEvent[];
  laneHeight: number;
};

export type MonthWeekOption = {
  index: number;
  start: string;
  end: string;
  anchorDate: string;
  rangeLabel: string;
};

export type StaffScheduleOption = {
  id: number;
  name: string;
  roleLabel: string;
};

export type KpiCard = {
  label: string;
  value: number;
  note: string;
};
