"use client";

import { useMemo } from "react";
import { DailyEntry } from "@/lib/types/daily-entry";

export interface Suggestion {
  id: string;
  message: string;
  type: "prompt" | "encouragement" | "reminder";
  actionLabel?: string;
}

const hasConsistentHighStress = (history: DailyEntry[]) =>
  history.slice(0, 5).every((item) => item.stressLevel >= 7);

const hasSkippedMedications = (entry: DailyEntry) =>
  entry.medications.some((medication) => !medication.taken);

const hasFlaresLogged = (entry: DailyEntry) => entry.symptoms.some((symptom) => symptom.severity >= 7);

export const useSmartSuggestions = (entry: DailyEntry, history: DailyEntry[]) => {
  const suggestions = useMemo<Suggestion[]>(() => {
    const items: Suggestion[] = [];

    if (entry.overallHealth <= 3) {
      items.push({
        id: "low-health",
        type: "encouragement",
        message:
          "Looks like today is a tougher day. Consider adding context in your notes so patterns are easier to spot later.",
        actionLabel: "Add context",
      });
    }

    if (hasFlaresLogged(entry)) {
      items.push({
        id: "flare-tracking",
        type: "prompt",
        message:
          "You logged higher symptom severity. Capture any potential triggers so we can surface correlations in the timeline.",
        actionLabel: "Review triggers",
      });
    }

    if (hasSkippedMedications(entry)) {
      items.push({
        id: "medication-reminder",
        type: "reminder",
        message:
          "Some medications are still unchecked. Update what you took to keep streaks accurate.",
        actionLabel: "Update medications",
      });
    }

    if (hasConsistentHighStress(history)) {
      items.push({
        id: "stress-pattern",
        type: "prompt",
        message:
          "Stress has been high this week. Try logging calming activities or wins in your notes to balance the view.",
        actionLabel: "Log a win",
      });
    }

    if (items.length === 0) {
      items.push({
        id: "celebrate",
        type: "encouragement",
        message: "Nice job staying consistent. Your insights are getting richer each day!",
      });
    }

    return items;
  }, [entry, history]);

  return { suggestions };
};
