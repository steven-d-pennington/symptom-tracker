"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { OnboardingData, OnboardingStepId } from "../types/onboarding";

type StepProps = {
  onContinue: (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => void;
};

const FREQUENCY_OPTIONS: OnboardingData["trackingPreferences"]["frequency"][] = [
  "daily",
  "weekly",
  "custom",
];

const TRACKING_AREAS = [
  "Pain",
  "Fatigue",
  "Skin Changes",
  "Digestive",
  "Mood",
  "Sleep",
];

export const PreferencesStep = ({ onContinue }: StepProps) => {
  const [frequency, setFrequency] =
    useState<OnboardingData["trackingPreferences"]["frequency"]>("daily");
  const [focusAreas, setFocusAreas] = useState<string[]>([
    "Pain",
    "Fatigue",
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area],
    );
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        onContinue("preferences", {
          trackingPreferences: {
            frequency,
            focusAreas,
            notificationsEnabled,
            reminderTime,
          },
        });
      }}
    >
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
              onClick={() => setFrequency(option)}
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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <span className="font-medium text-foreground">
            Enable reminders
          </span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(event) => setNotificationsEnabled(event.target.checked)}
            className="size-4"
          />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <span className="font-medium text-foreground">Reminder time</span>
          <input
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1"
          />
        </label>
      </div>

      <div className="flex justify-end">
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
