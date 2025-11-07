'use client';

import React, { useState } from 'react';
import { LayerType } from '@/lib/db/schema';
import { useBodyMapMarkers } from '@/lib/hooks/useBodyMapMarkers';
import { BodyMapMarker } from '@/components/body-map/markers/BodyMapMarker';
import { LayerSelector } from '@/components/body-map/LayerSelector';
import { calculateMarkerOffset } from '@/lib/utils/markerCalculations';

/**
 * LayerAwareBodyMap Component (Story 5.4 Integration)
 *
 * Demonstrates proper integration of layer-aware marker rendering:
 * - AC5.4.5: Layer-filtered queries using useBodyMapMarkers hook
 * - AC5.4.9: Real-time updates when layer switches
 * - AC5.4.4: Smart overlap prevention with circular distribution
 *
 * This component showcases the complete data flow:
 * LayerSelector → useBodyMapMarkers → BodyMapMarker rendering
 */

export interface LayerAwareBodyMapProps {
  /** User ID for data fetching */
  userId: string;
  /** Initial layer to display */
  initialLayer?: LayerType;
  /** Optional width of the body map (default: 400) */
  width?: number;
  /** Optional height of the body map (default: 600) */
  height?: number;
}

export function LayerAwareBodyMap({
  userId,
  initialLayer = 'flares',
  width = 400,
  height = 600
}: LayerAwareBodyMapProps) {
  // Story 5.3: Layer selection state
  const [currentLayer, setCurrentLayer] = useState<LayerType>(initialLayer);

  // Story 5.4 AC5.4.5: Layer-filtered marker queries
  // Story 5.4 AC5.4.9: Real-time updates on layer change
  const { markers, isLoading, error } = useBodyMapMarkers(userId, currentLayer);

  // Group markers by body region for overlap prevention (AC5.4.4)
  const markersByRegion = React.useMemo(() => {
    const groups = new Map<string, typeof markers>();
    markers.forEach(marker => {
      const key = marker.bodyRegionId;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(marker);
    });
    return groups;
  }, [markers]);

  return (
    <div className="flex flex-col gap-4">
      {/* Layer Selector - Story 5.3 */}
      <LayerSelector
        currentLayer={currentLayer}
        onLayerChange={setCurrentLayer}
        disabled={isLoading}
        lastUsedLayer={initialLayer}
      />

      {/* Marker count display */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {isLoading ? (
          <span>Loading markers...</span>
        ) : (
          <span>{markers.length} marker{markers.length !== 1 ? 's' : ''} found</span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          Error loading markers: {error.message}
        </div>
      )}

      {/* SVG Body Map with Layer-Aware Markers */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        data-testid="layer-aware-body-map"
      >
        {/* Example body outline (simplified) */}
        <rect
          x={width * 0.3}
          y={height * 0.1}
          width={width * 0.4}
          height={height * 0.8}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 dark:text-gray-600"
          rx="20"
        />

        {/* Render markers with overlap prevention (AC5.4.4) */}
        <g data-testid="layer-aware-markers">
          {Array.from(markersByRegion.entries()).map(([regionId, regionMarkers]) => {
            // Calculate base position for region (centered in body)
            const baseX = width / 2;
            const baseY = (height * (regionMarkers[0]?.coordinates?.y || 0.5));

            return regionMarkers.map((marker, index) => {
              // Apply circular offset for overlapping markers (AC5.4.4)
              const offset = calculateMarkerOffset(regionMarkers, index, 10);

              const position = {
                x: baseX + offset.x,
                y: baseY + offset.y
              };

              return (
                <BodyMapMarker
                  key={marker.id}
                  id={marker.id}
                  layer={marker.layer || 'flares'}
                  bodyRegionId={marker.bodyRegionId}
                  coordinates={marker.coordinates}
                  severity={marker.severity}
                  timestamp={marker.createdAt.getTime()}
                  position={position}
                  onClick={() => {
                    // Navigate to layer-appropriate detail view (AC5.4.8)
                    console.log(`Clicked ${marker.layer} marker:`, marker.id);
                  }}
                />
              );
            });
          })}
        </g>

        {/* Empty state when no markers */}
        {markers.length === 0 && !isLoading && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            className="text-gray-400 dark:text-gray-500 fill-current"
            fontSize="14"
          >
            No {currentLayer} markers found
          </text>
        )}
      </svg>

      {/* Legend showing current layer */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Showing: {currentLayer} layer only (AC5.4.5: layer-filtered queries)
      </div>
    </div>
  );
}
