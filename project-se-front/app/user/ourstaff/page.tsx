'use client';

import { useState, useEffect } from 'react';

interface Staff {
    id: number;
    name: string;
    role: string;
    specialty: string;
    image: string;
}

const roleColorMap: Record<string, { badge: string; accent: string }> = {
    'จิตแพทย์': { badge: '#e0e7ff', accent: '#4f46e5' },
    'นักจิตวิทยา': { badge: '#d1fae5', accent: '#059669' },
};

const App = () => {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStaffs = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const response = await fetch(`${apiUrl}/users/staff`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch staff data');
                }
                
                const data = await response.json();
                setStaffList(data);
            } catch (err: any) {
                console.error('Error fetching staff:', err);
                setError(err.message || 'An error occurred while fetching staff data');
            } finally {
                setLoading(false);
            }
        };

        fetchStaffs();
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');

                .staff-page {
                    min-height: 100vh;
                    background: #f4efe8;
                    padding: 60px 24px 80px;
                    font-family: 'Sarabun', 'Arial', sans-serif;
                }

                .staff-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .staff-header-badge {
                    display: inline-block;
                    background: #0f766e;
                    color: #ffffffff;
                    font-size: 25px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    padding: 5px 18px;
                    border-radius: 999px;
                    margin-bottom: 18px;
                }

                .staff-header h1 {
                    font-size: clamp(28px, 4vw, 44px);
                    font-weight: 800;
                    color: #1a5c4e;
                    margin: 0 0 12px;
                    line-height: 1.7;
                }

                .staff-header p {
                    color: #3a3131ff;
                    font-size: 16px;
                    max-width: 500px;
                    margin: 0 auto;
                    line-height: 1.7;
                    font-weight: 600;
                }

                .staff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 32px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .staff-card {
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 36px 28px 32px;
                    text-align: center;
                    box-shadow: 0 4px 24px rgba(99, 102, 241, 0.07), 0 1px 4px rgba(0,0,0,0.05);
                    border: 1px solid rgba(99, 102, 241, 0.08);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .staff-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 4px;
                    background: #0f766e;
                    border-radius: 24px 24px 0 0;
                }

                .staff-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 48px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(0,0,0,0.08);
                }

                .staff-avatar-wrapper {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 20px;
                }

                .staff-avatar-ring {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    padding: 4px;
                    background: #0f766e;
                    display: inline-block;
                }

                .staff-avatar {
                    width: 132px;
                    height: 132px;
                    border-radius: 50%;
                    object-fit: cover;
                    background: #e0e7ff;
                    display: block;
                    border: 3px solid #ffffff;
                }

                .staff-name {
                    font-size: 22px;
                    font-weight: 800;
                    color: #1e1b4b;
                    margin: 0 0 10px;
                    line-height: 1.3;
                }

                .staff-role-badge {
                    display: inline-block;
                    font-size: 14px;
                    font-weight: 600;
                    padding: 4px 14px;
                    border-radius: 999px;
                    margin-bottom: 10px;
                }

                .staff-specialty {
                    font-size: 15px;
                    color: #413d3dff;
                    line-height: 1.6;
                    margin: 0;
                }

                .loading-container, .error-container {
                    text-align: center;
                    padding: 100px 20px;
                    font-size: 18px;
                    color: #1a5c4e;
                    font-weight: 600;
                }

                .error-container {
                    color: #ef4444;
                }

                @media (max-width: 640px) {
                    .staff-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="staff-page">
                {/* Header Section */}
                <div className="staff-header">
                    <div className="staff-header-badge">Therapists</div>
                    <h1>ทีมแพทย์ และนักจิตวิทยาผู้เชี่ยวชาญของเรา</h1>
                    <p>พร้อมดูแลคุณด้วยความใส่ใจ</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        กำลังโหลดข้อมูลทีมงาน...
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-container">
                        {error}
                    </div>
                )}

                {/* Staff Grid */}
                {!loading && !error && (
                    <div className="staff-grid">
                        {staffList.map((person) => {
                            const colors = roleColorMap[person.role] ?? { badge: '#f3f4f6', accent: '#6b7280' };
                            return (
                                <div className="staff-card" key={person.id}>
                                    <div className="staff-avatar-wrapper">
                                        <div className="staff-avatar-ring">
                                            <img
                                                src={person.image || '/docterProfile/default.png'}
                                                alt={person.name}
                                                className="staff-avatar"
                                                onError={(e) => {
                                                    const target = e.currentTarget as HTMLImageElement;
                                                    target.src = '/docterProfile/default.png';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <p className="staff-name">{person.name}</p>

                                    <span
                                        className="staff-role-badge"
                                        style={{ background: colors.badge, color: colors.accent }}
                                    >
                                        {person.role}
                                    </span>

                                    <p className="staff-specialty">
                                        {person.specialty}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && !error && staffList.length === 0 && (
                    <div className="loading-container">
                        ขณะนี้ยังไม่มีข้อมูลบุคลากรในระบบ
                    </div>
                )}
            </div>
        </>
    );
};

export default App;