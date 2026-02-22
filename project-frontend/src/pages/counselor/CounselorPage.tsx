import "./counselor-ui.css";

type Counselor = {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  focusAreas: [string, string];
};

type CounselorCardProps = {
  counselor: Counselor;
  delay: number;
};

function CounselorCard({ counselor, delay }: CounselorCardProps) {
  const initial = counselor.name.replace("ดร.", "").trim().slice(0, 1);

  return (
    <article className="counselor-card" style={{ animationDelay: `${delay}s` }}>
      <div className="counselor-card__head">
        <span aria-hidden="true" className="counselor-card__avatar">
          {initial}
        </span>
        <div>
          <h3 className="counselor-card__name">{counselor.name}</h3>
          <p className="counselor-card__specialty">{counselor.specialty}</p>
        </div>
      </div>

      <p className="counselor-card__meta">ประสบการณ์ {counselor.experience} ปี</p>

      <div className="counselor-card__tags">
        {counselor.focusAreas.map((tag) => (
          <span key={tag} className="counselor-card__tag">
            {tag}
          </span>
        ))}
      </div>

      <button className="counselor-card__action" type="button">
        ดูโปรไฟล์
      </button>
    </article>
  );
}

export default function CounselorPage() {
  return (
    <section className="counselor-page">
      <header className="counselor-page__header">
        <p className="counselor-page__eyebrow">manga Care Team</p>
        <h2 className="counselor-page__title">ผู้ให้คำปรึกษา</h2>
        <p className="counselor-page__subtitle">
          เลือกผู้เชี่ยวชาญที่ตรงกับสิ่งที่คุณกำลังกังวล แล้วเริ่มพูดคุยอย่างสบายใจ
        </p>
      </header>

    

      <div className="counselor-grid">
        {counselors.map((counselor, index) => (
          <CounselorCard key={counselor.id} counselor={counselor} delay={index * 0.06} />
        ))}
      </div>

      <div className="counselor-page__cta">
        <button className="counselor-page__cta-button" type="button">
          นัดขอคำปรึกษา
        </button>
        <p className="counselor-page__cta-note">
          ปรึกษาได้ทั้ง Video Call และนัดพบที่คลินิก เลือกเวลาได้ตามสะดวก
        </p>
      </div>
    </section>
  );
}

//content data for service cards, can be fetched from API in real app, hardcoded here for demo purpose
const counselors: Counselor[] = [
  {
    id: "c1",
    name: "ดร. อรอนงค์",
    specialty: "จิตแพทย์เด็ก",
    experience: 9,
    focusAreas: ["พฤติกรรมเด็ก", "สมาธิสั้น"],
  },
  {
    id: "c2",
    name: "ดร. ณิชานันท์",
    specialty: "นักจิตวิทยาคลินิก",
    experience: 7,
    focusAreas: ["ภาวะกังวล", "แพนิค"],
  },
  {
    id: "c3",
    name: "ดร. กรรณิการ์",
    specialty: "ผู้เชี่ยวชาญครอบครัว",
    experience: 12,
    focusAreas: ["คู่รัก", "ครอบครัว"],
  },
  {
    id: "c4",
    name: "ดร. ธนพล",
    specialty: "จิตบำบัด CBT",
    experience: 8,
    focusAreas: ["ความเครียด", "หมดไฟ"],
  },
  {
    id: "c5",
    name: "ดร. ศิรินภา",
    specialty: "ให้คำปรึกษาวัยรุ่น",
    experience: 6,
    focusAreas: ["วัยเรียน", "ความมั่นใจ"],
  },
  {
    id: "c6",
    name: "ดร. วีรวัฒน์",
    specialty: "โค้ชชิ่งความเครียด",
    experience: 10,
    focusAreas: ["การนอน", "จัดการอารมณ์"],
  },
];
