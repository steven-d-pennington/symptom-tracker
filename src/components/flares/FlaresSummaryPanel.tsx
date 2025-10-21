"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Activity, TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FlaresSummaryPanelProps {
  stats: {
    total: number;
    worsening: number;
    improving: number;
    stable: number;
    avgSeverity: number;
  };
  selectedRegion: string | null;
  onClearRegionFilter: () => void;
}

/**
 * Story 0.3 Task 3: Collapsible summary panel for flare statistics and filters
 * Defaults to collapsed, exposes grouped analytics on demand
 */
export function FlaresSummaryPanel({
  stats,
  selectedRegion,
  onClearRegionFilter,
}: FlaresSummaryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Story 0.3 Task 3.2: Announce state changes to screen readers
  useEffect(() => {
    if (liveRegionRef.current) {
      const announcement = isExpanded
        ? "Summary panel expanded. Showing flare statistics and filters."
        : "Summary panel collapsed.";
      liveRegionRef.current.textContent = announcement;
    }
  }, [isExpanded]);

  const togglePanel = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      ref={panelRef}
      className="rounded-lg border border-border bg-card"
      role="region"
      aria-label="Flare statistics and filters"
    >
      {/* Story 0.3 Task 3.2: Screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Collapsible header */}
      <button
        onClick={togglePanel}
        className={cn(
          "w-full flex items-center justify-between p-4",
          "text-left transition-colors hover:bg-muted/50",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-expanded={isExpanded}
        aria-controls="summary-panel-content"
        aria-label={isExpanded ? "Collapse summary panel" : "Expand summary panel"}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">
            Flare Summary
          </h2>
          <span className="text-sm text-muted-foreground">
            ({stats.total} active)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div id="summary-panel-content" className="border-t border-border p-4 space-y-4">
          {/* Story 0.3 Task 3.3: Stats grouped by severity and trend */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Trend Analysis
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-700 text-xs mb-1">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Worsening</span>
                </div>
                <div className="text-xl font-bold text-red-900" aria-label={`${stats.worsening} worsening flares`}>
                  {stats.worsening}
                </div>
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <div className="flex items-center gap-2 text-yellow-700 text-xs mb-1">
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Stable</span>
                </div>
                <div className="text-xl font-bold text-yellow-900" aria-label={`${stats.stable} stable flares`}>
                  {stats.stable}
                </div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 text-green-700 text-xs mb-1">
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Improving</span>
                </div>
                <div className="text-xl font-bold text-green-900" aria-label={`${stats.improving} improving flares`}>
                  {stats.improving}
                </div>
              </div>
            </div>
          </div>

          {/* Severity metrics */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Severity Metrics
            </h3>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Severity</span>
                <span className="text-lg font-bold text-foreground" aria-label={`Average severity ${stats.avgSeverity} out of 10`}>
                  {stats.avgSeverity}/10
                </span>
              </div>
            </div>
          </div>

          {/* Story 0.3 Task 3.3: Active filters */}
          {selectedRegion && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Active Filters
              </h3>
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary">
                    Region: {selectedRegion}
                  </span>
                </div>
                <button
                  onClick={onClearRegionFilter}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                    "text-primary hover:bg-primary/10 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                  aria-label="Clear region filter"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
