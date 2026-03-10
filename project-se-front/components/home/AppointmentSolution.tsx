import { Row, Col, Typography } from "antd";
import styles from "@/components/home.module.css";

const { Title, Text } = Typography;

const steps = [
  {
    num: "01",
    title: "ทำแบบประเมินสุขภาพจิตเบื้องต้น",
    desc: "เพื่อที่จะได้ช่วยแนะนำประเภทบริการที่เหมาะสม",
  },
  {
    num: "02",
    title: "เลือกวันและผู้เชี่ยวชาญ",
    desc: "รองรับทั้งจิตแพทย์ นักจิตวิทยา ตามช่วงวัยและลักษณะของปัญหา",
  },
  {
    num: "03",
    title: "เริ่มการดูแลต่อเนื่อง",
    desc: "วางแผนการติดตามผลทั้งแบบพบแพทย์ที่คลินิกหรือปรึกษาออนไลน์ตามความเหมาะสม",
  },
];

const solutions = [
  "ปรึกษาด้วยตนเอง",
  "ปรึกษาแทนญาติ",
  "ปรึกษาออนไลน์",
  "ติดตามผลระยะยาว",
];

export default function AppointmentSolution() {
  return (
    <section className={styles.apptSection}>
      <div className={styles.apptContainer}>
        <Row gutter={[40, 40]}>
          <Col xs={24} lg={12}>
            <div className={styles.apptDarkCard}>
              <Text className={styles.apptDarkLabel}>ขั้นตอนการนัดหมาย</Text>
              <Title level={2} className={styles.apptDarkTitle}>
                นัดหมายง่าย ชัดเจน และเป็นส่วนตัว
              </Title>
              <div className={styles.apptSteps}>
                {steps.map((step) => (
                  <div key={step.num} className={styles.apptStep}>
                    <Text className={styles.apptStepTitle}>
                      {step.num} {step.title}
                    </Text>
                    <Text className={styles.apptStepDesc}>{step.desc}</Text>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className={styles.apptLightCard}>
              <Text className={styles.apptLightLabel}>แนวทางการรักษา</Text>
              <Title level={2} className={styles.apptLightTitle}>
                หลากหลายวิธี เพื่อให้เหมาะกับแต่ละคน
              </Title>
              <Text className={styles.apptLightDesc}>
                โดยทีมจิตแพทย์จะประเมินอาการอย่างละเอียด และวางแผนการรักษาที่เหมาะสม
                เช่น การให้คำปรึกษา การทำจิตบำบัด และการรักษาด้วยยา
                เพื่อช่วยให้ผู้รับบริการมีสุขภาพจิตที่ดีขึ้น
              </Text>
              <Row gutter={[16, 16]} className={styles.apptSolutionGrid}>
                {solutions.map((item) => (
                  <Col key={item} xs={24} sm={12}>
                    <div className={styles.apptSolutionItem}>{item}</div>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
