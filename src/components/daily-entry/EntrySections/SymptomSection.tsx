import { DailySymptom } from "@/lib/types/daily-entry";

interface SymptomSectionProps {
  symptoms: DailySymptom[];
  onChange: (symptoms: DailySymptom[]) => void;
}

export const SymptomSection = ({ symptoms }: SymptomSectionProps) => {
  return (
    <section className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
      {symptoms.length > 0
        ? `Symptom placeholders: ${symptoms.length} selected.`
        : "Symptom logging will appear here after the symptom tracker is connected."}
    </section>
  );
};
