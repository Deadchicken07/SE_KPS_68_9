'use client'

import { useState } from "react";
import { Button, Card, DatePicker, Input, Modal, Spin, Tag, Typography } from "antd";
import {
  InfoCircleOutlined,
  PlusCircleOutlined,
  WifiOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { useStaffById } from "@/hooks/useStaffById";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

function AppointmentCard({ a, onConsult, onAddLink }: {
  a: any
  onConsult: () => void
  onAddLink: () => void
}) {
  const date = a.appointmentDate
    ? new Date(a.appointmentDate).toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" })
    : "-"

  return (
    <Card
      hoverable
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 8, borderWidth: 2 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography.Text style={{ fontWeight: 600, color: 'grey' }}>
            {date}
          </Typography.Text>
          <Typography.Text style={{ fontWeight: 600, color: 'grey' }}>
            {a.time_select ?? "-"}
          </Typography.Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Tag
            icon={a.appointmentType === "online" ? <WifiOutlined /> : <EnvironmentOutlined />}
            color={a.appointmentType === "online" ? "blue" : "grey"}
          >
            {a.appointmentType}
          </Tag>
          <InfoCircleOutlined
            style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
            onClick={onConsult}
          />
          {a.appointmentType === "online" && (
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
  const { me } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [link, setLink] = useState("");
  const { data, loading, error } = useStaffById(me?.sub ?? null, selectedDate);

  const appointments = (data ?? []).filter((a) => {
    if (!selectedDate) return true;
    const [, selMonth, selDay] = selectedDate.split("-");
    const d = new Date(a.appointmentDate);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return month === selMonth && day === selDay;
  });

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
                onConsult={() => router.push(`/staff/consult/history?userId=${a.patientId}`)}
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
