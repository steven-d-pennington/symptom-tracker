"use client";

import { useState, useRef } from "react";
import { Upload, FileJson, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { importService, type ImportOptions, type ImportResult } from "@/lib/services";
import { userRepository } from "@/lib/repositories";
import { persistOnboardingState } from "../utils/storage";
import { createInitialState } from "../utils/storage";
import { ONBOARDING_STEPS } from "../utils/onboardingConfig";
import type { OnboardingStepId } from "../types/onboarding";

const CURRENT_USER_ID_KEY = "pocket:currentUserId";

type ImportStep = "file-select" | "existing-data-check" | "importing";

export function OnboardingImportOption() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [step, setStep] = useState<ImportStep>("file-select");
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<"replace" | "merge" | "skip">("merge");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [existingDataCounts, setExistingDataCounts] = useState<{
    symptoms: number;
    medications: number;
    triggers: number;
    dailyEntries: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
      
      // Check if user has existing data
      try {
        const user = await userRepository.getOrCreateCurrentUser();
        const { hasData, counts } = await importService.hasExistingData(user.id);
        
        if (hasData) {
          setExistingDataCounts(counts);
          setStep("existing-data-check");
        } else {
          setStep("file-select");
        }
      } catch (error) {
        console.error("Failed to check existing data:", error);
        setStep("file-select");
      }
    }
  };

  const handleProceedToImport = () => {
    setStep("importing");
    handleImport();
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert("Please select a file to import");
      return;
    }

    setIsImporting(true);

    try {
      // Get or create a user for this import
      const user = await userRepository.getOrCreateCurrentUser();

      const options: ImportOptions = {
        mergeStrategy,
        validateData: true,
        updateUserProfile: true, // Always update user profile from import
      };

      const result = await importService.importFromJSON(
        selectedFile,
        user.id,
        options
      );

      setImportResult(result);

      if (result.success) {
        // Store the user ID
        window.localStorage.setItem(CURRENT_USER_ID_KEY, user.id);

        // Mark onboarding as complete
        const allSteps: OnboardingStepId[] = ONBOARDING_STEPS.map((step) => step.id);
        const lastStepIndex = Math.max(allSteps.length - 1, 0);
        const completedState = {
          ...createInitialState(),
          isComplete: true,
          completedSteps: allSteps,
          orderedSteps: allSteps,
          currentStep: lastStepIndex,
          hydrated: true,
        };
        persistOnboardingState(completedState);

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push("/dashboard");
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({
        success: false,
        imported: {
          symptoms: 0,
          medications: 0,
          triggers: 0,
          dailyEntries: 0,
          photos: 0,
          medicationEvents: 0,
          triggerEvents: 0,
          symptomInstances: 0,
          flares: 0,
          flareEvents: 0,
          foods: 0,
          foodEvents: 0,
          foodCombinations: 0,
          uxEvents: 0,
          bodyMapLocations: 0,
          bodyMapPreferences: 0,
          photoComparisons: 0,
          analysisResults: 0,
        },
        errors: [error instanceof Error ? error.message : "Unknown error"],
        skipped: {
          items: 0,
          photos: 0,
        },
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setShowImportDialog(false);
    setStep("file-select");
    setSelectedFile(null);
    setImportResult(null);
    setExistingDataCounts(null);
    setMergeStrategy("merge");
  };

  if (!showImportDialog) {
    return (
      <div className="mt-8 pt-6 border-t border-border">
        <button
          onClick={() => setShowImportDialog(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Already have data? Import from another device
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
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Import Existing Data</h3>
              <p className="text-sm text-muted-foreground">
                Skip onboarding by importing your data
              </p>
            </div>
          </div>
          <button
            onClick={resetDialog}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Data Warning Screen */}
        {step === "existing-data-check" && existingDataCounts && !importResult && (
          <>
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
              <h3 className="text-base font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Existing Data Detected
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                You already have data in this profile. How would you like to proceed?
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {existingDataCounts.symptoms > 0 && (
                  <li>• {existingDataCounts.symptoms} symptom(s)</li>
                )}
                {existingDataCounts.medications > 0 && (
                  <li>• {existingDataCounts.medications} medication(s)</li>
                )}
                {existingDataCounts.triggers > 0 && (
                  <li>• {existingDataCounts.triggers} trigger(s)</li>
                )}
                {existingDataCounts.dailyEntries > 0 && (
                  <li>• {existingDataCounts.dailyEntries} daily entry/entries</li>
                )}
              </ul>
            </div>

            {/* Merge Strategy Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Choose Import Strategy
              </label>
              <div className="space-y-2">
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-2 rounded border border-transparent hover:border-primary/30 transition-colors">
                  <input
                    type="radio"
                    value="merge"
                    checked={mergeStrategy === "merge"}
                    onChange={(e) => setMergeStrategy(e.target.value as "merge")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground text-sm">✅ Merge (Recommended)</div>
                    <div className="text-xs text-muted-foreground">
                      Keep both existing and imported data.
                    </div>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-2 rounded border border-transparent hover:border-primary/30 transition-colors">
                  <input
                    type="radio"
                    value="replace"
                    checked={mergeStrategy === "replace"}
                    onChange={(e) => setMergeStrategy(e.target.value as "replace")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground text-sm">🔄 Replace Duplicates</div>
                    <div className="text-xs text-muted-foreground">
                      Update existing items with imported data.
                    </div>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-2 rounded border border-transparent hover:border-primary/30 transition-colors">
                  <input
                    type="radio"
                    value="skip"
                    checked={mergeStrategy === "skip"}
                    onChange={(e) => setMergeStrategy(e.target.value as "skip")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground text-sm">⏭️ Skip Duplicates</div>
                    <div className="text-xs text-muted-foreground">
                      Only import new items, skip duplicates.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleProceedToImport}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 font-medium"
              >
                Proceed with Import
              </button>
              <button
                onClick={resetDialog}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted text-foreground"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* File Selection Screen */}
        {step === "file-select" && !importResult && (
          <>
            {/* Info Box */}
            <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> Importing data will bypass the onboarding process.
                Make sure you have a JSON file exported from this app.
              </p>
            </div>

            {/* File Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Export File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedFile) {
                    handleImport();
                  }
                }}
                disabled={isImporting || !selectedFile}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={resetDialog}
                disabled={isImporting}
                className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Import Result Screen */}
        {importResult && (
          <>
            {/* Import Result */}
            <div className="mb-4">
              {importResult.success ? (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-100 mb-2">
                    ✅ Import Successful!
                  </h4>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li>Symptoms: {importResult.imported.symptoms}</li>
                    <li>Medications: {importResult.imported.medications}</li>
                    <li>Triggers: {importResult.imported.triggers}</li>
                    <li>Daily Entries: {importResult.imported.dailyEntries}</li>
                  </ul>
                  <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                    Redirecting to dashboard...
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-100 mb-2">
                    ❌ Import Failed
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                    {importResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setImportResult(null);
                      setSelectedFile(null);
                    }}
                    className="mt-3 text-sm font-medium text-red-700 dark:text-red-300 hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
