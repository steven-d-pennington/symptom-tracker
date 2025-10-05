import { DailyMedication } from "@/lib/types/daily-entry";

interface MedicationSectionProps {
  medications: DailyMedication[];
  onChange: (medications: DailyMedication[]) => void;
}

export const MedicationSection = ({ medications }: MedicationSectionProps) => {
  return (
    <section className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
      {medications.length > 0
        ? `Medication placeholders: ${medications.length} scheduled.`
        : "Medication adherence tracking integrates after the medication module is available."}
    </section>
  );
};
