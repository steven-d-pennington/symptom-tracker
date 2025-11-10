/**
 * InsightsEmptyState Component (Story 6.4 - Task 8)
 *
 * Friendly empty state shown when insufficient data for insights.
 * Displays message, progress indicator, and call-to-action button.
 *
 * AC6.4.7: Implement empty state
 */

'use client';

import Link from 'next/link';
import { LightbulbOff } from 'lucide-react';

interface InsightsEmptyStateProps {
  loggedDaysCount: number;
  requiredDays?: number;
}

/**
 * InsightsEmptyState Component
 *
 * Shows when:
 * - No correlations exist
 * - User has logged data for <10 days
 * - No correlations meet significance threshold
 * - Selected time range has no data
 *
 * @param loggedDaysCount - Number of days user has logged data
 * @param requiredDays - Minimum days required for insights (default 10)
 */
export function InsightsEmptyState({
  loggedDaysCount,
  requiredDays = 10,
}: InsightsEmptyStateProps) {
  const progress = Math.min((loggedDaysCount / requiredDays) * 100, 100);
  const daysRemaining = Math.max(requiredDays - loggedDaysCount, 0);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <LightbulbOff className="w-16 h-16 text-gray-400 mb-4" aria-hidden="true" />

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Insights Yet</h2>

      {/* Message */}
      <p className="text-gray-600 mb-6 max-w-md">
        {daysRemaining > 0 ? (
          <>
            Log data for at least <strong>{requiredDays} days</strong> to see insights. Keep
            tracking your symptoms, food, and triggers to discover patterns.
          </>
        ) : (
          <>
            You've logged enough data, but we haven't found any significant correlations yet. Keep
            logging consistently to discover patterns.
          </>
        )}
      </p>

      {/* Progress indicator */}
      {daysRemaining > 0 && (
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span className="font-medium">
              {loggedDaysCount} / {requiredDays} days logged
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={loggedDaysCount}
              aria-valuemin={0}
              aria-valuemax={requiredDays}
              aria-label={`${loggedDaysCount} of ${requiredDays} days logged`}
            />
          </div>

          {/* Days remaining text */}
          <p className="text-sm text-gray-500 mt-2">
            {daysRemaining === 1
              ? '1 more day needed'
              : `${daysRemaining} more days needed`}
          </p>
        </div>
      )}

      {/* Call-to-action button */}
      <Link
        href="/daily-log"
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
      >
        Start Logging Data
      </Link>

      {/* Helpful tip */}
      <p className="text-sm text-gray-500 mt-6 max-w-md">
        Tip: Consistently log your daily symptoms, food intake, and triggers to help us identify
        meaningful patterns in your health data.
      </p>
    </div>
  );
}
