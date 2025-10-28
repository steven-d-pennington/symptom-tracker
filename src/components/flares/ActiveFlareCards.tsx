"use client";

import { useState, useEffect } from "react";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { ActiveFlare } from "@/lib/types/flare";
import { FlareRecord, FlareEventRecord } from "@/lib/db/schema";
import { ArrowUp, ArrowRight, ArrowDown, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FlareUpdateModal } from "./FlareUpdateModal";
import { getBodyRegionById } from "@/lib/data/bodyRegions";

type FlareWithTrend = ActiveFlare & { trend: "worsening" | "stable" | "improving" };
type SortOption = "severity" | "recency";
type FlareTrend = "worsening" | "stable" | "improving";

/**
 * Calculate trend based on flare event history
 * Compares recent severity changes to determine if flare is improving/worsening/stable
 */
function calculateTrend(flare: FlareRecord, events: FlareEventRecord[]): FlareTrend {
  // Filter to severity-related events only
  const severityEvents = events.filter(
    e => e.severity !== undefined && (e.eventType === 'created' || e.eventType === 'severity_update')
  ).sort((a, b) => a.timestamp - b.timestamp); // Chronological order

  if (severityEvents.length < 2) {
    return 'stable'; // Not enough data to determine trend
  }

  // Compare last 2 severity values
  const recent = severityEvents.slice(-2);
  const previousSeverity = recent[0].severity!;
  const currentSeverity = recent[1].severity!;

  const change = currentSeverity - previousSeverity;

  if (change > 0) return 'worsening'; // Severity increased
  if (change < 0) return 'improving'; // Severity decreased
  return 'stable'; // No change
}

interface ActiveFlareCardsProps {
  userId: string;
  onUpdateFlare?: (flareId: string) => void;
  externalFlares?: FlareWithTrend[];
  filterByRegion?: string | null;
  repository?: typeof flareRepository;
}

