
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
  const initial = counselor.name.replace("à¸”à¸£.", "").trim().slice(0, 1);

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

      <p className="counselor-card__meta">à¸›à¸£à¸°à¸ªà¸šà¸à¸²à¸£à¸“à¹Œ {counselor.experience} à¸›à¸µ</p>

      <div className="counselor-card__tags">
        {counselor.focusAreas.map((tag) => (
          <span key={tag} className="counselor-card__tag">
            {tag}
          </span>
        ))}
      </div>

      <button className="counselor-card__action" type="button">
        à¸”à¸¹à¹‚à¸›à¸£à¹„à¸Ÿà¸¥à¹Œ
      </button>
    </article>
  );
}

export default function CounselorPage() {
  return (
    <section className="counselor-page">
      <header className="counselor-page__header">
        <p className="counselor-page__eyebrow">jitdee Care Team</p>
        <h2 className="counselor-page__title">à¸œà¸¹à¹‰à¹ƒà¸«à¹‰à¸„à¸³à¸›à¸£à¸¶à¸à¸©à¸²</h2>
        <p className="counselor-page__subtitle">
          à¹€à¸¥à¸·à¸­à¸à¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸à¸—à¸µà¹ˆà¸•à¸£à¸‡à¸à¸±à¸šà¸ªà¸´à¹ˆà¸‡à¸—à¸µà¹ˆà¸„à¸¸à¸“à¸à¸³à¸¥à¸±à¸‡à¸à¸±à¸‡à¸§à¸¥ à¹à¸¥à¹‰à¸§à¹€à¸£à¸´à¹ˆà¸¡à¸žà¸¹à¸”à¸„à¸¸à¸¢à¸­à¸¢à¹ˆà¸²à¸‡à¸ªà¸šà¸²à¸¢à¹ƒà¸ˆ
        </p>
      </header>

    

      <div className="counselor-grid">
        {counselors.map((counselor, index) => (
          <CounselorCard key={counselor.id} counselor={counselor} delay={index * 0.06} />
        ))}
      </div>

      <div className="counselor-page__cta">
        <button className="counselor-page__cta-button" type="button">
          à¸™à¸±à¸”à¸‚à¸­à¸„à¸³à¸›à¸£à¸¶à¸à¸©à¸²
        </button>
        <p className="counselor-page__cta-note">
          à¸›à¸£à¸¶à¸à¸©à¸²à¹„à¸”à¹‰à¸—à¸±à¹‰à¸‡ Video Call à¹à¸¥à¸°à¸™à¸±à¸”à¸žà¸šà¸—à¸µà¹ˆà¸„à¸¥à¸´à¸™à¸´à¸ à¹€à¸¥à¸·à¸­à¸à¹€à¸§à¸¥à¸²à¹„à¸”à¹‰à¸•à¸²à¸¡à¸ªà¸°à¸”à¸§à¸
        </p>
      </div>
    </section>
  );
}

//content data for service cards, can be fetched from API in real app, hardcoded here for demo purpose
const counselors: Counselor[] = [
  {
    id: "c1",
    name: "à¸”à¸£. à¸­à¸£à¸­à¸™à¸‡à¸„à¹Œ",
    specialty: "à¸ˆà¸´à¸•à¹à¸žà¸—à¸¢à¹Œà¹€à¸”à¹‡à¸",
    experience: 9,
    focusAreas: ["à¸žà¸¤à¸•à¸´à¸à¸£à¸£à¸¡à¹€à¸”à¹‡à¸", "à¸ªà¸¡à¸²à¸˜à¸´à¸ªà¸±à¹‰à¸™"],
  },
  {
    id: "c2",
    name: "à¸”à¸£. à¸“à¸´à¸Šà¸²à¸™à¸±à¸™à¸—à¹Œ",
    specialty: "à¸™à¸±à¸à¸ˆà¸´à¸•à¸§à¸´à¸—à¸¢à¸²à¸„à¸¥à¸´à¸™à¸´à¸",
    experience: 7,
    focusAreas: ["à¸ à¸²à¸§à¸°à¸à¸±à¸‡à¸§à¸¥", "à¹à¸žà¸™à¸´à¸„"],
  },
  {
    id: "c3",
    name: "à¸”à¸£. à¸à¸£à¸£à¸“à¸´à¸à¸²à¸£à¹Œ",
    specialty: "à¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸à¸„à¸£à¸­à¸šà¸„à¸£à¸±à¸§",
    experience: 12,
    focusAreas: ["à¸„à¸¹à¹ˆà¸£à¸±à¸", "à¸„à¸£à¸­à¸šà¸„à¸£à¸±à¸§"],
  },
  {
    id: "c4",
    name: "à¸”à¸£. à¸˜à¸™à¸žà¸¥",
    specialty: "à¸ˆà¸´à¸•à¸šà¸³à¸šà¸±à¸” CBT",
    experience: 8,
    focusAreas: ["à¸„à¸§à¸²à¸¡à¹€à¸„à¸£à¸µà¸¢à¸”", "à¸«à¸¡à¸”à¹„à¸Ÿ"],
  },
  {
    id: "c5",
    name: "à¸”à¸£. à¸¨à¸´à¸£à¸´à¸™à¸ à¸²",
    specialty: "à¹ƒà¸«à¹‰à¸„à¸³à¸›à¸£à¸¶à¸à¸©à¸²à¸§à¸±à¸¢à¸£à¸¸à¹ˆà¸™",
    experience: 6,
    focusAreas: ["à¸§à¸±à¸¢à¹€à¸£à¸µà¸¢à¸™", "à¸„à¸§à¸²à¸¡à¸¡à¸±à¹ˆà¸™à¹ƒà¸ˆ"],
  },
  {
    id: "c6",
    name: "à¸”à¸£. à¸§à¸µà¸£à¸§à¸±à¸’à¸™à¹Œ",
    specialty: "à¹‚à¸„à¹‰à¸Šà¸Šà¸´à¹ˆà¸‡à¸„à¸§à¸²à¸¡à¹€à¸„à¸£à¸µà¸¢à¸”",
    experience: 10,
    focusAreas: ["à¸à¸²à¸£à¸™à¸­à¸™", "à¸ˆà¸±à¸”à¸à¸²à¸£à¸­à¸²à¸£à¸¡à¸“à¹Œ"],
  },
];


