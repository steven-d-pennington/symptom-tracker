"use client";

import React from "react";
import { BACK_BODY_REGIONS } from "@/lib/data/bodyRegions";
import { BodyRegion } from "@/lib/types/body-mapping";
import { useBodyMapAccessibility } from "@/lib/hooks/useBodyMapAccessibility";

interface BackBodyProps {
  selectedRegions?: string[];
  highlightedRegion?: string;
  onRegionClick?: (regionId: string) => void;
  onRegionHover?: (regionId: string | null) => void;
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

export function BackBody({
  selectedRegions = [],
  highlightedRegion,
  onRegionClick,
  onRegionHover,
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
}: BackBodyProps) {
  // Accessibility hook
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
    // Story 2.3 AC2.3.2: red 9-10, orange 7-8, yellow 4-6, green 1-3
    if (severity >= 9) return "#ef4444"; // red-500
    if (severity >= 7) return "#f97316"; // orange-500
    if (severity >= 4) return "#eab308"; // yellow-500
    return "#22c55e"; // green-500
  };

  const getRegionFill = (region: BodyRegion): string => {
    const isFlare = flareRegions.includes(region.id);
    const severity = severityByRegion[region.id];

    // Use severity-based coloring for both flares and symptoms
    if (severity) return getSeverityColor(severity);
    if (selectedRegions.includes(region.id)) return "#3b82f6";
    if (highlightedRegion === region.id) return "#60a5fa";
    return "#e5e7eb";
  };

