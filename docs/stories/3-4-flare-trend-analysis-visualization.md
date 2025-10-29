# Story 3.4: Flare Trend Analysis Visualization

Status: ready-for-dev

## Story

As a user reviewing my overall flare management,
I want to see how my flares are trending over time,
So that I can assess if my condition is improving or declining.

## Acceptance Criteria

1. **AC3.4.1 — Analytics page displays Flare Trends visualization:** Add "Flare Trends" section to existing `/flares/analytics` page (from Stories 3.1 and 3.3), section appears below Progression Metrics section, section header includes title and uses same time range selector state, follows responsive layout patterns from previous stories (grid on desktop, stack on mobile). [Source: docs/epics.md#Story-3.4]

2. **AC3.4.2 — Line chart displays flare frequency over time:** Display interactive line chart showing flare frequency grouped into monthly buckets using Chart.js with TimeScale, x-axis shows month labels (MMM YYYY format), y-axis shows count of flares per month, data points connected with smooth curves (tension: 0.4), chart includes grid lines for readability, responsive configuration with maintainAspectRatio. [Source: docs/epics.md#Story-3.4] [Source: docs/solution-architecture.md#Technology-Stack]

3. **AC3.4.3 — Overlay shows average severity per month:** Second dataset overlaid on same chart displaying average peak severity per month, uses secondary y-axis (right side, scale 1-10), different color from frequency line (frequency blue, severity orange/red), severity data points shown as circles with connecting lines, legend distinguishes between frequency and severity datasets. [Source: docs/epics.md#Story-3.4]

4. **AC3.4.4 — Trend line indicates overall trajectory:** Calculate and display linear regression trend line showing overall trajectory (improving/stable/declining), trend line rendered using chartjs-plugin-annotation, trend direction label displayed ("Improving", "Stable", "Declining") with color coding (green/gray/red), calculation uses least squares regression on monthly flare counts, minimum 3 months data required to show trend. [Source: docs/epics.md#Story-3.4] [Source: docs/solution-architecture.md#Technology-Stack]

5. **AC3.4.5 — Time range selector with extended options:** Time range selector includes options specific to trend analysis: Last 6 months, Last Year, Last 2 Years, All Time, selector shares state management pattern from Stories 3.1 and 3.3, selection persists in localStorage per user, changing range recalculates monthly buckets and trend line, smooth transitions when data updates. [Source: docs/epics.md#Story-3.4]

6. **AC3.4.6 — Interactive chart with hover and details:** Chart responds to user interaction: hover over data point shows tooltip with exact values (month, flare count, average severity), tooltip formatted clearly with labels and units, tap/click on month shows month detail modal (future enhancement placeholder), chart maintains interactivity on mobile with touch events, ARIA labels for screen readers describing chart data. [Source: docs/epics.md#Story-3.4] [Source: docs/PRD.md#NFR001]

7. **AC3.4.7 — Export chart as image for medical consultations:** "Export Chart" button below visualization, clicking button generates PNG image of current chart view, download triggered with filename format "flare-trends-{YYYY-MM-DD}.png", exported image includes chart title, date range, and trend direction label, image resolution suitable for printing (min 1200px wide), export functionality works on desktop and mobile browsers. [Source: docs/epics.md#Story-3.4]

## Tasks / Subtasks

- [ ] Task 1: Extend analyticsRepository with trend calculation methods (AC: #3.4.2, #3.4.3, #3.4.4)
  - [ ] 1.1: Define TrendDataPoint interface in `src/types/analytics.ts`: { month: string, monthTimestamp: number, flareCount: number, averageSeverity: number | null }
  - [ ] 1.2: Define TrendAnalysis interface: { dataPoints: TrendDataPoint[], trendLine: { slope: number, intercept: number }, trendDirection: 'improving' | 'stable' | 'declining' | 'insufficient-data' }
  - [ ] 1.3: Implement getMonthlyTrendData(userId: string, timeRange: TimeRange): Promise<TrendAnalysis>
  - [ ] 1.4: Query all flares (active and resolved) within time range from db.flares
  - [ ] 1.5: Group flares by month using startDate (format: YYYY-MM)
  - [ ] 1.6: For each month bucket, calculate: flare count, average peak severity (from flareEvents table)
  - [ ] 1.7: Sort month buckets chronologically (oldest to newest)
  - [ ] 1.8: Calculate linear regression trend line using least squares method (slope and intercept)
  - [ ] 1.9: Determine trend direction: improving (slope < -0.3), declining (slope > 0.3), stable (between -0.3 and 0.3), insufficient-data (< 3 months)
  - [ ] 1.10: Return TrendAnalysis object with data points and trend metadata
  - [ ] 1.11: Add TypeScript return type annotations and JSDoc comments
  - [ ] 1.12: Export getMonthlyTrendData from analyticsRepository

- [ ] Task 2: Create linear regression utility (AC: #3.4.4)
  - [ ] 2.1: Create `src/lib/utils/linearRegression.ts` file
  - [ ] 2.2: Define RegressionResult interface: { slope: number, intercept: number, r2: number }
  - [ ] 2.3: Implement calculateLinearRegression(dataPoints: {x: number, y: number}[]): RegressionResult
  - [ ] 2.4: Calculate means of x and y values
  - [ ] 2.5: Calculate slope using least squares formula: Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²)
  - [ ] 2.6: Calculate intercept: ȳ - slope * x̄
  - [ ] 2.7: Calculate R² (coefficient of determination) for trend quality metric
  - [ ] 2.8: Handle edge cases: empty array, single point, vertical line
  - [ ] 2.9: Return RegressionResult with rounded values (4 decimals for slope/intercept)
  - [ ] 2.10: Export calculateLinearRegression function

- [ ] Task 3: Extend useAnalytics hook for trend data (AC: #3.4.5)
  - [ ] 3.1: Open `src/lib/hooks/useAnalytics.ts` from Stories 3.1 and 3.3
  - [ ] 3.2: Add trendAnalysis state: const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null)
  - [ ] 3.3: Update fetchAnalyticsData function to call analyticsRepository.getMonthlyTrendData in parallel with existing methods
  - [ ] 3.4: Use Promise.all to fetch all four data sets concurrently (problemAreas, durationMetrics, severityMetrics, trendAnalysis)
  - [ ] 3.5: Update trendAnalysis state when data fetched: setTrendAnalysis(trendData)
  - [ ] 3.6: Return trendAnalysis in hook result object
  - [ ] 3.7: Maintain existing polling pattern (10 seconds) and window focus refetch
  - [ ] 3.8: Handle errors for trend data gracefully (log but don't break UI)

- [ ] Task 4: Create FlareTrendChart component (AC: #3.4.2, #3.4.3, #3.4.4, #3.4.6)
  - [ ] 4.1: Create `src/components/analytics/FlareTrendChart.tsx` component
  - [ ] 4.2: Accept props: trendAnalysis (TrendAnalysis | null), isLoading (boolean), timeRange (TimeRange)
  - [ ] 4.3: Import Chart.js components: Line chart, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend
  - [ ] 4.4: Import chartjs-plugin-annotation for trend line overlay
  - [ ] 4.5: Register Chart.js components and plugins
  - [ ] 4.6: Handle loading state: show skeleton loader (h-96 animate-pulse)
  - [ ] 4.7: Handle insufficient data: show empty state message if trendDirection === 'insufficient-data' or no data points
  - [ ] 4.8: Configure Chart.js with type 'line' and dual y-axes (left: flare count, right: severity 1-10)
  - [ ] 4.9: Dataset 1 (Flare Frequency): line chart, blue color (rgb(59, 130, 246)), yAxisID: 'y-frequency', tension: 0.4, borderWidth: 2
  - [ ] 4.10: Dataset 2 (Average Severity): line chart, orange/red color (rgb(249, 115, 22)), yAxisID: 'y-severity', tension: 0.4, pointRadius: 4
  - [ ] 4.11: Configure x-axis: type: 'time', time.unit: 'month', time.displayFormats.month: 'MMM YYYY', grid lines enabled
  - [ ] 4.12: Configure y-axes: left (frequency, integers, starts at 0), right (severity, 1-10 scale, color matches severity dataset)
  - [ ] 4.13: Add trend line annotation using chartjs-plugin-annotation: type: 'line', borderColor based on trend direction, borderDash: [5, 5], label showing trend direction
  - [ ] 4.14: Configure tooltip: callbacks to format month, flare count, severity with proper labels and units
  - [ ] 4.15: Configure legend: position: 'bottom', shows both datasets and trend line
  - [ ] 4.16: Add responsive configuration: responsive: true, maintainAspectRatio: false
  - [ ] 4.17: Add ARIA label summarizing chart data and trend direction
  - [ ] 4.18: Render in container div with h-96 height and white background

- [ ] Task 5: Create chart export utility (AC: #3.4.7)
  - [ ] 5.1: Create `src/lib/utils/chartExport.ts` file
  - [ ] 5.2: Implement exportChartAsImage(chartRef: React.RefObject<any>, filename: string): Promise<void>
  - [ ] 5.3: Get chart instance from ref.current
  - [ ] 5.4: Use chart.toBase64Image() method to generate PNG data URL at high resolution
  - [ ] 5.5: Create temporary anchor element with download attribute
  - [ ] 5.6: Set href to data URL and download attribute to filename
  - [ ] 5.7: Trigger click to initiate download
  - [ ] 5.8: Clean up temporary element
  - [ ] 5.9: Handle errors gracefully with console.error and user-visible toast notification
  - [ ] 5.10: Export exportChartAsImage function

- [ ] Task 6: Create TrendAnalysisSection component (AC: #3.4.1, #3.4.5, #3.4.7)
  - [ ] 6.1: Create `src/components/analytics/TrendAnalysisSection.tsx` component
  - [ ] 6.2: Accept props: trendAnalysis (TrendAnalysis | null), isLoading (boolean), timeRange (TimeRange)
  - [ ] 6.3: Import FlareTrendChart component
  - [ ] 6.4: Create chart ref using useRef<any>(null) for export functionality
  - [ ] 6.5: Handle loading state: pass isLoading to FlareTrendChart
  - [ ] 6.6: Render section with header "Flare Trends" and description "Track your flare patterns over time to assess trajectory"
  - [ ] 6.7: Display trend direction indicator: badge showing "Improving" (green) / "Stable" (gray) / "Declining" (red) with appropriate icon
  - [ ] 6.8: Render FlareTrendChart with ref and all required props
  - [ ] 6.9: Render "Export Chart" button below chart using lucide-react Download icon
  - [ ] 6.10: Handle export button click: call exportChartAsImage with current date in filename format
  - [ ] 6.11: Show loading spinner on export button during export operation
  - [ ] 6.12: Add responsive container styling: space-y-4, chart takes full width
  - [ ] 6.13: Follow component patterns from ProgressionMetricsSection (Story 3.3)

- [ ] Task 7: Update analytics page to include Flare Trends (AC: #3.4.1)
  - [ ] 7.1: Open `src/app/(protected)/flares/analytics/page.tsx` from Stories 3.1 and 3.3
  - [ ] 7.2: Import TrendAnalysisSection component
  - [ ] 7.3: Extract trendAnalysis from useAnalytics hook result (already extended in Task 3)
  - [ ] 7.4: Add new section below ProgressionMetricsSection
  - [ ] 7.5: Render TrendAnalysisSection with trendAnalysis, isLoading, and timeRange props
  - [ ] 7.6: Maintain space-y-8 between sections for consistent spacing
  - [ ] 7.7: Update placeholder section text: remove Story 3.4 from "coming soon" list, keep Story 3.5
  - [ ] 7.8: Ensure shared timeRange state flows to all sections (Problem Areas, Progression Metrics, Flare Trends)

- [ ] Task 8: Add comprehensive tests (AC: All)
  - [ ] 8.1: Create `src/lib/repositories/__tests__/analyticsRepository.trend.test.ts`
  - [ ] 8.2: Test getMonthlyTrendData: empty data, single month, multiple months, trend calculations, edge cases
  - [ ] 8.3: Create `src/lib/utils/__tests__/linearRegression.test.ts`
  - [ ] 8.4: Test calculateLinearRegression: various slopes, edge cases, R² calculations
  - [ ] 8.5: Create `src/components/analytics/__tests__/FlareTrendChart.test.tsx`
  - [ ] 8.6: Test chart rendering: loading state, empty state, data rendering, trend line display
  - [ ] 8.7: Create `src/components/analytics/__tests__/TrendAnalysisSection.test.tsx`
  - [ ] 8.8: Test section rendering: trend indicator, export button, chart integration
  - [ ] 8.9: Test export functionality: button click, filename generation
  - [ ] 8.10: Verify all tests pass with npm test

## Dev Notes

### Architecture Patterns and Constraints

**Repository Pattern (ADR-004):**
- Extend existing `analyticsRepository` with `getMonthlyTrendData` method
- Follow on-demand calculation strategy (no caching, calculate from IndexedDB on each query)
- Return strongly-typed TrendAnalysis interface
- [Source: docs/solution-architecture.md#Repository-Pattern]

**Chart.js Integration:**
- Reuse existing Chart.js setup from Story 3.3 (registered components, chartjs-adapter-date-fns)
- Use Line chart with TimeScale for temporal data
- Dual y-axes pattern for frequency and severity
- chartjs-plugin-annotation for trend line overlay
- [Source: docs/solution-architecture.md#Technology-Stack]

**State Management:**
- Extend `useAnalytics` hook (Story 3.1, 3.3) with trend data fetching
- Parallel Promise.all pattern for concurrent data loading
- 10-second polling for reactive updates
- [Source: docs/stories/3-3-flare-duration-and-severity-metrics.md#File-List]

**Export Functionality:**
- Use Chart.js toBase64Image() API for client-side PNG generation
- No server-side rendering required (client-only download)
- File naming convention: flare-trends-{YYYY-MM-DD}.png

### Project Structure Notes

**Files to Create:**
- `src/types/analytics.ts` (extend with TrendDataPoint, TrendAnalysis interfaces)
- `src/lib/repositories/analyticsRepository.ts` (extend with getMonthlyTrendData method)
- `src/lib/utils/linearRegression.ts` (new utility file)
- `src/lib/utils/chartExport.ts` (new utility file)
- `src/components/analytics/FlareTrendChart.tsx` (new component)
- `src/components/analytics/TrendAnalysisSection.tsx` (new component)

**Files to Modify:**
- `src/lib/hooks/useAnalytics.ts` (add trend data fetching)
- `src/app/(protected)/flares/analytics/page.tsx` (add TrendAnalysisSection)

**Test Files:**
- `src/lib/repositories/__tests__/analyticsRepository.trend.test.ts`
- `src/lib/utils/__tests__/linearRegression.test.ts`
- `src/components/analytics/__tests__/FlareTrendChart.test.tsx`
- `src/components/analytics/__tests__/TrendAnalysisSection.test.tsx`

### Testing Standards

- Unit tests for repository methods (getMonthlyTrendData)
- Unit tests for utility functions (linearRegression, chartExport)
- Component tests with @testing-library/react
- Mock IndexedDB with fake-indexeddb
- Mock Chart.js canvas with jest-canvas-mock
- Test coverage targets: 80% branches, 90% functions
- [Source: docs/solution-architecture.md#Testing-Standards]

### Lessons from Story 3.3

**What Worked Well:**
- Parallel data fetching with Promise.all improved performance
- Chart.js with responsive configuration handled all screen sizes
- MetricCard pattern provided consistent UI
- Empty state handling (< 3 data points) prevented confusing displays
- ARIA labels and keyboard navigation met accessibility requirements

**Apply to Story 3.4:**
- Continue parallel fetching pattern for trend data
- Use similar empty state threshold (< 3 months for trend line)
- Follow Chart.js configuration patterns (responsive, ARIA labels)
- Maintain component structure consistency
- [Source: docs/stories/3-3-flare-duration-and-severity-metrics.md#Completion-Notes]

### References

- [Source: docs/epics.md#Story-3.4] - Story requirements and acceptance criteria
- [Source: docs/PRD.md#Functional-Requirements] - Product requirements context
- [Source: docs/PRD.md#NFR001] - Accessibility standards (WCAG 2.1 AA)
- [Source: docs/solution-architecture.md#Technology-Stack] - Chart.js and plugin versions
- [Source: docs/solution-architecture.md#Repository-Pattern] - Repository design patterns
- [Source: docs/solution-architecture.md#Testing-Standards] - Testing approach and tools
- [Source: docs/stories/3-3-flare-duration-and-severity-metrics.md] - Previous story lessons and patterns

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-28 | Initial story creation | SM Agent (claude-sonnet-4-5) |

---

## Dev Agent Record

### Context Reference

- docs/stories/3-4-flare-trend-analysis-visualization.context.xml (generated 2025-10-29)

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
