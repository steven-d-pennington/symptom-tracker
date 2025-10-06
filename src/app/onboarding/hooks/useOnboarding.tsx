"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ONBOARDING_STEPS } from "../utils/onboardingConfig";
import {
  clearOnboardingStorage,
  createInitialState,
  mergeOnboardingData,
  persistOnboardingState,
  persistUserSettings,
  readOnboardingStateFromStorage,
  resetUserSettings,
} from "../utils/storage";
import type {
  OnboardingData,
  OnboardingProgress,
  OnboardingState,
  OnboardingStepDefinition,
  OnboardingStepId,
} from "../types/onboarding";

interface OnboardingContextValue {
  state: OnboardingState;
  currentStepId: OnboardingStepId;
  steps: OnboardingStepDefinition[];
  goToStep: (stepId: OnboardingStepId) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  markStepComplete: (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  reset: () => void;
  progress: OnboardingProgress;
  isHydrated: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const getInitialState = (): OnboardingState => {
  const stored = readOnboardingStateFromStorage();
  if (stored) {
    return stored;
  }
  return createInitialState();
};

export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<OnboardingState>(getInitialState);

  useEffect(() => {
    setState((prev) => (prev.hydrated ? prev : { ...prev, hydrated: true }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }

    persistOnboardingState(state);

    if (state.isComplete) {
      persistUserSettings(state.data);
    }
  }, [state]);

  const goToStep = useCallback((stepId: OnboardingStepId) => {
    setState((prev) => {
      const index = prev.orderedSteps.indexOf(stepId);
      if (index === -1) {
        return prev;
      }

      return {
        ...prev,
        currentStep: index,
      };
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.orderedSteps.length - 1),
    }));
  }, []);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setState((prev) => ({
      ...prev,
      data: mergeOnboardingData(prev.data, updates),
    }));
  }, []);

  const markStepComplete = useCallback(
    (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => {
      setState((prev) => {
        const stepIndex = prev.orderedSteps.indexOf(stepId);
        if (stepIndex === -1) {
          return prev;
        }

        const mergedData = mergeOnboardingData(prev.data, data);
        const alreadyCompleted = prev.completedSteps.includes(stepId);
        const completedSteps = alreadyCompleted
          ? prev.completedSteps
          : [...prev.completedSteps, stepId];

        const isComplete =
          completedSteps.length === prev.orderedSteps.length &&
          prev.orderedSteps.every((id) => completedSteps.includes(id));

        const nextIndex =
          prev.currentStep === stepIndex
            ? Math.min(stepIndex + 1, prev.orderedSteps.length - 1)
            : prev.currentStep;

        return {
          ...prev,
          data: mergedData,
          completedSteps,
          isComplete,
          currentStep: nextIndex,
        };
      });
    },
    [],
  );

  const reset = useCallback(() => {
    clearOnboardingStorage();
    resetUserSettings();
    setState({ ...createInitialState(), hydrated: true });
  }, []);

  const currentStepId = useMemo<OnboardingStepId>(() => {
    const fallback = ONBOARDING_STEPS[0]?.id ?? "welcome";
    return state.orderedSteps[state.currentStep] ?? fallback;
  }, [state.currentStep, state.orderedSteps]);

  const progress = useMemo<OnboardingProgress>(() => {
    const total = state.orderedSteps.length;
    const completed = state.completedSteps.length;
    const current = Math.min(state.currentStep + 1, Math.max(total, 1));
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, current, percentage };
  }, [state.completedSteps.length, state.currentStep, state.orderedSteps.length]);

  const value = useMemo<OnboardingContextValue>(() => ({
    state,
    currentStepId,
    steps: ONBOARDING_STEPS,
    goToStep,
    goToPreviousStep,
    goToNextStep,
    markStepComplete,
    updateData,
    reset,
    progress,
    isHydrated: state.hydrated,
  }), [
    state,
    currentStepId,
    goToStep,
    goToPreviousStep,
    goToNextStep,
    markStepComplete,
    updateData,
    reset,
    progress,
  ]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }

  return context;
};
