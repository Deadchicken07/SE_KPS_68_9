export interface Appointment {
  id: number;
  staffId: number;
  patientId: number;
  patientName: string;
  appointmentDate: string;
  timeSelect: string | null;
  appointmentType: "online" | "onsite";
  paymentStatus: "Paid" | "Not_paying";
  depositSlipFile: string | null;
  meetUrl: string | null;
  hasConsultation: boolean;
}
