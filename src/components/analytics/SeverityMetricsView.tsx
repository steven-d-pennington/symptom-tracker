/**
 * SeverityMetricsView Component (Story 3.3 - Task 6)
 *
 * Displays severity metrics and trend distribution in a grid of MetricCard components.
 * Shows average peak severity and trend percentages (improving, stable, worsening, no data).
 *
 * AC3.3.3, AC3.3.6: Severity metrics with color coding and empty state handling
 */

'use client';

import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import { SeverityMetrics } from '@/types/analytics';
import { MetricCard } from './MetricCard';

/**
 * Props for SeverityMetricsView component (Task 6.2)
 */
export interface SeverityMetricsViewProps {
  /** Severity metrics data or null if loading/unavailable */
  severityMetrics: SeverityMetrics | null;

  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * Get color class for severity value based on 1-10 scale.
 * Task 6.12: Color coding - 1-3 green, 4-6 yellow, 7-10 red
 *
 * @param severity - Severity value (1-10 scale)
 * @returns Tailwind color class
 */
function getSeverityColor(severity: number | null): string {
  if (severity === null) return 'text-gray-400';
  if (severity >= 1 && severity <= 3) return 'text-green-600';
  if (severity >= 4 && severity <= 6) return 'text-yellow-600';
  if (severity >= 7 && severity <= 10) return 'text-red-600';
  return 'text-gray-900';
}

/**
 * SeverityMetricsView component for displaying severity statistics.
 * Renders 5 metric cards in a responsive grid layout.
 *
 * @param props - SeverityMetricsView properties
 * @returns Rendered severity metrics section
 */
export function SeverityMetricsView({
  severityMetrics,
  isLoading,
}: SeverityMetricsViewProps) {
  // Task 6.3: Handle loading state with skeleton cards
  if (isLoading) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Severity Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 bg-gray-100 animate-pulse h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  // Get color for average peak severity
  const severityColor = getSeverityColor(severityMetrics?.averagePeakSeverity ?? null);

  return (
    <div>
      {/* Task 6.5: Display section header */}
      <h3 className="text-xl font-semibold mb-4">Severity Metrics</h3>

      {/* Task 6.6, 6.13: Grid layout with responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Task 6.7: Card 1 - Average Peak Severity with color coding */}
        <MetricCard
          label="Avg Peak Severity"
          value={severityMetrics?.averagePeakSeverity ?? null}
          icon={<Activity className="w-6 h-6" />}
          color={severityColor}
          ariaLabel={`Average peak severity: ${severityMetrics?.averagePeakSeverity ?? 'No data'}`}
        />

        {/* Task 6.8: Card 2 - Improving Trend % */}
        <MetricCard
          label="Improving"
          value={severityMetrics?.trendDistribution.improving ?? null}
          unit="%"
          icon={<ArrowDownRight className="w-6 h-6" />}
          color="text-green-600"
          ariaLabel={`Improving trend: ${severityMetrics?.trendDistribution.improving ?? 'No data'} percent`}
        />

        {/* Task 6.9: Card 3 - Stable Trend % */}
        <MetricCard
          label="Stable"
          value={severityMetrics?.trendDistribution.stable ?? null}
          unit="%"
          icon={<ArrowRight className="w-6 h-6" />}
          color="text-gray-600"
          ariaLabel={`Stable trend: ${severityMetrics?.trendDistribution.stable ?? 'No data'} percent`}
        />

        {/* Task 6.10: Card 4 - Worsening Trend % */}
        <MetricCard
          label="Worsening"
          value={severityMetrics?.trendDistribution.worsening ?? null}
          unit="%"
          icon={<ArrowUpRight className="w-6 h-6" />}
          color="text-red-600"
          ariaLabel={`Worsening trend: ${severityMetrics?.trendDistribution.worsening ?? 'No data'} percent`}
        />

        {/* Task 6.11: Card 5 - No Data % */}
        <MetricCard
          label="No Data"
          value={severityMetrics?.trendDistribution.noData ?? null}
          unit="%"
          icon={<HelpCircle className="w-6 h-6" />}
          color="text-gray-600"
          ariaLabel={`No trend data: ${severityMetrics?.trendDistribution.noData ?? 'No data'} percent`}
        />
      </div>
    </div>
  );
}
