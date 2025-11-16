"use client";

import React from "react";
import { FRONT_BODY_REGIONS } from "@/lib/data/bodyRegions";
import { BodyRegion } from "@/lib/types/body-mapping";
import { useBodyMapAccessibility } from "@/lib/hooks/useBodyMapAccessibility";

interface FrontBodyProps {
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

export function FrontBody({
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
}: FrontBodyProps) {
  // Accessibility hook
  const {
    getTabIndex,
    handleRegionKeyDown,
    getAriaLabel,
    setFocusedRegionId,
  } = useBodyMapAccessibility({
    regions: FRONT_BODY_REGIONS,
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
          .body-silhouette {
            fill: #d1d5db;
            stroke: #9ca3af;
            stroke-width: 1;
            opacity: 0.3;
          }
          .body-region {
            stroke: #6b7280;
            stroke-width: 1.5;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .coordinate-mode .body-region {
            cursor: crosshair !important;
          }
          .body-region:hover {
            opacity: 0.9 !important;
            stroke-width: 2.5;
            stroke: #374151;
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

      {/* Subtle body silhouette background */}
      <g className="body-silhouette">
        {/* Head and neck */}
        <ellipse cx="200" cy="60" rx="52" ry="62" />
        <rect x="173" y="108" width="54" height="45" rx="5" />
        
        {/* Torso */}
        <path d="M 165 150 L 120 165 L 95 180 L 80 220 L 85 280 L 95 340 L 120 380 L 145 410 L 145 425 L 140 555 L 145 590 L 148 710 L 150 785 L 165 785 L 169 755 L 188 590 L 200 555 L 212 590 L 231 755 L 235 785 L 250 785 L 252 710 L 255 590 L 260 555 L 255 425 L 255 410 L 280 380 L 305 340 L 315 280 L 320 220 L 305 180 L 280 165 L 235 150 Z" />
        
        {/* Arms */}
        <path d="M 95 180 L 75 195 L 70 325 L 75 455 L 85 495 L 95 520 L 95 195" opacity="0.3" />
        <path d="M 305 180 L 325 195 L 330 325 L 325 455 L 315 495 L 305 520 L 305 195" opacity="0.3" />
      </g>

      {/* Head */}
      <ellipse
        id="head-front"
        cx="200"
        cy="60"
        rx="50"
        ry="60"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS[0])}`}
        fill={getRegionFill(FRONT_BODY_REGIONS[0])}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS[0])}
        tabIndex={getTabIndex("head-front")}
        aria-label={getAriaLabel("head-front")}
        onClick={() => onRegionClick?.("head-front")}
        onMouseEnter={() => onRegionHover?.("head-front")}
        onMouseLeave={() => onRegionHover?.(null)}
        onKeyDown={(e) => handleRegionKeyDown(e, "head-front")}
        onFocus={() => setFocusedRegionId("head-front")}
        onBlur={() => setFocusedRegionId(null)}
      />

      {/* Neck */}
      <rect
        id="neck-front"
        x="175"
        y="110"
        width="50"
        height="40"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS[1])}`}
        fill={getRegionFill(FRONT_BODY_REGIONS[1])}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS[1])}
        tabIndex={getTabIndex("neck-front")}
        aria-label={getAriaLabel("neck-front")}
        onClick={() => onRegionClick?.("neck-front")}
        onMouseEnter={() => onRegionHover?.("neck-front")}
        onMouseLeave={() => onRegionHover?.(null)}
        onKeyDown={(e) => handleRegionKeyDown(e, "neck-front")}
        onFocus={() => setFocusedRegionId("neck-front")}
        onBlur={() => setFocusedRegionId(null)}
      />

