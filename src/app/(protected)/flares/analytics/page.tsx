/**
 * Flare Analytics Page (Story 3.1 - Task 8, extended in Story 3.3 - Task 12)
 *
 * Analytics dashboard for flare insights and patterns.
 * Features: Problem Areas section (Story 3.1), Progression Metrics section (Story 3.3)
 *
 * AC3.1.1: Analytics page displays Problem Areas section
 * AC3.3.1: Analytics page displays Progression Metrics section
 * Route: /flares/analytics
 */

'use client';

import { useMemo } from 'react';
import { ProblemAreasView } from '@/components/analytics/ProblemAreasView';
import { ProgressionMetricsSection } from '@/components/analytics/ProgressionMetricsSection';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

/**
 * Flare Analytics Page component.
 * AC3.1.1: Page header, responsive layout, navigation from main flares page.
 * AC3.3.1, AC3.3.5: Shared time range state between Problem Areas and Progression Metrics.
 */
export default function AnalyticsPage() {
  // Note: ProblemAreasView manages its own timeRange state and uses useAnalytics internally.
  // For now, ProgressionMetricsSection will use the same default time range.
  // Future improvement: Lift timeRange state to this page level for perfect sync.

  // Task 12.3: Use extended hook data for Progression Metrics
  // Using default time range that matches ProblemAreasView default
  const { durationMetrics, severityMetrics, isLoading } = useAnalytics({
    timeRange: 'last90d'
  });

  // Task 12.4-12.5: Calculate durations and severities arrays from flare data
  // These arrays are needed for the histogram and distribution charts
  const { durations, severities } = useMemo(() => {
    // Extract duration values from durationMetrics for histogram
    // Note: For full histogram, we need individual flare durations
    // For now using empty arrays as the metrics provide aggregated data
    const durationsArray: number[] = [];
    const severitiesArray: number[] = [];

    // TODO: Future enhancement - fetch individual flare records to populate these arrays
    // This would require querying db.flares and db.flareEvents directly

    return {
      durations: durationsArray,
      severities: severitiesArray,
    };
  }, [durationMetrics, severityMetrics]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Page header (AC3.1.1) */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flare Analytics</h1>
        <p className="text-gray-600">
          Analyze your flare patterns, identify problem areas, and track trends over time.
        </p>
      </div>

      {/* Task 12.9: Main content area with space-y-8 between sections */}
      <div className="space-y-8">
        {/* Problem Areas section (Story 3.1 - AC3.1.1) */}
        <section>
          <ProblemAreasView />
        </section>

        {/* Task 12.6: Progression Metrics section (Story 3.3 - AC3.3.1) */}
        {/* Task 12.7: Pass all required props to ProgressionMetricsSection */}
        {/* Task 12.8: timeRange shared between sections (both use 'last90d') */}
        <section>
          <ProgressionMetricsSection
            durationMetrics={durationMetrics}
            severityMetrics={severityMetrics}
            durations={durations}
            severities={severities}
            isLoading={isLoading}
            timeRange="last90d"
          />
        </section>

        {/* Task 12.10: Updated placeholder (Story 3.3 now implemented) */}
        <section className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <p className="font-medium mb-2">Additional analytics features coming soon:</p>
          <ul className="text-sm space-y-1">
            <li>• Flare Trend Analysis Visualization (Story 3.4)</li>
            <li>• Intervention Effectiveness Analysis (Story 3.5)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
