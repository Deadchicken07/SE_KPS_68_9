'use client';

import { useState, useEffect } from 'react';
import { Table, Modal, Button, message, Spin, Tag, Tabs, Popconfirm } from 'antd';
import type { TabsProps } from 'antd';
import { useAuth } from '@/components/providers/AuthProvider';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { mapRoleIdToRole } from '@/types/role.types';
import { useRouter } from 'next/navigation';

type MedicineItem = {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
};

type MedicinePaymentRecord = {
    id: number;
    patientName: string;
    staffName: string;
    date: string | null;
    medicineCost: number;
    medicineItems: MedicineItem[];
    total: number;
    slipUrl: string | null;
    status: string | null;
    paymentStatus: string | null;
    tracking: string | null;
};

export default function PaymentVerificationPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [medicinePayments, setMedicinePayments] = useState<MedicinePaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [medicineLoading, setMedicineLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
    const [selectedMedicinePayment, setSelectedMedicinePayment] = useState<MedicinePaymentRecord | null>(null);
    const { me } = useAuth();
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();

    const role = mapRoleIdToRole(me?.role_id ?? null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const fetchPayments = async () => {
        try {
            const response = await fetch(`${apiUrl}/appointments/payments`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูลได้');
            }

            const data = await response.json();
            setAppointments(data);
        } catch (error: any) {
            messageApi.error(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicinePayments = async () => {
        try {
            const response = await fetch(`${apiUrl}/appointments/medicine-payments`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูลค่ายาได้');
            }

            const data = await response.json();
            setMedicinePayments(data);
        } catch (error: any) {
            messageApi.error(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลค่ายา');
        } finally {
            setMedicineLoading(false);
        }
    };

    const handleConfirm = async (id: number) => {
        try {
            const response = await fetch(`${apiUrl}/appointments/${id}/confirm`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('บันทึกข้อมูลไม่สำเร็จ');
            }

            messageApi.success('ยืนยันการชำระเงินสำเร็จ');
            setSelectedAppointment(null);
            fetchPayments();
        } catch (error: any) {
            messageApi.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleReject = async (id: number) => {
        try {
            const response = await fetch(`${apiUrl}/appointments/${id}/reject`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('บันทึกข้อมูลไม่สำเร็จ');
            }

            messageApi.success('ปฏิเสธการชำระเงินสำเร็จ');
            setSelectedAppointment(null);
            fetchPayments();
        } catch (error: any) {
            messageApi.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleConfirmMedicine = async (receiptId: number) => {
        try {
            const response = await fetch(`${apiUrl}/appointments/receipts/${receiptId}/confirm`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('บันทึกข้อมูลไม่สำเร็จ');
            }

            messageApi.success('ยืนยันการชำระค่ายาสำเร็จ');
            setSelectedMedicinePayment(null);
            fetchMedicinePayments();
        } catch (error: any) {
            messageApi.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleRejectMedicine = async (receiptId: number) => {
        try {
            const response = await fetch(`${apiUrl}/appointments/receipts/${receiptId}/reject`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('บันทึกข้อมูลไม่สำเร็จ');
            }

            messageApi.success('ปฏิเสธการชำระค่ายาสำเร็จ');
            setSelectedMedicinePayment(null);
            fetchMedicinePayments();
        } catch (error: any) {
            messageApi.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    useEffect(() => {
        if (!me) return;
        if (role !== 'admin') {
            router.push('/login');
            return;
        }

        fetchPayments();
        fetchMedicinePayments();
    }, [me, role, router]);

    // ── Columns for appointment payments (tab 1) ──
    const appointmentColumns = [
        {
            title: 'รหัสการนัดหมาย',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'ชื่อผู้รับบริการ',
            dataIndex: 'patientName',
            key: 'patientName',
        },
        {
            title: 'ผู้ให้บริการ',
            dataIndex: 'staffName',
            key: 'staffName',
        },
        {
            title: 'วันที่นัด',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'เวลานัด',
            dataIndex: 'time',
            key: 'time',
            render: (time: string) => <span>{time ? time + ' น.' : '-'}</span>,
        },
        {
            title: 'ค่าบริการ',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => <span>{val ? val.toLocaleString() + ' ฿' : '-'}</span>,
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                if (status === 'Paid') return <Tag color="green">ได้รับการยืนยันแล้ว</Tag>;
                if (status === 'Pending') return <Tag color="orange">รอการยืนยัน</Tag>;
                return <Tag color="blue">รอการชำระเงิน</Tag>;
            },
        },
        {
            title: 'หลักฐานการโอน',
            key: 'slipUrl',
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    {record.slipUrl ? (
                        <Button
                            type="default"
                            onClick={() => setSelectedAppointment(record)}
                        >
                            ดูสลิป
                        </Button>
                    ) : (
                        <span className="text-gray-400">ไม่มีภาพการชำระเงิน</span>
                    )}
                </div>
            ),
        },
        {
            title: 'การจัดการ',
            key: 'action',
            render: (_: any, record: any) => (
                <Popconfirm
                    title="ปฏิเสธการชำระเงิน ของนัดหมายนี้?"
                    onConfirm={() => handleReject(record.id)}
                    okText="ยืนยันปฏิเสธ"
                    cancelText="ยกเลิก"
                    placement="left"
                >
                    <Button danger size="small">ปฏิเสธการชำระเงิน</Button>
                </Popconfirm>
            ),
        },
    ];

    // ── Columns for medicine payments (tab 2) ──
    const medicineColumns = [
        {
            title: 'รหัสใบเสร็จ',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'ชื่อผู้รับบริการ',
            dataIndex: 'patientName',
            key: 'patientName',
        },
        {
            title: 'ผู้สั่งยา',
            dataIndex: 'staffName',
            key: 'staffName',
        },
        {
            title: 'วันที่',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'ค่ายา',
            dataIndex: 'medicineCost',
            key: 'medicineCost',
            render: (val: number) => <span style={{ fontWeight: 700, color: '#0f766e' }}>{val ? val.toLocaleString() + ' ฿' : '-'}</span>,
        },
        {
            title: 'รายการยา',
            key: 'medicineItems',
            render: (_: any, record: MedicinePaymentRecord) => (
                <span>{record.medicineItems.length} รายการ</span>
            ),
        },
        {
            title: 'สถานะการชำระ',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status: string | null) => {
                if (status === 'Paid') return <Tag color="green">ได้รับการยืนยันแล้ว</Tag>;
                if (status === 'Pending') return <Tag color="orange">รอการยืนยัน</Tag>;
                return <Tag color="blue">รอการชำระเงิน</Tag>;
            },
        },
        {
            title: 'หลักฐานการโอน',
            key: 'slipUrl',
            render: (_: any, record: MedicinePaymentRecord) => (
                <div className="flex gap-2">
                    {record.slipUrl ? (
                        <Button
                            type="default"
                            onClick={() => setSelectedMedicinePayment(record)}
                        >
                            ดูสลิป
                        </Button>
                    ) : (
                        <span className="text-gray-400">ยังไม่ได้ชำระ</span>
                    )}
                </div>
            ),
        },
        {
            title: 'การจัดการ',
            key: 'action',
            render: (_: any, record: MedicinePaymentRecord) => (
                <Popconfirm
                    title="คุณแน่ใจหรือไม่ที่จะยกเลิกรายการใบเสร็จนี้?"
                    onConfirm={() => handleRejectMedicine(record.id)}
                    okText="ใช่, ยกเลิก"
                    cancelText="ไม่"
                    placement="left"
                >
                    <Button danger size="small">ยกเลิกรายการ</Button>
                </Popconfirm>
            ),
        },
    ];

    if (!me || role !== 'admin') {
        return <div className="p-8 text-center"><Spin size="large" /></div>;
    }

    if (loading) {
        return <PageSkeleton cards={[{ rows: 4 }, { rows: 10 }]} />;
    }

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `ค่าการนัดหมาย`,
            children: (
                <Table
                    columns={appointmentColumns}
                    dataSource={appointments}
                    rowKey="id"
                    pagination={{ pageSize: 15 }}
                />
            ),
        },
        {
            key: '2',
            label: `ค่ายา`,
            children: (
                <Table
                    columns={medicineColumns}
                    dataSource={medicinePayments}
                    rowKey="id"
                    loading={medicineLoading}
                    pagination={{ pageSize: 15 }}
                />
            ),
        },
    ];

    return (
        <div className="p-8 pb-32">
            {contextHolder}
            <h1 className="text-2xl font-bold mb-6 text-gray-800">ตรวจสอบการชำระเงิน</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Tabs defaultActiveKey="1" items={items} size="large" />
            </div>

            {/* ── Appointment slip modal ── */}
            <Modal
                title="หลักฐานการโอนเงิน (ค่าบริการ)"
                open={!!selectedAppointment}
                onCancel={() => setSelectedAppointment(null)}
                footer={null}
                width={500}
                centered
            >
                {selectedAppointment ? (
                    <div className="flex flex-col gap-4">
                        {/* Patient & Appointment info */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', padding: 16, borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#6b7280', fontSize: 14 }}>ผู้รับบริการ</span>
                                <span style={{ fontWeight: 600 }}>{selectedAppointment.patientName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#6b7280', fontSize: 14 }}>ผู้ให้บริการ</span>
                                <span style={{ fontWeight: 600 }}>{selectedAppointment.staffName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#6b7280', fontSize: 14 }}>วันที่</span>
                                <span style={{ fontWeight: 600 }}>{selectedAppointment.date}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#6b7280', fontSize: 14 }}>เวลา</span>
                                <span style={{ fontWeight: 600 }}>{selectedAppointment.time} น.</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #d1d5db', paddingTop: 8, marginTop: 4 }}>
                                <span style={{ fontWeight: 700, color: '#4b5563' }}>ยอดค่าบริการ</span>
                                <span style={{ fontWeight: 800, color: '#059669', fontSize: 18 }}>{selectedAppointment.amount ? selectedAppointment.amount.toLocaleString() : '0'} ฿</span>
                            </div>
                        </div>

                        {/* Slip image */}
                        {selectedAppointment.slipUrl ? (
                            <div className="text-center">
                                <p style={{ fontWeight: 700, marginBottom: 8, color: '#374151' }}>สลิปการโอนเงิน</p>
                                <img
                                    src={selectedAppointment.slipUrl}
                                    alt="Slip File"
                                    className="max-w-full h-auto rounded-md shadow-sm border mx-auto"
                                    style={{ maxHeight: '50vh', objectFit: 'contain' }}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-4" style={{ color: '#9ca3af' }}>
                                ยังไม่มีสลิปการชำระเงิน
                            </div>
                        )}

                        {selectedAppointment.slipUrl && selectedAppointment.status === 'Pending' ? (
                            <div className="border-t pt-4 mt-2">
                                <h3 className="text-lg font-bold mb-4 text-center">ยืนยันการชำระค่าบริการ</h3>
                                <div className="flex justify-center gap-4">
                                    <Button
                                        danger
                                        size="large"
                                        onClick={() => handleReject(selectedAppointment.id)}
                                    >
                                        ปฏิเสธ
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{ background: '#0f766e', borderColor: '#0f766e' }}
                                        onClick={() => handleConfirm(selectedAppointment.id)}
                                    >
                                        ยืนยัน
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t pt-4 mt-2 text-center">
                                <Button
                                    size="large"
                                    onClick={() => setSelectedAppointment(null)}
                                >
                                    ปิดหน้าต่าง
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">ไม่พบไฟล์ภาพสลิป</p>
                        <Button onClick={() => setSelectedAppointment(null)}>ปิดหน้าต่าง</Button>
                    </div>
                )}
            </Modal>

            {/* ── Medicine payment slip modal ── */}
            <Modal
                title="หลักฐานการโอนเงิน (ค่ายา)"
                open={!!selectedMedicinePayment}
                onCancel={() => setSelectedMedicinePayment(null)}
                footer={null}
                width={600}
                centered
            >
                {selectedMedicinePayment ? (
                    <div className="flex flex-col gap-4">
                        {/* Patient & cost info */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', padding: 16, borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#6b7280', fontSize: 14 }}>ผู้รับบริการ</span>
                                <span style={{ fontWeight: 600 }}>{selectedMedicinePayment.patientName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#6b7280', fontSize: 14 }}>ผู้สั่งยา</span>
                                <span style={{ fontWeight: 600 }}>{selectedMedicinePayment.staffName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #d1d5db', paddingTop: 8, marginTop: 4 }}>
                                <span style={{ fontWeight: 700, color: '#4b5563' }}>ยอดค่ายา</span>
                                <span style={{ fontWeight: 800, color: '#059669', fontSize: 18 }}>{selectedMedicinePayment.medicineCost.toLocaleString()} ฿</span>
                            </div>
                        </div>

                        {/* Medicine items */}
                        <div style={{ borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid #e5e7eb' }}>ชื่อยา</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, borderBottom: '1px solid #e5e7eb', width: 60 }}>จำนวน</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, borderBottom: '1px solid #e5e7eb', width: 90 }}>รวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedMedicinePayment.medicineItems.map((item, idx) => (
                                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                            <td style={{ padding: '8px 12px' }}>{item.name}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#0f766e' }}>{item.totalPrice.toLocaleString()} ฿</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Slip image */}
                        {selectedMedicinePayment.slipUrl ? (
                            <div className="text-center">
                                <p style={{ fontWeight: 700, marginBottom: 8, color: '#374151' }}>สลิปการโอนเงิน</p>
                                <img
                                    src={selectedMedicinePayment.slipUrl}
                                    alt="Medicine Slip"
                                    className="max-w-full h-auto rounded-md shadow-sm border mx-auto"
                                    style={{ maxHeight: '50vh', objectFit: 'contain' }}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-4" style={{ color: '#9ca3af' }}>
                                ยังไม่มีสลิปการชำระเงิน
                            </div>
                        )}

                        {selectedMedicinePayment.slipUrl && selectedMedicinePayment.paymentStatus === 'Pending' ? (
                            <div className="border-t pt-4 mt-2">
                                <h3 className="text-lg font-bold mb-4 text-center">ยืนยันการชำระค่ายา</h3>
                                <div className="flex justify-center gap-4">
                                    <Button
                                        danger
                                        size="large"
                                        onClick={() => handleRejectMedicine(selectedMedicinePayment.id)}
                                    >
                                        ปฏิเสธ
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{ background: '#0f766e', borderColor: '#0f766e' }}
                                        onClick={() => handleConfirmMedicine(selectedMedicinePayment.id)}
                                    >
                                        ยืนยัน
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t pt-4 mt-2 text-center">
                                <Button
                                    size="large"
                                    onClick={() => setSelectedMedicinePayment(null)}
                                >
                                    ปิดหน้าต่าง
                                </Button>
                            </div>
                        )}
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
