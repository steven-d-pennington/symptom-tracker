"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type {
  OnboardingStepComponentProps,
  TrackingPreferences,
} from "../types/onboarding";

const FREQUENCY_OPTIONS = ["daily", "weekly", "custom"] as const;

const TRACKING_AREAS = [
  "Pain",
  "Joint Pain",
  "Fatigue",
  "Skin Changes",
  "Digestive",
  "Mood",
  "Sleep",
  "Brain Fog",
  "Mobility",
];

const SMART_DEFAULTS: Record<string, { focusAreas: string[]; frequency: typeof FREQUENCY_OPTIONS[number] }> = {
  "Hidradenitis Suppurativa": { focusAreas: ["Pain", "Skin Changes"], frequency: "daily" },
  "Rheumatoid Arthritis": { focusAreas: ["Joint Pain", "Fatigue"], frequency: "daily" },
  Lupus: { focusAreas: ["Fatigue", "Skin Changes", "Mood"], frequency: "daily" },
  "Psoriatic Arthritis": { focusAreas: ["Skin Changes", "Pain"], frequency: "daily" },
  "Multiple Sclerosis": { focusAreas: ["Fatigue", "Mobility", "Brain Fog"], frequency: "daily" },
  "General Tracking": { focusAreas: ["Mood", "Sleep"], frequency: "weekly" },
};

const formatArea = (value: string) =>
  value
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");

export const PreferencesStep = ({ data, onContinue, onBack, updateData }: OnboardingStepComponentProps) => {
  const recommended = SMART_DEFAULTS[data.condition] ?? SMART_DEFAULTS["General Tracking"];
  const normalizedStoredAreas = (data.trackingPreferences?.focusAreas ?? []).map(formatArea);
  const sanitizedRecommendation = recommended.focusAreas.filter((area) => TRACKING_AREAS.includes(area));

  const initialFocusAreas = normalizedStoredAreas.length
    ? normalizedStoredAreas
    : sanitizedRecommendation;

  const [frequency, setFrequency] = useState<typeof FREQUENCY_OPTIONS[number]>(
    (data.trackingPreferences?.frequency as typeof FREQUENCY_OPTIONS[number]) ?? recommended.frequency,
  );
  const [focusAreas, setFocusAreas] = useState<string[]>(initialFocusAreas);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    data.trackingPreferences?.notificationsEnabled ?? true,
  );
  const [reminderTime, setReminderTime] = useState(
    data.trackingPreferences?.reminderTime ?? "09:00",
  );
  const [error, setError] = useState<string | null>(null);

  const mergeTrackingPreferences = (updates: Partial<TrackingPreferences>) => {
    const current = data.trackingPreferences ?? {
      frequency,
      focusAreas,
      notificationsEnabled,
      reminderTime,
    };

    updateData({
      trackingPreferences: {
        ...current,
        ...updates,
        focusAreas: updates.focusAreas ?? current.focusAreas ?? [],
      },
    });
  };

  const hasCustomFocus = useMemo(() => {
    return (
      focusAreas.length !== sanitizedRecommendation.length ||
      focusAreas.some((area, index) => sanitizedRecommendation[index] !== area)
    );
  }, [focusAreas, sanitizedRecommendation]);

  const handleFrequencyChange = (option: typeof FREQUENCY_OPTIONS[number]) => {
    setFrequency(option);
    mergeTrackingPreferences({ frequency: option });
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) => {
      const next = prev.includes(area)
        ? prev.filter((item) => item !== area)
        : [...prev, area];
      mergeTrackingPreferences({ focusAreas: next });
      return next;
    });
  };

  const applyRecommendation = () => {
    setFocusAreas(sanitizedRecommendation);
    setFrequency(recommended.frequency);
    mergeTrackingPreferences({
      focusAreas: sanitizedRecommendation,
      frequency: recommended.frequency,
    });
    setError(null);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (focusAreas.length === 0) {
      setError("Select at least one focus area to personalize your dashboard.");
      return;
    }

    setError(null);

    onContinue("preferences", {
      trackingPreferences: {
        frequency,
        focusAreas,
        notificationsEnabled,
        reminderTime,
      },
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Customize your tracking
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose how often you want to log and which areas should be front and center.
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          Reminder frequency
        </legend>
        <div className="grid gap-3 md:grid-cols-3">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleFrequencyChange(option)}
              className={cn(
                "rounded-xl border border-border bg-muted/40 p-4 text-left text-sm font-medium capitalize shadow-sm transition",
                frequency === option && "border-primary bg-primary/10",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          Focus areas
        </legend>
        <div className="flex flex-wrap gap-2">
          {TRACKING_AREAS.map((area) => {
            const isActive = focusAreas.includes(area);
            return (
              <button
                key={area}
                type="button"
                className={cn(
                  "rounded-full border border-border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted",
                )}
                onClick={() => toggleFocusArea(area)}
              >
                {area}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2" role="note" aria-live="polite">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Suggested setup
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            We recommend focusing on
            {" "}
            <strong>{sanitizedRecommendation.join(", ")}</strong>
            {" "}
            with {recommended.frequency} reminders for {formatArea(data.condition || "your condition")}.
          </span>
          <button
            type="button"
            className="rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
            onClick={applyRecommendation}
            aria-pressed={!hasCustomFocus}
          >
            Apply recommendation
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <span className="font-medium text-foreground">
            Enable reminders
          </span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(event) => {
              setNotificationsEnabled(event.target.checked);
              mergeTrackingPreferences({
                notificationsEnabled: event.target.checked,
              });
            }}
            className="size-4"
          />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <span className="font-medium text-foreground">Reminder time</span>
          <input
            type="time"
            value={reminderTime}
            onChange={(event) => {
              setReminderTime(event.target.value);
              mergeTrackingPreferences({ reminderTime: event.target.value });
            }}
            className="rounded-md border border-border bg-background px-3 py-1"
          />
        </label>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => onBack()}
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Continue
        </button>
      </div>
    </form>
  );
};
