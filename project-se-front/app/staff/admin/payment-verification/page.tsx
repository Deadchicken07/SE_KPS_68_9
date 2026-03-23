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
    const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);
    const { me } = useAuth();
    const router = useRouter();

    const role = mapRoleIdToRole(me?.role_id ?? null);

    useEffect(() => {
        if (!me) return;
        if (role !== 'admin') {
            router.push('/login');
            return;
        }

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
                message.error(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
            } finally {
                setLoading(false);
            }
        };

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
            title: 'วันที่และเวลานัด',
            key: 'datetime',
            render: (_: any, record: any) => (
                <span>{record.date} {record.time} น.</span>
            ),
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
            render: (status: string) => (
                <Tag color="green">โอนชำระเงินแล้ว</Tag>
            ),
        },
        {
            title: 'หลักฐานการโอน',
            key: 'slipUrl',
            render: (_: any, record: any) => (
                <Button 
                    type="primary" 
                    onClick={() => setPreviewSlipUrl(record.slipUrl)}
                >
                    ดูสลิป
                </Button>
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
            <h1 className="text-2xl font-bold mb-6 text-gray-800">ตรวจสอบการชำระเงิน</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Tabs defaultActiveKey="1" items={items} size="large" />
            </div>

            <Modal
                title="หลักฐานการโอนเงิน (สลิป)"
                open={!!previewSlipUrl}
                onCancel={() => setPreviewSlipUrl(null)}
                footer={null}
                width={500}
                centered
            >
                {previewSlipUrl ? (
                    <div className="text-center">
                        <img 
                            src={previewSlipUrl} 
                            alt="Slip File" 
                            className="max-w-full h-auto rounded-md shadow-sm border mx-auto"
                            style={{ maxHeight: '70vh', objectFit: 'contain' }}
                        />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">ไม่พบไฟล์ภาพสลิป</p>
                )}
            </Modal>
        </div>
    );
}
