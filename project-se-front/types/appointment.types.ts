interface UserAppointment {
  user_id: number;
  name: string;
  sur_name: string;
}

export interface Appointment {
  id: number;
  user_id: number;
  staff_id: number;
  appointment_type: "online" | "onsite";
  appointment_date: string;
  status: "Paid" | "Not_paying";
  time_select: string;
  deposit_slip_file: string | null;
  user: UserAppointment;
}
