import { DailyEntry } from "@/lib/types/daily-entry";

interface EntryHistoryProps {
  entries: DailyEntry[];
  onSelectEntry?: (entry: DailyEntry) => void;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

export const EntryHistory = ({ entries, onSelectEntry }: EntryHistoryProps) => {
  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Your recent entries will appear here once you start logging.
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Recent entries">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Recent entries</h3>
        <p className="text-sm text-muted-foreground">
          Use these quick links to review or duplicate a previous day’s entry.
        </p>
      </header>

      <ul className="space-y-3">
        {entries.slice(0, 7).map((entry) => (
          <li
            key={entry.id + entry.completedAt.toISOString()}
            className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{formatDate(entry.completedAt)}</p>
              <p className="text-xs text-muted-foreground">
                Overall {entry.overallHealth}/10 · Energy {entry.energyLevel}/10 · Sleep {entry.sleepQuality}/10
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{entry.symptoms.length} symptom{entry.symptoms.length === 1 ? "" : "s"}</span>
              <span>Triggers: {entry.triggers.length}</span>
              <span>Medications taken: {entry.medications.filter((med) => med.taken).length}</span>
              {onSelectEntry && (
                <button
                  type="button"
                  onClick={() => onSelectEntry(entry)}
                  className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary"
                >
                  Use as template
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
