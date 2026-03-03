"use client"

import { useEffect, useState } from "react"

const mockAppointments = [
  {
    id: 1,
    appointment_date: "2026-03-02",
    time_select: "20:45 - 22:00",
    appointment_type: "online",
    status: "Paid",
    meet_link: "https://meet.google.com/abc-defg-hij",
    users_appointments_staff_idTousers: {
      name: "สมชาย",
      sur_name: "ใจดี",
      degree: "นักจิตวิทยาคลินิก",
      info: "เชี่ยวชาญด้านความเครียดและภาวะซึมเศร้า",
      file_name: "https://i.pravatar.cc/150?img=12"
    }
  },
  {
    id: 2,
    appointment_date: "2026-03-15",
    time_select: "14:00 - 15:00",
    appointment_type: "online",
    status: "Not_paying",
    meet_link: "",
    users_appointments_staff_idTousers: {
      name: "วิภา",
      sur_name: "รุ่งเรือง",
      degree: "นักจิตบำบัด",
      info: "ดูแลด้านความวิตกกังวล",
      file_name: "https://i.pravatar.cc/150?img=20"
    }
  }
]

export default function OnlineAppointmentsPage() {

  const today = new Date()

  const filteredAppointments = mockAppointments.filter((a) => {
    const appointmentDate = new Date(a.appointment_date)
    return (
      a.appointment_type === "online" &&
      appointmentDate >= new Date(today.toDateString())
    )
  })

  return (
    <div className="min-h-screen bg-gray-100 py-16">

      <div className="max-w-4xl mx-auto px-6 space-y-10">

        <h1 className="text-3xl font-bold text-gray-800">
          การนัดหมายออนไลน์ของฉัน
        </h1>

        {filteredAppointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}

      </div>
    </div>
  )
}

function AppointmentCard({ appointment }: any) {

  const [countdown, setCountdown] = useState("")
  const [state, setState] = useState<"waiting" | "join" | "ended">("waiting")

  useEffect(() => {

    const interval = setInterval(() => {

      const [start, end] = appointment.time_select.split(" - ")

      const startDate = new Date(`${appointment.appointment_date}T${start}:00`)
      const endDate = new Date(`${appointment.appointment_date}T${end}:00`)
      const now = new Date()

      const diffStart = startDate.getTime() - now.getTime()
      const diffEnd = endDate.getTime() - now.getTime()

      const thirtyMinutes = 30 * 60 * 1000

      // หมดเวลาแล้ว
      if (diffEnd <= 0) {
        setState("ended")
      }
      // เข้าได้ (ก่อน 30 นาที หรืออยู่ในช่วงเวลา)
      else if (
        appointment.status === "Paid" &&
        (diffStart <= thirtyMinutes || now >= startDate)
      ) {
        setState("join")
      }
      else {
        setState("waiting")
      }

      if (diffStart > 0) {
        const hours = Math.floor(diffStart / (1000 * 60 * 60))
        const minutes = Math.floor((diffStart / (1000 * 60)) % 60)
        const seconds = Math.floor((diffStart / 1000) % 60)

        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        )
      } else {
        setCountdown("กำลังดำเนินการ")
      }

    }, 1000)

    return () => clearInterval(interval)

  }, [appointment])

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">

      {/* Doctor */}
      <div className="flex items-center gap-6">
        <img
          src={appointment.users_appointments_staff_idTousers.file_name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {appointment.users_appointments_staff_idTousers.name}{" "}
            {appointment.users_appointments_staff_idTousers.sur_name}
          </h2>
          <p className="text-gray-500 text-sm">
            {appointment.users_appointments_staff_idTousers.degree}
          </p>
          <p className="text-gray-400 text-sm">
            {appointment.users_appointments_staff_idTousers.info}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
        <div>
          <p className="text-gray-500">วันที่</p>
          <p className="font-semibold">{appointment.appointment_date}</p>
        </div>
        <div>
          <p className="text-gray-500">เวลา</p>
          <p className="font-semibold">{appointment.time_select}</p>
        </div>
        <div>
          <p className="text-gray-500">Countdown</p>
          <p className="font-mono font-bold text-blue-600">{countdown}</p>
        </div>
      </div>

      {/* Action */}
      {appointment.status === "Not_paying" ? (
        <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition">
          ชำระเงินก่อนเข้าร่วม
        </button>
      ) : state === "join" ? (
        <a
          href={appointment.meet_link}
          target="_blank"
          className="block text-center bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          เข้าร่วม Google Meet
        </a>
      ) : state === "ended" ? (
        <div className="text-center text-red-500 font-medium">
          การนัดหมายสิ้นสุดแล้ว
        </div>
      ) : (
        <div className="text-center text-gray-500">
          จะสามารถเข้าร่วมได้ก่อนเวลา 30 นาที
        </div>
      )}

    </div>
  )
}