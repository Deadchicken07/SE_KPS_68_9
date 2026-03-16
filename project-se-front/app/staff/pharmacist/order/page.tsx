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
  Table,
  Tag,
  Typography,
  message,
  Popconfirm,
  Select,
} from "antd";
import type { AuthMeResponse } from "@/types/auth.types";
import { usePharmacistOrders } from "@/hooks/usePharmacistOrders";
import {
  receiptStatusColorMap,
  type ReceiptStatus,
} from "@/types/receipt-status.types";
import type { OrderFormConsultation } from "@/types/pharmacist.types";

const API_URL = "http://localhost:4000";

type OrderFormValues = {
  consultationId?: number;
  tracking?: string;
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

const mockConsultations: OrderFormConsultation[] = [
  {
    consultationId: 145,
    patientId: 2201,
    patientName: "สมหญิง ใจดี",
    patientPhone: "089-123-4567",
    patientAddress:
      "170/6 ถนนประดิพัทธ์ แขวงพญาไท เขตพญาไท กรุงเทพมหานคร 10400",
    medicalCondition: "Major depressive disorder",
    allergyDrug: "Penicillin",
    pharmacistId: 501,
    pharmacistName: "ภญ.กมลชนก สุขใจ",
    note: "ติดตามอาการ 2 สัปดาห์ และประเมินคุณภาพการนอน",
    createdAt: "2026-03-16T10:30:00.000Z",
    latestReceiptStatus: "pending_delivery",
    receiptCount: 1,
    suggestedItems: [
      {
        medicationId: 3,
        medicationName: "Fluoxetine 20 mg",
        quantity: 30,
        unitPrice: 15,
        comment: "หลังอาหารเช้า",
      },
      {
        medicationId: 8,
        medicationName: "Clonazepam 0.5 mg",
        quantity: 10,
        unitPrice: 7,
        comment: "ก่อนนอน",
      },
    ],
  },
  {
    consultationId: 146,
    patientId: 2202,
    patientName: "วิภา รุ่งเรือง",
    patientPhone: "081-223-9988",
    patientAddress: "55 ซอยงามดูพลี เขตสาทร กรุงเทพมหานคร 10120",
    medicalCondition: "Generalized anxiety disorder",
    allergyDrug: "ไม่มี",
    pharmacistId: 501,
    pharmacistName: "ภญ.กมลชนก สุขใจ",
    note: "ติดตามอาการใจสั่นและความกังวล",
    createdAt: "2026-03-15T09:15:00.000Z",
    latestReceiptStatus: "pending_delivery",
    receiptCount: 1,
    suggestedItems: [
      {
        medicationId: 11,
        medicationName: "Sertraline 50 mg",
        quantity: 30,
        unitPrice: 12,
        comment: "หลังอาหารเช้า",
      },
    ],
  },
  {
    consultationId: 147,
    patientId: 2203,
    patientName: "สมชาย กิจเจริญ",
    patientPhone: "086-765-4321",
    patientAddress: "99/14 หมู่บ้านพฤกษา บางบัวทอง นนทบุรี 11110",
    medicalCondition: "Insomnia",
    allergyDrug: "Ibuprofen",
    pharmacistId: 501,
    pharmacistName: "ภญ.กมลชนก สุขใจ",
    note: "คนไข้มารับยาที่คลินิก",
    createdAt: "2026-03-14T13:45:00.000Z",
    latestReceiptStatus: "pending_pickup",
    receiptCount: 1,
    suggestedItems: [
      {
        medicationId: 18,
        medicationName: "Melatonin 3 mg",
        quantity: 14,
        unitPrice: 9,
        comment: "ก่อนนอน 30 นาที",
      },
      {
        medicationId: 19,
        medicationName: "Hydroxyzine 10 mg",
        quantity: 14,
        unitPrice: 6,
        comment: "ใช้เมื่อมีอาการกังวล",
      },
    ],
  },
  {
    consultationId: 148,
    patientId: 2204,
    patientName: "กนกวรรณ แซ่ลิ้ม",
    patientPhone: "095-412-7788",
    patientAddress: "12 ถนนสุขุมวิท 71 เขตวัฒนา กรุงเทพมหานคร 10110",
    medicalCondition: "Panic disorder",
    allergyDrug: "Sulfa",
    pharmacistId: 501,
    pharmacistName: "ภญ.กมลชนก สุขใจ",
    note: "จัดส่งด่วนภายในวันนี้",
    createdAt: "2026-03-16T08:10:00.000Z",
    latestReceiptStatus: "pending_delivery",
    receiptCount: 1,
    suggestedItems: [
      {
        medicationId: 21,
        medicationName: "Escitalopram 10 mg",
        quantity: 30,
        unitPrice: 14,
        comment: "หลังอาหารเย็น",
      },
      {
        medicationId: 22,
        medicationName: "Alprazolam 0.25 mg",
        quantity: 10,
        unitPrice: 5,
        comment: "ใช้เมื่อมีอาการ panic",
      },
    ],
  },
  {
    consultationId: 149,
    patientId: 2205,
    patientName: "ชุติมา แก้วตา",
    patientPhone: "082-900-1112",
    patientAddress: "88/9 ถนนประชาราษฎร์ สาย 2 บางซื่อ กรุงเทพมหานคร 10800",
    medicalCondition: "Adjustment disorder",
    allergyDrug: "ไม่มี",
    pharmacistId: 501,
    pharmacistName: "ภญ.กมลชนก สุขใจ",
    note: "รับยา onsite หลังพบแพทย์",
    createdAt: "2026-03-13T16:20:00.000Z",
    latestReceiptStatus: "pending_pickup",
    receiptCount: 1,
    suggestedItems: [
      {
        medicationId: 24,
        medicationName: "Propranolol 10 mg",
        quantity: 20,
        unitPrice: 4,
        comment: "ใช้เมื่อใจสั่น",
      },
    ],
  },
];

const formatCurrency = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : currencyFormatter.format(value);

const formatDateTime = (value: string | null) =>
  value ? dateFormatter.format(new Date(value)) : "-";

const buildDisplayName = (me: AuthMeResponse | null) => {
  const fullName = [me?.name, me?.sur_name].filter(Boolean).join(" ").trim();
  return fullName || "-";
};

const renderStatusTag = (status: string | null) => {
  if (!status) {
    return "-";
  }

  const typedStatus = status as ReceiptStatus;
  const color = receiptStatusColorMap[typedStatus] ?? "default";

  return <Tag color={color}>{status}</Tag>;
};

export default function PharmacistOrderPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<OrderFormValues>();
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const { consultations, loading, saving, consultationOptions, createOrder } =
    usePharmacistOrders();

  const displayConsultations = consultations.length > 0 ? consultations : mockConsultations;
  const displayConsultationOptions =
    consultationOptions.length > 0
      ? consultationOptions
      : displayConsultations.map((consultation) => ({
          label: `#${consultation.consultationId} ${consultation.patientName}`,
          value: consultation.consultationId,
        }));

  const selectedConsultation = useMemo(
    () =>
      displayConsultations.find(
        (consultation) => consultation.consultationId === selectedConsultationId,
      ) ?? null,
    [displayConsultations, selectedConsultationId],
  );

  const currentStatus = (selectedConsultation?.latestReceiptStatus ??
    "pending_delivery") as ReceiptStatus;
  const isPendingDelivery = currentStatus === "pending_delivery";
  const isPendingPickup = currentStatus === "pending_pickup";

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
    if (displayConsultations.length === 0) {
      setSelectedConsultationId(null);
      form.resetFields();
      return;
    }

    const nextConsultationId =
      selectedConsultationId &&
      displayConsultations.some(
        (consultation) => consultation.consultationId === selectedConsultationId,
      )
        ? selectedConsultationId
        : displayConsultations[0].consultationId;

    setSelectedConsultationId(nextConsultationId);
    form.setFieldsValue({
      consultationId: nextConsultationId,
      tracking: "",
    });
  }, [displayConsultations, form, selectedConsultationId]);

  const handleConsultationChange = (consultationId: number) => {
    setSelectedConsultationId(consultationId);
    form.setFieldsValue({
      consultationId,
      tracking: "",
    });
  };

  const handleSubmit = async (status: ReceiptStatus) => {
    const values = await form.validateFields();

    if (!values.consultationId) {
      messageApi.error("กรุณาเลือก consultation");
      return;
    }

    if (status === "delivered" && !values.tracking?.trim()) {
      messageApi.error("กรุณากรอก tracking ก่อนบันทึกการส่ง");
      return;
    }

    if (consultations.length === 0) {
      messageApi.success("กำลังแสดง mock data สำหรับดูหน้าตา หน้านี้ยังไม่บันทึกข้อมูลจริง");
      return;
    }

    const result = await createOrder({
      consultationId: values.consultationId,
      tracking: status === "delivered" ? values.tracking?.trim() || null : null,
      status,
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
          เคสส่งออนไลน์จะกรอกเฉพาะ tracking ส่วนเคส onsite จะยืนยันว่ารับยาแล้ว และการยกเลิกใช้เฉพาะกรณียกเลิกรายการจริง
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
                  options={displayConsultationOptions}
                  onChange={handleConsultationChange}
                  optionFilterProp="label"
                  disabled={displayConsultations.length === 0}
                />
              </Form.Item>

              {isPendingDelivery ? (
                <Form.Item
                  name="tracking"
                  label="Tracking"
                  extra="กรอกเลขพัสดุแล้วระบบจะบันทึกเป็น delivered"
                >
                  <Input
                    placeholder="เช่น TH1234567890"
                    className="input"
                    disabled={displayConsultations.length === 0}
                  />
                </Form.Item>
              ) : null}

              <Descriptions
                size="small"
                column={1}
                colon={false}
                items={[
                  {
                    key: "flow",
                    label: "รูปแบบงาน",
                    children: isPendingPickup ? "รับยาที่คลินิก" : "จัดส่งออนไลน์",
                  },
                  {
                    key: "status",
                    label: "สถานะปัจจุบัน",
                    children: renderStatusTag(selectedConsultation?.latestReceiptStatus ?? null),
                  },
                ]}
              />

              <Divider />

              <div style={{ display: "grid", gap: 12 }}>
                {isPendingDelivery ? (
                  <Button
                    type="primary"
                    block
                    loading={saving}
                    disabled={displayConsultations.length === 0}
                    onClick={() => void handleSubmit("delivered")}
                  >
                    บันทึกการส่ง
                  </Button>
                ) : null}

                {isPendingPickup ? (
                  <Button
                    type="primary"
                    block
                    loading={saving}
                    disabled={displayConsultations.length === 0}
                    onClick={() => void handleSubmit("picked_up")}
                  >
                    ยืนยันรับยาแล้ว
                  </Button>
                ) : null}

                <Popconfirm
                  title="ยืนยันการยกเลิกรายการ"
                  description="ใช้เฉพาะกรณียกเลิกรายการจริง ไม่ใช่กรณีส่งไม่ถึง"
                  okText="ยืนยัน"
                  cancelText="ย้อนกลับ"
                  onConfirm={() => void handleSubmit("cancelled")}
                  disabled={!selectedConsultation}
                >
                  <Button danger block disabled={displayConsultations.length === 0}>
                    ยกเลิกรายการ
                  </Button>
                </Popconfirm>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <Card className="staff-content-card" variant="borderless" loading={loading}>
            {selectedConsultation ? (
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
                      children:
                        buildDisplayName(me) !== "-"
                          ? buildDisplayName(me)
                          : selectedConsultation.pharmacistName,
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
                      children: renderStatusTag(selectedConsultation.latestReceiptStatus),
                    },
                    {
                      key: "total",
                      label: "ยอดรวม",
                      children: formatCurrency(total),
                    },
                    {
                      key: "note",
                      label: "หมายเหตุจากการรักษา",
                      children: selectedConsultation.note ?? "-",
                    },
                  ]}
                />

                <Divider />

                <Typography.Title level={4} style={{ marginTop: 0 }}>
                  รายการยาที่แพทย์สั่ง
                </Typography.Title>

                <Table
                  rowKey={(record) => `${record.medicationId ?? "med"}-${record.medicationName}`}
                  pagination={false}
                  dataSource={selectedConsultation.suggestedItems}
                  locale={{ emptyText: <Empty description="ไม่มีรายการยา" /> }}
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
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Typography.Text strong>รวมทั้งหมด</Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Typography.Text strong>{formatCurrency(total)}</Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  )}
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
