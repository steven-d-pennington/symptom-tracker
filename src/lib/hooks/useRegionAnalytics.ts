/**
 * useRegionAnalytics Hook (Story 3.2 - Task 3)
 *
 * Hook for region-specific analytics data fetching with polling for real-time updates.
 * Provides reactive flare history and statistics data following existing hook patterns.
 *
 * AC3.2.1, AC3.2.6: Real-time updates when flares change
 * - Polls every 10 seconds for reactive updates
 * - Refetches on window focus
 * - Returns loading and error states
 * - Follows useAnalytics pattern from Story 3.1
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { analyticsRepository } from '@/lib/repositories/analyticsRepository';
import { RegionFlareHistory, RegionStatistics } from '@/types/analytics';

/**
 * Options for useRegionAnalytics hook (Task 3.3)
 */
export interface UseRegionAnalyticsOptions {
  /** User ID for multi-user isolation */
  userId: string;
  /** Body region ID to query */
  regionId: string;
}

/**
 * Result from useRegionAnalytics hook (Task 3.4)
 */
export interface UseRegionAnalyticsResult {
  /** Flare history data sorted by startDate descending */
  flares: RegionFlareHistory[];
  /** Region statistics (counts, averages, recurrence rate) */
  statistics: RegionStatistics | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Manual refetch function */
  refetch: () => void;
}

/**
 * Hook for fetching region-specific analytics data with polling.
 * Automatically refetches when flares change or window regains focus.
 * Follows existing hook patterns from useFlares and useAnalytics.
 *
 * @param options - Configuration object with userId and regionId
 * @returns Region analytics data with loading and error states
 */
export function useRegionAnalytics({
  userId,
  regionId
}: UseRegionAnalyticsOptions): UseRegionAnalyticsResult {
  const [flares, setFlares] = useState<RegionFlareHistory[]>([]);
  const [statistics, setStatistics] = useState<RegionStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Task 3.8: Manual refetch function
  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Task 3.5: Fetch region data async function
    const fetchRegionData = async () => {
      if (!userId || !regionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch both flares and statistics in parallel for better performance
        const [flaresData, statsData] = await Promise.all([
          analyticsRepository.getFlaresByRegion(userId, regionId),
          analyticsRepository.getRegionStatistics(userId, regionId)
        ]);

        if (mounted) {
          setFlares(flaresData);
          setStatistics(statsData);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to fetch region analytics:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch region analytics'));
          setIsLoading(false);
        }
      }
    };

    fetchRegionData();

    // Task 3.6: Set up polling for reactive updates (10 seconds matching Story 3.1)
    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchRegionData();
      }
    }, 10000); // Poll every 10 seconds

    // Task 3.7: Refetch when window regains focus
    const handleFocus = () => {
      if (mounted) {
        fetchRegionData();
      }
    };
    window.addEventListener('focus', handleFocus);

    // Task 3.10: Cleanup
    return () => {
      mounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId, regionId, refreshTrigger]);

  // Task 3.9: Return result object
  return {
    flares,
    statistics,
    isLoading,
    error,
    refetch,
  };
}
