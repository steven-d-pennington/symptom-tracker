"use client";

import { useState, useEffect } from "react";
import { CloudSyncUploadModal } from "./CloudSyncUploadModal";
import { CloudSyncDownloadModal } from "./CloudSyncDownloadModal";
import { CloudSyncStatus } from "./CloudSyncStatus";
import { CloudSyncHelpModal } from "./CloudSyncHelpModal";
import { Button } from "@/components/ui/button";
import { Info, UploadCloud, DownloadCloud, HelpCircle } from "lucide-react";
import { userRepository } from "@/lib/repositories/userRepository";

export interface CloudSyncSectionProps {
  className?: string;
}

/**
 * Main Cloud Sync section component for Settings page
 *
 * Features:
 * - Enable/disable toggle with persistent state in UserPreferences
 * - Upload and download buttons (shown when enabled)
 * - Sync status display
 * - Help link
 * - All modals (upload, download, help)
 */
export function CloudSyncSection({ className }: CloudSyncSectionProps) {
  const [enabled, setEnabled] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [statusKey, setStatusKey] = useState(0); // Force status refresh
  const [userId, setUserId] = useState<string | null>(null);

  // Load enabled state from UserPreferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await userRepository.getCurrentUser();
        if (user) {
          setUserId(user.id);
          setEnabled(user.preferences.cloudSyncEnabled ?? false);

          // Migrate from localStorage if needed (one-time migration)
          if (
            user.preferences.cloudSyncEnabled === undefined &&
            typeof window !== "undefined"
          ) {
            const legacyValue = localStorage.getItem("cloudSyncEnabled");
            if (legacyValue !== null) {
              const migrated = legacyValue === "true";
              await userRepository.updatePreferences(user.id, {
                cloudSyncEnabled: migrated,
              });
              setEnabled(migrated);
              localStorage.removeItem("cloudSyncEnabled"); // Clean up
              console.log(`[CloudSync] Migrated cloudSyncEnabled to UserPreferences: ${migrated}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load cloud sync preferences:", error);
      }
    };
    loadPreferences();
  }, []);

  // Save enabled state to UserPreferences
  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    try {
      if (userId) {
        await userRepository.updatePreferences(userId, {
          cloudSyncEnabled: checked,
        });
      }
    } catch (error) {
      console.error("Failed to save cloud sync preferences:", error);
      // Revert on error
      setEnabled(!checked);
    }
  };

  // Refresh status after upload/download
  const handleUploadSuccess = () => {
    setStatusKey((prev) => prev + 1);
  };

  const handleDownloadSuccess = () => {
    setStatusKey((prev) => prev + 1);
  };

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold">Cloud Sync</h3>
        <button
          onClick={() => setShowHelpModal(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cloud Sync information"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4">
        Back up your data to the cloud with client-side encryption. Your passphrase never
        leaves your device, and only you can decrypt your backups.
      </p>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card mb-4">
        <div className="flex-1">
          <label htmlFor="cloud-sync-toggle" className="font-medium cursor-pointer">
            Enable Cloud Sync
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            Turn on to upload and download encrypted backups
          </p>
        </div>
        <button
          id="cloud-sync-toggle"
          role="switch"
          aria-checked={enabled}
          onClick={() => handleToggle(!enabled)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            ${enabled ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${enabled ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {/* Upload/Download Buttons (shown when enabled) */}
      {enabled && (
        <div className="space-y-4">
          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="default"
              onClick={() => setShowUploadModal(true)}
              className="w-full"
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload to Cloud
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDownloadModal(true)}
              className="w-full"
            >
              <DownloadCloud className="h-4 w-4 mr-2" />
              Download from Cloud
            </Button>
          </div>

          {/* Sync Status */}
          <CloudSyncStatus key={statusKey} onRefresh={() => setShowUploadModal(true)} />

          {/* Help Link */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <HelpCircle className="h-4 w-4" />
            How does Cloud Sync work?
          </button>
        </div>
      )}

      {/* Modals */}
      <CloudSyncUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
      <CloudSyncDownloadModal
        open={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onSuccess={handleDownloadSuccess}
      />
      <CloudSyncHelpModal
        open={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
