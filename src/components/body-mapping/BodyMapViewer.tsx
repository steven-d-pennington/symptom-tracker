"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import { BodyRegionSelector } from "./BodyRegionSelector";
import { BodyMapZoom } from "@/components/body-map/BodyMapZoom";
import { BodyMapLocation } from "@/lib/types/body-mapping";
import { CoordinateMarker } from "@/components/body-map/CoordinateMarker";
import { RegionDetailView } from "./RegionDetailView";
import { FullScreenControl } from "./FullScreenControl";
import { FullScreenControlBar } from "./FullScreenControlBar";
import { useFullscreen } from "@/lib/hooks/useFullscreen";
import {
  denormalizeCoordinates,
  getRegionBounds,
  normalizeCoordinates,
  NormalizedCoordinates,
  RegionBounds,
} from "@/lib/utils/coordinates";
import { announce } from "@/lib/utils/announce"; // Story 3.7.6: ARIA announcements

export type BodyMapViewMode = 'full-body' | 'region-detail';

export interface BodyMapViewerRef {
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  isFullscreen: boolean;
}

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
  onCoordinateMark?: (regionId: string, coordinates: NormalizedCoordinates, details?: { severity: number; notes: string; timestamp: Date }) => void;
  showFlareMarkers?: boolean;
  viewMode?: BodyMapViewMode;
  onViewModeChange?: (mode: BodyMapViewMode) => void;
  /** Story 3.7.4: Callback when done marking locations in fullscreen */
  onDoneMarking?: () => void;
  /** Story 3.7.4: Number of markers placed (for display in control bar) */
  markerCount?: number;
  /** Hide the built-in fullscreen button (when parent handles fullscreen) */
  hideFullscreenButton?: boolean;
}

