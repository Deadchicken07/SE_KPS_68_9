"use client";

import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useAdminStaffManagement } from "@/hooks/useAdminStaffManagement";
import type {
  AdminStaffFormValues,
  AdminStaffRecord,
} from "@/types/adminStaffManagement.types";
import {
  ADMIN_STAFF_ROLE_OPTIONS,
  ADMIN_STAFF_STATUS_OPTIONS,
} from "@/types/adminStaffManagement.types";
import PageSkeleton from "@/components/ui/PageSkeleton";

const roleColorMap: Record<number, string> = {
  3: "cyan",
  4: "blue",
  5: "purple",
};

const actionButtonBaseStyle = {
  height: 38,
  minWidth: 74,
  borderRadius: 999,
  paddingInline: 18,
  fontWeight: 600,
  boxShadow: "none",
  background: "#ffffff",
} as const;

const editActionButtonStyle = {
  ...actionButtonBaseStyle,
  borderColor: "#0f766e",
  color: "#0f766e",
} as const;

const deleteActionButtonStyle = {
  ...actionButtonBaseStyle,
  borderColor: "#ff4d4f",
  color: "#ff4d4f",
} as const;

const activateActionButtonStyle = {
  ...actionButtonBaseStyle,
  borderColor: "#52c41a",
  color: "#52c41a",
} as const;

const readOnlySelectStyle = {
  width: "100%",
} as const;

const staffStatusLabelMap: Record<AdminStaffRecord["status"], string> = {
  ACTIVE: "ปฏิบัติงาน",
  INACTIVE: "ลบ",
};

type StaffNotice = {
  type: "success" | "error";
  content: string;
} | null;

