"use client";

import Link from "next/link";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import "./service-ui.css";
import { navigateToAppointmentsWithLoginGuard } from "@/utils/guardedNavigation";

export default function OurService() {
  const router = useRouter();
  const [modalApi, modalContextHolder] = Modal.useModal();

  return (
    <>
      {modalContextHolder}
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
                    accentClass={index === 0 ? "is-video" : "is-onsite"}
                    onBook={() => navigateToAppointmentsWithLoginGuard(router, modalApi)}
                  />
                ))}
              </div>
            </section>
          </main>
        </div>
        <div className="service-bottom-strip" />
      </div>
    </>
  );
}

type ServiceCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  accentClass: "is-video" | "is-onsite";
  onBook: () => void;
};

function ServiceCard({
  title,
  description,
  imageUrl,
  accentClass,
  onBook,
}: ServiceCardProps) {
  return (
    <article className={`service-card ${accentClass}`}>
      <div className="service-card__image-wrap">
        <img alt={title} className="service-card__image" loading="lazy" src={imageUrl} />
      </div>
      <div className="service-card__content">
        <h3 className="service-card__title">{title}</h3>
        <p className="service-card__description">{description}</p>
        <Link
          href="/user/appointments"
          className="service-card__button"
          style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}
          onClick={(event) => {
            event.preventDefault();
            onBook();
          }}
        >
          นัดหมายเลย
        </Link>
      </div>
    </article>
  );
}

const services = [
  {
    title: "Video Call",
    description: "พูดคุยเห็นหน้าแบบเรียลไทม์ รับฟังปรึกษาได้อย่างเข้าใจ",
    imageUrl: "/images/service/online.png",
  },
  {
    title: "Onsite Booking",
    description: "พูดคุยปรึกษากับผู้เชี่ยวชาญของเราโดยตรงที่คลินิก",
    imageUrl: "/images/service/onsite.png",
  },
] as const;
