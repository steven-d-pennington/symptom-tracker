'use client';

import { LayerSelector } from '@/components/body-map/LayerSelector';
import { LayerToggle } from '@/components/body-map/LayerToggle';
import { useBodyMapLayers } from '@/lib/hooks/useBodyMapLayers';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { BodyMapMarker } from '@/components/body-map/markers/BodyMapMarker';
import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Body Map Analysis Page
 * Story 5.5: Multi-layer view controls and filtering
 *
 * Demonstrates all Story 5.5 features:
 * - AC5.5.1: LayerToggle with checkboxes and marker counts
 * - AC5.5.2: View mode selector (Single/All)
 * - AC5.5.3: Individual layer visibility toggles
 * - AC5.5.4: Multi-layer simultaneous rendering
 * - AC5.5.5: Preference persistence
 * - AC5.5.7: Keyboard shortcuts
 * - AC5.5.8: Empty state messaging
 * - AC5.5.9: Real-time marker count updates
 */
export default function BodyMapAnalysisPage() {
  const { userId } = useCurrentUser();

  const {
    currentLayer,
    lastUsedLayer,
    changeLayer,
    viewMode,
    changeViewMode,
    visibleLayers,
    toggleLayerVisibility,
    markerCounts,
    markers,
    isLoading,
    isLoadingMarkers
  } = useBodyMapLayers(userId);

  // AC5.5.8: Empty state check
  const hasVisibleMarkers = markers.length > 0;
  const showEmptyState = viewMode === 'all' && !hasVisibleMarkers && !isLoadingMarkers;

  // Group markers by region for display (simplified for demo)
  const markersByRegion = useMemo(() => {
    const grouped = new Map<string, typeof markers>();
    markers.forEach(marker => {
      const key = marker.bodyRegionId;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(marker);
    });
    return grouped;
  }, [markers]);

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Body Map Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and analyze symptoms across multiple tracking layers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Layer Selector - Story 5.3 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Tracking Layer</h2>
            <LayerSelector
              currentLayer={currentLayer}
              lastUsedLayer={lastUsedLayer}
              onLayerChange={changeLayer}
              disabled={isLoading}
            />
          </div>

          {/* Layer Toggle - Story 5.5 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">View Controls</h2>
            <LayerToggle
              visibleLayers={visibleLayers}
              onToggleLayer={toggleLayerVisibility}
              markerCounts={markerCounts}
              viewMode={viewMode}
              onViewModeChange={changeViewMode}
              disabled={isLoading}
            />
          </div>

          {/* Stats */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              <div>Total Markers: {markers.length}</div>
              <div>View Mode: {viewMode === 'single' ? 'Single Layer' : 'All Layers'}</div>
              <div>
                Visible Layers: {viewMode === 'single' ? currentLayer : visibleLayers.join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 min-h-[600px]">
            <h2 className="text-lg font-semibold mb-4">
              Body Map Markers
              {isLoadingMarkers && <span className="text-sm font-normal text-gray-500 ml-2">(Loading...)</span>}
            </h2>

            {/* AC5.5.8: Empty State */}
            {showEmptyState ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold mb-2">No markers on enabled layers</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Switch to tracking mode to add data, or enable different layers.
                </p>
                <button
                  onClick={() => changeViewMode('single')}
                  className="btn-primary"
                >
                  Switch to Tracking Mode
                </button>
              </div>
            ) : (
              <>
                {/* Marker List by Region */}
                <div className="space-y-6">
                  {Array.from(markersByRegion.entries()).map(([regionId, regionMarkers]) => (
                    <div key={regionId} className="border-b pb-4">
                      <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        {regionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({regionMarkers.length})
                      </h3>

                      {/* Demo: SVG with markers (simplified visualization) */}
                      <svg width="100%" height="120" className="bg-gray-50 dark:bg-gray-900 rounded">
                        {regionMarkers.map((marker, index) => (
                          <BodyMapMarker
                            key={marker.id}
                            id={marker.id}
                            layer={marker.layer}
                            bodyRegionId={marker.bodyRegionId}
                            severity={marker.severity}
                            timestamp={marker.createdAt.getTime()}
                            position={{ x: 50 + (index * 40), y: 60 }}
                            className="transition-transform"
                          />
                        ))}
                      </svg>

                      {/* Marker Details */}
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {regionMarkers.map(marker => (
                          <div
                            key={marker.id}
                            className={cn(
                              "p-2 rounded text-sm",
                              "bg-gray-50 dark:bg-gray-700",
                              "border border-gray-200 dark:border-gray-600"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{marker.layer === 'flares' ? '🔥' : marker.layer === 'pain' ? '⚡' : '🟣'}</span>
                              <span className="font-medium capitalize">{marker.layer}</span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Severity: {marker.severity}/10
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(marker.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {markers.length === 0 && !showEmptyState && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No markers for current layer
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
