"use client";

import { OnboardingData, OnboardingStepId } from "../types/onboarding";

type StepProps = {
  onContinue: (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => void;
};

export const WelcomeStep = ({ onContinue }: StepProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Welcome!</h2>
        <p className="text-muted-foreground">
          This guided setup personalizes your tracker in just a few minutes. You can pause anytime—your progress is saved locally
          on this device.
        </p>
      </div>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Control how and when you track daily health information.</li>
        <li>Learn privacy-first practices that keep your data in your hands.</li>
        <li>Prepare the foundations for smart insights later in development.</li>
      </ul>
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          onClick={() => onContinue("welcome")}
        >
          Start setup
        </button>
      </div>
    </div>
  );
};
