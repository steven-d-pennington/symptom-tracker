"use client";

import { useState, useEffect } from "react";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { ActiveFlare } from "@/lib/types/flare";
import { ArrowUp, ArrowRight, ArrowDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FlareWithTrend = ActiveFlare & { trend: "worsening" | "stable" | "improving" };
type SortOption = "severity" | "recency";

interface ActiveFlareCardsProps {
  userId: string;
  onUpdateFlare?: (flareId: string) => void;
  repository?: Pick<typeof flareRepository, "getActiveFlaresWithTrend" | "resolve">;
}

export function ActiveFlareCards({
  userId,
  onUpdateFlare,
  repository = flareRepository,
}: ActiveFlareCardsProps) {
  const [flares, setFlares] = useState<FlareWithTrend[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("severity");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFlares = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeFlares = await repository.getActiveFlaresWithTrend(userId);
      setFlares(activeFlares);
    } catch (err) {
      console.error("Failed to load active flares:", err);
      setError("Failed to load active flares. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlares();
  }, [userId]);

  const handleResolve = async (flareId: string, flareName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to resolve "${flareName}"? This will move it out of your active flares.`
    );

    if (!confirmed) return;

    try {
      await repository.resolve(flareId);
      await loadFlares(); // Refresh the list
    } catch (err) {
      console.error("Failed to resolve flare:", err);
      alert("Failed to resolve flare. Please try again.");
    }
  };

  const handleUpdate = (flareId: string) => {
    // TODO: Open FlareUpdateModal when implemented in Story 2.4
    if (onUpdateFlare) {
      onUpdateFlare(flareId);
    } else {
      alert("Flare update modal will be implemented in Story 2.4");
    }
  };

  const sortedFlares = [...flares].sort((a, b) => {
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
      {/* Header with sort toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Active Flares <span className="text-muted-foreground">({flares.length})</span>
        </h2>
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
      </div>

      {/* Flare cards */}
      <div className="space-y-3">
        {sortedFlares.slice(0, 5).map((flare) => {
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

      {flares.length > 5 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing 5 of {flares.length} active flares
        </p>
      )}
    </section>
  );
}
