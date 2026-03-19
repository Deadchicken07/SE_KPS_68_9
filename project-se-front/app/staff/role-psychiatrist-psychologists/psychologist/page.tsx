const summaryCards = [
  {
    label: "session วันนี้",
    value: "7",
    detail: "appointments ที่ต้องเปิดต่อเป็น session",
  },
  {
    label: "questionnaires ใหม่",
    value: "5",
    detail: "แบบประเมินที่เพิ่งส่งเข้าระบบ",
  },
  {
    label: "response รออ่าน",
    value: "18",
    detail: "คำตอบที่ควรอ่านก่อนเข้าพบ",
  },
  {
    label: "consultations active",
    value: "6",
    detail: "เคสที่ยังอยู่ในแผนติดตามต่อเนื่อง",
  },
];

const sessions = [
  {
    time: "09:30",
    user: "มณีรัตน์ พรชัย",
    id: "APT-240318-11",
    type: "individual session",
    status: "confirmed",
    summary: "session รายบุคคล ต้องเปิด response ล่าสุดก่อนเริ่ม",
  },
  {
    time: "11:00",
    user: "กานต์ธีร์ วงศ์ดี",
    id: "APT-240318-12",
    type: "stress follow-up",
    status: "arrived",
    summary: "นัดติดตามความเครียดจากงาน มี questionnaires ครบแล้ว",
  },
  {
    time: "15:00",
    user: "อรทัย แก้วคำ",
    id: "APT-240318-13",
    type: "treatment review",
    status: "confirmed",
    summary: "ทบทวนเป้าหมายบำบัดและอัปเดต consultation note",
  },
];

const insights = [
  {
    title: "แบบประเมินภาวะซึมเศร้าเบื้องต้น",
    responseId: "RES-1209",
    userId: "USR-410",
    submittedAt: "2026-03-18",
    insight: "คะแนนเรื่องการนอนและสมาธิสูงขึ้นจากรอบก่อน ควรถามต่อเชิงลึกในช่วงเปิด session",
  },
  {
    title: "แบบประเมินความวิตกกังวล",
    responseId: "RES-1212",
    userId: "USR-412",
    submittedAt: "2026-03-18",
    insight: "มีแนวโน้มหลีกเลี่ยงสถานการณ์สังคมมากขึ้น เหมาะกับการสำรวจ trigger เพิ่ม",
  },
  {
    title: "แบบคัดกรองความเครียดรายสัปดาห์",
    responseId: "RES-1215",
    userId: "USR-415",
    submittedAt: "2026-03-17",
    insight: "มีข้อมูลครบต่อเนื่อง เหมาะกับการเทียบผลย้อนหลังและวางแผนบำบัดต่อ",
  },
];

const activeConsultations = [
  {
    id: "CON-9102",
    userId: "USR-410",
    status: "active",
    note: "อยู่ในแผน CBT สัปดาห์ที่ 3 ต้องติดตามการบ้านและรูปแบบการนอน",
  },
  {
    id: "CON-9110",
    userId: "USR-412",
    status: "follow_up",
    note: "ติดตามการจัดการความวิตกกังวลในที่ทำงาน และประเมิน stress trigger เพิ่ม",
  },
  {
    id: "CON-9118",
    userId: "USR-415",
    status: "needs_update",
    note: "ควรอัปเดต consultation note หลัง session ล่าสุดเพื่อยืนยันเป้าหมายระยะถัดไป",
  },
];

const therapistSchedule = [
  {
    date: "19 มี.ค. 2026",
    status: "working",
    note: "session รายบุคคล 4 เคส และ couples session 1 เคส",
  },
  {
    date: "20 มี.ค. 2026",
    status: "working",
    note: "เช้าเป็น intake session บ่ายติดตามกลุ่มเล็ก",
  },
  {
    date: "21 มี.ค. 2026",
    status: "working",
    note: "มีเวลาสรุป response และอัปเดต consultation note",
  },
];

const recentResponses = [
  {
    patient: "มณีรัตน์ พรชัย",
    questionnaire: "แบบประเมินภาวะซึมเศร้า",
    submittedAt: "2026-03-18",
    summary: "รายงานการนอนแย่ลงและมีสมาธิลดลงต่อเนื่องจากสัปดาห์ก่อน",
  },
  {
    patient: "กานต์ธีร์ วงศ์ดี",
    questionnaire: "แบบประเมินความเครียดจากงาน",
    submittedAt: "2026-03-18",
    summary: "คะแนนความเครียดคงที่แต่ยังมีอาการตื่นเต้นก่อนประชุมงาน",
  },
  {
    patient: "อรทัย แก้วคำ",
    questionnaire: "แบบติดตามเป้าหมายการบำบัด",
    submittedAt: "2026-03-17",
    summary: "มีความร่วมมือดีขึ้นและตอบการบ้านครบมากกว่ารอบก่อน",
  },
];

