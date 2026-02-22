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
  { icon: "01", title: "à¸™à¸±à¸”à¸›à¸£à¸¶à¸à¸©à¸²à¸­à¸­à¸™à¹„à¸¥à¸™à¹Œ", caption: "Video Call à¸à¸±à¸šà¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸à¸—à¸±à¸™à¸—à¸µ" },
  { icon: "02", title: "à¹€à¸£à¸´à¹ˆà¸¡à¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸ªà¸¸à¸‚à¸ à¸²à¸žà¹ƒà¸ˆ", caption: "à¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¹€à¸šà¸·à¹‰à¸­à¸‡à¸•à¹‰à¸™à¹ƒà¸™à¹„à¸¡à¹ˆà¸à¸µà¹ˆà¸™à¸²à¸—à¸µ" },
  { icon: "03", title: "à¸”à¸¹à¸šà¸—à¸„à¸§à¸²à¸¡à¹à¸™à¸°à¸™à¸³", caption: "à¹à¸™à¸§à¸—à¸²à¸‡à¸”à¸¹à¹à¸¥à¹ƒà¸ˆà¸—à¸µà¹ˆà¸­à¹ˆà¸²à¸™à¸‡à¹ˆà¸²à¸¢à¹à¸¥à¸°à¹ƒà¸Šà¹‰à¹„à¸”à¹‰à¸ˆà¸£à¸´à¸‡" },
];

const onlineServices: CardItem[] = [
  { title: "à¸›à¸£à¸¶à¸à¸©à¸²à¸­à¸­à¸™à¹„à¸¥à¸™à¹Œà¸£à¸²à¸¢à¸šà¸¸à¸„à¸„à¸¥", description: "à¸žà¸¹à¸”à¸„à¸¸à¸¢à¸ªà¹ˆà¸§à¸™à¸•à¸±à¸§à¸œà¹ˆà¸²à¸™à¸§à¸´à¸”à¸µà¹‚à¸­à¸„à¸­à¸¥à¹à¸šà¸šà¹€à¸‚à¹‰à¸²à¸£à¸«à¸±à¸ªà¸‚à¹‰à¸­à¸¡à¸¹à¸¥" },
  { title: "à¹à¸Šà¸•à¸•à¸´à¸”à¸•à¸²à¸¡à¸­à¸²à¸à¸²à¸£", description: "à¸ªà¹ˆà¸‡à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸•à¸´à¸”à¸•à¸²à¸¡à¸­à¸²à¸à¸²à¸£à¹à¸¥à¸°à¸£à¸±à¸šà¸„à¸³à¹à¸™à¸°à¸™à¸³à¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡" },
  { title: "à¸™à¸±à¸”à¸žà¸šà¸—à¸µà¹ˆà¸„à¸¥à¸´à¸™à¸´à¸", description: "à¸ˆà¸­à¸‡à¹€à¸§à¸¥à¸²à¹€à¸‚à¹‰à¸²à¸„à¸¥à¸´à¸™à¸´à¸à¹ƒà¸™à¸Šà¹ˆà¸§à¸‡à¸—à¸µà¹ˆà¸„à¸¸à¸“à¸ªà¸°à¸”à¸§à¸" },
];

