/**
 * useAnalytics Hook (Story 3.1 - Task 3)
 *
 * React Query hook for analytics data fetching.
 * Provides reactive problem areas data with automatic cache invalidation.
 *
 * AC3.1.6: Real-time updates when flares change
 * - Uses React Query with 10-second staleTime
 * - Refetches on window focus
 * - Returns loading and error states
 */

'use client';

import { useQuery } from '@tanstack/react-query';
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
}

/**
 * Hook for fetching analytics data using React Query.
 * Automatically refetches when flares change or window regains focus.
 *
 * @param options - Configuration object with timeRange
 * @returns Analytics data with loading and error states
 */
export function useAnalytics({ timeRange }: UseAnalyticsOptions): UseAnalyticsResult {
  const { userId } = useCurrentUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'problemAreas', userId, timeRange],
    queryFn: () => analyticsRepository.getProblemAreas(userId, timeRange),
    staleTime: 10000, // 10 seconds - allows reactive updates when flares change
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    enabled: !!userId, // Only run query if userId is available
  });

  return {
    problemAreas: data || [],
    isLoading,
    error: error as Error | null,
  };
}
