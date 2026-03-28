'use client'

import { useState } from "react";
import { Button, Card, DatePicker, Input, Modal, Spin, Tag, Typography } from "antd";
import {
  InfoCircleOutlined,
  PlusCircleOutlined,
  UserOutlined,
  WifiOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { useAppointment } from "@/hooks/useAppointment";
import { useRouter } from "next/navigation";

function AppointmentCard({ a, onConsult, onAddLink }: {
  a: any
  onConsult: () => void
  onAddLink: () => void
}) {
  const date = a.appointment_date
    ? new Date(a.appointment_date).toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" })
    : "-"

  return (
    <Card
      hoverable
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 8, borderWidth: 2 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UserOutlined style={{ color: "#1677ff" }} />
            <Typography.Text strong style={{ fontSize: 16 }}>
              {a.user ? `${a.user.name} ${a.user.sur_name}` : `ผู้ป่วย #${a.user_id}`}
            </Typography.Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Typography.Text  style={{ fontWeight: 600, color :  'grey' }}>
              {date}
            </Typography.Text>
            <Typography.Text  style={{ fontWeight: 600,  color : 'grey'}}>
              {a.time_select ?? "-"}
            </Typography.Text>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Tag
            icon={a.appointment_type === "online" ? <WifiOutlined /> : <EnvironmentOutlined />}
            color={a.appointment_type === "online" ? "blue" : "grey"}
          >
            {a.appointment_type}
          </Tag>
          <InfoCircleOutlined
            style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
            onClick={onConsult}
          />
          {a.appointment_type === "online" && (
            <PlusCircleOutlined
              style={{ fontSize: 18, color: "#52c41a", cursor: "pointer" }}
              onClick={onAddLink}
            />
          )}
        </div>
      </div>
    </Card>
  )
}

export default function PsychiatistPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [link, setLink] = useState("");
  const { data, loading, error } = useAppointment(selectedDate);

  const appointments = data ?? [];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "80%", display: "flex", flexDirection: "column", gap: 16 }}>
          <Card
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 12 }}
            styles={{ body: { display: "flex", flexDirection: "column", gap: 16 } }}
          >
            <DatePicker
              onChange={(date: Dayjs | null) =>
                setSelectedDate(date ? date.format("YYYY-MM-DD") : null)
              }
              placeholder="เลือกวันที่"
              style={{ width: 200 }}
            />

            {loading && <Spin />}
            {error && <Typography.Text type="danger">{error}</Typography.Text>}

            {!loading && appointments.map((a) => (
              <AppointmentCard
                key={a.id}
                a={a}
                onConsult={() => router.push(`/staff/consult/history?userId=${a.user_id}`)}
                onAddLink={() => setModalOpen(true)}
              />
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
