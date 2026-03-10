import { Row, Col, Typography } from "antd";
import styles from "@/components/home.module.css";

const { Title, Text } = Typography;

type TipsProps = {
  articles: string[];
  articleImages: string[];
};

export default function Tips({ articles, articleImages }: TipsProps) {
  return (
    <section id="articles" className={styles.tipsSection}>
      <div className={styles.tipsContainer}>
        <div className={styles.tipsHeader}>
          <div className={styles.tipsHeaderLeft}>
            <Text className={styles.tipsLabel}>ข่าวและบทความ</Text>
            <Title level={2} className={styles.tipsTitle}>
              ความรู้สุขภาพใจในภาษาที่เข้าถึงได้
            </Title>
          </div>
          <a href="#contact" className={styles.tipsLink}>
            ขอข้อมูลเพิ่มเติม
          </a>
        </div>

        <Row gutter={[20, 20]}>
          {articles.map((article: string, index: number) => (
            <Col key={article} xs={24} lg={8}>
              <article className={styles.tipsCard}>
                <div
                  className={styles.tipsCardImage}
                  style={{ backgroundImage: `url('${articleImages[index]}')` }}
                />
                <div className={styles.tipsCardBody}>
                  <Text className={styles.tipsCardLabel}>
                    Article {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Title level={3} className={styles.tipsCardTitle}>
                    {article}
                  </Title>
                  <Text className={styles.tipsCardDesc}>
                    ตัวอย่างหัวข้อจากหน้าเว็บไซต์ Piti Clinic สำหรับจัดวาง section
                    บทความก่อนเชื่อมระบบเนื้อหาจริง
                  </Text>
                </div>
              </article>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
