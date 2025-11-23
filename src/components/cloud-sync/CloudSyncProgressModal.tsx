"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProgressUpdate } from "@/lib/services/cloudSyncService";

export interface CloudSyncProgressModalProps {
  open: boolean;
  progress: ProgressUpdate;
  operation: "upload" | "download";
}

/**
 * Progress modal for cloud sync upload/download operations
 *
 * Displays:
 * - Animated progress bar (0-100%)
 * - Current stage message (Exporting/Encrypting/Uploading...)
 * - Percentage indicator
 *
 * Modal blocks user interaction until operation completes
 * Provides screen reader announcements via aria-live
 */
export function CloudSyncProgressModal({
  open,
  progress,
  operation,
}: CloudSyncProgressModalProps) {
  const title = operation === "upload" ? "Uploading Backup" : "Restoring Backup";

  // Stage-specific messages
  const stageMessages = {
    export: "Exporting data from IndexedDB...",
    encrypt: "Encrypting backup with your passphrase...",
    upload: "Uploading to cloud storage...",
    download: "Downloading backup from cloud...",
    decrypt: "Decrypting backup with your passphrase...",
    restore: "Restoring data to IndexedDB...",
  };

  const message = progress.message || stageMessages[progress.stage] || "Processing...";

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()} // Block outside clicks
        onInteractOutside={(e) => e.preventDefault()} // Block all interactions
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress.percent}%` }}
                role="progressbar"
                aria-valuenow={progress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${operation} progress`}
              />
            </div>

            {/* Percentage */}
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-primary">{progress.percent}%</span>
              <span className="text-muted-foreground">{progress.stage}</span>
            </div>
          </div>

          {/* Stage Message */}
          <p
            className="text-sm text-center text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {message}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
