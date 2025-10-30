import type { ComponentType } from "react";

export type OnboardingStepId =
  | "welcome"
  | "profile"
  | "condition"
  | "preferences"
  | "privacy"
  | "education"
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

export interface OnboardingData {
  userProfile?: UserProfile;
  condition: string;
  experience: "new" | "experienced" | "returning";
  trackingPreferences: TrackingPreferences;
  privacySettings: PrivacySettings;
  educationalContent: EducationalProgress;
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
