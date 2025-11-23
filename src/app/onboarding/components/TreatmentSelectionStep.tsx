"use client";

import { useMemo } from "react";
import { SelectionStep } from "./SelectionStep";
import { DEFAULT_TREATMENTS } from "@/lib/data/treatment-defaults";
import type { OnboardingStepComponentProps } from "../types/onboarding";

/**
 * Treatment Selection Step
 * 
 * Allows users to select which treatments they want to track during onboarding
 * Following the same UX pattern as symptom and trigger selection
 */

export function TreatmentSelectionStep({
    onContinue,
    onBack,
}: OnboardingStepComponentProps) {
    const handleNext = () => {
        onContinue("treatmentSelection");
    };

    const handleSkip = () => {
        onContinue("treatmentSelection");
    };

    // Map DEFAULT_TREATMENTS to include category
    const treatmentItems = useMemo(() =>
        DEFAULT_TREATMENTS.map(treatment => ({
            ...treatment,
            category: treatment.category || "Other",
        })),
        []
    );

    return (
        <SelectionStep
            type="treatments"
            title="What treatments do you use?"
            description="Select treatments you want to track"
            defaultItems={treatmentItems}
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={onBack}
        />
    );
}
