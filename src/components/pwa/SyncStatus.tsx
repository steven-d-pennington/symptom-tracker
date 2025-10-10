"use client";

import { useOnline } from "@/lib/hooks/useOnline";
import { syncService } from "@/lib/services";
import { useState, useEffect } from "react";

export function SyncStatus() {
  const isOnline = useOnline();
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());
  const [lastSyncText, setLastSyncText] = useState("");

  useEffect(() => {
    // Update last sync text
    const updateLastSync = () => {
      const status = syncService.getSyncStatus();
      setSyncStatus(status);

      if (status.lastSync) {
        const now = new Date();
        const lastSync = new Date(status.lastSync);
        const diffMs = now.getTime() - lastSync.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) {
          setLastSyncText("Just now");
        } else if (diffMins < 60) {
          setLastSyncText(`${diffMins}m ago`);
        } else {
          const diffHours = Math.floor(diffMins / 60);
          setLastSyncText(`${diffHours}h ago`);
        }
      }
    };

    updateLastSync();
    const interval = setInterval(updateLastSync, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    try {
      await syncService.sync();
      setSyncStatus(syncService.getSyncStatus());
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {/* Online/Offline indicator */}
      <div className="flex items-center gap-1">
        <div
          className={`h-2 w-2 rounded-full ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <span className="hidden sm:inline">
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Sync status */}
      {syncStatus.pendingChanges > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-yellow-600">
            {syncStatus.pendingChanges} pending
          </span>
          {isOnline && syncStatus.syncStatus !== "syncing" && (
            <button
              onClick={handleSync}
              className="text-blue-600 hover:text-blue-700"
            >
              Sync now
            </button>
          )}
        </div>
      )}

      {/* Syncing indicator */}
      {syncStatus.syncStatus === "syncing" && (
        <div className="flex items-center gap-1">
          <svg
            className="h-4 w-4 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Syncing...</span>
        </div>
      )}

      {/* Last sync time */}
      {syncStatus.syncStatus === "idle" &&
        syncStatus.pendingChanges === 0 &&
        lastSyncText && (
          <span className="hidden text-gray-500 md:inline">
            Synced {lastSyncText}
          </span>
        )}

      {/* Error indicator */}
      {syncStatus.syncStatus === "error" && (
        <span className="text-red-600">Sync error</span>
      )}
    </div>
  );
}
