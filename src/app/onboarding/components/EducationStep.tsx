"use client";

import { OnboardingData, OnboardingStepId } from "../types/onboarding";

type StepProps = {
  onContinue: (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => void;
};

const MODULES = [
  {
    id: "symptom-tracking",
    title: "Symptom tracking fundamentals",
    summary:
      "Capture severity, duration, and triggers to understand how symptoms change over time.",
  },
  {
    id: "privacy-basics",
    title: "Privacy controls",
    summary:
      "All information stays on your device. Learn how to export or delete data whenever you choose.",
  },
  {
    id: "motivation",
    title: "Staying consistent",
    summary: "Discover quick logging techniques for difficult days so tracking never feels overwhelming.",
  },
];

export const EducationStep = ({ onContinue }: StepProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Quick learning modules
        </h2>
        <p className="text-sm text-muted-foreground">
          Review these short lessons now or revisit them later from the help center.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {MODULES.map((module) => (
          <article
            key={module.id}
            className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{module.summary}</p>
            </div>
            <button
              type="button"
              className="self-start text-sm font-medium text-primary hover:underline"
            >
              View outline
            </button>
          </article>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => onContinue("education")}
        >
          Skip for now
        </button>
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          onClick={() => onContinue("education", {
            educationalContent: { completedModules: MODULES.map((module) => module.id) },
          })}
        >
          Mark as reviewed
        </button>
      </div>
    </div>
  );
};