      {/* Left Shoulder */}
      <ellipse
        id="shoulder-left"
        cx="120"
        cy="170"
        rx="45"
        ry="35"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "shoulder-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "shoulder-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "shoulder-left")!)}
        {...getAccessibilityProps("shoulder-left")}
        onClick={() => onRegionClick?.("shoulder-left")}
        onMouseEnter={() => onRegionHover?.("shoulder-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Shoulder */}
      <ellipse
        id="shoulder-right"
        cx="280"
        cy="170"
        rx="45"
        ry="35"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "shoulder-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "shoulder-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "shoulder-right")!)}
        onClick={() => onRegionClick?.("shoulder-right")}
        onMouseEnter={() => onRegionHover?.("shoulder-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Armpit */}
      <ellipse
        id="armpit-left"
        cx="145"
        cy="195"
        rx="20"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "armpit-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "armpit-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "armpit-left")!)}
        onClick={() => onRegionClick?.("armpit-left")}
        onMouseEnter={() => onRegionHover?.("armpit-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Armpit */}
      <ellipse
        id="armpit-right"
        cx="255"
        cy="195"
        rx="20"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "armpit-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "armpit-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "armpit-right")!)}
        onClick={() => onRegionClick?.("armpit-right")}
        onMouseEnter={() => onRegionHover?.("armpit-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Chest */}
      <path
        id="chest-left"
        d="M 145 160 Q 145 220 165 250"
        fill="none"
        stroke={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "chest-left")!)}
        strokeWidth="60"
        strokeOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "chest-left")!)}
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "chest-left")!)}`}
        onClick={() => onRegionClick?.("chest-left")}
        onMouseEnter={() => onRegionHover?.("chest-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Chest */}
      <path
        id="chest-right"
        d="M 255 160 Q 255 220 235 250"
        fill="none"
        stroke={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "chest-right")!)}
        strokeWidth="60"
        strokeOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "chest-right")!)}
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "chest-right")!)}`}
        onClick={() => onRegionClick?.("chest-right")}
        onMouseEnter={() => onRegionHover?.("chest-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Under Left Breast */}
      <ellipse
        id="under-breast-left"
        cx="165"
        cy="250"
        rx="30"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "under-breast-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "under-breast-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "under-breast-left")!)}
        onClick={() => onRegionClick?.("under-breast-left")}
        onMouseEnter={() => onRegionHover?.("under-breast-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Under Right Breast */}
      <ellipse
        id="under-breast-right"
        cx="235"
        cy="250"
        rx="30"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "under-breast-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "under-breast-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "under-breast-right")!)}
        onClick={() => onRegionClick?.("under-breast-right")}
        onMouseEnter={() => onRegionHover?.("under-breast-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Upper Abdomen */}
      <rect
        id="abdomen-upper"
        x="165"
        y="265"
        width="70"
        height="60"
        rx="10"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "abdomen-upper")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "abdomen-upper")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "abdomen-upper")!)}
        onClick={() => onRegionClick?.("abdomen-upper")}
        onMouseEnter={() => onRegionHover?.("abdomen-upper")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Lower Abdomen */}
      <rect
        id="abdomen-lower"
        x="165"
        y="325"
        width="70"
        height="60"
        rx="10"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "abdomen-lower")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "abdomen-lower")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "abdomen-lower")!)}
        onClick={() => onRegionClick?.("abdomen-lower")}
        onMouseEnter={() => onRegionHover?.("abdomen-lower")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Groin */}
      <ellipse
        id="left-groin"
        cx="175"
        cy="410"
        rx="22"
        ry="18"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "left-groin")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "left-groin")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "left-groin")!)}
        onClick={() => onRegionClick?.("left-groin")}
        onMouseEnter={() => onRegionHover?.("left-groin")}
        onMouseLeave={() => onRegionHover?.(null)}
        aria-label="Left Groin"
      />

      {/* Center Groin */}
      <ellipse
        id="center-groin"
        cx="200"
        cy="415"
        rx="18"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "center-groin")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "center-groin")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "center-groin")!)}
        onClick={() => onRegionClick?.("center-groin")}
        onMouseEnter={() => onRegionHover?.("center-groin")}
        onMouseLeave={() => onRegionHover?.(null)}
        aria-label="Center Groin"
      />

      {/* Right Groin */}
      <ellipse
        id="right-groin"
        cx="225"
        cy="410"
        rx="22"
        ry="18"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "right-groin")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "right-groin")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "right-groin")!)}
        onClick={() => onRegionClick?.("right-groin")}
        onMouseEnter={() => onRegionHover?.("right-groin")}
        onMouseLeave={() => onRegionHover?.(null)}
        aria-label="Right Groin"
      />

      {/* Left Upper Arm */}
      <rect
        id="upper-arm-left"
        x="75"
        y="195"
        width="40"
        height="120"
        rx="20"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-left")!)}
        {...getAccessibilityProps("upper-arm-left")}
        onClick={() => onRegionClick?.("upper-arm-left")}
        onMouseEnter={() => onRegionHover?.("upper-arm-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Upper Arm */}
      <rect
        id="upper-arm-right"
        x="285"
        y="195"
        width="40"
        height="120"
        rx="20"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-right")!)}
        {...getAccessibilityProps("upper-arm-right")}
        onClick={() => onRegionClick?.("upper-arm-right")}
        onMouseEnter={() => onRegionHover?.("upper-arm-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Elbow */}
      <ellipse
        id="elbow-left"
        cx="95"
        cy="325"
        rx="25"
        ry="20"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "elbow-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "elbow-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "elbow-left")!)}
        onClick={() => onRegionClick?.("elbow-left")}
        onMouseEnter={() => onRegionHover?.("elbow-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Elbow */}
      <ellipse
        id="elbow-right"
        cx="305"
        cy="325"
        rx="25"
        ry="20"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "elbow-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "elbow-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "elbow-right")!)}
        onClick={() => onRegionClick?.("elbow-right")}
        onMouseEnter={() => onRegionHover?.("elbow-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Forearm */}
      <rect
        id="forearm-left"
        x="75"
        y="345"
        width="35"
        height="110"
        rx="17"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "forearm-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "forearm-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "forearm-left")!)}
        onClick={() => onRegionClick?.("forearm-left")}
        onMouseEnter={() => onRegionHover?.("forearm-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Forearm */}
      <rect
        id="forearm-right"
        x="290"
        y="345"
        width="35"
        height="110"
        rx="17"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "forearm-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "forearm-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "forearm-right")!)}
        onClick={() => onRegionClick?.("forearm-right")}
        onMouseEnter={() => onRegionHover?.("forearm-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Wrist */}
      <ellipse
        id="wrist-left"
        cx="92"
        cy="465"
        rx="18"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "wrist-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "wrist-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "wrist-left")!)}
        onClick={() => onRegionClick?.("wrist-left")}
        onMouseEnter={() => onRegionHover?.("wrist-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Wrist */}
      <ellipse
        id="wrist-right"
        cx="308"
        cy="465"
        rx="18"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "wrist-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "wrist-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "wrist-right")!)}
        onClick={() => onRegionClick?.("wrist-right")}
        onMouseEnter={() => onRegionHover?.("wrist-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Hand */}
      <ellipse
        id="hand-left"
        cx="92"
        cy="495"
        rx="20"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "hand-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "hand-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "hand-left")!)}
        onClick={() => onRegionClick?.("hand-left")}
        onMouseEnter={() => onRegionHover?.("hand-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Hand */}
      <ellipse
        id="hand-right"
        cx="308"
        cy="495"
        rx="20"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "hand-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "hand-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "hand-right")!)}
        onClick={() => onRegionClick?.("hand-right")}
        onMouseEnter={() => onRegionHover?.("hand-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Hip */}
      <ellipse
        id="hip-left"
        cx="145"
        cy="385"
        rx="30"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "hip-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "hip-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "hip-left")!)}
        onClick={() => onRegionClick?.("hip-left")}
        onMouseEnter={() => onRegionHover?.("hip-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Hip */}
      <ellipse
        id="hip-right"
        cx="255"
        cy="385"
        rx="30"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "hip-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "hip-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "hip-right")!)}
        onClick={() => onRegionClick?.("hip-right")}
        onMouseEnter={() => onRegionHover?.("hip-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Thigh */}
      <rect
        id="thigh-left"
        x="145"
        y="425"
        width="45"
        height="130"
        rx="22"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "thigh-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "thigh-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "thigh-left")!)}
        onClick={() => onRegionClick?.("thigh-left")}
        onMouseEnter={() => onRegionHover?.("thigh-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Thigh */}
      <rect
        id="thigh-right"
        x="210"
        y="425"
        width="45"
        height="130"
        rx="22"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "thigh-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "thigh-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "thigh-right")!)}
        onClick={() => onRegionClick?.("thigh-right")}
        onMouseEnter={() => onRegionHover?.("thigh-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Inner Thigh */}
      <ellipse
        id="inner-thigh-left"
        cx="190"
        cy="490"
        rx="15"
        ry="50"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "inner-thigh-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "inner-thigh-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "inner-thigh-left")!)}
        onClick={() => onRegionClick?.("inner-thigh-left")}
        onMouseEnter={() => onRegionHover?.("inner-thigh-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Inner Thigh */}
      <ellipse
        id="inner-thigh-right"
        cx="210"
        cy="490"
        rx="15"
        ry="50"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "inner-thigh-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "inner-thigh-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "inner-thigh-right")!)}
        onClick={() => onRegionClick?.("inner-thigh-right")}
        onMouseEnter={() => onRegionHover?.("inner-thigh-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Knee */}
      <ellipse
        id="knee-left"
        cx="167"
        cy="565"
        rx="28"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "knee-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "knee-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "knee-left")!)}
        onClick={() => onRegionClick?.("knee-left")}
        onMouseEnter={() => onRegionHover?.("knee-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Knee */}
      <ellipse
        id="knee-right"
        cx="233"
        cy="565"
        rx="28"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "knee-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "knee-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "knee-right")!)}
        onClick={() => onRegionClick?.("knee-right")}
        onMouseEnter={() => onRegionHover?.("knee-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Calf */}
      <rect
        id="calf-left"
        x="150"
        y="590"
        width="38"
        height="120"
        rx="19"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "calf-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "calf-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "calf-left")!)}
        onClick={() => onRegionClick?.("calf-left")}
        onMouseEnter={() => onRegionHover?.("calf-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Calf */}
      <rect
        id="calf-right"
        x="212"
        y="590"
        width="38"
        height="120"
        rx="19"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "calf-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "calf-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "calf-right")!)}
        onClick={() => onRegionClick?.("calf-right")}
        onMouseEnter={() => onRegionHover?.("calf-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Ankle */}
      <ellipse
        id="ankle-left"
        cx="169"
        cy="720"
        rx="20"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "ankle-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "ankle-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "ankle-left")!)}
        onClick={() => onRegionClick?.("ankle-left")}
        onMouseEnter={() => onRegionHover?.("ankle-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Ankle */}
      <ellipse
        id="ankle-right"
        cx="231"
        cy="720"
        rx="20"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "ankle-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "ankle-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "ankle-right")!)}
        onClick={() => onRegionClick?.("ankle-right")}
        onMouseEnter={() => onRegionHover?.("ankle-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Foot */}
      <ellipse
        id="foot-left"
        cx="169"
        cy="755"
        rx="22"
        ry="30"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "foot-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "foot-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "foot-left")!)}
        onClick={() => onRegionClick?.("foot-left")}
        onMouseEnter={() => onRegionHover?.("foot-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Foot */}
      <ellipse
        id="foot-right"
        cx="231"
        cy="755"
        rx="22"
        ry="30"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find((r) => r.id === "foot-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "foot-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "foot-right")!)}
        onClick={() => onRegionClick?.("foot-right")}
        onMouseEnter={() => onRegionHover?.("foot-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {flareOverlay}
      {coordinateMarker}
    </svg>
  );
}
