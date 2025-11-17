"use client";

import { useState } from "react";
import { Cloud, Eye, EyeOff, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { restoreBackup, type ProgressUpdate } from "@/lib/services/cloudSyncService";
import { persistOnboardingState } from "../utils/storage";
import { ONBOARDING_STEPS } from "../utils/onboardingConfig";
import type { OnboardingStepId, OnboardingState } from "../types/onboarding";

type RestoreStep = "initial" | "passphrase-input" | "restoring" | "success" | "error";

export function OnboardingCloudRestoreOption() {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [step, setStep] = useState<RestoreStep>("initial");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate>({
    stage: "download",
    percent: 0,
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRestore = async () => {
    if (passphrase.length < 12) {
      setError("Passphrase must be at least 12 characters");
      return;
    }

    setStep("restoring");
    setError(null);

    try {
      // Restore backup (nuclear restore - wipes everything and restores all data including user)
      await restoreBackup(passphrase, (update) => {
        setProgress(update);
      });

      // Success!
      setStep("success");

      // Mark onboarding as complete with ALL steps completed
      // Use ONBOARDING_STEPS from config to ensure consistency
      const allSteps: OnboardingStepId[] = ONBOARDING_STEPS.map((step) => step.id);
      const lastStepIndex = allSteps.length - 1;

      // Create completed state with all steps marked as done
      // Since we restored from backup, user data already exists in database
      const completedState: OnboardingState = {
        currentStep: lastStepIndex, // Last step (completion) - 0-indexed
        orderedSteps: allSteps,
        completedSteps: allSteps, // Mark ALL steps as completed
        data: {
          condition: "", // Restored from backup
          experience: "returning" as const,
          trackingPreferences: {
            frequency: "daily" as const,
            focusAreas: [],
            notificationsEnabled: false,
          },
          privacySettings: {
            dataStorage: "local" as const,
            analyticsOptIn: false,
            crashReportsOptIn: false,
          },
          educationalContent: {
            completedModules: [],
          },
        },
        isComplete: true,
        hydrated: true,
      };

      // CRITICAL: Persist the completed state BEFORE redirect
      // This ensures localStorage is updated before the redirect gate checks it
      persistOnboardingState(completedState);

      // Force synchronous write to localStorage to ensure it's persisted
      // Some browsers may delay localStorage writes, so we verify it's set
      const verifyState = () => {
        const stored = window.localStorage.getItem("pocket:onboarding-state");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.isComplete && parsed.completedSteps?.length === allSteps.length) {
              console.log("[Onboarding] Onboarding state verified as complete");
              return true;
            }
          } catch (e) {
            console.error("[Onboarding] Failed to verify state:", e);
          }
        }
        return false;
      };

      // Verify state is persisted before redirecting
      if (!verifyState()) {
        console.warn("[Onboarding] State not persisted, retrying...");
        persistOnboardingState(completedState);
      }

      // Hard redirect to dashboard after a brief delay
      // This forces a full page reload which reinitializes all hooks with correct userId
      setTimeout(() => {
        // Double-check state is persisted before redirect
        if (verifyState()) {
          window.location.href = "/dashboard";
        } else {
          console.error("[Onboarding] Failed to persist onboarding state, redirecting anyway");
          window.location.href = "/dashboard";
        }
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Restore failed";
      setError(message);
      setStep("error");
    }
  };

  const resetDialog = () => {
    setShowRestoreDialog(false);
    setStep("initial");
    setPassphrase("");
    setError(null);
    setProgress({ stage: "download", percent: 0, message: "" });
  };

  if (!showRestoreDialog) {
    return (
      <div className="mt-8 pt-6 border-t border-border">
        <button
          onClick={() => setShowRestoreDialog(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 rounded-lg transition-colors"
        >
          <Cloud className="w-4 h-4" />
          Already have a cloud backup? Restore from cloud
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="rounded-lg bg-card border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Restore from Cloud Backup</h3>
              <p className="text-sm text-muted-foreground">
                Skip onboarding by restoring your encrypted backup
              </p>
            </div>
          </div>
          <button
            onClick={resetDialog}
            disabled={step === "restoring"}
            className="p-1 text-muted-foreground hover:text-foreground rounded disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Initial / Passphrase Input Step */}
        {step !== "restoring" && step !== "success" && step !== "error" && (
          <>
            {/* Warning Box */}
            <div className="mb-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Important: Use your backup passphrase
                  </p>
                  <p className="text-yellow-800 dark:text-yellow-200">
                    This will restore your cloud backup and skip the onboarding process. Make sure
                    you enter the correct passphrase.
                  </p>
                </div>
              </div>
            </div>

            {/* Passphrase Input */}
            <div className="mb-4">
              <label htmlFor="restore-passphrase" className="block text-sm font-medium mb-2">
                Enter Your Backup Passphrase
              </label>
              <div className="relative">
                <input
                  id="restore-passphrase"
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Minimum 12 characters"
                  className="w-full pr-10 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && passphrase.length >= 12) {
                      handleRestore();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassphrase ? "Hide passphrase" : "Show passphrase"}
                >
                  {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {passphrase.length} / 12 minimum characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleRestore}
                disabled={passphrase.length < 12}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Restore & Continue
              </button>
              <button
                onClick={resetDialog}
                className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Restoring Step */}
        {step === "restoring" && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Restoring backup...
                </span>
                <span className="text-sm font-semibold text-primary">{progress.percent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress.percent}%` }}
                  role="progressbar"
                  aria-valuenow={progress.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Restore progress"
                />
              </div>

              {/* Stage Message */}
              <p className="mt-2 text-sm text-center text-muted-foreground">
                {progress.message || `${progress.stage}...`}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Please wait while we restore your data. This may take a moment...
              </p>
            </div>
          </>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-green-800 dark:text-green-100">
                  Restore Successful!
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your data has been restored successfully. Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Step */}
        {step === "error" && error && (
          <>
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
              <h4 className="font-medium text-red-800 dark:text-red-100 mb-2">
                Restore Failed
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep("initial");
                  setError(null);
                  setPassphrase("");
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={resetDialog}
                className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
