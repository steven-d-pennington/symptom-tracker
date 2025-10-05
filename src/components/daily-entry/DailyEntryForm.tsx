"use client";

import { DailyEntry } from "@/lib/types/daily-entry";
import { useDailyEntry } from "./hooks/useDailyEntry";
import { HealthSection } from "./EntrySections/HealthSection";
import { NotesSection } from "./EntrySections/NotesSection";

export const DailyEntryForm = () => {
  const { entry, updateEntry } = useDailyEntry();

  const handleSubmit = () => {
    // Placeholder submit handler for future integration.
    console.info("Saving daily entry", entry);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Daily check-in</h2>
        <p className="text-sm text-muted-foreground">
          {"Capture a quick snapshot of how you\u2019re feeling today. Smart suggestions will appear here once data storage is connected."}
        </p>
      </header>

      <form
        className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <HealthSection
          overallHealth={entry.overallHealth}
          energyLevel={entry.energyLevel}
          sleepQuality={entry.sleepQuality}
          stressLevel={entry.stressLevel}
          onChange={(changes: Partial<DailyEntry>) => updateEntry(changes)}
        />
        <NotesSection
          notes={entry.notes ?? ""}
          onChange={(notes) => updateEntry({ notes })}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Save entry
          </button>
        </div>
      </form>
    </section>
  );
};
