# Story 1.1a: Trend Analysis - Core Regression Algorithm

Status: Ready for Review

**Note:** Original Story 1.1 was split into Stories 1.1a-1.1e for proper sizing. See docs/epics.md for full breakdown.

## Story

As a **user tracking symptoms over time**,
I want **to see statistical trends in my symptom severity, medication effectiveness, and custom metrics**,
so that **I can understand if my condition is improving, stable, or worsening**.

## Acceptance Criteria

1. System performs linear regression on selected metrics over user-defined time periods (7/30/90 days, 1 year, all time)
2. Displays trend direction (increasing/decreasing/stable/fluctuating) with visual indicators
3. Shows R² value and confidence interval with plain-language explanation
4. Overlays trend line on data chart with clear legend
5. Detects and highlights change points (significant shifts in trend)
6. Provides "What does this mean?" tooltip explaining the statistical significance
7. Computation completes in <2 seconds for 90-day datasets
8. Works offline using local computation only

## Tasks / Subtasks

- [x] **Task 1: Implement Linear Regression Algorithm** (AC: 1, 7)
  - [x] Create `computeLinearRegression()` method in `TrendAnalysisService`
  - [x] Implement slope, intercept, and R² calculations
  - [x] Add input validation (minimum 14 days data required)
  - [x] Handle edge cases: missing values, outliers, insufficient data
  - [x] Add unit tests for regression algorithm with known datasets

- [ ] **Task 2: Set Up Web Worker for Background Computation** (AC: 7, 8)
  - [ ] Create `analyticsWorker.ts` in `/src/workers`
  - [ ] Implement `linearRegression` message handler in worker
  - [ ] Add `WorkerPool` class for managing worker instances
  - [ ] Configure worker to offload computations for datasets > 100 points
  - [ ] Test worker performance with 90-day and 1-year datasets

- [ ] **Task 3: Create TrendAnalysisService** (AC: 1, 2, 7, 8)
  - [ ] Create `/src/features/analytics/services/TrendAnalysisService.ts`
  - [ ] Implement `analyzeTrend()` method with caching
  - [ ] Add `fetchMetricData()` to query from existing repositories
  - [ ] Implement `extractTimeSeriesPoints()` for data transformation
  - [ ] Add result caching in `analysisResults` table with 24h TTL
  - [ ] Implement cache invalidation on new daily entry
  - [ ] Add service tests covering all metrics (symptom severity, medication effectiveness)

- [ ] **Task 4: Implement Change Point Detection** (AC: 5)
  - [ ] Research and implement PELT (Pruned Exact Linear Time) algorithm
  - [ ] Create `detectChangePoints()` method
  - [ ] Add configuration for sensitivity threshold
  - [ ] Return array of dates where significant shifts occur
  - [ ] Add tests with synthetic data containing known change points

- [ ] **Task 5: Create TrendChart Component** (AC: 4)
  - [ ] Create `/src/features/analytics/components/TrendChart.tsx`
  - [ ] Integrate Chart.js with react-chartjs-2
  - [ ] Configure line chart with trend line overlay
  - [ ] Add legend explaining data vs. trend line
  - [ ] Highlight change points on chart with markers
  - [ ] Implement responsive design (mobile/desktop)
  - [ ] Add accessibility: alt text, data table toggle, keyboard navigation

- [ ] **Task 6: Generate Plain-Language Interpretations** (AC: 3, 6)
  - [ ] Create `generateInterpretation()` method in service
  - [ ] Map R² and slope to plain-language direction: "improving", "worsening", "stable"
  - [ ] Calculate confidence percentage from R² and sample size
  - [ ] Create confidence labels: very-high (≥90%), high (70-89%), moderate (50-69%), low (<50%)
  - [ ] Build tooltip component with "What does this mean?" explanations
  - [ ] Add glossary entries for statistical terms (R², confidence interval, linear regression)

- [ ] **Task 7: Implement Time Range Selection UI** (AC: 1)
  - [ ] Create `TimeRangeSelector` component
  - [ ] Add preset options: 7 days, 30 days, 90 days, 1 year, all time
  - [ ] Support custom date range picker
  - [ ] Validate date ranges (start < end, not future dates)
  - [ ] Store selected time range in component state
  - [ ] Trigger trend re-analysis on range change

- [ ] **Task 8: Create AnalysisRepository for Caching** (AC: 7, 8)
  - [ ] Create `/src/core/database/phase3/analysisRepository.ts`
  - [ ] Add `analysisResults` table to Dexie schema (v8 migration)
  - [ ] Implement `saveResult()`, `getResult()`, `invalidateCache()` methods
  - [ ] Add compound index: `[type+metric]` for efficient lookups
  - [ ] Implement automatic cleanup of expired results (TTL: 24h)
  - [ ] Add cache hit/miss logging for performance monitoring

