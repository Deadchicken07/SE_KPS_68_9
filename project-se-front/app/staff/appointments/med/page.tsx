'use client'

import { useState } from "react";
import { App, Button, Card, DatePicker, Input, Modal, Skeleton, Tag, Typography } from "antd";
import {
  InfoCircleOutlined,
  PlusCircleOutlined,
  WifiOutlined,
  EnvironmentOutlined,
  VideoCameraAddOutlined,
  LinkOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import type { Dayjs } from "dayjs";
import { useStaffById } from "@/hooks/useStaffById";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface JitsiResult {
  message: string
  roomName: string
  meetLink: string
}

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
  const { message } = App.useApp();
  const router = useRouter();
  const { me } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [link, setLink] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [viewLinkModal, setViewLinkModal] = useState(false);
  const [viewLinkUrl, setViewLinkUrl] = useState<string | null>(null);
  const [viewLinkAppointmentId, setViewLinkAppointmentId] = useState<number | null>(null);
  const [deleteLinkLoading, setDeleteLinkLoading] = useState(false);

  const [jitsiModalOpen, setJitsiModalOpen] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [jitsiLoading, setJitsiLoading] = useState(false);
  const [jitsiResult, setJitsiResult] = useState<JitsiResult | null>(null);
  const [jitsiResultModalOpen, setJitsiResultModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const { data, loading, error } = useStaffById(me?.sub ?? null, selectedDate, refresh);

  const appointments = (data ?? []).filter((a) => {
    if (!selectedDate) return true;
    const [, selMonth, selDay] = selectedDate.split("-");
    const d = new Date(a.appointmentDate);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return month === selMonth && day === selDay;
  });

  const handleAddLink = async () => {
    if (!link.trim()) {
      message.warning("กรุณากรอกลิ้งค์");
      return;
    }
    if (!selectedAppointmentId) return;
    setLinkLoading(true);
    try {
      await axios.patch(
        `${API_URL}/appointments/${selectedAppointmentId}/meet-url`,
        { meetUrl: link.trim() },
        { withCredentials: true },
      );
      message.success("เพิ่มลิ้งค์สำเร็จ");
      setModalOpen(false);
      setLink("");
      setSelectedAppointmentId(null);
      setRefresh((r) => r + 1);
    } catch {
      message.error("ไม่สามารถเพิ่มลิ้งค์ได้");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!viewLinkAppointmentId) return;
    setDeleteLinkLoading(true);
    try {
      await axios.patch(
        `${API_URL}/appointments/${viewLinkAppointmentId}/meet-url/delete`,
        {},
        { withCredentials: true },
      );
      message.success("ลบลิ้งค์สำเร็จ");
      setViewLinkModal(false);
      setViewLinkUrl(null);
      setViewLinkAppointmentId(null);
      setRefresh((r) => r + 1);
    } catch {
      message.error("ไม่สามารถลบลิ้งค์ได้");
    } finally {
      setDeleteLinkLoading(false);
    }
  };

  const handleCreateJitsi = async () => {
    if (!roomNameInput.trim()) {
      message.warning("กรุณากรอกชื่อห้อง");
      return;
    }
    setJitsiLoading(true);
    try {
      const res = await axios.post<JitsiResult>(
        `${API_URL}/jitsi-meet/create`,
        { roomName: roomNameInput.trim() },
        { withCredentials: true },
      );
      const result = res.data;
      setJitsiResult(result);
      setJitsiModalOpen(false);
      setJitsiResultModalOpen(true);
      setRoomNameInput("");
    } catch {
      message.error("ไม่สามารถสร้างลิ้งค์ได้");
    } finally {
      setJitsiLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "80%", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              onClick={() => setJitsiModalOpen(true)}
            >
              สร้างห้องประชุม
            </Button>
          </div>

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

            {loading && <Skeleton active paragraph={{ rows: 4 }} />}
            {error && <Typography.Text type="danger">{error}</Typography.Text>}

            {!loading && appointments.map((a) => (
              <AppointmentCard
                key={a.id}
                a={a}
                onConsult={() => router.push(`/staff/consult/history?userId=${a.patientId}`)}
                onAddLink={() => { setSelectedAppointmentId(a.id); setModalOpen(true); }}
                onViewLink={() => { setViewLinkUrl(a.meetUrl); setViewLinkAppointmentId(a.id); setViewLinkModal(true); }}
              />
            ))}
          </Card>
        </div>
      </div>

      {/* Existing add link modal */}
      <Modal
        title="เพิ่มลิ้งค์"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setLink(""); }}
        footer={[
          <Button key="cancel" onClick={() => { setModalOpen(false); setLink(""); }}>ยกเลิก</Button>,
          <Button key="submit" type="primary" loading={linkLoading} onClick={handleAddLink}>เพิ่ม</Button>,
        ]}
      >
        <Input
          placeholder="วางลิ้งค์ที่นี่"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </Modal>

      {/* Jitsi create modal */}
      <Modal
        title="สร้างห้องประชุม Jitsi"
        open={jitsiModalOpen}
        onCancel={() => { setJitsiModalOpen(false); setRoomNameInput(""); }}
        footer={[
          <Button key="cancel" onClick={() => { setJitsiModalOpen(false); setRoomNameInput(""); }}>
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={jitsiLoading}
            onClick={handleCreateJitsi}
          >
            ตกลง
          </Button>,
        ]}
      >
        <Input
          placeholder="ชื่อห้อง เช่น room-001"
          value={roomNameInput}
          onChange={(e) => setRoomNameInput(e.target.value)}
          onPressEnter={handleCreateJitsi}
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
        open={jitsiResultModalOpen}
        onCancel={() => setJitsiResultModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setJitsiResultModalOpen(false)}>
            ปิด
          </Button>,
        ]}
      >
        {jitsiResult && (
          <Card
            size="small"
            style={{ borderRadius: 8, borderColor: "#b7eb8f", background: "#f6ffed", marginTop: 8 }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <LinkOutlined style={{ color: "#52c41a", fontSize: 18, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <Typography.Text strong>{jitsiResult.roomName}</Typography.Text>
                <br />
                <Typography.Link href={jitsiResult.meetLink} target="_blank" style={{ fontSize: 13 }}>
                  {jitsiResult.meetLink}
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
        open={viewLinkModal}
        onCancel={() => setViewLinkModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewLinkModal(false)}>ปิด</Button>,
          <Button
            key="delete"
            danger
            loading={deleteLinkLoading}
            onClick={handleDeleteLink}
          >
            ลบลิ้งค์
          </Button>,
          <Button
            key="open"
            type="primary"
            onClick={() => { window.open(viewLinkUrl ?? "", "_blank"); }}
          >
            เปิดลิ้งค์
          </Button>,
        ]}
      >
        <Card
          size="small"
          style={{ borderRadius: 8, borderColor: "#91caff", background: "#e6f4ff", marginTop: 8 }}
        >
          <Typography.Link href={viewLinkUrl ?? ""} target="_blank">
            {viewLinkUrl}
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
