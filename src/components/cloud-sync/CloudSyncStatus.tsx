"use client";

import { useState, useEffect } from "react";
import { getSyncMetadata, type SyncMetadata } from "@/lib/services/cloudSyncService";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CloudSyncStatusProps {
  onRefresh?: () => void;
}

/**
 * Sync status display component
 *
 * Shows:
 * - Last backup timestamp (relative time)
 * - Backup size in MB
 * - Last restore timestamp (if applicable)
 * - Health indicator (green/yellow/red)
 * - Error message with retry button (if failed)
 */
export function CloudSyncStatus({ onRefresh }: CloudSyncStatusProps) {
  const [metadata, setMetadata] = useState<SyncMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetadata = async () => {
    setLoading(true);
    try {
      const data = await getSyncMetadata();
      setMetadata(data);
    } catch (error) {
      console.error("Failed to load sync metadata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading sync status...
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          No sync data yet. Create your first backup to get started.
        </p>
      </div>
    );
  }

  // Calculate sync health
  const daysSinceSync = metadata.lastSyncTimestamp
    ? (Date.now() - metadata.lastSyncTimestamp) / (1000 * 60 * 60 * 24)
    : Infinity;

  let healthStatus: "synced" | "warning" | "error" = "error";
  let healthLabel: string;
  let HealthIcon: typeof CheckCircle;

  if (metadata.lastSyncSuccess && daysSinceSync < 7) {
    healthStatus = "synced";
    healthLabel = "Synced";
    HealthIcon = CheckCircle;
  } else if (metadata.lastSyncSuccess && daysSinceSync < 30) {
    healthStatus = "warning";
    healthLabel = "Sync recommended";
    HealthIcon = AlertCircle;
  } else {
    healthStatus = "error";
    healthLabel = metadata.lastSyncSuccess ? "Not synced recently" : "Last sync failed";
    HealthIcon = XCircle;
  }

  const healthColors = {
    synced: "text-green-600 dark:text-green-500",
    warning: "text-yellow-600 dark:text-yellow-500",
    error: "text-red-600 dark:text-red-500",
  };

  const healthBgColors = {
    synced: "bg-green-100 dark:bg-green-900/30",
    warning: "bg-yellow-100 dark:bg-yellow-900/30",
    error: "bg-red-100 dark:bg-red-900/30",
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Health Indicator */}
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-full ${healthBgColors[healthStatus]}`}>
          <HealthIcon className={`h-4 w-4 ${healthColors[healthStatus]}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${healthColors[healthStatus]}`}>
            {healthLabel}
          </p>
        </div>
      </div>

      {/* Sync Information */}
      <div className="space-y-1 text-sm">
        {metadata.lastSyncTimestamp > 0 && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last backup:</span>
              <span
                className="font-medium"
                title={new Date(metadata.lastSyncTimestamp).toLocaleString()}
              >
                {formatDistanceToNow(metadata.lastSyncTimestamp, { addSuffix: true })}
              </span>
            </div>

            {metadata.lastSyncSuccess && metadata.blobSizeBytes > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backup size:</span>
                <span className="font-medium">
                  {(metadata.blobSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            )}
          </>
        )}

        {metadata.lastRestoreTimestamp && metadata.lastRestoreTimestamp > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last restored:</span>
            <span
              className="font-medium"
              title={new Date(metadata.lastRestoreTimestamp).toLocaleString()}
            >
              {formatDistanceToNow(metadata.lastRestoreTimestamp, { addSuffix: true })}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {!metadata.lastSyncSuccess && metadata.errorMessage && (
        <div className="pt-2 border-t space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400">
            {metadata.errorMessage}
          </p>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="w-full"
            >
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Restore Error Message */}
      {metadata.lastRestoreSuccess === false && metadata.restoreErrorMessage && (
        <div className="pt-2 border-t">
          <p className="text-sm text-red-600 dark:text-red-400">
            Last restore failed: {metadata.restoreErrorMessage}
          </p>
        </div>
      )}
    </div>
  );
}
