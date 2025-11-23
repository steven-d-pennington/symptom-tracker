/**
 * ProgressionMetricsSection Component (Story 3.3 - Task 11)
 *
 * Main section component for Progression Metrics feature.
 * Displays duration metrics, severity metrics, and visual charts.
 * Handles empty state when insufficient data exists.
 *
 * AC3.3.1, AC3.3.5: Progression Metrics section with shared time range state
 */

'use client';

import { DurationMetrics, SeverityMetrics, TimeRange } from '@/types/analytics';
import { DurationMetricsView } from './DurationMetricsView';
import { SeverityMetricsView } from './SeverityMetricsView';
import { DurationHistogramChart } from './DurationHistogramChart';
import { SeverityDistributionChart } from './SeverityDistributionChart';
import { TrendPieChart } from './TrendPieChart';
import { MetricsEmptyState } from './MetricsEmptyState';

/**
 * Props for ProgressionMetricsSection component (Task 11.2)
 */
export interface ProgressionMetricsSectionProps {
  /** Duration metrics data or null if loading/unavailable */
  durationMetrics: DurationMetrics | null;

  /** Severity metrics data or null if loading/unavailable */
  severityMetrics: SeverityMetrics | null;

  /** Array of duration values in days for histogram */
  durations: number[];

  /** Array of severity values (1-10 scale) for distribution */
  severities: number[];

  /** Loading state indicator */
  isLoading: boolean;

  /** Selected time range for context */
  timeRange: TimeRange;
}

/**
 * ProgressionMetricsSection component for displaying flare progression analytics.
 * Shows duration metrics, severity metrics, and visual charts in organized layout.
 * Handles empty state when fewer than 3 flares exist in selected time range.
 *
 * @param props - ProgressionMetricsSection properties
 * @returns Rendered progression metrics section
 */
export function ProgressionMetricsSection({
  durationMetrics,
  severityMetrics,
  durations,
  severities,
  isLoading,
  timeRange,
}: ProgressionMetricsSectionProps) {
  // Task 11.4: Check if sufficient data (totalFlareCount >= 3)
  const totalFlareCount = severityMetrics?.totalFlareCount || 0;
  const hasInsufficientData = totalFlareCount < 3 && !isLoading;

  return (
    <div className="space-y-6">
      {/* Task 11.3: Render section header */}
      <h2 className="text-2xl font-bold">Progression Metrics</h2>

      {/* Task 11.5: If insufficient, render MetricsEmptyState */}
      {hasInsufficientData ? (
        <MetricsEmptyState flareCount={totalFlareCount} timeRange={timeRange} />
      ) : (
        // Task 11.6-11.12: If sufficient, render three subsections with spacing
        <div className="space-y-8">
          {/* Task 11.7: Duration Metrics subsection */}
          <DurationMetricsView
            durationMetrics={durationMetrics}
            isLoading={isLoading}
          />

          {/* Task 11.8: Severity Metrics subsection */}
          <SeverityMetricsView
            severityMetrics={severityMetrics}
            isLoading={isLoading}
          />

          {/* Task 11.9-11.10: Visualizations subsection with responsive grid */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Visual Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task 11.9: Three charts */}
              <DurationHistogramChart durations={durations} isLoading={isLoading} />
              <SeverityDistributionChart severities={severities} isLoading={isLoading} />
              <TrendPieChart
                trendDistribution={severityMetrics?.trendDistribution || {
                  improving: 0,
                  stable: 0,
                  worsening: 0,
                  noData: 0,
                }}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
