"use client";

import { useState } from "react";
import { exportService, ExportOptions } from "@/lib/services";
import { userRepository } from "@/lib/repositories";

export function ExportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [includeOptions, setIncludeOptions] = useState({
    symptoms: true,
    medications: true,
    triggers: true,
    dailyEntries: true,
    userData: true,
  });
  const [dateRange, setDateRange] = useState({
    enabled: false,
    start: "",
    end: "",
  });

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const user = await userRepository.getCurrentUser();
      if (!user) {
        alert("No user found. Please complete onboarding first.");
        return;
      }

      const options: ExportOptions = {
        format: exportFormat,
        includeSymptoms: includeOptions.symptoms,
        includeMedications: includeOptions.medications,
        includeTriggers: includeOptions.triggers,
        includeDailyEntries: includeOptions.dailyEntries,
        includeUserData: includeOptions.userData,
      };

      if (dateRange.enabled && dateRange.start && dateRange.end) {
        options.dateRange = {
          start: dateRange.start,
          end: dateRange.end,
        };
      }

      await exportService.downloadExport(user.id, options);
      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Export Data
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-2 text-xl font-bold text-foreground">Export Your Data</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Export your symptom tracking data to transfer between browsers, create backups, or analyze externally.
        </p>

        {/* Profile Transfer Info Box */}
        <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
            💡 Transfer to Another Browser or Profile
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            1. Export your data (JSON format recommended)
            <br />
            2. Open the app in your other browser/profile
            <br />
            3. Go to Settings → Import Data
            <br />
            4. Select and import the file
          </p>
        </div>

        {/* Format Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Format</label>
          <div className="flex gap-4">
            <label className="flex items-center text-foreground">
              <input
                type="radio"
                value="json"
                checked={exportFormat === "json"}
                onChange={(e) => setExportFormat(e.target.value as "json")}
                className="mr-2"
              />
              JSON (Recommended for import)
            </label>
            <label className="flex items-center text-foreground">
              <input
                type="radio"
                value="csv"
                checked={exportFormat === "csv"}
                onChange={(e) => setExportFormat(e.target.value as "csv")}
                className="mr-2"
              />
              CSV (For spreadsheets)
            </label>
          </div>
        </div>

        {/* Include Options */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Include in Export
          </label>
          <div className="space-y-2">
            {Object.entries(includeOptions).map(([key, value]) => (
              <label key={key} className="flex items-center text-foreground">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setIncludeOptions({
                      ...includeOptions,
                      [key]: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            ✓ For complete profile transfer, keep all options checked
          </p>
        </div>

        {/* Date Range */}
        <div className="mb-4">
          <label className="flex items-center text-foreground">
            <input
              type="checkbox"
              checked={dateRange.enabled}
              onChange={(e) =>
                setDateRange({ ...dateRange, enabled: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm font-medium">Limit to date range</span>
          </label>
          {dateRange.enabled && (
            <div className="mt-2 space-y-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full rounded border p-2 bg-background text-foreground"
                placeholder="Start date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full rounded border p-2 bg-background text-foreground"
                placeholder="End date"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
            className="flex-1 rounded-md border border-border px-4 py-2 hover:bg-muted disabled:opacity-50 text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
