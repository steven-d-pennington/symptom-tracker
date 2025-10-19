"use client";

import React, { useEffect, useRef } from "react";
import { BodyRegionSelector } from "./BodyRegionSelector";
import { BodyMapZoom } from "@/components/body-map/BodyMapZoom";
import { BodyMapLocation } from "@/lib/types/body-mapping";

interface BodyMapViewerProps {
  view: "front" | "back" | "left" | "right";
  symptoms?: BodyMapLocation[];
  selectedRegion?: string;
  onRegionSelect: (regionId: string) => void;
  onSymptomAdd?: (location: Partial<BodyMapLocation>) => void;
  onSymptomClick?: (locationId: string) => void;
  readOnly?: boolean;
  multiSelect?: boolean;
  flareSeverityByRegion?: Record<string, number>;
}

export function BodyMapViewer({
  view,
  symptoms = [],
  selectedRegion,
  onRegionSelect,
  onSymptomAdd: _onSymptomAdd,
  onSymptomClick: _onSymptomClick,
  readOnly = false,
  multiSelect = false,
  flareSeverityByRegion = {},
}: BodyMapViewerProps) {
  // Calculate severity by region for visualization
  // Merge symptom severity and flare severity (flares take priority with red coloring)
  const symptomSeverityByRegion = symptoms.reduce(
    (acc, symptom) => {
      if (!acc[symptom.bodyRegionId] || symptom.severity > acc[symptom.bodyRegionId]) {
        acc[symptom.bodyRegionId] = symptom.severity;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Combine both severity sources - flares will be shown with special styling
  const combinedSeverityByRegion = { ...symptomSeverityByRegion, ...flareSeverityByRegion };

  const instructionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!instructionsRef.current) {
      return;
    }

    const selector = '[data-body-map-instructions="true"]';
    const current = instructionsRef.current;

    document.querySelectorAll<HTMLDivElement>(selector).forEach((element) => {
      if (element !== current) {
        element.remove();
      }
    });
  }, [view]);

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
      <BodyMapZoom viewType={view}>
        <BodyRegionSelector
          view={view}
          selectedRegions={selectedRegion ? [selectedRegion] : []}
          onRegionSelect={onRegionSelect}
          multiSelect={multiSelect}
          severityByRegion={combinedSeverityByRegion}
          flareRegions={Object.keys(flareSeverityByRegion)}
        />
      </BodyMapZoom>

      {/* Instructions */}
      <div
        ref={instructionsRef}
        data-body-map-instructions="true"
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm"
      >
        <div className="flex items-center gap-4">
          <span>Touch or click regions to select</span>
        </div>
      </div>
    </div>
  );
}
