"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useOnboarding } from "../hooks/useOnboarding";
import type { OnboardingStepComponent, OnboardingStepId } from "../types/onboarding";
import { ONBOARDING_STEPS } from "../utils/onboardingConfig";
import { CompletionStep } from "./CompletionStep";
import { ConditionStep } from "./ConditionStep";
import { EducationStep } from "./EducationStep";
import { PreferencesStep } from "./PreferencesStep";
import { PrivacyStep } from "./PrivacyStep";
import { ProfileStep } from "./ProfileStep";
import { ProgressIndicator } from "./ProgressIndicator";
import { WelcomeStep } from "./WelcomeStep";
import { SymptomSelectionStep } from "./SymptomSelectionStep";
import { TriggerSelectionStep } from "./TriggerSelectionStep";
import { MedicationSelectionStep } from "./MedicationSelectionStep";
import { FoodSelectionStep } from "./FoodSelectionStep";

const STEP_COMPONENTS: Record<OnboardingStepId, OnboardingStepComponent> = {
  welcome: WelcomeStep,
  profile: ProfileStep,
  condition: ConditionStep,
  preferences: PreferencesStep,
  privacy: PrivacyStep,
  symptomSelection: SymptomSelectionStep,
  triggerSelection: TriggerSelectionStep,
  medicationSelection: MedicationSelectionStep,
  foodSelection: FoodSelectionStep,
  education: EducationStep,
  completion: CompletionStep,
};

export const OnboardingFlow = () => {
  const {
    currentStepId,
    progress,
    steps,
    goToStep,
    markStepComplete,
    state,
    goToPreviousStep,
    updateData,
    reset,
    isHydrated,
  } = useOnboarding();

  const currentStepIndex = useMemo(
    () => steps.findIndex((step) => step.id === currentStepId),
    [steps, currentStepId],
  );

  const completedSteps = useMemo(
    () => new Set(state.completedSteps),
    [state.completedSteps],
  );

  const ActiveStep = useMemo(() => STEP_COMPONENTS[currentStepId], [currentStepId]);

  const activeStepContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = activeStepContainerRef.current;
    if (node) {
      node.focus();
    }
  }, [currentStepId]);

  const handleStepSelect = useCallback(
    (stepId: OnboardingStepId) => {
      if (stepId === currentStepId || currentStepIndex === -1) {
        return;
      }

      const targetIndex = steps.findIndex((step) => step.id === stepId);
      if (targetIndex === -1) {
        return;
      }

      const isCompleted = completedSteps.has(stepId);
      const isBackwards = targetIndex <= currentStepIndex;

      if (isBackwards || isCompleted) {
        goToStep(stepId);
      }
    },
    [completedSteps, currentStepId, currentStepIndex, goToStep, steps],
  );

  if (!isHydrated) {
    return (
      <section
        className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-48 w-full animate-pulse rounded-2xl bg-muted" />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2" aria-live="polite">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Step {progress.current} of {progress.total}
        </span>
        <h1 className="text-3xl font-semibold text-foreground">
          {ONBOARDING_STEPS[progress.current - 1]?.title ?? "Onboarding"}
        </h1>
        <p className="text-base text-muted-foreground">
          {ONBOARDING_STEPS[progress.current - 1]?.description ??
            "Answer a few quick questions to tailor your experience."}
        </p>
      </header>

      <ProgressIndicator
        steps={steps}
        currentStepId={currentStepId}
        currentStepIndex={currentStepIndex}
        completedStepIds={Array.from(completedSteps)}
        onStepSelect={handleStepSelect}
      />

      <div
        ref={activeStepContainerRef}
        tabIndex={-1}
        className={cn(
          "rounded-2xl border border-border bg-card p-6 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
      >
        <ActiveStep
          data={state.data}
          onContinue={markStepComplete}
          goToStep={goToStep}
          onBack={goToPreviousStep}
          updateData={updateData}
          progress={progress}
          reset={reset}
        />
      </div>
    </section>
  );
};
