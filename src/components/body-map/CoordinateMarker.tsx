'use client';

import React, { memo, useMemo } from 'react';
import { NormalizedCoordinates } from '@/lib/utils/coordinates';

interface CoordinateMarkerProps {
  x: number;
  y: number;
  zoomLevel: number;
  visible: boolean;
  regionId?: string;
  normalized?: NormalizedCoordinates;
}

export const CoordinateMarker = memo(function CoordinateMarker({
  x,
  y,
  zoomLevel,
  visible,
  regionId,
  normalized,
}: CoordinateMarkerProps) {
  const markerDimensions = useMemo(() => {
    const baseRadius = 26;
    const scale = 1 / Math.max(zoomLevel, 0.0001);
    const radius = baseRadius * scale;
    const crosshair = radius * 1.5;
    const outerRing = (baseRadius + 10) * scale;
    return { radius, crosshair, outerRing };
  }, [zoomLevel]);

  if (!visible) {
    return null;
  }

  return (
    <g
      transform={`translate(${x}, ${y})`}
      data-testid="coordinate-marker"
      data-region-id={regionId ?? undefined}
      role="img"
      aria-label="Pending flare location"
      style={{ transition: 'transform 120ms ease-out' }}
      pointerEvents="none"
    >
      {normalized && (
        <title>
          {regionId ?? 'region'} → x: {normalized.x.toFixed(2)}, y: {normalized.y.toFixed(2)}
        </title>
      )}
      <circle
        cx={0}
        cy={0}
        r={markerDimensions.outerRing}
        className="fill-transparent"
        stroke="#0ea5e9"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <circle
        cx={0}
        cy={0}
        r={markerDimensions.radius}
        className="fill-[#0ea5e9]/30"
        stroke="#0284c7"
        strokeWidth={3}
        data-testid="coordinate-marker-outline"
      />
      <line
        x1={-markerDimensions.crosshair}
        y1={0}
        x2={markerDimensions.crosshair}
        y2={0}
        className="stroke-white"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <line
        x1={0}
        y1={-markerDimensions.crosshair}
        x2={0}
        y2={markerDimensions.crosshair}
        className="stroke-white"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle
        cx={0}
        cy={0}
        r={markerDimensions.radius / 3}
        className="fill-[#0ea5e9]"
        stroke="#ffffff"
        strokeWidth={1.2}
      />
    </g>
  );
});
