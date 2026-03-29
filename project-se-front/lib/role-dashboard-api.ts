type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

type PsychiatristAppointment = {
  time: string;
  patient: string;
  id: string;
  type: string;
  status: string;
  summary: string;
};

type PsychiatristConsultation = {
  id: string;
  userId: string;
  status: string;
  note: string;
};

type ScheduleItem = {
  date: string;
  status: string;
  note: string;
};

type AssessmentItem = {
  patient: string;
  questionnaire: string;
  submittedAt: string;
  summary: string;
};

type MedicationReviewItem = {
  name: string;
  quantity: number;
};

type SessionItem = {
  time: string;
  user: string;
  id: string;
  type: string;
  status: string;
  summary: string;
};

type InsightItem = {
  title: string;
  responseId: string;
  userId: string;
  submittedAt: string;
  insight: string;
};

type ActiveConsultationItem = {
  id: string;
  userId: string;
  status: string;
  note: string;
};

type RecentResponseItem = {
  patient: string;
  questionnaire: string;
  submittedAt: string;
  summary: string;
};

export type PsychiatristDashboardData = {
  summaryCards: SummaryCard[];
  appointments: PsychiatristAppointment[];
  consultations: PsychiatristConsultation[];
  workSchedule: ScheduleItem[];
  recentAssessments: AssessmentItem[];
  medicationReview: MedicationReviewItem[];
};

export type PsychologistDashboardData = {
  summaryCards: SummaryCard[];
  sessions: SessionItem[];
  insights: InsightItem[];
  activeConsultations: ActiveConsultationItem[];
  therapistSchedule: ScheduleItem[];
  recentResponses: RecentResponseItem[];
};

const backendBaseUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:4000';

const psychiatristFallback: PsychiatristDashboardData = {
  summaryCards: [
    {
      label: 'นัดหมายวันนี้',
      value: '8',
      detail: 'appointments ของจิตแพทย์ในวันนี้',
    },
    {
      label: 'คิวตรวจพร้อมเริ่ม',
      value: '6',
      detail: 'สรุปจาก schedule และสถานะนัดหมาย',
    },
    {
      label: 'เคสรอปิด consultation',
      value: '4',
      detail: 'เคสที่มี note แล้วแต่ยังไม่สรุปแผนรักษา',
    },
    {
      label: 'รายการยาที่ต้อง review',
      value: '11',
      detail: 'จาก prescription_items และ medications',
    },
  ],
  appointments: [
    {
      time: '09:00',
      patient: 'ธนา ศรีสุข',
      id: 'APT-240318-01',
      type: 'ติดตามอาการ',
      status: 'confirmed',
      summary: 'ติดตามอาการและประเมินการตอบสนองต่อยา',
    },
    {
      time: '10:30',
      patient: 'พิมพันก ฉันทร์ดี',
      id: 'APT-240318-02',
      type: 'เคสใหม่',
      status: 'waiting',
      summary: 'เคสใหม่จากการส่งต่อ ต้องเปิด consultation ใหม่',
    },
    {
      time: '14:00',
      patient: 'กิตติคุณ วัฒนะ',
      id: 'APT-240318-03',
      type: 'ทบทวนผลข้างเคียงยา',
      status: 'confirmed',
      summary: 'ติดตาม adverse effect หลังปรับยาเมื่อสัปดาห์ก่อน',
    },
  ],
  consultations: [
    {
      id: 'CON-8841',
      userId: 'USR-104',
      status: 'in_progress',
      note: 'มีประวัติหยุดยาเอง 2 ครั้ง ต้องยืนยันแผนติดตามและประเมินความเสี่ยงซ้ำ',
    },
    {
      id: 'CON-8847',
      userId: 'USR-233',
      status: 'pending_review',
      note: 'ต้องสรุป note และยืนยันขนาดยาก่อนออก prescription',
    },
    {
      id: 'CON-8850',
      userId: 'USR-311',
      status: 'awaiting_plan',
      note: 'มีผลประเมินการนอนผิดปกติ ควรกำหนดแนวทางรักษาต่อในการพบครั้งนี้',
    },
  ],
  workSchedule: [
    {
      date: '19 มี.ค. 2026',
      status: 'working',
      note: 'ตรวจคนไข้ onsite ช่วงเช้า และ teleconsult ช่วงบ่าย',
    },
    {
      date: '20 มี.ค. 2026',
      status: 'working',
      note: 'มีประชุมทีมสหวิชาชีพเวลา 13:00 น.',
    },
    {
      date: '21 มี.ค. 2026',
      status: 'leave',
      note: 'วันลา ไม่เปิดรับนัดใหม่',
    },
  ],
  recentAssessments: [
    {
      patient: 'ธนา ศรีสุข',
      questionnaire: 'แบบประเมินภาวะซึมเศร้า',
      submittedAt: '2026-03-18',
      summary: 'คะแนนลดลงเล็กน้อย แต่ยังมีปัญหาเรื่องการนอนและสมาธิ',
    },
    {
      patient: 'พิมพันก ฉันทร์ดี',
      questionnaire: 'แบบประเมินความวิตกกังวล',
      submittedAt: '2026-03-18',
      summary: 'มีความกังวลสูงก่อนนอน ควรถามต่อเรื่อง trigger รายวัน',
    },
    {
      patient: 'กิตติคุณ วัฒนะ',
      questionnaire: 'แบบติดตามผลข้างเคียงยา',
      submittedAt: '2026-03-17',
      summary: 'รายงานอาการง่วงและปากแห้งเพิ่มขึ้นหลังปรับยา',
    },
  ],
  medicationReview: [
    {
      name: 'Sertraline 50 mg',
      quantity: 30,
    },
    {
      name: 'Quetiapine 25 mg',
      quantity: 14,
    },
    {
      name: 'Clonazepam 0.5 mg',
      quantity: 10,
    },
  ],
};

