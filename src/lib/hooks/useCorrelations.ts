/**
 * useCorrelations Hook (Story 6.4 - Task 4)
 *
 * Custom React hook for querying correlation data from IndexedDB.
 * Handles loading state, error handling, and time range filtering.
 *
 * Foundation for AC6.4.3, AC6.4.4, AC6.4.5
 */

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CorrelationResult, TimeRange, timeRangeToMs } from '@/types/correlation';
import { correlationRepository } from '@/lib/repositories/correlationRepository';

interface UseCorrelationsResult {
  correlations: CorrelationResult[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to query correlations with time range filtering
 *
 * Workflow:
 * 1. Query all correlations for user from repository
 * 2. Filter by calculatedAt timestamp within time range
 * 3. Filter by significance (isSignificant or |coefficient| >= 0.3)
 * 4. Return filtered correlations with loading/error states
 *
 * @param userId - User ID
 * @param timeRange - Time range filter (7d, 30d, 90d)
 * @returns Object with correlations, isLoading, error
 */
export function useCorrelations(
  userId: string,
  timeRange: TimeRange | 'all' = '30d'
): UseCorrelationsResult {
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCorrelations() {
      try {
        setIsLoading(true);
        setError(null);

        // Query all correlations for user
        const allCorrelations = await correlationRepository.findAll(userId);

        // Filter correlations by time range and significance
        const targetRange = timeRange === 'all' ? '90d' : timeRange;

        const filtered = allCorrelations.filter((correlation) => {
          // Check if correlation belongs to the selected time range
          const isCorrectRange = correlation.timeRange === targetRange;

          // Check if correlation is significant
          // Story 6.3 already filters at repository level, but double-check here
          const isSignificant = Math.abs(correlation.coefficient) >= 0.3;

          return isCorrectRange && isSignificant;
        });

        if (isMounted) {
          setCorrelations(filtered);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load correlations'));
          setIsLoading(false);
        }
      }
    }

    fetchCorrelations();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [userId, timeRange]);

  return { correlations, isLoading, error };
}

/**
 * Hook to get count of logged days for empty state
 *
 * @param userId - User ID
 * @returns Object with loggedDaysCount, isLoading, error
 */
export function useLoggedDaysCount(userId: string): {
  loggedDaysCount: number;
  isLoading: boolean;
  error: Error | null;
} {
  const [loggedDaysCount, setLoggedDaysCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function countLoggedDays() {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import dailyLogsRepository to avoid circular dependencies
        const { dailyLogsRepository } = await import('@/lib/repositories/dailyLogsRepository');

        // Query all daily logs for user (using date strings for compatibility)
        // Use a very old start date to get all logs
        const startDate = '1970-01-01';
        const endDate = format(new Date(), 'yyyy-MM-dd');
        const logs = await dailyLogsRepository.listByDateRange(userId, startDate, endDate);

        // Count unique dates
        const uniqueDates = new Set(logs.map((log) => log.date));
        const count = uniqueDates.size;

        if (isMounted) {
          setLoggedDaysCount(count);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to count logged days'));
          setIsLoading(false);
        }
      }
    }

    countLoggedDays();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { loggedDaysCount, isLoading, error };
}
