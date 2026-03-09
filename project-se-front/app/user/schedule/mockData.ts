type AppointmentStatus = "pending" | "confirmed" | "completed";

type AppointmentItem = {
  id: number;
  consultantName: string;
  appointmentDate: string | null;
  timeSelect: string | null;
  contact: string;
  status: AppointmentStatus;
  avatarLabel: string;
  avatarUrl: string | null;
  appointmentType: "online" | "onsite" | null;
  paymentStatus: string | null;
  meetLink: string | null;
};

type AppointmentScheduleResponse = {
  upcoming: AppointmentItem[];
  past: AppointmentItem[];
};

function toLocalDateKey(value: Date): string {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

function toDateKeyWithOffset(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return toLocalDateKey(date);
}

export function createMockSchedule(): AppointmentScheduleResponse {
  return {
    upcoming: [
      {
        id: 1001,
        consultantName: "Dr. Narin Chaiwat",
        appointmentDate: toDateKeyWithOffset(1),
        timeSelect: "10:00 - 11:00",
        contact: "Line: @mindcare / 02-123-4567",
        status: "pending",
        avatarLabel: "NC",
        avatarUrl: "/docterProfile/docter1.png",
        appointmentType: "online",
        paymentStatus: "Unpaid",
        meetLink: "https://meet.google.com/abc-defg-hij",
      },
      {
        id: 1002,
        consultantName: "Dr. Pimchanok S.",
        appointmentDate: toDateKeyWithOffset(2),
        timeSelect: "14:00 - 15:00",
        contact: "โทร 081-234-5678",
        status: "confirmed",
        avatarLabel: "PS",
        avatarUrl: "/docterProfile/docter2.png",
        appointmentType: "online",
        paymentStatus: "Paid",
        meetLink: "https://meet.google.com/new",
      },
      {
        id: 1003,
        consultantName: "Dr. Thanapon K.",
        appointmentDate: toDateKeyWithOffset(3),
        timeSelect: "16:00 - 17:00",
        contact: "เคาน์เตอร์คลินิกชั้น 3",
        status: "confirmed",
        avatarLabel: "TK",
        avatarUrl: "/docterProfile/docter3.png",
        appointmentType: "onsite",
        paymentStatus: "Paid",
        meetLink: null,
      },
    ],
    past: [
      {
        id: 9001,
        consultantName: "Dr. Ananya R.",
        appointmentDate: toDateKeyWithOffset(-4),
        timeSelect: "09:00 - 10:00",
        contact: "Line: @mindcare",
        status: "completed",
        avatarLabel: "AR",
        avatarUrl: "/docterProfile/docter2.png",
        appointmentType: "online",
        paymentStatus: "Paid",
        meetLink: "https://meet.google.com/old-link",
      },
      {
        id: 9002,
        consultantName: "Dr. Krit M.",
        appointmentDate: toDateKeyWithOffset(-8),
        timeSelect: "13:00 - 14:00",
        contact: "โทร 02-123-4567",
        status: "completed",
        avatarLabel: "KM",
        avatarUrl: "/docterProfile/docter1.png",
        appointmentType: "onsite",
        paymentStatus: "Paid",
        meetLink: null,
      },
    ],
  };
}