const careDimensions: CardItem[] = [
  { title: "à¸¡à¸´à¸•à¸´à¸­à¸²à¸£à¸¡à¸“à¹Œ", description: "à¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸­à¸²à¸£à¸¡à¸“à¹Œà¹à¸¥à¸°à¸ˆà¸±à¸”à¸à¸²à¸£à¸„à¸§à¸²à¸¡à¹€à¸„à¸£à¸µà¸¢à¸”à¹ƒà¸™à¸Šà¸µà¸§à¸´à¸•à¸›à¸£à¸°à¸ˆà¸³à¸§à¸±à¸™" },
  { title: "à¸¡à¸´à¸•à¸´à¸„à¸§à¸²à¸¡à¸„à¸´à¸”", description: "à¸›à¸£à¸±à¸šà¸à¸£à¸­à¸šà¸„à¸´à¸”à¸—à¸µà¹ˆà¸à¸”à¸”à¸±à¸™à¸•à¸±à¸§à¹€à¸­à¸‡à¹€à¸à¸´à¸™à¹„à¸›" },
  { title: "à¸¡à¸´à¸•à¸´à¸„à¸§à¸²à¸¡à¸ªà¸±à¸¡à¸žà¸±à¸™à¸˜à¹Œ", description: "à¸ªà¸·à¹ˆà¸­à¸ªà¸²à¸£à¸à¸±à¸šà¸„à¸™à¹ƒà¸à¸¥à¹‰à¸•à¸±à¸§à¹„à¸”à¹‰à¸”à¸µà¸‚à¸¶à¹‰à¸™ à¸¥à¸”à¸„à¸§à¸²à¸¡à¸‚à¸±à¸”à¹à¸¢à¹‰à¸‡" },
  { title: "à¸¡à¸´à¸•à¸´à¸à¸²à¸£à¸‡à¸²à¸™à¹à¸¥à¸°à¸à¸²à¸£à¹€à¸£à¸µà¸¢à¸™", description: "à¸£à¸±à¸šà¸¡à¸·à¸­à¸ à¸²à¸§à¸°à¸«à¸¡à¸”à¹„à¸Ÿà¹à¸¥à¸°à¸„à¸§à¸²à¸¡à¸à¸”à¸”à¸±à¸™à¸£à¸°à¸¢à¸°à¸¢à¸²à¸§" },
  { title: "à¸¡à¸´à¸•à¸´à¸à¸²à¸£à¸žà¸±à¸à¸œà¹ˆà¸­à¸™", description: "à¸ˆà¸±à¸”à¸à¸²à¸£à¸à¸²à¸£à¸™à¸­à¸™à¹à¸¥à¸°à¸žà¸¥à¸±à¸‡à¹ƒà¸ˆà¹ƒà¸«à¹‰à¸ªà¸¡à¸”à¸¸à¸¥à¸‚à¸¶à¹‰à¸™" },
];

const assessments: Assessment[] = [
  { title: "à¹à¸šà¸šà¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸„à¸§à¸²à¸¡à¹€à¸„à¸£à¸µà¸¢à¸”", minutes: "5 à¸™à¸²à¸—à¸µ" },
  { title: "à¹à¸šà¸šà¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸ à¸²à¸§à¸°à¸‹à¸¶à¸¡à¹€à¸¨à¸£à¹‰à¸²", minutes: "7 à¸™à¸²à¸—à¸µ" },
  { title: "à¹à¸šà¸šà¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸„à¸§à¸²à¸¡à¸§à¸´à¸•à¸à¸à¸±à¸‡à¸§à¸¥", minutes: "6 à¸™à¸²à¸—à¸µ" },
  { title: "à¹à¸šà¸šà¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸ à¸²à¸§à¸°à¸«à¸¡à¸”à¹„à¸Ÿ", minutes: "5 à¸™à¸²à¸—à¸µ" },
];

const reasons: CardItem[] = [
  { title: "à¸—à¸µà¸¡à¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸à¸«à¸¥à¸²à¸¢à¸ªà¸²à¸‚à¸²", description: "à¸„à¸±à¸”à¹à¸¡à¸•à¸Šà¹Œà¸™à¸±à¸à¸šà¸³à¸šà¸±à¸”à¸•à¸²à¸¡à¸›à¸±à¸à¸«à¸²à¸«à¸¥à¸±à¸à¸‚à¸­à¸‡à¹à¸•à¹ˆà¸¥à¸°à¸„à¸™" },
  { title: "à¸£à¸°à¸šà¸šà¸™à¸±à¸”à¸«à¸¡à¸²à¸¢à¸‡à¹ˆà¸²à¸¢", description: "à¹€à¸¥à¸·à¸­à¸à¸Šà¹ˆà¸§à¸‡à¹€à¸§à¸¥à¸² à¸ˆà¹ˆà¸²à¸¢à¹€à¸‡à¸´à¸™ à¹à¸¥à¸°à¸¢à¸·à¸™à¸¢à¸±à¸™à¸„à¸´à¸§à¹„à¸”à¹‰à¹ƒà¸™à¸«à¸™à¹‰à¸²à¹€à¸”à¸µà¸¢à¸§" },
  { title: "à¸”à¸¹à¹à¸¥à¸•à¹ˆà¸­à¹€à¸™à¸·à¹ˆà¸­à¸‡", description: "à¸¡à¸µà¹à¸œà¸™à¸•à¸´à¸”à¸•à¸²à¸¡à¸œà¸¥à¹à¸¥à¸°à¸ªà¸£à¸¸à¸›à¸žà¸±à¸’à¸™à¸²à¸à¸²à¸£à¹ƒà¸«à¹‰à¸—à¸¸à¸à¹€à¸”à¸·à¸­à¸™" },
];

