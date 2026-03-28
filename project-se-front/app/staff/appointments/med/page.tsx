'use client'

import { useState } from "react";
import { App, Button, Card, DatePicker, Input, Modal, Skeleton, Tag, Typography } from "antd";
import {
  InfoCircleOutlined,
  PlusCircleOutlined,
  WifiOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { useStaffById } from "@/hooks/useStaffById";
import { useMeetUrl } from "@/hooks/useMeetUrl";
import { useJitsiMeet } from "@/hooks/useJitsiMeet";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

function AppointmentCard({ a, onConsult, onAddLink, onViewLink }: {
  a: any
  onConsult: () => void
  onAddLink: () => void
  onViewLink: () => void
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
          <Typography.Text style={{ fontWeight: 600 }}>
            {a.patientName}
          </Typography.Text>
          <Typography.Text style={{ fontWeight: 600, color: 'grey' }}>
            {date}
          </Typography.Text>
          <Typography.Text style={{ fontWeight: 600, color: 'grey' }}>
            {a.timeSelect ?? "-"}
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
            a.meetUrl
              ? <LinkOutlined
                  style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
                  onClick={onViewLink}
                />
              : <PlusCircleOutlined
                  style={{ fontSize: 18, color: "#52c41a", cursor: "pointer" }}
                  onClick={onAddLink}
                />
          )}
        </div>
      </div>
    </Card>
  )
}

function PsychiatistPageInner() {
  const router = useRouter();
  const { me } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const { data, loading, error } = useStaffById(me?.sub ?? null, selectedDate, refresh);

  const meetUrl = useMeetUrl(() => setRefresh((r) => r + 1));
  const jitsi = useJitsiMeet();

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

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" onClick={jitsi.openJitsiModal}>
              สร้างห้องประชุม
            </Button>
          </div>

          <Card
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 12 }}
            styles={{ body: { display: "flex", flexDirection: "column", gap: 16 } }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <DatePicker
                onChange={(date: Dayjs | null) =>
                  setSelectedDate(date ? date.format("YYYY-MM-DD") : null)
                }
                placeholder="เลือกวันที่"
                style={{ width: 200 }}
              />
            </div>
            {loading && <Skeleton active paragraph={{ rows: 4 }} />}
            {error && <Typography.Text type="danger">{error}</Typography.Text>}

            {!loading && appointments.map((a) => (
              <AppointmentCard
                key={a.id}
                a={a}
                onConsult={() => router.push(`/staff/consult/history?userId=${a.patientId}`)}
                onAddLink={() => meetUrl.openAddModal(a.id)}
                onViewLink={() => meetUrl.openViewModal(a.meetUrl, a.id)}
              />
            ))}
          </Card>
        </div>
      </div>

      {/* Add link modal */}
      <Modal
        title="เพิ่มลิ้งค์"
        open={meetUrl.modalOpen}
        onCancel={meetUrl.closeAddModal}
        footer={[
          <Button key="cancel" onClick={meetUrl.closeAddModal}>ยกเลิก</Button>,
          <Button key="submit" type="primary" loading={meetUrl.linkLoading} onClick={meetUrl.handleAddLink}>เพิ่ม</Button>,
        ]}
      >
        <Input
          placeholder="วางลิ้งค์ที่นี่"
          value={meetUrl.link}
          onChange={(e) => meetUrl.setLink(e.target.value)}
        />
      </Modal>

      {/* Jitsi create modal */}
      <Modal
        title="สร้างห้องประชุม Jitsi"
        open={jitsi.jitsiModalOpen}
        onCancel={jitsi.closeJitsiModal}
        footer={[
          <Button key="cancel" onClick={jitsi.closeJitsiModal}>ยกเลิก</Button>,
          <Button key="submit" type="primary" loading={jitsi.jitsiLoading} onClick={jitsi.handleCreateJitsi}>ตกลง</Button>,
        ]}
      >
        <Input
          placeholder="ชื่อห้อง เช่น room-001"
          value={jitsi.roomNameInput}
          onChange={(e) => jitsi.setRoomNameInput(e.target.value)}
          onPressEnter={jitsi.handleCreateJitsi}
          style={{ marginTop: 8 }}
        />
      </Modal>

      {/* Jitsi result modal */}
      <Modal
        title={
          <span>
            <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
            สร้างห้องประชุมสำเร็จ
          </span>
        }
        open={jitsi.jitsiResultModalOpen}
        onCancel={() => jitsi.setJitsiResultModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => jitsi.setJitsiResultModalOpen(false)}>ปิด</Button>,
        ]}
      >
        {jitsi.jitsiResult && (
          <Card
            size="small"
            style={{ borderRadius: 8, borderColor: "#b7eb8f", background: "#f6ffed", marginTop: 8 }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <LinkOutlined style={{ color: "#52c41a", fontSize: 18, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <Typography.Text strong>{jitsi.jitsiResult.roomName}</Typography.Text>
                <br />
                <Typography.Link href={jitsi.jitsiResult.meetLink} target="_blank" style={{ fontSize: 13 }}>
                  {jitsi.jitsiResult.meetLink}
                </Typography.Link>
              </div>
            </div>
          </Card>
        )}
      </Modal>

      {/* View existing meet link modal */}
      <Modal
        title={
          <span>
            <LinkOutlined style={{ color: "#1677ff", marginRight: 8 }} />
            ลิ้งค์ห้องประชุม
          </span>
        }
        open={meetUrl.viewLinkModal}
        onCancel={meetUrl.closeViewModal}
        footer={[
          <Button key="close" onClick={meetUrl.closeViewModal}>ปิด</Button>,
          <Button key="delete" danger loading={meetUrl.deleteLinkLoading} onClick={meetUrl.handleDeleteLink}>ลบลิ้งค์</Button>,
          <Button key="open" type="primary" onClick={() => window.open(meetUrl.viewLinkUrl ?? "", "_blank")}>เปิดลิ้งค์</Button>,
        ]}
      >
        <Card
          size="small"
          style={{ borderRadius: 8, borderColor: "#91caff", background: "#e6f4ff", marginTop: 8 }}
        >
          <Typography.Link href={meetUrl.viewLinkUrl ?? ""} target="_blank">
            {meetUrl.viewLinkUrl}
          </Typography.Link>
        </Card>
      </Modal>
    </>
  );
}

export default function PsychiatistPage() {
  return (
    <App>
      <PsychiatistPageInner />
    </App>
  );
}
