const summaryCards = [
  {
    label: "นัดหมายวันนี้",
    value: "8",
    detail: "appointments ของจิตแพทย์ในวันนี้",
  },
  {
    label: "คิวตรวจพร้อมเริ่ม",
    value: "6",
    detail: "สรุปจาก schedule และสถานะนัดหมาย",
  },
  {
    label: "เคสรอปิด consultation",
    value: "4",
    detail: "เคสที่มี note แล้วแต่ยังไม่สรุปแผนรักษา",
  },
  {
    label: "รายการยาที่ต้อง review",
    value: "11",
    detail: "จาก prescription_items และ medications",
  },
];

const appointments = [
  {
    time: "09:00",
    patient: "ธนา ศรีสุข",
    id: "APT-240318-01",
    type: "ติดตามอาการ",
    status: "confirmed",
    summary: "ติดตามอาการและประเมินการตอบสนองต่อยา",
  },
  {
    time: "10:30",
    patient: "พิมพ์ชนก จันทร์ดี",
    id: "APT-240318-02",
    type: "เคสใหม่",
    status: "waiting",
    summary: "เคสใหม่จากการส่งต่อ ต้องเปิด consultation ใหม่",
  },
  {
    time: "14:00",
    patient: "กิตติคุณ วัฒนะ",
    id: "APT-240318-03",
    type: "ทบทวนผลข้างเคียงยา",
    status: "confirmed",
    summary: "ติดตาม adverse effect หลังปรับยาเมื่อสัปดาห์ก่อน",
  },
];

const consultations = [
  {
    id: "CON-8841",
    userId: "USR-104",
    status: "in_progress",
    note: "มีประวัติหยุดยาเอง 2 ครั้ง ต้องยืนยันแผนติดตามและประเมินความเสี่ยงซ้ำ",
  },
  {
    id: "CON-8847",
    userId: "USR-233",
    status: "pending_review",
    note: "ต้องสรุป note และยืนยันขนาดยาก่อนออก prescription",
  },
  {
    id: "CON-8850",
    userId: "USR-311",
    status: "awaiting_plan",
    note: "มีผลประเมินการนอนผิดปกติ ควรกำหนดแนวทางรักษาต่อในการพบครั้งนี้",
  },
];

const workSchedule = [
  {
    date: "19 มี.ค. 2026",
    status: "working",
    note: "ตรวจคนไข้ onsite ช่วงเช้า และ teleconsult ช่วงบ่าย",
  },
  {
    date: "20 มี.ค. 2026",
    status: "working",
    note: "มีประชุมทีมสหวิชาชีพเวลา 13:00 น.",
  },
  {
    date: "21 มี.ค. 2026",
    status: "leave",
    note: "วันลา ไม่เปิดรับนัดใหม่",
  },
];

const recentAssessments = [
  {
    patient: "ธนา ศรีสุข",
    questionnaire: "แบบประเมินภาวะซึมเศร้า",
    submittedAt: "2026-03-18",
    summary: "คะแนนลดลงเล็กน้อย แต่ยังมีปัญหาเรื่องการนอนและสมาธิ",
  },
  {
    patient: "พิมพ์ชนก จันทร์ดี",
    questionnaire: "แบบประเมินความวิตกกังวล",
    submittedAt: "2026-03-18",
    summary: "มีความกังวลสูงก่อนนอน ควรถามต่อเรื่อง trigger รายวัน",
  },
  {
    patient: "กิตติคุณ วัฒนะ",
    questionnaire: "แบบติดตามผลข้างเคียงยา",
    submittedAt: "2026-03-17",
    summary: "รายงานอาการง่วงและปากแห้งเพิ่มขึ้นหลังปรับยา",
  },
];

const medicationReview = [
  {
    name: "Sertraline 50 mg",
    quantity: 30,
  },
  {
    name: "Quetiapine 25 mg",
    quantity: 14,
  },
  {
    name: "Clonazepam 0.5 mg",
    quantity: 10,
  },
];

