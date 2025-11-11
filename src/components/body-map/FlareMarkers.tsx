'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActiveFlare } from '@/lib/types/flare';
import { useFlares } from '@/lib/hooks/useFlares';
import { getRegionsForView } from '@/lib/data/bodyRegions';
import { calculateRadialOffsets } from '@/lib/utils/flareMarkers';
import { denormalizeCoordinates, getRegionBounds, RegionBounds } from '@/lib/utils/coordinates';
import { BodyMapMarker } from '@/components/body-map/markers/BodyMapMarker';
import { calculateMarkerOffset } from '@/lib/utils/markerCalculations';
import { BodyMapLocation } from '@/lib/types/body-mapping';

interface FlareMarkersProps {
  viewType: 'front' | 'back' | 'left' | 'right';
  zoomLevel: number;
  userId: string;
  /** Optional: Provide markers from external source (bodyMapLocations table) */
  markers?: BodyMapLocation[];
}

interface MarkerPosition {
  flare: ActiveFlare & { trend: 'worsening' | 'stable' | 'improving' };
  x: number;
  y: number;
  locationId?: string; // Story 3.7.5: Unique ID for each marker location
}

export function FlareMarkers({ viewType, zoomLevel, userId, markers }: FlareMarkersProps) {
  const router = useRouter();
  // Only query flares if markers prop is not provided (backward compatibility)
  const { data: flares = [], isLoading } = useFlares({
    userId,
    includeResolved: true
  }, {
    enabled: !markers  // Disable query if markers are provided
  });
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

  // NEW: If markers provided from bodyMapLocations, render those instead
  const bodyMapLocationPositions = useMemo(() => {
    if (!markers || markers.length === 0) {
      return [];
    }

    const positions: Array<{
      id: string;
      bodyRegionId: string;
      x: number;
      y: number;
      severity: number;
      layer: string;
      timestamp: number;
    }> = [];

    // Get regions for current view
    const regionIds = new Set(viewRegions.map(r => r.id));

    markers.forEach((marker) => {
      // Only show markers for regions visible in current view
      if (!regionIds.has(marker.bodyRegionId)) {
        return;
      }

      // Skip markers without coordinates
      if (!marker.coordinates) {
        return;
      }

      const bounds = boundsByRegion.get(marker.bodyRegionId);
      if (!bounds) {
        return;
      }

      // Denormalize coordinates to SVG space
      const { x, y } = denormalizeCoordinates(
        { x: marker.coordinates.x, y: marker.coordinates.y },
        bounds
      );

      positions.push({
        id: marker.id,
        bodyRegionId: marker.bodyRegionId,
        x,
        y,
        severity: marker.severity,
        layer: marker.layer,
        timestamp: marker.createdAt instanceof Date ? marker.createdAt.getTime() : marker.createdAt,
      });
    });

    return positions;
  }, [markers, viewRegions, boundsByRegion]);

  // Group flares by body region and calculate positions with offsets
  // Story 5.4: Updated to support smart overlap prevention with circular distribution
  const markerPositions = useMemo(() => {
    // If we have bodyMapLocation markers, use those instead
    if (bodyMapLocationPositions.length > 0) {
      return [];
    }

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

      // Story 5.4: Group markers by precise coordinates for overlap prevention
      const coordinateGroups = new Map<string, MarkerPosition[]>();
      const fallbackFlares: Array<MarkerPosition['flare']> = [];

      flaresInRegion.forEach((flare) => {
        // Story 3.7.5: Filter to get ALL coordinates for this region, not just first one
        const coordinatesInRegion = flare.coordinates?.filter(
          (coordinate) => coordinate.regionId === regionId
        ) || [];

        if (coordinatesInRegion.length > 0 && bounds) {
          // Add a marker for each coordinate
          coordinatesInRegion.forEach((coordinateEntry) => {
            const { x, y } = denormalizeCoordinates(
              { x: coordinateEntry.x, y: coordinateEntry.y },
              bounds
            );

            // Group by rounded coordinates for overlap detection
            const coordKey = `${Math.round(x)},${Math.round(y)}`;
            if (!coordinateGroups.has(coordKey)) {
              coordinateGroups.set(coordKey, []);
            }

            coordinateGroups.get(coordKey)!.push({
              flare,
              x,
              y,
              locationId: coordinateEntry.locationId, // Story 3.7.5: Track unique location ID
            });
          });
          return;
        }

        fallbackFlares.push(flare);
      });

      // Apply offsets to grouped markers (Story 5.4: AC5.4.4)
      coordinateGroups.forEach((group) => {
        if (group.length === 1) {
          positions.push(group[0]);
        } else {
          // Multiple markers at same location - apply circular offsets
          group.forEach((marker, index) => {
            const offset = calculateMarkerOffset(group, index, 10);
            positions.push({
              ...marker,
              x: marker.x + offset.x,
              y: marker.y + offset.y
            });
          });
        }
      });

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
    router.push(`/body-map/${flareId}`);
  };

  // Always render the <g> element to establish the ref, even if we don't have markers yet
  if (isLoading || (markerPositions.length === 0 && bodyMapLocationPositions.length === 0)) {
    return <g data-testid="flare-markers" ref={markerGroupRef} />;
  }

  return (
    <g data-testid="flare-markers" ref={markerGroupRef}>
      {/* Render bodyMapLocation markers if provided */}
      {bodyMapLocationPositions.map((position) => (
        <BodyMapMarker
          key={position.id}
          id={position.id}
          layer={position.layer as 'flares' | 'pain' | 'inflammation'}
          bodyRegionId={position.bodyRegionId}
          severity={position.severity}
          timestamp={position.timestamp}
          position={{ x: position.x, y: position.y }}
          onClick={() => {
            // For now, just log - we'll implement proper navigation later
            console.log('[FlareMarkers] Marker clicked:', position.id);
          }}
          isResolved={false}
          testId={`body-map-marker-${position.id}`}
        />
      ))}

      {/* Render flare markers (legacy/fallback) */}
      {markerPositions.map(({ flare, x, y, locationId }) => {
        // Story 3.7.5: Use locationId for unique keys when multiple markers per flare
        const markerKey = locationId || flare.id;

        // Story 5.4: Use BodyMapMarker component for layer-aware rendering
        // Flares use the 'flares' layer by default (backward compatibility)
        return (
          <BodyMapMarker
            key={markerKey}
            id={markerKey}
            layer="flares"
            bodyRegionId={flare.bodyRegions[0] || 'unknown'}
            severity={flare.severity}
            timestamp={flare.startDate.getTime()}
            position={{ x, y }}
            onClick={() => handleMarkerClick(flare.id)}
            isResolved={flare.status === 'resolved'}
            testId={`flare-marker-${flare.id}`}
          />
        );
      })}
    </g>
  );
}
