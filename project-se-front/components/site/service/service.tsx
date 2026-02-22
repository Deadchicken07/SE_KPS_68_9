
export default function OurService() {
  return (
    <section className="service-page">
      <header className="service-page__header">
        <p className="service-page__eyebrow">jitdee Care</p>
        <h2 className="service-page__title">à¸šà¸£à¸´à¸à¸²à¸£à¸‚à¸­à¸‡à¹€à¸£à¸²</h2>
        <p className="service-page__subtitle">
          à¹€à¸¥à¸·à¸­à¸à¸Šà¹ˆà¸­à¸‡à¸—à¸²à¸‡à¸—à¸µà¹ˆà¸ªà¸šà¸²à¸¢à¹ƒà¸ˆà¸—à¸µà¹ˆà¸ªà¸¸à¸” à¹à¸¥à¹‰à¸§à¹€à¸£à¸´à¹ˆà¸¡à¸žà¸¹à¸”à¸„à¸¸à¸¢à¸à¸±à¸šà¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸à¹„à¸”à¹‰à¸—à¸±à¸™à¸—à¸µ
        </p>
      </header>

      <div className="service-grid">
        {services.map((service, index) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            description={service.description}
            imageUrl={service.imageUrl}
            delay={index * 0.12}
            accentClass={index === 0 ? "is-video" : "is-onsite"}
          />
        ))}
      </div>
    </section>
  );
}

type ServiceCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  delay: number;
  accentClass: "is-video" | "is-onsite";
};

function ServiceCard({ title, description, imageUrl, delay, accentClass }: ServiceCardProps) {
  return (
    <article className={`service-card ${accentClass}`} style={{ animationDelay: `${delay}s` }}>
      <div className="service-card__image-wrap">
        <img alt={title} className="service-card__image" loading="lazy" src={imageUrl} />
      </div>
      <h3 className="service-card__title">{title}</h3>
      <p className="service-card__description">{description}</p>
      <button className="service-card__button" type="button">
        à¹€à¸£à¸´à¹ˆà¸¡à¸•à¹‰à¸™à¹€à¸¥à¸¢
      </button>
    </article>
  );
}

//content data for service cards, can be fetched from API in real app, hardcoded here for demo purpose
const services = [
  {
    title: "Video Call",
    description: "à¸žà¸¹à¸”à¸„à¸¸à¸¢à¹€à¸«à¹‡à¸™à¸«à¸™à¹‰à¸²à¹à¸šà¸šà¹€à¸£à¸µà¸¢à¸¥à¹„à¸—à¸¡à¹Œ à¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸­à¸²à¸£à¸¡à¸“à¹Œà¹„à¸”à¹‰à¸¥à¸¶à¸à¸‚à¸¶à¹‰à¸™",
    imageUrl: "/images/service/photo-1521737604893-d14cc237f11d.avif",
  },
  {
    title: "Onsite Booking",
    description: "à¸ˆà¸­à¸‡à¸„à¸´à¸§à¸žà¸šà¸œà¸¹à¹‰à¹€à¸Šà¸µà¹ˆà¸¢à¸§à¸Šà¸²à¸à¸—à¸µà¹ˆà¸„à¸¥à¸´à¸™à¸´à¸ à¹ƒà¸à¸¥à¹‰à¸„à¸¸à¸“à¹ƒà¸™à¹€à¸§à¸¥à¸²à¸—à¸µà¹ˆà¸ªà¸°à¸”à¸§à¸",
    imageUrl: "/images/service/photo-1573497019940-1c28c88b4f3e.avif",
  },
] as const;


