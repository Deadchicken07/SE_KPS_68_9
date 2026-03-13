import { Row, Col, Typography } from "antd";
import styles from "@/components/home.module.css";

const { Title, Text } = Typography;

type InformationProps = {
  services: {
    title: string;
    body: string;
  }[];
};

export default function Information({ services }: InformationProps) {
  return (
    <section id="services" className={styles.infoSection}>
      <div className={styles.infoHeader}>
        <div className={styles.infoHeaderLeft}>
          <Text className={styles.infoLabel}>ศูนย์และแผนกบริการ</Text>
          <Title level={2} className={styles.infoTitle}>
            บริการสุขภาพจิตที่ครอบคลุมทุกความต้องการ
          </Title>
          <Text className={styles.infoDesc}>
            ดูแลโดยทีมจิตแพทย์และผู้เชี่ยวชาญด้านสุขภาพจิต พร้อมให้คำปรึกษา
            ประเมิน วินิจฉัย และวางแผนการรักษาที่เหมาะสมกับแต่ละบุคคล
            เพื่อส่งเสริมคุณภาพชีวิตและความสมดุลทางอารมณ์
          </Text>
        </div>
        <div className={styles.infoTag}>
          General psychiatry / Child / Elderly / Therapy / Testing
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {services.map((service, index: number) => (
          <Col key={service.title} xs={24} md={12} xl={8}>
            <article className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <div className={styles.infoNumber}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <Title level={3} className={styles.infoCardTitle}>
                  {service.title}
                </Title>
              </div>
              <Text className={styles.infoCardBody}>{service.body}</Text>
            </article>
          </Col>
        ))}
      </Row>
    </section>
  );
}
