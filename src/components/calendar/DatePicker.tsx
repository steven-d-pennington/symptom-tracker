"use client";

import { DateRange } from "@/lib/types/calendar";

interface DatePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

export const DatePicker = ({ dateRange }: DatePickerProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{dateRange.start.toDateString()}</span>
      <span aria-hidden>→</span>
      <span>{dateRange.end.toDateString()}</span>
    </div>
  );
};
