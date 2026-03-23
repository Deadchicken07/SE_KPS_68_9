import type { ReactNode } from 'react'
import { Button, Card, Typography } from 'antd'
import type { PharmacistHomeConsultation } from '@/types/pharmacist.types'
import {
  PHARMACIST_HOME_STATUS_META,
  formatPharmacistHomeDateTime,
  formatPharmacistHomeMoney,
  latestPharmacistHomeReceipt,
  pharmacistHomeConsultationTotal,
  pharmacistHomeDeliveryModeLabel,
  pharmacistHomeDisplayStatus,
  pharmacistHomeFullName,
  pharmacistHomeMedicationComment,
  pharmacistHomeMedicationName,
  pharmacistHomeQueueOwnerLabel,
  pharmacistHomeTextValue,
} from '@/utils/pharmacistHome'

const PHARMA_SURFACE = 'border-slate-200 bg-white'
const PHARMA_SOFT_SURFACE = 'border-slate-200 bg-slate-50'
const PHARMA_TEXT = 'text-slate-900'
const PHARMA_MUTED = 'text-slate-500'
const PHARMA_SECONDARY = 'text-slate-600'

export function PharmacistHomeMetricCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <Card className="staff-stat-card" variant="borderless">
      <Typography.Text className={PHARMA_MUTED}>{label}</Typography.Text>
      <Typography.Title level={2} style={{ margin: '8px 0 0' }}>
        {value}
      </Typography.Title>
    </Card>
  )
}

