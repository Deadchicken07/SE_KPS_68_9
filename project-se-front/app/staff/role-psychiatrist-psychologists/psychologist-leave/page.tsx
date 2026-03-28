import { ClinicalLeavePlanner } from '@/components/staff/ClinicalLeavePlanner';

export default function PsychologistLeavePage() {
  return (
    <ClinicalLeavePlanner
      role="psychologist"
      kicker="STAFF / PSYCHOLOGIST / LEAVE"
      title="Psychologist Leave Form"
      description="Manage leave days for psychologist clinic work using the shared staff schedule backend instead of the pharmacist-only route."
    />
  );
}
