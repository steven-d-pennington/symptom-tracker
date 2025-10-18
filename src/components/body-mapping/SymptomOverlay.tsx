"use client";

import React, { useMemo } from "react";
import { SymptomMarker } from "./SymptomMarker";
import { BodyMapLocation } from "@/lib/types/body-mapping";

interface SymptomOverlayProps {
  symptoms: BodyMapLocation[];
  onSymptomClick?: (locationId: string) => void;
  showAnimations?: boolean;
  dateRange?: { start: Date; end: Date };
  severityFilter?: { min: number; max: number };
  regionFilter?: string[];
}

export function SymptomOverlay({
  symptoms,
  onSymptomClick,
  showAnimations = false,
  dateRange,
  severityFilter,
  regionFilter,
}: SymptomOverlayProps) {
  // Filter symptoms based on criteria
  const filteredSymptoms = useMemo(() => {
    return symptoms.filter((symptom) => {
      // Date range filter
      if (dateRange) {
        if (
          symptom.createdAt < dateRange.start ||
          symptom.createdAt > dateRange.end
        ) {
          return false;
        }
      }

      // Severity filter
      if (severityFilter) {
        if (
          symptom.severity < severityFilter.min ||
          symptom.severity > severityFilter.max
        ) {
          return false;
        }
      }

      // Region filter
      if (regionFilter && regionFilter.length > 0) {
        if (!regionFilter.includes(symptom.bodyRegionId)) {
          return false;
        }
      }

      return true;
    });
  }, [symptoms, dateRange, severityFilter, regionFilter]);

  // Group symptoms by region to handle clustering
  const symptomsByRegion = useMemo(() => {
    const grouped = new Map<string, BodyMapLocation[]>();
    filteredSymptoms.forEach((symptom) => {
      const existing = grouped.get(symptom.bodyRegionId) || [];
      grouped.set(symptom.bodyRegionId, [...existing, symptom]);
    });
    return grouped;
  }, [filteredSymptoms]);

  // Calculate position for clustered markers
  const getMarkerPosition = (
    symptom: BodyMapLocation,
    index: number,
    total: number
  ) => {
    if (total === 1) return { x: 0, y: 0 };

    const angle = (index / total) * 2 * Math.PI;
    const radius = 8; // pixels
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Render markers for each region */}
      {Array.from(symptomsByRegion.entries()).map(([regionId, regionSymptoms]) => (
        <div key={regionId} className="relative">
          {regionSymptoms.map((symptom, index) => {
            const position = getMarkerPosition(symptom, index, regionSymptoms.length);
            const coordinates = symptom.coordinates || { x: 0.5, y: 0.5 };

            return (
              <div
                key={symptom.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${coordinates.x * 100}%`,
                  top: `${coordinates.y * 100}%`,
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                }}
              >
                <SymptomMarker
                  location={symptom}
                  onClick={onSymptomClick}
                  showAnimation={showAnimations}
                  size={regionSymptoms.length > 1 ? "sm" : "md"}
                />
              </div>
            );
          })}

          {/* Cluster indicator for multiple symptoms in same region */}
          {regionSymptoms.length > 1 && (
            <div
              className="absolute bg-gray-900/80 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-auto"
              style={{
                left: `${(regionSymptoms[0].coordinates?.x || 0.5) * 100}%`,
                top: `${(regionSymptoms[0].coordinates?.y || 0.5) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {regionSymptoms.length}
            </div>
          )}
        </div>
      ))}

      {/* No symptoms message */}
      {filteredSymptoms.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg">
            No symptoms to display
          </div>
        </div>
      )}
    </div>
  );
}
