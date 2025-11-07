import { useState, useEffect, useCallback } from 'react';
import { LayerType, BodyMapLocationRecord } from '@/lib/db/schema';
import { bodyMapPreferencesRepository } from '@/lib/repositories/bodyMapPreferencesRepository';
import { bodyMapLocationRepository } from '@/lib/repositories/bodyMapLocationRepository';

export interface UseBodyMapLayersResult {
  /** Currently active layer */
  currentLayer: LayerType;
  /** Last used layer (for badge display) */
  lastUsedLayer: LayerType;
  /** Change active layer and persist preference */
  changeLayer: (layer: LayerType) => void;
  /** Loading state during initial preference fetch */
  isLoading: boolean;
  /** Story 5.5: View mode (single or all layers) */
  viewMode: 'single' | 'all';
  /** Story 5.5: Change view mode and persist */
  changeViewMode: (mode: 'single' | 'all') => void;
  /** Story 5.5: Currently visible layers in all mode */
  visibleLayers: LayerType[];
  /** Story 5.5: Toggle layer visibility */
  toggleLayerVisibility: (layer: LayerType) => void;
  /** Story 5.5: Marker counts per layer */
  markerCounts: Record<LayerType, number>;
  /** Story 5.5: Current markers based on view mode */
  markers: BodyMapLocationRecord[];
  /** Story 5.5: Loading state for markers */
  isLoadingMarkers: boolean;
  /** Story 5.5: Refresh markers and counts */
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing body map layer state and preferences (Story 5.3, extended in Story 5.5).
 *
 * Features (Story 5.3):
 * - Loads last-used layer from preferences on mount
 * - Provides optimistic UI updates when changing layers
 * - Persists layer changes to IndexedDB (fire-and-forget)
 * - Returns loading state for initial render
 *
 * Features (Story 5.5):
 * - AC5.5.2: View mode management (single/all)
 * - AC5.5.3: Layer visibility toggles
 * - AC5.5.4: Multi-layer marker fetching
 * - AC5.5.5: Preference persistence
 * - AC5.5.9: Real-time marker count updates
 *
 * Usage:
 * ```typescript
 * const {
 *   currentLayer, changeLayer,
 *   viewMode, changeViewMode,
 *   visibleLayers, toggleLayerVisibility,
 *   markerCounts, markers, refresh
 * } = useBodyMapLayers(userId);
 * ```
 *
 * @param userId - User ID for preference isolation
 * @returns Layer state and change handlers
 */
export function useBodyMapLayers(userId: string | null): UseBodyMapLayersResult {
  const [currentLayer, setCurrentLayer] = useState<LayerType>('flares');
  const [lastUsedLayer, setLastUsedLayer] = useState<LayerType>('flares');
  const [isLoading, setIsLoading] = useState(true);

  // Story 5.5: Multi-layer state
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [visibleLayers, setVisibleLayers] = useState<LayerType[]>(['flares']);
  const [markerCounts, setMarkerCounts] = useState<Record<LayerType, number>>({
    flares: 0,
    pain: 0,
    inflammation: 0
  });
  const [markers, setMarkers] = useState<BodyMapLocationRecord[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);

  // Load preferences on mount or userId change (Story 5.3 + Story 5.5)
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const currentUserId = userId; // Capture userId in a const for TypeScript

    async function loadPreferences() {
      try {
        const prefs = await bodyMapPreferencesRepository.get(currentUserId);
        if (mounted) {
          setCurrentLayer(prefs.lastUsedLayer);
          setLastUsedLayer(prefs.lastUsedLayer);
          // Story 5.5: Load multi-layer preferences
          setViewMode(prefs.defaultViewMode);
          setVisibleLayers(prefs.visibleLayers);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[useBodyMapLayers] Failed to load preferences:', error);
        // Fall back to defaults
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPreferences();

    return () => {
      mounted = false;
    };
  }, [userId]);

  // Story 5.5 AC5.5.9: Load marker counts
  const loadMarkerCounts = useCallback(async () => {
    if (!userId) return;

    try {
      const counts = await bodyMapLocationRepository.getMarkerCountsByLayer(userId);
      setMarkerCounts(counts);
    } catch (error) {
      console.error('[useBodyMapLayers] Failed to load marker counts:', error);
    }
  }, [userId]);

  useEffect(() => {
    void loadMarkerCounts();
  }, [loadMarkerCounts]);

  // Story 5.5 AC5.5.4: Load markers based on view mode
  const loadMarkers = useCallback(async () => {
    if (!userId) return;

    setIsLoadingMarkers(true);
    try {
      let fetchedMarkers: BodyMapLocationRecord[];

      if (viewMode === 'single') {
        // Single layer mode: fetch only current layer
        fetchedMarkers = await bodyMapLocationRepository.getMarkersByLayer(
          userId,
          currentLayer
        );
      } else {
        // All layers mode: fetch all visible layers
        fetchedMarkers = await bodyMapLocationRepository.getMarkersByLayers(
          userId,
          visibleLayers
        );
      }

      setMarkers(fetchedMarkers);
    } catch (error) {
      console.error('[useBodyMapLayers] Failed to load markers:', error);
      setMarkers([]);
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [userId, viewMode, currentLayer, visibleLayers]);

  useEffect(() => {
    void loadMarkers();
  }, [loadMarkers]);

  // Change layer with optimistic update and async persistence (Story 5.3)
  const changeLayer = useCallback((layer: LayerType) => {
    // Optimistic UI update
    setLastUsedLayer(currentLayer); // Current becomes "last used"
    setCurrentLayer(layer);

    // Fire-and-forget persistence
    if (userId) {
      void bodyMapPreferencesRepository.setLastUsedLayer(userId, layer);
    }
  }, [currentLayer, userId]);

  // Story 5.5 AC5.5.2: Change view mode with persistence
  const changeViewMode = useCallback((mode: 'single' | 'all') => {
    setViewMode(mode);

    // Fire-and-forget persistence
    if (userId) {
      void bodyMapPreferencesRepository.setViewMode(userId, mode);
    }
  }, [userId]);

  // Story 5.5 AC5.5.3: Toggle layer visibility with persistence
  const toggleLayerVisibility = useCallback((layer: LayerType) => {
    setVisibleLayers(prev => {
      const updated = prev.includes(layer)
        ? prev.filter(l => l !== layer)
        : [...prev, layer];

      // Fire-and-forget persistence
      if (userId) {
        void bodyMapPreferencesRepository.setVisibleLayers(userId, updated);
      }

      return updated;
    });
  }, [userId]);

  // Story 5.5: Refresh markers and counts (useful after adding/deleting markers)
  const refresh = useCallback(async () => {
    await Promise.all([
      loadMarkers(),
      loadMarkerCounts()
    ]);
  }, [loadMarkers, loadMarkerCounts]);

  return {
    currentLayer,
    lastUsedLayer,
    changeLayer,
    isLoading,
    // Story 5.5: Multi-layer state and actions
    viewMode,
    changeViewMode,
    visibleLayers,
    toggleLayerVisibility,
    markerCounts,
    markers,
    isLoadingMarkers,
    refresh
  };
}
