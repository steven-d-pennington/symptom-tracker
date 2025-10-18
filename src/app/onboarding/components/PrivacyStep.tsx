"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type {
  OnboardingStepComponentProps,
  PrivacySettings,
} from "../types/onboarding";

const STORAGE_OPTIONS = ["local", "encrypted-local"] as const;

export const PrivacyStep = ({ data, onContinue, onBack, updateData }: OnboardingStepComponentProps) => {
  const [dataStorage, setDataStorage] = useState<(typeof STORAGE_OPTIONS)[number]>(
    (data.privacySettings?.dataStorage as (typeof STORAGE_OPTIONS)[number]) ?? "encrypted-local",
  );
  const [analyticsOptIn, setAnalyticsOptIn] = useState(
    data.privacySettings?.analyticsOptIn ?? false,
  );
  const [crashReportsOptIn, setCrashReportsOptIn] = useState(
    data.privacySettings?.crashReportsOptIn ?? false,
  );

  const mergePrivacySettings = (updates: Partial<PrivacySettings>) => {
    const current = data.privacySettings ?? {
      dataStorage,
      analyticsOptIn,
      crashReportsOptIn,
    };

    updateData({
      privacySettings: {
        ...current,
        ...updates,
      },
    });
  };

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

      <div className="grid gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-base" aria-hidden="true">
            🔒
          </span>
          <div>
            <p className="font-medium text-foreground">Key policies</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>No cloud sync or hidden backups—everything lives on your device.</li>
              <li>Optional diagnostics are anonymized and never include symptom content.</li>
              <li>You can export or delete data at any time from settings.</li>
            </ul>
          </div>
        </div>
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
              onClick={() => {
                setDataStorage(option);
                mergePrivacySettings({ dataStorage: option });
              }}
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
            onChange={(event) => {
              setAnalyticsOptIn(event.target.checked);
              mergePrivacySettings({ analyticsOptIn: event.target.checked });
            }}
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
            onChange={(event) => {
              setCrashReportsOptIn(event.target.checked);
              mergePrivacySettings({ crashReportsOptIn: event.target.checked });
            }}
            className="mt-1 size-4"
          />
          <span className="text-sm text-foreground">
            <strong className="block font-semibold">Crash reports</strong>
            Help diagnose errors by sharing crash details without your health data.
          </span>
        </label>
      </div>

      <div className="space-y-3 rounded-xl border border-dashed border-border/70 bg-background/60 p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Compliance checklist</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>GDPR-ready data export and deletion controls</li>
          <li>HIPAA-aligned device encryption when available</li>
          <li>No third-party trackers or advertising SDKs</li>
        </ul>
      </div>

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
