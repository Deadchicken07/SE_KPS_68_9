"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, Input, Button, Card, Typography, message, Tag, Space, Modal, Descriptions, QRCode, Spin } from "antd";
import { SearchOutlined, CheckCircleOutlined, MedicineBoxOutlined, ArrowRightOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import generatePayload from 'promptpay-qr';
import { supabase } from '@/utils/supabase';
import PageSkeleton from "@/components/ui/PageSkeleton";

const { Title, Text } = Typography;
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ReceiptDetail {
  id: number;
  item_name: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Receipt {
  id: number;
  user_id: number;
  total: number;
  medicineCost: number;
  status: string;
  payment_status: string;
  created_at: string;
  patientName: string;
  staffName: string;
  phone?: string;
  nation_id?: string;
  appointmentType: string;
  hasPrescription: boolean;
  medicineItems: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  receipt_details: ReceiptDetail[];
}

export default function AdminMedicationPaymentPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [updating, setUpdating] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'summary' | 'payment'>('summary');
  const [uploadedSlip, setUploadedSlip] = useState<File | null>(null);

  // Fetch receipts that are pending payment at clinic
  const fetchReceipts = useCallback(async () => {
    try {
      if (isLoading) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }
      const res = await axios.get(`${API}/appointments/medicine-payments`, {
        withCredentials: true,
      });
      
      const data = res.data || [];
      // Group by payment status (we only want ones that aren't paid yet)
      const pending = data.filter((r: any) => 
        r.payment_status !== "Paid" && 
        r.appointmentType === "onsite" && 
        r.hasPrescription === true &&
        r.medicineCost > 0
      );
      
      setReceipts(pending);
    } catch (error) {
      console.error(error);
      messageApi.error("ไม่สามารถดึงข้อมูลรายการใบเสร็จได้");
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleConfirmPayment = async (receiptId: number) => {
    try {
      if (!uploadedSlip) {
        messageApi.warning("กรุณาแนบหลักฐานการโอนเงิน");
        return;
      }

      setUpdating(true);

      // 1. Upload Slip to Supabase
      const fileExt = uploadedSlip.name.split('.').pop();
      const fileName = `med-slip-${receiptId}-${Date.now()}.${fileExt}`;
      const filePath = `medication-slips/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Paid_appointment') // Reuse existing bucket or use a separate one if available
        .upload(filePath, uploadedSlip);

      if (uploadError) throw new Error("ไม่สามารถอัปโหลดรูปภาพได้");

      const { data: { publicUrl } } = supabase.storage
        .from('Paid_appointment')
        .getPublicUrl(filePath);

      // 2. Patch to Backend
      await axios.patch(`${API}/appointments/receipts/${receiptId}/confirm`, {
        slipUrl: publicUrl
      }, {
        withCredentials: true,
      });
      
      messageApi.success("รับชำระเงินและจ่ายยาเรียบร้อยแล้ว!");
      setIsModalOpen(false);
      setUploadedSlip(null);
      setPaymentStep('summary');
      fetchReceipts();
    } catch (error: any) {
      console.error(error);
      messageApi.error(error.response?.data?.message || error.message || "ไม่สามารถดำเนินการได้");
    } finally {
      setUpdating(false);
    }
  };

  const filteredReceipts = receipts.filter(r => 
    r.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
    r.nation_id?.includes(searchText) ||
    r.id.toString().includes(searchText)
  );

  if (isLoading) {
    return <PageSkeleton cards={[{ rows: 4 }, { rows: 8 }]} />;
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "ชื่อผู้ป่วย",
      dataIndex: "patientName",
      key: "patientName",
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: "ผู้ให้คำปรึกษา",
      dataIndex: "staffName",
      key: "staffName",
    },
    {
      title: "เบอร์โทรศัพท์",
      key: "phone",
      render: (r: Receipt) => r.phone || "-",
    },
    {
      title: "ยอดชำระ (เฉพาะค่ายา)",
      dataIndex: "medicineCost",
      key: "medicineCost",
      render: (cost: number) => (
        <Text strong style={{ color: "#0f766e" }}>
          {Number(cost).toLocaleString()} ฿
        </Text>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "pending_pickup" ? "orange" : "blue"}>
          {status === "pending_pickup" ? "รอมารับยา" : "รอจัดส่ง"}
        </Tag>
      ),
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("D MMM BBBB HH:mm"),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (r: Receipt) => (
        <Button 
          type="primary" 
          icon={<MedicineBoxOutlined />}
          onClick={() => {
            setSelectedReceipt(r);
            setIsModalOpen(true);
          }}
          style={{ background: "#0f766e", border: "none" }}
        >
          รับชำระ/จ่ายยา
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      {contextHolder}
      <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, color: "#1e1b4b" }}>
              💳 ชำระค่ายา (On-site / Walk-in)
            </Title>
            <Text type="secondary">จัดการการรับชำระเงินและจ่ายยาแก่ผู้ป่วยที่คลินิก</Text>
          </div>
          
          <Input
            placeholder="ค้นหาชื่อผู้ป่วย, เลขบัตรประชาชน หรือเลขใบเสร็จ"
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            style={{ width: 400, borderRadius: 10 }}
            size="large"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredReceipts} 
          rowKey="id" 
          loading={isFetching}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "ไม่มีรายการที่รอชำระเงิน" }}
          style={{ cursor: "pointer" }}
        />
      </Card>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {paymentStep === 'summary' ? <MedicineBoxOutlined style={{ color: "#0f766e" }} /> : <CheckCircleOutlined style={{ color: "#0f766e" }} />}
            <span> {paymentStep === 'summary' ? `สรุปรายการยา - ใบเสร็จ #${selectedReceipt?.id}` : `ชำระเงิน - ใบเสร็จ #${selectedReceipt?.id}`}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setPaymentStep('summary');
          setUploadedSlip(null);
        }}
        footer={[
          <Button key="back" onClick={() => {
            if (paymentStep === 'payment') setPaymentStep('summary');
            else setIsModalOpen(false);
          }} size="large">
            {paymentStep === 'payment' ? 'ย้อนกลับ' : 'ยกเลิก'}
          </Button>,
          paymentStep === 'summary' ? (
            <Button 
              key="next" 
              type="primary" 
              size="large" 
              icon={<ArrowRightOutlined />}
              onClick={() => setPaymentStep('payment')}
              style={{ background: "#0f766e", border: "none" }}
            >
              ไปที่หน้าชำระเงิน
            </Button>
          ) : (
            <Button 
              key="submit" 
              type="primary" 
              size="large" 
              loading={updating}
              disabled={!uploadedSlip}
              onClick={() => selectedReceipt && handleConfirmPayment(selectedReceipt.id)}
              style={{ background: "#0f766e", border: "none", padding: "0 40px" }}
            >
              {updating ? "กำลังบันทึก..." : "ยืนยันการรับเงิน/จ่ายยา"}
            </Button>
          )
        ]}
        width={paymentStep === 'summary' ? 600 : 500}
      >
        {selectedReceipt && (
          <div style={{ padding: "10px 0" }}>
            {paymentStep === 'summary' ? (
              <>
                <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
                  <Descriptions.Item label="ผู้ป่วย">
                    <Text strong>{selectedReceipt.patientName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="ผู้ให้คำปรึกษา">
                    {selectedReceipt.staffName}
                  </Descriptions.Item>
                  <Descriptions.Item label="เลขบัตรประชาชน">
                    {selectedReceipt.nation_id || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="ประเภท">
                    <Tag color="orange">รับที่คลินิก (On-site)</Tag>
                  </Descriptions.Item>
                </Descriptions>

                <Title level={5} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <MedicineBoxOutlined /> รายการยาที่ได้รับ
                </Title>
                
                <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #f1f5f9", borderRadius: 8, marginBottom: 20 }}>
                  <Table 
                    dataSource={selectedReceipt.medicineItems} 
                    rowKey="name" 
                    pagination={false}
                    size="small"
                    columns={[
                      { title: "รายการยา", dataIndex: "name", key: "name" },
                      { title: "จำนวน", dataIndex: "quantity", key: "quantity", align: "center" },
                      { 
                        title: "ราคา", 
                        dataIndex: "totalPrice", 
                        key: "totalPrice", 
                        align: "right",
                        render: (p: number) => `${Number(p).toLocaleString()} ฿`
                      },
                    ]}
                  />
                </div>

                <div style={{ 
                  background: "#f0fdf4", 
                  padding: "16px 20px", 
                  borderRadius: 12, 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  border: "1.5px solid #0f766e"
                }}>
                  <Text strong style={{ fontSize: 18, color: "#1e1b4b" }}>ยอดรวมค่ายาทั้งหมด:</Text>
                  <Text strong style={{ fontSize: 24, color: "#0f766e" }}>{Number(selectedReceipt.medicineCost).toLocaleString()} ฿</Text>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 10 }}>
                  <Text type="secondary">กรุณาให้ผู้ป่วยสแกน QR Code เพื่อชำระเงิน</Text>
                  <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: '#0f766e' }}>
                    ยอดชำระ: {Number(selectedReceipt.medicineCost).toLocaleString()} ฿
                  </div>
                </div>

                <div style={{ 
                  display: 'inline-block', 
                  padding: 12, 
                  background: '#fff', 
                  borderRadius: 16, 
                  border: '2px solid #f1f5f9',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  marginBottom: 16
                }}>
                  <QRCode
                    value={generatePayload('0928104747', { amount: Number(selectedReceipt.medicineCost) })}
                    size={220}
                    color="#000"
                    type="svg"
                  />
                </div>

                <div style={{ textAlign: "left", background: "#f8fafc", padding: '16px 20px', borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
                    อัปโหลดรูปภาพสลิปใบเสร็จ <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ 
                    position: 'relative',
                    border: '2px dashed #cbd5e1',
                    borderRadius: 8,
                    padding: '10px',
                    textAlign: 'center',
                    background: uploadedSlip ? '#f0fdf4' : '#fff',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setUploadedSlip(e.target.files[0]);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        zIndex: 2
                      }}
                    />
                    <div style={{ color: uploadedSlip ? '#0f766e' : '#64748b', fontSize: 13 }}>
                      <UploadOutlined style={{ fontSize: 20, marginBottom: 4 }} />
                      <div style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {uploadedSlip ? `ไฟล์: ${uploadedSlip.name}` : "คลิกเพื่อเลือกไฟล์สลิป"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
