"use client";

import { useState } from "react";
import { DailyEntry } from "@/lib/types/daily-entry";
import { Suggestion } from "./hooks/useSmartSuggestions";

interface QuickEntryProps {
  entry: DailyEntry;
  suggestions: Suggestion[];
  onUpdate: (changes: Partial<DailyEntry>) => void;
  onSubmit: () => Promise<void>;
  isSaving: boolean;
  completion: number;
}

const QUICK_VALUES = [2, 5, 8];
type MetricKey = keyof Pick<DailyEntry, "overallHealth" | "energyLevel" | "sleepQuality" | "stressLevel">;
const QUICK_METRICS: MetricKey[] = [
  "overallHealth",
  "energyLevel",
  "sleepQuality",
  "stressLevel",
];

export const QuickEntry = ({
  entry,
  suggestions,
  onUpdate,
  onSubmit,
  isSaving,
  completion,
}: QuickEntryProps) => {
  const [status, setStatus] = useState<string | null>(null);

  const handleQuickSet = (key: MetricKey, value: number) => {
    onUpdate({ [key]: value } as Partial<DailyEntry>);
    setStatus("Updated");
    window.setTimeout(() => setStatus(null), 1000);
  };

  const handleSubmit = async () => {
    setStatus("Saving...");
    await onSubmit();
    setStatus("Saved!");
    window.setTimeout(() => setStatus(null), 1500);
  };

  return (
    <section className="space-y-4" aria-label="Quick entry mode">
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">Quick entry</h3>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {completion}% complete
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Tap a value to adjust today’s metrics. Perfect for logging in under 30 seconds.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK_METRICS.map((metric) => {
          const current = entry[metric];
          const label =
            metric === "overallHealth"
              ? "Overall health"
              : metric === "energyLevel"
                ? "Energy"
                : metric === "sleepQuality"
                  ? "Sleep"
                  : "Stress";

          return (
            <div
              key={metric}
              className="space-y-3 rounded-xl border border-border bg-background/60 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between text-sm font-medium text-foreground">
                <span>{label}</span>
                <span className="text-xs text-muted-foreground">{current} / 10</span>
              </div>
              <div className="flex gap-2">
                {QUICK_VALUES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleQuickSet(metric, value)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${current === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:border-primary"
                      }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Smart nudges
        </p>
        <ul className="space-y-2">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className={`rounded-lg border px-3 py-2 text-sm ${suggestion.type === "encouragement"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100"
                  : suggestion.type === "reminder"
                    ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100"
                    : "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-100"
                }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span>{suggestion.message}</span>
                {suggestion.actionLabel && (
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide dark:bg-black/40">
                    {suggestion.actionLabel}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {status ?? "Changes save automatically when you submit."}
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Log day"}
        </button>
      </div>
    </section>
  );
};
