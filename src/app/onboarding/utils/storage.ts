import { DEFAULT_PRIVACY_SETTINGS, DEFAULT_TRACKING_PREFERENCES, ONBOARDING_STEPS } from "./onboardingConfig";
import type {
  OnboardingData,
  OnboardingState,
  OnboardingStepId,
} from "../types/onboarding";

export const ONBOARDING_STORAGE_KEY = "pocket:onboarding-state";
export const CURRENT_USER_ID_KEY = "pocket:currentUserId";

export const createInitialData = (): OnboardingData => ({
  condition: "Hidradenitis Suppurativa",
  experience: "new",
  trackingPreferences: {
    ...DEFAULT_TRACKING_PREFERENCES,
    focusAreas: [...DEFAULT_TRACKING_PREFERENCES.focusAreas],
  },
  privacySettings: { ...DEFAULT_PRIVACY_SETTINGS },
  educationalContent: {
    completedModules: [],
  },
});

export const createInitialState = (): OnboardingState => ({
  currentStep: 0,
  orderedSteps: ONBOARDING_STEPS.map((step) => step.id),
  completedSteps: [],
  data: createInitialData(),
  isComplete: false,
  hydrated: false,
});

type PersistedEducationalContent = {
  completedModules?: string[];
  lastViewedAt?: string;
};

type PersistedOnboardingData = Omit<OnboardingData, "educationalContent"> & {
  educationalContent: PersistedEducationalContent;
};

type PersistedOnboardingState = {
  currentStep: number;
  orderedSteps: OnboardingStepId[];
  completedSteps: OnboardingStepId[];
  data: PersistedOnboardingData;
  isComplete: boolean;
};

export const mergeOnboardingData = (
  current: OnboardingData,
  updates?: Partial<OnboardingData>,
): OnboardingData => {
  if (!updates) {
    return current;
  }

  const nextTrackingPreferences = updates.trackingPreferences
    ? {
        ...current.trackingPreferences,
        ...updates.trackingPreferences,
        focusAreas: updates.trackingPreferences.focusAreas
          ? [...updates.trackingPreferences.focusAreas]
          : current.trackingPreferences.focusAreas,
      }
    : current.trackingPreferences;

  const nextEducationalContent = updates.educationalContent
    ? {
        ...current.educationalContent,
        ...updates.educationalContent,
        completedModules: updates.educationalContent.completedModules
          ? [...updates.educationalContent.completedModules]
          : current.educationalContent.completedModules,
      }
    : current.educationalContent;

  return {
    ...current,
    ...updates,
    trackingPreferences: nextTrackingPreferences,
    privacySettings: updates.privacySettings
      ? {
          ...current.privacySettings,
          ...updates.privacySettings,
        }
      : current.privacySettings,
    educationalContent: nextEducationalContent,
  };
};

const serializeOnboardingState = (state: OnboardingState): PersistedOnboardingState => ({
  currentStep: state.currentStep,
  orderedSteps: state.orderedSteps,
  completedSteps: state.completedSteps,
  data: {
    ...state.data,
    educationalContent: {
      ...state.data.educationalContent,
      lastViewedAt: state.data.educationalContent.lastViewedAt?.toISOString(),
    },
  },
  isComplete: state.isComplete,
});

const reviveEducationalContent = (
  content?: PersistedEducationalContent,
): OnboardingData["educationalContent"] => ({
  completedModules: content?.completedModules ?? [],
  lastViewedAt: content?.lastViewedAt ? new Date(content.lastViewedAt) : undefined,
});

const normalizeCompletedSteps = (
  completedSteps: OnboardingStepId[],
  orderedSteps: OnboardingStepId[],
): OnboardingStepId[] => {
  const valid = new Set(orderedSteps);
  const deduped: OnboardingStepId[] = [];
  completedSteps.forEach((stepId) => {
    if (valid.has(stepId) && !deduped.includes(stepId)) {
      deduped.push(stepId);
    }
  });
  return deduped;
};

export const readOnboardingStateFromStorage = (): OnboardingState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedOnboardingState;
    const orderedSteps = ONBOARDING_STEPS.map((step) => step.id);
    const completedSteps = normalizeCompletedSteps(
      parsed.completedSteps ?? [],
      orderedSteps,
    );

    const data = mergeOnboardingData(createInitialData(), {
      ...parsed.data,
      educationalContent: reviveEducationalContent(parsed.data?.educationalContent),
    });

    const currentStep = Math.min(
      Math.max(parsed.currentStep ?? 0, 0),
      Math.max(orderedSteps.length - 1, 0),
    );

    const isComplete =
      parsed.isComplete &&
      orderedSteps.every((stepId) => completedSteps.includes(stepId));

    return {
      currentStep,
      orderedSteps,
      completedSteps,
      data,
      isComplete,
      hydrated: true,
    };
  } catch (error) {
    console.warn("[Onboarding] Failed to parse stored state", error);
    return null;
  }
};

export const persistOnboardingState = (state: OnboardingState) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const snapshot = serializeOnboardingState(state);
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("[Onboarding] Failed to persist state", error);
  }
};

export const persistUserSettings = async (data: OnboardingData) => {
  if (typeof window === "undefined") {
    return;
  }

  // Ensure user profile exists
  if (!data.userProfile) {
    console.error("[Onboarding] Cannot persist user settings without user profile");
    return;
  }

  try {
    const { userRepository } = await import("@/lib/repositories/userRepository");

    // Create user record in IndexedDB with all onboarding data
    const userId = await userRepository.create({
      name: data.userProfile.name,
      email: data.userProfile.email,
      preferences: {
        theme: "system",
        notifications: {
          remindersEnabled: data.trackingPreferences.notificationsEnabled,
          reminderTime: data.trackingPreferences.reminderTime,
        },
        privacy: data.privacySettings,
        exportFormat: "json",
        symptomFilterPresets: [],
      },
    });

    console.log("[Onboarding] User created in IndexedDB:", userId);

    // Store userId in localStorage for quick access
    window.localStorage.setItem(CURRENT_USER_ID_KEY, userId);
    console.log("[Onboarding] Current user ID saved to localStorage");
  } catch (error) {
    console.error("[Onboarding] Failed to persist user settings", error);
  }
};

export const clearOnboardingStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
};

export const resetUserSettings = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CURRENT_USER_ID_KEY);
};
