/**
 * Flare Analytics Page (Story 3.1 - Task 8)
 *
 * Analytics dashboard for flare insights and patterns.
 * Primary feature: Problem Areas section (Story 3.1)
 *
 * AC3.1.1: Analytics page displays Problem Areas section
 * Route: /flares/analytics
 */

'use client';

import { ProblemAreasView } from '@/components/analytics/ProblemAreasView';

/**
 * Analytics page metadata
 */
export const metadata = {
  title: 'Flare Analytics',
  description: 'Analyze your flare patterns and identify problem areas',
};

/**
 * Flare Analytics Page component.
 * AC3.1.1: Page header, responsive layout, navigation from main flares page.
 */
export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Page header (AC3.1.1) */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flare Analytics</h1>
        <p className="text-gray-600">
          Analyze your flare patterns, identify problem areas, and track trends over time.
        </p>
      </div>

      {/* Main content area */}
      <div className="space-y-8">
        {/* Problem Areas section (Story 3.1 - AC3.1.1) */}
        <section>
          <ProblemAreasView />
        </section>

        {/* Placeholder for future analytics sections (Stories 3.3-3.5) */}
        <section className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <p className="font-medium mb-2">Additional analytics features coming soon:</p>
          <ul className="text-sm space-y-1">
            <li>• Flare Duration and Severity Metrics (Story 3.3)</li>
            <li>• Flare Trend Analysis Visualization (Story 3.4)</li>
            <li>• Intervention Effectiveness Analysis (Story 3.5)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
