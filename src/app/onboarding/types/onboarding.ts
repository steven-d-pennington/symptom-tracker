import type { ComponentType } from "react";

export type OnboardingStepId =
  | "welcome"
  | "profile"
  | "condition"
  | "preferences"
  | "education"
  | "symptomSelection"
  | "triggerSelection"
  | "treatmentSelection"
  | "medicationSelection"
  | "foodSelection"
  | "completion";

export interface TrackingPreferences {
  frequency: "daily" | "weekly" | "custom";
  focusAreas: string[];
  notificationsEnabled: boolean;
  reminderTime?: string;
}

export interface PrivacySettings {
  dataStorage: "local" | "encrypted-local";
  analyticsOptIn: boolean;
  crashReportsOptIn: boolean;
}

export interface EducationalProgress {
  completedModules: string[];
  lastViewedAt?: Date;
}

export interface UserProfile {
  name: string;
  email: string;
}

/**
 * Selection item for onboarding (symptoms, triggers, medications, foods)
 * Story 3.6.1 - AC3.6.1.9, AC3.6.1.10
 */
export interface SelectionItem {
  id?: string;
  name: string;
  category: string;
  description?: string;
  isDefault: boolean;
  isCustom: boolean;
}

/**
 * Onboarding selections for all data types
 * Story 3.6.1 - Task 1
 */
export interface OnboardingSelections {
  symptoms: SelectionItem[];
  triggers: SelectionItem[];
  treatments: SelectionItem[];
  medications: SelectionItem[];
  foods: SelectionItem[];
}

export interface OnboardingData {
  userProfile?: UserProfile;
  condition: string;
  experience: "new" | "experienced" | "returning";
  trackingPreferences: TrackingPreferences;
  privacySettings: PrivacySettings;
  educationalContent: EducationalProgress;
  selections?: OnboardingSelections;
}

export interface OnboardingState {
  currentStep: number;
  orderedSteps: OnboardingStepId[];
  completedSteps: OnboardingStepId[];
  data: OnboardingData;
  isComplete: boolean;
  hydrated: boolean;
}

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  title: string;
  description: string;
  optional?: boolean;
}

export interface OnboardingProgress {
  total: number;
  completed: number;
  current: number;
  percentage: number;
}

export interface OnboardingStepComponentProps {
  data: OnboardingData;
  onContinue: (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => void;
  goToStep: (stepId: OnboardingStepId) => void;
  onBack: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  progress: OnboardingProgress;
  reset: () => void;
}

export type OnboardingStepComponent = ComponentType<OnboardingStepComponentProps>;
