"use client";

import type { ColumnsType } from "antd/es/table";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import {
  usePharmacistMedications,
  type MedicationFormValues,
} from "@/hooks/usePharmacistMedications";
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
  const [modalApi, modalContextHolder] = Modal.useModal();
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
    modalApi.confirm({
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

  const medicationColumns: ColumnsType<Medication> = [
    {
      title: "รหัสยา",
      dataIndex: "id",
      width: 100,
       align: "center",
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: "ascend",
    },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "ราคาขาย",
      dataIndex: "retail",
      width: 160,
      align: "left",
      sorter: (a, b) => (a.retail ?? 0) - (b.retail ?? 0),
      render: (value: number | null) => formatCurrency(value),
    },
    {
      title: "ต้นทุน",
      dataIndex: "price",
      width: 160,
      align: "left",
      sorter: (a, b) => (a.price ?? 0) - (b.price ?? 0),
      render: (value: number | null) => formatCurrency(value),
    },
    {
      title: "จัดการ",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space wrap>
          <Button type="primary" ghost onClick={() => handleOpenEdit(record)}>
            แก้ไข
          </Button>
          <Button danger onClick={() => handleDeleteMedication(record.id)}>
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <main className="staff-shell" style={{ width: "100%", overflowX: "hidden" }}>
      {contextHolder}
      {modalContextHolder}

      <section className="staff-page-header">
        <Typography.Text className="staff-kicker">
          STAFF / PHARMACIST
        </Typography.Text>
        <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
          จัดการคลังยา
        </Typography.Title>
     
      </section>


      <Card
        className="staff-content-card"
        variant="borderless"
        styles={{ body: { overflowX: "auto" } }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div style={{ flex: "1 1 420px", minWidth: 0, maxWidth: 720 }}>
            <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
              ค้นหารายการยา
            </Typography.Text>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={medicationSearch}
                onChange={(event) => setMedicationSearch(event.target.value)}
                onPressEnter={() => void fetchMedications()}
                placeholder="ค้นหาชื่อยา"
                className="input"
              />
              <Button style={{ height: 52, paddingInline: 20 }} onClick={() => void fetchMedications()}>
                ค้นหา
              </Button>
            </Space.Compact>
          </div>
          <Space wrap>
            <Button type="primary" onClick={handleOpenCreate}>
              เพิ่มยา
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          bordered
          size="middle"
          loading={medicationsLoading}
          columns={medicationColumns}
          dataSource={medications}
          scroll={{ x: 900 }}
          locale={{ emptyText: "ยังไม่มีข้อมูลยา" }}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            responsive: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
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
          <Form.Item
            name="retail"
            label="ราคาขาย"
            rules={[{ required: true, message: "กรุณากรอกราคาขาย" }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: "100%", height: 52 }}
              placeholder="0.00"
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="ต้นทุน"
            rules={[{ required: true, message: "กรุณากรอกต้นทุน" }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: "100%", height: 52 }}
              placeholder="0.00"
            />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
