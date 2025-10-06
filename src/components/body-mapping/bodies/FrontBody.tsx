"use client";

import React from "react";
import { FRONT_BODY_REGIONS } from "@/lib/data/bodyRegions";
import { BodyRegion } from "@/lib/types/body-mapping";

interface FrontBodyProps {
  selectedRegions?: string[];
  highlightedRegion?: string;
  onRegionClick?: (regionId: string) => void;
  onRegionHover?: (regionId: string | null) => void;
  severityByRegion?: Record<string, number>;
}

export function FrontBody({
  selectedRegions = [],
  highlightedRegion,
  onRegionClick,
  onRegionHover,
  severityByRegion = {},
}: FrontBodyProps) {
  const getSeverityColor = (severity: number): string => {
    if (severity <= 2) return "#10b981"; // green
    if (severity <= 4) return "#fbbf24"; // yellow
    if (severity <= 6) return "#f59e0b"; // orange
    if (severity <= 8) return "#ef4444"; // red
    return "#991b1b"; // dark red
  };

  const getRegionFill = (region: BodyRegion): string => {
    const severity = severityByRegion[region.id];
    if (severity) return getSeverityColor(severity);
    if (selectedRegions.includes(region.id)) return "#3b82f6";
    if (highlightedRegion === region.id) return "#60a5fa";
    return "#e5e7eb";
  };

  const getRegionOpacity = (region: BodyRegion): number => {
    const severity = severityByRegion[region.id];
    if (severity) return 0.8;
    if (selectedRegions.includes(region.id)) return 0.6;
    if (highlightedRegion === region.id) return 0.5;
    return 0.3;
  };

  return (
    <svg
      viewBox="0 0 400 800"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .body-region {
            stroke: #374151;
            stroke-width: 2;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .body-region:hover {
            opacity: 0.8 !important;
            stroke-width: 3;
          }
        `}</style>
      </defs>

      {/* Head */}
      <ellipse
        id="head-front"
        cx="200"
        cy="60"
        rx="50"
        ry="60"
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS[0])}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS[0])}
        onClick={() => onRegionClick?.("head-front")}
        onMouseEnter={() => onRegionHover?.("head-front")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Neck */}
      <rect
        id="neck-front"
        x="175"
        y="110"
        width="50"
        height="40"
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS[1])}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS[1])}
        onClick={() => onRegionClick?.("neck-front")}
        onMouseEnter={() => onRegionHover?.("neck-front")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Shoulder */}
      <ellipse
        id="shoulder-left"
        cx="120"
        cy="170"
        rx="45"
        ry="35"
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "shoulder-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "shoulder-left")!)}
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "abdomen-lower")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "abdomen-lower")!)}
        onClick={() => onRegionClick?.("abdomen-lower")}
        onMouseEnter={() => onRegionHover?.("abdomen-lower")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Groin */}
      <path
        id="groin"
        d="M 175 385 Q 200 395 225 385"
        fill="none"
        stroke={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "groin")!)}
        strokeWidth="30"
        strokeOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "groin")!)}
        className="body-region"
        onClick={() => onRegionClick?.("groin")}
        onMouseEnter={() => onRegionHover?.("groin")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Upper Arm */}
      <rect
        id="upper-arm-left"
        x="75"
        y="195"
        width="40"
        height="120"
        rx="20"
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-left")!)}
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
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "upper-arm-right")!)}
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "hand-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "hand-right")!)}
        onClick={() => onRegionClick?.("hand-right")}
        onMouseEnter={() => onRegionHover?.("hand-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Left Hip */}
      <ellipse
        id="hip-left"
        cx="175"
        cy="400"
        rx="30"
        ry="25"
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "hip-left")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "hip-left")!)}
        onClick={() => onRegionClick?.("hip-left")}
        onMouseEnter={() => onRegionHover?.("hip-left")}
        onMouseLeave={() => onRegionHover?.(null)}
      />

      {/* Right Hip */}
      <ellipse
        id="hip-right"
        cx="225"
        cy="400"
        rx="30"
        ry="25"
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
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
        className="body-region"
        fill={getRegionFill(FRONT_BODY_REGIONS.find((r) => r.id === "foot-right")!)}
        fillOpacity={getRegionOpacity(FRONT_BODY_REGIONS.find((r) => r.id === "foot-right")!)}
        onClick={() => onRegionClick?.("foot-right")}
        onMouseEnter={() => onRegionHover?.("foot-right")}
        onMouseLeave={() => onRegionHover?.(null)}
      />
    </svg>
  );
}
