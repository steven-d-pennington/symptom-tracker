"use client";

import { useMemo } from "react";
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

  // Map DEFAULT_MEDICATIONS to include category (use 'type' field as category)
  const medicationItems = useMemo(() =>
    DEFAULT_MEDICATIONS.map(med => ({
      ...med,
      category: med.type, // Map 'type' to 'category' for SelectionStep
    })),
    []
  );

  return (
    <SelectionStep
      type="medications"
      title="What treatments do you use?"
      description="Select medications and treatments you want to track"
      defaultItems={medicationItems}
      onNext={handleNext}
      onSkip={handleSkip}
      onBack={onBack}
    />
  );
}
