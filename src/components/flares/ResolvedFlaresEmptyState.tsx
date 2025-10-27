"use client";

import Link from "next/link";
import { Archive } from "lucide-react";

interface ResolvedFlaresEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

/**
 * Empty state component for Resolved Flares Archive (Story 2.8)
 * Shows different states for true empty vs filtered empty results
 * AC2.8.6: Semantic structure, helpful messaging, links to actions
 */
export function ResolvedFlaresEmptyState({ hasFilters, onClearFilters }: ResolvedFlaresEmptyStateProps) {
  // Filtered empty state: No results match current filters (AC2.8.6)
  if (hasFilters) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <Archive className="w-16 h-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No results found</h2>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          No resolved flares match your current filters. Try adjusting or clearing filters.
        </p>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  // True empty state: No resolved flares exist (AC2.8.6)
  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <Archive className="w-16 h-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-foreground mb-2">No resolved flares yet</h2>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        Flares marked as resolved will appear here. You can mark active flares as resolved from their detail pages.
      </p>
      <Link
        href="/flares"
        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Navigate to active flares page"
      >
        View Active Flares →
      </Link>
    </div>
  );
}
