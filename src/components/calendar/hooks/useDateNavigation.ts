"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarViewType, DateRange } from "@/lib/types/calendar";

const startOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day + 6) % 7; // Start on Monday
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfWeek = (date: Date) => {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfMonth = (date: Date) => {
  const result = new Date(date.getFullYear(), date.getMonth(), 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfMonth = (date: Date) => {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
};

const normalizeRange = (range: DateRange, viewType: CalendarViewType): DateRange => {
  const anchor = new Date(range.start);
  switch (viewType) {
    case "year": {
      const start = new Date(anchor.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(anchor.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "day": {
      const start = new Date(anchor);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "week":
      return { start: startOfWeek(anchor), end: endOfWeek(anchor) };
    case "timeline":
    case "month":
    default:
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }
};

const shiftRange = (range: DateRange, viewType: CalendarViewType, step: number): DateRange => {
  const { start } = range;
  const next = new Date(start);
  switch (viewType) {
    case "year":
      next.setFullYear(next.getFullYear() + step);
      break;
    case "day":
      next.setDate(next.getDate() + step);
      break;
    case "week":
      next.setDate(next.getDate() + step * 7);
      break;
    case "timeline":
    case "month":
    default:
      next.setMonth(next.getMonth() + step);
      break;
  }
  return normalizeRange({ start: next, end: next }, viewType);
};

const formatRangeLabel = (range: DateRange, viewType: CalendarViewType) => {
  const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
  const yearFormatter = new Intl.DateTimeFormat("en", { year: "numeric" });

  switch (viewType) {
    case "year":
      return yearFormatter.format(range.start);
    case "day":
      return formatter.format(range.start);
    case "week":
      return `${formatter.format(range.start)} – ${formatter.format(range.end)}`;
    case "timeline":
    case "month":
    default:
      return monthFormatter.format(range.start);
  }
};

type RangeUpdater = DateRange | ((current: DateRange) => DateRange);

export const useDateNavigation = (initialRange: DateRange, viewType: CalendarViewType) => {
  const [range, internalSetRange] = useState<DateRange>(() => normalizeRange(initialRange, viewType));

  const setRange = (updater: RangeUpdater) => {
    internalSetRange((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return normalizeRange(next, viewType);
    });
  };

  useEffect(() => {
    internalSetRange((current) => normalizeRange(current, viewType));
  }, [viewType]);

  const goToPrevious = () => setRange((current) => shiftRange(current, viewType, -1));
  const goToNext = () => setRange((current) => shiftRange(current, viewType, 1));
  const goToToday = () => setRange({ start: new Date(), end: new Date() });

  const rangeLabel = useMemo(() => formatRangeLabel(range, viewType), [range, viewType]);

  return {
    range,
    setRange,
    goToPrevious,
    goToNext,
    goToToday,
    rangeLabel,
  };
};
