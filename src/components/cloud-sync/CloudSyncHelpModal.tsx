"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Key, Smartphone, AlertTriangle } from "lucide-react";

export interface CloudSyncHelpModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Help modal with cloud sync documentation
 *
 * Sections:
 * - Encryption Overview (AES-256-GCM, zero-knowledge)
 * - Passphrase Security (best practices)
 * - Multi-device Workflow (how to sync across devices)
 * - Troubleshooting (common issues and solutions)
 */
export function CloudSyncHelpModal({ open, onClose }: CloudSyncHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cloud Sync Help</DialogTitle>
          <DialogDescription>
            Learn how Cloud Sync works and how to use it safely
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="encryption" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
            <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="troubleshooting">Help</TabsTrigger>
          </TabsList>

          {/* Encryption Overview */}
          <TabsContent value="encryption" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Zero-Knowledge Encryption</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data is encrypted <strong>client-side</strong> using AES-256-GCM before
                  upload. Your passphrase never leaves your device, and the server stores only
                  encrypted blobs that cannot be decrypted without your passphrase.
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h4 className="font-medium text-sm">Technical Details</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  <strong>Algorithm:</strong> AES-256-GCM (authenticated encryption)
                </li>
                <li>
                  <strong>Key derivation:</strong> PBKDF2 with 100,000 iterations (SHA-256)
                </li>
                <li>
                  <strong>Salt:</strong> Random 16-byte salt per backup (prevents rainbow table
                  attacks)
                </li>
                <li>
                  <strong>Authentication:</strong> GCM mode includes authentication tag to detect
                  tampering
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>What this means:</strong> Even if someone gains access to the server, they
                cannot read your health data without your passphrase. The encryption happens in
                your browser before anything is sent to the cloud.
              </p>
            </div>
          </TabsContent>

          {/* Passphrase Security */}
          <TabsContent value="passphrase" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Key className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Passphrase Best Practices</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your passphrase is the key to your encrypted backup. Choose it wisely and store
                  it securely.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border bg-card p-3">
                <h4 className="font-medium text-sm mb-2">✅ Do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use at least 16-20 characters for maximum security</li>
                  <li>Mix uppercase, lowercase, numbers, and symbols</li>
                  <li>Use a unique passphrase (don't reuse passwords)</li>
                  <li>Write it down and store in a secure location (safe, password manager)</li>
                  <li>Consider using a passphrase (multiple words) instead of a password</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <h4 className="font-medium text-sm mb-2">❌ Don't:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use common words or phrases</li>
                  <li>Use personal information (birthdate, pet names, etc.)</li>
                  <li>Share your passphrase with anyone</li>
                  <li>Store it in plain text on your device</li>
                  <li>Forget to write it down somewhere safe</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-900 dark:text-red-100">
                  <strong>Critical:</strong> We cannot recover your passphrase if you forget it.
                  There is no "reset password" option for encrypted backups. If you lose your
                  passphrase, your backup is permanently inaccessible.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Multi-device Workflow */}
          <TabsContent value="workflow" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Syncing Across Devices</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use the same passphrase on all your devices to keep your health data in sync.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-medium text-sm mb-3">Step-by-Step:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li className="pl-2">
                    <strong>Device A (Primary):</strong>
                    <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                      <li>Enable Cloud Sync in Settings</li>
                      <li>Click "Upload to Cloud"</li>
                      <li>Create a secure passphrase (write it down!)</li>
                      <li>Wait for upload to complete</li>
                    </ul>
                  </li>
                  <li className="pl-2">
                    <strong>Device B (Secondary):</strong>
                    <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                      <li>Enable Cloud Sync in Settings</li>
                      <li>Click "Download from Cloud"</li>
                      <li>Enter the SAME passphrase from Device A</li>
                      <li>Confirm you want to overwrite local data</li>
                      <li>Wait for restore to complete</li>
                    </ul>
                  </li>
                  <li className="pl-2">
                    <strong>Future Updates:</strong>
                    <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                      <li>Upload from whichever device has the latest data</li>
                      <li>Download on other devices to sync</li>
                      <li>Always use the same passphrase</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Tip:</strong> Upload backups regularly (weekly recommended) to ensure your
                data is safe. The sync status indicator will remind you when it's time to backup.
              </p>
            </div>
          </TabsContent>

          {/* Troubleshooting */}
          <TabsContent value="troubleshooting" className="space-y-4">
            <h3 className="font-semibold">Common Issues</h3>

            <div className="space-y-3">
              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-medium text-sm mb-2">
                  ❌ "Wrong passphrase" error
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  The passphrase you entered doesn't match the one used to create the backup.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
                  <li>Double-check capitalization (passphrases are case-sensitive)</li>
                  <li>Check for typos or extra spaces</li>
                  <li>Make sure you're using the correct passphrase for this backup</li>
                  <li>Try typing slowly and carefully</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-medium text-sm mb-2">
                  ❌ "Backup not found" error
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  No backup exists with this passphrase, or you're using a different passphrase.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
                  <li>Make sure you've created a backup on another device first</li>
                  <li>Verify you're using the exact same passphrase</li>
                  <li>Check if upload succeeded on the other device</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-medium text-sm mb-2">
                  ❌ Upload/download failed
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Network or server issues prevented the operation.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
                  <li>Check your internet connection</li>
                  <li>Try again in a few minutes (server may be temporarily down)</li>
                  <li>Make sure you're not exceeding rate limits (10 uploads/hour)</li>
                  <li>Check if your backup is too large (&gt;1GB not supported)</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-medium text-sm mb-2">
                  ❌ Backup seems incomplete
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  After restore, some data appears to be missing.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
                  <li>The backup only includes data that existed when it was created</li>
                  <li>Check the backup timestamp in sync status</li>
                  <li>Create a new backup from the device with complete data</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Still having issues?</strong> Contact support with details about the error
                message and when it occurred. Do NOT share your passphrase with anyone, including
                support staff.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
