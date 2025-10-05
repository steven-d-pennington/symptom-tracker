import { CalendarEntry, CalendarViewConfig } from "@/lib/types/calendar";

interface CalendarGridProps {
  entries: CalendarEntry[];
  view: CalendarViewConfig;
}

export const CalendarGrid = ({ entries, view }: CalendarGridProps) => {
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-7">
      {entries.length === 0 ? (
        <p className="col-span-full text-sm text-muted-foreground">
          {`The ${view.viewType} view will highlight symptom intensity once daily entries are saved.`}
        </p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.date}
            className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-3 text-sm"
          >
            <span className="font-semibold text-foreground">{entry.date}</span>
            <span className="text-muted-foreground">
              {entry.hasEntry ? `${entry.symptomCount} symptoms` : "No entry"}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
