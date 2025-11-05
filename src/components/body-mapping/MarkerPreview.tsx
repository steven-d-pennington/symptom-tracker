"use client";

import React from "react";
import { NormalizedCoordinates } from "@/lib/utils/coordinates";
import { Check, X } from "lucide-react";

export interface MarkerPreviewProps {
  /** Normalized coordinates (0-1 range) of the preview marker */
  coordinates: NormalizedCoordinates | null;

  /** ViewBox dimensions for coordinate conversion */
  viewBox: [number, number, number, number];

  /** Callback when user confirms marker position */
  onConfirm: () => void;

  /** Callback when user cancels marker placement */
  onCancel: () => void;

  /** Whether the preview is currently active */
  isActive: boolean;
}

/**
 * MarkerPreview Component (Story 3.7.2)
 *
 * Displays a translucent preview marker that users can position before confirming.
 * Designed for accessibility - supports tap-to-position workflow for users with
 * motor control challenges. No drag gestures required.
 *
 * AC 3.7.2.1: Displays translucent preview marker at tapped location
 * AC 3.7.2.5: Visually distinct from final markers (50% opacity, outlined, pulse animation)
 */
export function MarkerPreview({
  coordinates,
  viewBox,
  onConfirm,
  onCancel,
  isActive,
}: MarkerPreviewProps) {
  if (!isActive || !coordinates) {
    return null;
  }

  // Convert normalized coordinates to viewBox coordinates
  const [vbX, vbY, vbWidth, vbHeight] = viewBox;
  const x = vbX + coordinates.x * vbWidth;
  const y = vbY + coordinates.y * vbHeight;

  return (
    <g className="marker-preview">
      {/* Preview marker circle - translucent with pulse animation */}
      <circle
        cx={x}
        cy={y}
        r="3"
        fill="#3b82f6"
        fillOpacity="0.5"
        stroke="#2563eb"
        strokeWidth="1"
        className="animate-pulse"
        aria-label="Preview marker position"
      />

      {/* Center dot for precision */}
      <circle
        cx={x}
        cy={y}
        r="0.5"
        fill="#1e40af"
      />

      {/* Confirm button - positioned to the right of marker */}
      <g transform={`translate(${x + 6}, ${y})`}>
        <rect
          x="-3"
          y="-3"
          width="6"
          height="6"
          rx="1"
          fill="#22c55e"
          stroke="#16a34a"
          strokeWidth="0.3"
          className="cursor-pointer hover:fill-green-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onConfirm();
          }}
          aria-label="Confirm marker position"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onConfirm();
            }
          }}
        />
        <Check
          x="-2.5"
          y="-2.5"
          width="5"
          height="5"
          stroke="#ffffff"
          strokeWidth="0.8"
          className="pointer-events-none"
        />
      </g>

      {/* Cancel button - positioned to the left of marker */}
      <g transform={`translate(${x - 6}, ${y})`}>
        <rect
          x="-3"
          y="-3"
          width="6"
          height="6"
          rx="1"
          fill="#ef4444"
          stroke="#dc2626"
          strokeWidth="0.3"
          className="cursor-pointer hover:fill-red-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
          aria-label="Cancel marker placement"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }
          }}
        />
        <X
          x="-2.5"
          y="-2.5"
          width="5"
          height="5"
          stroke="#ffffff"
          strokeWidth="0.8"
          className="pointer-events-none"
        />
      </g>
    </g>
  );
}
