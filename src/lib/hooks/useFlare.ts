'use client';

import { useEffect, useState, useCallback } from 'react';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { FlareRecord } from '@/lib/db/schema';

export function useFlare(flareId: string, userId: string) {
  const [data, setData] = useState<FlareRecord | null>(null);
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
      const flare = await flareRepository.getFlareById(userId, flareId);
      setData(flare);
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