export function ActiveFlareCards({
  userId,
  onUpdateFlare,
  externalFlares,
  filterByRegion,
  repository = flareRepository,
}: ActiveFlareCardsProps) {
  const [flares, setFlares] = useState<FlareWithTrend[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("severity");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedFlare, setSelectedFlare] = useState<FlareRecord | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const loadFlares = async () => {
    try {
      setLoading(true);
      setError(null);

      // Story 2.1: Use new API - getActiveFlares + getFlareHistory
      const flareRecords = await repository.getActiveFlares(userId);

      // Fetch event history for each flare and calculate trends
      const flaresWithTrends = await Promise.all(
        flareRecords.map(async (flare) => {
          const events = await repository.getFlareHistory(userId, flare.id);
          const trend = calculateTrend(flare, events);

          // Get body region name for display
          const bodyRegion = getBodyRegionById(flare.bodyRegionId);

          // Convert FlareRecord to ActiveFlare format for backward compatibility
          return {
            id: flare.id,
            userId: flare.userId,
            symptomId: flare.bodyRegionId, // Use bodyRegionId as symptomId for legacy compatibility
            symptomName: bodyRegion?.name || flare.bodyRegionId, // Use body region name or fallback to ID
            bodyRegions: [flare.bodyRegionId], // Wrap in array for legacy compatibility
            severity: flare.currentSeverity,
            status: flare.status as ActiveFlare['status'],
            startDate: new Date(flare.startDate),
            trend,
          } as ActiveFlare & { trend: FlareTrend };
        })
      );

      setFlares(flaresWithTrends);
    } catch (err) {
      console.error("Failed to load active flares:", err);
      setError("Failed to load active flares. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (externalFlares) {
      setFlares(externalFlares);
      setLoading(false);
    } else {
      loadFlares();
    }
  }, [userId, externalFlares]);

  // Reset visible count when filter or sort changes
  useEffect(() => {
    setVisibleCount(5);
  }, [filterByRegion, sortBy]);

  const handleResolve = async (flareId: string, flareName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to resolve "${flareName}"? This will move it out of your active flares.`
    );

    if (!confirmed) return;

    try {
      const resolutionDate = Date.now();

      // Create resolution FlareEvent record (append-only pattern)
      await repository.addFlareEvent(userId, flareId, {
        eventType: "resolved",
        timestamp: resolutionDate,
        resolutionDate: resolutionDate,
      });

      // Update FlareRecord status to resolved and set endDate
      await repository.updateFlare(userId, flareId, {
        status: "resolved",
        endDate: resolutionDate,
      });

      await loadFlares(); // Refresh the list
    } catch (err) {
      console.error("Failed to resolve flare:", err);
      alert("Failed to resolve flare. Please try again.");
    }
  };

  const handleUpdate = async (flareId: string) => {
    try {
      // Fetch fresh flare data from repository
      const flareRecord = await repository.getFlareById(userId, flareId);
      if (flareRecord) {
        setSelectedFlare(flareRecord);
        setUpdateModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load flare for update:", err);
      alert("Failed to load flare data. Please try again.");
    }
    
    // Call optional callback if provided
    if (onUpdateFlare) {
      onUpdateFlare(flareId);
    }
  };

  const handleFlareUpdate = () => {
    // Refetch flares data to update the UI
    loadFlares();
  };

  // Apply region filter if provided
  const filteredFlares = filterByRegion
    ? flares.filter(f => f.bodyRegions.includes(filterByRegion))
    : flares;

  const sortedFlares = [...filteredFlares].sort((a, b) => {
    if (sortBy === "severity") {
      return b.severity - a.severity; // Highest first
    } else {
      // Sort by recency (newest first)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

  const calculateDuration = (startDate: Date): number => {
    return Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getTrendIcon = (trend: "worsening" | "stable" | "improving") => {
    switch (trend) {
      case "worsening":
        return <ArrowUp className="w-4 h-4" aria-label="Worsening" />;
      case "stable":
        return <ArrowRight className="w-4 h-4" aria-label="Stable" />;
      case "improving":
        return <ArrowDown className="w-4 h-4" aria-label="Improving" />;
    }
  };

  const getTrendColor = (trend: "worsening" | "stable" | "improving"): string => {
    switch (trend) {
      case "worsening":
        return "text-red-600";
      case "stable":
        return "text-yellow-600";
      case "improving":
        return "text-green-600";
    }
  };

  if (loading) {
    return (
      <section className="space-y-3" aria-label="Active flares">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Active Flares</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg border border-border bg-muted/30"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3" aria-label="Active flares">
        <h2 className="text-lg font-semibold text-foreground">Active Flares</h2>
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (filteredFlares.length === 0 && flares.length > 0) {
    return (
      <section className="space-y-3" aria-label="Active flares">
        <h2 className="text-lg font-semibold text-foreground">Active Flares</h2>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            No flares in selected region
          </p>
          <p className="text-sm text-muted-foreground">
            Try selecting a different body region or clear the filter.
          </p>
        </div>
      </section>
    );
  }

  if (flares.length === 0) {
    return (
      <section className="space-y-3" aria-label="Active flares">
        <h2 className="text-lg font-semibold text-foreground">Active Flares</h2>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            No active flares right now
          </p>
          <p className="text-sm text-muted-foreground">
            Great news! You're currently flare-free. Keep tracking your health to stay on top of any changes.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-label="Active flares">
      {/* Header with collapse toggle and sort buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand active flares" : "Collapse active flares"}
        >
          <h2 className="text-lg font-semibold text-foreground">
            Active Flares <span className="text-muted-foreground">({filteredFlares.length}{filterByRegion ? ` of ${flares.length}` : ''})</span>
          </h2>
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {!isCollapsed && (
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("severity")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                sortBy === "severity"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-muted"
              )}
              aria-pressed={sortBy === "severity"}
            >
              By Severity
            </button>
            <button
              onClick={() => setSortBy("recency")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                sortBy === "recency"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-muted"
              )}
              aria-pressed={sortBy === "recency"}
            >
              By Recency
            </button>
          </div>
        )}
      </div>

      {/* Flare cards - conditionally rendered based on collapse state */}
      {!isCollapsed && (
        <>
          <div className="space-y-3">
            {sortedFlares.slice(0, visibleCount).map((flare) => {
          const duration = calculateDuration(flare.startDate);
          const bodyLocation = flare.bodyRegions.length > 0
            ? flare.bodyRegions.join(", ")
            : "No location specified";

          return (
            <div
              key={flare.id}
              className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {flare.symptomName}
                    </h3>
                    <span className={cn("flex items-center", getTrendColor(flare.trend))}>
                      {getTrendIcon(flare.trend)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {bodyLocation}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Duration</span>
                  <span className="font-medium text-foreground">
                    Day {duration}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Severity</span>
                  <span className="font-medium text-foreground">
                    {flare.severity}/10
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Trend</span>
                  <span className={cn("font-medium capitalize", getTrendColor(flare.trend))}>
                    {flare.trend}
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(flare.id)}
                  className="flex-1 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Update ${flare.symptomName} flare`}
                >
                  Update
                </button>
                <button
                  onClick={() => handleResolve(flare.id, flare.symptomName)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Resolve ${flare.symptomName} flare`}
                >
                  Resolve
                </button>
              </div>
            </div>
          );
            })}
          </div>

          {/* Load More / Show Less buttons */}
          {filteredFlares.length > 5 && (
            <div className="flex flex-col items-center gap-2 pt-2">
              {visibleCount < filteredFlares.length ? (
                <>
                  <button
                    onClick={() => setVisibleCount(prev => Math.min(prev + 5, filteredFlares.length))}
                    className="w-full rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Load More ({visibleCount} of {filteredFlares.length})
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredFlares.length)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Show All
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setVisibleCount(5)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Show Less
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Flare Update Modal */}
      {selectedFlare && (
        <FlareUpdateModal
          flare={selectedFlare}
          isOpen={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedFlare(null);
          }}
          userId={userId}
          onUpdate={handleFlareUpdate}
        />
      )}
    </section>
  );
}