export default function PsychiatristHomePage() {
  return (
    <div className="min-h-screen bg-[#f5f3ee] text-slate-900">
      <div className="mx-auto max-w-[1240px] px-6 py-8 lg:px-10">
        <section className="relative overflow-hidden rounded-[36px] bg-[#f8faf8] shadow-[0_30px_90px_rgba(44,62,54,0.08)] ring-1 ring-slate-200">
          <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_top,#a7d6c8,transparent_62%)] lg:block" />
          <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#dbeee4] blur-3xl" />

          <div className="relative grid min-h-[370px] gap-8 px-7 py-8 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#103f39] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white">
                  Psychiatrist
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-[12ch] text-3xl font-semibold leading-[0.98] tracking-[-0.03em] text-[#183630] lg:max-w-[14ch] lg:text-5xl xl:max-w-[15ch] xl:text-[4.15rem]">
                  <span className="block whitespace-nowrap">พื้นที่เริ่มงาน</span>
                  <span className="block whitespace-nowrap">สำหรับ จิตแพทย์</span>
                </h1>
              </div>
            </div>

            <aside className="grid min-h-[300px] gap-4 self-start rounded-[32px] bg-white/70 p-4 backdrop-blur ring-1 ring-slate-200">
              <div className="rounded-[26px] bg-[#eef6f1] p-5 ring-1 ring-[#d7e7de]">
                <p className="text-sm text-[#5a786f]">priority วันนี้</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[#d7e7de]">
                    <p className="font-medium text-slate-900">เคสรอ medication review</p>
                    <p className="mt-1 text-sm text-slate-500">11 รายการที่ต้องตรวจซ้ำ</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[#d7e7de]">
                    <p className="font-medium text-slate-900">consultation ค้างสรุป</p>
                    <p className="mt-1 text-sm text-slate-500">4 เคสที่ยังไม่ปิดแผนการรักษา</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(64,78,69,0.06)] ring-1 ring-slate-200"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-4 text-4xl font-semibold text-[#183630]">{card.value}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
          <article className="rounded-[34px] bg-white p-6 shadow-[0_20px_50px_rgba(64,78,69,0.06)] ring-1 ring-slate-200 lg:p-7">
            <p className="text-sm uppercase tracking-[0.22em] text-[#4f7b71]">
              Appointments
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              คิวผู้ป่วยที่ต้องเห็นก่อน
            </h2>

            <div className="mt-6 space-y-4">
              {appointments.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 rounded-[28px] bg-[#f7faf8] p-5 ring-1 ring-slate-200 md:grid-cols-[90px_minmax(0,1fr)_auto]"
                >
                  <div className="text-lg font-semibold text-[#16463f]">{item.time}</div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-slate-900">{item.patient}</p>
                    <p className="text-sm text-slate-500">
                      {item.id} • {item.type}
                    </p>
                    <p className="text-sm leading-7 text-slate-600">{item.summary}</p>
                  </div>
                  <div className="self-start rounded-full bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-[34px] bg-[#12252a] p-6 text-white shadow-[0_20px_55px_rgba(18,37,42,0.18)] lg:p-7">
              <p className="text-sm uppercase tracking-[0.22em] text-white/55">
                Consultations
              </p>
              <h2 className="mt-2 text-3xl font-semibold">เคสที่ยังต้องตัดสินใจ</h2>
              <div className="mt-6 space-y-4">
                {consultations.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] bg-white/6 p-5 ring-1 ring-white/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold">{item.id}</p>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/80">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/60">{item.userId}</p>
                    <p className="mt-3 text-sm leading-7 text-white/78">{item.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[34px] bg-[#fbf6ee] p-6 ring-1 ring-[#eee2cd] lg:p-7">
              <p className="text-sm uppercase tracking-[0.22em] text-[#9a7f4a]">
                Medication Review
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                รายการยาที่ควรตรวจซ้ำ
              </h2>
              <div className="mt-6 space-y-4">
                {medicationReview.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-[24px] bg-white px-5 py-5 ring-1 ring-[#eadfcf]"
                  >
                    <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-2 text-sm text-slate-600">จำนวน {item.quantity}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="rounded-[34px] bg-white p-6 shadow-[0_20px_50px_rgba(64,78,69,0.06)] ring-1 ring-slate-200 lg:p-7">
            <p className="text-sm uppercase tracking-[0.22em] text-[#4f7b71]">
              Schedule
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              ตารางทำงานของจิตแพทย์
            </h2>
            <div className="mt-6 space-y-4">
              {workSchedule.map((item) => (
                <div
                  key={item.date}
                  className="rounded-[24px] bg-[#f7faf8] p-5 ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-900">{item.date}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-700 ring-1 ring-slate-200">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[34px] bg-white p-6 shadow-[0_20px_50px_rgba(64,78,69,0.06)] ring-1 ring-slate-200 lg:p-7">
            <p className="text-sm uppercase tracking-[0.22em] text-[#4f7b71]">
              Assessments
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              ผลประเมินล่าสุดของผู้ป่วย
            </h2>
            <div className="mt-6 space-y-4">
              {recentAssessments.map((item) => (
                <div
                  key={`${item.patient}-${item.questionnaire}`}
                  className="rounded-[24px] bg-[#f7faf8] p-5 ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-900">{item.patient}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                      {item.submittedAt}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.questionnaire}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
