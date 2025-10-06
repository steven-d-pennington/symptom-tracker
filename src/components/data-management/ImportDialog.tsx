"use client";

import { useState, useRef } from "react";
import { importService, ImportOptions, ImportResult } from "@/lib/services";
import { userRepository } from "@/lib/repositories";

export function ImportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<"replace" | "merge" | "skip">("merge");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert("Please select a file to import");
      return;
    }

    setIsImporting(true);

    try {
      const user = await userRepository.getOrCreateCurrentUser();

      const options: ImportOptions = {
        mergeStrategy,
        validateData: true,
      };

      const result = await importService.importFromJSON(
        selectedFile,
        user.id,
        options
      );

      setImportResult(result);

      if (result.success) {
        setTimeout(() => {
          setIsOpen(false);
          setSelectedFile(null);
          setImportResult(null);
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
        },
        errors: [error instanceof Error ? error.message : "Unknown error"],
        skipped: 0,
      });
    } finally {
      setIsImporting(false);
    }
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
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">Import Your Data</h2>

        {!importResult ? (
          <>
            {/* File Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Select File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Merge Strategy */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Import Strategy
              </label>
              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="replace"
                    checked={mergeStrategy === "replace"}
                    onChange={(e) => setMergeStrategy(e.target.value as "replace")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium">Replace</div>
                    <div className="text-xs text-gray-600">
                      Update existing items with imported data
                    </div>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="merge"
                    checked={mergeStrategy === "merge"}
                    onChange={(e) => setMergeStrategy(e.target.value as "merge")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium">Merge</div>
                    <div className="text-xs text-gray-600">
                      Keep both existing and imported data
                    </div>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="skip"
                    checked={mergeStrategy === "skip"}
                    onChange={(e) => setMergeStrategy(e.target.value as "skip")}
                    className="mr-2 mt-1"
                  />
                  <div>
                    <div className="font-medium">Skip</div>
                    <div className="text-xs text-gray-600">
                      Only import new items, skip duplicates
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                disabled={isImporting || !selectedFile}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isImporting ? "Importing..." : "Import"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isImporting}
                className="flex-1 rounded-md border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Import Result */}
            <div className="mb-4">
              {importResult.success ? (
                <div className="rounded bg-green-50 p-4">
                  <h3 className="mb-2 font-medium text-green-800">
                    Import Successful!
                  </h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>Symptoms: {importResult.imported.symptoms}</li>
                    <li>Medications: {importResult.imported.medications}</li>
                    <li>Triggers: {importResult.imported.triggers}</li>
                    <li>Daily Entries: {importResult.imported.dailyEntries}</li>
                    {importResult.skipped > 0 && (
                      <li>Skipped: {importResult.skipped}</li>
                    )}
                  </ul>
                  <p className="mt-2 text-xs text-green-600">
                    Refreshing in 3 seconds...
                  </p>
                </div>
              ) : (
                <div className="rounded bg-red-50 p-4">
                  <h3 className="mb-2 font-medium text-red-800">
                    Import Failed
                  </h3>
                  <ul className="space-y-1 text-sm text-red-700">
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
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
