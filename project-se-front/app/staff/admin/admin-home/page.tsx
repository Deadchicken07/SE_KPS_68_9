'use client'

import { Spin, Typography } from 'antd'
import {
  AppointmentDetailModal,
  DashboardSummarySection,
  ErrorPanel,
  FilterSection,
  HeroSection,
  PAGE_BACKGROUND,
  SelectedAppointmentsSection,
  StaffOverviewSection,
  StaffWorkModal,
  TimelineSection,
  UpcomingAppointmentsSection,
} from '@/components/staff/StaffAdminHome'
import { useStaffAdminHome } from '@/hooks/useStaffAdminHome'

export default function AdminHomePage() {
  const state = useStaffAdminHome()

  if (!state.hasAccess) {
    return null
  }

  return (
    <main
      className="min-h-full px-4 py-6 text-[#173630] md:px-6 lg:px-8"
      style={{ background: PAGE_BACKGROUND }}
    >
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6">
        <HeroSection
          selectedStaffName={state.selectedStaff?.name ?? 'บุคลากรทั้งหมด'}
          weekRange={state.data?.weekRange ?? null}
        />

        <DashboardSummarySection summary={state.summary} />

        <FilterSection state={state} />

        {state.error ? (
          <ErrorPanel
            authRequired={state.authRequired}
            error={state.error}
            onLogin={state.goToLogin}
          />
        ) : null}

        {state.loading ? (
          <section className="rounded-[28px] border border-[rgba(15,118,110,0.14)] bg-white/90 px-6 py-12 shadow-[0_18px_36px_rgba(15,118,110,0.08)]">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Spin size="large" />
              <Typography.Text className="text-[#5f6b62]">
                กำลังโหลดข้อมูลแดชบอร์ดแอดมิน...
              </Typography.Text>
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
              <TimelineSection state={state} />
              <SelectedAppointmentsSection state={state} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <StaffOverviewSection
                staffOverview={state.staffOverview}
                onOpenStaffWorkModal={state.openStaffWorkModal}
              />
              <UpcomingAppointmentsSection
                selectedDate={state.selectedDate}
                upcomingAppointments={state.upcomingAppointments}
              />
            </section>
          </>
        )}
      </div>

      <StaffWorkModal state={state} />
      <AppointmentDetailModal state={state} />
    </main>
  )
}
