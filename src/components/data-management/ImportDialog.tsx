"use client";

import { useState, useRef } from "react";
import { importService, ImportOptions, ImportResult, ImportProgress } from "@/lib/services";
import { userRepository } from "@/lib/repositories";

type ImportStep = "file-select" | "existing-data-check" | "importing";

export function ImportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>("file-select");
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<"replace" | "merge" | "skip">("merge");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [existingDataCounts, setExistingDataCounts] = useState<{
    symptoms: number;
    medications: number;
    triggers: number;
    dailyEntries: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImportProgress(null);

    try {
      const user = await userRepository.getOrCreateCurrentUser();

      const options: ImportOptions = {
        mergeStrategy,
        validateData: true,
        updateUserProfile: true, // Always update user profile from import
        allowDuplicates: false,
        onProgress: (progress) => {
          setImportProgress(progress);
        },
      };

      const result = await importService.importFromJSON(
        selectedFile,
        user.id,
        options
      );

      setImportResult(result);
      setImportProgress(null);

      if (result.success) {
        setTimeout(() => {
          setIsOpen(false);
          setSelectedFile(null);
          setImportResult(null);
          setStep("file-select");
          // Trigger a page reload to show the new data
          window.location.reload();
        }, 3000);
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
        },
        errors: [error instanceof Error ? error.message : "Unknown error"],
        skipped: {
          items: 0,
          photos: 0,
        },
      });
      setImportProgress(null);
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setIsOpen(false);
    setStep("file-select");
    setSelectedFile(null);
    setImportResult(null);
    setExistingDataCounts(null);
    setMergeStrategy("merge");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-blue-600 bg-white px-4 py-2 text-blue-600 hover:bg-blue-50"
      >
        Import Data
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-bold text-foreground">Import Your Data</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Import data exported from another browser profile or restore from a backup.
        </p>

        {/* Existing Data Warning Screen */}
        {step === "existing-data-check" && existingDataCounts && !importResult && (
          <>
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Existing Data Detected
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                You already have data in this profile:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 mb-3">
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
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                How would you like to proceed?
              </p>
            </div>

            {/* Merge Strategy Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Choose Import Strategy
              </label>
              <div className="space-y-2">
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-3 rounded border-2 border-transparent hover:border-primary/30 transition-colors">
                  <input
                    type="radio"
                    value="merge"
                    checked={mergeStrategy === "merge"}
                    onChange={(e) => setMergeStrategy(e.target.value as "merge")}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground">✅ Merge (Recommended)</div>
                    <div className="text-xs text-muted-foreground">
                      Keep both existing and imported data. Best for syncing between devices.
                      Your existing data will remain untouched.
                    </div>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-3 rounded border-2 border-transparent hover:border-primary/30 transition-colors">
                  <input
                    type="radio"
                    value="replace"
                    checked={mergeStrategy === "replace"}
                    onChange={(e) => setMergeStrategy(e.target.value as "replace")}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground">🔄 Replace Duplicates</div>
                    <div className="text-xs text-muted-foreground">
                      Update existing items with imported data. Good for restoring backups.
                      Duplicates will be overwritten with imported versions.
                    </div>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-3 rounded border-2 border-transparent hover:border-primary/30 transition-colors">
                  <input
                    type="radio"
                    value="skip"
                    checked={mergeStrategy === "skip"}
                    onChange={(e) => setMergeStrategy(e.target.value as "skip")}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground">⏭️ Skip Duplicates</div>
                    <div className="text-xs text-muted-foreground">
                      Only import new items, skip duplicates. Preserves all existing data.
                      Only new items from import will be added.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleProceedToImport}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium"
              >
                Proceed with Import
              </button>
              <button
                onClick={resetDialog}
                className="flex-1 rounded-md border border-border px-4 py-2 hover:bg-muted text-foreground"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* File Selection Screen */}
        {step === "file-select" && !importResult && (
          <>
            {/* Profile Transfer Info Box */}
            <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                ⚠️ Important: Browser Profile Transfer
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                If you're transferring data from another browser/profile:
                <br />
                • Make sure you exported with JSON format
                <br />
                • All your data will be imported to this profile
                <br />
                • Use "Merge" to keep any existing data
                <br />
                • Use "Replace" to overwrite duplicates
              </p>
            </div>

            {/* File Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Select File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full text-foreground"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Merge Strategy */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Import Strategy
              </label>
              <div className="space-y-2">
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <input
                    type="radio"
                    value="replace"
                    checked={mergeStrategy === "replace"}
                    onChange={(e) => setMergeStrategy(e.target.value as "replace")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground">Replace duplicates</div>
                    <div className="text-xs text-muted-foreground">
                      Update existing items with imported data. Recommended for restoring backups.
                    </div>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <input
                    type="radio"
                    value="merge"
                    checked={mergeStrategy === "merge"}
                    onChange={(e) => setMergeStrategy(e.target.value as "merge")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground">Merge (Recommended)</div>
                    <div className="text-xs text-muted-foreground">
                      Keep both existing and imported data. Best for profile transfers.
                    </div>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <input
                    type="radio"
                    value="skip"
                    checked={mergeStrategy === "skip"}
                    onChange={(e) => setMergeStrategy(e.target.value as "skip")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground">Skip duplicates</div>
                    <div className="text-xs text-muted-foreground">
                      Only import new items, skip duplicates. Preserves all existing data.
                    </div>
                  </div>
                </label>
              </div>
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
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {isImporting ? "Importing..." : "Import"}
              </button>
              <button
                onClick={resetDialog}
                disabled={isImporting}
                className="flex-1 rounded-md border border-border px-4 py-2 hover:bg-muted disabled:opacity-50 text-foreground"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Import Progress Screen */}
        {isImporting && importProgress && !importResult && (
          <div className="mb-4">
            <div className="rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
              <h3 className="mb-2 font-medium text-blue-800 dark:text-blue-100">
                {importProgress.message}
              </h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(importProgress.current / importProgress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {importProgress.current} of {importProgress.total} (
                {Math.round((importProgress.current / importProgress.total) * 100)}
                %)
              </p>
            </div>
          </div>
        )}

        {/* Import Result Screen */}
        {importResult && (
          <>
            {/* Import Result */}
            <div className="mb-4">
              {importResult.success ? (
                <div className="rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
                  <h3 className="mb-2 font-medium text-green-800 dark:text-green-100">
                    ✅ Import Successful!
                  </h3>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li>Symptoms: {importResult.imported.symptoms}</li>
                    <li>Medications: {importResult.imported.medications}</li>
                    <li>Triggers: {importResult.imported.triggers}</li>
                    <li>Daily Entries: {importResult.imported.dailyEntries}</li>
                    <li className="font-medium">Photos: {importResult.imported.photos}</li>
                    {importResult.skipped.photos > 0 && (
                      <li className="text-gray-600 dark:text-gray-400">
                        Duplicates skipped: {importResult.skipped.photos}
                      </li>
                    )}
                  </ul>
                  {importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-sm text-orange-900 dark:text-orange-100 mb-1">
                        ⚠️ Errors:
                      </h4>
                      <ul className="text-xs space-y-1 text-orange-800 dark:text-orange-300">
                        {importResult.errors.slice(0, 5).map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li className="text-gray-600 dark:text-gray-400">
                            ... and {importResult.errors.length - 5} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    Refreshing in 3 seconds...
                  </p>
                </div>
              ) : (
                <div className="rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                  <h3 className="mb-2 font-medium text-red-800 dark:text-red-100">
                    ❌ Import Failed
                  </h3>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                    {importResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {!importResult.success && (
              <button
                onClick={() => setImportResult(null)}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium"
              >
                Try Again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
