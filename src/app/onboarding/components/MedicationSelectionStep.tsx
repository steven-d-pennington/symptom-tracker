"use client";

import { SelectionStep } from "./SelectionStep";
import { DEFAULT_MEDICATIONS } from "@/lib/data/defaultData";
import type { OnboardingStepComponentProps } from "../types/onboarding";

/**
 * Medication Selection Step
 * Story 3.6.1 - Task 5, AC3.6.1.5
 *
 * Allows users to select which treatments/medications they want to track during onboarding
 * EXACT SAME UX pattern as symptom selection
 */

export function MedicationSelectionStep({
  onContinue,
  onBack,
}: OnboardingStepComponentProps) {
  const handleNext = () => {
    onContinue("medicationSelection");
  };

  const handleSkip = () => {
    onContinue("medicationSelection");
  };

  return (
    <SelectionStep
      type="medications"
      title="What treatments do you use?"
      description="Select medications and treatments you want to track"
      defaultItems={DEFAULT_MEDICATIONS}
      onNext={handleNext}
      onSkip={handleSkip}
      onBack={onBack}
    />
  );
}
