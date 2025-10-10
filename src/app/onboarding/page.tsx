import { Metadata } from "next";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { OnboardingProvider } from "./hooks/useOnboarding";
import { OnboardingImportOption } from "./components/OnboardingImportOption";

export const metadata: Metadata = {
  title: "Onboarding • Pocket Symptom Tracker",
  description:
    "Personalize your Pocket Symptom Tracker experience with guided onboarding steps.",
};

const OnboardingPage = () => {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Guided setup
        </p>
        <h1 className="text-4xl font-bold text-foreground">
          Tailor the tracker to your needs
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground">
          The onboarding flow collects just enough information to personalize your dashboard, reminders, and health insights while keeping everything private on your device.
        </p>
      </div>
      <OnboardingProvider>
        <OnboardingFlow />
        <OnboardingImportOption />
      </OnboardingProvider>
    </div>
  );
};

export default OnboardingPage;
