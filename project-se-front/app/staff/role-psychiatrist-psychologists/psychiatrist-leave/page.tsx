import { ClinicalLeavePlanner } from '@/components/staff/ClinicalLeavePlanner';

export default function PsychiatristLeavePage() {
  return (
    <ClinicalLeavePlanner
      role="psychiatrist"
      kicker="STAFF / PSYCHIATRIST / LEAVE"
      title="Psychiatrist Leave Form"
      description="Manage leave days for psychiatrist clinic work using the same schedule data model that powers the merged workday flow."
    />
  );
}
