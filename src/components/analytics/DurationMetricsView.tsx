/**
 * DurationMetricsView Component (Story 3.3 - Task 5)
 *
 * Displays duration metrics in a grid of MetricCard components.
 * Shows average, median, shortest, and longest flare durations.
 *
 * AC3.3.2, AC3.3.6: Duration metrics with empty state handling
 */

'use client';

import { Clock, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { DurationMetrics } from '@/types/analytics';
import { MetricCard } from './MetricCard';

/**
 * Props for DurationMetricsView component (Task 5.2)
 */
export interface DurationMetricsViewProps {
  /** Duration metrics data or null if loading/unavailable */
  durationMetrics: DurationMetrics | null;

  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * DurationMetricsView component for displaying duration statistics.
 * Renders 4 metric cards in a responsive grid layout.
 *
 * @param props - DurationMetricsView properties
 * @returns Rendered duration metrics section
 */
export function DurationMetricsView({
  durationMetrics,
  isLoading,
}: DurationMetricsViewProps) {
  // Task 5.3: Handle loading state with skeleton cards
  if (isLoading) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Duration Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 bg-gray-100 animate-pulse h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Task 5.5: Display section header */}
      <h3 className="text-xl font-semibold mb-4">Duration Metrics</h3>

      {/* Task 5.6, 5.11: Grid layout with responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task 5.7: Card 1 - Average Duration */}
        <MetricCard
          label="Average Duration"
          value={durationMetrics?.averageDuration ?? null}
          unit="days"
          icon={<Clock className="w-6 h-6" />}
          ariaLabel={`Average duration: ${durationMetrics?.averageDuration ?? 'No data'} days`}
        />

        {/* Task 5.8: Card 2 - Median Duration */}
        <MetricCard
          label="Median Duration"
          value={durationMetrics?.medianDuration ?? null}
          unit="days"
          icon={<TrendingDown className="w-6 h-6" />}
          ariaLabel={`Median duration: ${durationMetrics?.medianDuration ?? 'No data'} days`}
        />

        {/* Task 5.9: Card 3 - Shortest Duration */}
        <MetricCard
          label="Shortest Duration"
          value={durationMetrics?.shortestDuration ?? null}
          unit="days"
          icon={<Minus className="w-6 h-6" />}
          ariaLabel={`Shortest duration: ${durationMetrics?.shortestDuration ?? 'No data'} days`}
        />

        {/* Task 5.10: Card 4 - Longest Duration */}
        <MetricCard
          label="Longest Duration"
          value={durationMetrics?.longestDuration ?? null}
          unit="days"
          icon={<TrendingUp className="w-6 h-6" />}
          ariaLabel={`Longest duration: ${durationMetrics?.longestDuration ?? 'No data'} days`}
        />
      </div>
    </div>
  );
}