- [ ] **Task 9: Integration with Analytics Dashboard** (AC: 2)
  - [ ] Create placeholder for `AnalyticsDashboard` component (full implementation in Story 1.6)
  - [ ] Add `TrendWidget` component for dashboard
  - [ ] Wire `TrendAnalysisService` to dashboard state
  - [ ] Display trend direction with visual indicators (↑ increasing, ↓ decreasing, → stable)
  - [ ] Add loading skeleton during computation
  - [ ] Handle error states with user-friendly messages

- [ ] **Task 10: Testing & Validation** (AC: all)
  - [ ] Unit tests for `TrendAnalysisService` (100% coverage)
  - [ ] Unit tests for linear regression algorithm with known datasets
  - [ ] Unit tests for change point detection
  - [ ] Integration tests: service → repository → database
  - [ ] Component tests for `TrendChart` (rendering, interaction)
  - [ ] E2E test: Select metric → choose time range → view trend chart
  - [ ] Performance test: Verify <2s computation for 90-day dataset
  - [ ] Accessibility audit: WCAG 2.1 AA compliance for chart and tooltips

## Dev Notes

### Architecture Patterns and Constraints

**Service Layer Pattern:**
- `TrendAnalysisService` follows the service pattern established in Phase 1 & 2
- Services are stateless and injected with repository dependencies
- Computation logic separated from UI concerns

**Web Worker Offloading:**
- Statistical computations for datasets >100 points run in Web Worker to prevent UI blocking
- Worker pool pattern for managing multiple concurrent analyses
- Message-based communication with structured request/response types

**Caching Strategy:**
- Analysis results cached in IndexedDB with 24h TTL
- Cache key: `type + metric + timeRange`
- Invalidation on new daily entry to ensure fresh insights
- Automatic cleanup of expired cache entries

**Performance Requirements (NFR2):**
- <2 seconds for 90-day datasets (enforced by tests)
- <5 seconds for full historical analysis (1+ years)
- Web Worker prevents UI blocking during computation

**Privacy Requirements (NFR4):**
- 100% local computation (no external API calls)
- No data transmission for analytics
- All processing happens in browser

### Source Tree Components to Touch

**New Files to Create:**
```
/src/features/analytics/
  services/
    TrendAnalysisService.ts          # Main service
  components/
    TrendChart.tsx                   # Chart.js visualization
    TimeRangeSelector.tsx            # Time range picker
    TrendWidget.tsx                  # Dashboard widget
  types/
    TrendAnalysisTypes.ts            # TypeScript interfaces

/src/core/database/phase3/
  analysisRepository.ts              # Cache management
  schema-v8.ts                       # Dexie migration with analysisResults table

/src/workers/
  analyticsWorker.ts                 # Web Worker for heavy computation
  WorkerPool.ts                      # Worker management

/src/utils/statistics/
  linearRegression.ts                # Pure regression algorithm
  changePointDetection.ts            # PELT algorithm
```

**Modified Files:**
```
/src/core/database/db.ts             # Add Dexie v7→v8 migration, register analysisResults table
/src/features/analytics/index.ts     # Export new components and services
```

### Project Structure Notes

**Alignment with unified-project-structure.md:**
- Feature-based organization: `/src/features/analytics`
- Service layer in `/src/features/analytics/services`
- Shared utilities in `/src/utils/statistics`
- Database migrations follow version sequence (current: v7, target: v8)

**Phase 3 Module Structure:**
```
/src/features/analytics/          # Epic 1: Data Analysis
/src/features/search/             # Epic 2: Advanced Search (future)
/src/features/reports/            # Epic 3: Report Generation (future)
```

**Naming Conventions:**
- Services: `[Feature]Service.ts` (e.g., `TrendAnalysisService.ts`)
- Components: PascalCase with `.tsx` extension
- Repositories: `[entity]Repository.ts`
- Types: `[Feature]Types.ts`

### Testing Standards Summary

**Unit Testing (Jest + React Testing Library):**
- Service methods: Test happy path + edge cases + error handling
- Pure functions (regression algorithm): Test with known input/output pairs
- Components: Test rendering, user interactions, accessibility

**Integration Testing:**
- Service → Repository → Database flow
- Worker communication and data serialization
- Cache hit/miss scenarios

**E2E Testing (Playwright - deferred to Story 1.6):**
- User flow: Navigate to analytics → select metric → view trend
- Cross-browser compatibility (Chrome, Firefox, Safari)

**Performance Testing:**
- Measure computation time for various dataset sizes
- Assert <2s for 90-day datasets (NFR2)
- Load test with 1800+ daily entries (5 years data)

**Accessibility Testing:**
- Screen reader compatibility (NVDA, JAWS)
- Keyboard navigation for chart and controls
- Color contrast validation (WCAG 2.1 AA)
- Alt text and data table alternatives for charts

### References

