"use client";

import { cn } from "@/lib/utils/cn";
import { OnboardingStepDefinition, OnboardingStepId } from "../types/onboarding";

type ProgressIndicatorProps = {
  steps: OnboardingStepDefinition[];
  currentStepId: OnboardingStepId;
  onStepSelect?: (stepId: OnboardingStepId) => void;
};

export const ProgressIndicator = ({
  steps,
  currentStepId,
  onStepSelect,
}: ProgressIndicatorProps) => {
  return (
    <ol className="flex flex-wrap items-center gap-3" aria-label="Onboarding progress">
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId;
        return (
          <li key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
                step.optional && "border border-dashed border-muted-foreground/50",
              )}
              onClick={() => onStepSelect?.(step.id)}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-background/80 text-xs">
                {index + 1}
              </span>
              <span>{step.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
