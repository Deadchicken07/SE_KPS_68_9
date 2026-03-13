import { useEffect, useState } from "react";
import { Button, Row, Col, Typography } from "antd";
import styles from "@/components/home.module.css";

const { Title, Text } = Typography;

type HeroBannerProps = {
  slides: {
    title: string;
    description: string;
    image: string;
    badge: string;
  }[];
  stats: {
    label: string;
    value: string;
  }[];
};

export default function HeroBanner({ slides, stats }: HeroBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBgOverlay} />
      <div className={styles.heroContainer}>
        <div className={styles.heroTopBar}>
          <div>
            <Text className={styles.heroTopBarLabel}>Health & Wellness</Text>
            <Title level={1} className={styles.heroTopBarTitle}>
              ศูนย์บริการสุขภาพจิตเเนวใหม่
            </Title>
          </div>
          <div className={styles.heroCtaGroup}>
            <Button href="/user/exams" className={styles.heroBtnPrimary}>
              ทำเเบบทดสอบ
            </Button>
            <Button href="/user/appointments" className={styles.heroBtnOutline}>
              นัดหมาย
            </Button>
          </div>
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={17}>
            <div className={styles.heroSliderWrapper}>
              {slides.map((slide, index) => (
                <div
                  key={slide.title}
                  className={`${styles.heroSlide} ${activeSlide === index ? styles.heroSlideActive : styles.heroSlideHidden}`}
                >
                  <div
                    className={styles.heroSlideBg}
                    style={{ backgroundImage: `url('${slide.image}')` }}
                  />
                  <div className={styles.heroSlideOverlay} />
                </div>
              ))}

              <div className={styles.heroSlideContent}>
                <span className={styles.heroBadge}>{slides[activeSlide].badge}</span>
                <Title level={2} className={styles.heroSlideTitle}>
                  {slides[activeSlide].title}
                </Title>
                <Text className={styles.heroSlideDesc}>
                  {slides[activeSlide].description}
                </Text>
                <div className={styles.heroDots}>
                  {slides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      aria-label={`เลือกสไลด์ ${index + 1}`}
                      onClick={() => setActiveSlide(index)}
                      className={`${styles.heroDot} ${activeSlide === index ? styles.heroDotActive : ""}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={7}>
            <div className={styles.heroStatsGrid}>
              {stats.map((item) => (
                <div key={item.label} className={styles.heroStatCard}>
                  <Text className={styles.heroStatLabel}>{item.label}</Text>
                  <Title level={3} className={styles.heroStatValue}>
                    {item.value}
                  </Title>
                </div>
              ))}
              <div className={styles.heroInfoCard}>
                <Text className={styles.heroInfoLabel}>เกี่ยวกับบริการ</Text>
                <Title level={3} className={styles.heroInfoTitle}>
                  ดูแลครบวงจรทั้งการรักษาและการให้คำปรึกษา
                </Title>
                <Text className={styles.heroInfoDesc}>
                  หากสงสัย สามารถติดต่อได้ที่เบอร์ 096-767-6767
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
