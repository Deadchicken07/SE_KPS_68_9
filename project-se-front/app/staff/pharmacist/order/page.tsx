"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import type { AuthMeResponse } from "@/types/auth.types";
import { usePharmacistOrders } from "@/hooks/usePharmacistOrders";
import { receiptStatusSelectOptions } from "@/types/receipt-status.types";

const API_URL = "http://localhost:4000";

type OrderFormValues = {
  consultationId?: number;
  tracking?: string;
  status?: string;
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatCurrency = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : currencyFormatter.format(value);

const formatDateTime = (value: string | null) =>
  value ? dateFormatter.format(new Date(value)) : "-";

const buildDisplayName = (me: AuthMeResponse | null) => {
  const fullName = [me?.name, me?.sur_name].filter(Boolean).join(" ").trim();
  return fullName || "-";
};

export default function PharmacistOrderPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<OrderFormValues>();
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const { consultations, loading, saving, consultationOptions, createOrder } =
    usePharmacistOrders();

  const selectedConsultation = useMemo(
    () =>
      consultations.find(
        (consultation) => consultation.consultationId === selectedConsultationId,
      ) ?? null,
    [consultations, selectedConsultationId],
  );

  const total = useMemo(
    () =>
      (selectedConsultation?.suggestedItems ?? []).reduce(
        (sum, item) => sum + item.quantity * Number(item.unitPrice ?? 0),
        0,
      ),
    [selectedConsultation],
  );

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await axios.get<AuthMeResponse>(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        setMe(response.data);
      } catch {
        setMe(null);
      }
    };

    void fetchMe();
  }, []);

  useEffect(() => {
    if (consultations.length === 0) {
      setSelectedConsultationId(null);
      form.resetFields();
      return;
    }

    const nextConsultationId =
      selectedConsultationId &&
      consultations.some(
        (consultation) => consultation.consultationId === selectedConsultationId,
      )
        ? selectedConsultationId
        : consultations[0].consultationId;

    setSelectedConsultationId(nextConsultationId);
    form.setFieldsValue({
      consultationId: nextConsultationId,
      status: "pending",
      tracking: "",
    });
  }, [consultations, form, selectedConsultationId]);

  const handleConsultationChange = (consultationId: number) => {
    setSelectedConsultationId(consultationId);
    form.setFieldsValue({
      consultationId,
      status: "pending",
      tracking: "",
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (!values.consultationId) {
      messageApi.error("กรุณาเลือก consultation");
      return;
    }

    const result = await createOrder({
      consultationId: values.consultationId,
      tracking: values.tracking?.trim() || null,
      status: values.status?.trim() || "pending",
    });

    if (!result.ok) {
      messageApi.error(result.message);
      return;
    }

    messageApi.success(result.message);
  };

  return (
    <main className="staff-shell">
      {contextHolder}

      <section className="staff-page-header">
        <Typography.Text className="staff-kicker">
          STAFF / PHARMACIST / DELIVERY
        </Typography.Text>
        <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
          รายการที่ยังต้องจัดส่งยา
        </Typography.Title>
        <Typography.Text type="secondary">
          หน้านี้แสดงเฉพาะเคสที่ยังไม่มี tracking และยังไม่ถูกปิดงานแบบ onsite หรือ cancelled
        </Typography.Text>
      </section>

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={8}>
          <Card className="staff-content-card" variant="borderless" loading={loading}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="consultationId"
                label="Consultation"
                rules={[{ required: true, message: "กรุณาเลือก consultation" }]}
              >
                <Select
                  showSearch
                  placeholder="เลือก consultation"
                  options={consultationOptions}
                  onChange={handleConsultationChange}
                  optionFilterProp="label"
                  disabled={consultations.length === 0}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="ผลลัพธ์การจ่ายยา"
                rules={[{ required: true, message: "กรุณาเลือกผลลัพธ์" }]}
              >
                <Select
                  disabled={consultations.length === 0}
                  options={receiptStatusSelectOptions.filter(
                    (option) => option.value !== "delivered",
                  )}
                />
              </Form.Item>

              <Form.Item
                name="tracking"
                label="Tracking"
                extra="ถ้ากรอก tracking ระบบจะถือว่าเป็น delivered อัตโนมัติ"
              >
                <Input
                  placeholder="เช่น TH1234567890"
                  className="input"
                  disabled={consultations.length === 0}
                />
              </Form.Item>

              <Button
                type="primary"
                block
                loading={saving}
                disabled={consultations.length === 0}
                onClick={() => void handleSubmit()}
              >
                บันทึกการจัดส่ง
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <Card className="staff-content-card" variant="borderless" loading={loading}>
            {consultations.length === 0 ? (
              <Empty description="ไม่มีรายการที่ต้องจัดส่งในตอนนี้" />
            ) : selectedConsultation ? (
              <>
                <Descriptions
                  title="ข้อมูลเคส"
                  column={2}
                  colon={false}
                  items={[
                    {
                      key: "consultationId",
                      label: "Consultation",
                      children: `#${selectedConsultation.consultationId}`,
                    },
                    {
                      key: "patientName",
                      label: "ผู้ป่วย",
                      children: selectedConsultation.patientName,
                    },
                    {
                      key: "patientPhone",
                      label: "เบอร์โทร",
                      children: selectedConsultation.patientPhone ?? "-",
                    },
                    {
                      key: "patientAddress",
                      label: "ที่อยู่จัดส่ง",
                      children: selectedConsultation.patientAddress ?? "-",
                    },
                    {
                      key: "pharmacist",
                      label: "เภสัชกรผู้จัดการ",
                      children: buildDisplayName(me),
                    },
                    {
                      key: "createdAt",
                      label: "วันที่รักษา",
                      children: formatDateTime(selectedConsultation.createdAt),
                    },
                    {
                      key: "condition",
                      label: "โรคประจำตัว",
                      children: selectedConsultation.medicalCondition ?? "-",
                    },
                    {
                      key: "allergy",
                      label: "แพ้ยา",
                      children: selectedConsultation.allergyDrug ?? "-",
                    },
                    {
                      key: "latestStatus",
                      label: "สถานะล่าสุด",
                      children: selectedConsultation.latestReceiptStatus ?? "-",
                    },
                    {
                      key: "total",
                      label: "ยอดรวม",
                      children: formatCurrency(total),
                    },
                  ]}
                />

                <Divider />

                <Typography.Title level={4} style={{ marginTop: 0 }}>
                  รายการยาที่แพทย์สั่ง
                </Typography.Title>

                <Table
                  rowKey={(record) =>
                    `${record.medicationId ?? "med"}-${record.medicationName}`
                  }
                  pagination={false}
                  dataSource={selectedConsultation.suggestedItems}
                  columns={[
                    {
                      title: "ยา",
                      dataIndex: "medicationName",
                    },
                    {
                      title: "จำนวน",
                      dataIndex: "quantity",
                      width: 100,
                    },
                    {
                      title: "ราคาต่อหน่วย",
                      dataIndex: "unitPrice",
                      width: 160,
                      render: (value: number | null) => formatCurrency(value),
                    },
                    {
                      title: "รวม",
                      width: 160,
                      render: (_, record) =>
                        formatCurrency(record.quantity * Number(record.unitPrice ?? 0)),
                    },
                    {
                      title: "หมายเหตุ",
                      dataIndex: "comment",
                      render: (value: string | null) => value || "-",
                    },
                  ]}
                />
              </>
            ) : (
              <Empty description="เลือก consultation เพื่อดูรายละเอียด" />
            )}
          </Card>
        </Col>
      </Row>
    </main>
  );
}
