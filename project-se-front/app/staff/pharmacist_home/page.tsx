'use client'

import { Card, Spin, Typography } from 'antd'
import {
  EmptyState,
  PharmacistHomeDetailModal,
  PharmacistHomeMetricCard,
  PharmacistHomeQueueCard,
} from '@/components/staff/PharmacistHome'
import { usePharmacistHome } from '@/hooks/usePharmacistHome'

export default function PharmacistHomePage() {
  const {
    clinicPickupCount,
    currentUserId,
    error,
    filteredConsultations,
    generatedAtLabel,
    hasAccess,
    isDetailModalOpen,
    loading,
    onlineDeliveryCount,
    openConsultation,
    openOrderPage,
    queueCount,
    selected,
    closeDetailModal,
  } = usePharmacistHome()

  if (!hasAccess) {
    return null
  }

  return (
    <main className="staff-shell">
      <section className="staff-page-header">
        <Typography.Text className="staff-kicker">
          STAFF / PHARMACIST / DASHBOARD
        </Typography.Text>
        <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
          รายการคิวจ่ายยา
        </Typography.Title>
        <Typography.Text className="staff-section-muted">
          อัปเดตล่าสุด {generatedAtLabel}
        </Typography.Text>
      </section>

      <section className="staff-stats-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PharmacistHomeMetricCard label="คิวทั้งหมด" value={queueCount} />
        <PharmacistHomeMetricCard
          label="คิวจัดส่งออนไลน์"
          value={onlineDeliveryCount}
        />
        <PharmacistHomeMetricCard
          label="คิวรับที่คลินิก"
          value={clinicPickupCount}
        />
      </section>

      {error ? (
        <Card className="staff-content-card" variant="borderless">
          <Typography.Text type="danger">{error}</Typography.Text>
        </Card>
      ) : null}

      {loading ? (
        <Card className="staff-content-card" variant="borderless">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div>
              <Spin size="large" />
            </div>
            <Typography.Text className="staff-section-muted">
              กำลังโหลดข้อมูลคิวจ่ายยา...
            </Typography.Text>
          </div>
        </Card>
      ) : null}

      {!loading ? (
        <section className="space-y-6">
          <Card
            className="staff-content-card"
            variant="borderless"
            styles={{ body: { padding: 0 } }}
          >
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    รายการคิวแบบกดดูรายละเอียด
                  </Typography.Title>
                  <Typography.Text className="staff-section-muted">
                    แสดงเฉพาะเคสที่ยังต้องดำเนินการ กดที่แต่ละแถวเพื่อเปิดรายละเอียด
                  </Typography.Text>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {filteredConsultations.length}
                </span>
              </div>
            </div>

            <div className="max-h-[780px] overflow-y-auto p-3">
              {filteredConsultations.length ? (
                <div className="space-y-3">
                  {filteredConsultations.map((consultation) => (
                    <PharmacistHomeQueueCard
                      key={consultation.id}
                      active={consultation.id === selected?.id}
                      consultation={consultation}
                      currentUserId={currentUserId}
                      onOpen={openConsultation}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-3">
                  <EmptyState body="ไม่พบคิวที่ตรงกับคำค้นหาหรือสถานะปัจจุบัน" />
                </div>
              )}
            </div>
          </Card>

          <PharmacistHomeDetailModal
            consultation={selected}
            currentUserId={currentUserId}
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            onGoToOrder={openOrderPage}
          />
        </section>
      ) : null}
    </main>
  )
}
