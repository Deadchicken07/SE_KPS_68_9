"use client";

import { useState } from "react";
import {
  Card,
  Select,
  Input,
  Button,
  Typography,
  Spin,
  InputNumber,
  Divider,
  Switch,
  message,
} from "antd";
import {
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { useUser } from "@/hooks/useUsers";
import { useConsultation } from "@/hooks/useConsultation";
import { useAuth } from "@/components/providers/AuthProvider";
import { PrescriptionFormItem } from "@/types/consult.types";
import { useSearchParams } from "next/navigation";
import { usePharmacistMedications } from "@/hooks/usePharmacistMedications";

const { TextArea } = Input;

let nextId = 1;

export default function ConsultPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { user, loading } = useUser();
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionFormItem[]>(
    [],
  );
  const { me } = useAuth();
  const canPrescribe = me?.role !== 'psychologist';
  const { createConsultation } = useConsultation();
  const { medications, medicationsLoading } = usePharmacistMedications();
  const searchParams = useSearchParams();
  const userIdFromQuery = Number(searchParams.get("userId")) || null;
  const [selectedUser, setSelectedUser] = useState<number | null>(
    userIdFromQuery,
  );
  const [isOnline, setIsOnline] = useState(false);

  const userOptions = user.map((u) => ({
    value: u.user_id,
    label: `${u.name} ${u.sur_name}`,
  }));

  const addPrescription = () => {
    setPrescriptions((prev) => [
      ...prev,
      { id: nextId++, medication_id: null, quantity: null, comment: "" },
    ]);
  };

  const updatePrescription = (
    id: number,
    field: keyof PrescriptionFormItem,
    value: unknown,
  ) => {
    setPrescriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const removePrescription = (id: number) => {
    setPrescriptions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = async () => {
    if (!selectedUser || !note.trim() || !me) return;
    setSending(true);

    const success = await createConsultation({
      user_id: selectedUser,
      staff_id: me.sub,
      note,
      is_online: isOnline,
      prescription_item: prescriptions.map((p) => ({
        medication_id: p.medication_id!,
        quantity: p.quantity!,
        comment: p.comment,
      })),
    });

    setSending(false);
    setNote("");
    setSelectedUser(null);
    setPrescriptions([]);

    if (success) {
      messageApi.success("บันทึกการปรึกษาสำเร็จ");
    } else {
      messageApi.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      {contextHolder}
      <div
        style={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Card
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 12 }}
          styles={{
            body: { display: "flex", flexDirection: "column", gap: 16 },
          }}
        >
          <Typography.Title
            level={3}
            style={{ marginBottom: 0, color: "#0f172a" }}
          >
            บันทึกการปรึกษา
          </Typography.Title>

          <Typography.Text style={{ fontWeight: 500, color: "#374151" }}>
            เลือกผู้ป่วย
          </Typography.Text>
          <Select
            showSearch={{
              filterOption: (input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
            placeholder="ค้นหาหรือเลือกผู้ป่วย"
            style={{ width: "100%" }}
            options={userOptions}
            loading={loading}
            onChange={(val) => setSelectedUser(val)}
            value={selectedUser}
            disabled={!!userIdFromQuery}
            notFoundContent={loading ? <Spin size="small" /> : "ไม่พบข้อมูล"}
            size="large"
          />

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Switch checked={isOnline} onChange={setIsOnline} />
            <Typography.Text style={{ color: "#374151" }}>
              {isOnline ? "ออนไลน์ (จัดส่ง)" : "มาพบด้วยตนเอง (รับที่คลินิก)"}
            </Typography.Text>
          </div>

          <Typography.Text style={{ fontWeight: 500, color: "#374151" }}>
            บันทึก / Note
          </Typography.Text>
          <TextArea
            placeholder="เขียนบันทึกการปรึกษา..."
            rows={6}
            style={{ resize: "none", borderRadius: 8, fontSize: 15 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {canPrescribe && (
          <>
          <Divider style={{ margin: "4px 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MedicineBoxOutlined style={{ color: "#0f766e", fontSize: 16 }} />
              <Typography.Text style={{ fontWeight: 500, color: "#374151" }}>
                รายการยา
              </Typography.Text>
            </div>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addPrescription}
              style={{ borderColor: "#0f766e", color: "#0f766e" }}
            >
              เพิ่มยา
            </Button>
          </div>

          {prescriptions.length > 0 && (

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Header */}
              <div style={{ display: "flex", gap: 12, paddingInline: 4 }}>
                <Typography.Text
                  type="secondary"
                  style={{ flex: 3, fontSize: 12 }}
                >
                  ยา
                </Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ width: 100, fontSize: 12 }}
                >
                  จำนวน
                </Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ flex: 2, fontSize: 12 }}
                >
                  หมายเหตุ
                </Typography.Text>
                <div style={{ width: 32 }} />
              </div>

              {prescriptions.map((item) => (
                <div
                  key={item.id}
                  style={{ display: "flex", gap: 12, alignItems: "center" }}
                >
                  {/* ยา */}
                  <Select
                    showSearch={{
                      filterOption: (input, option) =>
                        String(option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase()),
                    }}
                    placeholder="ค้นหายา"
                    style={{ flex: 3 }}
                    options={medications.map((m) => ({ value: m.id, label: m.name }))}
                    loading={medicationsLoading}
                    value={item.medication_id}
                    onChange={(val) =>
                      updatePrescription(item.id, "medication_id", val)
                    }
                    notFoundContent="ไม่พบยา"
                  />
                  <InputNumber
                    min={1}
                    placeholder="จำนวน"
                    style={{ width: 100 }}
                    value={item.quantity}
                    onChange={(val) =>
                      updatePrescription(item.id, "quantity", val)
                    }
                  />
                  <Input
                    placeholder="หมายเหตุ"
                    style={{ flex: 2 }}
                    value={item.comment}
                    onChange={(e) =>
                      updatePrescription(item.id, "comment", e.target.value)
                    }
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removePrescription(item.id)}
                    style={{ width: 32, padding: 0 }}
                  />
                </div>
              ))}
            </div>
          )}
          </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              loading={sending}
              disabled={!selectedUser || !note.trim()}
              onClick={handleSend}
              style={{
                background: "#0f766e",
                border: "none",
                borderRadius: 12,
                paddingInline: 28,
              }}
            >
              ส่ง
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
