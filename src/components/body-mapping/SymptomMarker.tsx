"use client";

import React from "react";
import { BodyMapLocation } from "@/lib/types/body-mapping";
import { getSeverityColor } from "@/lib/types/body-mapping";

interface SymptomMarkerProps {
  location: BodyMapLocation;
  onClick?: (locationId: string) => void;
  showAnimation?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SymptomMarker({
  location,
  onClick,
  showAnimation = false,
  size = "md",
}: SymptomMarkerProps) {
  const color = getSeverityColor(location.severity);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => onClick?.(location.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(location.id);
        }
      }}
      aria-label={`Symptom marker with severity ${location.severity}`}
    >
      {/* Marker Circle */}
      <div
        className={`${sizeClasses[size]} rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125 ${
          showAnimation ? "animate-pulse" : ""
        }`}
        style={{ backgroundColor: color }}
      />

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
          <div className="text-sm font-semibold">Severity: {location.severity}/10</div>
          {location.notes && (
            <div className="text-xs text-gray-300 mt-1 max-w-xs truncate">
              {location.notes}
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>

      {/* Severity Ring for high severity */}
      {location.severity >= 7 && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
}
