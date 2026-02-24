'use client';

const psychiatrists = [
    {
        id: 1,
        name: 'รศ.พญ.สมชาย ใจดี',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชเด็กและวัยรุ่น',
        image: '/docterProfile/docter1.png'
    },
    {
        id: 2,
        name: 'พญ.สมหยิง สนิมจัย',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชวัยรุ่น ผู้ใหญ่ ผู้สูงอายุ',
        image: '/docterProfile/docter2.png'
    },
    {
        id: 3,
        name: 'นพ.ลอดช่อง กระด่องแมะ',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชวัยรุ่น ผู้ใหญ่ ผู้สูงอายุ',
        image: '/docterProfile/docter3.png'
    },
];

const psychologists = [
    {
        id: 4,
        name: 'ดร.สรรสร้าง ส่งสี',
        role: 'นักจิตวิทยา',
        specialty: 'บำบัดความคิดและพฤติกรรม',
        image: '/docterProfile/psy1'
    },
    {
        id: 5,
        name: 'ดร.มั่นใจ คารมดี',
        role: 'นักจิตวิทยา',
        specialty: 'ปัญหาความสัมพันธ์',
        image: '/docterProfile/psy2.jfif'
    },
];

const allPersonnel = [...psychiatrists, ...psychologists];

const roleColorMap: Record<string, { badge: string; accent: string }> = {
    'จิตแพทย์': { badge: '#e0e7ff', accent: '#4f46e5' },
    'นักจิตวิทยา': { badge: '#d1fae5', accent: '#059669' },
};

const App = () => {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');

                .staff-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%);
                    padding: 60px 24px 80px;
                    font-family: 'Sarabun', 'Arial', sans-serif;
                }

                .staff-header {
                    text-align: center;
                    margin-bottom: 56px;
                }

                .staff-header-badge {
                    display: inline-block;
                    background: #3fb8f0ff;
                    color: #ffffffff;
                    font-size: 35px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    padding: 6px 20px;
                    border-radius: 999px;
                    margin-bottom: 18px;
                }

                .staff-header h1 {
                    font-size: clamp(32px, 5vw, 52px);
                    font-weight: 800;
                    background: linear-gradient(135deg, #3730a3 0%, #6d28d9 50%, #2563eb 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0 0 14px;
                    line-height: 1.2;
                }

                .staff-header-description {
                    color: #000000ff;
                    font-size: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.7;
                }

                .staff-header p {
                    color: #3a3131ff;
                    font-size: 16px;
                    max-width: 480px;
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
                    background: #3fb8f0ff;
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
                    background: #3fb8f0ff;
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

                .staff-avatar-fallback {
                    width: 132px;
                    height: 132px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #c7d2fe, #ddd6fe);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
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
                    <p>ทีมแพทย์ และนักจิตวิทยาผู้เชี่ยวชาญของเรา <br />พร้อมดูแลคุณด้วยความใส่ใจ</p>
                </div>

                {/* Staff Grid */}
                <div className="staff-grid">
                    {allPersonnel.map((person) => {
                        const colors = roleColorMap[person.role] ?? { badge: '#f3f4f6', accent: '#6b7280' };
                        return (
                            <div className="staff-card" key={person.id}>
                                <div className="staff-avatar-wrapper">
                                    <div className="staff-avatar-ring">
                                        <img
                                            src={person.image}
                                            alt={person.name}
                                            className="staff-avatar"
                                            onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
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
            </div>
        </>
    );
};

export default App;