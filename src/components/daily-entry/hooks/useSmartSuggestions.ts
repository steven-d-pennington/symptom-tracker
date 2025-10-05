"use client";

import { useMemo } from "react";
import { DailyEntry } from "@/lib/types/daily-entry";

export interface Suggestion {
  id: string;
  message: string;
  type: "prompt" | "encouragement" | "reminder";
}

export const useSmartSuggestions = (entry: DailyEntry) => {
  const suggestions = useMemo<Suggestion[]>(() => {
    if (entry.overallHealth <= 3) {
      return [
        {
          id: "rest",
          type: "encouragement",
          message: "Consider logging any flares or stressors that might be contributing to a tougher day.",
        },
      ];
    }

    return [
      {
        id: "celebrate",
        type: "encouragement",
        message: "Nice work staying consistent with your tracking!",
      },
    ];
  }, [entry.overallHealth]);

  return { suggestions };
};
