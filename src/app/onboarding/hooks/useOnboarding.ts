import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_TRACKING_PREFERENCES,
  ONBOARDING_STEPS,
} from "../utils/onboardingConfig";
import {
  OnboardingData,
  OnboardingState,
  OnboardingStepId,
} from "../types/onboarding";

const createInitialData = (): OnboardingData => ({
  condition: "Hidradenitis Suppurativa",
  experience: "new",
  trackingPreferences: DEFAULT_TRACKING_PREFERENCES,
  privacySettings: DEFAULT_PRIVACY_SETTINGS,
  educationalContent: {
    completedModules: [],
  },
});

const createInitialState = (): OnboardingState => ({
  currentStep: 0,
  orderedSteps: ONBOARDING_STEPS.map((step) => step.id),
  completedSteps: new Set(),
  data: createInitialData(),
  isComplete: false,
});

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(createInitialState);

  const currentStepId = state.orderedSteps[state.currentStep];

  const goToStep = useCallback((stepId: OnboardingStepId) => {
    setState((prev) => {
      const nextIndex = prev.orderedSteps.indexOf(stepId);
      if (nextIndex === -1) {
        return prev;
      }

      return {
        ...prev,
        currentStep: nextIndex,
      };
    });
  }, []);

  const markStepComplete = useCallback(
    (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => {
      setState((prev) => {
        const completedSteps = new Set(prev.completedSteps);
        completedSteps.add(stepId);

        const mergedData = data
          ? { ...prev.data, ...data }
          : prev.data;

        const isComplete =
          completedSteps.size === prev.orderedSteps.length &&
          prev.orderedSteps.every((id) => completedSteps.has(id));

        return {
          ...prev,
          completedSteps,
          data: mergedData,
          isComplete,
          currentStep: Math.min(
            prev.currentStep + 1,
            prev.orderedSteps.length - 1,
          ),
        };
      });
    },
  []);

  const progress = useMemo(() => ({
    total: state.orderedSteps.length,
    completed: state.completedSteps.size,
    current: state.currentStep + 1,
  }), [state.completedSteps.size, state.currentStep, state.orderedSteps.length]);

  return {
    state,
    currentStepId,
    steps: ONBOARDING_STEPS,
    goToStep,
    markStepComplete,
    progress,
  };
};
