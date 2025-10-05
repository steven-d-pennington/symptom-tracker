"use client";

import { CalendarViewConfig } from "@/lib/types/calendar";
import { DatePicker } from "./DatePicker";
import { Legend } from "./Legend";

interface CalendarControlsProps {
  view: CalendarViewConfig;
  onChange: (view: CalendarViewConfig) => void;
}

export const CalendarControls = ({ view, onChange }: CalendarControlsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1 font-medium text-foreground hover:bg-muted"
          onClick={() => onChange({ ...view, viewType: "month" })}
        >
          Month
        </button>
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1 font-medium text-foreground hover:bg-muted"
          onClick={() => onChange({ ...view, viewType: "timeline" })}
        >
          Timeline
        </button>
      </div>
      <DatePicker dateRange={view.dateRange} onChange={(dateRange) => onChange({ ...view, dateRange })} />
      <Legend displayOptions={view.displayOptions} />
    </div>
  );
};
