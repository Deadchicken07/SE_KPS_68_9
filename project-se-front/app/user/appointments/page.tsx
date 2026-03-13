'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Input, DatePicker, ConfigProvider } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import Badge from '@/components/ui/Badge';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import locale from 'antd/locale/th_TH';

const API_BASE_URL = 'http://localhost:4000';

dayjs.extend(buddhistEra);
dayjs.locale('th');

// ─── Data ────────────────────────────────────────────────────────────────────

const allStaff = [
    {
        id: 1,
        name: 'รศ.นพ.สมชาย ใจดี',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชเด็กและวัยรุ่น',
        image: '/docterProfile/docter1.jpeg',
        slots: ['09:00', '10:00', '11:00', '13:00', '14:00'],
    },
    {
        id: 2,
        name: 'พญ.สมหยิง สนิมจัย',
        role: 'จิตแพทย์',
        specialty: 'ครอบครัว ความสัมพันธ์ ความรัก',
        image: '/docterProfile/docter2.png',
        slots: ['09:00', '10:00', '13:00', '15:00', '16:00'],
    },
    {
        id: 3,
        name: 'นพ.ลอดช่อง กระด่องแมะ',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชวัยรุ่น ผู้ใหญ่ ผู้สูงอายุ',
        image: '/docterProfile/docter3.png',
        slots: ['10:00', '11:00', '14:00', '15:00', '17:00'],
    },
    {
        id: 4,
        name: 'ดร.สรรสร้าง ส่งสี',
        role: 'นักจิตวิทยา',
        specialty: 'บำบัดความคิดและพฤติกรรม',
        image: '/docterProfile/psy1',
        slots: ['09:00', '11:00', '13:00', '15:00', '16:00'],
    },
    {
        id: 5,
        name: 'ดร.มั่นใจ คารมดี',
        role: 'นักจิตวิทยา',
        specialty: 'ปัญหาความสัมพันธ์',
        image: '/docterProfile/psy2.jfif',
        slots: ['10:00', '11:00', '14:00', '16:00', '17:00'],
    },
];