export default function AdminManagePage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [staffForm] = Form.useForm<AdminStaffFormValues>();
  const [notice, setNotice] = useState<StaffNotice>(null);
  const {
    hasAccess,
    staffs,
    staffsLoading,
    savingStaff,
    staffSearch,
    setStaffSearch,
    statusFilter,
    setStatusFilter,
    editingStaff,
    isStaffModalOpen,
    fetchStaffs,
    updateStaff,
    deactivateStaff,
    setStaffStatus,
    openEditStaffModal,
    closeStaffModal,
  } = useAdminStaffManagement();
  const staffStatusOptions = ADMIN_STAFF_STATUS_OPTIONS.map((item) => ({
    ...item,
    label: staffStatusLabelMap[item.value as AdminStaffRecord["status"]],
  }));

  useEffect(() => {
    if (!notice) {
      return;
    }

    messageApi.open({
      type: notice.type,
      content: notice.content,
    });
    setNotice(null);
  }, [messageApi, notice]);

  if (staffsLoading) {
    return <PageSkeleton cards={[{ rows: 4 }, { rows: 10 }]} />;
  }

  const handleOpenEdit = (record: AdminStaffRecord) => {
    staffForm.setFieldsValue({
      email: record.email ?? "",
      title: record.title ?? "",
      name: record.name,
      surName: record.surName,
      roleId: record.roleId,
      phone: record.phone ?? "",
      info: record.info ?? "",
      degree: record.degree ?? "",
      license: record.license ?? "",
      status: record.status,
    });
    openEditStaffModal(record);
  };

  const handleSaveStaff = async () => {
    if (!editingStaff) {
      setNotice({
        type: "error",
        content: "ไม่พบข้อมูลบุคลากรที่ต้องการแก้ไข",
      });
      return;
    }

    const values = await staffForm.validateFields();
    const result = await updateStaff(editingStaff.id, values);

    if (result.ok) {
      setNotice({ type: "success", content: result.message });
      staffForm.resetFields();
      return;
    }

    setNotice({ type: "error", content: result.message });
  };

  const handleSearch = async () => {
    const result = await fetchStaffs();

    if (!result.ok) {
      setNotice({ type: "error", content: result.message });
    }
  };

  const handleToggleStatus = (record: AdminStaffRecord) => {
    if (record.status === "ACTIVE") {
      modalApi.confirm({
        title: "ลบบุคลากร",
        content: `ต้องการลบ ${record.fullName} ใช่หรือไม่`,
        okText: "ลบ",
        cancelText: "ยกเลิก",
        okButtonProps: { danger: true },
        onOk: async () => {
          const result = await deactivateStaff(record.id);
          if (result.ok) {
            setNotice({ type: "success", content: result.message });
            return;
          }

          setNotice({ type: "error", content: result.message });
        },
      });
      return;
    }

    modalApi.confirm({
      title: "เปลี่ยนสถานะบุคลากร",
      content: `ต้องการเปลี่ยนสถานะ ${record.fullName} เป็น "ปฏิบัติงาน" ใช่หรือไม่`,
      okText: "ปฏิบัติงาน",
      cancelText: "ยกเลิก",
      onOk: async () => {
        const result = await setStaffStatus(record.id, "ACTIVE");
        if (result.ok) {
          setNotice({ type: "success", content: result.message });
          return;
        }

        setNotice({ type: "error", content: result.message });
      },
    });
  };

  const staffColumns: ColumnsType<AdminStaffRecord> = [
    {
      title: "ชื่อ-สกุล",
      dataIndex: "fullName",
      width: 220,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName, "th"),
    },
    {
      title: "ตำแหน่ง",
      dataIndex: "roleName",
      width: 140,
      render: (_, record) => (
        <Tag color={roleColorMap[record.roleId] ?? "default"}>{record.roleName}</Tag>
      ),
      filters: ADMIN_STAFF_ROLE_OPTIONS.map((item) => ({
        text: item.label,
        value: item.label,
      })),
      onFilter: (value, record) => record.roleName === value,
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      width: 240,
      render: (value: string | null) => value || "-",
    },
    {
      title: "เบอร์โทร",
      dataIndex: "phone",
      width: 150,
      render: (value: string | null) => value || "-",
    },
    {
      title: "จัดการ",
      key: "actions",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Space size={12} wrap>
          <Button style={editActionButtonStyle} onClick={() => handleOpenEdit(record)}>
            แก้ไข
          </Button>
          <Button
            style={
              record.status === "ACTIVE"
                ? deleteActionButtonStyle
                : activateActionButtonStyle
            }
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === "ACTIVE" ? "ลบ" : "ปฏิบัติงาน"}
          </Button>
        </Space>
      ),
    },
  ];

  if (!hasAccess) {
    return null;
  }

  return (
    <main className="staff-shell" style={{ width: "100%", overflowX: "hidden" }}>
      {contextHolder}
      {modalContextHolder}

      <section className="staff-page-header">
        <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
          จัดการบุคลากร
        </Typography.Title>
      </section>

      <Card
        className="staff-content-card"
        variant="borderless"
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
          <div style={{ flex: "1 1 560px", minWidth: 0, maxWidth: 860 }}>
            <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
              ค้นหาบุคลากร
            </Typography.Text>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={staffSearch}
                onChange={(event) => setStaffSearch(event.target.value)}
                onPressEnter={() => void handleSearch()}
                placeholder="ค้นหาชื่อ อีเมล เบอร์โทร หรือความเชี่ยวชาญ"
                className="input"
              />
              <Select
                value={statusFilter}
                style={{ width: 160 }}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { label: "ทุกสถานะ", value: "all" },
                  ...staffStatusOptions.map((item) => ({
                    label: item.label,
                    value: item.value,
                  })),
                ]}
              />
              <Button style={{ height: 52, paddingInline: 20 }} onClick={() => void handleSearch()}>
                ค้นหา
              </Button>
            </Space.Compact>
          </div>
        </div>

        <Table
          rowKey="id"
          bordered
          size="middle"
          loading={staffsLoading}
          columns={staffColumns}
          dataSource={staffs}
          locale={{ emptyText: "ยังไม่มีข้อมูลบุคลากร" }}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            responsive: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      <Modal
        open={isStaffModalOpen}
        title="แก้ไขข้อมูลบุคลากร"
        okText="บันทึกการแก้ไข"
        cancelText="ยกเลิก"
        onCancel={() => closeStaffModal()}
        onOk={() => void handleSaveStaff()}
        confirmLoading={savingStaff}
        width={860}
      >
        <Form form={staffForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="title" label="คำนำหน้าชื่อ">
                <Input
                  className="input"
                  placeholder="เช่น นาย, นางสาว, นพ., พญ."
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="name"
                label="ชื่อ"
                rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
              >
                <Input className="input" placeholder="ชื่อ" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="surName"
                label="นามสกุล"
                rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
              >
                <Input className="input" placeholder="นามสกุล" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="อีเมล"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input className="input" placeholder="example@jitdee.com" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="roleId"
                label="ตำแหน่ง"
                rules={[{ required: true, message: "กรุณาเลือกตำแหน่ง" }]}
              >
                <Select
                  options={ADMIN_STAFF_ROLE_OPTIONS}
                  disabled
                  suffixIcon={null}
                  style={readOnlySelectStyle}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="สถานะ"
                rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
              >
                <Select options={staffStatusOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="เบอร์โทรศัพท์">
                <Input className="input" placeholder="08X-XXX-XXXX" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="license" label="เลขใบอนุญาตประกอบวิชาชีพ">
                <Input className="input" placeholder="เลขที่ใบอนุญาต" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="degree" label="วุฒิการศึกษา">
                <Input className="input" placeholder="เช่น พ.บ., วท.บ., ภ.บ." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="info" label="ข้อมูลเพิ่มเติม / ความเชี่ยวชาญ">
                <Input.TextArea
                  rows={4}
                  className="input"
                  placeholder="รายละเอียดความเชี่ยวชาญหรือข้อมูลเพิ่มเติม"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </main>
  );
}
