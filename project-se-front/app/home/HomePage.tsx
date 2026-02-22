import Link from "next/link";

type QuickAction = {
  title: string;
  caption: string;
  icon: string;
};

type CardItem = {
  title: string;
  description: string;
};

type Assessment = {
  title: string;
  minutes: string;
};

type Stat = {
  value: string;
  label: string;
};

type ExpertPreview = {
  name: string;
  role: string;
};

const quickActions: QuickAction[] = [
  { icon: "01", title: "นัดปรึกษาออนไลน์", caption: "Video Call กับผู้เชี่ยวชาญทันที" },
  { icon: "02", title: "เริ่มประเมินสุขภาพใจ", caption: "ประเมินเบื้องต้นในไม่กี่นาที" },
  { icon: "03", title: "ดูบทความแนะนำ", caption: "แนวทางดูแลใจที่อ่านง่ายและใช้ได้จริง" },
];

const onlineServices: CardItem[] = [
  { title: "ปรึกษาออนไลน์รายบุคคล", description: "พูดคุยส่วนตัวผ่านวิดีโอคอลแบบเข้ารหัสข้อมูล" },
  { title: "แชตติดตามอาการ", description: "ส่งข้อความติดตามอาการและรับคำแนะนำเพิ่มเติม" },
  { title: "นัดพบที่คลินิก", description: "จองเวลาเข้าคลินิกในช่วงที่คุณสะดวก" },
];

const careDimensions: CardItem[] = [
  { title: "มิติอารมณ์", description: "เข้าใจอารมณ์และจัดการความเครียดในชีวิตประจำวัน" },
  { title: "มิติความคิด", description: "ปรับกรอบคิดที่กดดันตัวเองเกินไป" },
  { title: "มิติความสัมพันธ์", description: "สื่อสารกับคนใกล้ตัวได้ดีขึ้น ลดความขัดแย้ง" },
  { title: "มิติการงานและการเรียน", description: "รับมือภาวะหมดไฟและความกดดันระยะยาว" },
  { title: "มิติการพักผ่อน", description: "จัดการการนอนและพลังใจให้สมดุลขึ้น" },
];

const assessments: Assessment[] = [
  { title: "แบบประเมินความเครียด", minutes: "5 นาที" },
  { title: "แบบประเมินภาวะซึมเศร้า", minutes: "7 นาที" },
  { title: "แบบประเมินความวิตกกังวล", minutes: "6 นาที" },
  { title: "แบบประเมินภาวะหมดไฟ", minutes: "5 นาที" },
];

const reasons: CardItem[] = [
  { title: "ทีมผู้เชี่ยวชาญหลายสาขา", description: "คัดแมตช์นักบำบัดตามปัญหาหลักของแต่ละคน" },
  { title: "ระบบนัดหมายง่าย", description: "เลือกช่วงเวลา จ่ายเงิน และยืนยันคิวได้ในหน้าเดียว" },
  { title: "ดูแลต่อเนื่อง", description: "มีแผนติดตามผลและสรุปพัฒนาการให้ทุกเดือน" },
];

const stats: Stat[] = [
  { value: "15,000+", label: "ผู้เข้ารับบริการสะสม" },
  { value: "96%", label: "ความพึงพอใจโดยรวม" },
  { value: "24 ชม.", label: "ตอบกลับภายในวันเดียว" },
];

const experts: ExpertPreview[] = [
  { name: "ดร. อรอนงค์", role: "จิตแพทย์เด็กและวัยรุ่น" },
  { name: "ดร. ณิชานันท์", role: "นักจิตวิทยาคลินิก" },
  { name: "ดร. กรรณิการ์", role: "ที่ปรึกษาคู่รักและครอบครัว" },
];

const articles: CardItem[] = [
  { title: "สัญญาณเตือนใจเมื่อความเครียดเริ่มสะสม", description: "วิธีสังเกตตัวเองก่อนความเครียดกระทบงานและความสัมพันธ์" },
  { title: "คุยกับลูกอย่างไรในวันที่ลูกไม่อยากพูด", description: "เทคนิคสื่อสารกับวัยรุ่นโดยไม่กดดันและไม่ตัดสิน" },
  { title: "5 วิธีรีเซ็ตใจเมื่อเริ่มหมดไฟ", description: "แนวทางดูแลใจแบบทำได้จริงใน 1 สัปดาห์" },
];