  const getRegionOpacity = (region: BodyRegion): number => {
    const isFlare = flareRegions.includes(region.id);
    const severity = severityByRegion[region.id];

    // Flares are more opaque and prominent
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

  // Helper function for accessibility props
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
      className={`w-full h-full ${coordinateCursorActive ? "coordinate-mode" : ""}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      onClickCapture={onCoordinateCapture}
      role="application"
      aria-label="Interactive body map for flare tracking"
    >
      <defs>
        <style>{`
          .body-region {
            stroke: #374151;
            stroke-width: 2;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .coordinate-mode .body-region {
            cursor: crosshair !important;
          }
          .body-region:hover {
            opacity: 0.8 !important;
            stroke-width: 3;
          }
          @keyframes flare-pulse {
            0%, 100% {
              opacity: 0.9;
              filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
            }
            50% {
              opacity: 1;
              filter: drop-shadow(0 0 8px rgba(239, 68, 68, 1));
            }
          }
          .flare-pulse {
            animation: flare-pulse 2s ease-in-out infinite;
            stroke: #dc2626;
            stroke-width: 3;
          }

          /* Accessibility focus styles */
          .body-region:focus-visible {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
            stroke-width: 4;
          }

          /* High contrast focus for better visibility */
          @media (prefers-contrast: high) {
            .body-region:focus-visible {
              outline: 3px solid #ffffff;
              outline-offset: 1px;
            }
          }
        `}</style>
      </defs>

      {/* Back of Head */}
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

      {/* Back of Neck */}
      <rect
        id="neck-back"
        x="175"
        y="110"
        width="50"
        height="40"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS[1])}`}
        fill={getRegionFill(BACK_BODY_REGIONS[1])}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS[1])}
        onClick={() => onRegionClick?.("neck-back")}
        onMouseEnter={() => onRegionHover?.("neck-back")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Left Shoulder */}
      <ellipse
        id="shoulder-back-left"
        cx="120"
        cy="170"
        rx="45"
        ry="35"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "shoulder-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "shoulder-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "shoulder-back-left")!)}
        onClick={() => onRegionClick?.("shoulder-back-left")}
        onMouseEnter={() => onRegionHover?.("shoulder-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Right Shoulder */}
      <ellipse
        id="shoulder-back-right"
        cx="280"
        cy="170"
        rx="45"
        ry="35"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "shoulder-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "shoulder-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "shoulder-back-right")!)}
        onClick={() => onRegionClick?.("shoulder-back-right")}
        onMouseEnter={() => onRegionHover?.("shoulder-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Upper Back */}
      <rect
        id="upper-back-left"
        x="145"
        y="160"
        width="55"
        height="90"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "upper-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "upper-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "upper-back-left")!)}
        onClick={() => onRegionClick?.("upper-back-left")}
        onMouseEnter={() => onRegionHover?.("upper-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Upper Back */}
      <rect
        id="upper-back-right"
        x="200"
        y="160"
        width="55"
        height="90"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "upper-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "upper-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "upper-back-right")!)}
        onClick={() => onRegionClick?.("upper-back-right")}
        onMouseEnter={() => onRegionHover?.("upper-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Mid Back */}
      <rect
        id="mid-back-left"
        x="145"
        y="250"
        width="55"
        height="80"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "mid-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "mid-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "mid-back-left")!)}
        onClick={() => onRegionClick?.("mid-back-left")}
        onMouseEnter={() => onRegionHover?.("mid-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Mid Back */}
      <rect
        id="mid-back-right"
        x="200"
        y="250"
        width="55"
        height="80"
        rx="10"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "mid-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "mid-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "mid-back-right")!)}
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
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "lower-back")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "lower-back")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "lower-back")!)}
        onClick={() => onRegionClick?.("lower-back")}
        onMouseEnter={() => onRegionHover?.("lower-back")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Buttock */}
      <ellipse
        id="buttocks-left"
        cx="170"
        cy="415"
        rx="35"
        ry="40"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "buttocks-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "buttocks-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "buttocks-left")!)}
        onClick={() => onRegionClick?.("buttocks-left")}
        onMouseEnter={() => onRegionHover?.("buttocks-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Buttock */}
      <ellipse
        id="buttocks-right"
        cx="230"
        cy="415"
        rx="35"
        ry="40"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "buttocks-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "buttocks-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "buttocks-right")!)}
        onClick={() => onRegionClick?.("buttocks-right")}
        onMouseEnter={() => onRegionHover?.("buttocks-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Left Upper Arm */}
      <rect
        id="upper-arm-back-left"
        x="75"
        y="195"
        width="40"
        height="120"
        rx="20"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "upper-arm-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "upper-arm-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "upper-arm-back-left")!)}
        onClick={() => onRegionClick?.("upper-arm-back-left")}
        onMouseEnter={() => onRegionHover?.("upper-arm-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Right Upper Arm */}
      <rect
        id="upper-arm-back-right"
        x="285"
        y="195"
        width="40"
        height="120"
        rx="20"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "upper-arm-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "upper-arm-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "upper-arm-back-right")!)}
        onClick={() => onRegionClick?.("upper-arm-back-right")}
        onMouseEnter={() => onRegionHover?.("upper-arm-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Left Elbow */}
      <ellipse
        id="elbow-back-left"
        cx="95"
        cy="325"
        rx="25"
        ry="20"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "elbow-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "elbow-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "elbow-back-left")!)}
        onClick={() => onRegionClick?.("elbow-back-left")}
        onMouseEnter={() => onRegionHover?.("elbow-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Right Elbow */}
      <ellipse
        id="elbow-back-right"
        cx="305"
        cy="325"
        rx="25"
        ry="20"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "elbow-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "elbow-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "elbow-back-right")!)}
        onClick={() => onRegionClick?.("elbow-back-right")}
        onMouseEnter={() => onRegionHover?.("elbow-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Left Forearm */}
      <rect
        id="forearm-back-left"
        x="75"
        y="345"
        width="35"
        height="110"
        rx="17"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "forearm-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "forearm-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "forearm-back-left")!)}
        onClick={() => onRegionClick?.("forearm-back-left")}
        onMouseEnter={() => onRegionHover?.("forearm-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Right Forearm */}
      <rect
        id="forearm-back-right"
        x="290"
        y="345"
        width="35"
        height="110"
        rx="17"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "forearm-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "forearm-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "forearm-back-right")!)}
        onClick={() => onRegionClick?.("forearm-back-right")}
        onMouseEnter={() => onRegionHover?.("forearm-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Left Thigh */}
      <rect
        id="thigh-back-left"
        x="145"
        y="455"
        width="45"
        height="130"
        rx="22"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "thigh-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "thigh-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "thigh-back-left")!)}
        onClick={() => onRegionClick?.("thigh-back-left")}
        onMouseEnter={() => onRegionHover?.("thigh-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Right Thigh */}
      <rect
        id="thigh-back-right"
        x="210"
        y="455"
        width="45"
        height="130"
        rx="22"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "thigh-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "thigh-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "thigh-back-right")!)}
        onClick={() => onRegionClick?.("thigh-back-right")}
        onMouseEnter={() => onRegionHover?.("thigh-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Left Knee */}
      <ellipse
        id="knee-back-left"
        cx="167"
        cy="595"
        rx="28"
        ry="25"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "knee-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "knee-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "knee-back-left")!)}
        onClick={() => onRegionClick?.("knee-back-left")}
        onMouseEnter={() => onRegionHover?.("knee-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Right Knee */}
      <ellipse
        id="knee-back-right"
        cx="233"
        cy="595"
        rx="28"
        ry="25"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "knee-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "knee-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "knee-back-right")!)}
        onClick={() => onRegionClick?.("knee-back-right")}
        onMouseEnter={() => onRegionHover?.("knee-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Left Calf */}
      <rect
        id="calf-back-left"
        x="150"
        y="620"
        width="38"
        height="120"
        rx="19"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "calf-back-left")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "calf-back-left")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "calf-back-left")!)}
        onClick={() => onRegionClick?.("calf-back-left")}
        onMouseEnter={() => onRegionHover?.("calf-back-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Back of Right Calf */}
      <rect
        id="calf-back-right"
        x="212"
        y="620"
        width="38"
        height="120"
        rx="19"
        className={`body-region ${getRegionClassName(BACK_BODY_REGIONS.find((r) => r.id === "calf-back-right")!)}`}
        fill={getRegionFill(BACK_BODY_REGIONS.find((r) => r.id === "calf-back-right")!)}
        fillOpacity={getRegionOpacity(BACK_BODY_REGIONS.find((r) => r.id === "calf-back-right")!)}
        onClick={() => onRegionClick?.("calf-back-right")}
        onMouseEnter={() => onRegionHover?.("calf-back-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {flareOverlay}
      {coordinateMarker}
    </svg>
  );
}
