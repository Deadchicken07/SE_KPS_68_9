"use client";

import {
  AdminReportDashboardSection,
  AdminReportErrorPanel,
  AdminReportFilterSection,
  AdminReportHeader,
  AdminReportLoadingSection,
  AdminReportSummarySection,
} from "@/components/staff/AdminReport";
import { useAdminReport } from "@/hooks/useAdminReport";

export default function AdminReportPage() {
  const state = useAdminReport();

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
