"use client";

import { useState, useEffect } from "react";
import { backupService, BackupMetadata, BackupSettings } from "@/lib/services";
import { userRepository } from "@/lib/repositories";

export function BackupSettingsComponent() {
  const [settings, setSettings] = useState<BackupSettings>(
    backupService.getBackupSettings()
  );
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    const backupList = backupService.getBackupList();
    setBackups(backupList);
  };

  const handleSettingChange = (
    key: keyof BackupSettings,
    value: boolean | string | number
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    backupService.updateBackupSettings({ [key]: value });
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const user = await userRepository.getCurrentUser();
      if (!user) {
        alert("No user found. Please complete onboarding first.");
        return;
      }

      await backupService.createBackup(user.id);
      loadBackups();
      alert("Backup created successfully!");
    } catch (error) {
      console.error("Backup creation failed:", error);
      alert("Backup creation failed. Please try again.");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDownloadBackup = async (backupId: string) => {
    try {
      await backupService.downloadBackup(backupId);
    } catch (error) {
      console.error("Backup download failed:", error);
      alert("Backup download failed. Please try again.");
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    if (confirm("Are you sure you want to delete this backup?")) {
      backupService.deleteBackup(backupId);
      loadBackups();
    }
  };

  const handleClearAllBackups = () => {
    if (
      confirm(
        "Are you sure you want to delete ALL backups? This cannot be undone."
      )
    ) {
      backupService.clearAllBackups();
      loadBackups();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Backup Settings */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-medium">Backup Settings</h3>

        <div className="space-y-4">
          {/* Auto Backup Toggle */}
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable Auto Backup</span>
            <input
              type="checkbox"
              checked={settings.autoBackupEnabled}
              onChange={(e) =>
                handleSettingChange("autoBackupEnabled", e.target.checked)
              }
              className="h-5 w-5"
            />
          </label>

          {/* Backup Frequency */}
          {settings.autoBackupEnabled && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) =>
                  handleSettingChange("backupFrequency", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          {/* Max Backups */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Maximum Backups to Keep
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.maxBackups}
              onChange={(e) =>
                handleSettingChange("maxBackups", parseInt(e.target.value))
              }
              className="w-full rounded border p-2"
            />
          </div>

          {/* Include Photos */}
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Include Photos</span>
            <input
              type="checkbox"
              checked={settings.includePhotos}
              onChange={(e) =>
                handleSettingChange("includePhotos", e.target.checked)
              }
              className="h-5 w-5"
            />
          </label>
        </div>
      </div>

      {/* Create Manual Backup */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-medium">Manual Backup</h3>
        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreatingBackup ? "Creating Backup..." : "Create Backup Now"}
        </button>
      </div>

      {/* Backup List */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Backups ({backups.length})
          </h3>
          {backups.length > 0 && (
            <button
              onClick={handleClearAllBackups}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>

        {backups.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No backups yet. Create your first backup above.
          </p>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <div className="text-sm font-medium">
                    {new Date(backup.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatBytes(backup.size)} · {backup.recordCount} records
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadBackup(backup.id)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {backups.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total storage: {formatBytes(backupService.getTotalBackupSize())}
          </div>
        )}
      </div>
    </div>
  );
}
