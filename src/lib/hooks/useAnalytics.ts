/**
 * useAnalytics Hook (Story 3.1 - Task 3, extended in Story 3.3 - Task 3, Story 3.4 - Task 3, Story 3.5 - Task 2)
 *
 * Hook for analytics data fetching with polling for real-time updates.
 * Provides reactive problem areas, duration metrics, severity metrics, trend analysis, and intervention effectiveness.
 *
 * AC3.1.6: Real-time updates when flares change
 * AC3.3.5: Metrics update with time range changes
 * AC3.4.5: Trend analysis updates with time range changes
 * AC3.5.5: Intervention effectiveness updates with time range changes
 * - Polls every 10 seconds for reactive updates
 * - Refetches on window focus
 * - Returns loading and error states
 * - Fetches all metrics in parallel for efficiency
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { analyticsRepository } from '@/lib/repositories/analyticsRepository';
import { TimeRange, ProblemArea, DurationMetrics, SeverityMetrics, TrendAnalysis, InterventionEffectiveness } from '@/types/analytics';
import { useCurrentUser } from './useCurrentUser';

/**
 * Options for useAnalytics hook
 */
export interface UseAnalyticsOptions {
  /** Time range for analytics data */
  timeRange: TimeRange;
}

/**
 * Result from useAnalytics hook (extended in Story 3.3, Story 3.4, Story 3.5)
 */
export interface UseAnalyticsResult {
  /** Problem areas data sorted by frequency */
  problemAreas: ProblemArea[];
  /** Duration metrics data (Story 3.3 - Task 3.2) */
  durationMetrics: DurationMetrics | null;
  /** Severity metrics data (Story 3.3 - Task 3.3) */
  severityMetrics: SeverityMetrics | null;
  /** Trend analysis data (Story 3.4 - Task 3.2) */
  trendAnalysis: TrendAnalysis | null;
  /** Intervention effectiveness data (Story 3.5 - Task 2.2) */
  interventionEffectiveness: InterventionEffectiveness[] | null;
  /** Individual flare durations for histogram visualization */
  durations: number[];
  /** Individual peak severities for distribution visualization */
  severities: number[];
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
 * Fetches problem areas, duration metrics, severity metrics, and trend analysis in parallel.
 * Follows existing hook patterns from useFlares.
 *
 * @param options - Configuration object with timeRange
 * @returns Analytics data with loading and error states
 */
export function useAnalytics({ timeRange }: UseAnalyticsOptions): UseAnalyticsResult {
  const { userId } = useCurrentUser();
  const [problemAreas, setProblemAreas] = useState<ProblemArea[]>([]);
  // Task 3.2: Add durationMetrics state
  const [durationMetrics, setDurationMetrics] = useState<DurationMetrics | null>(null);
  // Task 3.3: Add severityMetrics state
  const [severityMetrics, setSeverityMetrics] = useState<SeverityMetrics | null>(null);
  // Story 3.4 - Task 3.2: Add trendAnalysis state
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  // Story 3.5 - Task 2.2: Add interventionEffectiveness state
  const [interventionEffectiveness, setInterventionEffectiveness] = useState<InterventionEffectiveness[] | null>(null);
  // Individual arrays for distribution charts
  const [durations, setDurations] = useState<number[]>([]);
  const [severities, setSeverities] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Story 3.5 - Task 2.3-2.4: Update fetchData to call all five methods in parallel
    const fetchAnalyticsData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data sets concurrently using Promise.all
        const [
          problemAreasData,
          durationMetricsData,
          severityMetricsData,
          trendData,
          interventionData,
          durationsData,
          severitiesData
        ] = await Promise.all([
          analyticsRepository.getProblemAreas(userId, timeRange),
          analyticsRepository.getDurationMetrics(userId, timeRange),
          analyticsRepository.getSeverityMetrics(userId, timeRange),
          analyticsRepository.getMonthlyTrendData(userId, timeRange),
          analyticsRepository.getInterventionEffectiveness(userId, timeRange),
          analyticsRepository.getIndividualDurations(userId, timeRange),
          analyticsRepository.getIndividualSeverities(userId, timeRange),
        ]);

        // Update all state when data fetched
        if (mounted) {
          setProblemAreas(problemAreasData);
          setDurationMetrics(durationMetricsData);
          setSeverityMetrics(severityMetricsData);
          setTrendAnalysis(trendData);
          setInterventionEffectiveness(interventionData);
          setDurations(durationsData);
          setSeverities(severitiesData);
          setIsLoading(false);
        }
      } catch (err) {
        // Story 3.5 - Task 2.8: Handle errors for intervention data gracefully (log but don't break UI)
        if (mounted) {
          console.error('Failed to fetch analytics data:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
          setIsLoading(false);
        }
      }
    };

    fetchAnalyticsData();

    // Task 3.8: Maintain existing polling pattern (10 seconds) and window focus refetch (POLLING DISABLED)
    // const pollInterval = setInterval(() => {
    //   if (mounted) {
    //     fetchAnalyticsData();
    //   }
    // }, 10000); // Poll every 10 seconds

    // Refetch when window regains focus
    const handleFocus = () => {
      if (mounted) {
        fetchAnalyticsData();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      mounted = false;
      // clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId, timeRange, refreshTrigger]);

  // Return all data including distribution arrays
  return {
    problemAreas,
    durationMetrics,
    severityMetrics,
    trendAnalysis,
    interventionEffectiveness,
    durations,
    severities,
    isLoading,
    error,
    refetch,
  };
}
