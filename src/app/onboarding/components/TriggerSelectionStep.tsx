"use client";

import { SelectionStep } from "./SelectionStep";
import { DEFAULT_TRIGGERS } from "@/lib/data/defaultData";
import type { OnboardingStepComponentProps } from "../types/onboarding";

/**
 * Trigger Selection Step
 * Story 3.6.1 - Task 4, AC3.6.1.4
 *
 * Allows users to select which triggers they want to track during onboarding
 * EXACT SAME UX pattern as symptom selection
 */

export function TriggerSelectionStep({
  onContinue,
  onBack,
}: OnboardingStepComponentProps) {
  const handleNext = () => {
    onContinue("triggerSelection");
  };

  const handleSkip = () => {
    onContinue("triggerSelection");
  };

  return (
    <SelectionStep
      type="triggers"
      title="Which triggers affect you?"
      description="Select triggers you want to track"
      defaultItems={DEFAULT_TRIGGERS}
      onNext={handleNext}
      onSkip={handleSkip}
      onBack={onBack}
    />
  );
}
