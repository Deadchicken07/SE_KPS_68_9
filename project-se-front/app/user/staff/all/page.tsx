import React from 'react';
import { Typography, Avatar, Row, Col, Space } from 'antd';

const { Title, Text } = Typography;

const psychiatrists = [
    {
        id: 1,
        name: 'รศ.พญ.สมชาย ใจดี',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชเด็กและวัยรุ่น',
        image: 'public/docterProfile/docter1.png'
    },
    {
        id: 2,
        name: 'พญ.สมหยิง สนิมจัย',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชวัยรุ่น ผู้ใหญ่ ผู้สูงอายุ',
        image: 'public/docterProfile/docter2.png'
    },
    {
        id: 3,
        name: 'นพ.ลอดช่อง กระด่องแมะ',
        role: 'จิตแพทย์',
        specialty: 'จิตเวชวัยรุ่น ผู้ใหญ่ ผู้สูงอายุ',
        image: 'public/docterProfile/docter3.png'
    },
];

const psychologists = [
    {
        id: 4,
        name: 'ดร.สรรสร้าง ส่งสี',
        role: 'นักจิตวิทยาคลินิก',
        specialty: 'บำบัดความคิดและพฤติกรรม',
        image: 'public/docterProfile/psy1'
    },
    {
        id: 5,
        name: 'ดร.มั่นใจ คารมดี',
        role: 'นักจิตวิทยาการปรึกษา',
        specialty: 'ปัญหาความสัมพันธ์',
        image: 'public/docterProfile/psy2.jfif'
    },
];

const allPersonnel = [...psychiatrists, ...psychologists];

const App = () => {
    return (
        <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', background: '#ffffffff' }}>

            <Row gutter={[40, 60]} justify="center">
                {allPersonnel.map((person) => (
                    <Col xs={24} sm={12} md={8} key={person.id} style={{ textAlign: 'center' }}>

                        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                            <Avatar
                                size={260}
                                src={person.image}
                                style={{
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                    border: '4px solid #fff'
                                }}
                            />

                            <div style={{ marginTop: '10px' }}>
                                <h1 style={{ color: '#2a3b8f', margin: 0, fontWeight: '800', fontSize: '22px' }}>
                                    {person.name}
                                </h1>
                            </div>

                            <div style={{ lineHeight: '1.6' }}>
                                <h1 style={{ display: 'block', fontSize: '18px', color: '#2a3b8f', fontWeight: '600' }}>
                                    {person.role}
                                </h1>
                                <h1 style={{ display: 'block', fontSize: '15px', color: '#333' }}>
                                    {person.specialty}
                                </h1>
                            </div>
                        </Space>

                    </Col>
                ))}
            </Row>

        </div>
    );
};

export default App;