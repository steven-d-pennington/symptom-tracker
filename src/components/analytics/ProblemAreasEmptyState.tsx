/**
 * ProblemAreasEmptyState Component (Story 3.1 - Task 7)
 *
 * Empty state display when no flares exist in selected time range.
 * Follows Story 0.2 empty state patterns.
 *
 * AC3.1.4: Empty state for insufficient data
 */

'use client';

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { TimeRange } from '@/types/analytics';
import { getTimeRangeLabel } from '@/lib/utils/timeRange';

export interface ProblemAreasEmptyStateProps {
  /** Current time range selection */
  timeRange: TimeRange;
}

/**
 * Empty state component for problem areas.
 * AC3.1.4: Shows helpful message and link to create new flare.
 */
export function ProblemAreasEmptyState({ timeRange }: ProblemAreasEmptyStateProps) {
  const timeRangeLabel = getTimeRangeLabel(timeRange);

  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-gray-200 p-4">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
      </div>

      {/* Heading (AC3.1.4) */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No flares recorded in this time range
      </h3>

      {/* Message (AC3.1.4) */}
      <p className="text-gray-600 mb-6">
        Try selecting a different time range or log your first flare using the body map.
      </p>

      {/* Action link (AC3.1.4) */}
      <Link
        href="/body-map"
        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
      >
        Create New Flare →
      </Link>

      {/* Additional context */}
      <p className="text-xs text-gray-500 mt-4">
        Currently viewing: {timeRangeLabel}
      </p>
    </div>
  );
}
