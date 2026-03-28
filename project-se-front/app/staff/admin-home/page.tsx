"use client";

import {
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
} from "@/components/staff/StaffAdminHome";
import { useStaffAdminHome } from "@/hooks/useStaffAdminHome";

export default function StaffAdminHomePage() {
  const state = useStaffAdminHome();

  if (!state.hasAccess) {
    return null;
  }

  return (
    <main
      className="min-h-screen px-4 pb-10 pt-6 text-[#18312c] sm:px-6 lg:px-7 lg:pb-14 lg:pt-8"
      style={{ background: PAGE_BACKGROUND }}
    >
      <div className="mx-auto grid max-w-[1420px] gap-6">
        <HeroSection
          selectedStaffName={state.selectedStaff?.name ?? "ทั้งคลินิก"}
          weekRange={state.data?.weekRange ?? null}
        />
        <FilterSection state={state} />

        {state.error ? (
          <ErrorPanel
            authRequired={state.authRequired}
            error={state.error}
            onLogin={state.goToLogin}
          />
        ) : null}

        <DashboardSummarySection summary={state.summary} />

        <section className="grid grid-cols-1 gap-6">
          <TimelineSection state={state} />
          <SelectedAppointmentsSection state={state} />
        </section>

        <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
          <StaffOverviewSection
            onOpenStaffWorkModal={state.openStaffWorkModal}
            staffOverview={state.staffOverview}
          />
          <UpcomingAppointmentsSection
            selectedDate={state.selectedDate}
            upcomingAppointments={state.upcomingAppointments}
          />
        </section>

        <StaffWorkModal state={state} />
      </div>
    </main>
  );
}
