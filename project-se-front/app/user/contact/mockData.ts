export const mockTherapist = {
  user_id: 2,
  name: "สมชาย",
  sur_name: "ใจดี",
  degree: "นักจิตวิทยาคลินิก",
  license: "ใบอนุญาตเลขที่ 12345",
  info: "เชี่ยวชาญด้านความเครียดและภาวะซึมเศร้า",
  file_name: "/therapist.jpg"
}


export const mockBookingData = {
  appointment_date: "2026-03-12",
  time_select: "10:00 - 11:00",
  appointment_type: "online" as "online" | "onsite",
  meet_links: [
    {
      id: 1,
      title: "Google Meet หลัก",
      url: "https://meet.google.com/abc-defg-hij"
    }
  ]
}