"use client";

import Link from "next/link";
import { OnboardingData, OnboardingStepId } from "../types/onboarding";

type StepProps = {
  onContinue: (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => void;
};

export const CompletionStep = ({ onContinue }: StepProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {"You\u2019re ready to start tracking"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {"Your preferences are saved locally. You can revisit onboarding anytime from the settings menu if you want to adjust them."}
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-primary/60 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold text-primary">
          {"What\u2019s next?"}
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-primary">
          <li>• Log your first symptom or daily entry.</li>
          <li>• Explore the calendar to spot trends.</li>
          <li>• Check the help center for advanced tips.</li>
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => onContinue("completion")}
        >
          Restart onboarding
        </button>
        <Link
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};
