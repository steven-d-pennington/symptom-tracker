/**
 * ProblemAreasView Component (Story 3.1 - Task 6)
 *
 * Main problem areas component with time range selector and data display.
 * Handles loading, error, and empty states.
 *
 * AC3.1.1: Analytics page displays Problem Areas section
 * AC3.1.2: Problem areas ranked by flare frequency
 * AC3.1.3: Time range selector with multiple options
 * AC3.1.4: Empty state for insufficient data
 * AC3.1.6: Real-time updates when flares change
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { TimeRange } from '@/types/analytics';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ProblemAreaRow } from './ProblemAreaRow';
import { ProblemAreasEmptyState } from './ProblemAreasEmptyState';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { getTimeRangeLabel } from '@/lib/utils/timeRange';

/**
 * Problem Areas View component.
 * Displays problem areas with time range filtering and interactive navigation.
 */
export function ProblemAreasView() {
  const router = useRouter();
  const { userId } = useCurrentUser();

  // AC3.1.3: Default time range is Last 90 days
  const [timeRange, setTimeRange] = useState<TimeRange>('last90d');

  // AC3.1.3: Load time range preference from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;

    try {
      const saved = localStorage.getItem(`analytics-time-range-${userId}`);
      if (saved && ['last30d', 'last90d', 'lastYear', 'allTime'].includes(saved)) {
        setTimeRange(saved as TimeRange);
      }
    } catch (error) {
      console.error('Failed to load time range preference:', error);
    }
  }, [userId]);

  // AC3.1.3: Save time range to localStorage when changed
  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;

    try {
      localStorage.setItem(`analytics-time-range-${userId}`, timeRange);
    } catch (error) {
      console.error('Failed to save time range preference:', error);
    }
  }, [timeRange, userId]);

  // AC3.1.6: Fetch problem areas with reactive updates
  const { problemAreas, isLoading, error } = useAnalytics({ timeRange });

  // AC3.1.2: Calculate max count for bar chart scaling
  const maxCount = problemAreas.length > 0
    ? Math.max(...problemAreas.map((p) => p.flareCount))
    : 0;

  // AC3.1.5: Navigate to per-region flare history page
  const handleRegionClick = (regionId: string) => {
    router.push(`/flares/analytics/regions/${regionId}`);
  };

  // Loading state (AC3.1.6)
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Problem Areas - {getTimeRangeLabel(timeRange)}
          </h2>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Skeleton loading (AC3.1.6) */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Problem Areas - {getTimeRangeLabel(timeRange)}
          </h2>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading problem areas: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline hover:text-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-4">
      {/* Section header with time range selector (AC3.1.1, AC3.1.3) */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Problem Areas - {getTimeRangeLabel(timeRange)}
        </h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Problem areas list or empty state (AC3.1.2, AC3.1.4) */}
      {problemAreas.length === 0 ? (
        <ProblemAreasEmptyState timeRange={timeRange} />
      ) : (
        <div className="space-y-3">
          {problemAreas.map((problemArea) => (
            <ProblemAreaRow
              key={problemArea.bodyRegionId}
              problemArea={problemArea}
              maxCount={maxCount}
              onClick={handleRegionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
