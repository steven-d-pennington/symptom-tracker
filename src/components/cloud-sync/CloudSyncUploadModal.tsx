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
import { PassphraseStrengthIndicator } from "./PassphraseStrengthIndicator";
import { CloudSyncProgressModal } from "./CloudSyncProgressModal";
import {
  createBackup,
  validatePassphrase,
  getSyncMetadata,
  checkCloudBackupAge,
  type ProgressUpdate,
} from "@/lib/services/cloudSyncService";
import { toast } from "@/components/common/Toast";

export interface CloudSyncUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Upload modal for creating encrypted cloud backups
 *
 * Features:
 * - Passphrase input with show/hide toggle
 * - Passphrase confirmation field
 * - Real-time strength indicator
 * - Security warning about passphrase recovery
 * - Safety check for overwriting newer cloud data
 * - Character count indicator
 * - Validation (min 12 chars, passphrases match)
 * - Progress modal during upload
 * - Success toast with metadata
 */
export function CloudSyncUploadModal({
  open,
  onClose,
  onSuccess,
}: CloudSyncUploadModalProps) {
  const [passphrase, setPassphrase] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [safetyWarningMessage, setSafetyWarningMessage] = useState("");
  const [progress, setProgress] = useState<ProgressUpdate>({
    stage: "export",
    percent: 0,
    message: "",
  });

  // Validate passphrase
  const validation = validatePassphrase(passphrase, confirmation);
  const isValid = validation.valid;

  const handleInitiateUpload = async () => {
    setChecking(true);

    try {
      // Check if cloud backup is newer
      const ageCheck = await checkCloudBackupAge(passphrase);

      if (ageCheck.cloudIsNewer && ageCheck.warningMessage) {
        // Show safety warning
        setSafetyWarningMessage(ageCheck.warningMessage);
        setShowSafetyWarning(true);
        setChecking(false);
      } else {
        // Proceed with upload
        setChecking(false);
        await handleUpload();
      }
    } catch (error) {
      console.error("[CloudSync] Safety check failed:", error);
      // Proceed anyway on error (fail open)
      setChecking(false);
      await handleUpload();
    }
  };

  const handleUpload = async () => {
    setShowSafetyWarning(false);
    setUploading(true);

    try {
      await createBackup(passphrase, (update) => {
        setProgress(update);
      });

      // Get metadata for success toast
      const metadata = await getSyncMetadata();
      if (metadata) {
        const sizeMB = (metadata.blobSizeBytes / (1024 * 1024)).toFixed(2);
        const timestamp = new Date(metadata.lastSyncTimestamp).toLocaleTimeString();
        toast.success(`Backup uploaded successfully!`, {
          description: `Synced ${sizeMB} MB at ${timestamp}`,
          duration: 5000,
        });
      } else {
        toast.success("Backup uploaded successfully!");
      }

      // Reset form
      setPassphrase("");
      setConfirmation("");
      setUploading(false);

      // Notify parent
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error toast
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error("Upload failed", {
        description: message,
        duration: 10000,
      });

      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setPassphrase("");
      setConfirmation("");
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open && !uploading} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
            <DialogDescription>
              Create an encrypted backup of your health data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Security Warning */}
            <div className="rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    IMPORTANT: Write this passphrase down!
                  </p>
                  <p className="text-yellow-800 dark:text-yellow-200">
                    If you forget it, your cloud backup cannot be recovered. We cannot reset it for you.
                  </p>
                </div>
              </div>
            </div>

            {/* Passphrase Input */}
            <div className="space-y-2">
              <label htmlFor="passphrase" className="text-sm font-medium">
                Enter Passphrase
              </label>
              <div className="relative">
                <Input
                  id="passphrase"
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Minimum 12 characters"
                  className="pr-10"
                  aria-describedby="passphrase-hint passphrase-error"
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
              <p id="passphrase-hint" className="text-xs text-muted-foreground">
                {passphrase.length} / 12 minimum characters
              </p>
            </div>

            {/* Strength Indicator */}
            {passphrase.length > 0 && (
              <PassphraseStrengthIndicator passphrase={passphrase} />
            )}

            {/* Confirmation Input */}
            <div className="space-y-2">
              <label htmlFor="confirmation" className="text-sm font-medium">
                Confirm Passphrase
              </label>
              <div className="relative">
                <Input
                  id="confirmation"
                  type={showConfirmation ? "text" : "password"}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="Re-enter passphrase"
                  className="pr-10"
                  aria-describedby="confirmation-error"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation(!showConfirmation)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmation ? "Hide confirmation" : "Show confirmation"}
                >
                  {showConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Validation Errors */}
            {validation.error && (
              <p
                id="passphrase-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {validation.error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={uploading || checking}>
              Cancel
            </Button>
            <Button onClick={handleInitiateUpload} disabled={!isValid || uploading || checking}>
              {checking ? "Checking..." : "Create Backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Safety Warning Dialog */}
      {showSafetyWarning && (
        <Dialog open={showSafetyWarning} onOpenChange={() => setShowSafetyWarning(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>⚠️ Overwrite Newer Backup?</DialogTitle>
              <DialogDescription>
                Your cloud backup is newer than your local data
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Warning Message */}
              <div className="rounded-lg border border-red-400 bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {safetyWarningMessage}
                </p>
              </div>

              {/* Explanation */}
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  <strong>If you continue:</strong> Your newer cloud data will be replaced with
                  older local data.
                </p>
                <p className="text-muted-foreground">
                  <strong>Recommended:</strong> Cancel and download the cloud backup first to get
                  the latest data.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSafetyWarning(false);
                  setSafetyWarningMessage("");
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleUpload}>
                Yes, Overwrite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Progress Modal */}
      {uploading && (
        <CloudSyncProgressModal
          open={uploading}
          progress={progress}
          operation="upload"
        />
      )}
    </>
  );
}
