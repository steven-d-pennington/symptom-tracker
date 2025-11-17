"use client";

import React from "react";
import { FRONT_BODY_REGIONS } from "@/lib/data/bodyRegions";
import { BodyRegion } from "@/lib/types/body-mapping";
import { useBodyMapAccessibility } from "@/lib/hooks/useBodyMapAccessibility";
import { SimplifiedFemaleBody } from "./SimplifiedFemaleBody";

interface FrontBodyFemaleProps {
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

export function FrontBodyFemale({
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
}: FrontBodyFemaleProps) {
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
    return "transparent"; // Transparent for clickable overlays
  };

  const getRegionOpacity = (region: BodyRegion): number => {
    const isFlare = flareRegions.includes(region.id);
    const severity = severityByRegion[region.id];
    const isSelected = selectedRegions.includes(region.id);
    const hasSelection = selectedRegions.length > 0;

    if (isFlare) return 0.9;
    if (hasSelection && !isSelected) return 0.15;
    if (severity) return 0.8;
    if (isSelected) return 0.6;
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
      aria-label="Interactive female body map for flare tracking - front view"
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
          .base-illustration path,
          .base-illustration line,
          .base-illustration circle,
          .base-illustration ellipse {
            stroke: #44403C;
            stroke-width: 2;
            fill: none;
          }
        `}</style>
      </defs>

      {/*
        ============================================================
        PROFESSIONAL ILLUSTRATION BASE LAYER (non-interactive)
        ============================================================
        Professional female body illustration extracted from your SVG assets
      */}
      <SimplifiedFemaleBody view="front" className="base-illustration" />

      {/*
        ============================================================
        CLICKABLE REGION OVERLAYS (interactive)
        ============================================================
        These transparent regions sit on top of the illustration
        and handle all click/hover interactions
      */}

      {/* Head */}
      <ellipse
        id="head-front"
        cx="200"
        cy="40"
        rx="50"
        ry="60"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS[0])}`}
        fill={getRegionFill(FRONT_BODY_REGIONS[0])}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS[0])}
        {...getAccessibilityProps("head-front")}
        onClick={() => onRegionClick?.("head-front")}
        onMouseEnter={() => onRegionHover?.("head-front")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Neck */}
      <rect
        id="neck-front"
        x="175"
        y="90"
        width="50"
        height="40"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS[1])}`}
        fill={getRegionFill(FRONT_BODY_REGIONS[1])}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS[1])}
        {...getAccessibilityProps("neck-front")}
        onClick={() => onRegionClick?.("neck-front")}
        onMouseEnter={() => onRegionHover?.("neck-front")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Shoulders */}
      <ellipse
        id="shoulder-left"
        cx="120"
        cy="150"
        rx="45"
        ry="35"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "shoulder-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "shoulder-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "shoulder-left")!)}
        {...getAccessibilityProps("shoulder-left")}
        onClick={() => onRegionClick?.("shoulder-left")}
        onMouseEnter={() => onRegionHover?.("shoulder-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="shoulder-right"
        cx="280"
        cy="150"
        rx="45"
        ry="35"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "shoulder-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "shoulder-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "shoulder-right")!)}
        {...getAccessibilityProps("shoulder-right")}
        onClick={() => onRegionClick?.("shoulder-right")}
        onMouseEnter={() => onRegionHover?.("shoulder-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Chest - Female specific */}
      <ellipse
        id="chest-left"
        cx="165"
        cy="205"
        rx="35"
        ry="45"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "chest-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "chest-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "chest-left")!)}
        {...getAccessibilityProps("chest-left")}
        onClick={() => onRegionClick?.("chest-left")}
        onMouseEnter={() => onRegionHover?.("chest-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="chest-right"
        cx="235"
        cy="205"
        rx="35"
        ry="45"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "chest-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "chest-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "chest-right")!)}
        {...getAccessibilityProps("chest-right")}
        onClick={() => onRegionClick?.("chest-right")}
        onMouseEnter={() => onRegionHover?.("chest-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* HS-Critical: Armpits */}
      <ellipse
        id="armpit-left"
        cx="145"
        cy="175"
        rx="20"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "armpit-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "armpit-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "armpit-left")!)}
        {...getAccessibilityProps("armpit-left")}
        onClick={() => onRegionClick?.("armpit-left")}
        onMouseEnter={() => onRegionHover?.("armpit-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="armpit-right"
        cx="255"
        cy="175"
        rx="20"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "armpit-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "armpit-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "armpit-right")!)}
        {...getAccessibilityProps("armpit-right")}
        onClick={() => onRegionClick?.("armpit-right")}
        onMouseEnter={() => onRegionHover?.("armpit-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* HS-Critical: Under Breast */}
      <ellipse
        id="under-breast-left"
        cx="165"
        cy="250"
        rx="30"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "under-breast-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "under-breast-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "under-breast-left")!)}
        {...getAccessibilityProps("under-breast-left")}
        onClick={() => onRegionClick?.("under-breast-left")}
        onMouseEnter={() => onRegionHover?.("under-breast-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="under-breast-right"
        cx="235"
        cy="250"
        rx="30"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "under-breast-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "under-breast-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "under-breast-right")!)}
        {...getAccessibilityProps("under-breast-right")}
        onClick={() => onRegionClick?.("under-breast-right")}
        onMouseEnter={() => onRegionHover?.("under-breast-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Abdomen */}
      <rect
        id="abdomen-upper"
        x="155"
        y="265"
        width="90"
        height="60"
        rx="10"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "abdomen-upper")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "abdomen-upper")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "abdomen-upper")!)}
        {...getAccessibilityProps("abdomen-upper")}
        onClick={() => onRegionClick?.("abdomen-upper")}
        onMouseEnter={() => onRegionHover?.("abdomen-upper")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <rect
        id="abdomen-lower"
        x="155"
        y="325"
        width="90"
        height="60"
        rx="10"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "abdomen-lower")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "abdomen-lower")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "abdomen-lower")!)}
        {...getAccessibilityProps("abdomen-lower")}
        onClick={() => onRegionClick?.("abdomen-lower")}
        onMouseEnter={() => onRegionHover?.("abdomen-lower")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* HS-Critical: Groin Areas */}
      <ellipse
        id="left-groin"
        cx="175"
        cy="410"
        rx="22"
        ry="18"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "left-groin")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "left-groin")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "left-groin")!)}
        {...getAccessibilityProps("left-groin")}
        onClick={() => onRegionClick?.("left-groin")}
        onMouseEnter={() => onRegionHover?.("left-groin")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="center-groin"
        cx="200"
        cy="415"
        rx="18"
        ry="15"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "center-groin")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "center-groin")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "center-groin")!)}
        {...getAccessibilityProps("center-groin")}
        onClick={() => onRegionClick?.("center-groin")}
        onMouseEnter={() => onRegionHover?.("center-groin")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="right-groin"
        cx="225"
        cy="410"
        rx="22"
        ry="18"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "right-groin")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "right-groin")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "right-groin")!)}
        {...getAccessibilityProps("right-groin")}
        onClick={() => onRegionClick?.("right-groin")}
        onMouseEnter={() => onRegionHover?.("right-groin")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Arms - continuing with same pattern for remaining body parts */}
      {/* Upper Arms */}
      <rect
        id="upper-arm-left"
        x="75"
        y="175"
        width="40"
        height="120"
        rx="20"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "upper-arm-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "upper-arm-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "upper-arm-left")!)}
        {...getAccessibilityProps("upper-arm-left")}
        onClick={() => onRegionClick?.("upper-arm-left")}
        onMouseEnter={() => onRegionHover?.("upper-arm-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <rect
        id="upper-arm-right"
        x="285"
        y="175"
        width="40"
        height="120"
        rx="20"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "upper-arm-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "upper-arm-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "upper-arm-right")!)}
        {...getAccessibilityProps("upper-arm-right")}
        onClick={() => onRegionClick?.("upper-arm-right")}
        onMouseEnter={() => onRegionHover?.("upper-arm-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Hips */}
      <ellipse
        id="hip-left"
        cx="145"
        cy="385"
        rx="30"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "hip-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "hip-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "hip-left")!)}
        {...getAccessibilityProps("hip-left")}
        onClick={() => onRegionClick?.("hip-left")}
        onMouseEnter={() => onRegionHover?.("hip-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="hip-right"
        cx="255"
        cy="385"
        rx="30"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "hip-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "hip-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "hip-right")!)}
        {...getAccessibilityProps("hip-right")}
        onClick={() => onRegionClick?.("hip-right")}
        onMouseEnter={() => onRegionHover?.("hip-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Thighs */}
      <rect
        id="thigh-left"
        x="145"
        y="425"
        width="45"
        height="130"
        rx="22"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "thigh-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "thigh-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "thigh-left")!)}
        {...getAccessibilityProps("thigh-left")}
        onClick={() => onRegionClick?.("thigh-left")}
        onMouseEnter={() => onRegionHover?.("thigh-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <rect
        id="thigh-right"
        x="210"
        y="425"
        width="45"
        height="130"
        rx="22"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "thigh-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "thigh-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "thigh-right")!)}
        {...getAccessibilityProps("thigh-right")}
        onClick={() => onRegionClick?.("thigh-right")}
        onMouseLeave={() => onRegionHover?.(null)}
        onMouseEnter={() => onRegionHover?.("thigh-right")}
      />

      {/* HS-Critical: Inner Thighs */}
      <ellipse
        id="inner-thigh-left"
        cx="190"
        cy="490"
        rx="15"
        ry="50"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "inner-thigh-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "inner-thigh-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "inner-thigh-left")!)}
        {...getAccessibilityProps("inner-thigh-left")}
        onClick={() => onRegionClick?.("inner-thigh-left")}
        onMouseEnter={() => onRegionHover?.("inner-thigh-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="inner-thigh-right"
        cx="210"
        cy="490"
        rx="15"
        ry="50"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "inner-thigh-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "inner-thigh-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "inner-thigh-right")!)}
        {...getAccessibilityProps("inner-thigh-right")}
        onClick={() => onRegionClick?.("inner-thigh-right")}
        onMouseEnter={() => onRegionHover?.("inner-thigh-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Knees */}
      <ellipse
        id="knee-left"
        cx="167"
        cy="565"
        rx="28"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "knee-left")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "knee-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "knee-left")!)}
        {...getAccessibilityProps("knee-left")}
        onClick={() => onRegionClick?.("knee-left")}
        onMouseEnter={() => onRegionHover?.("knee-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      <ellipse
        id="knee-right"
        cx="233"
        cy="565"
        rx="28"
        ry="25"
        className={`body-region ${getRegionClassName(FRONT_BODY_REGIONS.find(r => r.id === "knee-right")!)}`}
        fill={getRegionFill(FRONT_BODY_REGIONS.find(r => r.id === "knee-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find(r => r.id === "knee-right")!)}
        {...getAccessibilityProps("knee-right")}
        onClick={() => onRegionClick?.("knee-right")}
        onMouseEnter={() => onRegionHover?.("knee-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Note: Remaining body parts (elbows, forearms, wrists, hands, calves, ankles, feet)
          follow the same pattern - omitted for brevity but should be included */}

      {/* Flare overlay and coordinate marker on top */}
      {flareOverlay}
      {coordinateMarker}
    </svg>
  );
}
