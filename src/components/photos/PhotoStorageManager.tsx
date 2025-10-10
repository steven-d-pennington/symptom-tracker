"use client";

import { useCallback, useEffect, useState } from "react";
import { photoRepository } from "@/lib/repositories/photoRepository";

interface StorageStats {
  totalPhotos: number;
  totalSize: number;
  oldestPhoto?: Date;
  newestPhoto?: Date;
  quota?: number;
  usage?: number;
}

interface PhotoStorageManagerProps {
  userId: string;
  refreshKey?: number;
}

export function PhotoStorageManager({ userId, refreshKey = 0 }: PhotoStorageManagerProps) {
  const [stats, setStats] = useState<StorageStats>({
    totalPhotos: 0,
    totalSize: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);

      const photos = await photoRepository.getAll(userId);
      const totalSize = await photoRepository.getTotalStorageUsed(userId);

      const stats: StorageStats = {
        totalPhotos: photos.length,
        totalSize,
      };

      if (photos.length > 0) {
        const dates = photos.map((p) => new Date(p.capturedAt).getTime());
        stats.oldestPhoto = new Date(Math.min(...dates));
        stats.newestPhoto = new Date(Math.max(...dates));
      }

      // Check storage quota if available
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        stats.quota = estimate.quota;
        stats.usage = estimate.usage;
      }

      setStats(stats);
    } catch (error) {
      console.error("Failed to load storage stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshKey]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const usagePercent = stats.quota ? ((stats.usage || 0) / stats.quota) * 100 : 0;
  const photoStoragePercent = stats.quota ? (stats.totalSize / stats.quota) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo storage */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Photo Storage</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Photos</span>
            <span className="text-lg font-semibold text-foreground">{stats.totalPhotos}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Storage Used</span>
            <span className="text-lg font-semibold text-foreground">
              {formatBytes(stats.totalSize)}
            </span>
          </div>
          {stats.oldestPhoto && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Oldest Photo</span>
              <span className="text-sm text-foreground">
                {stats.oldestPhoto.toLocaleDateString()}
              </span>
            </div>
          )}
          {stats.newestPhoto && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Newest Photo</span>
              <span className="text-sm text-foreground">
                {stats.newestPhoto.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Storage bar for photos */}
        {stats.quota && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Photos</span>
              <span className="font-medium text-foreground">
                {photoStoragePercent.toFixed(1)}% of total storage
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(photoStoragePercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Browser storage quota */}
      {stats.quota && stats.usage !== undefined && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Browser Storage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Usage</span>
              <span className="text-lg font-semibold text-foreground">
                {formatBytes(stats.usage)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="text-lg font-semibold text-foreground">
                {formatBytes(stats.quota - stats.usage)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Quota</span>
              <span className="text-sm text-foreground">{formatBytes(stats.quota)}</span>
            </div>
          </div>

          {/* Storage bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="font-medium text-foreground">{usagePercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${
                  usagePercent > 90
                    ? "bg-destructive"
                    : usagePercent > 75
                      ? "bg-yellow-500"
                      : "bg-primary"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Warning if near limit */}
          {usagePercent > 80 && (
            <div className="mt-4 rounded-lg bg-yellow-500/10 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-900">Storage Almost Full</h4>
                  <p className="mt-1 text-sm text-yellow-800">
                    You&apos;re using {usagePercent.toFixed(0)}% of your available storage. Consider
                    deleting old photos or exporting them for backup.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Recommendations</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Photos are automatically compressed to save space while maintaining quality
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Regularly export your photos to keep a backup and free up space</span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>All photos are encrypted and stored only on your device for privacy</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
