"use client";

import React, { useState, useRef, useCallback } from "react";
import { BodyRegionSelector } from "./BodyRegionSelector";
import { ZoomPanControls } from "./ZoomPanControls";
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
}: BodyMapViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate severity by region for visualization
  const severityByRegion = symptoms.reduce(
    (acc, symptom) => {
      if (!acc[symptom.bodyRegionId] || symptom.severity > acc[symptom.bodyRegionId]) {
        acc[symptom.bodyRegionId] = symptom.severity;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or Shift+Left click
      e.preventDefault();
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom gesture detected
      e.preventDefault();
    }
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* Zoom/Pan Controls */}
      <ZoomPanControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
      />

      {/* Body Map Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.2s ease-out",
            width: "100%",
            height: "100%",
          }}
        >
          <BodyRegionSelector
            view={view}
            selectedRegions={selectedRegion ? [selectedRegion] : []}
            onRegionSelect={onRegionSelect}
            multiSelect={multiSelect}
            severityByRegion={severityByRegion}
          />
        </div>
      </div>

      {/* Instructions */}
      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
          <div className="flex items-center gap-4">
            <span>Click region to select</span>
            <span className="text-gray-400">|</span>
            <span>Scroll to zoom</span>
            <span className="text-gray-400">|</span>
            <span>Shift+Drag to pan</span>
          </div>
        </div>
      )}
    </div>
  );
}
