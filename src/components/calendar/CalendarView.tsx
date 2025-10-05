"use client";

import { useCalendarData } from "./hooks/useCalendarData";
import { CalendarControls } from "./CalendarControls";
import { CalendarGrid } from "./CalendarGrid";
import { TimelineView } from "./TimelineView";

export const CalendarView = () => {
  const { viewConfig, entries, events, updateView } = useCalendarData();

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Calendar & Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Visualize your health history across calendar and timeline views. Data appears here once daily entries are stored.
        </p>
      </header>

      <CalendarControls view={viewConfig} onChange={updateView} />

      {viewConfig.viewType === "timeline" ? (
        <TimelineView events={events} />
      ) : (
        <CalendarGrid entries={entries} view={viewConfig} />
      )}
    </section>
  );
};