const stats: Stat[] = [
  { value: "15,000+", label: "à¸œà¸¹à¹‰à¹€à¸‚à¹‰à¸²à¸£à¸±à¸šà¸šà¸£à¸´à¸à¸²à¸£à¸ªà¸°à¸ªà¸¡" },
  { value: "96%", label: "à¸„à¸§à¸²à¸¡à¸žà¸¶à¸‡à¸žà¸­à¹ƒà¸ˆà¹‚à¸”à¸¢à¸£à¸§à¸¡" },
  { value: "24 à¸Šà¸¡.", label: "à¸•à¸­à¸šà¸à¸¥à¸±à¸šà¸ à¸²à¸¢à¹ƒà¸™à¸§à¸±à¸™à¹€à¸”à¸µà¸¢à¸§" },
];

const experts: ExpertPreview[] = [
  { name: "à¸”à¸£. à¸­à¸£à¸­à¸™à¸‡à¸„à¹Œ", role: "à¸ˆà¸´à¸•à¹à¸žà¸—à¸¢à¹Œà¹€à¸”à¹‡à¸à¹à¸¥à¸°à¸§à¸±à¸¢à¸£à¸¸à¹ˆà¸™" },
  { name: "à¸”à¸£. à¸“à¸´à¸Šà¸²à¸™à¸±à¸™à¸—à¹Œ", role: "à¸™à¸±à¸à¸ˆà¸´à¸•à¸§à¸´à¸—à¸¢à¸²à¸„à¸¥à¸´à¸™à¸´à¸" },
  { name: "à¸”à¸£. à¸à¸£à¸£à¸“à¸´à¸à¸²à¸£à¹Œ", role: "à¸—à¸µà¹ˆà¸›à¸£à¸¶à¸à¸©à¸²à¸„à¸¹à¹ˆà¸£à¸±à¸à¹à¸¥à¸°à¸„à¸£à¸­à¸šà¸„à¸£à¸±à¸§" },
];

