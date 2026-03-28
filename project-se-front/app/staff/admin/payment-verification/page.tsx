'use client';

import { useState, useEffect } from 'react';
import { Table, Modal, Button, message, Spin, Tag, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useAuth } from '@/components/providers/AuthProvider';
import { mapRoleIdToRole } from '@/types/role.types';
import { useRouter } from 'next/navigation';

export default function PaymentVerificationPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
    const { me } = useAuth();
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();

    const role = mapRoleIdToRole(me?.role_id ?? null);

    const fetchPayments = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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

    const handleConfirm = async (id: number) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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

    useEffect(() => {
        if (!me) return;
        if (role !== 'admin') {
            router.push('/login');
            return;
        }

        fetchPayments();
    }, [me, role, router]);

    const columns = [
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
            render: (time: string) => <span>{time} น.</span>,
        },
        {
            title: 'ค่าบริการ',
            dataIndex: 'price',
            key: 'price',
            render: (val: number) => <span>{val ? val.toLocaleString() + ' ฿' : '-'}</span>,
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: any) => {
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
    ];

    if (!me || role !== 'admin') {
        return <div className="p-8 text-center"><Spin size="large" /></div>;
    }

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'ค่าบริการ (การจองนัด)',
            children: (
                <Table
                    columns={columns}
                    dataSource={appointments}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15 }}
                />
            ),
        },
        {
            key: '2',
            label: 'ค่ายา / ใบเสร็จหลังตรวจ (เร็วๆ นี้)',
            children: (
                <div className="py-12 text-center text-gray-500">
                    <p className="text-lg">ยังไม่มีรายการค่ายาที่รอตรวจสอบในขณะนี้</p>
                    <p className="text-sm">ตารางนี้สำหรับตรวจสอบสลิปการจัดส่งยาของ Pharmacist โดยเฉพาะ</p>
                </div>
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

            <Modal
                title="หลักฐานการโอนเงิน"
                open={!!selectedAppointment}
                onCancel={() => setSelectedAppointment(null)}
                footer={null}
                width={500}
                centered
            >
                {selectedAppointment?.slipUrl ? (
                    <div className="flex flex-col gap-4">
                        <div className="text-center">
                            <img
                                src={selectedAppointment.slipUrl}
                                alt="Slip File"
                                className="max-w-full h-auto rounded-md shadow-sm border mx-auto"
                                style={{ maxHeight: '60vh', objectFit: 'contain' }}
                            />
                        </div>

                        {selectedAppointment.status === 'Pending' ? (
                            <div className="border-t pt-4 mt-2">
                                <h3 className="text-lg font-bold mb-4 text-center">ยืนยันการชำระเงิน</h3>
                                <div className="flex justify-center gap-4">
                                    <Button
                                        size="large"
                                        onClick={() => setSelectedAppointment(null)}
                                    >
                                        ยกเลิก
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
        </div>
    );
}
