'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActiveFlare } from '@/lib/types/flare';
import { useFlares } from '@/lib/hooks/useFlares';
import { getRegionsForView } from '@/lib/data/bodyRegions';
import { getFlareMarkerColor, calculateRadialOffsets } from '@/lib/utils/flareMarkers';
import { denormalizeCoordinates, getRegionBounds, RegionBounds } from '@/lib/utils/coordinates';

interface FlareMarkersProps {
  viewType: 'front' | 'back' | 'left' | 'right';
  zoomLevel: number;
  userId: string;
}

interface MarkerPosition {
  flare: ActiveFlare & { trend: 'worsening' | 'stable' | 'improving' };
  x: number;
  y: number;
}

export function FlareMarkers({ viewType, zoomLevel, userId }: FlareMarkersProps) {
  const router = useRouter();
  const { data: flares = [], isLoading } = useFlares({ userId, includeResolved: true });
  const markerGroupRef = useRef<SVGGElement | null>(null);
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);

  // Check for SVG element after every render
  useEffect(() => {
    if (markerGroupRef.current?.ownerSVGElement && !svgElement) {
      setSvgElement(markerGroupRef.current.ownerSVGElement);
    }
  }); // No deps array - runs after every render until SVG is found

  // Get regions for current view
  const viewRegions = useMemo(() => {
    return getRegionsForView(viewType);
  }, [viewType]);

  // Filter flares for current view based on body regions
  const visibleFlares = useMemo(() => {
    const regionIds = new Set(viewRegions.map(r => r.id));
    return flares.filter(flare => {
      // Check if any of the flare's body regions are visible in current view
      return flare.bodyRegions.some(regionId => regionIds.has(regionId));
    });
  }, [flares, viewRegions]);

  const boundsByRegion = useMemo(() => {
    if (!svgElement) {
      return new Map<string, RegionBounds>();
    }

    const boundsMap = new Map<string, RegionBounds>();
    viewRegions.forEach((region) => {
      const bounds = getRegionBounds(svgElement, region.id);
      if (bounds) {
        boundsMap.set(region.id, bounds);
      }
    });

    return boundsMap;
  }, [svgElement, viewRegions]);

  const regionsById = useMemo(() => {
    const map = new Map<string, typeof viewRegions[number]>();
    viewRegions.forEach((region) => {
      map.set(region.id, region);
    });
    return map;
  }, [viewRegions]);

  // Group flares by body region and calculate positions with offsets
  const markerPositions = useMemo(() => {
    const positions: MarkerPosition[] = [];

    const regionsWithFlares = new Set<string>();
    visibleFlares.forEach((flare) => {
      flare.bodyRegions.forEach((regionId) => regionsWithFlares.add(regionId));
    });

    regionsWithFlares.forEach((regionId) => {
      const region = regionsById.get(regionId);
      if (!region) {
        return;
      }

      const bounds = boundsByRegion.get(regionId);
      const flaresInRegion = visibleFlares.filter((flare) =>
        flare.bodyRegions.includes(regionId)
      );

      if (flaresInRegion.length === 0) {
        return;
      }

      const coordinatePositions: MarkerPosition[] = [];
      const fallbackFlares: Array<MarkerPosition['flare']> = [];

      flaresInRegion.forEach((flare) => {
        const coordinateEntry = flare.coordinates?.find(
          (coordinate) => coordinate.regionId === regionId
        );

        if (coordinateEntry && bounds) {
          const { x, y } = denormalizeCoordinates(
            { x: coordinateEntry.x, y: coordinateEntry.y },
            bounds
          );

          coordinatePositions.push({
            flare,
            x,
            y,
          });
          return;
        }

        fallbackFlares.push(flare);
      });

      positions.push(...coordinatePositions);

      if (fallbackFlares.length > 0 && region.center) {
        const offsets = calculateRadialOffsets(fallbackFlares.length, 20);
        fallbackFlares.forEach((flare, index) => {
          positions.push({
            flare,
            x: region.center!.x + offsets[index].x,
            y: region.center!.y + offsets[index].y,
          });
        });
      }
    });

    return positions;
  }, [visibleFlares, boundsByRegion, regionsById]);

  const handleMarkerClick = (flareId: string) => {
    router.push(`/flares/${flareId}`);
  };

  // Marker size scales inversely with zoom to maintain consistent screen size
  const markerRadius = 8 / Math.sqrt(zoomLevel);

  // Always render the <g> element to establish the ref, even if we don't have markers yet
  if (isLoading || markerPositions.length === 0) {
    return <g data-testid="flare-markers" ref={markerGroupRef} />;
  }

  return (
    <g data-testid="flare-markers" ref={markerGroupRef}>
      {markerPositions.map(({ flare, x, y }) => {
        // Use gray color for resolved flares, otherwise color by severity
        const markerColor = flare.status === 'resolved'
          ? 'fill-gray-400'
          : getFlareMarkerColor(flare.severity);

        const statusLabel = flare.status === 'resolved' ? 'Resolved flare' : `${flare.symptomName} flare - severity ${flare.severity}`;

        return (
          <circle
            key={flare.id}
            cx={x}
            cy={y}
            r={markerRadius}
            className={`${markerColor} stroke-white stroke-2 cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => handleMarkerClick(flare.id)}
            aria-label={statusLabel}
            role="button"
            tabIndex={0}
            data-testid={`flare-marker-${flare.id}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMarkerClick(flare.id);
              }
            }}
          />
        );
      })}
    </g>
  );
}
