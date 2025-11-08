/**
 * Flare Analytics Page (Story 3.1 - Task 8, extended in Story 3.3 - Task 12, Story 3.4 - Task 7, Story 3.5 - Task 8)
 *
 * Analytics dashboard for flare insights and patterns.
 * Features: Problem Areas section (Story 3.1), Progression Metrics section (Story 3.3),
 * Flare Trends section (Story 3.4), Intervention Effectiveness section (Story 3.5)
 *
 * AC3.1.1: Analytics page displays Problem Areas section
 * AC3.3.1: Analytics page displays Progression Metrics section
 * AC3.4.1: Analytics page displays Flare Trends visualization
 * AC3.5.1: Analytics page displays Intervention Effectiveness section
 * Route: /flares/analytics
 */

'use client';

import { ProblemAreasView } from '@/components/analytics/ProblemAreasView';
import { ProgressionMetricsSection } from '@/components/analytics/ProgressionMetricsSection';
import { TrendAnalysisSection } from '@/components/analytics/TrendAnalysisSection';
import { InterventionEffectivenessSection } from '@/components/analytics/InterventionEffectivenessSection';
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

  // Fetch all analytics data including distribution arrays
  const {
    durationMetrics,
    severityMetrics,
    trendAnalysis,
    interventionEffectiveness,
    durations,
    severities,
    isLoading
  } = useAnalytics({
    timeRange: 'last90d'
  });

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

        {/* Story 3.4 - Task 7.4-7.5: Flare Trends section (AC3.4.1) */}
        {/* Task 7.6: Maintain space-y-8 between sections for consistent spacing */}
        <section>
          <TrendAnalysisSection
            trendAnalysis={trendAnalysis}
            isLoading={isLoading}
            timeRange="last90d"
          />
        </section>

        {/* Story 3.5 - Task 8.4-8.6: Intervention Effectiveness section (AC3.5.1) */}
        {/* Task 8.6: Maintain space-y-8 between sections for consistent spacing */}
        <section>
          <InterventionEffectivenessSection
            interventionEffectiveness={interventionEffectiveness}
            isLoading={isLoading}
          />
        </section>
      </div>
    </div>
  );
}