export const BodyMapViewer = forwardRef<BodyMapViewerRef, BodyMapViewerProps>(function BodyMapViewer({
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
  viewMode: controlledViewMode,
  onViewModeChange,
  onDoneMarking,
  markerCount = 0,
  hideFullscreenButton = false,
}: BodyMapViewerProps, ref) {
  // View mode state management (Task 2) - can be controlled or uncontrolled
  const [internalViewMode, setInternalViewMode] = useState<BodyMapViewMode>('full-body');
  const [currentRegionId, setCurrentRegionId] = useState<string | null>(null);

  // Use controlled mode if provided, otherwise use internal state
  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = useCallback((mode: BodyMapViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  }, [onViewModeChange]);

  // Story 3.7.4: App fullscreen mode state management (hides UI chrome, not browser fullscreen)
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

  // Expose fullscreen methods to parent component via ref
  useImperativeHandle(ref, () => ({
    enterFullscreen,
    exitFullscreen,
    isFullscreen,
  }), [enterFullscreen, exitFullscreen, isFullscreen]);

  // Track previous fullscreen state for announcements
  const prevFullscreenState = useRef(isFullscreen);

  // AC 3.7.6.8: Announce fullscreen mode changes
  useEffect(() => {
    if (prevFullscreenState.current !== isFullscreen) {
      if (isFullscreen) {
        announce('Full-screen mode activated', 'assertive');
      } else {
        announce('Full-screen mode deactivated', 'polite');
      }
      prevFullscreenState.current = isFullscreen;
    }
  }, [isFullscreen]);

  // Story 3.7.4 AC 3.7.4.5: ESC key handler for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        // Exit fullscreen takes priority over other ESC handlers
        exitFullscreen();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isFullscreen, exitFullscreen]);

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

  // Task 2.3: Handle region click to switch to region-detail mode
  const handleRegionClick = useCallback((regionId: string) => {
    console.log('Region clicked:', regionId); // Debug log
    // Switch to region detail view when a region is clicked
    setCurrentRegionId(regionId);
    setViewMode('region-detail');
    onRegionSelect(regionId);
  }, [onRegionSelect]);

  // Task 2.4: Handle back to body map navigation
  const handleBackToBodyMap = useCallback(() => {
    setViewMode('full-body');
    setCurrentRegionId(null);
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

      // If this region isn't already selected, don't capture the event
      // Let it pass through to the region's onClick handler to switch to detail view
      if (selectedRegion !== regionId) {
        return;
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

  // Story 3.5.12: Touch coordinate capture handler for iPhone/mobile devices
  const handleTouchCoordinateCapture = useCallback(
    (event: React.TouchEvent<SVGSVGElement>) => {
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

      // If this region isn't already selected, don't capture the event
      // Let it pass through to the region's onClick handler to switch to detail view
      if (selectedRegion !== regionId) {
        return;
      }

      // Prevent default to avoid mouse event synthesis which causes incorrect coordinates
      event.preventDefault();

      // Get touch coordinates from the first touch point
      const touch = event.touches[0] || event.changedTouches[0];
      if (!touch) {
        return;
      }

      const svgElement = event.currentTarget;
      svgRef.current = svgElement;

      // Use touch coordinates instead of mouse coordinates
      const point = svgElement.createSVGPoint();
      point.x = touch.clientX;
      point.y = touch.clientY;

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

      // Prevent event bubbling
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
        <FlareMarkers
          viewType={view}
          zoomLevel={zoomLevel}
          userId={userId}
          markers={symptoms}
        />
      </React.Suspense>
    );
  }, [view, zoomLevel, userId, showFlareMarkers, symptoms]);

  // Task 2.5: Conditionally render RegionDetailView or full body view
  // Note: RegionDetailView handles its own portal rendering when in fullscreen
  // so we don't wrap it in a portal here (would cause double portal and component remounting)
  if (viewMode === 'region-detail' && currentRegionId) {
    return (
      <RegionDetailView
        regionId={currentRegionId}
        viewType={view}
        userId={userId}
        markers={symptoms}
        onBack={handleBackToBodyMap}
        onMarkerPlace={onCoordinateMark}
        readOnly={readOnly}
        showHistoricalMarkersDefault={true}
        onMarkerClick={_onSymptomClick}
        isFullscreen={isFullscreen}
        onExitFullscreen={exitFullscreen}
        onDoneMarking={onDoneMarking}
        markerCount={markerCount}
      />
    );
  }

  // Render full body view
  const fullBodyView = (
    <div
      className={`${
        isFullscreen
          ? ''
          : 'relative w-full h-full rounded-lg'
      }`}
      style={isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: 'var(--muted)',
        transform: 'translateZ(0)'
      } : { backgroundColor: 'var(--muted)' }}
      data-fullscreen={isFullscreen ? 'true' : 'false'}
      data-testid="body-map-viewer"
      data-marker-count={markerCount}
    >
      {/* Story 3.7.4: Fullscreen control bar (shown when in fullscreen mode) */}
      {isFullscreen && (
        <FullScreenControlBar
          onExit={exitFullscreen}
          showBackButton={false}
          showHistoryToggle={false}
          onDoneMarking={onDoneMarking}
          markerCount={markerCount}
        />
      )}

      {/* Hidden aria-live region for accessibility announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {/* Announcements will be populated by accessibility hooks */}
      </div>

      {/* Story 3.7.4: Fullscreen toggle button (shown when NOT in fullscreen) */}
      {!isFullscreen && !hideFullscreenButton && (
        <div className="absolute top-4 right-4 z-10">
          <FullScreenControl
            isFullscreen={false}
            onToggle={enterFullscreen}
          />
        </div>
      )}

      <div className={isFullscreen ? 'pt-12 h-full' : ''}>
        <BodyMapZoom
          viewType={view}
          userId={userId}
          onZoomChange={handleZoomChange}
        >
          <BodyRegionSelector
            view={view}
            selectedRegions={selectedRegion ? [selectedRegion] : []}
            onRegionSelect={handleRegionClick}
            multiSelect={multiSelect}
            severityByRegion={combinedSeverityByRegion}
            flareRegions={Object.keys(flareSeverityByRegion)}
            onCoordinateCapture={handleCoordinateCapture}
            onTouchCoordinateCapture={handleTouchCoordinateCapture}
            coordinateCursorActive={!readOnly && Boolean(selectedRegion)}
            coordinateMarker={coordinateMarkerNode}
            flareOverlay={flareMarkerOverlay}
            userId={userId}
            zoomLevel={zoomLevel}
            isZoomed={zoomLevel > 1}
            onCoordinateMark={onCoordinateMark}
          />
        </BodyMapZoom>
      </div>

      {/* Instructions */}
      <div
        ref={instructionsRef}
        data-body-map-instructions="true"
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 card px-4 py-2 text-small"
        style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-md)' }}
      >
        <div className="flex items-center gap-4">
          <span style={{ color: 'var(--text-secondary)' }}>Touch or click regions to select</span>
          {activeMarker && selectedRegion && (
            <span className="badge-primary inline-flex items-center gap-2 px-3 py-1 text-xs font-medium">
              <span className="uppercase tracking-wide">{selectedRegion.replace(/-/g, " ")}</span>
              <span className="font-mono">
                x: {activeMarker.normalized.x.toFixed(2)} y: {activeMarker.normalized.y.toFixed(2)}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // If in fullscreen mode, use portal to render outside layout
  if (isFullscreen) {
    return typeof window !== 'undefined' ? createPortal(fullBodyView, document.body) : fullBodyView;
  }

  return fullBodyView;
});
