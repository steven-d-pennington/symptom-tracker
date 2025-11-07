'use client';

import React from 'react';
import { LayerType, LAYER_CONFIG } from '@/lib/db/schema';
import {
  getSeveritySize,
  getMarkerOpacity,
  getTouchTargetPadding
} from '@/lib/utils/markerCalculations';
import { cn } from '@/lib/utils/cn';

/**
 * Props for the BodyMapMarker component
 * Story 5.4: Layer-aware marker rendering with severity, recency, and interactive features
 */
export interface BodyMapMarkerProps {
  /** Unique identifier for this marker */
  id: string;
  /** Layer type determines icon and color */
  layer: LayerType;
  /** Body region ID this marker belongs to */
  bodyRegionId: string;
  /** Precise coordinates within the region (optional) */
  coordinates?: { x: number; y: number };
  /** Severity rating 1-10 (affects marker size) */
  severity: number;
  /** Unix timestamp when marker was created (affects opacity) */
  timestamp: number;
  /** SVG position with offset applied */
  position: { x: number; y: number };
  /** Click handler for marker interaction */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether marker is resolved/inactive (grayed out) */
  isResolved?: boolean;
  /** Custom test ID for backward compatibility */
  testId?: string;
}

/**
 * BodyMapMarker Component
 *
 * Generalized marker component that renders layer-specific icons and colors.
 * Supports all 3 layers: Flares (🔥 red/orange), Pain (⚡ yellow/amber), Inflammation (🟣 purple).
 *
 * Features:
 * - AC5.4.1: Layer-specific rendering using LAYER_CONFIG
 * - AC5.4.2: Severity-based size scaling (16px/24px/32px) with 32px minimum touch target
 * - AC5.4.3: Recency-based opacity (100%/70%/50%)
 * - AC5.4.7: Colorblind-friendly (distinct icons + colors)
 * - AC5.4.8: Interactive behavior (click, hover, focus, keyboard navigation)
 */
const BodyMapMarkerComponent = ({
  id,
  layer,
  severity,
  timestamp,
  position,
  onClick,
  className,
  isResolved = false,
  testId
}: BodyMapMarkerProps) => {
  // Get layer configuration (icon, color, label)
  const layerConfig = LAYER_CONFIG[layer];

  // Calculate size based on severity (AC5.4.2)
  const size = getSeveritySize(severity);

  // Calculate opacity based on age (AC5.4.3)
  const opacity = getMarkerOpacity(timestamp);

  // Ensure minimum 32px touch target (AC5.4.2)
  const touchTargetSize = Math.max(size, 32);
  const padding = getTouchTargetPadding(size);

  // Override color for resolved markers (backward compatibility with flares)
  const fillColor = isResolved
    ? 'fill-gray-400'
    : layerConfig.color.replace('text-', 'fill-');

  // Accessibility label
  const ariaLabel = isResolved
    ? `Resolved ${layerConfig.label.toLowerCase()} marker, severity ${severity}`
    : `${layerConfig.label} marker, severity ${severity}`;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      opacity={opacity}
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all',
        'hover:scale-110 hover:opacity-90',
        'focus:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      data-testid={testId || `body-map-marker-${id}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Touch target (transparent padding area) - AC5.4.2 */}
      <circle
        r={touchTargetSize / 2}
        fill="transparent"
        className="pointer-events-all"
      />

      {/* Visible marker circle */}
      <circle
        r={size / 2}
        className={cn(
          fillColor,
          'stroke-white stroke-2',
          'transition-all'
        )}
      />

      {/* Icon/emoji overlay - AC5.4.7: Colorblind-friendly */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.6}
        className="pointer-events-none select-none"
        style={{ userSelect: 'none' }}
      >
        {layerConfig.icon}
      </text>
    </g>
  );
};

/**
 * Memoized BodyMapMarker for performance optimization (AC5.4.6)
 * Only re-renders when relevant props change
 */
export const BodyMapMarker = React.memo(
  BodyMapMarkerComponent,
  (prev, next) => {
    return (
      prev.id === next.id &&
      prev.layer === next.layer &&
      prev.severity === next.severity &&
      prev.timestamp === next.timestamp &&
      prev.position.x === next.position.x &&
      prev.position.y === next.position.y &&
      prev.isResolved === next.isResolved
    );
  }
);

BodyMapMarker.displayName = 'BodyMapMarker';
