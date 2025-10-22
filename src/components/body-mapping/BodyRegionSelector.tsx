"use client";

import React, { useState } from "react";
import { FrontBody } from "./bodies/FrontBody";
import { BackBody } from "./bodies/BackBody";
import { getRegionsForView } from "@/lib/data/bodyRegions";

interface BodyRegionSelectorProps {
  view: "front" | "back" | "left" | "right";
  selectedRegions?: string[];
  onRegionSelect: (regionId: string) => void;
  multiSelect?: boolean;
  severityByRegion?: Record<string, number>;
  flareRegions?: string[];
  onCoordinateCapture?: (event: React.MouseEvent<SVGSVGElement>) => void;
  coordinateCursorActive?: boolean;
  coordinateMarker?: React.ReactNode;
  flareOverlay?: React.ReactNode;
  // Accessibility props
  userId: string;
  zoomLevel?: number;
  isZoomed?: boolean;
  onCoordinateMark?: (regionId: string, coordinates: { x: number; y: number }) => void;
}

export function BodyRegionSelector({
  view,
  selectedRegions = [],
  onRegionSelect,
  multiSelect = false,
  severityByRegion = {},
  flareRegions = [],
  onCoordinateCapture,
  coordinateCursorActive = false,
  coordinateMarker,
  flareOverlay,
  userId,
  zoomLevel = 1,
  isZoomed = false,
  onCoordinateMark,
}: BodyRegionSelectorProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const regions = getRegionsForView(view);
  const hoveredRegionData = regions.find((r) => r.id === hoveredRegion);

  const handleRegionClick = (regionId: string) => {
    if (multiSelect) {
      // In multi-select mode, toggle selection
      onRegionSelect(regionId);
    } else {
      // In single-select mode, replace selection
      onRegionSelect(regionId);
    }
  };

  const handleRegionHover = (regionId: string | null) => {
    setHoveredRegion(regionId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className={`relative w-full h-full ${coordinateCursorActive ? "cursor-crosshair" : ""}`}
      onMouseMove={handleMouseMove}
    >
      {/* Body SVG */}
      <div className="w-full h-full flex items-center justify-center">
        {view === "front" && (
          <FrontBody
            selectedRegions={selectedRegions}
            highlightedRegion={hoveredRegion || undefined}
            onRegionClick={handleRegionClick}
            onRegionHover={handleRegionHover}
            severityByRegion={severityByRegion}
            flareRegions={flareRegions}
            onCoordinateCapture={onCoordinateCapture}
            coordinateCursorActive={coordinateCursorActive}
            coordinateMarker={coordinateMarker}
            flareOverlay={flareOverlay}
            userId={userId}
            zoomLevel={zoomLevel}
            isZoomed={isZoomed}
            onCoordinateMark={onCoordinateMark}
          />
        )}
        {view === "back" && (
          <BackBody
            selectedRegions={selectedRegions}
            highlightedRegion={hoveredRegion || undefined}
            onRegionClick={handleRegionClick}
            onRegionHover={handleRegionHover}
            severityByRegion={severityByRegion}
            flareRegions={flareRegions}
            onCoordinateCapture={onCoordinateCapture}
            coordinateCursorActive={coordinateCursorActive}
            coordinateMarker={coordinateMarker}
            flareOverlay={flareOverlay}
            userId={userId}
            zoomLevel={zoomLevel}
            isZoomed={isZoomed}
            onCoordinateMark={onCoordinateMark}
          />
        )}
        {(view === "left" || view === "right") && (
          <FrontBody
            selectedRegions={selectedRegions}
            highlightedRegion={hoveredRegion || undefined}
            onRegionClick={handleRegionClick}
            onRegionHover={handleRegionHover}
            severityByRegion={severityByRegion}
            flareRegions={flareRegions}
            onCoordinateCapture={onCoordinateCapture}
            coordinateCursorActive={coordinateCursorActive}
            coordinateMarker={coordinateMarker}
            flareOverlay={flareOverlay}
            userId={userId}
            zoomLevel={zoomLevel}
            isZoomed={isZoomed}
            onCoordinateMark={onCoordinateMark}
          />
        )}
      </div>

      {/* Tooltip */}
      {hoveredRegionData && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
        >
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
            <div className="font-semibold">{hoveredRegionData.name}</div>
            {severityByRegion[hoveredRegionData.id] && (
              <div className="text-sm text-gray-300">
                Severity: {severityByRegion[hoveredRegionData.id]}/10
              </div>
            )}
            {hoveredRegionData.commonSymptoms &&
              hoveredRegionData.commonSymptoms.length > 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  Common: {hoveredRegionData.commonSymptoms.join(", ")}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
