"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useOnboarding } from "../hooks/useOnboarding";
import { OnboardingStepId } from "../types/onboarding";
import { ONBOARDING_STEPS } from "../utils/onboardingConfig";
import { CompletionStep } from "./CompletionStep";
import { ConditionStep } from "./ConditionStep";
import { EducationStep } from "./EducationStep";
import { PreferencesStep } from "./PreferencesStep";
import { PrivacyStep } from "./PrivacyStep";
import { ProgressIndicator } from "./ProgressIndicator";
import { WelcomeStep } from "./WelcomeStep";

const STEP_COMPONENTS: Record<OnboardingStepId, React.ComponentType> = {
  welcome: WelcomeStep,
  condition: ConditionStep,
  preferences: PreferencesStep,
  education: EducationStep,
  privacy: PrivacyStep,
  completion: CompletionStep,
};

export const OnboardingFlow = () => {
  const { currentStepId, progress, steps, goToStep, markStepComplete } =
    useOnboarding();

  const ActiveStep = useMemo(() => STEP_COMPONENTS[currentStepId], [currentStepId]);

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
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
        onStepSelect={goToStep}
      />

      <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm")}> 
        <ActiveStep onContinue={markStepComplete} />
      </div>
    </section>
  );
};
