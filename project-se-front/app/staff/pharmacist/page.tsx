"use client";

import type { ColumnsType } from "antd/es/table";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Space, Table, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { usePharmacistMedications, type MedicationFormValues } from "@/hooks/usePharmacistMedications";
import type { Medication } from "@/types/pharmacist.types";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number | null) =>
  value === null ? "-" : currencyFormatter.format(value);

export default function PharmacistMedicationPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [medicationForm] = Form.useForm<MedicationFormValues>();
  const {
    medications,
    medicationsLoading,
    savingMedication,
    medicationSearch,
    setMedicationSearch,
    editingMedication,
    isMedicationModalOpen,
    medicationSummary,
    fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    openCreateMedicationModal,
    openEditMedicationModal,
    closeMedicationModal,
  } = usePharmacistMedications();

  const medicationColumns: ColumnsType<Medication> = [
    { title: "รหัสยา", dataIndex: "id", width: 100 },
    { title: "ชื่อยา", dataIndex: "name" },
    {
      title: "ราคาขาย",
      dataIndex: "retail",
      render: (value: number | null) => formatCurrency(value),
    },
    {
      title: "ต้นทุน",
      dataIndex: "price",
      render: (value: number | null) => formatCurrency(value),
    },
    {
      title: "จัดการ",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleOpenEdit(record)}>แก้ไข</Button>
          <Button danger onClick={() => handleDeleteMedication(record.id)}>
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  const handleOpenCreate = () => {
    medicationForm.resetFields();
    medicationForm.setFieldsValue({ name: "", retail: null, price: null });
    openCreateMedicationModal();
  };

  const handleOpenEdit = (record: Medication) => {
    medicationForm.setFieldsValue({
      name: record.name,
      retail: record.retail,
      price: record.price,
    });
    openEditMedicationModal(record);
  };

  const handleSaveMedication = async () => {
    const values = await medicationForm.validateFields();
    const result = editingMedication
      ? await updateMedication(editingMedication.id, values)
      : await createMedication(values);

    if (result.ok) {
      messageApi.success(result.message);
      medicationForm.resetFields();
      return;
    }

    messageApi.error(result.message);
  };

  const handleDeleteMedication = (id: number) => {
    Modal.confirm({
      title: "ลบรายการยา",
      content: "ต้องการลบรายการยานี้หรือไม่",
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okButtonProps: { danger: true },
      onOk: async () => {
        const result = await deleteMedication(id);
        if (result.ok) {
          messageApi.success(result.message);
          return;
        }

        messageApi.error(result.message);
      },
    });
  };

  return (
    <main className="staff-shell">
      {contextHolder}

      <section className="staff-page-header">
        <Typography.Text className="staff-kicker">STAFF / PHARMACIST</Typography.Text>
        <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
          จัดการคลังยา
        </Typography.Title>
        <Typography.Paragraph className="staff-section-muted" style={{ maxWidth: 760, marginBottom: 0 }}>
          หน้านี้ใช้สำหรับ CRUD ยาในระบบโดยเฉพาะ ส่วนประวัติการส่งยาถูกแยกไปอีกหน้าหนึ่งใน staff แล้ว
        </Typography.Paragraph>
      </section>

      <Row gutter={[16, 16]} className="staff-stats-grid">
        <Col xs={24} md={8}>
          <Card className="staff-stat-card" variant="borderless">
            <Typography.Text className="staff-section-muted">จำนวนยาในระบบ</Typography.Text>
            <Typography.Title level={3} style={{ margin: "8px 0 4px" }}>
              {medicationSummary.total.toLocaleString("th-TH")}
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="staff-stat-card" variant="borderless">
            <Typography.Text className="staff-section-muted">ราคาขายเฉลี่ย</Typography.Text>
            <Typography.Title level={3} style={{ margin: "8px 0 4px" }}>
              {formatCurrency(medicationSummary.avgRetail)}
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="staff-stat-card" variant="borderless">
            <Typography.Text className="staff-section-muted">ทางลัด</Typography.Text>
            <Button type="link" style={{ paddingLeft: 0 }} onClick={() => router.push("/staff/pharmacist/delivery-history")}>
              ไปหน้าประวัติการส่งยา
            </Button>
          </Card>
        </Col>
      </Row>

      <Card className="staff-content-card" variant="borderless">
        <div className="staff-toolbar">
          <Input
            value={medicationSearch}
            onChange={(event) => setMedicationSearch(event.target.value)}
            onPressEnter={() => void fetchMedications()}
            placeholder="ค้นหาชื่อยา"
            className="input"
          />
          <Space>
            <Button onClick={() => void fetchMedications()}>ค้นหา</Button>
            <Button type="primary" onClick={handleOpenCreate}>
              เพิ่มยา
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={medicationsLoading}
          columns={medicationColumns}
          dataSource={medications}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        open={isMedicationModalOpen}
        title={editingMedication ? "แก้ไขรายการยา" : "เพิ่มรายการยา"}
        okText={editingMedication ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
        cancelText="ยกเลิก"
        onCancel={() => closeMedicationModal()}
        onOk={() => void handleSaveMedication()}
        confirmLoading={savingMedication}
      >
        <Form form={medicationForm} layout="vertical">
          <Form.Item
            name="name"
            label="ชื่อยา"
            rules={[{ required: true, message: "กรุณากรอกชื่อยา" }]}
          >
            <Input className="input" placeholder="เช่น Fluoxetine 20 mg" />
          </Form.Item>
          <Form.Item name="retail" label="ราคาขาย">
            <InputNumber min={0} precision={2} style={{ width: "100%", height: 52 }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="price" label="ต้นทุน">
            <InputNumber min={0} precision={2} style={{ width: "100%", height: 52 }} placeholder="0.00" />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
