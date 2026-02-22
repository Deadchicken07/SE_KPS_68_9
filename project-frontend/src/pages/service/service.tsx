import videoCallImage from "./image/photo-1521737604893-d14cc237f11d.avif";
import onsiteBookingImage from "./image/photo-1573497019940-1c28c88b4f3e.avif";

export default function OurService() {
  return (
    <section className="service-page">
      <header className="service-page__header">
        <p className="service-page__eyebrow">manga Care</p>
        <h2 className="service-page__title">บริการของเรา</h2>
        <p className="service-page__subtitle">
          เลือกช่องทางที่สบายใจที่สุด แล้วเริ่มพูดคุยกับผู้เชี่ยวชาญได้ทันที
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
        เริ่มต้นเลย
      </button>
    </article>
  );
}

//content data for service cards, can be fetched from API in real app, hardcoded here for demo purpose
const services = [
  {
    title: "Video Call",
    description: "พูดคุยเห็นหน้าแบบเรียลไทม์ เข้าใจอารมณ์ได้ลึกขึ้น",
    imageUrl: videoCallImage,
  },
  {
    title: "Onsite Booking",
    description: "จองคิวพบผู้เชี่ยวชาญที่คลินิก ใกล้คุณในเวลาที่สะดวก",
    imageUrl: onsiteBookingImage,
  },
] as const;