const articles: CardItem[] = [
  { title: "à¸ªà¸±à¸à¸à¸²à¸“à¹€à¸•à¸·à¸­à¸™à¹ƒà¸ˆà¹€à¸¡à¸·à¹ˆà¸­à¸„à¸§à¸²à¸¡à¹€à¸„à¸£à¸µà¸¢à¸”à¹€à¸£à¸´à¹ˆà¸¡à¸ªà¸°à¸ªà¸¡", description: "à¸§à¸´à¸˜à¸µà¸ªà¸±à¸‡à¹€à¸à¸•à¸•à¸±à¸§à¹€à¸­à¸‡à¸à¹ˆà¸­à¸™à¸„à¸§à¸²à¸¡à¹€à¸„à¸£à¸µà¸¢à¸”à¸à¸£à¸°à¸—à¸šà¸‡à¸²à¸™à¹à¸¥à¸°à¸„à¸§à¸²à¸¡à¸ªà¸±à¸¡à¸žà¸±à¸™à¸˜à¹Œ" },
  { title: "à¸„à¸¸à¸¢à¸à¸±à¸šà¸¥à¸¹à¸à¸­à¸¢à¹ˆà¸²à¸‡à¹„à¸£à¹ƒà¸™à¸§à¸±à¸™à¸—à¸µà¹ˆà¸¥à¸¹à¸à¹„à¸¡à¹ˆà¸­à¸¢à¸²à¸à¸žà¸¹à¸”", description: "à¹€à¸—à¸„à¸™à¸´à¸„à¸ªà¸·à¹ˆà¸­à¸ªà¸²à¸£à¸à¸±à¸šà¸§à¸±à¸¢à¸£à¸¸à¹ˆà¸™à¹‚à¸”à¸¢à¹„à¸¡à¹ˆà¸à¸”à¸”à¸±à¸™à¹à¸¥à¸°à¹„à¸¡à¹ˆà¸•à¸±à¸”à¸ªà¸´à¸™" },
  { title: "5 à¸§à¸´à¸˜à¸µà¸£à¸µà¹€à¸‹à¹‡à¸•à¹ƒà¸ˆà¹€à¸¡à¸·à¹ˆà¸­à¹€à¸£à¸´à¹ˆà¸¡à¸«à¸¡à¸”à¹„à¸Ÿ", description: "à¹à¸™à¸§à¸—à¸²à¸‡à¸”à¸¹à¹à¸¥à¹ƒà¸ˆà¹à¸šà¸šà¸—à¸³à¹„à¸”à¹‰à¸ˆà¸£à¸´à¸‡à¹ƒà¸™ 1 à¸ªà¸±à¸›à¸”à¸²à¸«à¹Œ" },
];