const psychologistFallback: PsychologistDashboardData = {
  summaryCards: [
    {
      label: 'session วันนี้',
      value: '7',
      detail: 'appointments ที่ต้องเปิดต่อเป็น session',
    },
    {
      label: 'questionnaires ใหม่',
      value: '5',
      detail: 'แบบประเมินที่เพิ่งส่งเข้าระบบ',
    },
    {
      label: 'response รออ่าน',
      value: '18',
      detail: 'คำตอบที่ควรอ่านก่อนเข้าพบ',
    },
    {
      label: 'consultations active',
      value: '6',
      detail: 'เคสที่ยังอยู่ในแผนติดตามต่อเนื่อง',
    },
  ],
  sessions: [
    {
      time: '09:30',
      user: 'มณีรัตน์ พรชัย',
      id: 'APT-240318-11',
      type: 'individual session',
      status: 'confirmed',
      summary: 'session รายบุคคล ต้องเปิด response ล่าสุดก่อนเริ่ม',
    },
    {
      time: '11:00',
      user: 'กานต์ธีร์ วงศ์ดี',
      id: 'APT-240318-12',
      type: 'stress follow-up',
      status: 'arrived',
      summary: 'นัดติดตามความเครียดจากงาน มี questionnaires ครบแล้ว',
    },
    {
      time: '15:00',
      user: 'อรทัย แก้วคำ',
      id: 'APT-240318-13',
      type: 'treatment review',
      status: 'confirmed',
      summary: 'ทบทวนเป้าหมายบำบัดและอัปเดต consultation note',
    },
  ],
  insights: [
    {
      title: 'แบบประเมินภาวะซึมเศร้าเบื้องต้น',
      responseId: 'RES-1209',
      userId: 'USR-410',
      submittedAt: '2026-03-18',
      insight:
        'คะแนนเรื่องการนอนและสมาธิสูงขึ้นจากรอบก่อน ควรถามต่อเชิงลึกในช่วงเปิด session',
    },
    {
      title: 'แบบประเมินความวิตกกังวล',
      responseId: 'RES-1212',
      userId: 'USR-412',
      submittedAt: '2026-03-18',
      insight:
        'มีแนวโน้มหลีกเลี่ยงสถานการณ์สังคมมากขึ้น เหมาะกับการสำรวจ trigger เพิ่ม',
    },
    {
      title: 'แบบคัดกรองความเครียดรายสัปดาห์',
      responseId: 'RES-1215',
      userId: 'USR-415',
      submittedAt: '2026-03-17',
      insight:
        'มีข้อมูลครบต่อเนื่อง เหมาะกับการเทียบผลย้อนหลังและวางแผนบำบัดต่อ',
    },
  ],
  activeConsultations: [
    {
      id: 'CON-9102',
      userId: 'USR-410',
      status: 'active',
      note: 'อยู่ในแผน CBT สัปดาห์ที่ 3 ต้องติดตามการบ้านและรูปแบบการนอน',
    },
    {
      id: 'CON-9110',
      userId: 'USR-412',
      status: 'follow_up',
      note: 'ติดตามการจัดการความวิตกกังวลในที่ทำงาน และประเมิน stress trigger เพิ่ม',
    },
    {
      id: 'CON-9118',
      userId: 'USR-415',
      status: 'needs_update',
      note: 'ควรอัปเดต consultation note หลัง session ล่าสุดเพื่อยืนยันเป้าหมายระยะถัดไป',
    },
  ],
  therapistSchedule: [
    {
      date: '19 มี.ค. 2026',
      status: 'working',
      note: 'session รายบุคคล 4 เคส และ couples session 1 เคส',
    },
    {
      date: '20 มี.ค. 2026',
      status: 'working',
      note: 'เช้าเป็น intake session บ่ายติดตามกลุ่มเล็ก',
    },
    {
      date: '21 มี.ค. 2026',
      status: 'working',
      note: 'มีเวลาสรุป response และอัปเดต consultation note',
    },
  ],
  recentResponses: [
    {
      patient: 'มณีรัตน์ พรชัย',
      questionnaire: 'แบบประเมินภาวะซึมเศร้า',
      submittedAt: '2026-03-18',
      summary: 'รายงานการนอนแย่ลงและมีสมาธิลดลงต่อเนื่องจากสัปดาห์ก่อน',
    },
    {
      patient: 'กานต์ธีร์ วงศ์ดี',
      questionnaire: 'แบบประเมินความเครียดจากงาน',
      submittedAt: '2026-03-18',
      summary: 'คะแนนความเครียดคงที่แต่ยังมีอาการตื่นเต้นก่อนประชุมงาน',
    },
    {
      patient: 'อรทัย แก้วคำ',
      questionnaire: 'แบบติดตามเป้าหมายการบำบัด',
      submittedAt: '2026-03-17',
      summary: 'มีความร่วมมือดีขึ้นและตอบการบ้านครบมากกว่ารอบก่อน',
    },
  ],
};

export async function getPsychiatristDashboard() {
  return requestDashboard<PsychiatristDashboardData>(
    '/psychiatrist-dashboard',
    psychiatristFallback,
  );
}

export async function getPsychologistDashboard() {
  return requestDashboard<PsychologistDashboardData>(
    '/psychologist-dashboard',
    psychologistFallback,
  );
}

async function requestDashboard<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${backendBaseUrl}${path}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`Falling back to mock data for ${path}`, error);
    return fallback;
  }
}
