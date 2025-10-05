import { CalendarEntry } from "@/lib/types/calendar";

interface DayViewProps {
  entry?: CalendarEntry;
}

export const DayView = ({ entry }: DayViewProps) => {
  if (!entry) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Select a day to review detailed entry information.
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">{entry.date}</h3>
      <p className="text-sm text-muted-foreground">
        {entry.hasEntry
          ? `${entry.symptomCount} symptoms logged`
          : "No entry recorded"}
      </p>
    </article>
  );
};
