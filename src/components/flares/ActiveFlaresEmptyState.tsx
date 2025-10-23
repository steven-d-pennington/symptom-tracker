"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

/**
 * Empty state component for Active Flares Dashboard (Story 2.3, AC2.3.5)
 * Displays when no active flares exist, guides user to body map
 */
export function ActiveFlaresEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-border bg-card"
      role="region"
      aria-label="No active flares"
    >
      <div className="text-6xl mb-4" aria-hidden="true">
        <MapPin className="w-16 h-16 text-muted-foreground mx-auto" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        No active flares
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Tap body map to track a new flare.
      </p>
      <Link
        href="/body-map"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <MapPin className="w-5 h-5" />
        Go to Body Map
      </Link>
    </div>
  );
}