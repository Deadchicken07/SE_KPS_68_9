'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, ConfigProvider, QRCode, Spin } from 'antd';
import generatePayload from 'promptpay-qr';
import locale from 'antd/locale/th_TH';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { supabase } from '@/utils/supabase';

type PrescriptionItem = {
    medicationName: string;
    quantity: number;
    comment: string;
    price: number;
};

type MedicinePaymentData = {
    prescriptionItems: PrescriptionItem[];
    medicineCost: number;
    receipt: { id: number; total: number; status: string | null } | null;
};

function MedicinePaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState<'payment' | 'success'>('payment');
    const [uploadedSlip, setUploadedSlip] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentData, setPaymentData] = useState<MedicinePaymentData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const receiptId = searchParams.get('receiptId');

    const prescriptionItems = paymentData?.prescriptionItems ?? [];
    const medicineCost = prescriptionItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!receiptId) {
                setFetchError('ไม่พบรหัสใบเสร็จ');
                setIsLoadingData(false);
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await fetch(`${apiUrl}/appointments/receipts/${receiptId}/payment-details`, {
                    credentials: 'include',
                });

                if (!res.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลการชำระเงินได้');
                }

                const data = await res.json();
                const rawItems = data?.consultations?.prescription_items ?? [];
                const mappedItems: PrescriptionItem[] = rawItems.map((item: any) => ({
                    medicationName: item?.medications?.name ?? 'Unknown',
                    quantity: Number(item?.quantity ?? 0),
                    comment: item?.comment ?? '',
                    price: Number(item?.medications?.price ?? 0),
                }));

                const mappedMedicineCost = mappedItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                );

                setPaymentData({
                    prescriptionItems: mappedItems,
                    medicineCost: mappedMedicineCost,
                    receipt: {
                        id: data?.id,
                        total: mappedMedicineCost,
                        status: data?.payment_status ?? null,
                    },
                });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
                console.error('Fetch payment details error:', err);
                setFetchError(message);
            } finally {
                setIsLoadingData(false);
            }
        };

        void fetchPaymentDetails();
    }, [receiptId]);

    const handleConfirmPayment = async () => {
        if (!uploadedSlip) {
            window.alert('กรุณาแนบสลิปการโอนเงิน');
            return;
        }
        if (!receiptId) {
            window.alert('ไม่พบข้อมูลรหัสใบเสร็จ');
            return;
        }

        setIsSubmitting(true);
        try {
            const fileExt = uploadedSlip.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `slips/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('Paid_medicine')
                .upload(filePath, uploadedSlip);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error('ไม่สามารถอัปโหลดสลิปได้');
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from('Paid_medicine').getPublicUrl(filePath);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await fetch(`${apiUrl}/appointments/receipts/${receiptId}/pay`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ slipUrl: publicUrl }),
            });

            if (!response.ok) {
                throw new Error('บันทึกข้อมูลการชำระเงินไม่สำเร็จ');
            }

            setStep('success');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการทำรายการ';
            console.error('Payment error:', error);
            window.alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return <PageSkeleton cards={[{ rows: 4 }, { rows: 8 }]} />;
    }

    if (fetchError) {
        return (
            <div className="med-page" style={{ textAlign: 'center', paddingTop: 100 }}>
                <h2 style={{ color: '#ef4444', fontFamily: "'Sarabun', Arial, sans-serif" }}>เกิดข้อผิดพลาด</h2>
                <p style={{ fontFamily: "'Sarabun', Arial, sans-serif" }}>{fetchError}</p>
                <Button onClick={() => router.push('/user/schedule')}>กลับหน้าตารางนัดหมาย</Button>
            </div>
        );
    }

    return (
        <div className="med-page">
            <div className="med-content">
                <div className="med-panel">
                    {step === 'success' ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>OK</div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#065f46', marginBottom: 12 }}>ชำระค่ายาสำเร็จ!</h2>
                            <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 24, lineHeight: 1.6 }}>
                                สลิปการชำระเงินของคุณได้รับการบันทึกแล้ว
                                <br />
                                ยอดชำระ {medicineCost.toLocaleString()} บาท
                            </p>
                            <Button
                                type="primary"
                                size="large"
                                block
                                style={{
                                    background: '#0f766e',
                                    borderColor: '#0f766e',
                                    fontFamily: "'Sarabun', Arial, sans-serif",
                                    height: 48,
                                    fontSize: 16,
                                    fontWeight: 700,
                                    borderRadius: 999,
                                }}
                                onClick={() => router.push('/user/schedule')}
                            >
                                กลับหน้าตารางนัดหมาย
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e1b4b', marginBottom: 8, textAlign: 'center' }}>ชำระค่ายา</h2>
                            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, marginBottom: 24 }}>ชำระเฉพาะค่ายาจากใบสั่งยา</p>

                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>Rx</span> รายการยา
                                </h4>
                                <div style={{ borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: "'Sarabun', Arial, sans-serif" }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>ชื่อยา</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 60 }}>จำนวน</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 90 }}>ราคา/หน่วย</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 90 }}>รวม</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prescriptionItems.map((item, idx) => (
                                                <tr key={`${item.medicationName}-${idx}`} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e1b4b' }}>{item.medicationName}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#374151' }}>{item.quantity}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#374151' }}>{item.price.toLocaleString()} ฿</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0f766e' }}>{(item.price * item.quantity).toLocaleString()} ฿</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div
                                style={{
                                    background: '#f0fdf4',
                                    border: '1.5px solid #a7f3d0',
                                    padding: '16px 20px',
                                    borderRadius: 12,
                                    marginBottom: 24,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{ color: '#4b5563', fontSize: 16, fontWeight: 700 }}>ยอดค่ายาที่ต้องชำระ</span>
                                <span style={{ fontWeight: 800, color: '#059669', fontSize: 22 }}>{medicineCost.toLocaleString()} บาท</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                                <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                                    <QRCode
                                        value={generatePayload('0928104747', { amount: medicineCost })}
                                        size={220}
                                        color="#000"
                                        type="svg"
                                        errorLevel="H"
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    textAlign: 'left',
                                    marginBottom: 32,
                                    background: '#fff',
                                    padding: 20,
                                    borderRadius: 12,
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                }}
                            >
                                <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
                                    แนบสลิปการโอนเงิน <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setUploadedSlip(e.target.files[0]);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontFamily: "'Sarabun', Arial, sans-serif",
                                        border: '2px dashed #d1d5db',
                                        borderRadius: 8,
                                        background: '#f9fafb',
                                        cursor: 'pointer',
                                    }}
                                />
                            </div>

                            <Button
                                type="primary"
                                block
                                size="large"
                                style={{
                                    background: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
                                    border: 'none',
                                    borderRadius: 999,
                                    fontFamily: "'Sarabun', Arial, sans-serif",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    height: 52,
                                    boxShadow: '0 4px 14px rgba(15,118,110,0.25)',
                                }}
                                onClick={handleConfirmPayment}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Spin size="small" /> : 'แจ้งโอนเงินค่ายา'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MedicinePaymentPage() {
    return (
        <ConfigProvider locale={locale}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');

                .med-page {
                    min-height: 100vh;
                    background: #f4efe8;
                    padding: 60px 24px 80px;
                    font-family: 'Sarabun', Arial, sans-serif;
                }
                .med-content {
                    max-width: 640px;
                    margin: 0 auto;
                }
                .med-panel {
                    background: #fff;
                    border-radius: 24px;
                    padding: 40px 36px;
                    box-shadow: 0 4px 24px rgba(99,102,241,0.07);
                }
                @media (max-width: 640px) {
                    .med-panel { padding: 30px 20px; }
                }
            `}</style>
            <Suspense fallback={<PageSkeleton cards={[{ rows: 4 }, { rows: 8 }]} />}>
                <MedicinePaymentContent />
            </Suspense>
        </ConfigProvider>
    );
}
