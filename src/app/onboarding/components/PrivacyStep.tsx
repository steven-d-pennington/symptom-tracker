"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { OnboardingData, OnboardingStepId } from "../types/onboarding";

type StepProps = {
  onContinue: (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => void;
};

const STORAGE_OPTIONS: OnboardingData["privacySettings"]["dataStorage"][] = [
  "local",
  "encrypted-local",
];

export const PrivacyStep = ({ onContinue }: StepProps) => {
  const [dataStorage, setDataStorage] =
    useState<OnboardingData["privacySettings"]["dataStorage"]>("encrypted-local");
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [crashReportsOptIn, setCrashReportsOptIn] = useState(false);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        onContinue("privacy", {
          privacySettings: {
            dataStorage,
            analyticsOptIn,
            crashReportsOptIn,
          },
        });
      }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Privacy preferences</h2>
        <p className="text-sm text-muted-foreground">
          All data remains on this device. Choose optional diagnostics that help improve the app.
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          Data storage mode
        </legend>
        <div className="grid gap-3 md:grid-cols-2">
          {STORAGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-left text-sm shadow-sm transition",
                dataStorage === option && "border-primary bg-primary/10",
              )}
              onClick={() => setDataStorage(option)}
            >
              <span className="text-base font-semibold capitalize text-foreground">
                {option.replace("-", " ")}
              </span>
              <span className="text-muted-foreground">
                {option === "encrypted-local"
                  ? "Encrypt your data with a device-specific key for extra protection."
                  : "Store data locally without encryption (faster on older devices)."}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <input
            type="checkbox"
            checked={analyticsOptIn}
            onChange={(event) => setAnalyticsOptIn(event.target.checked)}
            className="mt-1 size-4"
          />
          <span className="text-sm text-foreground">
            <strong className="block font-semibold">Anonymous usage analytics</strong>
            Share anonymized metrics to guide future improvements. Never includes personal data.
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <input
            type="checkbox"
            checked={crashReportsOptIn}
            onChange={(event) => setCrashReportsOptIn(event.target.checked)}
            className="mt-1 size-4"
          />
          <span className="text-sm text-foreground">
            <strong className="block font-semibold">Crash reports</strong>
            Help diagnose errors by sharing crash details without your health data.
          </span>
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
