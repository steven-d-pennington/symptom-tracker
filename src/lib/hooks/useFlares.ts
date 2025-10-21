'use client';

import { useEffect, useState } from 'react';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { ActiveFlare } from '@/lib/types/flare';

interface UseFlaresOptions {
  userId: string;
  includeResolved?: boolean;
  status?: ActiveFlare['status'] | ActiveFlare['status'][];
  bodyRegionId?: string;
}

/**
 * Hook to fetch and subscribe to flare data with real-time updates
 * Polls for updates to keep data fresh
 */
export function useFlares(options: UseFlaresOptions) {
  const { userId, includeResolved = false, status, bodyRegionId } = options;
  const [data, setData] = useState<Array<ActiveFlare & { trend: 'worsening' | 'stable' | 'improving' }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchFlares = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all active flares with trend information
        const flares = await flareRepository.getActiveFlaresWithTrend(userId);
        
        // Apply filters
        let filtered = flares;

        // Filter by includeResolved
        if (!includeResolved) {
          filtered = filtered.filter(f => f.status !== 'resolved');
        }

        // Filter by status if specified
        if (status) {
          const statusArray = Array.isArray(status) ? status : [status];
          filtered = filtered.filter(f => statusArray.includes(f.status));
        }

        // Filter by bodyRegionId if specified (check if region is in bodyRegions array)
        if (bodyRegionId) {
          filtered = filtered.filter(f => f.bodyRegions.includes(bodyRegionId));
        }

        if (mounted) {
          setData(filtered);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch flares'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchFlares();

    // Poll for updates every 5 seconds for real-time feel
    const interval = setInterval(fetchFlares, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userId, includeResolved, status, bodyRegionId]);

  return {
    data,
    isLoading,
    isError: error !== null,
    error,
  };
}
