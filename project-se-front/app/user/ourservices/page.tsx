"use client";

import Link from "next/link";
import "./service-ui.css";

export default function OurService() {
  return (
    <div className="service-shell">
      <div className="service-frame">
        <main className="service-main">
          <section className="service-page">
            <header className="service-page__header">
              <div className="service-header-badge">Our Services</div>
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
        </main>
      </div>
      <div className="service-bottom-strip" />
    </div>
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
    <article className={`service-card ${accentClass}`}>
      <div className="service-card__image-wrap">
        <img alt={title} className="service-card__image" loading="lazy" src={imageUrl} />
      </div>
      <div className="service-card__content">
        <h3 className="service-card__title">{title}</h3>
        <p className="service-card__description">{description}</p>
        <Link href="/user/appointments" className="service-card__button" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
          นัดหมายเลย
        </Link>
      </div>
    </article>
  );
}

const services = [
  {
    title: "Video Call",
    description: "พูดคุยเห็นหน้าแบบเรียลไทม์ เข้าใจอารมณ์ได้ลึกขึ้น",
    imageUrl: "/images/service/online.png",
  },
  {
    title: "Onsite Booking",
    description: "จองคิวพบผู้เชี่ยวชาญที่คลินิก ใกล้คุณในเวลาที่สะดวก",
    imageUrl: "/images/service/onsite.png",
  },
] as const;
