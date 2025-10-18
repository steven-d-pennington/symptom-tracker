import { CalendarDayDetail, TimelineEvent } from "@/lib/types/calendar";

interface DayViewProps {
  entry?: CalendarDayDetail;
  events?: TimelineEvent[];
  onEdit?: (date: string) => void;
}

const formatImpact = (value: "low" | "medium" | "high") => {
  switch (value) {
    case "high":
      return "High impact";
    case "medium":
      return "Moderate impact";
    default:
      return "Low impact";
  }
};

export const DayView = ({ entry, events = [], onEdit }: DayViewProps) => {
  if (!entry) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Select a day to review detailed entry information.
      </div>
    );
  }

  return (
    <article className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{entry.date}</h3>
          <p className="text-sm text-muted-foreground">
            {entry.hasEntry
              ? `${entry.symptomCount} symptoms · ${entry.medicationCount} medications · ${entry.triggerCount} triggers`
              : "No entry recorded"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onEdit?.(entry.date)}
          className="rounded-lg border border-border px-3 py-1 text-sm text-foreground hover:bg-muted"
        >
          Open in daily log
        </button>
      </header>

      <section className="grid gap-3 text-sm text-muted-foreground">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p>Mood: {entry.mood ?? "Not recorded"}</p>
          <p>
            Energy: {typeof entry.energyLevel === "number" ? `${entry.energyLevel}/10` : "n/a"}
          </p>
          <p>Notes: {entry.notesSummary ?? "Add notes from the daily log."}</p>
        </div>

        {entry.symptomsDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Symptoms</h4>
            <ul className="space-y-2">
              {entry.symptomsDetails.map((symptom) => (
                <li key={symptom.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{symptom.name}</span>
                    <span className="text-xs text-muted-foreground">Severity {symptom.severity}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Category: {symptom.category}</p>
                  {symptom.note ? (
                    <p className="mt-1 text-xs text-muted-foreground">{symptom.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {entry.medicationDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Medications</h4>
            <ul className="space-y-2">
              {entry.medicationDetails.map((medication) => (
                <li key={medication.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{medication.name}</span>
                    <span className="text-xs text-muted-foreground">{medication.dose}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {medication.taken ? "Taken" : "Missed"} · {medication.schedule}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {entry.triggerDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Triggers</h4>
            <ul className="space-y-2">
              {entry.triggerDetails.map((trigger) => (
                <li key={trigger.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{trigger.name}</span>
                    <span className="text-xs text-muted-foreground">{formatImpact(trigger.impact)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Category: {trigger.category}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {events.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Timeline events</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {events.map((event) => (
                <li key={event.id}>
                  {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {event.title}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </article>
  );
};
