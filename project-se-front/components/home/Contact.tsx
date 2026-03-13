"use client";

import { Button, Row, Col, Typography } from "antd";
import { useRouter } from "next/navigation";
import styles from "@/components/home.module.css";
import { navigateToAppointmentsWithLoginGuard } from "@/utils/guardedNavigation";

const { Title, Text } = Typography;

export default function Contact() {
  const router = useRouter();

  return (
    <section id="contact" className={styles.contactSection}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <div className={styles.contactDarkCard}>
            <Text className={styles.contactDarkLabel}>ติดต่อเรา</Text>
            <Title level={2} className={styles.contactDarkTitle}>
              พร้อมเริ่มต้นการดูแลสุขภาพใจของคุณ
            </Title>
            <Text className={styles.contactDarkDesc}>
              หากคุณกำลังเผชิญกับความเครียด ความวิตกกังวล หรือปัญหาทางอารมณ์
              ทีมจิตแพทย์และผู้เชี่ยวชาญของเราพร้อมให้คำปรึกษาและดูแลอย่างใกล้ชิด
            </Text>
            <Row gutter={[16, 16]} className={styles.contactInfoGrid}>
              <Col xs={24} sm={12}>
                <div className={styles.contactInfoItem}>
                  <Text className={styles.contactInfoItemLabel}>โทรศัพท์</Text>
                  <Title level={4} className={styles.contactInfoItemValue}>
                    090 230 6000
                  </Title>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className={styles.contactInfoItem}>
                  <Text className={styles.contactInfoItemLabel}>ที่ตั้ง</Text>
                  <Text className={styles.contactInfoItemAddr}>
                    170/6 ถนนประดิพัทธ์ แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className={styles.contactLightCard}>
            <Text className={styles.contactLightLabel}>ติดต่อปรึกษา</Text>
            <div className={styles.contactScheduleList}>
              <div className={styles.contactScheduleItem}>
                <Text className={styles.contactScheduleDay}>วันจันทร์ - วันศุกร์</Text>
                <Title level={3} className={styles.contactScheduleTime}>
                  10.00 - 18.00 น.
                </Title>
              </div>
              <div className={styles.contactScheduleItem}>
                <Text className={styles.contactScheduleDay}>วันเสาร์ - วันอาทิตย์</Text>
                <Title level={3} className={styles.contactScheduleTime}>
                  9.00 - 18.00 น.
                </Title>
              </div>
            </div>
            <Button
              className={styles.contactBtn}
              onClick={() => navigateToAppointmentsWithLoginGuard(router)}
            >
              จองคิวเบื้องต้น
            </Button>
          </div>
        </Col>
      </Row>
    </section>
  );
}