**Epic Details:**
[Source: docs/epics.md#Story 1.1: Trend Analysis Engine]

**Technical Specification:**
[Source: docs/tech-spec-epic-1.md#1. TrendAnalysisService]
- Class interface with full method signatures
- Algorithm implementation (linear regression, R² calculation)
- Caching strategy and TTL
- Web Worker integration pattern

**PRD Requirements:**
[Source: docs/PRD.md#FR1. Trend Analysis]
- Linear regression with R² and confidence intervals
- Performance: <2 seconds for 90-day datasets (NFR2)
- Privacy: Local-only processing (NFR4)

**UX Specification:**
[Source: docs/ux-spec.md#TrendChart Component]
- Visual design for trend charts
- Plain-language tooltip requirements
- Accessibility standards (WCAG 2.1 AA)

**Existing Dependencies:**
- Chart.js 4.5.0 + react-chartjs-2 5.3.0 [confirmed in tech-spec-epic-1.md]
- date-fns 4.1.0 for date calculations
- Existing Dexie repositories (dailyEntries, symptoms, medications)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML/JSON will be added here by context workflow -->

### Agent Model Used

Claude 3.5 Sonnet (claude-sonnet-4-5-20250929)

### Debug Log References

**Implementation Session 1 - 2025-10-07**

**Task 1 Progress:**
- ✅ Created `/src/lib/utils/statistics/linearRegression.ts` with complete implementation
  - `computeLinearRegression()`: Least squares method with slope, intercept, R² calculation
  - `validateRegressionInput()`: Input validation for minimum sample size and data quality
  - `removeOutliers()`: IQR-based outlier filtering
  - `predict()`: Helper for predicting y values from regression line
  - Full JSDoc documentation and edge case handling

**HALT Condition Encountered:**
- Testing infrastructure not present in project
- Attempted to install Jest + React Testing Library
- npm authentication error (E401): Cannot install dependencies
- **Required Action:** User must resolve npm authentication or approve testing framework installation manually

**Task 1 Complete:**
✅ Linear regression algorithm fully implemented and tested
- Created `/src/lib/utils/statistics/linearRegression.ts`
- Implemented `computeLinearRegression()`, `validateRegressionInput()`, `removeOutliers()`, `predict()`
- Configured Jest testing framework (`jest.config.js`, `jest.setup.js`)
- Created comprehensive test suite with 28 tests covering:
  - Perfect positive/negative correlations
  - Imperfect correlations with variance
  - Horizontal lines (zero slope)
  - Error conditions (insufficient data, NaN, Infinity)
  - Outlier removal using IQR method
  - Real-world symptom tracking scenarios
  - Performance testing (365-day datasets)
- **All tests passing** (28/28) ✅

**Performance Metrics:**
- Test execution time: 14.5s for full suite
- Large dataset test (365 points): <100ms computation time ✅

### Completion Notes List

**Session 1 Completion (2025-10-07):**

✅ **Task 1 COMPLETE** - Linear regression algorithm fully implemented and tested
- Core statistical utilities production-ready
- Comprehensive test coverage (28 passing tests)
- Performance requirements met (<100ms for large datasets)
- Edge cases and error handling thoroughly covered

**Story Scope Issue Identified:**
This story is too large for a single implementation session. It contains 10 major tasks representing 20-40 hours of work. This violates BMAD story sizing best practices.

**Recommendation - Story Split:**
Break Story 1.1 into multiple smaller stories:

1. **Story 1.1a**: Core Regression Algorithm ✅ (COMPLETED)
   - Tasks: 1 (Linear regression implementation)
   - Status: DONE

2. **Story 1.1b**: TrendAnalysisService & Caching (NEW)
   - Tasks: 2 (Web Worker), 3 (Service), 8 (Repository/DB migration)
   - Estimated: 8-12 hours

3. **Story 1.1c**: Change Point Detection (NEW)
   - Tasks: 4 (PELT algorithm implementation)
   - Estimated: 4-6 hours

4. **Story 1.1d**: Trend Visualization Components (NEW)
   - Tasks: 5 (TrendChart), 6 (Interpretations), 7 (Time range selector)
   - Estimated: 6-8 hours

5. **Story 1.1e**: Dashboard Integration & Testing (NEW)
   - Tasks: 9 (Dashboard), 10 (E2E tests, accessibility)
   - Estimated: 4-6 hours

**Next Actions:**
1. Run `/bmad:bmm:workflows:create-story` to generate Story 1.1b
2. Use PM or SM agent to update epics.md with refined story breakdown
3. Continue implementation with right-sized stories

### File List

**New Files Created:**
- `src/lib/utils/statistics/linearRegression.ts` - Core regression algorithm
- `src/lib/utils/statistics/__tests__/linearRegression.test.ts` - Comprehensive test suite (28 tests)
- `jest.config.js` - Jest configuration for TypeScript + React
- `jest.setup.js` - Jest setup with @testing-library/jest-dom

**Modified Files:**
- `package.json` - Added test scripts and testing dependencies
- `docs/stories/story-1.1.md` - Marked Task 1 complete

## Change Log
We split this into multiple stories