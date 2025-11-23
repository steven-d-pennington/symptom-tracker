'use client';

import { useEffect, useState, useCallback } from 'react';
import { bodyMarkerRepository, MarkerWithLocations } from '@/lib/repositories/bodyMarkerRepository';
import { BodyMarkerRecord } from '@/lib/db/schema';

export function useFlare(flareId: string, userId: string) {
  const [data, setData] = useState<MarkerWithLocations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFlare = useCallback(async () => {
    if (!flareId || !userId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const marker = await bodyMarkerRepository.getMarkerById(userId, flareId);

      if (marker) {
        // Load body locations for the marker
        const bodyLocations = await bodyMarkerRepository.getMarkerLocations(flareId);
        const markerWithLocations: MarkerWithLocations = {
          ...marker,
          bodyLocations
        };
        setData(markerWithLocations);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [flareId, userId]);

  useEffect(() => {
    fetchFlare();
  }, [fetchFlare]);

  return { data, isLoading, error, refetch: fetchFlare };
}