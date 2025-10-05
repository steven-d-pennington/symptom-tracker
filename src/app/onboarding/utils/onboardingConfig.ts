import { OnboardingStepDefinition } from "../types/onboarding";

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  {
    id: "welcome",
    title: "Welcome to the Pocket Symptom Tracker",
    description:
      "Get a quick overview of how the tracker keeps your health data organized and private.",
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
    id: "education",
    title: "Learn the Basics",
    description:
      "Review short lessons on effective symptom tracking, privacy, and staying motivated.",
    optional: true,
  },
  {
    id: "privacy",
    title: "Review Privacy Controls",
    description:
      "Understand exactly how your information stays on your device and under your control.",
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
  focusAreas: ["pain", "fatigue"],
  notificationsEnabled: true,
  reminderTime: "09:00",
};

export const DEFAULT_PRIVACY_SETTINGS = {
  dataStorage: "encrypted-local" as const,
  analyticsOptIn: false,
  crashReportsOptIn: false,
};
