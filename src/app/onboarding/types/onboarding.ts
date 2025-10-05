export type OnboardingStepId =
  | "welcome"
  | "condition"
  | "preferences"
  | "education"
  | "privacy"
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

export interface OnboardingData {
  condition: string;
  experience: "new" | "experienced" | "returning";
  trackingPreferences: TrackingPreferences;
  privacySettings: PrivacySettings;
  educationalContent: EducationalProgress;
}

export interface OnboardingState {
  currentStep: number;
  orderedSteps: OnboardingStepId[];
  completedSteps: Set<OnboardingStepId>;
  data: OnboardingData;
  isComplete: boolean;
}

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  title: string;
  description: string;
  optional?: boolean;
}