export default function HomePage() {
  return (
    <section className="home-page">
      <header className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Jitdee Care Clinic</p>
          <h1 className="home-hero__title">ให้การดูแลสุขภาพใจเป็นเรื่องที่เข้าถึงง่าย</h1>
          <p className="home-hero__subtitle">
            โครงหน้าแรกนี้อ้างอิงแนวจัดวางจากเว็บไซต์ iSTRONG โดยปรับให้เข้ากับบริการของ Jitdee Care
            ทั้งบริการออนไลน์ แบบประเมิน และทีมผู้เชี่ยวชาญ
          </p>
          <div className="home-hero__actions">
            <Link className="home-button is-primary" href="/service">
              เริ่มจองบริการ
            </Link>
            <Link className="home-button is-ghost" href="/counselor">
              ดูทีมผู้ให้คำปรึกษา
            </Link>
          </div>
        </div>

        <div className="home-hero__quick-grid">
          {quickActions.map((item) => (
            <article key={item.title} className="home-quick-card">
              <span className="home-quick-card__icon">{item.icon}</span>
              <h2 className="home-quick-card__title">{item.title}</h2>
              <p className="home-quick-card__caption">{item.caption}</p>
            </article>
          ))}
        </div>
      </header>

      <section className="home-section">
        <div className="home-section__heading">
          <h2 className="home-section__title">บริการให้คำปรึกษาออนไลน์</h2>
          <p className="home-section__subtitle">เลือกรูปแบบบริการที่เหมาะกับคุณ</p>
        </div>
        <div className="home-grid home-grid--three">
          {onlineServices.map((item) => (
            <article key={item.title} className="home-card home-card--service">
              <h3 className="home-card__title">{item.title}</h3>
              <p className="home-card__description">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <h2 className="home-section__title">แนวทางดูแลสุขภาพใจ 5 มิติ</h2>
          <p className="home-section__subtitle">ครอบคลุมทั้งอารมณ์ ความคิด และการใช้ชีวิต</p>
        </div>
        <div className="home-grid home-grid--five">
          {careDimensions.map((item) => (
            <article key={item.title} className="home-card home-card--dimension">
              <h3 className="home-card__title">{item.title}</h3>
              <p className="home-card__description">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--assessment">
        <div className="home-section__heading">
          <h2 className="home-section__title">แบบประเมินออนไลน์</h2>
          <p className="home-section__subtitle">เริ่มจากการประเมินเบื้องต้นก่อนพบผู้เชี่ยวชาญ</p>
        </div>
        <div className="home-grid home-grid--four">
          {assessments.map((item) => (
            <article key={item.title} className="home-card home-card--assessment">
              <h3 className="home-card__title">{item.title}</h3>
              <p className="home-card__meta">ใช้เวลา {item.minutes}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <h2 className="home-section__title">ทำไมต้องเลือก Jitdee Care</h2>
        </div>
        <div className="home-grid home-grid--three">
          {reasons.map((item) => (
            <article key={item.title} className="home-card home-card--reason">
              <h3 className="home-card__title">{item.title}</h3>
              <p className="home-card__description">{item.description}</p>
            </article>
          ))}
        </div>
        <div className="home-stat-grid">
          {stats.map((item) => (
            <article key={item.label} className="home-stat-card">
              <p className="home-stat-card__value">{item.value}</p>
              <p className="home-stat-card__label">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--split">
        <div>
          <div className="home-section__heading">
            <h2 className="home-section__title">ทีมผู้เชี่ยวชาญ</h2>
            <p className="home-section__subtitle">ตัวอย่างผู้ให้คำปรึกษาในระบบ</p>
          </div>
          <div className="home-grid home-grid--three">
            {experts.map((expert) => (
              <article key={expert.name} className="home-card home-card--expert">
                <h3 className="home-card__title">{expert.name}</h3>
                <p className="home-card__description">{expert.role}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="home-section__heading">
            <h2 className="home-section__title">บทความแนะนำ</h2>
            <p className="home-section__subtitle">เนื้อหาอ่านง่ายเพื่อดูแลใจทุกวัน</p>
          </div>
          <div className="home-grid home-grid--three">
            {articles.map((article) => (
              <article key={article.title} className="home-card home-card--article">
                <h3 className="home-card__title">{article.title}</h3>
                <p className="home-card__description">{article.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta-strip">
        <p className="home-cta-strip__text">ต้องการเริ่มปรึกษา? นัดหมายผู้เชี่ยวชาญได้ทันที</p>
        <div className="home-cta-strip__actions">
          <Link className="home-button is-primary" href="/service">
            ไปหน้าบริการ
          </Link>
          <Link className="home-button is-ghost" href="/counselor">
            ดูผู้ให้คำปรึกษา
          </Link>
        </div>
      </section>
    </section>
  );
}
