/**
 * useAnalytics Hook (Story 3.1 - Task 3)
 *
 * Hook for analytics data fetching with polling for real-time updates.
 * Provides reactive problem areas data following existing hook patterns.
 *
 * AC3.1.6: Real-time updates when flares change
 * - Polls every 10 seconds for reactive updates
 * - Refetches on window focus
 * - Returns loading and error states
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { analyticsRepository } from '@/lib/repositories/analyticsRepository';
import { TimeRange, ProblemArea } from '@/types/analytics';
import { useCurrentUser } from './useCurrentUser';

/**
 * Options for useAnalytics hook
 */
export interface UseAnalyticsOptions {
  /** Time range for analytics data */
  timeRange: TimeRange;
}

/**
 * Result from useAnalytics hook
 */
export interface UseAnalyticsResult {
  /** Problem areas data sorted by frequency */
  problemAreas: ProblemArea[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Manual refetch function */
  refetch: () => void;
}

/**
 * Hook for fetching analytics data with polling.
 * Automatically refetches when flares change or window regains focus.
 * Follows existing hook patterns from useFlares.
 *
 * @param options - Configuration object with timeRange
 * @returns Analytics data with loading and error states
 */
export function useAnalytics({ timeRange }: UseAnalyticsOptions): UseAnalyticsResult {
  const { userId } = useCurrentUser();
  const [problemAreas, setProblemAreas] = useState<ProblemArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchProblemAreas = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await analyticsRepository.getProblemAreas(userId, timeRange);

        if (mounted) {
          setProblemAreas(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to fetch problem areas:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch problem areas'));
          setIsLoading(false);
        }
      }
    };

    fetchProblemAreas();

    // Set up polling for reactive updates (AC3.1.6: 10-second staleTime)
    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchProblemAreas();
      }
    }, 10000); // Poll every 10 seconds

    // Refetch when window regains focus
    const handleFocus = () => {
      if (mounted) {
        fetchProblemAreas();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId, timeRange, refreshTrigger]);

  return {
    problemAreas,
    isLoading,
    error,
    refetch,
  };
}
