'use client';

import { useState } from 'react';
import { Modal, Button, Input, DatePicker, ConfigProvider } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import locale from 'antd/locale/th_TH';

dayjs.locale('th');

// ─── Data ────────────────────────────────────────────────────────────────────

const allStaff = [
    {
        id: 1,
        name: 'รศ.พญ.สมชาย ใจดี',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชเด็กและวัยรุ่น',
        image: '/docterProfile/docter1.png',
        slots: ['09:00', '10:00', '11:00', '13:00', '14:00'],
    },
    {
        id: 2,
        name: 'พญ.สมหยิง สนิมจัย',
        role: 'จิตแพทย์',
        specialty: 'ครอบครัว ความสัมพันธ์ ความรัก',
        image: '/docterProfile/docter2.png',
        slots: ['09:00', '10:30', '13:30', '15:00'],
    },
    {
        id: 3,
        name: 'นพ.ลอดช่อง กระด่องแมะ',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชวัยรุ่น ผู้ใหญ่ ผู้สูงอายุ',
        image: '/docterProfile/docter3.png',
        slots: ['08:30', '10:00', '11:30', '14:00', '15:30'],
    },
    {
        id: 4,
        name: 'ดร.สรรสร้าง ส่งสี',
        role: 'นักจิตวิทยา',
        specialty: 'บำบัดความคิดและพฤติกรรม (CBT)',
        image: '/docterProfile/psy1',
        slots: ['09:00', '11:00', '13:00', '15:00'],
    },
    {
        id: 5,
        name: 'ดร.มั่นใจ คารมดี',
        role: 'นักจิตวิทยา',
        specialty: 'ปัญหาความสัมพันธ์',
        image: '/docterProfile/psy2.jfif',
        slots: ['10:00', '11:30', '14:00', '16:00'],
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
    const [mode, setMode] = useState<'staff' | 'time'>('staff');

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
    const [patientName, setPatientName] = useState('');
    const [note, setNote] = useState('');
    const [success, setSuccess] = useState(false);

    const openModal = (b: Booking) => {
        setBooking(b);
        setPatientName('');
        setNote('');
        setSuccess(false);
    };

    const closeModal = () => {
        setBooking(null);
        setSuccess(false);
    };

    const handleConfirm = () => {
        if (!patientName.trim()) return alert('กรุณากรอกชื่อผู้รับบริการ');
        console.log('Booking confirmed:', { ...booking, patientName, note });
        setSuccess(true);
    };

    // reset by-staff flow when staff changes
    const handleSelectStaff = (s: Staff) => {
        setSelectedStaff(s);
        setSelectedDate(null);
        setSelectedTime(null);
    };

    // reset by-time flow when date changes
    const handleTimeDate = (d: Dayjs | null) => {
        setTimeDate(d);
        setTimeStaff(null);
        setTimeSlot(null);
    };

    const disabledDate = (d: Dayjs) =>
        d.isBefore(dayjs().startOf('day')) || d.day() === 0 || d.day() === 6;

    return (
        <ConfigProvider locale={locale}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');

                .appt-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%);
                    padding: 60px 24px 80px;
                    font-family: 'Sarabun', Arial, sans-serif;
                }

                /* ── Header ── */
                .appt-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .appt-header-badge {
                    display: inline-block;
                    background: #0f766e;
                    color: #fff;
                    font-size: 25px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    padding: 5px 18px;
                    border-radius: 999px;
                    margin-bottom: 14px;
                }
                .appt-header h1 {
                    font-size: clamp(28px, 4vw, 44px);
                    font-weight: 800;
                    background: linear-gradient(135deg, #3730a3 0%, #6d28d9 50%, #2563eb 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
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
                    <div className="appt-header-badge">Appointments</div>
                    <h1>จองนัดหมายเพื่อรับคำปรึกษา</h1>
                    <p>เลือกบุคลากรที่คุณต้องการ หรือเลือกวันเวลาที่สะดวก<br />แล้วทำการจองนัดหมาย</p>
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
                                            <h2 style={{ marginTop: 8 }}>เลือกเวลา</h2>
                                            <TimeSlotGrid
                                                slots={selectedStaff.slots}
                                                selected={selectedTime}
                                                onSelect={setSelectedTime}
                                            />
                                        </>
                                    )}

                                    {selectedDate && selectedTime && (
                                        <div style={{ marginTop: 28 }}>
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
                                            </div>
                                            <button
                                                className="appt-book-btn"
                                                onClick={() =>
                                                    openModal({
                                                        staff: selectedStaff,
                                                        date: selectedDate.format('D MMMM BBBB'),
                                                        time: selectedTime,
                                                    })
                                                }
                                            >
                                                จองนัดหมาย →
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
                                    <h2>เวลาที่ว่าง — {timeDate.format('dddd, D MMMM BBBB')}</h2>
                                    {/* Build a flat list: all slots from all staff */}
                                    {(() => {
                                        type SlotEntry = { time: string; staff: Staff };
                                        const entries: SlotEntry[] = [];
                                        allStaff.forEach((s) => {
                                            s.slots.forEach((t) => {
                                                entries.push({ time: t, staff: s });
                                            });
                                        });
                                        entries.sort((a, b) => a.time.localeCompare(b.time));

                                        return entries.map((e, i) => {
                                            const isActive = timeStaff?.id === e.staff.id && timeSlot === e.time;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`appt-time-slot-row${isActive ? ' appt-time-slot-row--active' : ''}`}
                                                    onClick={() => { setTimeStaff(e.staff); setTimeSlot(e.time); }}
                                                >
                                                    <div className="appt-time-dot" />
                                                    <span className="appt-time-label">{e.time}</span>
                                                    <div>
                                                        <div className="appt-time-staff">{e.staff.name}</div>
                                                        <div className="appt-time-role">{e.staff.role} · {e.staff.specialty}</div>
                                                    </div>
                                                    {isActive && (
                                                        <span style={{ marginLeft: 'auto', color: '#0f766e', fontWeight: 700, fontSize: 18 }}>✓</span>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}

                                    {timeStaff && timeSlot && (
                                        <div style={{ marginTop: 24 }}>
                                            <div className="appt-summary-bar">
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">วันที่</span>
                                                    <span className="appt-summary-value">{timeDate.format('D MMMM BBBB')}</span>
                                                </div>
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">เวลา</span>
                                                    <span className="appt-summary-value">{timeSlot} น.</span>
                                                </div>
                                                <div className="appt-summary-item">
                                                    <span className="appt-summary-label">บุคลากร</span>
                                                    <span className="appt-summary-value">{timeStaff.name}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="appt-book-btn"
                                                onClick={() =>
                                                    openModal({
                                                        staff: timeStaff,
                                                        date: timeDate.format('D MMMM BBBB'),
                                                        time: timeSlot,
                                                    })
                                                }
                                            >
                                                จองนัดหมาย →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="appt-panel">
                                    <p className="appt-hint">⬆️ กรุณาเลือกวันที่ เพื่อดูช่วงเวลาที่ว่าง</p>
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
                        📋 ยืนยันการจองนัดหมาย
                    </span>
                }
            >
                {success ? (
                    <div className="appt-success">
                        <div className="appt-success-icon">✅</div>
                        <h3>จองนัดหมายสำเร็จ!</h3>
                        <p>
                            {booking?.date} เวลา {booking?.time} น.<br />
                            กับ {booking?.staff.name}
                        </p>
                        <Button
                            type="primary"
                            size="large"
                            style={{ marginTop: 20, background: '#0f766e', borderColor: '#0f766e', fontFamily: "'Sarabun', Arial, sans-serif" }}
                            onClick={closeModal}
                        >
                            ปิด
                        </Button>
                    </div>
                ) : booking ? (
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
                                <span className="appt-summary-value" style={{ fontSize: 15 }}>{booking.time} น.</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label className="appt-form-label">ชื่อผู้รับบริการ <span style={{ color: '#ef4444' }}>*</span></label>
                            <Input
                                placeholder="กรอกชื่อ-นามสกุล"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                size="large"
                                style={{ fontFamily: "'Sarabun', Arial, sans-serif" }}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label className="appt-form-label">หมายเหตุ / อาการเบื้องต้น</label>
                            <Input.TextArea
                                placeholder="เช่น ความเครียด นอนไม่หลับ ฯลฯ (ไม่จำเป็นต้องกรอก)"
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
                            ยืนยันการจอง
                        </Button>
                    </>
                ) : null}
            </Modal>
        </ConfigProvider>
    );
}
