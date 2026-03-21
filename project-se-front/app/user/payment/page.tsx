'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, ConfigProvider, Spin } from 'antd';
import locale from 'antd/locale/th_TH';
import { isSupabaseConfigured, supabase } from '@/utils/supabase';

type AppointmentData = {
    staffName: string;
    date: string;
    time: string;
    duration: number;
    price: number;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState<'payment' | 'success'>('payment');
    const [uploadedSlip, setUploadedSlip] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointment = async () => {
            const id = searchParams.get('id');
            if (!id) {
                setFetchError('Appointment id was not found.');
                setIsLoadingData(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/appointments/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Unable to load appointment details.');
                }

                const data = (await res.json()) as AppointmentData;
                setAppointmentData({
                    staffName: data.staffName,
                    date: data.date,
                    time: data.time,
                    duration: data.duration,
                    price: data.price,
                });
            } catch (error: unknown) {
                console.error('Fetch appointment error:', error);
                setFetchError(getErrorMessage(error, 'Unable to load appointment details.'));
            } finally {
                setIsLoadingData(false);
            }
        };

        void fetchAppointment();
    }, [searchParams]);

    const appointmentId = searchParams.get('id');
    const staffName = appointmentData?.staffName || searchParams.get('staffName') || '';
    const date = appointmentData?.date || searchParams.get('date') || '';
    const time = appointmentData?.time || searchParams.get('time') || '';
    const duration = appointmentData?.duration?.toString() || searchParams.get('duration') || '';
    const price = appointmentData?.price?.toString() || searchParams.get('price') || '0';

    const handleConfirmPayment = async () => {
        if (!uploadedSlip) {
            alert('Please attach a payment slip first.');
            return;
        }

        if (!appointmentId) {
            alert('Appointment id was not found.');
            return;
        }

        if (!isSupabaseConfigured || !supabase) {
            alert('Supabase is not configured for slip uploads yet.');
            return;
        }

        setIsSubmitting(true);
        try {
            const fileExt = uploadedSlip.name.split('.').pop() || 'png';
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
            const filePath = `slips/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('Paid_appointment')
                .upload(filePath, uploadedSlip);

            if (uploadError) {
                throw new Error('Unable to upload the payment slip.');
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from('Paid_appointment').getPublicUrl(filePath);

            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/appointments/${appointmentId}/pay`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ slipUrl: publicUrl }),
            });

            if (!response.ok) {
                throw new Error('Unable to save payment information.');
            }

            setStep('success');
        } catch (error: unknown) {
            console.error('Payment error:', error);
            alert(getErrorMessage(error, 'Payment submission failed.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="appt-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin tip="Loading appointment..." size="large" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="appt-page" style={{ textAlign: 'center', paddingTop: 100 }}>
                <h2 style={{ color: '#ef4444' }}>Unable to continue</h2>
                <p>{fetchError}</p>
                <Button onClick={() => router.push('/user/appointments')}>Back to appointments</Button>
            </div>
        );
    }

    return (
        <div className="appt-page">
            <div className="appt-content" style={{ maxWidth: 600, margin: '0 auto' }}>
                <div className="appt-panel" style={{ textAlign: 'center' }}>
                    {step === 'success' ? (
                        <div className="appt-success">
                            <div className="appt-success-icon" style={{ fontSize: 64, marginBottom: 16 }}>
                                OK
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#065f46', marginBottom: 12 }}>
                                Payment submitted
                            </h2>
                            <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 24, lineHeight: 1.6 }}>
                                {date} at {time}
                                <br />
                                {duration} minutes with {staffName}
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
                                onClick={() => router.push('/user/appointments')}
                            >
                                Back to appointments
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e1b4b', marginBottom: 24 }}>
                                Payment
                            </h2>

                            <div
                                style={{
                                    background: '#f0fdf4',
                                    border: '1px solid #a7f3d0',
                                    padding: 16,
                                    borderRadius: 12,
                                    marginBottom: 24,
                                    textAlign: 'left',
                                }}
                            >
                                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280', fontSize: 14 }}>Staff</span>
                                    <span style={{ fontWeight: 600, color: '#1f2937' }}>{staffName}</span>
                                </div>
                                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280', fontSize: 14 }}>Date and time</span>
                                    <span style={{ fontWeight: 600, color: '#1f2937' }}>
                                        {date} {time} ({duration} min)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: 12,
                                        paddingTop: 12,
                                        borderTop: '1px dashed #d1d5db',
                                    }}
                                >
                                    <span style={{ color: '#4b5563', fontSize: 16, fontWeight: 700 }}>
                                        Total
                                    </span>
                                    <span style={{ fontWeight: 800, color: '#0f766e', fontSize: 18 }}>{price} THB</span>
                                </div>
                            </div>

                            <div style={{ display: 'inline-block', marginBottom: 24 }}>
                                <img
                                    src={`https://promptpay.io/0928104747/${price}`}
                                    alt="PromptPay QR code"
                                    style={{ width: 300, height: 300, objectFit: 'contain', borderRadius: 8 }}
                                />
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
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: '#374151',
                                        marginBottom: 12,
                                    }}
                                >
                                    Upload slip <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        if (event.target.files?.length) {
                                            setUploadedSlip(event.target.files[0]);
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
                                {isSubmitting ? <Spin size="small" /> : 'Submit payment'}
                            </Button>

                            <Button
                                type="text"
                                block
                                style={{
                                    marginTop: 12,
                                    color: '#6b7280',
                                    fontFamily: "'Sarabun', Arial, sans-serif",
                                    fontWeight: 600,
                                }}
                                onClick={() => router.push('/user/appointments')}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <ConfigProvider locale={locale}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');

                .appt-page {
                    min-height: 100vh;
                    background: #f4efe8;
                    padding: 60px 24px 80px;
                    font-family: 'Sarabun', Arial, sans-serif;
                }
                .appt-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .appt-panel {
                    background: #fff;
                    border-radius: 24px;
                    padding: 40px 36px;
                    box-shadow: 0 4px 24px rgba(99,102,241,0.07);
                }
                @media (max-width: 640px) {
                    .appt-panel { padding: 30px 20px; }
                }
            `}</style>
            <Suspense
                fallback={
                    <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Sarabun', Arial, sans-serif" }}>
                        Loading...
                    </div>
                }
            >
                <PaymentContent />
            </Suspense>
        </ConfigProvider>
    );
}
