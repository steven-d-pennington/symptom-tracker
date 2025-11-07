'use client';

import { useEffect, useState, useCallback } from 'react';
import { bodyMapLocationRepository } from '@/lib/repositories/bodyMapLocationRepository';
import { BodyMapLocationRecord, LayerType } from '@/lib/db/schema';

/**
 * Custom hook for fetching body map markers with layer filtering
 * Story 5.4: AC5.4.5 (Layer-filtered queries) and AC5.4.9 (Real-time updates)
 *
 * Features:
 * - Layer-filtered queries using bodyMapRepository.getMarkersByLayer()
 * - Real-time updates when layer changes
 * - Loading state management
 * - Automatic refetch on layer change
 *
 * @param userId - User ID to fetch markers for
 * @param currentLayer - Current active layer ('flares', 'pain', 'inflammation')
 * @param options - Optional query filters (limit, date range)
 * @returns Object with markers array, loading state, and refetch function
 */
export function useBodyMapMarkers(
  userId: string,
  currentLayer: LayerType,
  options?: {
    limit?: number;
    startTime?: Date;
    endTime?: Date;
  }
) {
  const [markers, setMarkers] = useState<BodyMapLocationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Refetch function that can be called manually
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // AC5.4.5: Use bodyMapRepository.getMarkersByLayer for layer-filtered queries
      // This uses the compound index [userId+layer+createdAt] for optimal performance
      const data = await bodyMapLocationRepository.getMarkersByLayer(
        userId,
        currentLayer,
        options
      );
      setMarkers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch markers'));
      console.error('Error fetching body map markers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentLayer, options?.limit, options?.startTime, options?.endTime]);

  // AC5.4.9: Real-time marker updates - refetch when layer changes
  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    markers,
    isLoading,
    error,
    refetch // Allow manual refetch for optimistic updates
  };
}

/**
 * Hook for fetching markers from multiple layers
 * Useful for multi-layer view mode (Story 5.5)
 *
 * @param userId - User ID to fetch markers for
 * @param layers - Array of layers to fetch ('flares', 'pain', 'inflammation')
 * @param options - Optional query filters
 * @returns Object with markers array, loading state, and refetch function
 */
export function useMultiLayerMarkers(
  userId: string,
  layers: LayerType[],
  options?: {
    limit?: number;
    startTime?: Date;
    endTime?: Date;
  }
) {
  const [markers, setMarkers] = useState<BodyMapLocationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await bodyMapLocationRepository.getMarkersByLayers(
        userId,
        layers,
        options
      );
      setMarkers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch markers'));
      console.error('Error fetching multi-layer markers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, layers, options?.limit, options?.startTime, options?.endTime]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    markers,
    isLoading,
    error,
    refetch
  };
}
