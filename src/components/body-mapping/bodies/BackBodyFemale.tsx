"use client";

import React from "react";
import { BACK_BODY_REGIONS } from "@/lib/data/bodyRegions";
import { BodyRegion } from "@/lib/types/body-mapping";
import { useBodyMapAccessibility } from "@/lib/hooks/useBodyMapAccessibility";
import { SimplifiedFemaleBody } from "./SimplifiedFemaleBody";

interface BackBodyFemaleProps {
  selectedRegions?: string[];
  highlightedRegion?: string;
  onRegionClick?: (regionId: string) => void;
  onRegionHover?: (regionId: string | null) => void;
  severityByRegion?: Record<string, number>;
  flareRegions?: string[];
  onCoordinateCapture?: (event: React.MouseEvent<SVGSVGElement>) => void;
  onTouchCoordinateCapture?: (event: React.TouchEvent<SVGSVGElement>) => void;
  coordinateCursorActive?: boolean;
  coordinateMarker?: React.ReactNode;
  flareOverlay?: React.ReactNode;
  userId: string;
  zoomLevel?: number;
  isZoomed?: boolean;
  onCoordinateMark?: (regionId: string, coordinates: { x: number; y: number }) => void;
}

export function BackBodyFemale({
  selectedRegions = [],
  highlightedRegion,
  onRegionClick,
  onRegionHover,
  severityByRegion = {},
  flareRegions = [],
  onCoordinateCapture,
  onTouchCoordinateCapture,
  coordinateCursorActive = false,
  coordinateMarker,
  flareOverlay,
  userId,
  zoomLevel = 1,
  isZoomed = false,
  onCoordinateMark,
}: BackBodyFemaleProps) {
  const {
    getTabIndex,
    handleRegionKeyDown,
    getAriaLabel,
    setFocusedRegionId,
  } = useBodyMapAccessibility({
    regions: BACK_BODY_REGIONS,
    selectedRegion: selectedRegions[0],
    onRegionSelect: onRegionClick,
    onCoordinateMark,
    zoomLevel,
    isZoomed,
    userId,
  });

  const getSeverityColor = (severity: number): string => {
    if (severity >= 9) return "#FCA5A5";
    if (severity >= 7) return "#FBBF24";
    if (severity >= 4) return "#FDE047";
    return "#86EFAC";
  };

  const getRegionFill = (region: BodyRegion): string => {
    const severity = severityByRegion[region.id];
    if (severity) return getSeverityColor(severity);
    if (selectedRegions.includes(region.id)) return "#0F9D91";
    if (highlightedRegion === region.id) return "#E0F5F3";
    return "transparent";
  };

  const getRegionOpacity = (region: BodyRegion): number => {
    const isFlare = flareRegions.includes(region.id);
    const severity = severityByRegion[region.id];

    if (isFlare) return 0.9;
    if (severity) return 0.8;
    if (selectedRegions.includes(region.id)) return 0.6;
    if (highlightedRegion === region.id) return 0.5;
    return 0.3;
  };

  const getRegionClassName = (region: BodyRegion): string => {
    const isFlare = flareRegions.includes(region.id);
    return isFlare ? "flare-pulse" : "";
  };

  const getAccessibilityProps = (regionId: string) => ({
    tabIndex: getTabIndex(regionId),
    "aria-label": getAriaLabel(regionId),
    onKeyDown: (e: React.KeyboardEvent) => handleRegionKeyDown(e, regionId),
    onFocus: () => setFocusedRegionId(regionId),
    onBlur: () => setFocusedRegionId(null),
  });

  return (
    <svg
      viewBox="0 0 400 800"
      className={coordinateCursorActive ? "coordinate-mode" : ""}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      width="400"
      height="800"
      onClickCapture={onCoordinateCapture}
      onTouchStart={onTouchCoordinateCapture}
      role="application"
      aria-label="Interactive female body map for flare tracking - back view"
    >
      <defs>
        <style>{`
          .body-region {
            stroke: #0F9D91;
            stroke-width: 2;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .coordinate-mode .body-region {
            cursor: crosshair !important;
          }
          .body-region:hover {
            opacity: 0.8 !important;
            stroke: #0F9D91;
            stroke-width: 3;
          }
          @keyframes flare-pulse {
            0%, 100% {
              opacity: 0.9;
              filter: drop-shadow(0 0 3px rgba(252, 165, 165, 0.6));
            }
            50% {
              opacity: 1;
              filter: drop-shadow(0 0 6px rgba(252, 165, 165, 0.8));
            }
          }
          .flare-pulse {
            animation: flare-pulse 2s ease-in-out infinite;
            stroke: #F87171;
            stroke-width: 2;
          }
          .body-region:focus-visible {
            outline: 2px solid #0F9D91;
            outline-offset: 2px;
            stroke-width: 2.5;
            box-shadow: 0 0 0 4px rgba(15, 157, 145, 0.2);
          }
          @media (prefers-contrast: high) {
            .body-region:focus-visible {
              outline: 3px solid #0A7A70;
              outline-offset: 1px;
            }
          }
          .base-illustration {
            pointer-events: none;
            opacity: 1;
          }
          .base-illustration path {
            stroke: #44403C;
            stroke-width: 2;
            fill: none;
          }
        `}</style>
      </defs>

      {/* Professional illustration base layer */}
      <SimplifiedFemaleBody view="back" className="base-illustration" />

      {/* Clickable region overlays */}

      {/* Head */}
      <ellipse
        id="head-back"
        cx="200"
        cy="60"
        rx="50"
        ry="60"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS[0])}`}
        fill={getRegionFill(BACK_BODY_REGIONS[0])}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS[0])}
        {...getAccessibilityProps("head-back")}
        onClick={() => onRegionClick?.("head-back")}
        onMouseEnter={() => onRegionHover?.("head-back")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Neck */}
      <rect
        id="neck-back"
        x="175"
        y="110"
        width="50"
        height="40"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS[1])}`}
        fill={getRegionFill(BACK_BODY_REGIONS[1])}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS[1])}
        {...getAccessibilityProps("neck-back")}
        onClick={() => onRegionClick?.("neck-back")}
        onMouseEnter={() => onRegionHover?.("neck-back")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Shoulders */}
      <ellipse
        id="shoulder-back-left"
        cx="120"
        cy="170"
        rx="45"
        ry="35"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "shoulder-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "shoulder-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "shoulder-back-left")!)}
        {...getAccessibilityProps("shoulder-back-left")}
        onClick={() => onRegionClick?.("shoulder-back-left")}
        onMouseEnter={() => onRegionHover?.("shoulder-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="shoulder-back-right"
        cx="280"
        cy="170"
        rx="45"
        ry="35"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "shoulder-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "shoulder-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "shoulder-back-right")!)}
        {...getAccessibilityProps("shoulder-back-right")}
        onClick={() => onRegionClick?.("shoulder-back-right")}
        onMouseEnter={() => onRegionHover?.("shoulder-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Upper Back */}
      <rect
        id="upper-back-left"
        x="145"
        y="160"
        width="55"
        height="90"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "upper-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "upper-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "upper-back-left")!)}
        {...getAccessibilityProps("upper-back-left")}
        onClick={() => onRegionClick?.("upper-back-left")}
        onMouseEnter={() => onRegionHover?.("upper-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <rect
        id="upper-back-right"
        x="200"
        y="160"
        width="55"
        height="90"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "upper-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "upper-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "upper-back-right")!)}
        {...getAccessibilityProps("upper-back-right")}
        onClick={() => onRegionClick?.("upper-back-right")}
        onMouseEnter={() => onRegionHover?.("upper-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Mid Back */}
      <rect
        id="mid-back-left"
        x="145"
        y="250"
        width="55"
        height="80"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "mid-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "mid-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "mid-back-left")!)}
        {...getAccessibilityProps("mid-back-left")}
        onClick={() => onRegionClick?.("mid-back-left")}
        onMouseEnter={() => onRegionHover?.("mid-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <rect
        id="mid-back-right"
        x="200"
        y="250"
        width="55"
        height="80"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "mid-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "mid-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "mid-back-right")!)}
        {...getAccessibilityProps("mid-back-right")}
        onClick={() => onRegionClick?.("mid-back-right")}
        onMouseEnter={() => onRegionHover?.("mid-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Lower Back */}
      <rect
        id="lower-back"
        x="155"
        y="330"
        width="90"
        height="60"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "lower-back")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "lower-back")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "lower-back")!)}
        {...getAccessibilityProps("lower-back")}
        onClick={() => onRegionClick?.("lower-back")}
        onMouseEnter={() => onRegionHover?.("lower-back")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* HS-Critical: Buttocks */}
      <ellipse
        id="buttocks-left"
        cx="170"
        cy="415"
        rx="35"
        ry="40"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "buttocks-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "buttocks-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "buttocks-left")!)}
        {...getAccessibilityProps("buttocks-left")}
        onClick={() => onRegionClick?.("buttocks-left")}
        onMouseEnter={() => onRegionHover?.("buttocks-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="buttocks-right"
        cx="230"
        cy="415"
        rx="35"
        ry="40"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "buttocks-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "buttocks-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "buttocks-right")!)}
        {...getAccessibilityProps("buttocks-right")}
        onClick={() => onRegionClick?.("buttocks-right")}
        onMouseEnter={() => onRegionHover?.("buttocks-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Arms - Back */}
      <rect
        id="upper-arm-back-left"
        x="75"
        y="195"
        width="40"
        height="120"
        rx="20"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "upper-arm-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "upper-arm-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "upper-arm-back-left")!)}
        {...getAccessibilityProps("upper-arm-back-left")}
        onClick={() => onRegionClick?.("upper-arm-back-left")}
        onMouseEnter={() => onRegionHover?.("upper-arm-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <rect
        id="upper-arm-back-right"
        x="285"
        y="195"
        width="40"
        height="120"
        rx="20"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find(r => r.id === "upper-arm-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find(r => r.id === "upper-arm-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find(r => r.id === "upper-arm-back-right")!)}
        {...getAccessibilityProps("upper-arm-back-right")}
        onClick={() => onRegionClick?.("upper-arm-back-right")}
        onMouseEnter={() => onRegionHover?.("upper-arm-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Note: Additional body parts (legs, etc.) would follow same pattern */}

      {/* Flare overlay and coordinate marker on top */}
      {flareOverlay}
      {coordinateMarker}
    </svg>
  );
}
