import { OnboardingStepDefinition } from "../types/onboarding";

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  {
    id: "welcome",
    title: "Welcome to the Pocket Symptom Tracker",
    description:
      "Get a quick overview of how the tracker keeps your health data organized and private.",
  },
  {
    id: "profile",
    title: "Create Your Profile",
    description:
      "Enter your basic information to personalize your experience.",
  },
  {
    id: "condition",
    title: "Choose Your Focus Areas",
    description:
      "Select the condition and concerns you want to monitor so we can tailor the experience.",
  },
  {
    id: "preferences",
    title: "Set Tracking Preferences",
    description:
      "Tell us how often you want reminders and which symptom categories matter most to you.",
  },
  {
    id: "privacy",
    title: "Privacy Preferences",
    description:
      "Control where your data is stored and whether to share optional diagnostics.",
  },
  {
    id: "education",
    title: "Quick Learning Modules",
    description: "Review privacy basics and tips for consistent, low-effort tracking.",
  },
  {
    id: "symptomSelection",
    title: "Select Your Symptoms",
    description:
      "Choose which symptoms you want to track. Search and add custom items if needed.",
  },
  {
    id: "triggerSelection",
    title: "Select Your Triggers",
    description:
      "Choose which triggers you want to monitor. Search and add custom items if needed.",
  },
  {
    id: "treatmentSelection",
    title: "Select Your Treatments",
    description:
      "Choose which treatments you want to track. Search and add custom items if needed.",
  },
  {
    id: "medicationSelection",
    title: "Select Your Medications",
    description:
      "Choose which medications you want to track. Search and add custom items if needed.",
  },
  {
    id: "foodSelection",
    title: "Select Foods to Track",
    description:
      "Choose which foods you want to monitor. Search and add custom items if needed.",
  },
  {
    id: "completion",
    title: "All Set!",
    description:
      "Preview your personalized dashboard and start logging your first entry.",
  },
];

export const DEFAULT_TRACKING_PREFERENCES = {
  frequency: "daily" as const,
  focusAreas: ["Pain", "Fatigue"],
  notificationsEnabled: true,
  reminderTime: "09:00",
};

export const DEFAULT_PRIVACY_SETTINGS = {
  dataStorage: "encrypted-local" as const,
  analyticsOptIn: false,
  crashReportsOptIn: false,
};
