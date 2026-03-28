"use client";

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
  Popconfirm,
  Row,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePharmacistOrders } from "@/hooks/usePharmacistOrders";
import {
  receiptStatusColorMap,
  type ReceiptStatus,
} from "@/types/receipt-status.types";

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

const formatCurrency = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : currencyFormatter.format(value);

const formatDateTime = (value: string | null) =>
  value ? dateFormatter.format(new Date(value)) : "-";

const buildDisplayName = (
  me: { name?: string | null; sur_name?: string | null } | null,
) => {
  const fullName = [me?.name, me?.sur_name].filter(Boolean).join(" ").trim();
  return fullName || "-";
};

const renderStatusTag = (status: string | null) => {
  if (!status) {
    return "-";
  }

  const typedStatus = status as ReceiptStatus;
  return <Tag color={receiptStatusColorMap[typedStatus] ?? "default"}>{status}</Tag>;
};

export default function PharmacistOrderPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<OrderFormValues>();
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const { me } = useAuth();
  const { consultations, loading, saving, consultationOptions, createOrder } =
    usePharmacistOrders();

  const paidConsultations = useMemo(
    () =>
      consultations.filter(
        (consultation) =>
          consultation.latestPaymentStatus === "Paid" &&
          (consultation.latestReceiptStatus === "pending_delivery" ||
            consultation.latestReceiptStatus === "pending_pickup"),
      ),
    [consultations],
  );

  const paidConsultationOptions = useMemo(
    () =>
      consultationOptions.filter((option) =>
        paidConsultations.some(
          (consultation) => consultation.consultationId === option.value,
        ),
      ),
    [consultationOptions, paidConsultations],
  );

  const requestedConsultationId = useMemo(() => {
    const value = searchParams.get("consultationId");

    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const selectedConsultation = useMemo(
    () =>
      paidConsultations.find(
        (consultation) => consultation.consultationId === selectedConsultationId,
      ) ?? null,
    [paidConsultations, selectedConsultationId],
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
    if (paidConsultations.length === 0) {
      if (selectedConsultationId !== null) {
        setSelectedConsultationId(null);
      }
      form.resetFields();
      return;
    }

    const nextConsultationId =
      selectedConsultationId &&
      paidConsultations.some(
        (consultation) => consultation.consultationId === selectedConsultationId,
      )
        ? selectedConsultationId
        : requestedConsultationId &&
            paidConsultations.some(
              (consultation) =>
                consultation.consultationId === requestedConsultationId,
            )
          ? requestedConsultationId
        : paidConsultations[0].consultationId;

    if (selectedConsultationId !== nextConsultationId) {
      setSelectedConsultationId(nextConsultationId);
      form.setFieldsValue({
        consultationId: nextConsultationId,
        tracking: "",
      });
      return;
    }

    if (form.getFieldValue("consultationId") !== nextConsultationId) {
      form.setFieldValue("consultationId", nextConsultationId);
    }
  }, [form, paidConsultations, requestedConsultationId, selectedConsultationId]);

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
          รายการที่ยังต้องจัดการส่งยา
        </Typography.Title>
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
                  options={paidConsultationOptions}
                  onChange={handleConsultationChange}
                  optionFilterProp="label"
                  disabled={paidConsultations.length === 0}
                />
              </Form.Item>

              {isPendingDelivery ? (
                <Form.Item name="tracking" label="Tracking">
                  <Input
                    placeholder="เช่น TH1234567890"
                    className="input"
                    disabled={paidConsultations.length === 0}
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
                ]}
              />

              <Divider />

              <div style={{ display: "grid", gap: 12 }}>
                {isPendingDelivery ? (
                  <Button
                    type="primary"
                    block
                    loading={saving}
                    disabled={paidConsultations.length === 0}
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
                    disabled={paidConsultations.length === 0}
                    onClick={() => void handleSubmit("picked_up")}
                  >
                    ยืนยันรับยาแล้ว
                  </Button>
                ) : null}

                <Popconfirm
                  title="ยืนยันการยกเลิกรายการ"
                  description="ใช้เฉพาะกรณียกเลิกรายการจริง ไม่ใช่กรณีส่งไม่ถึง"
                  okText="ยืนยัน"
                  cancelText="ยกเลิก"
                  onConfirm={() => void handleSubmit("cancelled")}
                  disabled={!selectedConsultation}
                >
                  <Button block disabled={paidConsultations.length === 0}>
                    ยกเลิกรายการ
                  </Button>
                </Popconfirm>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <Card className="staff-content-card" variant="borderless" loading={loading}>
            {paidConsultations.length === 0 ? (
              <Empty description="ไม่มีรายการที่ต้องจัดการในตอนนี้" />
            ) : selectedConsultation ? (
              <>
                <Descriptions
                  title="ข้อมูลเคส"
                  column={2}
                  colon={false}
                  items={[
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