export default function PsychologistHomePage() {
  return (
    <div className="min-h-screen bg-[#f7f1ea] text-slate-900">
      <div className="mx-auto max-w-[1240px] px-6 py-8 lg:px-10">
        <section className="relative overflow-hidden rounded-[36px] bg-[#fffaf5] shadow-[0_30px_90px_rgba(88,63,43,0.08)] ring-1 ring-[#eadfd2]">
          <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_top,#f1cda8,transparent_62%)] lg:block" />
          <div className="absolute bottom-0 right-20 h-40 w-40 rounded-full bg-[#f7e4cc] blur-3xl" />

          <div className="relative grid min-h-[370px] gap-8 px-7 py-8 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#8b4c2d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white">
                  Psychologist
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-[12ch] text-3xl font-semibold leading-[0.98] tracking-[-0.03em] text-[#512d1c] lg:max-w-[14ch] lg:text-5xl xl:max-w-[15ch] xl:text-[4.15rem]">
                  <span className="block whitespace-nowrap">พื้นที่เริ่มงาน</span>
                  <span className="block whitespace-nowrap">สำหรับ นักจิตวิทยา</span>
                </h1>
              </div>
            </div>

            <aside className="grid min-h-[300px] gap-4 self-start rounded-[32px] bg-white/70 p-4 backdrop-blur ring-1 ring-[#eadfd2]">
              <div className="rounded-[26px] bg-[#fcfbf8] p-5 ring-1 ring-[#eee2d7]">
                <p className="text-sm text-slate-500">priority วันนี้</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[#eadfd2]">
                    <p className="font-medium text-slate-900">response ที่ยังไม่อ่าน</p>
                    <p className="mt-1 text-sm text-slate-500">18 ชุดคำตอบที่ต้อง review</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[#eadfd2]">
                    <p className="font-medium text-slate-900">เคส active ต่อเนื่อง</p>
                    <p className="mt-1 text-sm text-slate-500">6 consultation ที่ต้องอัปเดตแผน</p>
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
              className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(88,63,43,0.06)] ring-1 ring-[#eadfd2]"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-4 text-4xl font-semibold text-[#512d1c]">{card.value}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
          <article className="rounded-[34px] bg-white p-6 shadow-[0_20px_50px_rgba(88,63,43,0.06)] ring-1 ring-[#eadfd2] lg:p-7">
            <p className="text-sm uppercase tracking-[0.22em] text-[#9b6b42]">
              Questionnaires & Response
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              insight ที่ควรอ่านก่อนเข้า session
            </h2>

            <div className="mt-6 space-y-4">
              {insights.map((item) => (
                <div
                  key={item.responseId}
                  className="rounded-[28px] bg-[#fffaf6] p-5 ring-1 ring-[#eadfd2]"
                >
                  <p className="text-xl font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.responseId} • {item.userId} • {item.submittedAt}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.insight}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-[34px] bg-[#4e2d1f] p-6 text-white shadow-[0_20px_55px_rgba(78,45,31,0.18)] lg:p-7">
              <p className="text-sm uppercase tracking-[0.22em] text-white/55">
                Appointments
              </p>
              <h2 className="mt-2 text-3xl font-semibold">session ที่ต้องเริ่มวันนี้</h2>
              <div className="mt-6 space-y-4">
                {sessions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] bg-white/8 p-5 ring-1 ring-white/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-[#ffd8ae]">{item.time}</p>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/80">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xl font-semibold">{item.user}</p>
                    <p className="mt-1 text-sm text-white/60">
                      {item.id} • {item.type}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/78">{item.summary}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[34px] bg-[#f4ecdf] p-6 ring-1 ring-[#ead7be] lg:p-7">
              <p className="text-sm uppercase tracking-[0.22em] text-[#9b6b42]">
                Consultations
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                เคสที่กำลังติดตามต่อเนื่อง
              </h2>
              <div className="mt-6 space-y-4">
                {activeConsultations.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] bg-white px-5 py-5 ring-1 ring-[#eadfd2]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-slate-900">{item.id}</p>
                      <span className="rounded-full bg-[#fff4ea] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#8b4c2d]">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{item.userId}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.note}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="rounded-[34px] bg-white p-6 shadow-[0_20px_50px_rgba(88,63,43,0.06)] ring-1 ring-[#eadfd2] lg:p-7">
            <p className="text-sm uppercase tracking-[0.22em] text-[#9b6b42]">
              Schedule
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              ตารางทำงานของนักจิตวิทยา
            </h2>
            <div className="mt-6 space-y-4">
              {therapistSchedule.map((item) => (
                <div
                  key={item.date}
                  className="rounded-[24px] bg-[#fffaf6] p-5 ring-1 ring-[#eadfd2]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-900">{item.date}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-700 ring-1 ring-[#eadfd2]">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[34px] bg-white p-6 shadow-[0_20px_50px_rgba(88,63,43,0.06)] ring-1 ring-[#eadfd2] lg:p-7">
            <p className="text-sm uppercase tracking-[0.22em] text-[#9b6b42]">
              Recent Responses
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              ผลตอบแบบประเมินล่าสุด
            </h2>
            <div className="mt-6 space-y-4">
              {recentResponses.map((item) => (
                <div
                  key={`${item.patient}-${item.questionnaire}`}
                  className="rounded-[24px] bg-[#fffaf6] p-5 ring-1 ring-[#eadfd2]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-900">{item.patient}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-[#eadfd2]">
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
