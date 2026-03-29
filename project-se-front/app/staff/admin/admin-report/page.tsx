"use client";

import {
  AdminReportDashboardSection,
  AdminReportErrorPanel,
  AdminReportFilterSection,
  AdminReportHeader,
  AdminReportSummarySection,
} from "@/components/staff/AdminReport";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { useAdminReport } from "@/hooks/useAdminReport";

export default function AdminReportPage() {
  const state = useAdminReport();

  if (state.loading) {
    return <PageSkeleton cards={[{ rows: 4 }, { rows: 5 }, { rows: 8 }]} />;
  }

  if (!state.hasAccess) {
    return null;
  }

  return (
<main className="staff-shell">
      <div className="mx-auto grid max-w-[1400px] gap-6">
        <AdminReportHeader />
        <AdminReportFilterSection state={state} />
        <AdminReportErrorPanel state={state} />

        {state.loading ? <AdminReportLoadingSection /> : null}

        {!state.loading && state.data ? (
          <>
            <AdminReportSummarySection state={state} />
            <AdminReportDashboardSection state={state} />
          </>
        ) : null}
      </div>
    </main>
  );
}
