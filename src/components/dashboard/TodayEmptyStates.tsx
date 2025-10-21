"use client";

import { Flame, Clock, Zap } from "lucide-react";

/**
 * Empty state for Highlights module
 * Shown when there are no active flares
 */
export function HighlightsEmptyState() {
  return (
    <div
      className="rounded-lg border border-border bg-card p-8 text-center"
      role="status"
      aria-label="No active flares"
    >
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
          <Flame className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
      </div>
      <p className="text-lg font-medium text-foreground mb-2">
        No active flares yet
      </p>
      <p className="text-sm text-muted-foreground">
        Great news! You&apos;re currently flare-free. Use Quick Actions below to log a new flare if needed.
      </p>
    </div>
  );
}

/**
 * Empty state for Quick Actions module
 * Provides guidance on how to use quick actions
 */
export function QuickActionsEmptyState() {
  return (
    <div
      className="rounded-lg border-2 border-dashed border-muted bg-muted/30 p-6 text-center"
      role="status"
      aria-label="Quick actions help"
    >
      <div className="flex justify-center mb-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
      </div>
      <p className="text-sm font-medium text-foreground mb-2">
        Start tracking your health
      </p>
      <p className="text-xs text-muted-foreground">
        Use the buttons above to quickly log flares, medications, symptoms, food, or triggers. Your entries appear in the timeline below.
      </p>
    </div>
  );
}

/**
 * Empty state for Timeline module
 * Shown when there are no events logged today
 */
export function TimelineEmptyState() {
  return (
    <div
      className="rounded-lg border border-border bg-card p-8 text-center"
      role="status"
      aria-label="No events logged today"
    >
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-muted p-3">
          <Clock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
      <p className="text-lg font-medium text-foreground mb-2">
        No events logged today
      </p>
      <p className="text-sm text-muted-foreground">
        Start your day by logging your first event using Quick Actions above.
      </p>
    </div>
  );
}

/**
 * Error state for any module
 * Shown when data fails to load
 */
export function ErrorState({ message }: { message?: string }) {
  return (
    <div
      className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6 text-center"
      role="alert"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-2">
        Something went wrong
      </p>
      <p className="text-xs text-red-700 dark:text-red-300">
        {message || "Unable to load data. Please try refreshing the page."}
      </p>
    </div>
  );
}

/**
 * Offline state for any module
 * Shown when app is offline
 */
export function OfflineState() {
  return (
    <div
      className="rounded-lg border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 p-6 text-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2">
        You&apos;re offline
      </p>
      <p className="text-xs text-yellow-700 dark:text-yellow-300">
        Your data is stored locally and will sync when you&apos;re back online.
      </p>
    </div>
  );
}