export function PharmacistHomeQueueCard({
  active,
  consultation,
  currentUserId,
  onOpen,
}: {
  active: boolean
  consultation: PharmacistHomeConsultation
  currentUserId?: number | null
  onOpen: (consultationId: number) => void
}) {
  const status = pharmacistHomeDisplayStatus(consultation)

  return (
    <button
      type="button"
      onClick={() => onOpen(consultation.id)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        active
          ? 'border-[#0f766e] bg-[#e6fffb] text-slate-900 shadow-sm'
          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 xl:w-[240px]">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
              active ? 'text-[#0f766e]' : PHARMA_MUTED
            }`}
          >
            Case #{consultation.id}
          </p>
          <p className="mt-2 truncate text-base font-semibold">
            {pharmacistHomeFullName(consultation.patient)}
          </p>
          <p
            className={`mt-1 truncate text-sm ${
              active ? 'text-slate-600' : PHARMA_MUTED
            }`}
          >
            {pharmacistHomeTextValue(
              consultation.patient?.phone || consultation.patient?.email,
            )}
          </p>
        </div>

        <div className="grid flex-1 gap-2 sm:grid-cols-2 2xl:grid-cols-4">
          <QueueMeta
            label="รูปแบบ"
            value={pharmacistHomeDeliveryModeLabel(status)}
            active={active}
          />
          <QueueMeta
            label="ผู้รับคิว"
            value={pharmacistHomeQueueOwnerLabel(consultation, currentUserId)}
            active={active}
          />
          <QueueMeta
            label="ผู้ให้คำปรึกษา"
            value={pharmacistHomeFullName(consultation.staff)}
            active={active}
          />
          <QueueMeta
            label="ยอดรวม"
            value={formatPharmacistHomeMoney(
              pharmacistHomeConsultationTotal(consultation),
            )}
            active={active}
          />
        </div>

        <div className="flex min-w-[220px] flex-col items-start gap-3 xl:items-end">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              active
                ? 'border-[#99f6e4] bg-white text-[#0f766e]'
                : PHARMACIST_HOME_STATUS_META[status].tone
            }`}
          >
            {PHARMACIST_HOME_STATUS_META[status].label}
          </span>

          <div
            className={`flex flex-wrap items-center gap-2 text-xs ${
              active ? 'text-slate-600' : PHARMA_MUTED
            }`}
          >
            <span>{formatPharmacistHomeDateTime(consultation.created_at)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function PharmacistHomeDetailModal({
  consultation,
  currentUserId,
  isOpen,
  onClose,
  onGoToOrder,
}: {
  consultation: PharmacistHomeConsultation | null
  currentUserId?: number | null
  isOpen: boolean
  onClose: () => void
  onGoToOrder: (consultationId: number) => void
}) {
  if (!isOpen || !consultation) {
    return null
  }

  const status = pharmacistHomeDisplayStatus(consultation)
  const receipt = latestPharmacistHomeReceipt(consultation)
  const ownerLabel = pharmacistHomeQueueOwnerLabel(consultation, currentUserId)

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.18em] ${PHARMA_MUTED}`}
              >
                Case #{consultation.id}
              </p>
              <h2 className={`mt-2 text-2xl font-semibold ${PHARMA_TEXT}`}>
                {pharmacistHomeFullName(consultation.patient)}
              </h2>
              <p className={`mt-3 text-sm ${PHARMA_MUTED}`}>
                รายละเอียดด้านขวานี้จะแสดงตามเคสที่คุณเลือกจากลิสต์ทางซ้าย
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${PHARMA_SOFT_SURFACE} ${PHARMA_SECONDARY}`}
                >
                  {pharmacistHomeDeliveryModeLabel(status)}
                </span>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${PHARMA_SOFT_SURFACE} ${PHARMA_SECONDARY}`}
                >
                  {ownerLabel}
                </span>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${PHARMA_SOFT_SURFACE} ${PHARMA_SECONDARY}`}
                >
                  {pharmacistHomeFullName(consultation.staff)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:items-center">
              <div
                className={`rounded-2xl border px-4 py-3 ${PHARMA_SOFT_SURFACE}`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.12em] ${PHARMA_MUTED}`}
                >
                  สถานะล่าสุด
                </p>
                <span
                  className={`mt-2 inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-medium ${PHARMACIST_HOME_STATUS_META[status].tone}`}
                >
                  {PHARMACIST_HOME_STATUS_META[status].label}
                </span>
              </div>
              <Button
                type="primary"
                onClick={() => onGoToOrder(consultation.id)}
                size="large"
              >
                ไปหน้าจ่ายยา
              </Button>
              <Button onClick={onClose} size="large">
                ปิด
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="grid gap-4 xl:grid-cols-3">
            <SurfaceCard
              title="ข้อมูลผู้ป่วย"
              subtitle="ข้อมูลติดต่อและข้อมูลพื้นฐาน"
            >
              <InfoRow
                label="ชื่อผู้ป่วย"
                value={pharmacistHomeFullName(consultation.patient)}
              />
              <InfoRow label="เบอร์ติดต่อ" value={consultation.patient?.phone} />
              <InfoRow label="อีเมล" value={consultation.patient?.email} />
              <InfoRow
                label="ประวัติแพ้ยา"
                value={consultation.patient?.allergy_drug || 'ไม่พบข้อมูล'}
              />
            </SurfaceCard>

            <SurfaceCard
              title="สถานะการทำงาน"
              subtitle="ข้อมูลที่ใช้ตัดสินใจงานถัดไป"
            >
              <InfoRow
                label="รูปแบบรับยา"
                value={pharmacistHomeDeliveryModeLabel(status)}
              />
              <InfoRow label="ผู้รับคิว" value={ownerLabel} />
              <InfoRow
                label="ผู้ให้คำปรึกษา"
                value={pharmacistHomeFullName(consultation.staff)}
              />
              <InfoRow
                label="เวลาที่บันทึก"
                value={formatPharmacistHomeDateTime(consultation.created_at)}
              />
            </SurfaceCard>

            <SurfaceCard
              title="การติดตามคำสั่งยา"
              subtitle="สรุปสถานะล่าสุดของเคสนี้"
            >
              <InfoRow
                label="สถานะล่าสุด"
                value={PHARMACIST_HOME_STATUS_META[status].label}
              />
              <InfoRow label="Tracking" value={receipt?.tracking || 'ยังไม่มีเลขพัสดุ'} />
              <InfoRow
                label="ยอดรวม"
                value={formatPharmacistHomeMoney(
                  pharmacistHomeConsultationTotal(consultation),
                )}
              />
              <InfoRow
                label="อัปเดตใบเสร็จ"
                value={
                  receipt
                    ? formatPharmacistHomeDateTime(receipt.created_at)
                    : 'ยังไม่มีใบเสร็จ'
                }
              />
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <SurfaceCard title="หมายเหตุเคส" subtitle="ข้อความจากการปรึกษา">
              <p className={`text-sm leading-7 ${PHARMA_SECONDARY}`}>
                {consultation.note?.trim() || 'ไม่มีหมายเหตุเพิ่มเติมจากการปรึกษา'}
              </p>
            </SurfaceCard>

            <SurfaceCard
              title="รายการยา"
              subtitle={`${consultation.prescription_items.length} รายการในเคสนี้`}
            >
              {consultation.prescription_items.length ? (
                <div className="divide-y divide-slate-200">
                  {consultation.prescription_items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_110px_130px]"
                    >
                      <div>
                        <p className={`text-sm font-medium ${PHARMA_TEXT}`}>
                          {pharmacistHomeMedicationName(item)}
                        </p>
                        <p className={`mt-1 text-sm leading-6 ${PHARMA_MUTED}`}>
                          {pharmacistHomeMedicationComment(item.comment)}
                        </p>
                      </div>
                      <div className={`text-sm ${PHARMA_MUTED}`}>
                        จำนวน {item.quantity ?? 0}
                      </div>
                      <div
                        className={`text-sm font-medium sm:text-right ${PHARMA_TEXT}`}
                      >
                        {formatPharmacistHomeMoney(
                          (item.medication?.retail ?? 0) * (item.quantity ?? 0),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState body="เคสนี้ยังไม่มีรายการยา" />
              )}
            </SurfaceCard>
          </div>
        </div>
      </section>
    </section>
  )
}

export function EmptyState({ body }: { body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
      {body}
    </div>
  )
}

function QueueMeta({
  label,
  value,
  active,
}: {
  label: string
  value: string | number | null | undefined
  active?: boolean
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        active
          ? 'border-[#99f6e4] bg-white text-slate-700'
          : 'border-slate-200 bg-slate-50 text-slate-700'
      }`}
    >
      <p
        className={`text-[11px] uppercase tracking-[0.14em] ${
          active ? 'text-slate-500' : PHARMA_MUTED
        }`}
      >
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium">
        {pharmacistHomeTextValue(value)}
      </p>
    </div>
  )
}

function SurfaceCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className={`rounded-3xl border p-5 ${PHARMA_SURFACE}`}>
      <div className="border-b border-slate-200 pb-4">
        <h3 className={`text-base font-semibold ${PHARMA_TEXT}`}>{title}</h3>
        {subtitle ? (
          <p className={`mt-1 text-sm ${PHARMA_MUTED}`}>{subtitle}</p>
        ) : null}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-none last:pb-0">
      <p className={`text-sm ${PHARMA_MUTED}`}>{label}</p>
      <p
        className={`max-w-[70%] break-words text-right text-sm font-medium ${PHARMA_TEXT}`}
      >
        {pharmacistHomeTextValue(value)}
      </p>
    </div>
  )
}
