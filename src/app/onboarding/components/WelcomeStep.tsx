"use client";

import { useId } from "react";
import type { OnboardingStepComponentProps } from "../types/onboarding";

export const WelcomeStep = ({ onContinue, progress }: OnboardingStepComponentProps) => {
  const descriptionId = useId();
  const reassuranceId = useId();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {progress.total} step onboarding
        </p>
        <h2 className="text-2xl font-semibold text-foreground">Welcome!</h2>
        <p id={descriptionId} className="text-muted-foreground">
          This guided setup personalizes your tracker in just a few minutes. Each answer tunes reminders, insights, and layouts so
          you can focus on how you feel instead of managing settings.
        </p>
      </div>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Control how and when you track daily health information.</li>
        <li>Learn privacy-first practices that keep your data in your hands.</li>
        <li>Prepare the foundations for smart insights later in development.</li>
      </ul>
      <div
        id={reassuranceId}
        role="note"
        className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm text-primary"
      >
        Your answers never leave this device. You can pause at any time—progress is stored locally and can be resumed from the settings
        menu.
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          aria-describedby={`${descriptionId} ${reassuranceId}`}
          onClick={() => onContinue("welcome")}
        >
          Start setup
        </button>
      </div>
    </div>
  );
};
