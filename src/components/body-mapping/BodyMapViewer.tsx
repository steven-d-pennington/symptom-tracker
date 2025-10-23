"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BodyRegionSelector } from "./BodyRegionSelector";
import { BodyMapZoom } from "@/components/body-map/BodyMapZoom";
import { BodyMapLocation } from "@/lib/types/body-mapping";
import { CoordinateMarker } from "@/components/body-map/CoordinateMarker";
import {
  denormalizeCoordinates,
  getRegionBounds,
  normalizeCoordinates,
  NormalizedCoordinates,
  RegionBounds,
} from "@/lib/utils/coordinates";

interface BodyMapViewerProps {
  view: "front" | "back" | "left" | "right";
  userId: string;
  symptoms?: BodyMapLocation[];
  selectedRegion?: string;
  onRegionSelect: (regionId: string) => void;
  onSymptomAdd?: (location: Partial<BodyMapLocation>) => void;
  onSymptomClick?: (locationId: string) => void;
  readOnly?: boolean;
  multiSelect?: boolean;
  flareSeverityByRegion?: Record<string, number>;
  onCoordinateMark?: (regionId: string, coordinates: NormalizedCoordinates) => void;
  showFlareMarkers?: boolean;
}

export function BodyMapViewer({
  view,
  userId,
  symptoms = [],
  selectedRegion,
  onRegionSelect,
  onSymptomAdd: _onSymptomAdd,
  onSymptomClick: _onSymptomClick,
  readOnly = false,
  multiSelect = false,
  flareSeverityByRegion = {},
  onCoordinateMark,
  showFlareMarkers = true,
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [regionMarkers, setRegionMarkers] = useState<
    Record<string, { normalized: NormalizedCoordinates; bounds: RegionBounds }>
  >({});

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

  useEffect(() => {
    setRegionMarkers({});
    svgRef.current = null;
  }, [view]);

  const handleZoomChange = useCallback((scale: number) => {
    setZoomLevel(scale);
  }, []);

  const handleCoordinateCapture = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) {
        return;
      }

      const target = event.target as SVGElement | null;
      if (!target) {
        return;
      }

      const isBodyRegionElement = target.classList?.contains("body-region");
      const regionIdFromTarget = target?.id;
      if (!regionIdFromTarget && !isBodyRegionElement) {
        return;
      }

      const regionId = regionIdFromTarget || selectedRegion;

      if (!regionId) {
        return;
      }

      // If this region isn't already selected, select it first
      if (selectedRegion !== regionId) {
        onRegionSelect(regionId);
      }

      const svgElement = event.currentTarget;
      svgRef.current = svgElement;

      const point = svgElement.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;

      const ctm = svgElement.getScreenCTM();
      if (!ctm) {
        return;
      }

      const svgPoint = point.matrixTransform(ctm.inverse());
      const bounds = getRegionBounds(svgElement, regionId);
      if (!bounds) {
        return;
      }

      const normalized = normalizeCoordinates(
        { x: svgPoint.x, y: svgPoint.y },
        bounds
      );

      setRegionMarkers((previous) => ({
        ...previous,
        [regionId]: {
          normalized,
          bounds,
        },
      }));

      onCoordinateMark?.(regionId, normalized);
      
      // Prevent the onClick handler from firing to avoid double region selection
      event.stopPropagation();
    },
    [onCoordinateMark, onRegionSelect, readOnly, selectedRegion]
  );

  const activeMarker = useMemo(() => {
    if (!selectedRegion) {
      return null;
    }

    return regionMarkers[selectedRegion] ?? null;
  }, [regionMarkers, selectedRegion]);

  const coordinateMarkerNode = useMemo(() => {
    if (!activeMarker || !selectedRegion) {
      return null;
    }

    const { normalized, bounds } = activeMarker;
    const svgPoint = denormalizeCoordinates(normalized, bounds);

    return (
      <CoordinateMarker
        x={svgPoint.x}
        y={svgPoint.y}
        zoomLevel={zoomLevel}
        visible={true}
        regionId={selectedRegion}
        normalized={normalized}
      />
    );
  }, [activeMarker, selectedRegion, zoomLevel]);

  const flareMarkerOverlay = useMemo(() => {
    if (!showFlareMarkers) {
      return null;
    }

    // Dynamic import to avoid router dependency in tests
    const FlareMarkers = React.lazy(() => import("@/components/body-map/FlareMarkers").then(module => ({ default: module.FlareMarkers })));

    return (
      <React.Suspense fallback={null}>
        <FlareMarkers viewType={view} zoomLevel={zoomLevel} userId={userId} />
      </React.Suspense>
    );
  }, [view, zoomLevel, userId, showFlareMarkers]);

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg">
      {/* Hidden aria-live region for accessibility announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {/* Announcements will be populated by accessibility hooks */}
      </div>

      <BodyMapZoom
        viewType={view}
        userId={userId}
        onZoomChange={handleZoomChange}
      >
        <BodyRegionSelector
          view={view}
          selectedRegions={selectedRegion ? [selectedRegion] : []}
          onRegionSelect={onRegionSelect}
          multiSelect={multiSelect}
          severityByRegion={combinedSeverityByRegion}
          flareRegions={Object.keys(flareSeverityByRegion)}
          onCoordinateCapture={handleCoordinateCapture}
          coordinateCursorActive={!readOnly && Boolean(selectedRegion)}
          coordinateMarker={coordinateMarkerNode}
          flareOverlay={flareMarkerOverlay}
          userId={userId}
          zoomLevel={zoomLevel}
          isZoomed={zoomLevel > 1}
          onCoordinateMark={onCoordinateMark}
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
          {activeMarker && selectedRegion && (
            <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-medium">
              <span className="uppercase tracking-wide text-white/80">{selectedRegion.replace(/-/g, " ")}</span>
              <span className="font-mono text-white">
                x: {activeMarker.normalized.x.toFixed(2)} y: {activeMarker.normalized.y.toFixed(2)}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
