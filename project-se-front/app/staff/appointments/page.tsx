"use client";

import { useState } from "react";
import { Button, Card, DatePicker, Input, Modal, Tag, Typography } from "antd";
import {
  ClockCircleOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  UserOutlined,
  WifiOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { mockAppointments } from "@/hooks/useAppointment";
import { useRouter } from "next/navigation";

const MOCK_STAFF_ID = 5;

export default function PsychiatistPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [link, setLink] = useState("");

  const appointments = mockAppointments.filter(
    (a) =>
      a.staff_id === MOCK_STAFF_ID &&
      (selectedDate ? a.appointment_date.startsWith(selectedDate) : true),
  );

  return (
    <>
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      <div
        style={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
      <Card style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 12 }} styles={{ body: { display: "flex", flexDirection: "column", gap: 16 } }}>
        <DatePicker
          onChange={(date: Dayjs | null) =>
            setSelectedDate(date ? date.format("YYYY-MM-DD") : null)
          }
          placeholder="เลือกวันที่"
          style={{ width: 200 }}
        />
        {appointments.map((a) => (
          <Card key={a.id} hoverable style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 8 ,borderWidth : 2,}}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <UserOutlined style={{ color: "#1677ff" }} />
                  <Typography.Text strong style={{ fontSize: 16 }}>
                    ผู้ป่วย #{a.user_id}
                  </Typography.Text>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ClockCircleOutlined style={{ color: "#8c8c8c", gap: 6 }} />
                <Typography.Text type="secondary">
                  {a.time_select}
                </Typography.Text>
                <Tag
                  icon={
                    a.appointment_type === "online" ? (
                      <WifiOutlined />
                    ) : (
                      <EnvironmentOutlined />
                    )
                  }
                  color={a.appointment_type === "online" ? "blue" : "grey"}
                >
                  {a.appointment_type}
                </Tag>
                <InfoCircleOutlined
                  style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
                  onClick={() => router.push(`/staff/consult`)}
                />
                {a.appointment_type === "online" && (
                  <PlusCircleOutlined
                    style={{ fontSize: 18, color: "#52c41a", cursor: "pointer" }}
                    onClick={() => setModalOpen(true)}
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
        </Card>
      </div>
    </div>

    <Modal
      title="เพิ่มลิ้งค์"
      open={modalOpen}
      onCancel={() => { setModalOpen(false); setLink(""); }}
      footer={[
        <Button key="cancel" onClick={() => { setModalOpen(false); setLink(""); }}>ยกเลิก</Button>,
        <Button key="submit" type="primary" onClick={() => { setModalOpen(false); setLink(""); }}>เพิ่ม</Button>,
      ]}
    >
      <Input
        placeholder="วางลิ้งค์ที่นี่"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
    </Modal>
    </>
  );
}
