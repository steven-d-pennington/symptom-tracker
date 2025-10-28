/**
 * RegionStatisticsCard Component (Story 3.2 - Task 6)
 *
 * Displays aggregate statistics for a specific body region.
 * Shows total flares, average duration, average severity, and recurrence rate.
 *
 * AC3.2.4: Statistics summary for region
 * - Total flare count (all-time)
 * - Average duration in days (resolved flares only)
 * - Average severity (mean of peak severity values)
 * - Recurrence rate (flares per 90 days)
 * - Grid layout (2x2 on desktop, stack on mobile)
 * - Each statistic has label, value, and icon
 */

'use client';

import { RegionStatistics } from '@/types/analytics';
import { TrendingUp, Clock, Activity, Calendar } from 'lucide-react';

interface RegionStatisticsCardProps {
  /** Region statistics data */
  statistics: RegionStatistics;
}

/**
 * RegionStatisticsCard component displaying aggregate metrics for a body region.
 */
export function RegionStatisticsCard({ statistics }: RegionStatisticsCardProps) {
  // Task 6.6: Average severity color coding (same as flare cards)
  const getSeverityColor = (severity: number | null) => {
    if (severity === null) return 'text-gray-400';
    if (severity >= 7) return 'text-red-600';
    if (severity >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      {/* Task 6.10: Grid layout (2x2 on desktop, stack on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task 6.4: Statistic 1 - Total Flares */}
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Total Flares</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalCount}</p>
          </div>
        </div>

        {/* Task 6.5: Statistic 2 - Average Duration */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-purple-600 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Average Duration</p>
            <p className="text-2xl font-bold text-gray-900">
              {statistics.averageDuration !== null
                ? `${statistics.averageDuration} days`
                : 'No data'}
            </p>
          </div>
        </div>

        {/* Task 6.6: Statistic 3 - Average Severity */}
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-orange-600 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Average Severity</p>
            <p className={`text-2xl font-bold ${getSeverityColor(statistics.averageSeverity)}`}>
              {statistics.averageSeverity !== null
                ? `${statistics.averageSeverity}/10`
                : 'No data'}
            </p>
          </div>
        </div>

        {/* Task 6.7: Statistic 4 - Recurrence Rate */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-green-600 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Recurrence Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof statistics.recurrenceRate === 'number'
                ? `${statistics.recurrenceRate} per 90d`
                : statistics.recurrenceRate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