const roleColor: Record<string, { badge: string; accent: string }> = {
    'จิตแพทย์': { badge: '#e0e7ff', accent: '#4f46e5' },
    'นักจิตวิทยา': { badge: '#d1fae5', accent: '#059669' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Staff = (typeof allStaff)[number];

interface Booking {
    staff: Staff;
    date: string;
    time: string;
    duration: number;
    price: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StaffCard({
    person,
    selected,
    onClick,
}: {
    person: Staff;
    selected: boolean;
    onClick: () => void;
}) {
    const colors = roleColor[person.role] ?? { badge: '#f3f4f6', accent: '#6b7280' };
    return (
        <div
            className={`appt-staff-card${selected ? ' appt-staff-card--selected' : ''}`}
            onClick={onClick}
        >
            <div className="appt-avatar-ring">
                <img
                    src={person.image}
                    alt={person.name}
                    className="appt-avatar"
                    onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement;
                        t.src = '';
                        t.style.background = '#e0e7ff';
                    }}
                />
            </div>
            <p className="appt-staff-name">{person.name}</p>
            <span
                className="appt-role-badge"
                style={{ background: colors.badge, color: colors.accent }}
            >
                {person.role}
            </span>
            <p className="appt-specialty">{person.specialty}</p>
        </div>
    );
}

function TimeSlotGrid({
    slots,
    selected,
    onSelect,
}: {
    slots: string[];
    selected: string | null;
    onSelect: (t: string) => void;
}) {
    return (
        <div className="appt-slots-grid">
            {slots.map((t) => (
                <button
                    key={t}
                    className={`appt-slot-btn${selected === t ? ' appt-slot-btn--active' : ''}`}
                    onClick={() => onSelect(t)}
                >
                    {t}
                </button>
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
    const router = useRouter();
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [mode, setMode] = useState<'staff' | 'time'>('staff');

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Unauthorized');
                }

                if (isMounted) {
                    setIsAuthChecking(false);
                }
            } catch {
                if (!isMounted) {
                    return;
                }

                Modal.confirm({
                    title: 'กรุณาเข้าสู่ระบบก่อน',
                    content: 'คุณต้องเข้าสู่ระบบก่อนจึงจะเข้าใช้งานหน้านัดหมายได้',
                    okText: 'เข้าสู่ระบบ',
                    cancelText: 'กลับหน้าหลัก',
                    centered: true,
                    onOk: () => {
                        router.replace('/login?redirect=/user/appointments');
                    },
                    onCancel: () => {
                        router.replace('/user');
                    },
                });
            }
        };

        void checkAuth();

        return () => {
            isMounted = false;
            Modal.destroyAll();
        };
    }, [router]);

    const [selectedDuration, setSelectedDuration] = useState<number>(30);

    const calculatePrice = (role: string, duration: number) => {
        const basePrice30 = role === 'จิตแพทย์' ? 1000 : 500;
        return duration === 60 ? basePrice30 * 2 : basePrice30;
    };

    // By-staff flow
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // By-time flow
    const [timeDate, setTimeDate] = useState<Dayjs | null>(null);
    const [timeStaff, setTimeStaff] = useState<Staff | null>(null);
    const [timeSlot, setTimeSlot] = useState<string | null>(null);

    // Confirmation modal
    const [booking, setBooking] = useState<Booking | null>(null);
    const [note, setNote] = useState('');

    const openModal = (b: Booking) => {
        setBooking(b);
        setNote('');
    };

    const closeModal = () => {
        setBooking(null);
    };

    const handleConfirm = () => {
        if (!booking) return;
        const params = new URLSearchParams({
            staffId: booking.staff.id.toString(),
            staffName: booking.staff.name,
            role: booking.staff.role,
            date: booking.date,
            time: booking.time,
            duration: booking.duration.toString(),
            price: booking.price.toString(),
            note: note,
        });
        router.push(`/user/payment?${params.toString()}`);
    };

    // reset by-staff flow when staff changes
    const handleSelectStaff = (s: Staff) => {
        setSelectedStaff(s);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedDuration(30);
    };

    // reset by-time flow when date changes
    const handleTimeDate = (d: Dayjs | null) => {
        setTimeDate(d);
        setTimeStaff(null);
        setTimeSlot(null);
        setSelectedDuration(30);
    };

    const handleTimeSlot = (t: string) => {
        setTimeSlot(t);
        setTimeStaff(null); // Reset staff when time changes
    };

    const disabledDate = (d: Dayjs) =>
        d.isBefore(dayjs().startOf('day')) || d.day() === 0 || d.day() === 6;

    if (isAuthChecking) {
        return null;
    }

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

                /* ── Header ── */
                .appt-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .appt-header h1 {
                    font-size: clamp(28px, 4vw, 44px);
                    font-weight: 800;
                    color: #1a5c4e;
                    margin: 0 0 12px;
                    line-height: 1.7;
                }
                .appt-header p {
                    color: #3a3131ff;
                    font-size: 16px;
                    max-width: 500px;
                    margin: 0 auto;
                    line-height: 1.7;
                    font-weight: 600;
                }

                /* ── Mode toggle ── */
                .appt-toggle {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 40px;
                    flex-wrap: wrap;
                }
                .appt-toggle-btn {
                    padding: 12px 28px;
                    border-radius: 999px;
                    border: 2px solid #0f766e;
                    background: transparent;
                    color: #0f766e;
                    font-family: 'Sarabun', Arial, sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .appt-toggle-btn--active {
                    background: #0f766e;
                    color: #fff;
                    box-shadow: 0 4px 16px rgba(15,118,110,0.3);
                }
                .appt-toggle-btn:hover:not(.appt-toggle-btn--active) {
                    background: #f0fdf4;
                }

                /* ── Content container ── */
                .appt-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* ── Staff cards ── */
                .appt-staff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 32px;
                    margin-bottom: 36px;
                }
                .appt-staff-card {
                    background: #fff;
                    border-radius: 24px;
                    padding: 36px 28px 32px;
                    text-align: center;
                    box-shadow: 0 4px 24px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.05);
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .appt-staff-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 4px;
                    background: #0f766e;
                    border-radius: 20px 20px 0 0;
                }
                .appt-staff-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 12px 36px rgba(15,118,110,0.15);
                }
                .appt-staff-card--selected {
                    border-color: #0f766e;
                    box-shadow: 0 0 0 3px rgba(15,118,110,0.18), 0 8px 32px rgba(15,118,110,0.18);
                    transform: translateY(-4px);
                }
                .appt-avatar-ring {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    padding: 4px;
                    background: #0f766e;
                    display: inline-block;
                    margin-bottom: 20px;
                }
                .appt-avatar {
                    width: 132px;
                    height: 132px;
                    border-radius: 50%;
                    object-fit: cover;
                    background: #e0e7ff;
                    display: block;
                    border: 3px solid #fff;
                }
                .appt-staff-name {
                    font-size: 22px;
                    font-weight: 800;
                    color: #1e1b4b;
                    margin: 0 0 10px;
                    line-height: 1.3;
                }
                .appt-role-badge {
                    display: inline-block;
                    font-size: 14px;
                    font-weight: 600;
                    padding: 4px 14px;
                    border-radius: 999px;
                    margin-bottom: 10px;
                }
                .appt-specialty {
                    font-size: 15px;
                    color: #6b7280;
                    line-height: 1.6;
                    margin: 0;
                    flex-grow: 1;
                }

                /* ── Section card (date/slot/summary panel) ── */
                .appt-panel {
                    background: #fff;
                    border-radius: 24px;
                    padding: 32px 36px;
                    box-shadow: 0 4px 24px rgba(99,102,241,0.07);
                    margin-bottom: 28px;
                }
                .appt-panel h2 {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e1b4b;
                    margin: 0 0 20px;
                }

                /* ── Time slots ── */
                .appt-slots-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 16px;
                }
                .appt-slot-btn {
                    padding: 8px 20px;
                    border-radius: 999px;
                    border: 2px solid #d1d5db;
                    background: #fff;
                    color: #374151;
                    font-family: 'Sarabun', Arial, sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .appt-slot-btn:hover {
                    border-color: #0f766e;
                    color: #0f766e;
                    background: #f0fdf4;
                }
                .appt-slot-btn--active {
                    background: #0f766e;
                    border-color: #0f766e;
                    color: #fff;
                    box-shadow: 0 2px 10px rgba(15,118,110,0.25);
                }

                /* ── Time-mode slot rows ── */
                .appt-time-slot-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 14px 20px;
                    border-radius: 14px;
                    border: 2px solid #e5e7eb;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: #fff;
                }
                .appt-time-slot-row:hover {
                    border-color: #0f766e;
                    background: #f0fdf4;
                }
                .appt-time-slot-row--active {
                    border-color: #0f766e;
                    background: #f0fdf4;
                    box-shadow: 0 0 0 3px rgba(15,118,110,0.12);
                }
                .appt-time-dot {
                    width: 12px; height: 12px;
                    border-radius: 50%;
                    background: #0f766e;
                    flex-shrink: 0;
                }
                .appt-time-label {
                    font-size: 17px;
                    font-weight: 700;
                    color: #0f766e;
                    min-width: 56px;
                }
                .appt-time-staff {
                    font-size: 14px;
                    color: #374151;
                    font-weight: 500;
                }
                .appt-time-role {
                    font-size: 12px;
                    color: #6b7280;
                }

                /* ── Book button ── */
                .appt-book-btn {
                    display: block;
                    width: 100%;
                    max-width: 320px;
                    margin: 8px auto 0;
                    padding: 14px 0;
                    border-radius: 999px;
                    border: none;
                    background: linear-gradient(135deg, #0f766e 0%, #059669 100%);
                    color: #fff;
                    font-family: 'Sarabun', Arial, sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: opacity 0.2s ease, transform 0.2s ease;
                    box-shadow: 0 4px 18px rgba(15,118,110,0.3);
                }
                .appt-book-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
                .appt-book-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    transform: none;
                }

                /* ── Hint text ── */
                .appt-hint {
                    text-align: center;
                    color: #9ca3af;
                    font-size: 15px;
                    padding: 32px 0;
                }

                /* ── Summary bar ── */
                .appt-summary-bar {
                    display: flex;
                    gap: 24px;
                    flex-wrap: wrap;
                    background: #f0fdf4;
                    border: 1.5px solid #a7f3d0;
                    border-radius: 16px;
                    padding: 16px 24px;
                    margin-bottom: 24px;
                    align-items: center;
                }
                .appt-summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .appt-summary-label {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .appt-summary-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: #065f46;
                }

                /* ── Modal success ── */
                .appt-success {
                    text-align: center;
                    padding: 16px 0 8px;
                }
                .appt-success-icon {
                    font-size: 56px;
                    margin-bottom: 12px;
                }
                .appt-success h3 {
                    font-size: 22px;
                    font-weight: 800;
                    color: #065f46;
                    margin: 0 0 8px;
                }
                .appt-success p {
                    color: #6b7280;
                    font-size: 15px;
                }

                /* ── Form label ── */
                .appt-form-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 6px;
                    display: block;
                }

                @media (max-width: 640px) {
                    .appt-staff-grid { grid-template-columns: 1fr 1fr; }
                    .appt-panel { padding: 22px 18px; }
                    .appt-summary-bar { flex-direction: column; gap: 12px; }
                }
                @media (max-width: 400px) {
                    .appt-staff-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="appt-page">
                {/* Header */}
                <div className="appt-header">
                    <Badge style={{ marginBottom: 14 }}>Appointments</Badge>
                    <h1>จองนัดหมายเพื่อรับคำปรึกษา</h1>
                    <p>เลือกบุคลากรที่คุณต้องการ หรือเลือกวันเวลาที่สะดวก<br />แล้วทำการจองนัดหมาย</p>

                    <div style={{ marginTop: 20 }}>
                        <button
                            onClick={() => router.push('/user/schedule')}
                            style={{
                                background: '#fff',
                                color: '#0f766e',
                                border: '2px solid #0f766e',
                                padding: '10px 24px',
                                borderRadius: 999,
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: 'pointer',
                                fontFamily: "'Sarabun', Arial, sans-serif",
                                boxShadow: '0 2px 8px rgba(15,118,110,0.1)',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                        >
                            ดูการนัดหมายของฉัน
                        </button>
                    </div>
                </div>

                {/* Mode toggle */}
                <div className="appt-toggle">
                    <button
                        className={`appt-toggle-btn${mode === 'staff' ? ' appt-toggle-btn--active' : ''}`}
                        onClick={() => { setMode('staff'); setSelectedStaff(null); setSelectedDate(null); setSelectedTime(null); }}
                    >
                        เลือกบุคลากร
                    </button>
                    <button
                        className={`appt-toggle-btn${mode === 'time' ? ' appt-toggle-btn--active' : ''}`}
                        onClick={() => { setMode('time'); setTimeDate(null); setTimeStaff(null); setTimeSlot(null); }}
                    >
                        เลือกเวลา
                    </button>
                </div>

                <div className="appt-content">

                    {/* ═══════════════ BY STAFF MODE ═══════════════ */}
                    {mode === 'staff' && (
                        <>
                            <div style={{ marginBottom: 36 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 20 }}>เลือกบุคลากร</h2>
                                <div className="appt-staff-grid">
                                    {allStaff.map((s) => (
                                        <StaffCard
                                            key={s.id}
                                            person={s}
                                            selected={selectedStaff?.id === s.id}
                                            onClick={() => handleSelectStaff(s)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {selectedStaff && (
                                <div className="appt-panel">
                                    <h2>เลือกวันที่นัดหมาย — {selectedStaff.name}</h2>
                                    <DatePicker
                                        disabledDate={disabledDate}
                                        value={selectedDate}
                                        onChange={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                                        placeholder="เลือกวันที่"
                                        style={{ width: 220, marginBottom: 20 }}
                                        size="large"
                                    />

                                    {selectedDate && (
                                        <>
                                            <h2 style={{ marginTop: 8 }}>เวลา</h2>
                                            <TimeSlotGrid
                                                slots={selectedStaff.slots}
                                                selected={selectedTime}
                                                onSelect={setSelectedTime}
                                            />
                                        </>
                                    )}

                                    {selectedDate && selectedTime && (
                                        <div style={{ marginTop: 28 }}>
                                            <div style={{ marginBottom: 20 }}>
                                                <h2>ระยะเวลาเข้ารับคำปรึกษา</h2>
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    <button
                                                        className={`appt-slot-btn${selectedDuration === 30 ? ' appt-slot-btn--active' : ''}`}
                                                        onClick={() => setSelectedDuration(30)}
                                                    >
                                                        30 นาที
                                                    </button>
                                                    <button
                                                        className={`appt-slot-btn${selectedDuration === 60 ? ' appt-slot-btn--active' : ''}`}
                                                        onClick={() => setSelectedDuration(60)}
                                                    >
                                                        60 นาที
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="appt-summary-bar">
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">บุคลากร</span>
                                                    <span className="appt-summary-value">{selectedStaff.name}</span>
                                                </div>
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">วันที่</span>
                                                    <span className="appt-summary-value">{selectedDate.format('D MMMM BBBB')}</span>
                                                </div>
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">เวลา</span>
                                                    <span className="appt-summary-value">{selectedTime} น.</span>
                                                </div>
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">ราคา</span>
                                                    <span className="appt-summary-value" style={{ color: '#0f766e' }}>{calculatePrice(selectedStaff.role, selectedDuration)} บาท</span>
                                                </div>
                                            </div>
                                            <button
                                                className="appt-book-btn"
                                                onClick={() =>
                                                    openModal({
                                                        staff: selectedStaff,
                                                        date: selectedDate.format('D MMMM BBBB'),
                                                        time: selectedTime,
                                                        duration: selectedDuration,
                                                        price: calculatePrice(selectedStaff.role, selectedDuration),
                                                    })
                                                }
                                            >
                                                จองนัดหมาย
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ═══════════════ BY TIME MODE ═══════════════ */}
                    {mode === 'time' && (
                        <>
                            <div className="appt-panel">
                                <h2>เลือกวันที่</h2>
                                <DatePicker
                                    disabledDate={disabledDate}
                                    value={timeDate}
                                    onChange={handleTimeDate}
                                    placeholder="เลือกวันที่"
                                    style={{ width: 220 }}
                                    size="large"
                                />
                            </div>

                            {timeDate ? (
                                <div className="appt-panel">
                                    <h2>เลือกเวลา — {timeDate.format('dddd, D MMMM BBBB')}</h2>
                                    {(() => {
                                        // Collect all unique available times
                                        const uniqueTimes = Array.from(new Set(allStaff.flatMap(s => s.slots))).sort((a, b) => a.localeCompare(b));

                                        return (
                                            <TimeSlotGrid
                                                slots={uniqueTimes}
                                                selected={timeSlot}
                                                onSelect={handleTimeSlot}
                                            />
                                        );
                                    })()}

                                    {timeSlot && (
                                        <div style={{ marginTop: 36 }}>
                                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 20 }}>บุคลากรที่ว่างเวลา {timeSlot} น.</h2>
                                            {(() => {
                                                const availableStaff = allStaff.filter(s => s.slots.includes(timeSlot));
                                                return (
                                                    <div className="appt-staff-grid">
                                                        {availableStaff.map((s) => (
                                                            <StaffCard
                                                                key={s.id}
                                                                person={s}
                                                                selected={timeStaff?.id === s.id}
                                                                onClick={() => setTimeStaff(s)}
                                                            />
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {timeStaff && timeSlot && (
                                        <div style={{ marginTop: 28 }}>
                                            <div style={{ marginBottom: 20 }}>
                                                <h2>ระยะเวลาเข้ารับคำปรึกษา</h2>
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    <button
                                                        className={`appt-slot-btn${selectedDuration === 30 ? ' appt-slot-btn--active' : ''}`}
                                                        onClick={() => setSelectedDuration(30)}
                                                    >
                                                        30 นาที
                                                    </button>
                                                    <button
                                                        className={`appt-slot-btn${selectedDuration === 60 ? ' appt-slot-btn--active' : ''}`}
                                                        onClick={() => setSelectedDuration(60)}
                                                    >
                                                        60 นาที
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="appt-summary-bar">
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">บุคลากร</span>
                                                    <span className="appt-summary-value">{timeStaff.name}</span>
                                                </div>
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">วันที่</span>
                                                    <span className="appt-summary-value">{timeDate.format('D MMMM BBBB')}</span>
                                                </div>
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">เวลา</span>
                                                    <span className="appt-summary-value">{timeSlot} น.</span>
                                                </div>
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">ราคา</span>
                                                    <span className="appt-summary-value" style={{ color: '#0f766e' }}>{calculatePrice(timeStaff.role, selectedDuration)} บาท</span>
                                                </div>
                                            </div>
                                            <button
                                                className="appt-book-btn"
                                                onClick={() =>
                                                    openModal({
                                                        staff: timeStaff,
                                                        date: timeDate.format('D MMMM BBBB'),
                                                        time: timeSlot,
                                                        duration: selectedDuration,
                                                        price: calculatePrice(timeStaff.role, selectedDuration),
                                                    })
                                                }
                                            >
                                                จองนัดหมาย
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="appt-panel">
                                    <p className="appt-hint">กรุณาเลือกวันที่ เพื่อดูช่วงเวลาที่ว่าง</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ═══════════════ CONFIRMATION MODAL ═══════════════ */}
            <Modal
                open={!!booking}
                onCancel={closeModal}
                footer={null}
                centered
                width={480}
                styles={{ body: { fontFamily: "'Sarabun', Arial, sans-serif" } }}
                title={
                    <span style={{ fontFamily: "'Sarabun', Arial, sans-serif", fontWeight: 700, fontSize: 18 }}>
                        ยืนยันการจองนัดหมาย
                    </span>
                }
            >
                {booking ? (
                    <>
                        <div className="appt-summary-bar" style={{ marginBottom: 20 }}>
                            <div className="appt-summary-item">
                                <span className="appt-summary-label">บุคลากร</span>
                                <span className="appt-summary-value" style={{ fontSize: 15 }}>{booking.staff.name}</span>
                            </div>
                            <div className="appt-summary-item">
                                <span className="appt-summary-label">วันที่</span>
                                <span className="appt-summary-value" style={{ fontSize: 15 }}>{booking.date}</span>
                            </div>
                            <div className="appt-summary-item">
                                <span className="appt-summary-label">เวลา</span>
                                <span className="appt-summary-value" style={{ fontSize: 15 }}>{booking.time} น. ({booking.duration} นาที)</span>
                            </div>
                            <div className="appt-summary-item">
                                <span className="appt-summary-label">ราคา</span>
                                <span className="appt-summary-value" style={{ fontSize: 15, color: '#0f766e' }}>{booking.price} บาท</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label className="appt-form-label">หมายเหตุ / อาการเบื้องต้น</label>
                            <Input.TextArea
                                placeholder="เช่น ความเครียด นอนไม่หลับ ความสัมพันธ์ ฯลฯ"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                style={{ fontFamily: "'Sarabun', Arial, sans-serif" }}
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
                                height: 48,
                            }}
                            onClick={handleConfirm}
                        >
                            ยืนยัน และดำเนินการชำระเงิน
                        </Button>
                    </>
                ) : null}
            </Modal>
        </ConfigProvider>
    );
}
