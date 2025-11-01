"use client";

import { SelectionStep } from "./SelectionStep";
import { DEFAULT_SYMPTOMS } from "@/lib/data/defaultData";
import type { OnboardingStepComponentProps } from "../types/onboarding";

/**
 * Symptom Selection Step
 * Story 3.6.1 - Task 3, AC3.6.1.1
 *
 * Allows users to select which symptoms they want to track during onboarding
 */

export function SymptomSelectionStep({
  onContinue,
  onBack,
}: OnboardingStepComponentProps) {
  const handleNext = () => {
    onContinue("symptomSelection");
  };

  const handleSkip = () => {
    onContinue("symptomSelection");
  };

  return (
    <SelectionStep
      type="symptoms"
      title="Which symptoms do you experience?"
      description="Select symptoms you want to track. You can add more later."
      defaultItems={DEFAULT_SYMPTOMS}
      onNext={handleNext}
      onSkip={handleSkip}
      onBack={onBack}
    />
  );
}
