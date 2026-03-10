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
        consultantName: "รศ.นพ.สมชาย ใจดี",
        appointmentDate: toDateKeyWithOffset(1),
        timeSelect: "10:00 - 11:00",
        contact: "Line: @mindcare / 02-123-4567",
        status: "pending",
        avatarLabel: "สจ",
        avatarUrl: "/docterProfile/docter1.jpeg",
        appointmentType: "online",
        paymentStatus: "Unpaid",
        meetLink: "https://meet.google.com/abc-defg-hij",
      },
      {
        id: 1002,
        consultantName: "พญ.สมหยิง สนิมจัย",
        appointmentDate: toDateKeyWithOffset(2),
        timeSelect: "15:00 - 16:00",
        contact: "โทร 081-234-5678",
        status: "confirmed",
        avatarLabel: "สส",
        avatarUrl: "/docterProfile/docter2.png",
        appointmentType: "online",
        paymentStatus: "Paid",
        meetLink: "https://meet.google.com/new",
      },
      {
        id: 1003,
        consultantName: "นพ.ลอดช่อง กระด่องแมะ",
        appointmentDate: toDateKeyWithOffset(3),
        timeSelect: "14:00 - 15:00",
        contact: "เคาน์เตอร์คลินิกชั้น 3",
        status: "confirmed",
        avatarLabel: "ลก",
        avatarUrl: "/docterProfile/docter3.png",
        appointmentType: "onsite",
        paymentStatus: "Paid",
        meetLink: null,
      },
    ],
    past: [
      {
        id: 9001,
        consultantName: "ดร.สรรสร้าง ส่งสี",
        appointmentDate: toDateKeyWithOffset(-4),
        timeSelect: "09:00 - 10:00",
        contact: "Line: @mindcare",
        status: "completed",
        avatarLabel: "สส",
        avatarUrl: "/docterProfile/psy1",
        appointmentType: "online",
        paymentStatus: "Paid",
        meetLink: "https://meet.google.com/old-link",
      },
      {
        id: 9002,
        consultantName: "ดร.มั่นใจ คารมดี",
        appointmentDate: toDateKeyWithOffset(-8),
        timeSelect: "14:00 - 15:00",
        contact: "โทร 02-123-4567",
        status: "completed",
        avatarLabel: "มค",
        avatarUrl: "/docterProfile/psy2.jfif",
        appointmentType: "onsite",
        paymentStatus: "Paid",
        meetLink: null,
      },
    ],
  };
}
