"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { OnboardingStepComponentProps } from "../types/onboarding";
import { useOnboardingSelections } from "../contexts/OnboardingSelectionsContext";

/**
 * Completion Step - Story 3.6.1
 * Updated to display selected items and pass selections to user initialization
 */

export const CompletionStep = ({ data, onContinue, reset, updateData }: OnboardingStepComponentProps) => {
  const { selections, getSelectionCount } = useOnboardingSelections();

  const highlights = useMemo(
    () => [
      {
        label: "Primary focus",
        value: data.condition || "General tracking",
      },
      {
        label: "Experience level",
        value:
          data.experience === "new"
            ? "New to tracking"
            : data.experience === "experienced"
              ? "Experienced tracker"
              : "Returning after a break",
      },
      {
        label: "Symptoms to track",
        value: getSelectionCount("symptoms") > 0
          ? `${getSelectionCount("symptoms")} selected`
          : "None selected",
      },
      {
        label: "Triggers to monitor",
        value: getSelectionCount("triggers") > 0
          ? `${getSelectionCount("triggers")} selected`
          : "None selected",
      },
      {
        label: "Treatments tracking",
        value: getSelectionCount("medications") > 0
          ? `${getSelectionCount("medications")} selected`
          : "None selected",
      },
      {
        label: "Foods tracking",
        value: getSelectionCount("foods") > 0
          ? `${getSelectionCount("foods")} selected`
          : "None selected",
      },
      {
        label: "Reminder cadence",
        value: `${data.trackingPreferences.frequency.replace("custom", "custom schedule")} reminders`,
      },
      {
        label: "Privacy mode",
        value:
          data.privacySettings.dataStorage === "encrypted-local"
            ? "Encrypted on device"
            : "Local only",
      },
    ],
    [
      data.condition,
      data.experience,
      data.privacySettings.dataStorage,
      data.trackingPreferences.frequency,
      getSelectionCount,
    ],
  );

  const handleFinish = () => {
    // Story 3.6.1 - AC3.6.1.10: Pass selections to user initialization
    console.log("[CompletionStep] Saving selections to onboarding data:", selections);
    updateData({ selections });
    onContinue("completion");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {"You're ready to start tracking"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {"Your preferences are saved locally. You can revisit onboarding anytime from the settings menu if you want to adjust them."}
        </p>
      </div>
      <div className="grid gap-4 rounded-2xl border border-border bg-muted/40 p-6 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Your setup summary</h3>
          <dl className="space-y-2 text-sm text-muted-foreground">
            {highlights.map((item) => (
              <div key={item.label} className="flex flex-col rounded-lg bg-background/70 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                  {item.label}
                </dt>
                <dd className="text-base text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">What happens next?</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Your selected items will be ready to log immediately.</li>
            <li>Jump into the dashboard to log today's health context.</li>
            <li>Review tips in the help center whenever you need a refresher.</li>
            <li>Adjust notifications or privacy settings from the settings menu.</li>
          </ul>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
            Your onboarding completion date will appear in your account log for compliance records.
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => reset()}
        >
          Restart onboarding
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          onClick={handleFinish}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};
