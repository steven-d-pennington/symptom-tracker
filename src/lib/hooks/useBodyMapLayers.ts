import { useState, useEffect, useCallback } from 'react';
import { LayerType } from '@/lib/db/schema';
import { bodyMapPreferencesRepository } from '@/lib/repositories/bodyMapPreferencesRepository';

export interface UseBodyMapLayersResult {
  /** Currently active layer */
  currentLayer: LayerType;
  /** Last used layer (for badge display) */
  lastUsedLayer: LayerType;
  /** Change active layer and persist preference */
  changeLayer: (layer: LayerType) => void;
  /** Loading state during initial preference fetch */
  isLoading: boolean;
}

/**
 * Custom hook for managing body map layer state and preferences (Story 5.3).
 *
 * Features:
 * - Loads last-used layer from preferences on mount
 * - Provides optimistic UI updates when changing layers
 * - Persists layer changes to IndexedDB (fire-and-forget)
 * - Returns loading state for initial render
 *
 * Usage:
 * ```typescript
 * const { currentLayer, changeLayer, isLoading } = useBodyMapLayers(userId);
 *
 * <LayerSelector
 *   currentLayer={currentLayer}
 *   onLayerChange={changeLayer}
 *   disabled={isLoading}
 * />
 * ```
 *
 * @param userId - User ID for preference isolation
 * @returns Layer state and change handler
 */
export function useBodyMapLayers(userId: string | null): UseBodyMapLayersResult {
  const [currentLayer, setCurrentLayer] = useState<LayerType>('flares');
  const [lastUsedLayer, setLastUsedLayer] = useState<LayerType>('flares');
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount or userId change
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

  // Change layer with optimistic update and async persistence
  const changeLayer = useCallback((layer: LayerType) => {
    // Optimistic UI update
    setLastUsedLayer(currentLayer); // Current becomes "last used"
    setCurrentLayer(layer);

    // Fire-and-forget persistence
    if (userId) {
      void bodyMapPreferencesRepository.setLastUsedLayer(userId, layer);
    }
  }, [currentLayer, userId]);

  return {
    currentLayer,
    lastUsedLayer,
    changeLayer,
    isLoading
  };
}
