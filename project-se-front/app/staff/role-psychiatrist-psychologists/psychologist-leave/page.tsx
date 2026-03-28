import { ClinicalLeavePlanner } from '@/components/staff/ClinicalLeavePlanner';

export default function PsychologistLeavePage() {
  return (
    <ClinicalLeavePlanner
      role="psychologist"
      kicker="บุคลากร / นักจิตวิทยา / ใบลา"
      title="ใบลานักจิตวิทยา"
    />
  );
}
