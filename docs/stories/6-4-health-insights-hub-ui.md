# Story 6.4: Health Insights Hub UI

Status: ready-for-dev

## Story

As a user reviewing my health patterns,
I want a visual insights dashboard that presents correlation findings in clear, actionable cards,
So that I can quickly understand the most important relationships in my data and take action.

## Acceptance Criteria

1. **AC6.4.1 — Create /insights page route:** Create new `/insights` page route (renamed from `/analytics` to avoid confusion with analytics service layer) with responsive layout using Next.js App Router. Page structure: header with title and time range selector, medical disclaimer banner at top, insights grid below, empty state when insufficient data. Use existing `(protected)` route group for authentication. Follow Next.js 15.5.4 App Router conventions with TypeScript and server components where appropriate. [Source: docs/epics.md#Story-6.4]

2. **AC6.4.2 — Build InsightCard component:** Create reusable `InsightCard` component displaying: insight type icon (food/trigger/medication/treatment), headline text format ("High Dairy → Increased Symptoms"), correlation strength badge (strong/moderate/weak with color coding), confidence level indicator, timeframe label (7d/30d/90d), sample size display ("Based on 15 data points"), action button ("View Details"). Use Tailwind CSS for styling, Lucide React for icons. Component accepts CorrelationResult data from correlation engine. Responsive: full width on mobile, grid layout on tablet/desktop. [Source: docs/epics.md#Story-6.4]

3. **AC6.4.3 — Implement insight prioritization algorithm:** Create insight sorting/filtering algorithm that prioritizes most important correlations: sort by priority score = |coefficient| × log(sampleSize), surface strong correlations (|ρ| >= 0.7) first, group insights by type (food-symptom, trigger-symptom, medication-symptom, etc.), filter out weak/insignificant correlations. Algorithm runs client-side on correlation data from correlationRepository. Ensure top 3-5 most actionable insights appear first. [Source: docs/epics.md#Story-6.4]

4. **AC6.4.4 — Create correlation scatter plot visualization:** Implement interactive scatter plot using Chart.js 4.5.0: X-axis = item consumption/exposure frequency, Y-axis = symptom severity, data points for each day in time range, trend line overlay showing correlation direction, interactive tooltips on hover showing date and values, responsive sizing (scales to container). Use existing Chart.js infrastructure from solution-architecture.md. Chart embedded in InsightCard detail view or modal. Configure with proper axis labels, grid lines, and accessibility labels. [Source: docs/epics.md#Story-6.4, docs/solution-architecture.md]

5. **AC6.4.5 — Build FlareAnalytics heat map component:** Create heat map visualization for flare frequency analysis: Y-axis = body regions (groin-left, groin-right, neck, lower-back, etc.), X-axis = time periods (days or weeks based on time range), color intensity = flare frequency (0 = white, high = dark red gradient), clickable cells drill down to region detail page, legend showing color scale. Use Chart.js matrix chart or custom SVG implementation. Component queries flareRepository for flare events grouped by region and time period. Responsive layout adjusts period granularity. [Source: docs/epics.md#Story-6.4]

6. **AC6.4.6 — Add time range selector:** Implement time range dropdown/toggle: options = "Last 7 days", "Last 30 days", "Last 90 days", "All time". Time range selection affects ALL visualizations on page (insights, scatter plots, heat map). Store selected range in component state (React useState). When changed, re-query correlationRepository with new date range filter. Default to "Last 30 days" on initial load. Selector positioned in page header, accessible via keyboard. [Source: docs/epics.md#Story-6.4]

7. **AC6.4.7 — Implement empty state:** Create friendly empty state UI shown when insufficient data: message "Log data for at least 10 days to see insights", progress indicator showing current logged days (e.g., "7/10 days logged"), call-to-action button "Start Logging Data" linking to daily log page, illustration or icon for visual interest. Empty state shown when: correlation engine returns no significant results, OR user has logged data for <10 days, OR no correlations meet significance threshold. Replace insights grid with centered empty state component. [Source: docs/epics.md#Story-6.4]

8. **AC6.4.8 — Add medical disclaimer banner:** Display prominent medical disclaimer at top of insights page: text "Insights show correlations, not causation. Discuss findings with your healthcare provider.", warning icon (Lucide AlertTriangle), yellow/amber background color for visibility, dismissible with localStorage persistence (user can close, stays closed for 30 days), accessible ARIA role="alert". Disclaimer appears on every insights page load unless dismissed. Critical for legal/medical safety. [Source: docs/epics.md#Story-6.4]

9. **AC6.4.9 — Create insight detail modal:** Build modal dialog opened when user clicks "View Details" on InsightCard: modal header with correlation headline, full correlation data display (coefficient, p-value, sample size, lag hours), scatter plot visualization (from AC6.4.4), related events timeline showing food/symptom events in time range, export as PDF button (optional enhancement, can defer to future story), close button (X icon), modal backdrop dims page, accessible (Escape key closes, focus trap). Use existing modal patterns from project. [Source: docs/epics.md#Story-6.4]

10. **AC6.4.10 — Build responsive grid layout:** Implement responsive CSS Grid layout for insights page: 1 column on mobile (< 768px), 2 columns on tablet (768px - 1024px), 3 columns on desktop (> 1024px). InsightCard components fill grid cells. Use CSS Grid with Tailwind responsive classes. Add smooth loading skeletons (shimmer effect) while correlation data loads from IndexedDB. Loading state: show 6 skeleton cards in grid layout, transition to real cards when data ready. Ensure smooth scrolling and no layout shift. [Source: docs/epics.md#Story-6.4]

## Tasks / Subtasks

- [ ] Task 1: Create /insights page route and layout structure (AC: #6.4.1)
  - [ ] 1.1: Create `src/app/(protected)/insights/page.tsx` using Next.js App Router
  - [ ] 1.2: Add page metadata (title: "Health Insights", description)
  - [ ] 1.3: Create page header component with title "Health Insights Hub"
  - [ ] 1.4: Add container div with max-width and responsive padding
  - [ ] 1.5: Import and position medical disclaimer banner (will create in Task 8)
  - [ ] 1.6: Create insights grid container (will populate in Task 10)
  - [ ] 1.7: Add loading state with skeleton cards
  - [ ] 1.8: Test page navigation from main nav/sidebar

- [ ] Task 2: Build InsightCard component (AC: #6.4.2)
  - [ ] 2.1: Create `src/components/insights/InsightCard.tsx` React component
  - [ ] 2.2: Define InsightCardProps interface accepting CorrelationResult data
  - [ ] 2.3: Implement card layout: border, rounded corners, shadow, padding (Tailwind)
  - [ ] 2.4: Add insight type icon mapping: food (Apple), trigger (AlertCircle), medication (Pill), treatment (Activity)
  - [ ] 2.5: Create headline generator function: format "High {item1} → Increased {item2}" based on correlation direction
  - [ ] 2.6: Add correlation strength badge: strong (red), moderate (yellow), weak (gray) with |ρ| value
  - [ ] 2.7: Display confidence level: high (≥20 samples), medium (10-19 samples), low (<10 samples)
  - [ ] 2.8: Add timeframe label: extract from CorrelationResult.timeRange (7d/30d/90d)
  - [ ] 2.9: Display sample size: "Based on {n} data points"
  - [ ] 2.10: Add "View Details" button that opens modal (onClick handler)
  - [ ] 2.11: Make card responsive: full width mobile, grid cell on desktop
  - [ ] 2.12: Add hover effect: subtle shadow increase on hover

- [ ] Task 3: Implement insight prioritization algorithm (AC: #6.4.3)
  - [ ] 3.1: Create `src/lib/services/insightPrioritization.ts` module
  - [ ] 3.2: Implement `calculatePriorityScore(correlation: CorrelationResult): number`
  - [ ] 3.3: Priority formula: score = Math.abs(correlation.coefficient) × Math.log(correlation.sampleSize)
  - [ ] 3.4: Handle edge case: sampleSize < 2 (log would be negative or zero)
  - [ ] 3.5: Implement `sortInsightsByPriority(insights: CorrelationResult[]): CorrelationResult[]`
  - [ ] 3.6: Sort descending by priority score (highest first)
  - [ ] 3.7: Secondary sort: by |coefficient| if scores equal
  - [ ] 3.8: Implement `groupInsightsByType(insights: CorrelationResult[]): Record<CorrelationType, CorrelationResult[]>`
  - [ ] 3.9: Group by correlation.type (food-symptom, trigger-symptom, etc.)
  - [ ] 3.10: Filter weak correlations: |coefficient| < 0.3 removed before display

- [ ] Task 4: Query correlation data from repository (Foundation for AC: #6.4.3, #6.4.4, #6.4.5)
  - [ ] 4.1: Create `src/lib/hooks/useCorrelations.ts` custom React hook
  - [ ] 4.2: Import correlationRepository from Story 6.3
  - [ ] 4.3: Implement `useCorrelations(userId: string, timeRange: TimeRange)` hook
  - [ ] 4.4: Calculate date range from timeRange: 7d → 7 days ago, 30d → 30 days ago, etc.
  - [ ] 4.5: Query correlationRepository.findAll(userId) to get all correlations
  - [ ] 4.6: Filter correlations by calculatedAt timestamp within date range
  - [ ] 4.7: Filter by significance: isSignificant === true or |coefficient| >= 0.3
  - [ ] 4.8: Return { correlations, isLoading, error } object
  - [ ] 4.9: Use useEffect to re-fetch when timeRange or userId changes
  - [ ] 4.10: Add error handling and loading state management

- [ ] Task 5: Create correlation scatter plot visualization (AC: #6.4.4)
  - [ ] 5.1: Create `src/components/insights/CorrelationScatterPlot.tsx` component
  - [ ] 5.2: Install/verify Chart.js and react-chartjs-2 dependencies (already in project)
  - [ ] 5.3: Define ScatterPlotProps: correlation data, item1 time series, item2 time series
  - [ ] 5.4: Query time series data for the specific correlation pair (use correlationDataExtractor from Story 6.3)
  - [ ] 5.5: Transform time series into Chart.js scatter dataset: { x: item1Value, y: item2Value }
  - [ ] 5.6: Configure Chart.js Scatter chart: X-axis label (item1 name), Y-axis label (item2 name)
  - [ ] 5.7: Add trend line: use Chart.js annotation plugin or calculate linear regression manually
  - [ ] 5.8: Configure tooltips: show date, item1 value, item2 value on hover
  - [ ] 5.9: Make chart responsive: maintainAspectRatio: false, height based on container
  - [ ] 5.10: Add accessibility: aria-label describing chart purpose
  - [ ] 5.11: Style axis grids, ticks, and labels for readability

- [ ] Task 6: Build FlareAnalytics heat map component (AC: #6.4.5)
  - [ ] 6.1: Create `src/components/insights/FlareAnalyticsHeatMap.tsx` component
  - [ ] 6.2: Define HeatMapProps: userId, timeRange
  - [ ] 6.3: Query flareRepository for all flares in time range
  - [ ] 6.4: Group flares by body region (flare.bodyRegion field)
  - [ ] 6.5: Group flares by time period: days for 7d range, weeks for 30d/90d range
  - [ ] 6.6: Calculate flare frequency per region per period: Map<region, Map<period, count>>
  - [ ] 6.7: Determine time period granularity: 7d → daily, 30d → weekly, 90d → weekly
  - [ ] 6.8: Build Chart.js matrix/heatmap dataset or custom SVG grid
  - [ ] 6.9: Implement color scale: white (0 flares) → light red (1-2) → dark red (5+)
  - [ ] 6.10: Add click handlers: cell click navigates to region detail page (e.g., /body-map?region={regionId})
  - [ ] 6.11: Add legend showing color scale with labels
  - [ ] 6.12: Make responsive: adjust cell size and labels based on screen width

- [ ] Task 7: Add time range selector (AC: #6.4.6)
  - [ ] 7.1: Create `src/components/insights/TimeRangeSelector.tsx` component
  - [ ] 7.2: Define TimeRange type: "7d" | "30d" | "90d" | "all"
  - [ ] 7.3: Implement dropdown/button group UI with 4 options: Last 7 days, Last 30 days, Last 90 days, All time
  - [ ] 7.4: Accept props: selectedRange, onRangeChange callback
  - [ ] 7.5: Style selected range with active state (highlight/underline)
  - [ ] 7.6: Add keyboard accessibility: Tab to focus, Enter/Space to select
  - [ ] 7.7: Integrate into insights page header
  - [ ] 7.8: Lift state to page component: const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  - [ ] 7.9: Pass timeRange to all child components (InsightCard grid, HeatMap, etc.)
  - [ ] 7.10: Re-query correlations when timeRange changes (via useCorrelations hook)

- [ ] Task 8: Implement empty state (AC: #6.4.7)
  - [ ] 8.1: Create `src/components/insights/InsightsEmptyState.tsx` component
  - [ ] 8.2: Accept props: loggedDaysCount (number), requiredDays (default 10)
  - [ ] 8.3: Calculate progress: loggedDaysCount / requiredDays × 100
  - [ ] 8.4: Display message: "Log data for at least {requiredDays} days to see insights"
  - [ ] 8.5: Add progress bar or circular progress indicator showing {loggedDaysCount}/{requiredDays}
  - [ ] 8.6: Add call-to-action button: "Start Logging Data" → links to /daily-log page
  - [ ] 8.7: Add illustration or icon (LightbulbOff, TrendingUp, or similar from Lucide)
  - [ ] 8.8: Center empty state in page container
  - [ ] 8.9: Query dailyLogsRepository to count logged days for progress calculation
  - [ ] 8.10: Conditional rendering in page: show empty state if correlations.length === 0 OR loggedDaysCount < 10

- [ ] Task 9: Add medical disclaimer banner (AC: #6.4.8)
  - [ ] 9.1: Create `src/components/insights/MedicalDisclaimerBanner.tsx` component
  - [ ] 9.2: Implement banner UI: amber/yellow background, AlertTriangle icon, disclaimer text
  - [ ] 9.3: Text: "Insights show correlations, not causation. Discuss findings with your healthcare provider."
  - [ ] 9.4: Add dismiss button (X icon) on right side of banner
  - [ ] 9.5: Implement localStorage persistence: key "insights-disclaimer-dismissed", value: timestamp
  - [ ] 9.6: Check localStorage on mount: if dismissed within last 30 days, hide banner
  - [ ] 9.7: On dismiss: save Date.now() to localStorage, hide banner
  - [ ] 9.8: Add ARIA role="alert" for accessibility
  - [ ] 9.9: Make banner responsive: full width, padding adjusts on mobile
  - [ ] 9.10: Position banner at top of insights page (before insights grid)

- [ ] Task 10: Create insight detail modal (AC: #6.4.9)
  - [ ] 10.1: Create `src/components/insights/InsightDetailModal.tsx` component
  - [ ] 10.2: Define ModalProps: isOpen, onClose, correlation (CorrelationResult)
  - [ ] 10.3: Implement modal overlay: backdrop with semi-transparent dark background
  - [ ] 10.4: Create modal container: centered, max-width, white background, rounded corners
  - [ ] 10.5: Add modal header: correlation headline (same format as InsightCard), close button (X icon)
  - [ ] 10.6: Display full correlation data: coefficient (ρ value), p-value, sample size, lag hours, confidence level
  - [ ] 10.7: Embed CorrelationScatterPlot component (from Task 5) in modal body
  - [ ] 10.8: Add related events timeline section: query foodEvents, symptomInstances for the correlation items
  - [ ] 10.9: Display event timeline: chronological list of relevant events in date range
  - [ ] 10.10: Add "Export as PDF" button (optional, can use placeholder or defer to future story)
  - [ ] 10.11: Implement close functionality: Escape key closes, click outside closes, X button closes
  - [ ] 10.12: Add focus trap: Tab key cycles within modal, focus returns to trigger on close
  - [ ] 10.13: Use existing modal patterns from project (check for Dialog/Modal components in ui/)

- [ ] Task 11: Build responsive grid layout with loading skeletons (AC: #6.4.10)
  - [ ] 11.1: Create `src/components/insights/InsightsGrid.tsx` container component
  - [ ] 11.2: Implement CSS Grid: grid-cols-1 (mobile), md:grid-cols-2 (tablet), lg:grid-cols-3 (desktop)
  - [ ] 11.3: Add gap between grid items: gap-4 or gap-6
  - [ ] 11.4: Map over correlations array to render InsightCard for each item
  - [ ] 11.5: Create `src/components/insights/InsightCardSkeleton.tsx` loading skeleton component
  - [ ] 11.6: Skeleton structure: gray placeholder boxes for icon, headline, badges, button
  - [ ] 11.7: Add shimmer animation: gradient moving left-to-right for loading effect
  - [ ] 11.8: Render 6 skeleton cards when isLoading === true
  - [ ] 11.9: Transition from skeletons to real cards when data ready (fade-in animation)
  - [ ] 11.10: Test responsive breakpoints: verify 1/2/3 column layout at different screen sizes
  - [ ] 11.11: Ensure no layout shift (CLS) when loading completes

- [ ] Task 12: Integrate all components into insights page
  - [ ] 12.1: Import all components: TimeRangeSelector, MedicalDisclaimerBanner, InsightsGrid, InsightsEmptyState, InsightDetailModal
  - [ ] 12.2: Add time range state management at page level
  - [ ] 12.3: Use useCorrelations hook to fetch correlation data based on timeRange
  - [ ] 12.4: Apply insight prioritization algorithm to sort correlations
  - [ ] 12.5: Implement modal state: selectedInsight, isModalOpen, onOpenModal, onCloseModal
  - [ ] 12.6: Pass onOpenModal to InsightCard components (triggered by "View Details" button)
  - [ ] 12.7: Conditional rendering: show empty state OR insights grid based on data availability
  - [ ] 12.8: Query dailyLogsRepository to get logged days count for empty state
  - [ ] 12.9: Add page-level loading state while initial data loads
  - [ ] 12.10: Test full user flow: page load → time range change → click insight → view modal → close

- [ ] Task 13: Add navigation link to insights page
  - [ ] 13.1: Update main navigation/sidebar to include "Insights" link
  - [ ] 13.2: Icon: TrendingUp or LineChart from Lucide
  - [ ] 13.3: Link route: /insights
  - [ ] 13.4: Position in nav: after Flares, before Settings (or as appropriate)
  - [ ] 13.5: Test navigation: clicking link navigates to insights page
  - [ ] 13.6: Active state: highlight "Insights" when on /insights route

- [ ] Task 14: Write unit tests for components
  - [ ] 14.1: Create `src/components/insights/__tests__/InsightCard.test.tsx`
  - [ ] 14.2: Test InsightCard rendering with sample CorrelationResult data
  - [ ] 14.3: Test headline formatting for different correlation types
  - [ ] 14.4: Test strength badge color coding
  - [ ] 14.5: Create `src/components/insights/__tests__/TimeRangeSelector.test.tsx`
  - [ ] 14.6: Test range selection and callback invocation
  - [ ] 14.7: Create `src/lib/services/__tests__/insightPrioritization.test.ts`
  - [ ] 14.8: Test priority score calculation with various inputs
  - [ ] 14.9: Test sorting algorithm correctness
  - [ ] 14.10: Test grouping by insight type

- [ ] Task 15: Write integration tests for insights page
  - [ ] 15.1: Create `src/app/(protected)/insights/__tests__/page.test.tsx`
  - [ ] 15.2: Test page renders with loading state initially
  - [ ] 15.3: Test empty state shown when no correlations
  - [ ] 15.4: Test insights grid populated when correlations available
  - [ ] 15.5: Test time range selector changes re-query data
  - [ ] 15.6: Test modal opens when "View Details" clicked
  - [ ] 15.7: Test medical disclaimer shown and dismissible
  - [ ] 15.8: Mock correlationRepository, dailyLogsRepository for tests
  - [ ] 15.9: Verify all tests pass with `npm test`

## Dev Notes

### Technical Architecture

This story builds the user-facing UI layer for Epic 6 (Health Insights & Correlation Analytics), consuming the correlation engine built in Story 6.3. The insights page transforms raw statistical correlation data into actionable health insights presented in an accessible, visually appealing dashboard.

**Key Architecture Points:**
- **Separation of Concerns:** Story 6.3 handles statistical computation (correlation engine), Story 6.4 handles presentation layer (UI components)
- **Data Flow:** correlationRepository (IndexedDB) → useCorrelations hook → insightPrioritization algorithm → InsightCard components
- **Chart.js Integration:** Leverage existing Chart.js 4.5.0 infrastructure for scatter plots and heat maps
- **Responsive Design:** Mobile-first approach with Tailwind CSS responsive utilities
- **Performance:** Loading skeletons prevent layout shift, data queries optimized with IndexedDB compound indexes from Story 6.3

### Learnings from Previous Story

**From Story 6-3-correlation-engine-and-spearman-algorithm (Status: review)**

- **CorrelationRepository Available:** Story 6.3 created `src/lib/repositories/correlationRepository.ts` with full CRUD operations. Use `findAll(userId)`, `findByType(userId, type)`, `findSignificant(userId, threshold)` methods to query correlation data. [Source: stories/6-3-correlation-engine-and-spearman-algorithm.md#Dev-Agent-Record]

- **CorrelationResult Data Model:** Story 6.3 defined complete TypeScript interfaces in `src/types/correlation.ts`:
  - `CorrelationResult` interface with all fields (id, type, item1, item2, coefficient, strength, significance, sampleSize, lagHours, confidence, timeRange, calculatedAt)
  - `CorrelationType` enum: "food-symptom" | "trigger-symptom" | "medication-symptom" | "food-flare" | "trigger-flare"
  - `CorrelationStrength` enum: "strong" | "moderate" | "weak"
  - Use these existing types for InsightCard props and component interfaces

- **IndexedDB Schema Version 25:** Story 6.3 incremented schema to version 25 with correlations table. Compound indexes: [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt]. Query efficiency already optimized.

- **Background Calculation Service:** Story 6.3 created `correlationCalculationService.ts` that auto-recalculates correlations when new data logged (5-minute debouncing). Correlations should be up-to-date without manual refresh.

- **Correlation Engine Service:** Story 6.3 created `correlationEngine.ts` with methods `calculateCorrelation()`, `findSignificantCorrelations()`, `rankByStrength()`. While UI primarily queries repository, could use `rankByStrength()` for additional sorting if needed.

- **Performance Optimizations in Place:** Story 6.3 implemented batching, caching (1-hour TTL), and performance tracking. Correlation calculations should be non-blocking.

- **Statistical Significance Already Filtered:** Story 6.3 filters correlations by |ρ| >= 0.3, n >= 10, p < 0.05. All correlations in repository are already significant - UI can trust this filtering.

**Key Pattern for This Story:** Story 6.4 is pure UI/presentation layer. No new statistical algorithms or repository code needed. Focus on React components, Chart.js visualizations, responsive design, and user experience.

**Files Created by Story 6.3 to Reuse:**
- `src/types/correlation.ts` - Import CorrelationResult, CorrelationType, CorrelationStrength interfaces
- `src/lib/repositories/correlationRepository.ts` - Use for querying correlation data
- `src/lib/services/correlationEngine.ts` - Optional use for additional ranking/sorting
- `src/lib/services/correlationDataExtractor.ts` - Use for extracting time series data for scatter plots

### Project Structure Notes

**Files to Create:**
```
src/app/(protected)/insights/
  └── page.tsx (NEW - main insights page route)
  └── __tests__/
      └── page.test.tsx (NEW - page integration tests)

src/components/insights/
  ├── InsightCard.tsx (NEW - displays single correlation insight)
  ├── InsightCardSkeleton.tsx (NEW - loading skeleton for InsightCard)
  ├── InsightsGrid.tsx (NEW - responsive grid container)
  ├── InsightsEmptyState.tsx (NEW - shown when insufficient data)
  ├── TimeRangeSelector.tsx (NEW - 7d/30d/90d/all selector)
  ├── MedicalDisclaimerBanner.tsx (NEW - dismissible warning banner)
  ├── InsightDetailModal.tsx (NEW - detailed view modal)
  ├── CorrelationScatterPlot.tsx (NEW - Chart.js scatter plot)
  ├── FlareAnalyticsHeatMap.tsx (NEW - Chart.js heat map)
  └── __tests__/
      ├── InsightCard.test.tsx (NEW)
      ├── TimeRangeSelector.test.tsx (NEW)
      └── ... (additional component tests)

src/lib/services/
  └── insightPrioritization.ts (NEW - sorting/filtering algorithm)
  └── __tests__/
      └── insightPrioritization.test.ts (NEW)

src/lib/hooks/
  └── useCorrelations.ts (NEW - React hook for querying correlations)
```

**Files to Modify:**
- Main navigation/sidebar component - Add "Insights" link to /insights route
- No IndexedDB schema changes (uses existing correlations table from Story 6.3)

### UI Component Specifications

**InsightCard Layout:**
```
┌─────────────────────────────────────────────┐
│ [Icon] High Dairy → Increased Headache      │
│                                              │
│ Strength: ● Strong (ρ = 0.72)              │
│ Confidence: High (15 data points)           │
│ Timeframe: Last 30 days                     │
│ Lag: 12 hours                               │
│                                              │
│ [View Details →]                            │
└─────────────────────────────────────────────┘
```

**Color Coding:**
- Strong correlation (|ρ| >= 0.7): Red badge
- Moderate correlation (0.3 <= |ρ| < 0.7): Yellow/Amber badge
- Weak correlation (|ρ| < 0.3): Gray badge (rarely shown after filtering)

**Responsive Grid Breakpoints:**
- Mobile (< 768px): 1 column, full width cards
- Tablet (768px - 1024px): 2 columns, gap-4
- Desktop (> 1024px): 3 columns, gap-6

### Chart.js Integration

**Scatter Plot Configuration:**
```typescript
const scatterOptions: ChartOptions<'scatter'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: `${item1Name} vs ${item2Name} Correlation`,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const point = context.raw as { x: number; y: number; date: string };
          return `${point.date}: ${point.x} → ${point.y}`;
        },
      },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: item1Name,
      },
    },
    y: {
      title: {
        display: true,
        text: `${item2Name} Severity`,
      },
    },
  },
};
```

**Heat Map Implementation:**

Option 1: Use Chart.js with chartjs-chart-matrix plugin
Option 2: Custom SVG implementation (more control over interactions)

Recommended: Chart.js matrix chart for consistency with existing Chart.js usage in project.

### Time Range Calculation

**Helper Function:**
```typescript
function getDateRangeFromTimeRange(timeRange: TimeRange): { startDate: number; endDate: number } {
  const endDate = Date.now();
  let startDate: number;

  switch (timeRange) {
    case "7d":
      startDate = endDate - (7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = endDate - (30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = endDate - (90 * 24 * 60 * 60 * 1000);
      break;
    case "all":
      startDate = 0; // Beginning of time
      break;
  }

  return { startDate, endDate };
}
```

### Priority Score Algorithm

**Formula Explanation:**

```typescript
priorityScore = |ρ| × log(n)

Where:
- |ρ| = absolute value of correlation coefficient (0-1)
- log(n) = natural logarithm of sample size
- Higher scores = more important insights
```

**Example Calculations:**

| Correlation | |ρ| | n  | log(n) | Score | Priority |
|------------|------|----|---------| ------|----------|
| Dairy → Headache | 0.72 | 30 | 3.40 | 2.45 | High |
| Gluten → Fatigue | 0.65 | 15 | 2.71 | 1.76 | Medium |
| Sleep → Pain | 0.85 | 50 | 3.91 | 3.32 | Highest |
| Sugar → Mood | 0.45 | 8  | 2.08 | 0.94 | Low |

**Edge Cases:**
- n < 2: log(n) <= 0 → use fallback score = |ρ| only
- n = 1: invalid correlation (shouldn't exist due to Story 6.3 filtering)

### Empty State Logic

**Conditions for Showing Empty State:**

1. No correlations in repository (correlation engine hasn't run yet)
2. User has logged data for <10 days (minimum for statistical validity)
3. No correlations meet significance threshold (all weak correlations filtered out)
4. Selected time range has no data (e.g., user selects "Last 7 days" but only logged data 30 days ago)

**Progress Calculation:**

Query `dailyLogsRepository` to count unique dates with entries:
```typescript
const loggedDates = await dailyLogsRepository.listByDateRange(userId, 0, Date.now());
const uniqueDays = new Set(loggedDates.map(log => new Date(log.date).toDateString()));
const loggedDaysCount = uniqueDays.size;
```

### Medical Disclaimer Best Practices

**Legal Considerations:**
- Prominent placement at top of page (cannot be missed)
- Clear language: "correlations, not causation"
- Call to action: "Discuss findings with your healthcare provider"
- Dismissible but persistent (re-appears after 30 days)

**ARIA Accessibility:**
```typescript
<div role="alert" aria-live="polite" aria-label="Medical disclaimer">
  {disclaimerText}
</div>
```

### Testing Strategy

**Unit Tests:**

```typescript
describe('InsightCard', () => {
  it('should display correlation headline correctly', () => {
    const correlation: CorrelationResult = {
      type: 'food-symptom',
      item1: 'Dairy',
      item2: 'Headache',
      coefficient: 0.72,
      strength: 'strong',
      sampleSize: 15,
      // ... other fields
    };

    const { getByText } = render(<InsightCard correlation={correlation} />);
    expect(getByText(/High Dairy.*Increased Headache/)).toBeInTheDocument();
  });

  it('should show strong badge for |ρ| >= 0.7', () => {
    const correlation = createMockCorrelation({ coefficient: 0.75 });
    const { getByText } = render(<InsightCard correlation={correlation} />);
    expect(getByText(/Strong/)).toHaveClass('bg-red-500'); // or appropriate Tailwind class
  });
});
```

**Integration Tests:**

```typescript
describe('Insights Page', () => {
  it('should load and display insights', async () => {
    // Mock correlationRepository
    const mockCorrelations = [createMockCorrelation(), createMockCorrelation()];
    jest.spyOn(correlationRepository, 'findAll').mockResolvedValue(mockCorrelations);

    const { findByText } = render(<InsightsPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });

    // Verify insights displayed
    expect(findByText(/High Dairy/)).toBeInTheDocument();
  });

  it('should show empty state when insufficient data', async () => {
    jest.spyOn(correlationRepository, 'findAll').mockResolvedValue([]);
    jest.spyOn(dailyLogsRepository, 'listByDateRange').mockResolvedValue([]);

    const { getByText } = render(<InsightsPage />);

    await waitFor(() => {
      expect(getByText(/Log data for at least 10 days/)).toBeInTheDocument();
    });
  });
});
```

### Accessibility Requirements

**Keyboard Navigation:**
- Tab through InsightCard components
- Enter/Space to open detail modal
- Escape to close modal
- Tab through time range selector options

**Screen Reader Support:**
- ARIA labels on all interactive elements
- ARIA live regions for loading state changes
- Semantic HTML: `<article>` for InsightCard, `<nav>` for TimeRangeSelector
- Alt text for any icons or illustrations

**Color Contrast:**
- Strength badges: ensure WCAG AA contrast ratio (4.5:1 for text)
- Heat map colors: distinguishable for color-blind users (use patterns in addition to color)
- Focus indicators: visible keyboard focus outline

### References

- [Source: docs/epics.md#Story-6.4] - Story acceptance criteria and requirements
- [Source: docs/solution-architecture.md#Technology-Stack] - Chart.js 4.5.0, react-zoom-pan-pinch for SVG
- [Source: stories/6-3-correlation-engine-and-spearman-algorithm.md#Dev-Agent-Record] - CorrelationResult data model and repository methods
- [Source: docs/solution-architecture.md#Repository-Architecture] - Component structure patterns
- [Chart.js Documentation] - Scatter chart and matrix/heat map configuration
- [Next.js App Router] - Page routing and server components patterns
- [Tailwind CSS Responsive Design] - Breakpoints and grid utilities
- [WCAG 2.1 Guidelines] - Accessibility requirements

### Integration Points

**This Story Depends On:**
- Story 6.3: Correlation Engine (review) - Provides correlation data via correlationRepository
- Story 6.2: Daily Log Page (review) - Provides daily log data for progress tracking in empty state
- Epic 2: Flare Management (done) - Provides flare data for heat map visualization
- Existing Chart.js infrastructure - Solution architecture confirms Chart.js 4.5.0 available

**This Story Enables:**
- Story 6.5: Timeline Pattern Detection - Insights page patterns can be highlighted in timeline
- Story 6.7: Treatment Effectiveness Tracker - Can reuse InsightCard and visualization components
- Future analytics features - Establishes component library for data visualization

### Risk Mitigation

**Risk: Chart.js performance with large datasets**
- Mitigation: Limit scatter plot data points to most recent 100 data points per correlation
- Alternative: Use data decimation or sampling for visualizations
- Heat map: Aggregate data by time period to reduce cell count

**Risk: Empty state shown too frequently (insufficient data)**
- Mitigation: Clear messaging explaining why insights not available
- Provide progress indicator to motivate continued data logging
- Link to daily log page to facilitate data entry

**Risk: Users misinterpreting correlations as causation**
- Mitigation: Prominent medical disclaimer on every page load
- Use careful language in headlines: "associated with" vs "causes"
- Include confidence levels and sample sizes for transparency
- Link to help documentation explaining correlation vs causation

**Risk: Modal accessibility issues**
- Mitigation: Implement proper focus trap and keyboard handling
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Follow WAI-ARIA modal dialog pattern

**Risk: Layout shift during loading**
- Mitigation: Skeleton cards match final card dimensions exactly
- Use CSS Grid with fixed gap values
- Prevent cumulative layout shift (CLS) with reserved space

### Performance Considerations

**IndexedDB Query Optimization:**
- Use compound indexes from Story 6.3: [userId+type], [userId+calculatedAt]
- Filter in JavaScript vs database: prefer filtering significant correlations in database query if possible
- Limit results: implement pagination if >50 insights (unlikely but possible)

**Chart.js Rendering:**
- Scatter plots: limit to 100 data points per chart
- Heat maps: aggregate by appropriate time periods (days vs weeks)
- Lazy load charts: only render when modal opens (InsightDetailModal)

**Component Rendering:**
- Use React.memo for InsightCard to prevent unnecessary re-renders
- Virtualization not needed for insights grid (expect <50 cards max)
- Loading skeletons prevent blocking UI during data fetch

### Future Enhancements (Out of Scope for This Story)

**Deferred to Future Stories:**
- Export insights as PDF (mentioned in AC6.4.9 as optional)
- Advanced filtering: filter by correlation type, strength, or specific items
- Insight notifications: alert when new strong correlation detected
- Insight sharing: share specific insights with healthcare provider
- Insight history: track how correlations change over time

**Nice-to-Have Features:**
- Dark mode support for visualizations
- Print stylesheet for insights page
- Downloadable CSV of correlation data
- Comparison view: compare correlations across different time ranges

### Breaking Changes

**For Developers:**
- New route `/insights` added to Next.js App Router
- New components in `src/components/insights/` directory
- New hook `useCorrelations` for querying correlation data
- No breaking changes to existing code (additive only)

**For Users:**
- New "Insights" navigation item in main menu
- No changes to existing features (flares, body map, daily log, etc.)
- Insights page only appears if correlation data available

## Dev Agent Record

### Context Reference

- docs/stories/6-4-health-insights-hub-ui.context.xml

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List

## Change Log

**Date: 2025-11-10**
- Created Story 6.4 - Health Insights Hub UI
- Defined 10 acceptance criteria for insights dashboard UI implementation
- Created 15 tasks with detailed subtasks (145+ total subtasks)
- Documented component specifications, Chart.js integration, prioritization algorithm, responsive design
- Integrated learnings from Story 6.3 (correlation engine and repository patterns)
- Story ready for context generation and development
