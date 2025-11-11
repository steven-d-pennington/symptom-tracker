"use client";

import { useState, useEffect } from "react";
import { LayerType, BodyMapLocationRecord } from "@/lib/db/schema";
import { ActiveFlareCards } from "@/components/flares/ActiveFlareCards";
import { ActiveFlare } from "@/lib/types/flare";
import { getBodyRegionById } from "@/lib/data/bodyRegions";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FlareWithTrend = ActiveFlare & { trend: "worsening" | "stable" | "improving" };

interface LayerSpecificCardsProps {
  userId: string;
  currentLayer: LayerType;
  markers: BodyMapLocationRecord[];
  isLoading: boolean;
  flares?: FlareWithTrend[];
  filterByRegion?: string | null;
  onCardClick?: (id: string) => void;
}

/**
 * LayerSpecificCards Component
 *
 * Displays different card types based on the selected layer:
 * - Flares layer: Shows ActiveFlareCards
 * - Pain/Inflammation layers: Shows marker cards with severity and notes
 */
export function LayerSpecificCards({
  userId,
  currentLayer,
  markers,
  isLoading,
  flares,
  filterByRegion,
  onCardClick,
}: LayerSpecificCardsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  // If flares layer is selected, delegate to ActiveFlareCards
  if (currentLayer === 'flares') {
    return (
      <ActiveFlareCards
        userId={userId}
        externalFlares={flares}
        filterByRegion={filterByRegion}
        onUpdateFlare={onCardClick}
      />
    );
  }

  // For pain/inflammation layers, show marker cards
  const layerConfig = {
    pain: {
      label: 'Pain Markers',
      icon: '⚡',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    inflammation: {
      label: 'Inflammation Markers',
      icon: '🟣',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  };

  const config = layerConfig[currentLayer as 'pain' | 'inflammation'];

  // Filter markers by region if specified
  const filteredMarkers = filterByRegion
    ? markers.filter(m => m.bodyRegionId === filterByRegion)
    : markers;

  // Sort by timestamp (most recent first)
  const sortedMarkers = [...filteredMarkers].sort((a, b) => {
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt;
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt;
    return bTime - aTime;
  });

  if (isLoading) {
    return (
      <section className="space-y-3" aria-label={config.label}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{config.label}</h2>
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

  if (filteredMarkers.length === 0 && markers.length > 0) {
    return (
      <section className="space-y-3" aria-label={config.label}>
        <h2 className="text-lg font-semibold text-foreground">{config.label}</h2>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            No markers in selected region
          </p>
          <p className="text-sm text-muted-foreground">
            Try selecting a different body region or clear the filter.
          </p>
        </div>
      </section>
    );
  }

  if (markers.length === 0) {
    return (
      <section className="space-y-3" aria-label={config.label}>
        <h2 className="text-lg font-semibold text-foreground">{config.label}</h2>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="text-4xl mb-3">{config.icon}</div>
          <p className="text-lg font-medium text-foreground mb-2">
            No {currentLayer} markers yet
          </p>
          <p className="text-sm text-muted-foreground">
            Click on the body map to add {currentLayer} markers.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-label={config.label}>
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? `Expand ${config.label}` : `Collapse ${config.label}`}
        >
          <h2 className="text-lg font-semibold text-foreground">
            {config.label} <span className="text-muted-foreground">({filteredMarkers.length}{filterByRegion ? ` of ${markers.length}` : ''})</span>
          </h2>
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Marker cards - conditionally rendered based on collapse state */}
      {!isCollapsed && (
        <>
          <div className="space-y-3">
            {sortedMarkers.slice(0, visibleCount).map((marker) => {
              const bodyRegion = getBodyRegionById(marker.bodyRegionId);
              const markerDate = marker.createdAt instanceof Date
                ? marker.createdAt
                : new Date(marker.createdAt);

              return (
                <div
                  key={marker.id}
                  className={cn(
                    "rounded-lg border p-4 transition-shadow hover:shadow-md",
                    config.borderColor,
                    config.bgColor
                  )}
                  onClick={() => onCardClick?.(marker.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{config.icon}</span>
                        <h3 className="font-semibold text-foreground">
                          {bodyRegion?.name || marker.bodyRegionId}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {markerDate.toLocaleDateString()} at {markerDate.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="block text-xs text-muted-foreground mb-1">Severity</span>
                      <span className={cn("font-medium", config.color)}>
                        {marker.severity}/10
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground mb-1">Type</span>
                      <span className="font-medium text-foreground capitalize">
                        {currentLayer}
                      </span>
                    </div>
                  </div>

                  {marker.notes && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm text-foreground">{marker.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load More / Show Less buttons */}
          {filteredMarkers.length > 5 && (
            <div className="flex flex-col items-center gap-2 pt-2">
              {visibleCount < filteredMarkers.length ? (
                <>
                  <button
                    onClick={() => setVisibleCount(prev => Math.min(prev + 5, filteredMarkers.length))}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      config.borderColor,
                      config.bgColor,
                      config.color,
                      "hover:opacity-80"
                    )}
                  >
                    Load More ({visibleCount} of {filteredMarkers.length})
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredMarkers.length)}
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
    </section>
  );
}
