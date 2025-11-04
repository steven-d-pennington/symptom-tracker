"use client";

import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { BodyMapLocation, LayerType } from "@/lib/types/body-mapping";
import { CoordinateMarker } from "@/components/body-map/CoordinateMarker";
import { ArrowLeft, Eye, EyeOff, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { bodyMapLocationRepository } from "@/lib/repositories/bodyMapLocationRepository";
import {
  NormalizedCoordinates,
  RegionBounds,
  normalizeCoordinates,
  denormalizeCoordinates
} from "@/lib/utils/coordinates";
import { getRegionSVGDefinition, getRegionData } from "@/lib/utils/region-extraction";
import { MarkerPreview } from "@/components/body-mapping/MarkerPreview";
import { MarkerDetailsForm } from "@/components/body-mapping/MarkerDetailsForm";
import { FullScreenControlBar } from "@/components/body-mapping/FullScreenControlBar";
import { MarkerDetailsModal, MarkerDetails } from "@/components/body-mapping/MarkerDetailsModal";
import { formatDistanceToNow } from "date-fns";

export interface RegionDetailViewProps {
  /** The ID of the region being viewed in detail */
  regionId: string;

  /** The view type (front/back/left/right) for context */
  viewType: "front" | "back" | "left" | "right";

  /** User ID for data filtering */
  userId: string;

  /** Tracking layer type for smart defaults (Story 3.7.3) */
  layer?: LayerType;

  /** Existing markers in this region */
  markers?: BodyMapLocation[];

  /** Callback when returning to full body view */
  onBack: () => void;

  /** Callback when placing a new marker */
  onMarkerPlace?: (regionId: string, coordinates: NormalizedCoordinates, details?: { severity: number; notes: string; timestamp: Date }) => void;

  /** Whether the view is read-only */
  readOnly?: boolean;

  /** Show/hide historical markers initially */
  showHistoricalMarkersDefault?: boolean;

  /** Callback when marker is clicked */
  onMarkerClick?: (markerId: string) => void;

  /** Optional symptom ID - if provided, marker will be saved to database */
  symptomId?: string;

  /** Story 3.7.4: Whether fullscreen mode is active */
  isFullscreen?: boolean;

  /** Story 3.7.4: Callback to exit fullscreen mode */
  onExitFullscreen?: () => void;

  /** Story 3.7.4: Callback when done marking locations (triggers flare creation form) */
  onDoneMarking?: () => void;

  /** Story 3.7.4: Number of markers placed for display in control bar */
  markerCount?: number;
}

export function RegionDetailView({
  regionId,
  viewType,
  userId,
  layer = 'flares', // Default to flares layer for backward compatibility
  markers = [],
  onBack,
  onMarkerPlace,
  readOnly = false,
  showHistoricalMarkersDefault = true,
  onMarkerClick,
  symptomId,
  isFullscreen = false,
  onExitFullscreen,
  onDoneMarking,
  markerCount = 0,
}: RegionDetailViewProps) {
  // State for managing historical markers visibility
  const [showHistoricalMarkers, setShowHistoricalMarkers] = useState(showHistoricalMarkersDefault);

  // State for tracking session markers (new markers placed in this session)
  const [sessionMarkers, setSessionMarkers] = useState<Array<{
    id: string;
    coordinates: NormalizedCoordinates;
    timestamp: Date;
  }>>([]);

  // Reference to the SVG element for coordinate calculations
  const svgRef = useRef<SVGSVGElement>(null);

  // State for the region's bounding box
  const [regionBounds, setRegionBounds] = useState<RegionBounds | null>(null);

  // State for tracking the current marker position during placement
  const [currentMarker, setCurrentMarker] = useState<NormalizedCoordinates | null>(null);

  // Calculate zoom level based on viewport
  const [zoomLevel, setZoomLevel] = useState(1);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, MIN_ZOOM));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Story 3.7.2: Preview workflow state
  const [previewCoordinates, setPreviewCoordinates] = useState<NormalizedCoordinates | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [confirmedCoordinates, setConfirmedCoordinates] = useState<NormalizedCoordinates | null>(null);

  // Story 3.7.5: Historical marker details modal
  const [selectedMarker, setSelectedMarker] = useState<MarkerDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track previous fullscreen state to detect transitions
  const prevFullscreenRef = useRef(isFullscreen);

  // Filter markers for this region (moved earlier for use in callbacks)
  // Story 3.7.5: Use useMemo to ensure stable reference for callback dependencies
  const regionMarkers = useMemo(() =>
    markers.filter(m => m.bodyRegionId === regionId),
    [markers, regionId]
  );

  // Toggle historical markers visibility
  const toggleHistoricalMarkers = useCallback(() => {
    setShowHistoricalMarkers(prev => !prev);
  }, []);

  // Story 3.7.5: Handle historical marker click to show details
  const handleHistoricalMarkerClick = useCallback((marker: BodyMapLocation) => {
    setSelectedMarker({
      id: marker.id,
      severity: marker.severity,
      notes: marker.notes,
      timestamp: marker.createdAt,
      bodyRegionId: marker.bodyRegionId,
      layer: 'flares', // Default layer - could be extended to support multiple layers
      coordinates: marker.coordinates,
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMarker(null);
  }, []);

  // Story 3.7.5 AC 3.7.5.7: Detect if preview marker is near existing markers
  const findNearbyMarkers = useCallback((coords: NormalizedCoordinates | null) => {
    if (!coords || !showHistoricalMarkers) return [];

    const PROXIMITY_THRESHOLD = 0.05; // 5% of region size

    return regionMarkers.filter(marker => {
      if (!marker.coordinates) return false;

      const distance = Math.sqrt(
        Math.pow(marker.coordinates.x - coords.x, 2) +
        Math.pow(marker.coordinates.y - coords.y, 2)
      );

      return distance < PROXIMITY_THRESHOLD;
    });
  }, [regionMarkers, showHistoricalMarkers]);

  // Check for nearby markers when preview changes
  const nearbyMarkers = findNearbyMarkers(previewCoordinates);

  // Story 3.7.2: Preview workflow handlers (must be defined before useEffect that uses them)
  const handleCancelPreview = useCallback(() => {
    setIsPreviewActive(false);
    setPreviewCoordinates(null);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowDetailsForm(false);
    setConfirmedCoordinates(null);
    setIsPreviewActive(false);
    setPreviewCoordinates(null);
  }, []);

  // Story 3.7.4: Clear form state when exiting fullscreen
  // This prevents the full form from appearing after exiting fullscreen
  useEffect(() => {
    const wasFullscreen = prevFullscreenRef.current;

    // Detect transition from fullscreen to non-fullscreen
    if (wasFullscreen && !isFullscreen && showDetailsForm) {
      console.log('Exited fullscreen - clearing form state');
      setShowDetailsForm(false);
      setConfirmedCoordinates(null);
      setPreviewCoordinates(null);
      setIsPreviewActive(false);
    }

    // Update ref for next render
    prevFullscreenRef.current = isFullscreen;
  }, [isFullscreen, showDetailsForm]);

  // Handle ESC key to cancel preview, exit fullscreen, or return to full body view
  // Story 3.7.4: ESC key priority - fullscreen exit takes priority
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Story 3.7.4 AC 3.7.4.5: Exit fullscreen first if active
        if (isFullscreen && onExitFullscreen) {
          onExitFullscreen();
          event.stopPropagation();
        }
        // Story 3.7.2 AC 3.7.2.7: Cancel preview if active
        else if (isPreviewActive) {
          handleCancelPreview();
        } else if (showDetailsForm) {
          handleCancelForm();
        } else {
          onBack();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, isPreviewActive, showDetailsForm, isFullscreen, onExitFullscreen, handleCancelPreview, handleCancelForm]);

  const handleConfirmPreview = useCallback(() => {
    if (previewCoordinates) {
      setConfirmedCoordinates(previewCoordinates);
      setIsPreviewActive(false);

      // Story 3.7.5: Removed SimplifiedMarkerForm to reduce confusion
      // Only show MarkerDetailsForm if symptomId is provided (symptom tracking in normal mode)
      // For flare creation (fullscreen mode), skip form and just drop pins
      if (!isFullscreen && symptomId) {
        // Symptom tracking mode - show full details form
        setShowDetailsForm(true);
      } else {
        // Flare creation or no symptom tracking - just drop the pin
        // Parent context (e.g., flare creation) will handle data collection
        onMarkerPlace?.(regionId, previewCoordinates);
        setCurrentMarker(previewCoordinates);

        // Add to session markers for visual feedback
        const newMarker = {
          id: `session-${Date.now()}`,
          coordinates: previewCoordinates,
          timestamp: new Date(),
        };
        setSessionMarkers(prev => [...prev, newMarker]);

        // Reset preview state
        setPreviewCoordinates(null);
        setConfirmedCoordinates(null);
      }
    }
  }, [previewCoordinates, symptomId, regionId, onMarkerPlace, isFullscreen]);

  const handleFormSubmit = useCallback(async (data: {
    severity: number;
    notes: string;
    timestamp: Date;
  }) => {
    if (confirmedCoordinates) {
      try {
        let markerId: string;

        // Only save to database if symptomId is provided
        // (e.g., for symptom tracking, not flare creation)
        if (symptomId) {
          markerId = await bodyMapLocationRepository.create({
            userId,
            bodyRegionId: regionId,
            symptomId,
            coordinates: {
              x: confirmedCoordinates.x,
              y: confirmedCoordinates.y,
            },
            severity: data.severity,
            notes: data.notes || undefined,
          });
          console.log('Marker saved to database:', markerId);
        } else {
          // No symptomId - just generate a session ID
          // Parent context (e.g., flare creation) will handle persistence
          markerId = `session-${Date.now()}`;
          console.log('Marker created in session (no database save):', markerId);
        }

        // Add to session markers
        const newMarker = {
          id: markerId,
          coordinates: confirmedCoordinates,
          timestamp: data.timestamp,
        };

        setSessionMarkers(prev => {
          const updated = [...prev, newMarker];
          console.log('Session markers updated:', updated.length, 'total markers');
          return updated;
        });
        setCurrentMarker(confirmedCoordinates);

        // Notify parent component with marker details including severity and notes
        onMarkerPlace?.(regionId, confirmedCoordinates, data);

        // Story 3.7.4: Reset ALL form state immediately
        // This ensures the form closes properly in both fullscreen and normal mode
        setShowDetailsForm(false);
        setConfirmedCoordinates(null);
        setPreviewCoordinates(null);
        setIsPreviewActive(false);

        console.log('Form state reset - form should be closed');
      } catch (error) {
        console.error('Failed to save marker:', error);
        alert('Failed to save marker. Please try again.');
      }
    }
  }, [confirmedCoordinates, regionId, userId, symptomId, onMarkerPlace]);

  // Handle coordinate capture for marker placement (Story 3.7.2: Modified for preview workflow)
  // AC 3.7.2.1, 3.7.2.2, 3.7.2.3: Tap shows preview, additional taps move preview
  const handleCoordinateCapture = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly || !svgRef.current) {
        return;
      }

      const svgElement = svgRef.current;
      const point = svgElement.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;

      const ctm = svgElement.getScreenCTM();
      if (!ctm) {
        return;
      }

      const svgPoint = point.matrixTransform(ctm.inverse());

      // For region detail view, normalize coordinates relative to viewBox
      // Since the region fills the viewport, we use the viewBox dimensions
      const viewBox = svgElement.viewBox.baseVal;
      const normalized: NormalizedCoordinates = {
        x: (svgPoint.x - viewBox.x) / viewBox.width,
        y: (svgPoint.y - viewBox.y) / viewBox.height,
      };

      // Clamp to 0-1 range
      normalized.x = Math.max(0, Math.min(1, normalized.x));
      normalized.y = Math.max(0, Math.min(1, normalized.y));

      // Story 3.7.2: Show/update preview marker
      setPreviewCoordinates(normalized);
      setIsPreviewActive(true);

      event.stopPropagation();
    },
    [readOnly]
  );

  // Handle touch events for mobile devices (Story 3.7.2: Modified for preview workflow)
  const handleTouchCoordinateCapture = useCallback(
    (event: React.TouchEvent<SVGSVGElement>) => {
      if (readOnly || !svgRef.current) {
        return;
      }

      event.preventDefault();

      const touch = event.touches[0] || event.changedTouches[0];
      if (!touch) {
        return;
      }

      const svgElement = svgRef.current;
      const point = svgElement.createSVGPoint();
      point.x = touch.clientX;
      point.y = touch.clientY;

      const ctm = svgElement.getScreenCTM();
      if (!ctm) {
        return;
      }

      const svgPoint = point.matrixTransform(ctm.inverse());

      // For region detail view, normalize coordinates relative to viewBox
      const viewBox = svgElement.viewBox.baseVal;
      const normalized: NormalizedCoordinates = {
        x: (svgPoint.x - viewBox.x) / viewBox.width,
        y: (svgPoint.y - viewBox.y) / viewBox.height,
      };

      // Clamp to 0-1 range
      normalized.x = Math.max(0, Math.min(1, normalized.x));
      normalized.y = Math.max(0, Math.min(1, normalized.y));

      // Story 3.7.2: Show/update preview marker
      setPreviewCoordinates(normalized);
      setIsPreviewActive(true);

      event.stopPropagation();
    },
    [readOnly]
  );

  // Get region SVG definition (Task 3.1)
  const regionSVGDef = getRegionSVGDefinition(regionId);
  const regionData = getRegionData(regionId, viewType);

  // Debug: Log session markers at render time (disabled in production)
  // console.log('RegionDetailView render - sessionMarkers:', sessionMarkers.length, 'markers', sessionMarkers);

  // Helper to render the actual region SVG element
  const renderRegionElement = () => {
    if (!regionSVGDef) return null;

    const { elementType, attributes } = regionSVGDef;

    // Common props for all elements
    const commonProps = {
      fill: "#e5e7eb",
      stroke: "#374151",
      strokeWidth: "2",
      fillOpacity: 0.3,
      className: "body-region",
    };

    switch (elementType) {
      case 'ellipse':
        return <ellipse {...attributes} {...commonProps} />;
      case 'rect':
        return <rect {...attributes} {...commonProps} />;
      case 'path':
        return <path {...attributes} {...commonProps} />;
      case 'polygon':
        return <polygon {...attributes} {...commonProps} />;
      case 'circle':
        return <circle {...attributes} {...commonProps} />;
      default:
        return null;
    }
  };

  const regionDetailContent = (
    <div
      className={`${
        isFullscreen
          ? 'flex flex-col'
          : 'relative w-full h-full bg-gray-50 rounded-lg flex flex-col'
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
        backgroundColor: '#f9fafb',
        transform: 'translateZ(0)'
      } : undefined}
      data-fullscreen={isFullscreen ? 'true' : 'false'}
    >
      {/* Story 3.7.4: Fullscreen control bar (replaces normal header when in fullscreen) */}
      {isFullscreen && onExitFullscreen ? (
        <FullScreenControlBar
          onExit={onExitFullscreen}
          onBack={onBack}
          showBackButton={true}
          showHistoryToggle={true}
          historyVisible={showHistoricalMarkers}
          onHistoryToggle={toggleHistoricalMarkers}
          onDoneMarking={onDoneMarking}
          markerCount={markerCount}
        />
      ) : (
        /* Normal header with Back button and controls (when NOT in fullscreen) */
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          {/* Back to Body Map button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors"
            aria-label="Back to Body Map"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Body Map</span>
          </button>

          {/* Zoom and History controls */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg p-1 border border-gray-200">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= MIN_ZOOM}
                className="p-2 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-700"
                aria-label="Zoom out"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-4 py-2 hover:bg-blue-50 rounded transition-colors text-sm font-semibold text-gray-900 min-w-[60px]"
                aria-label="Reset zoom"
                title="Reset Zoom (1x)"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= MAX_ZOOM}
                className="p-2 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-700"
                aria-label="Zoom in"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* Historical markers toggle */}
            <button
              onClick={toggleHistoricalMarkers}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors"
              aria-label={showHistoricalMarkers ? "Hide historical markers" : "Show historical markers"}
              aria-pressed={showHistoricalMarkers}
            >
              {showHistoricalMarkers ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">History</span>
            </button>
          </div>
        </div>
      )}

      {/* Region SVG Container */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <svg
          ref={svgRef}
          viewBox={regionSVGDef?.viewBox || "0 0 100 100"}
          className={`${!readOnly ? 'cursor-crosshair' : ''}`}
          onClick={handleCoordinateCapture}
          onTouchEnd={handleTouchCoordinateCapture}
          preserveAspectRatio="xMidYMid meet"
          aria-label={`${regionId.replace(/-/g, ' ')} region detail view`}
          style={{
            width: '100%',
            height: '100%',
            minWidth: '300px',
            minHeight: '300px',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {/* Task 3.3: Render the isolated region SVG */}
          {renderRegionElement()}

          {/* Story 3.7.5: Render historical markers with enhanced visual distinction */}
          {showHistoricalMarkers && regionMarkers.map(marker => {
            if (!marker.coordinates) return null;

            // Convert normalized coordinates to viewBox coordinates
            const viewBox = regionSVGDef?.viewBox ? regionSVGDef.viewBox.split(' ').map(Number) : [0, 0, 100, 100];
            const x = viewBox[0] + marker.coordinates.x * viewBox[2];
            const y = viewBox[1] + marker.coordinates.y * viewBox[3];

            // AC 3.7.5.3: Calculate age for date indicator
            const ageText = marker.createdAt ? formatDistanceToNow(marker.createdAt, { addSuffix: false }) : '';

            // AC 3.7.5.7: Check if this marker is near the preview position
            const isNearPreview = nearbyMarkers.some(m => m.id === marker.id);

            return (
              <g key={marker.id} className="historical-marker group">
                {/* AC 3.7.5.7: Warning pulse animation for nearby markers */}
                {isNearPreview && (
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="0.8"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* AC 3.7.5.5: Dashed circle border for historical markers */}
                <circle
                  cx={x}
                  cy={y}
                  r="2.5"
                  fill="none"
                  stroke={isNearPreview ? "#fbbf24" : "#9ca3af"}
                  strokeWidth={isNearPreview ? "0.8" : "0.5"}
                  strokeDasharray="1,1"
                  className="pointer-events-none"
                  opacity={isNearPreview ? "1" : "0.7"}
                />

                {/* Main marker circle with reduced opacity */}
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill={isNearPreview ? "#fbbf24" : "#6b7280"}
                  fillOpacity={isNearPreview ? "0.8" : "0.5"}
                  stroke={isNearPreview ? "#f59e0b" : "#4b5563"}
                  strokeWidth="0.4"
                  className="cursor-pointer transition-all hover:fillOpacity-0.8 hover:r-2.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHistoricalMarkerClick(marker);
                  }}
                />

                {/* Severity indicator */}
                <text
                  x={x}
                  y={y - 3.5}
                  textAnchor="middle"
                  fontSize="2.5"
                  fill="#374151"
                  fillOpacity="0.7"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {marker.severity}
                </text>

                {/* AC 3.7.5.3: Date/age indicator tooltip background */}
                <rect
                  x={x - 15}
                  y={y + 3.5}
                  width="30"
                  height="4"
                  rx="1"
                  fill="#374151"
                  fillOpacity="0"
                  className="pointer-events-none group-hover:fillOpacity-0.8 transition-opacity"
                />

                {/* AC 3.7.5.3: Date/age indicator text */}
                <text
                  x={x}
                  y={y + 6.5}
                  textAnchor="middle"
                  fontSize="1.8"
                  fill="#ffffff"
                  fillOpacity="0"
                  className="pointer-events-none group-hover:fillOpacity-1 transition-opacity"
                >
                  {ageText}
                </text>
              </g>
            );
          })}

          {/* Render session markers */}
          {sessionMarkers.map(marker => {
            // Convert normalized coordinates to viewBox coordinates
            const viewBox = regionSVGDef?.viewBox ? regionSVGDef.viewBox.split(' ').map(Number) : [0, 0, 100, 100];
            const x = viewBox[0] + marker.coordinates.x * viewBox[2];
            const y = viewBox[1] + marker.coordinates.y * viewBox[3];

            return (
              <g key={marker.id} className="session-marker">
                <circle
                  cx={x}
                  cy={y}
                  r="2.5"
                  fill="#ef4444"
                  fillOpacity="0.8"
                  stroke="#dc2626"
                  strokeWidth="0.5"
                  className="animate-pulse"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="1"
                  fill="#ffffff"
                />
              </g>
            );
          })}

          {/* Story 3.7.2: Render preview marker with confirm/cancel buttons */}
          <MarkerPreview
            coordinates={previewCoordinates}
            viewBox={regionSVGDef?.viewBox ? regionSVGDef.viewBox.split(' ').map(Number) as [number, number, number, number] : [0, 0, 100, 100]}
            onConfirm={handleConfirmPreview}
            onCancel={handleCancelPreview}
            isActive={isPreviewActive}
          />
        </svg>
      </div>

      {/* Region name display */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm max-w-[90%]">
        <span className="uppercase tracking-wide">
          {regionId.replace(/-/g, ' ')} - Detail View
        </span>
        {(currentMarker || previewCoordinates) && (
          <span className="ml-4 font-mono text-xs">
            x: {(previewCoordinates || currentMarker)!.x.toFixed(2)} y: {(previewCoordinates || currentMarker)!.y.toFixed(2)}
          </span>
        )}
        {isPreviewActive && (
          <span className="ml-4 text-blue-300 text-xs">Preview - Tap to reposition or confirm</span>
        )}
        {/* Story 3.7.5 AC 3.7.5.7: Duplicate prevention warning */}
        {isPreviewActive && nearbyMarkers.length > 0 && (
          <span className="ml-4 text-yellow-300 text-xs font-semibold">
            ⚠️ Near {nearbyMarkers.length} existing marker{nearbyMarkers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Story 3.7.5: Removed SimplifiedMarkerForm - only show full form for symptom tracking */}
      {showDetailsForm && confirmedCoordinates && (
        <MarkerDetailsForm
          coordinates={confirmedCoordinates}
          regionId={regionId}
          layer={layer}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}

      {/* Story 3.7.5: Historical marker details modal (AC 3.7.5.8) */}
      <MarkerDetailsModal
        marker={selectedMarker}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );

  // If in fullscreen mode, use portal to render outside layout
  if (isFullscreen) {
    return typeof window !== 'undefined' ? createPortal(regionDetailContent, document.body) : regionDetailContent;
  }

  return regionDetailContent;
}