export default function HomePage() {
  return (
    <section className="home-page">
      <header className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Jitdee Care Clinic</p>
          <h1 className="home-hero__title">à¹ƒà¸«à¹‰à¸à¸²à¸£à¸”à¸¹à¹à¸¥à¸ªà¸¸à¸‚à¸ à¸²à¸žà¹ƒà¸ˆà¹€à¸›à¹‡à¸™à¹€à¸£à¸·à¹ˆà¸­à¸‡à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¸–à¸¶à¸‡à¸‡à¹ˆà¸²à¸¢</h1>
          <p className="home-hero__subtitle">
            à¹‚à¸„à¸£à¸‡à¸«à¸™à¹‰à¸²à¹à¸£à¸à¸™à¸µà¹‰à¸­à¹‰à¸²à¸‡à¸­à¸´à¸‡à¹à¸™à¸§à¸ˆà¸±à¸”à¸§à¸²à¸‡à¸ˆà¸²à¸à¹€à¸§à¹‡à¸šà¹„à¸‹à¸•à¹Œ iSTRONG à¹‚à¸”à¸¢à¸›à¸£à¸±à¸šà¹ƒà¸«à¹‰à¹€à¸‚à¹‰à¸²à¸à¸±à¸šà¸šà¸£à¸´à¸à¸²à¸£à¸‚à¸­à¸‡ Jitdee Care
            à¸—à¸±à¹‰à¸‡à¸šà¸£à¸´à¸à¸²à¸£à¸­à¸­à¸™à¹„à¸¥à¸™à¹Œ à¹à¸šà¸šà¸›à¸£à¸°à¹€à¸¡à¸´à¸™ à¹à¸¥à¸°à¸—à¸µà¸¡à¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸
          </p>
          <div className="home-hero__actions">
            <Link className="home-button is-primary" href="/service">
              à¹€à¸£à¸´à¹ˆà¸¡à¸ˆà¸­à¸‡à¸šà¸£à¸´à¸à¸²à¸£
            </Link>
            <Link className="home-button is-ghost" href="/counselor">
              à¸”à¸¹à¸—à¸µà¸¡à¸œà¸¹à¹‰à¹ƒà¸«à¹‰à¸„à¸³à¸›à¸£à¸¶à¸à¸©à¸²
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
          <h2 className="home-section__title">à¸šà¸£à¸´à¸à¸²à¸£à¹ƒà¸«à¹‰à¸„à¸³à¸›à¸£à¸¶à¸à¸©à¸²à¸­à¸­à¸™à¹„à¸¥à¸™à¹Œ</h2>
          <p className="home-section__subtitle">à¹€à¸¥à¸·à¸­à¸à¸£à¸¹à¸›à¹à¸šà¸šà¸šà¸£à¸´à¸à¸²à¸£à¸—à¸µà¹ˆà¹€à¸«à¸¡à¸²à¸°à¸à¸±à¸šà¸„à¸¸à¸“</p>
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
          <h2 className="home-section__title">à¹à¸™à¸§à¸—à¸²à¸‡à¸”à¸¹à¹à¸¥à¸ªà¸¸à¸‚à¸ à¸²à¸žà¹ƒà¸ˆ 5 à¸¡à¸´à¸•à¸´</h2>
          <p className="home-section__subtitle">à¸„à¸£à¸­à¸šà¸„à¸¥à¸¸à¸¡à¸—à¸±à¹‰à¸‡à¸­à¸²à¸£à¸¡à¸“à¹Œ à¸„à¸§à¸²à¸¡à¸„à¸´à¸” à¹à¸¥à¸°à¸à¸²à¸£à¹ƒà¸Šà¹‰à¸Šà¸µà¸§à¸´à¸•</p>
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
          <h2 className="home-section__title">à¹à¸šà¸šà¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸­à¸­à¸™à¹„à¸¥à¸™à¹Œ</h2>
          <p className="home-section__subtitle">à¹€à¸£à¸´à¹ˆà¸¡à¸ˆà¸²à¸à¸à¸²à¸£à¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¹€à¸šà¸·à¹‰à¸­à¸‡à¸•à¹‰à¸™à¸à¹ˆà¸­à¸™à¸žà¸šà¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸</p>
        </div>
        <div className="home-grid home-grid--four">
          {assessments.map((item) => (
            <article key={item.title} className="home-card home-card--assessment">
              <h3 className="home-card__title">{item.title}</h3>
              <p className="home-card__meta">à¹ƒà¸Šà¹‰à¹€à¸§à¸¥à¸² {item.minutes}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <h2 className="home-section__title">à¸—à¸³à¹„à¸¡à¸•à¹‰à¸­à¸‡à¹€à¸¥à¸·à¸­à¸ Jitdee Care</h2>
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
            <h2 className="home-section__title">à¸—à¸µà¸¡à¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸</h2>
            <p className="home-section__subtitle">à¸•à¸±à¸§à¸­à¸¢à¹ˆà¸²à¸‡à¸œà¸¹à¹‰à¹ƒà¸«à¹‰à¸„à¸³à¸›à¸£à¸¶à¸à¸©à¸²à¹ƒà¸™à¸£à¸°à¸šà¸š</p>
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
            <h2 className="home-section__title">à¸šà¸—à¸„à¸§à¸²à¸¡à¹à¸™à¸°à¸™à¸³</h2>
            <p className="home-section__subtitle">à¹€à¸™à¸·à¹‰à¸­à¸«à¸²à¸­à¹ˆà¸²à¸™à¸‡à¹ˆà¸²à¸¢à¹€à¸žà¸·à¹ˆà¸­à¸”à¸¹à¹à¸¥à¹ƒà¸ˆà¸—à¸¸à¸à¸§à¸±à¸™</p>
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
        <p className="home-cta-strip__text">à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¹€à¸£à¸´à¹ˆà¸¡à¸›à¸£à¸¶à¸à¸©à¸²? à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢à¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸à¹„à¸”à¹‰à¸—à¸±à¸™à¸—à¸µ</p>
        <div className="home-cta-strip__actions">
          <Link className="home-button is-primary" href="/service">
            à¹„à¸›à¸«à¸™à¹‰à¸²à¸šà¸£à¸´à¸à¸²à¸£
          </Link>
          <Link className="home-button is-ghost" href="/counselor">
            à¸”à¸¹à¸œà¸¹à¹‰à¹ƒà¸«à¹‰à¸„à¸³à¸›à¸£à¸¶à¸à¸©à¸²
          </Link>
        </div>
      </section>
    </section>
  );
}

