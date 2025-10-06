"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ONBOARDING_STORAGE_KEY } from "../utils/storage";

const hasCompletedOnboarding = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as {
      isComplete?: boolean;
      completedSteps?: string[];
      orderedSteps?: string[];
    };

    if (!parsed.isComplete) {
      return false;
    }

    if (Array.isArray(parsed.orderedSteps) && Array.isArray(parsed.completedSteps)) {
      return parsed.orderedSteps.every((stepId) => parsed.completedSteps?.includes(stepId));
    }

    return parsed.isComplete ?? false;
  } catch {
    return false;
  }
};

export const OnboardingRedirectGate = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/onboarding")) {
      return;
    }

    if (!hasCompletedOnboarding()) {
      router.replace("/onboarding");
    }
  }, [pathname, router]);

  return null;
};
