"use client";

import { SelectionStep } from "./SelectionStep";
import { DEFAULT_FOODS } from "@/lib/data/defaultData";
import type { OnboardingStepComponentProps } from "../types/onboarding";

/**
 * Food Selection Step
 * Story 3.6.1 - Task 6, AC3.6.1.6
 *
 * Allows users to select which foods they want to track during onboarding
 * EXACT SAME UX pattern as symptom selection
 */

export function FoodSelectionStep({
  onContinue,
  onBack,
}: OnboardingStepComponentProps) {
  const handleNext = () => {
    onContinue("foodSelection");
  };

  const handleSkip = () => {
    onContinue("foodSelection");
  };

  return (
    <SelectionStep
      type="foods"
      title="Which foods do you want to track?"
      description="Select foods that might be triggers or that you eat frequently. You can add more anytime from the food logging screen."
      defaultItems={DEFAULT_FOODS}
      onNext={handleNext}
      onSkip={handleSkip}
      onBack={onBack}
    />
  );
}
