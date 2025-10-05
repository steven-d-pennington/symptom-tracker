"use client";

import { useMemo, useState } from "react";
import {
  CalendarEntry,
  CalendarViewConfig,
  DateRange,
  TimelineEvent,
} from "@/lib/types/calendar";

const createDateRange = (): DateRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start, end };
};

const createInitialView = (): CalendarViewConfig => ({
  viewType: "month",
  dateRange: createDateRange(),
  filters: {},
  displayOptions: {
    showHealthScore: true,
    showSymptoms: true,
    showMedications: false,
    showTriggers: false,
    colorScheme: "severity",
  },
});

export const useCalendarData = () => {
  const [viewConfig, setViewConfig] = useState<CalendarViewConfig>(createInitialView);

  const entries = useMemo<CalendarEntry[]>(
    () => [
      {
        date: new Date().toISOString().slice(0, 10),
        hasEntry: false,
        symptomCount: 0,
        medicationCount: 0,
        triggerCount: 0,
      },
    ],
    [],
  );

  const events = useMemo<TimelineEvent[]>(
    () => [
      {
        id: "getting-started",
        date: new Date(),
        type: "milestone",
        title: "Onboarding completed",
        description: "Phase 1 setup placeholder event.",
      },
    ],
    [],
  );

  return {
    viewConfig,
    entries,
    events,
    updateView: setViewConfig,
  };
};
