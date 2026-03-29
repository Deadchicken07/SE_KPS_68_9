"use client";

import { useState } from "react";
import { useStaff } from "@/hooks/useStaff";
import { Staff } from "@/types/staff.types";
import {
  Avatar,
  Badge,
  Card,
  Col,
  Divider,
  Modal,
  Pagination,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const PAGE_SIZE = 8;

const roleColorMap: Record<string, string> = {
  จิตแพทย์: "geekblue",
  นักจิตวิทยา: "green",
};

const App = () => {
  const { staffs: staffList, loading, error } = useStaff();
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Staff | null>(null);

  const paginated = staffList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4efe8",
        padding: "60px 24px 80px",
        fontFamily: "'Sarabun', 'Arial', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Badge
          count="Therapists"
          style={{
            backgroundColor: "#0f766e",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 2,
            padding: "4px 18px",
            borderRadius: 999,
            height: "auto",
            lineHeight: "28px",
            marginBottom: 20,
            display: "inline-block",
          }}
        />
        <Title
          level={1}
          style={{
            color: "#1a5c4e",
            fontWeight: 800,
            marginTop: 16,
            marginBottom: 12,
          }}
        >
          ทีมแพทย์ และนักจิตวิทยาผู้เชี่ยวชาญของเรา
        </Title>
        <Paragraph style={{ color: "#3a3131", fontSize: 16, fontWeight: 600 }}>
          พร้อมดูแลคุณด้วยความใส่ใจ
        </Paragraph>
      </div>

      {/* Outer wrapper card */}
      <Card
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          borderRadius: 24,
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        }}
        styles={{ body: { padding: "40px 32px 32px" } }}
      >
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Spin size="large" />
            <div style={{ marginTop: 12, color: "#1a5c4e", fontWeight: 600 }}>
              กำลังโหลดข้อมูลทีมงาน...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Text type="danger" style={{ fontSize: 18, fontWeight: 600 }}>
              {error}
            </Text>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && staffList.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Text style={{ fontSize: 18, color: "#1a5c4e", fontWeight: 600 }}>
              ขณะนี้ยังไม่มีข้อมูลบุคลากรในระบบ
            </Text>
          </div>
        )}

        {/* Staff Grid */}
        {!loading && !error && staffList.length > 0 && (
          <>
            <Row gutter={[28, 28]} align="stretch">
              {paginated.map((person) => (
                <Col key={person.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    onClick={() => setSelected(person)}
                    style={{
                      borderRadius: 20,
                      textAlign: "center",
                      overflow: "hidden",
                      borderTop: "4px solid #0f766e",
                      boxShadow: "0 4px 16px rgba(99, 102, 241, 0.07)",
                      height: "100%",
                      cursor: "pointer",
                    }}
                    styles={{ body: { padding: "32px 20px 28px" } }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: 4,
                        borderRadius: "50%",
                        background: "#0f766e",
                        marginBottom: 20,
                      }}
                    >
                      <Avatar
                        size={120}
                        src={
                          person.image || "/docterProfile/defaultPicture.png"
                        }
                        icon={<UserOutlined />}
                        style={{ border: "3px solid #fff", display: "block" }}
                        onError={() => true}
                      />
                    </div>

                    <Title
                      level={5}
                      style={{ color: "#1e1b4b", marginBottom: 8 }}
                    >
                      {person.title
                        ? `${person.title}${person.name}`
                        : person.name}
                    </Title>

                    <Tag
                      color={roleColorMap[person.role] ?? "default"}
                      style={{
                        fontSize: 13,
                        padding: "2px 12px",
                        borderRadius: 999,
                        marginBottom: 10,
                      }}
                    >
                      {person.role}
                    </Tag>

                    <Paragraph
                      style={{
                        color: "#413d3d",
                        fontSize: 14,
                        marginBottom: 0,
                      }}
                    >
                      {person.specialty ?? "-"}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <div style={{display: "flex",justifyContent: "flex-end", textAlign: "center", marginTop: 40 }}>
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={staffList.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Card>

      {/* Staff Detail Modal */}
      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        centered
        width={480}
      >
        {selected && (
          <div style={{ textAlign: "center", padding: "16px 8px 8px" }}>
            <div
              style={{
                display: "inline-block",
                padding: 4,
                borderRadius: "50%",
                background: "#0f766e",
                marginBottom: 20,
              }}
            >
              <Avatar
                size={120}
                src={selected.image || "/docterProfile/defaultPicture.png"}
                icon={<UserOutlined />}
                style={{ border: "3px solid #fff", display: "block" }}
                onError={() => true}
              />
            </div>

            <Title level={4} style={{ color: "#1e1b4b", marginBottom: 6 }}>
              {selected.title
                ? `${selected.title}${selected.name}`
                : selected.name}
            </Title>

            <Tag
              color={roleColorMap[selected.role] ?? "default"}
              style={{
                fontSize: 14,
                padding: "2px 14px",
                borderRadius: 999,
                marginBottom: 20,
              }}
            >
              {selected.role}
            </Tag>

            <Divider style={{ margin: "0 0 16px" }} />

            <div
              style={{
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <PhoneOutlined
                  style={{ color: "#0f766e", fontSize: 16, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}
                  >
                    เบอร์โทร
                  </div>
                  <div style={{ fontSize: 15, color: "#1e1b4b" }}>
                    {selected.phone || "-"}
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <MailOutlined
                  style={{ color: "#0f766e", fontSize: 16, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}
                  >
                    อีเมลติดต่อ
                  </div>
                  <div style={{ fontSize: 15, color: "#1e1b4b" }}>
                    {selected.email || "-"}
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <BookOutlined
                  style={{ color: "#0f766e", fontSize: 16, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}
                  >
                    วุฒิการศึกษา
                  </div>
                  <div style={{ fontSize: 15, color: "#1e1b4b" }}>
                    {selected.degree || "-"}
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <SafetyCertificateOutlined
                  style={{ color: "#0f766e", fontSize: 16, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}
                  >
                    เลขใบอนุญาต
                  </div>
                  <div style={{ fontSize: 15, color: "#1e1b4b" }}>
                    {selected.license || "-"}
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <InfoCircleOutlined
                  style={{ color: "#0f766e", fontSize: 16, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}
                  >
                    ความเชี่ยวชาญ
                  </div>
                  <div style={{ fontSize: 15, color: "#1e1b4b" }}>
                    {selected.specialty || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;
