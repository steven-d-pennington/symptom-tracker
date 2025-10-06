"use client";

import { DateRange } from "@/lib/types/calendar";

interface DatePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

const formatInputDate = (date: Date) => date.toISOString().slice(0, 10);

export const DatePicker = ({ dateRange, onChange }: DatePickerProps) => {
  const handleChange = (key: keyof DateRange, value: string) => {
    const next = new Date(value);
    if (Number.isNaN(next.getTime())) {
      return;
    }
    onChange({
      ...dateRange,
      [key]: next,
    });
  };

  return (
    <fieldset className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
      <legend className="sr-only">Date range</legend>
      <label className="flex items-center gap-1">
        <span className="text-foreground">Start</span>
        <input
          type="date"
          value={formatInputDate(dateRange.start)}
          onChange={(event) => handleChange("start", event.target.value)}
          className="rounded border border-border bg-background px-2 py-1 text-foreground"
        />
      </label>
      <span aria-hidden>→</span>
      <label className="flex items-center gap-1">
        <span className="text-foreground">End</span>
        <input
          type="date"
          value={formatInputDate(dateRange.end)}
          onChange={(event) => handleChange("end", event.target.value)}
          className="rounded border border-border bg-background px-2 py-1 text-foreground"
        />
      </label>
    </fieldset>
  );
};
