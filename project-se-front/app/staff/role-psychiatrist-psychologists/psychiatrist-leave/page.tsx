import { ClinicalLeavePlanner } from '@/components/staff/ClinicalLeavePlanner';

export default function PsychiatristLeavePage() {
  return (
    <ClinicalLeavePlanner
      role="psychiatrist"
      kicker="บุคลากร / จิตแพทย์ / ใบลา"
      title="ใบลาจิตแพทย์"
    />
  );
}
