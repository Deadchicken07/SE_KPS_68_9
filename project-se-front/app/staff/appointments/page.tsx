'use client'

import { useState } from 'react'
import {
  Avatar,
  Card,
  DatePicker,
  Spin,
  Tag,
  Typography,
} from 'antd'
import {
  ClockCircleOutlined,
  MailOutlined,
  EnvironmentOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { useAppointment } from '@/hooks/useAppointment'

const statusText = {
  pending: 'รอชำระเงิน',
  confirmed: 'ยืนยันแล้ว',
  completed: 'เสร็จสิ้นแล้ว',
} as const

const statusColor = {
  pending: 'gold',
  confirmed: 'green',
  completed: 'default',
} as const

export default function AppointmentPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { error, filteredAppointments, hasAccess, loading } =
    useAppointment(selectedDate)

  if (!hasAccess) {
    return null
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <div
        style={{
          width: '80%',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Card
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 12 }}
          styles={{
            body: {
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            },
          }}
        >
          <DatePicker
            onChange={(date: Dayjs | null) =>
              setSelectedDate(date ? date.format('YYYY-MM-DD') : null)
            }
            placeholder="เลือกวันที่"
            style={{ width: 200 }}
          />

          {error ? (
            <Typography.Text type="danger">{error}</Typography.Text>
          ) : null}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <Spin size="large" />
            </div>
          ) : null}

          {!loading && !filteredAppointments.length ? (
            <Typography.Text type="secondary">
              {selectedDate
                ? 'ไม่พบข้อมูลการนัดหมายในวันที่เลือก'
                : 'ยังไม่มีข้อมูลการนัดหมายของผู้ใช้ที่ล็อกอินอยู่'}
            </Typography.Text>
          ) : null}

          {!loading
            ? filteredAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  hoverable
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderRadius: 8,
                    borderWidth: 2,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <Avatar
                        size={52}
                        src={appointment.avatarUrl ?? undefined}
                        style={{ backgroundColor: '#0f766e', fontSize: 18 }}
                      >
                        {appointment.avatarLabel}
                      </Avatar>

                      <div
                        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                      >
                        <Typography.Text strong style={{ fontSize: 16 }}>
                          {appointment.consultantName}
                        </Typography.Text>

                        <Typography.Text type="secondary">
                          วันที่ {appointment.appointmentDate ?? '-'}
                        </Typography.Text>

                        <Typography.Text type="secondary">
                          <MailOutlined style={{ marginRight: 6 }} />
                          {appointment.contact || '-'}
                        </Typography.Text>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography.Text type="secondary">
                        <ClockCircleOutlined style={{ marginRight: 6 }} />
                        {appointment.timeSelect ?? '-'}
                      </Typography.Text>

                      <Tag
                        icon={
                          appointment.appointmentType === 'online' ? (
                            <WifiOutlined />
                          ) : (
                            <EnvironmentOutlined />
                          )
                        }
                        color={
                          appointment.appointmentType === 'online'
                            ? 'blue'
                            : 'default'
                        }
                      >
                        {appointment.appointmentType === 'online'
                          ? 'ออนไลน์'
                          : appointment.appointmentType === 'onsite'
                            ? 'ที่คลินิก'
                            : '-'}
                      </Tag>

                      <Tag
                        color={statusColor[appointment.status]}
                      >
                        {statusText[appointment.status]}
                      </Tag>

                      <Tag
                        color={
                          appointment.paymentStatus === 'Paid' ? 'green' : 'gold'
                        }
                      >
                        {appointment.paymentStatus === 'Paid'
                          ? 'ชำระแล้ว'
                          : 'รอชำระ'}
                      </Tag>
                    </div>
                  </div>
                </Card>
              ))
            : null}
        </Card>
      </div>
    </div>
  )
}
