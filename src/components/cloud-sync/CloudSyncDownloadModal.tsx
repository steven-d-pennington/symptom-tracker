"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { CloudSyncProgressModal } from "./CloudSyncProgressModal";
import {
  restoreBackup,
  type ProgressUpdate,
} from "@/lib/services/cloudSyncService";
import { toast } from "@/components/common/Toast";

export interface CloudSyncDownloadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Download modal for restoring encrypted cloud backups
 *
 * Features:
 * - Passphrase input with show/hide toggle
 * - Warning about data replacement
 * - Confirmation checkbox
 * - Progress modal during download
 * - Success toast with restored record count
 */
export function CloudSyncDownloadModal({
  open,
  onClose,
  onSuccess,
}: CloudSyncDownloadModalProps) {
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate>({
    stage: "download",
    percent: 0,
    message: "",
  });

  const handleRestore = async () => {
    setDownloading(true);

    try {
      await restoreBackup(passphrase, (update) => {
        setProgress(update);
      });

      // Success toast
      toast.success("Data restored successfully!", {
        description: "Your backup has been restored",
        duration: 5000,
      });

      // Reset form
      setPassphrase("");
      setConfirmed(false);
      setDownloading(false);

      // Notify parent
      onSuccess?.();
      onClose();

      // Reload page to reflect restored data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      // Error toast
      const message = error instanceof Error ? error.message : "Restore failed";
      toast.error("Restore failed", {
        description: message,
        duration: 10000,
      });

      setDownloading(false);
    }
  };

  const handleClose = () => {
    if (!downloading) {
      setPassphrase("");
      setConfirmed(false);
      onClose();
    }
  };

  const isValid = passphrase.length >= 12 && confirmed;

  return (
    <>
      <Dialog open={open && !downloading} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              Restore your health data from an encrypted cloud backup
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Warning Box */}
            <div className="rounded-lg border border-red-400 bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    WARNING: This will replace ALL local data
                  </p>
                  <p className="text-red-800 dark:text-red-200">
                    Your current data will be backed up automatically before restore as a safety measure.
                  </p>
                  <p className="text-red-800 dark:text-red-200">
                    Make sure you're entering the correct passphrase. Wrong passphrase = restore fails.
                  </p>
                </div>
              </div>
            </div>

            {/* Passphrase Input */}
            <div className="space-y-2">
              <label htmlFor="restore-passphrase" className="text-sm font-medium">
                Enter Passphrase
              </label>
              <div className="relative">
                <Input
                  id="restore-passphrase"
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter your backup passphrase"
                  className="pr-10"
                  aria-describedby="restore-hint"
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
              <p id="restore-hint" className="text-xs text-muted-foreground">
                Use the same passphrase you used to create the backup
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
              <input
                type="checkbox"
                id="restore-confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-describedby="restore-confirm-label"
              />
              <label
                htmlFor="restore-confirm"
                id="restore-confirm-label"
                className="text-sm cursor-pointer"
              >
                I understand this will overwrite my local data
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={downloading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestore}
              disabled={!isValid || downloading}
            >
              Restore Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Modal */}
      {downloading && (
        <CloudSyncProgressModal
          open={downloading}
          progress={progress}
          operation="download"
        />
      )}
    </>
  );
}
