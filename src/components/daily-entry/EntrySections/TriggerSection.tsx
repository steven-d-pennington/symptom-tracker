import { DailyTrigger } from "@/lib/types/daily-entry";

interface TriggerSectionProps {
  triggers: DailyTrigger[];
  onChange: (triggers: DailyTrigger[]) => void;
}

export const TriggerSection = ({ triggers }: TriggerSectionProps) => {
  return (
    <section className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
      {triggers.length > 0
        ? `Trigger placeholders: ${triggers.length} tracked.`
        : "Trigger tracking will allow quick intensity sliders tied to your custom triggers."}
    </section>
  );
};
