/**
 * MetricsEmptyState Component (Story 3.3 - Task 10)
 *
 * Empty state component displayed when insufficient data exists for metrics.
 * Follows empty state patterns from Stories 3.1 and 3.2.
 *
 * AC3.3.6: Empty state for insufficient data
 */

'use client';

import { BarChart3 } from 'lucide-react';
import { TimeRange } from '@/types/analytics';
import { getTimeRangeLabel } from '@/lib/utils/timeRange';

/**
 * Props for MetricsEmptyState component (Task 10.2)
 */
export interface MetricsEmptyStateProps {
  /** Current flare count in the selected time range */
  flareCount: number;

  /** Selected time range for context */
  timeRange: TimeRange;
}

/**
 * MetricsEmptyState component for displaying insufficient data message.
 * Shows when fewer than 3 flares exist in the selected time range.
 * Provides helpful guidance to users.
 *
 * @param props - MetricsEmptyState properties
 * @returns Rendered empty state message
 */
export function MetricsEmptyState({
  flareCount,
  timeRange,
}: MetricsEmptyStateProps) {
  const timeRangeLabel = getTimeRangeLabel(timeRange);

  return (
    // Task 10.8-10.10: Style with bg-gray-50, rounded, p-8, text-center, semantic HTML
    <section className="bg-gray-50 rounded-lg p-8 text-center">
      {/* Task 10.7: Add BarChart3 icon */}
      <div className="flex justify-center mb-4">
        <BarChart3 className="w-12 h-12 text-gray-400" />
      </div>

      {/* Task 10.3: Display heading */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Insufficient data to calculate metrics
      </h3>

      {/* Task 10.4: Display explanation */}
      <p className="text-gray-600 mb-2">
        At least 3 flares are needed for meaningful statistical analysis.
      </p>

      {/* Task 10.5: Display current count */}
      <p className="text-gray-600 mb-4">
        Currently {flareCount} flare{flareCount !== 1 ? 's' : ''} in {timeRangeLabel.toLowerCase()}.
      </p>

      {/* Task 10.6: Suggest action */}
      <p className="text-sm text-gray-500">
        Try selecting a different time range or continue tracking flares.
      </p>
    </section>
  );
}
