"use client";

import { useState } from "react";
import { DateRange } from "@/lib/types/calendar";

const shiftRange = (range: DateRange, days: number): DateRange => {
  const start = new Date(range.start);
  const end = new Date(range.end);
  start.setDate(start.getDate() + days);
  end.setDate(end.getDate() + days);
  return { start, end };
};

export const useDateNavigation = (initialRange: DateRange) => {
  const [range, setRange] = useState<DateRange>(initialRange);

  const goToPrevious = () => setRange((current) => shiftRange(current, -7));
  const goToNext = () => setRange((current) => shiftRange(current, 7));

  return {
    range,
    goToPrevious,
    goToNext,
    setRange,
  };
};
