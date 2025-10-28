# Story 3.3: Flare Duration and Severity Metrics

Status: ready-for-dev

## Story

As a user tracking flare patterns,
I want to see statistical summaries of flare duration and severity,
So that I can understand typical outcomes and identify outliers.

## Acceptance Criteria

1. **AC3.3.1 — Analytics page displays Progression Metrics section:** Add "Progression Metrics" section to existing `/flares/analytics` page (from Story 3.1), section appears below Problem Areas section, section header includes title and uses same time range selector from Problem Areas (shared state), follows responsive layout patterns from Stories 3.1 and 3.2 (grid on desktop, stack on mobile). [Source: docs/epics.md#Story-3.3] [Source: docs/solution-architecture.md#Epic-3]

2. **AC3.3.2 — Duration metrics displayed with statistical summaries:** Display duration statistics calculated from analyticsRepository.getDurationMetrics(userId, timeRange): (1) average flare duration in days (mean of all resolved flares, rounded to 1 decimal), (2) median flare duration in days (50th percentile, rounded to 1 decimal), (3) shortest duration in days (minimum from resolved flares), (4) longest duration in days (maximum from resolved flares), metrics only calculated from resolved flares (status === 'Resolved'), active flares excluded from duration calculations, each metric displayed as card with label, value, and icon (Clock, TrendingDown, TrendingUp icons from lucide-react). [Source: docs/epics.md#Story-3.3] [Source: docs/PRD.md#FR012]

3. **AC3.3.3 — Severity metrics and trend distribution displayed:** Display severity statistics from analyticsRepository.getSeverityMetrics(userId, timeRange): (1) average peak severity (mean of all peak severity values from flares, rounded to 1 decimal, color-coded 1-3 green, 4-6 yellow, 7-10 red), (2) severity trend distribution showing percentage breakdown: % improving (trend === 'Improving'), % stable (trend === 'Stable'), % worsening (trend === 'Worsening'), % no data (trend === 'N/A'), percentages calculated from most recent trend value per flare, displayed as cards with color-coded values (improving green, stable gray, worsening red). [Source: docs/epics.md#Story-3.3]

4. **AC3.3.4 — Visual charts for metrics:** Display three chart visualizations: (1) Duration Histogram showing distribution of flare durations in day buckets (0-7 days, 8-14 days, 15-30 days, 31-60 days, 60+ days) using Chart.js bar chart with count per bucket, (2) Severity Distribution showing count of flares by severity level (1-3, 4-6, 7-10) using Chart.js bar chart with color coding, (3) Trend Pie Chart showing proportion of flares by trend outcome (Improving/Stable/Worsening/N/A) using Chart.js pie chart with segment colors matching trend colors from Story 3.2, all charts responsive with maintainAspectRatio configuration, charts use canvas for performance per solution-architecture.md. [Source: docs/epics.md#Story-3.3] [Source: docs/solution-architecture.md#Technology-Stack]

5. **AC3.3.5 — Metrics update with time range changes:** Progression Metrics section shares time range state with Problem Areas section (Story 3.1), changing time range in selector triggers recalculation of all metrics and charts for new time range, metrics use same useAnalytics hook pattern with 10-second polling from Story 3.1, loading skeleton shown during recalculation, smooth transitions when data updates. [Source: docs/epics.md#Story-3.3] [Source: docs/stories/story-3.1.md]

6. **AC3.3.6 — Empty state for insufficient data:** MetricsEmptyState component displays when fewer than 3 flares exist in selected time range, shows message "Insufficient data to calculate metrics" with explanation "At least 3 flares are needed for meaningful statistical analysis", suggests selecting different time range or logging more flares, follows empty state patterns from Stories 3.1 and 3.2 (semantic structure, helpful messaging), includes count of current flares in range ("Currently 1 flare in this range"). [Source: docs/epics.md#Story-3.3] [Source: docs/stories/story-3.1.md]

7. **AC3.3.7 — Metrics accessibility and screen reader support:** All metric cards include ARIA labels describing metric name and value, charts include aria-label with summary statistics, keyboard navigation through metric cards using Tab key, focus indicators clearly visible on interactive elements, metric values announced by screen readers with context (e.g., "Average duration: 12.5 days"), color coding supplemented with text labels for color-blind accessibility, follows WCAG 2.1 AA standards per NFR001. [Source: docs/epics.md#Story-3.3] [Source: docs/PRD.md#NFR001]

## Tasks / Subtasks

- [ ] Task 1: Extend analyticsRepository with metrics calculations (AC: #3.3.2, #3.3.3)
  - [ ] 1.1: Open `src/lib/repositories/analyticsRepository.ts` from Stories 3.1 and 3.2
  - [ ] 1.2: Define DurationMetrics interface in `src/types/analytics.ts`: { averageDuration: number | null, medianDuration: number | null, shortestDuration: number | null, longestDuration: number | null, resolvedFlareCount: number }
  - [ ] 1.3: Define SeverityMetrics interface in `src/types/analytics.ts`: { averagePeakSeverity: number | null, trendDistribution: { improving: number, stable: number, worsening: number, noData: number }, totalFlareCount: number }
  - [ ] 1.4: Implement getDurationMetrics(userId: string, timeRange: TimeRange): Promise<DurationMetrics>
  - [ ] 1.5: Query flares table: `db.flares.where({ userId, status: 'Resolved' }).toArray()`, filter by timeRange using withinTimeRange utility
  - [ ] 1.6: Calculate duration for each resolved flare: (endDate - startDate) in days
  - [ ] 1.7: Calculate averageDuration: sum of all durations / count, round to 1 decimal, null if no resolved flares
  - [ ] 1.8: Calculate medianDuration: sort durations, get middle value (or average of two middle values for even count), null if no resolved flares
  - [ ] 1.9: Calculate shortestDuration: Math.min(...durations), null if no resolved flares
  - [ ] 1.10: Calculate longestDuration: Math.max(...durations), null if no resolved flares
  - [ ] 1.11: Return DurationMetrics object with resolvedFlareCount
  - [ ] 1.12: Implement getSeverityMetrics(userId: string, timeRange: TimeRange): Promise<SeverityMetrics>
  - [ ] 1.13: Query all flares (active and resolved): `db.flares.where({ userId }).toArray()`, filter by timeRange
  - [ ] 1.14: For each flare, get peak severity from flareEvents table (max severity value, fallback to initial severity)
  - [ ] 1.15: Calculate averagePeakSeverity: sum of peak severities / count, round to 1 decimal, null if no flares
  - [ ] 1.16: For each flare, get most recent trend from flareEvents (eventType === 'status_update'), default 'N/A'
  - [ ] 1.17: Calculate trendDistribution: count flares by trend category, convert to percentages
  - [ ] 1.18: Return SeverityMetrics object with totalFlareCount
  - [ ] 1.19: Add TypeScript return type annotations and JSDoc comments

- [ ] Task 2: Create histogram and distribution calculation utilities (AC: #3.3.4)
  - [ ] 2.1: Create `src/lib/utils/histogramUtils.ts` file
  - [ ] 2.2: Define DurationBucket type: { label: string, minDays: number, maxDays: number | null, count: number }
  - [ ] 2.3: Implement calculateDurationHistogram(durations: number[]): DurationBucket[]
  - [ ] 2.4: Define buckets: [{ label: '0-7 days', min: 0, max: 7 }, { label: '8-14 days', min: 8, max: 14 }, { label: '15-30 days', min: 15, max: 30 }, { label: '31-60 days', min: 31, max: 60 }, { label: '60+ days', min: 60, max: null }]
  - [ ] 2.5: For each bucket, count durations falling within range
  - [ ] 2.6: Return array of DurationBucket objects with counts
  - [ ] 2.7: Define SeverityRange type: { label: string, range: string, color: string, count: number }
  - [ ] 2.8: Implement calculateSeverityDistribution(severities: number[]): SeverityRange[]
  - [ ] 2.9: Define ranges: [{ label: 'Mild', range: '1-3', color: 'green' }, { label: 'Moderate', range: '4-6', color: 'yellow' }, { label: 'Severe', range: '7-10', color: 'red' }]
  - [ ] 2.10: For each range, count severities within bounds
  - [ ] 2.11: Return array of SeverityRange objects with counts
  - [ ] 2.12: Export all types and functions

- [ ] Task 3: Extend useAnalytics hook for metrics data (AC: #3.3.5)
  - [ ] 3.1: Open `src/lib/hooks/useAnalytics.ts` from Story 3.1
  - [ ] 3.2: Add durationMetrics state: const [durationMetrics, setDurationMetrics] = useState<DurationMetrics | null>(null)
  - [ ] 3.3: Add severityMetrics state: const [severityMetrics, setSeverityMetrics] = useState<SeverityMetrics | null>(null)
  - [ ] 3.4: Update fetchData function to call analyticsRepository.getDurationMetrics and getSeverityMetrics in parallel with getProblemAreas
  - [ ] 3.5: Use Promise.all to fetch all three data sets concurrently
  - [ ] 3.6: Update states when data fetched: setDurationMetrics, setSeverityMetrics
  - [ ] 3.7: Return durationMetrics and severityMetrics in hook result object
  - [ ] 3.8: Maintain existing polling pattern (10 seconds) and window focus refetch
  - [ ] 3.9: Handle errors for new metrics gracefully (log but don't break UI)

- [ ] Task 4: Create MetricCard component (AC: #3.3.2, #3.3.3, #3.3.7)
  - [ ] 4.1: Create `src/components/analytics/MetricCard.tsx` component
  - [ ] 4.2: Accept props: label (string), value (number | string | null), unit (string, optional), icon (ReactNode), color (string, optional), ariaLabel (string)
  - [ ] 4.3: Display card with border, rounded, p-4, bg-white
  - [ ] 4.4: Render icon in top-left with specified color
  - [ ] 4.5: Render label as text-sm text-gray-600
  - [ ] 4.6: Render value as text-2xl font-bold with optional color class
  - [ ] 4.7: Append unit to value if provided (e.g., "12.5 days")
  - [ ] 4.8: Handle null values: display "No data" in gray
  - [ ] 4.9: Add aria-label prop for screen readers
  - [ ] 4.10: Add tabIndex={0} for keyboard navigation
  - [ ] 4.11: Style with Tailwind, responsive sizing
  - [ ] 4.12: Follow MetricCard pattern from Story 3.1 RegionStatisticsCard

- [ ] Task 5: Create DurationMetricsView component (AC: #3.3.2, #3.3.6)
  - [ ] 5.1: Create `src/components/analytics/DurationMetricsView.tsx` component
  - [ ] 5.2: Accept props: durationMetrics (DurationMetrics | null), isLoading (boolean)
  - [ ] 5.3: Handle loading state: show skeleton cards (4 placeholders)
  - [ ] 5.4: Handle insufficient data: if durationMetrics?.resolvedFlareCount < 3, show MetricsEmptyState
  - [ ] 5.5: Display section header: "Duration Metrics"
  - [ ] 5.6: Render grid layout: 4 MetricCard components (2x2 on desktop, stack on mobile)
  - [ ] 5.7: Card 1: Average Duration with Clock icon, value durationMetrics.averageDuration, unit "days"
  - [ ] 5.8: Card 2: Median Duration with TrendingDown icon, value durationMetrics.medianDuration, unit "days"
  - [ ] 5.9: Card 3: Shortest Duration with minimalist icon, value durationMetrics.shortestDuration, unit "days"
  - [ ] 5.10: Card 4: Longest Duration with TrendingUp icon, value durationMetrics.longestDuration, unit "days"
  - [ ] 5.11: Add responsive container styling: grid grid-cols-1 md:grid-cols-2 gap-4
  - [ ] 5.12: Follow grid layout patterns from Story 3.2 RegionStatisticsCard

- [ ] Task 6: Create SeverityMetricsView component (AC: #3.3.3, #3.3.6)
  - [ ] 6.1: Create `src/components/analytics/SeverityMetricsView.tsx` component
  - [ ] 6.2: Accept props: severityMetrics (SeverityMetrics | null), isLoading (boolean)
  - [ ] 6.3: Handle loading state: show skeleton cards
  - [ ] 6.4: Handle insufficient data: if severityMetrics?.totalFlareCount < 3, show MetricsEmptyState
  - [ ] 6.5: Display section header: "Severity Metrics"
  - [ ] 6.6: Render grid layout: 5 MetricCard components
  - [ ] 6.7: Card 1: Average Peak Severity with Activity icon, value severityMetrics.averagePeakSeverity, color coding (green/yellow/red)
  - [ ] 6.8: Card 2: Improving Trend % with ArrowDownRight icon, value trendDistribution.improving, unit "%", color green
  - [ ] 6.9: Card 3: Stable Trend % with ArrowRight icon, value trendDistribution.stable, unit "%", color gray
  - [ ] 6.10: Card 4: Worsening Trend % with ArrowUpRight icon, value trendDistribution.worsening, unit "%", color red
  - [ ] 6.11: Card 5: No Data % with HelpCircle icon, value trendDistribution.noData, unit "%", color gray
  - [ ] 6.12: Calculate severity color: getSeverityColor helper (1-3 green, 4-6 yellow, 7-10 red)
  - [ ] 6.13: Add responsive grid: grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4

- [ ] Task 7: Create DurationHistogramChart component (AC: #3.3.4)
  - [ ] 7.1: Create `src/components/analytics/DurationHistogramChart.tsx` component
  - [ ] 7.2: Accept props: durations (number[]), isLoading (boolean)
  - [ ] 7.3: Import Chart.js from existing dependency (solution-architecture.md)
  - [ ] 7.4: Use calculateDurationHistogram utility to get bucket data
  - [ ] 7.5: Configure Chart.js with type: 'bar', data: bucket counts, labels: bucket labels
  - [ ] 7.6: Set bar colors: gradient from light blue to dark blue
  - [ ] 7.7: Configure x-axis: categorical labels for buckets
  - [ ] 7.8: Configure y-axis: integer ticks, label "Number of Flares"
  - [ ] 7.9: Add chart title: "Flare Duration Distribution"
  - [ ] 7.10: Make responsive: maintainAspectRatio false, responsive true
  - [ ] 7.11: Add aria-label summarizing data: "Duration histogram showing X flares across Y buckets"
  - [ ] 7.12: Handle loading state: show skeleton chart placeholder
  - [ ] 7.13: Use canvas element for Chart.js rendering

- [ ] Task 8: Create SeverityDistributionChart component (AC: #3.3.4)
  - [ ] 8.1: Create `src/components/analytics/SeverityDistributionChart.tsx` component
  - [ ] 8.2: Accept props: severities (number[]), isLoading (boolean)
  - [ ] 8.3: Use calculateSeverityDistribution utility to get range data
  - [ ] 8.4: Configure Chart.js with type: 'bar', data: range counts, labels: range labels (Mild/Moderate/Severe)
  - [ ] 8.5: Set bar colors matching severity colors: green (#10b981), yellow (#eab308), red (#ef4444)
  - [ ] 8.6: Configure x-axis: categorical labels
  - [ ] 8.7: Configure y-axis: integer ticks, label "Number of Flares"
  - [ ] 8.8: Add chart title: "Severity Distribution"
  - [ ] 8.9: Make responsive with same config as histogram
  - [ ] 8.10: Add aria-label summarizing severity breakdown
  - [ ] 8.11: Handle loading state with skeleton

- [ ] Task 9: Create TrendPieChart component (AC: #3.3.4)
  - [ ] 9.1: Create `src/components/analytics/TrendPieChart.tsx` component
  - [ ] 9.2: Accept props: trendDistribution ({ improving, stable, worsening, noData }), isLoading (boolean)
  - [ ] 9.3: Configure Chart.js with type: 'pie', data: trend percentages, labels: ['Improving', 'Stable', 'Worsening', 'No Data']
  - [ ] 9.4: Set segment colors: green (#10b981), gray (#6b7280), red (#ef4444), light gray (#d1d5db)
  - [ ] 9.5: Configure legend: position 'right' on desktop, 'bottom' on mobile
  - [ ] 9.6: Add tooltips showing percentage and count
  - [ ] 9.7: Add chart title: "Flare Trend Outcomes"
  - [ ] 9.8: Make responsive with maintainAspectRatio false
  - [ ] 9.9: Add aria-label: "Pie chart showing X% improving, Y% stable, Z% worsening"
  - [ ] 9.10: Handle loading state with skeleton
  - [ ] 9.11: Handle empty data: show message "No trend data available"

- [ ] Task 10: Create MetricsEmptyState component (AC: #3.3.6)
  - [ ] 10.1: Create `src/components/analytics/MetricsEmptyState.tsx` component
  - [ ] 10.2: Accept props: flareCount (number), timeRange (TimeRange)
  - [ ] 10.3: Display heading: "Insufficient data to calculate metrics"
  - [ ] 10.4: Display explanation: "At least 3 flares are needed for meaningful statistical analysis."
  - [ ] 10.5: Display current count: "Currently {flareCount} flare(s) in this range."
  - [ ] 10.6: Suggest action: "Try selecting a different time range or continue tracking flares."
  - [ ] 10.7: Add BarChart3 icon from lucide-react
  - [ ] 10.8: Style with bg-gray-50, rounded, p-8, text-center
  - [ ] 10.9: Follow empty state patterns from Stories 3.1 and 3.2
  - [ ] 10.10: Add semantic HTML structure (section, heading hierarchy)

- [ ] Task 11: Create ProgressionMetricsSection component (AC: #3.3.1, #3.3.5)
  - [ ] 11.1: Create `src/components/analytics/ProgressionMetricsSection.tsx` component
  - [ ] 11.2: Accept props: durationMetrics (DurationMetrics | null), severityMetrics (SeverityMetrics | null), durations (number[]), severities (number[]), isLoading (boolean), timeRange (TimeRange)
  - [ ] 11.3: Render section header: "Progression Metrics"
  - [ ] 11.4: Check if sufficient data: totalFlareCount >= 3
  - [ ] 11.5: If insufficient, render MetricsEmptyState with flareCount and timeRange
  - [ ] 11.6: If sufficient, render three subsections: Duration Metrics, Severity Metrics, Visualizations
  - [ ] 11.7: Render DurationMetricsView component passing durationMetrics and isLoading
  - [ ] 11.8: Render SeverityMetricsView component passing severityMetrics and isLoading
  - [ ] 11.9: Render Visualizations subsection with three charts: DurationHistogramChart, SeverityDistributionChart, TrendPieChart
  - [ ] 11.10: Use responsive grid for charts: grid grid-cols-1 lg:grid-cols-3 gap-6
  - [ ] 11.11: Add spacing between subsections: space-y-8
  - [ ] 11.12: Handle loading state with skeletons throughout

- [ ] Task 12: Update analytics page to include Progression Metrics (AC: #3.3.1)
  - [ ] 12.1: Open `src/app/(protected)/flares/analytics/page.tsx` from Story 3.1
  - [ ] 12.2: Import ProgressionMetricsSection component
  - [ ] 12.3: Access extended hook data: const { problemAreas, durationMetrics, severityMetrics, isLoading } = useAnalytics({ timeRange })
  - [ ] 12.4: Calculate durations array from resolved flares for histogram
  - [ ] 12.5: Calculate severities array from all flares for distribution
  - [ ] 12.6: Render ProgressionMetricsSection below ProblemAreasView
  - [ ] 12.7: Pass all required props to ProgressionMetricsSection
  - [ ] 12.8: Ensure timeRange state is shared between Problem Areas and Progression Metrics
  - [ ] 12.9: Add spacing: space-y-8 between sections
  - [ ] 12.10: Remove placeholder for future analytics (Story 3.3 now implemented)

- [ ] Task 13: Add comprehensive tests (AC: All)
  - [ ] 13.1: Update `src/lib/repositories/__tests__/analyticsRepository.test.ts`
  - [ ] 13.2: Test getDurationMetrics returns correct average, median, shortest, longest
  - [ ] 13.3: Test getDurationMetrics handles edge cases: no resolved flares, single flare, even/odd count for median
  - [ ] 13.4: Test getDurationMetrics filters by time range correctly
  - [ ] 13.5: Test getSeverityMetrics calculates average peak severity correctly
  - [ ] 13.6: Test getSeverityMetrics calculates trend distribution percentages accurately
  - [ ] 13.7: Test getSeverityMetrics handles edge cases: no flares, all same trend, missing trend data
  - [ ] 13.8: Create `src/lib/utils/__tests__/histogramUtils.test.ts`
  - [ ] 13.9: Test calculateDurationHistogram assigns flares to correct buckets
  - [ ] 13.10: Test calculateDurationHistogram handles boundary values (e.g., exactly 7 days, 14 days)
  - [ ] 13.11: Test calculateSeverityDistribution groups severities correctly (1-3, 4-6, 7-10)
  - [ ] 13.12: Create `src/components/analytics/__tests__/MetricCard.test.tsx`
  - [ ] 13.13: Test MetricCard renders label, value, unit, icon
  - [ ] 13.14: Test MetricCard handles null values with "No data"
  - [ ] 13.15: Test MetricCard applies color classes correctly
  - [ ] 13.16: Test MetricCard accessibility: aria-label, keyboard navigation
  - [ ] 13.17: Create `src/components/analytics/__tests__/ProgressionMetricsSection.test.tsx`
  - [ ] 13.18: Test ProgressionMetricsSection shows empty state when < 3 flares
  - [ ] 13.19: Test ProgressionMetricsSection renders all subsections when data sufficient
  - [ ] 13.20: Test ProgressionMetricsSection shows loading skeletons during fetch
  - [ ] 13.21: Test charts render with correct data
  - [ ] 13.22: Test metrics update when time range changes
  - [ ] 13.23: Test accessibility: ARIA labels, keyboard navigation, screen reader compatibility
  - [ ] 13.24: Test color coding for severity metrics (green/yellow/red ranges)

## Dev Notes

### Architecture Context

- **Epic 3 Continuation:** Story 3.3 builds on Stories 3.1 (Problem Areas) and 3.2 (Per-Region History) by adding statistical analysis of flare outcomes. This completes the core metrics feature set before trend analysis (3.4) and intervention effectiveness (3.5). [Source: docs/epics.md#Epic-3]
- **Data Foundation:** Leverages complete flare lifecycle data from Epic 2 (Stories 2.1-2.8) including FlareRecord entities with startDate, endDate, status, and FlareEvent records with severity and trend data. [Source: docs/stories/story-2.1.md] [Source: docs/epics.md#Story-3.3]
- **Analytics Extension:** Extends analyticsRepository from Stories 3.1 and 3.2 with new methods getDurationMetrics and getSeverityMetrics, maintaining separation of concerns and testability. [Source: docs/solution-architecture.md#Repository-Architecture]
- **Shared Time Range State:** Progression Metrics section shares time range state with Problem Areas section (Story 3.1), ensuring consistent time filtering across all analytics views. [Source: docs/stories/story-3.1.md]
- **Chart.js Integration:** Uses Chart.js (existing dependency per solution-architecture.md) for histogram, bar chart, and pie chart visualizations, maintaining consistency with timeline features from Story 3.2. [Source: docs/solution-architecture.md#Technology-Stack]
- **Offline-First Architecture:** All metrics calculations use Dexie queries on IndexedDB following NFR002, no network dependency, consistent with existing patterns. [Source: docs/PRD.md#NFR002]

### Implementation Guidance

**1. Extend analyticsRepository with metrics calculations:**

```typescript
// src/lib/repositories/analyticsRepository.ts (extend existing from Stories 3.1 and 3.2)
import { db } from '@/lib/db/database';
import { FlareRecord } from '@/types/flare';
import { DurationMetrics, SeverityMetrics } from '@/types/analytics';
import { withinTimeRange, TimeRange } from '@/lib/utils/timeRange';

export const analyticsRepository = {
  // ... existing getProblemAreas and getFlaresByRegion from Stories 3.1 and 3.2 ...

  async getDurationMetrics(userId: string, timeRange: TimeRange): Promise<DurationMetrics> {
    // Fetch only resolved flares within time range
    const allFlares = await db.flares.where({ userId, status: 'Resolved' }).toArray();
    const flaresInRange = allFlares.filter(f => withinTimeRange(f, timeRange));

    if (flaresInRange.length === 0) {
      return {
        averageDuration: null,
        medianDuration: null,
        shortestDuration: null,
        longestDuration: null,
        resolvedFlareCount: 0
      };
    }

    // Calculate durations in days
    const durations = flaresInRange.map(flare => {
      const durationMs = (flare.endDate! - flare.startDate);
      return Math.round(durationMs / (24 * 60 * 60 * 1000));
    });

    // Sort for median calculation
    const sortedDurations = [...durations].sort((a, b) => a - b);

    // Calculate average
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // Calculate median
    const midIndex = Math.floor(sortedDurations.length / 2);
    const medianDuration = sortedDurations.length % 2 === 0
      ? (sortedDurations[midIndex - 1] + sortedDurations[midIndex]) / 2
      : sortedDurations[midIndex];

    // Get shortest and longest
    const shortestDuration = Math.min(...durations);
    const longestDuration = Math.max(...durations);

    return {
      averageDuration: Math.round(averageDuration * 10) / 10,
      medianDuration: Math.round(medianDuration * 10) / 10,
      shortestDuration,
      longestDuration,
      resolvedFlareCount: flaresInRange.length
    };
  },

  async getSeverityMetrics(userId: string, timeRange: TimeRange): Promise<SeverityMetrics> {
    // Fetch all flares (active and resolved) within time range
    const allFlares = await db.flares.where({ userId }).toArray();
    const flaresInRange = allFlares.filter(f => withinTimeRange(f, timeRange));

    if (flaresInRange.length === 0) {
      return {
        averagePeakSeverity: null,
        trendDistribution: {
          improving: 0,
          stable: 0,
          worsening: 0,
          noData: 0
        },
        totalFlareCount: 0
      };
    }

    // Calculate peak severity for each flare
    const peakSeverities: number[] = [];
    const trends: string[] = [];

    for (const flare of flaresInRange) {
      // Get peak severity from flare events
      const events = await db.flareEvents
        .where({ flareId: flare.id })
        .toArray();

      const severityValues = events
        .filter(e => e.severity !== undefined)
        .map(e => e.severity!);
      const peakSeverity = severityValues.length > 0
        ? Math.max(...severityValues)
        : flare.initialSeverity || 0;

      peakSeverities.push(peakSeverity);

      // Get most recent trend
      const statusUpdates = events
        .filter(e => e.eventType === 'status_update')
        .sort((a, b) => b.timestamp - a.timestamp);
      const trend = statusUpdates.length > 0
        ? statusUpdates[0].trend || 'N/A'
        : 'N/A';

      trends.push(trend);
    }

    // Calculate average peak severity
    const averagePeakSeverity = peakSeverities.reduce((sum, s) => sum + s, 0) / peakSeverities.length;

    // Calculate trend distribution
    const trendCounts = {
      improving: trends.filter(t => t === 'Improving').length,
      stable: trends.filter(t => t === 'Stable').length,
      worsening: trends.filter(t => t === 'Worsening').length,
      noData: trends.filter(t => t === 'N/A').length
    };

    const totalFlares = flaresInRange.length;
    const trendDistribution = {
      improving: Math.round((trendCounts.improving / totalFlares) * 1000) / 10,
      stable: Math.round((trendCounts.stable / totalFlares) * 1000) / 10,
      worsening: Math.round((trendCounts.worsening / totalFlares) * 1000) / 10,
      noData: Math.round((trendCounts.noData / totalFlares) * 1000) / 10
    };

    return {
      averagePeakSeverity: Math.round(averagePeakSeverity * 10) / 10,
      trendDistribution,
      totalFlareCount: totalFlares
    };
  }
};
```

**2. Histogram utility functions:**

```typescript
// src/lib/utils/histogramUtils.ts
export interface DurationBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  count: number;
}

export interface SeverityRange {
  label: string;
  range: string;
  color: string;
  count: number;
}

export function calculateDurationHistogram(durations: number[]): DurationBucket[] {
  const buckets: DurationBucket[] = [
    { label: '0-7 days', minDays: 0, maxDays: 7, count: 0 },
    { label: '8-14 days', minDays: 8, maxDays: 14, count: 0 },
    { label: '15-30 days', minDays: 15, maxDays: 30, count: 0 },
    { label: '31-60 days', minDays: 31, maxDays: 60, count: 0 },
    { label: '60+ days', minDays: 60, maxDays: null, count: 0 }
  ];

  durations.forEach(duration => {
    const bucket = buckets.find(b => {
      if (b.maxDays === null) {
        return duration >= b.minDays;
      }
      return duration >= b.minDays && duration <= b.maxDays;
    });
    if (bucket) {
      bucket.count++;
    }
  });

  return buckets;
}

export function calculateSeverityDistribution(severities: number[]): SeverityRange[] {
  const ranges: SeverityRange[] = [
    { label: 'Mild', range: '1-3', color: 'green', count: 0 },
    { label: 'Moderate', range: '4-6', color: 'yellow', count: 0 },
    { label: 'Severe', range: '7-10', color: 'red', count: 0 }
  ];

  severities.forEach(severity => {
    if (severity >= 1 && severity <= 3) {
      ranges[0].count++;
    } else if (severity >= 4 && severity <= 6) {
      ranges[1].count++;
    } else if (severity >= 7 && severity <= 10) {
      ranges[2].count++;
    }
  });

  return ranges;
}
```

**3. MetricCard component:**

```typescript
// src/components/analytics/MetricCard.tsx
'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: number | string | null;
  unit?: string;
  icon: ReactNode;
  color?: string;
  ariaLabel: string;
}

export function MetricCard({ label, value, unit, icon, color, ariaLabel }: MetricCardProps) {
  const displayValue = value !== null ? `${value}${unit ? ` ${unit}` : ''}` : 'No data';
  const valueClass = value !== null ? (color || 'text-gray-900') : 'text-gray-400';

  return (
    <div
      className="border rounded-lg p-4 bg-white"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`${color || 'text-gray-600'}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueClass}`}>
        {displayValue}
      </p>
    </div>
  );
}
```

**4. ProgressionMetricsSection component:**

```typescript
// src/components/analytics/ProgressionMetricsSection.tsx
'use client';

import { DurationMetrics, SeverityMetrics, TimeRange } from '@/types/analytics';
import { DurationMetricsView } from './DurationMetricsView';
import { SeverityMetricsView } from './SeverityMetricsView';
import { DurationHistogramChart } from './DurationHistogramChart';
import { SeverityDistributionChart } from './SeverityDistributionChart';
import { TrendPieChart } from './TrendPieChart';
import { MetricsEmptyState } from './MetricsEmptyState';

interface ProgressionMetricsSectionProps {
  durationMetrics: DurationMetrics | null;
  severityMetrics: SeverityMetrics | null;
  durations: number[];
  severities: number[];
  isLoading: boolean;
  timeRange: TimeRange;
}

export function ProgressionMetricsSection({
  durationMetrics,
  severityMetrics,
  durations,
  severities,
  isLoading,
  timeRange
}: ProgressionMetricsSectionProps) {
  const totalFlareCount = severityMetrics?.totalFlareCount || 0;
  const hasInsufficientData = totalFlareCount < 3;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progression Metrics</h2>

      {hasInsufficientData && !isLoading ? (
        <MetricsEmptyState flareCount={totalFlareCount} timeRange={timeRange} />
      ) : (
        <div className="space-y-8">
          {/* Duration Metrics */}
          <DurationMetricsView
            durationMetrics={durationMetrics}
            isLoading={isLoading}
          />

          {/* Severity Metrics */}
          <SeverityMetricsView
            severityMetrics={severityMetrics}
            isLoading={isLoading}
          />

          {/* Visualizations */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Visual Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DurationHistogramChart durations={durations} isLoading={isLoading} />
              <SeverityDistributionChart severities={severities} isLoading={isLoading} />
              <TrendPieChart
                trendDistribution={severityMetrics?.trendDistribution || { improving: 0, stable: 0, worsening: 0, noData: 0 }}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Project Structure Notes

**New Files to Create:**
- Update `src/types/analytics.ts` - Add DurationMetrics and SeverityMetrics interfaces
- Extend `src/lib/repositories/analyticsRepository.ts` - Add getDurationMetrics and getSeverityMetrics methods
- Update `src/lib/hooks/useAnalytics.ts` - Extend hook to return durationMetrics and severityMetrics
- Create `src/lib/utils/histogramUtils.ts` - Histogram and distribution calculation utilities
- Create `src/components/analytics/MetricCard.tsx` - Reusable metric display card
- Create `src/components/analytics/DurationMetricsView.tsx` - Duration metrics display section
- Create `src/components/analytics/SeverityMetricsView.tsx` - Severity metrics display section
- Create `src/components/analytics/DurationHistogramChart.tsx` - Duration histogram Chart.js component
- Create `src/components/analytics/SeverityDistributionChart.tsx` - Severity distribution Chart.js component
- Create `src/components/analytics/TrendPieChart.tsx` - Trend pie chart Chart.js component
- Create `src/components/analytics/MetricsEmptyState.tsx` - Empty state for insufficient data
- Create `src/components/analytics/ProgressionMetricsSection.tsx` - Main section component
- Update `src/app/(protected)/flares/analytics/page.tsx` - Add ProgressionMetricsSection to analytics page

**Existing Dependencies:**
- `src/lib/db/database.ts` (Dexie instance) ✅
- `src/lib/db/schema.ts` (FlareRecord, FlareEventRecord interfaces) ✅
- `src/lib/repositories/analyticsRepository.ts` (from Stories 3.1 and 3.2) ✅
- `src/lib/hooks/useAnalytics.ts` (from Story 3.1) ✅
- `src/lib/utils/timeRange.ts` (from Story 3.1) ✅
- Chart.js and chartjs-plugin-annotation (per solution-architecture.md) ✅
- lucide-react icons (existing dependency) ✅

**Alignment with Solution Architecture:**
- Extends analyticsRepository pattern from Stories 3.1 and 3.2
- Follows hook pattern from Epic 2 and Story 3.1 (useAnalytics extension)
- Maintains offline-first architecture: Components → Hook → Repository → Dexie → IndexedDB
- Uses Chart.js as specified in solution-architecture.md technology stack
- Follows component architecture: ProgressionMetricsSection → MetricsViews → MetricCards
- Shares time range state with Problem Areas section (Story 3.1)

### Data & State Considerations

- **Duration Calculations:** Only use resolved flares (status === 'Resolved') for duration metrics, as active flares don't have final duration yet
- **Median Calculation:** For even-count arrays, median is average of two middle values; for odd-count, median is middle value
- **Peak Severity:** Query flareEvents table for max severity value, fallback to initialSeverity if no events exist
- **Trend Outcome:** Extract from most recent flareEvent with eventType="status_update", default to "N/A" if no status updates
- **Severity Color Coding:** 1-3 green (#10b981), 4-6 yellow (#eab308), 7-10 red (#ef4444)
- **Trend Colors:** Improving green, Stable gray, Worsening red, No Data light gray
- **Histogram Buckets:** Use inclusive ranges (0-7 includes both 0 and 7), 60+ is open-ended
- **Percentage Rounding:** Round to 1 decimal place for all metrics (e.g., 12.3%)
- **Insufficient Data Threshold:** < 3 flares considered insufficient for meaningful statistics
- **Shared State:** Time range state shared between Problem Areas and Progression Metrics sections
- **Loading State:** Show skeleton placeholders during initial fetch and refetch

### Testing Strategy

**Unit Tests:**
- analyticsRepository.getDurationMetrics: average, median, min, max calculations, edge cases (0, 1, 2 flares, even/odd count)
- analyticsRepository.getSeverityMetrics: average peak severity, trend distribution percentages, edge cases
- histogramUtils.calculateDurationHistogram: bucket assignment, boundary values
- histogramUtils.calculateSeverityDistribution: range grouping (1-3, 4-6, 7-10)
- MetricCard: rendering, null value handling, color application, accessibility

**Integration Tests:**
- ProgressionMetricsSection: empty state when < 3 flares, renders all subsections with sufficient data
- Metrics views: display correct values, loading states, update on time range change
- Charts: render with correct data, handle empty data, responsive sizing
- Shared state: time range changes affect both Problem Areas and Progression Metrics

**Accessibility Tests:**
- Keyboard navigation through metric cards (Tab key)
- ARIA labels on all interactive elements and charts
- Screen reader compatibility for metric values and chart summaries
- Color coding supplemented with text labels
- Focus indicators visible and clear

### Performance Considerations

- **Query Performance:** Dexie indexed queries on userId+status are O(log n), acceptable for <1000 flares
- **Calculation Overhead:** Duration and severity calculations are O(n*m) where n=flares, m=avg events per flare; typically <100ms
- **Chart Rendering:** Chart.js canvas rendering handles 50-100 data points efficiently (<100ms render time)
- **Memoization:** Consider useMemo for expensive calculations (histogram, distribution) if re-render frequency high
- **Shared Fetching:** Fetch all metrics (problem areas, duration, severity) in parallel using Promise.all
- **Loading Skeleton:** Show skeleton placeholders during fetch to indicate loading state
- **Polling Pattern:** Maintain 10-second polling from Story 3.1 for reactive updates

### References

- [Source: docs/epics.md#Story-3.3] - Complete story specification with 6 acceptance criteria
- [Source: docs/PRD.md#FR012] - Flare progression metrics requirement
- [Source: docs/PRD.md#NFR001] - Performance requirement (<100ms interactions, WCAG 2.1 AA)
- [Source: docs/PRD.md#NFR002] - Offline-first IndexedDB persistence
- [Source: docs/solution-architecture.md#Epic-3] - Analytics component architecture
- [Source: docs/solution-architecture.md#Technology-Stack] - Chart.js and chartjs-plugin-annotation versions
- [Source: docs/solution-architecture.md#ADR-004] - On-demand calculation strategy
- [Source: docs/stories/story-2.1.md] - FlareRecord and flareEvents data model
- [Source: docs/stories/story-3.1.md] - Analytics patterns, empty states, time range selector, useAnalytics hook
- [Source: docs/stories/story-3.2.md] - Regional analytics patterns, metric card layouts

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-28 | Initial story creation | SM Agent (claude-sonnet-4-5) |

---

## Dev Agent Record

### Context Reference

- docs/stories/3-3-flare-duration-and-severity-metrics.context.xml (generated 2025-10-28)

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
