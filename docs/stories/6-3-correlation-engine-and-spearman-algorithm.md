# Story 6.3: Correlation Engine and Spearman Algorithm

Status: drafted

## Story

As a user seeking to understand what triggers my symptoms,
I want an automated correlation analysis system that finds statistical relationships in my data,
So that I can discover which foods, medications, or triggers correlate with symptom changes without manually analyzing months of logs.

## Acceptance Criteria

1. **AC6.3.1 — Implement Spearman rank correlation coefficient algorithm:** Implement Spearman's rank correlation coefficient algorithm in TypeScript with proper statistical formula: ρ = 1 - (6Σd²)/(n(n²-1)). Handle edge cases: ties (average ranking), perfect correlation (ρ = ±1), zero correlation (ρ = 0), insufficient data (n < 3). Return CorrelationCoefficient object with ρ value (-1 to +1), strength classification (strong/moderate/weak), sample size n. Create unit tests covering all edge cases and mathematical accuracy validation. [Source: docs/epics.md#Story-6.3, Statistical Methods textbooks]

2. **AC6.3.2 — Create CorrelationEngine service class:** Create `src/lib/services/correlationEngine.ts` service class with methods: `calculateCorrelation(series1: number[], series2: number[]): CorrelationResult`, `findSignificantCorrelations(threshold: number = 0.3): CorrelationResult[]`, `rankByStrength(): CorrelationResult[]`. Service orchestrates data extraction, Spearman algorithm calls, filtering by significance, and ranking. Follows existing service pattern from analyticsRepository and flareRepository. Export all public methods with TypeScript interfaces and JSDoc comments. [Source: docs/epics.md#Story-6.3]

3. **AC6.3.3 — Implement data windowing logic:** Create time-series data extraction functions that pull foods, symptoms, medications, triggers over configurable time ranges (7, 30, 90 days). Extract parallel time series: food consumption frequency per day, symptom severity per day (average if multiple), medication adherence per day, trigger exposure per day. Align data points by date (handle missing data with null or interpolation). Use existing repositories (foodEventRepository, symptomInstanceRepository, medicationEventRepository, triggerEventRepository) with efficient compound index queries. [Source: docs/epics.md#Story-6.3, docs/data-models.md]

4. **AC6.3.4 — Create correlation pairs with lag windows:** Generate all meaningful correlation pairs: food-symptom (each food × each symptom), trigger-symptom, medication-symptom, food-flare severity, trigger-flare severity. Implement lag windows: test correlations at 0, 6, 12, 24, 48 hour lags to detect delayed effects (e.g., "dairy consumption correlates with headache 12 hours later"). Use sliding window approach to align lagged time series. Store lag offset with each correlation result for interpretation. [Source: docs/epics.md#Story-6.3]

5. **AC6.3.5 — Filter correlations by statistical significance:** Filter correlation results using triple criteria: |ρ| >= 0.3 (moderate or stronger correlation, per Cohen's guidelines), sample size n >= 10 (minimum data points for statistical validity), p-value < 0.05 (statistical significance test). Implement p-value calculation for Spearman correlation (approximation using t-distribution for n >= 10). Store significance flags: isSignificant (boolean), significanceLevel (p-value), confidenceInterval (optional). Return only significant correlations to avoid false positives. [Source: docs/epics.md#Story-6.3, Statistical significance standards]

6. **AC6.3.6 — Create CorrelationResult data model:** Define CorrelationResult TypeScript interface in `src/types/correlation.ts`: { id, type (food-symptom|trigger-symptom|medication-symptom|food-flare|trigger-flare), item1 (name/ID), item2 (name/ID), coefficient (ρ value -1 to +1), strength (strong|moderate|weak), significance (p-value), sampleSize (n), lagHours (0-48), confidence (high|medium|low), calculatedAt (timestamp), userId }. Create Zod schema for validation. Export interface for use across correlation engine, repository, and UI components. [Source: docs/epics.md#Story-6.3]

7. **AC6.3.7 — Implement correlation repository with IndexedDB persistence:** Create `src/lib/repositories/correlationRepository.ts` following existing repository pattern. Add `correlations` table to Dexie schema (schema version 25) with compound indexes: [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt]. Implement CRUD operations: `create()`, `findAll(userId)`, `findByType(type)`, `findByItem(item)`, `findSignificant(threshold)`, `deleteOlderThan(date)`. Use efficient queries leveraging compound indexes for fast lookups. [Source: docs/epics.md#Story-6.3, docs/data-models.md]

8. **AC6.3.8 — Add background calculation service:** Create `src/lib/services/correlationCalculationService.ts` that recalculates correlations when new data is logged. Use debouncing (wait 5 minutes after last data entry before recalculating) to avoid excessive computation. Trigger calculation on: new foodEvent, symptomInstance, medicationEvent, triggerEvent, or daily log entry. Run calculation in background (non-blocking UI). Cache results for 1 hour to reduce redundant calculations. Store calculation status in localStorage: lastCalculated timestamp, isCalculating boolean. [Source: docs/epics.md#Story-6.3]

9. **AC6.3.9 — Create comprehensive unit tests for Spearman algorithm:** Write test suite `src/lib/services/__tests__/spearmanCorrelation.test.ts` covering: perfect positive correlation ([1,2,3] vs [2,4,6] → ρ = 1), perfect negative correlation ([1,2,3] vs [6,4,2] → ρ = -1), zero correlation (random series → ρ ≈ 0), tied ranks (handle average ranking correctly), single data point (n=1 → undefined), two data points (n=2 → ρ = ±1), edge case with all identical values ([5,5,5] vs [3,3,3] → undefined). Verify mathematical accuracy against known results from statistical software. Test p-value calculation accuracy. [Source: docs/epics.md#Story-6.3]

10. **AC6.3.10 — Add performance optimization with caching and optional Web Worker:** Implement calculation batching: process up to 100 correlation pairs per batch, yield between batches to keep UI responsive. Cache correlation results in memory for 1 hour (Map<cacheKey, CorrelationResult>). Add optional Web Worker for heavy computation: offload Spearman calculations to worker thread when calculating >500 pairs, fallback to main thread if Web Workers unavailable. Measure and log performance: track calculation duration, emit performance metrics. Target: calculate 1000 correlation pairs in <5 seconds. [Source: docs/epics.md#Story-6.3]

## Tasks / Subtasks

- [ ] Task 1: Implement Spearman rank correlation algorithm (AC: #6.3.1)
  - [ ] 1.1: Create `src/lib/services/statistics/spearmanCorrelation.ts` module
  - [ ] 1.2: Implement `rankData(values: number[]): number[]` function to convert values to ranks
  - [ ] 1.3: Handle tied ranks: assign average rank to tied values
  - [ ] 1.4: Implement main `spearmanCorrelation(x: number[], y: number[]): CorrelationCoefficient` function
  - [ ] 1.5: Calculate rank differences: d[i] = rank(x[i]) - rank(y[i])
  - [ ] 1.6: Calculate Spearman's ρ: ρ = 1 - (6 * Σd²) / (n * (n² - 1))
  - [ ] 1.7: Classify correlation strength: |ρ| >= 0.7 strong, 0.3-0.7 moderate, < 0.3 weak
  - [ ] 1.8: Return CorrelationCoefficient: { rho, strength, sampleSize }
  - [ ] 1.9: Handle edge cases: n < 3 return null, all identical values return undefined

- [ ] Task 2: Implement p-value calculation for significance testing (AC: #6.3.5)
  - [ ] 2.1: Add `calculatePValue(rho: number, n: number): number` function
  - [ ] 2.2: For n >= 10: use t-distribution approximation t = rho * sqrt((n-2)/(1-rho²))
  - [ ] 2.3: Calculate degrees of freedom: df = n - 2
  - [ ] 2.4: Compute two-tailed p-value from t-distribution
  - [ ] 2.5: For n < 10: return conservative p = 1 (insufficient data)
  - [ ] 2.6: Add helper: `isSignificant(pValue: number, alpha: number = 0.05): boolean`

- [ ] Task 3: Create CorrelationResult data model and types (AC: #6.3.6)
  - [ ] 3.1: Create `src/types/correlation.ts` TypeScript definitions
  - [ ] 3.2: Define CorrelationType enum: "food-symptom" | "trigger-symptom" | "medication-symptom" | "food-flare" | "trigger-flare"
  - [ ] 3.3: Define CorrelationStrength enum: "strong" | "moderate" | "weak"
  - [ ] 3.4: Define CorrelationResult interface with all fields from AC6.3.6
  - [ ] 3.5: Create Zod schema for CorrelationResult validation
  - [ ] 3.6: Define CorrelationCoefficient interface: { rho, strength, sampleSize, pValue, isSignificant }
  - [ ] 3.7: Export all types and schemas for use across modules

- [ ] Task 4: Implement data windowing and time-series extraction (AC: #6.3.3)
  - [ ] 4.1: Create `src/lib/services/correlationDataExtractor.ts` module
  - [ ] 4.2: Implement `extractFoodTimeSeries(userId, startDate, endDate): Map<date, frequency>`
  - [ ] 4.3: Query foodEventRepository with [userId+timestamp] index for date range
  - [ ] 4.4: Aggregate food consumption per day: count occurrences by foodId and date
  - [ ] 4.5: Implement `extractSymptomTimeSeries(userId, startDate, endDate): Map<date, avgSeverity>`
  - [ ] 4.6: Query symptomInstanceRepository for date range, average severity per symptom per day
  - [ ] 4.7: Implement `extractMedicationTimeSeries()` for adherence (taken vs scheduled)
  - [ ] 4.8: Implement `extractTriggerTimeSeries()` for exposure frequency
  - [ ] 4.9: Create `alignTimeSeries(series1, series2, lagHours): [number[], number[]]` to align data points
  - [ ] 4.10: Handle missing data: use linear interpolation or skip date if both series missing

- [ ] Task 5: Implement lag window correlation pairs (AC: #6.3.4)
  - [ ] 5.1: Create `generateCorrelationPairs(userId, timeRange): CorrelationPair[]` function
  - [ ] 5.2: Generate food-symptom pairs: cross product of all tracked foods × all logged symptoms
  - [ ] 5.3: Generate trigger-symptom pairs similarly
  - [ ] 5.4: Generate medication-symptom pairs (medication adherence vs symptom severity)
  - [ ] 5.5: Generate food-flare and trigger-flare pairs
  - [ ] 5.6: For each pair, test multiple lag windows: 0, 6, 12, 24, 48 hours
  - [ ] 5.7: Shift time series by lag offset before calculating correlation
  - [ ] 5.8: Store lagHours with each correlation result
  - [ ] 5.9: Filter to only pairs with n >= 10 data points (statistical validity)

- [ ] Task 6: Create CorrelationEngine service class (AC: #6.3.2)
  - [ ] 6.1: Create `src/lib/services/correlationEngine.ts` service class
  - [ ] 6.2: Import spearmanCorrelation, correlationDataExtractor, correlationRepository
  - [ ] 6.3: Implement `calculateCorrelation(series1, series2): CorrelationResult`
  - [ ] 6.4: Call spearmanCorrelation algorithm, calculate p-value, create CorrelationResult object
  - [ ] 6.5: Implement `findSignificantCorrelations(userId, timeRange, threshold = 0.3): CorrelationResult[]`
  - [ ] 6.6: Extract time series data, generate correlation pairs, calculate all correlations
  - [ ] 6.7: Filter by significance criteria: |ρ| >= threshold, n >= 10, p < 0.05
  - [ ] 6.8: Implement `rankByStrength(correlations): CorrelationResult[]`
  - [ ] 6.9: Sort by absolute value of correlation coefficient descending
  - [ ] 6.10: Add JSDoc comments and TypeScript types for all public methods

- [ ] Task 7: Add correlations table to IndexedDB schema (AC: #6.3.7)
  - [ ] 7.1: Open `src/lib/db/schema.ts` and add CorrelationRecord interface
  - [ ] 7.2: Define all fields matching CorrelationResult type
  - [ ] 7.3: Open `src/lib/db/client.ts` and increment schema version to 25
  - [ ] 7.4: Add correlations table to Dexie class type definition
  - [ ] 7.5: Add migration in version(25).stores(): `correlations: 'id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, calculatedAt'`
  - [ ] 7.6: Test migration with existing data (should preserve all existing tables)

- [ ] Task 8: Implement correlation repository (AC: #6.3.7)
  - [ ] 8.1: Create `src/lib/repositories/correlationRepository.ts` following existing patterns
  - [ ] 8.2: Import db from client.ts, import CorrelationRecord type
  - [ ] 8.3: Implement `create(correlation: CorrelationRecord): Promise<string>` - insert and return ID
  - [ ] 8.4: Implement `findAll(userId: string): Promise<CorrelationRecord[]>` - query by userId
  - [ ] 8.5: Implement `findByType(userId: string, type: CorrelationType): Promise<CorrelationRecord[]>` - use [userId+type] index
  - [ ] 8.6: Implement `findByItem(userId: string, item: string): Promise<CorrelationRecord[]>` - find correlations involving specific food/symptom/etc.
  - [ ] 8.7: Implement `findSignificant(userId: string, threshold: number = 0.3): Promise<CorrelationRecord[]>` - filter |coefficient| >= threshold
  - [ ] 8.8: Implement `deleteOlderThan(userId: string, date: number): Promise<number>` - cleanup old correlations
  - [ ] 8.9: Implement `upsert(correlation: CorrelationRecord): Promise<string>` - update if exists, create if new
  - [ ] 8.10: Add TypeScript types and error handling for all methods

- [ ] Task 9: Create background correlation calculation service (AC: #6.3.8)
  - [ ] 9.1: Create `src/lib/services/correlationCalculationService.ts` module
  - [ ] 9.2: Implement debouncing logic: wait 5 minutes after last data entry
  - [ ] 9.3: Create `scheduleRecalculation()` function that sets timeout for recalculation
  - [ ] 9.4: Implement `recalculateCorrelations(userId: string): Promise<void>` main calculation function
  - [ ] 9.5: Set isCalculating flag in localStorage at start
  - [ ] 9.6: Call correlationEngine.findSignificantCorrelations() for all time ranges (7, 30, 90 days)
  - [ ] 9.7: Save results to correlationRepository
  - [ ] 9.8: Update lastCalculated timestamp in localStorage
  - [ ] 9.9: Clear isCalculating flag on completion or error
  - [ ] 9.10: Add event listeners to trigger on new foodEvent, symptomInstance, medicationEvent, triggerEvent
  - [ ] 9.11: Implement cache: store results in memory Map for 1 hour, skip recalculation if cached

- [ ] Task 10: Implement performance optimizations (AC: #6.3.10)
  - [ ] 10.1: Implement batching in correlationEngine: process 100 pairs per batch
  - [ ] 10.2: Add `await new Promise(resolve => setTimeout(resolve, 0))` between batches to yield to UI
  - [ ] 10.3: Implement in-memory cache: Map<cacheKey, CorrelationResult> with 1-hour TTL
  - [ ] 10.4: Generate cache key: `${userId}-${type}-${item1}-${item2}-${lagHours}-${timeRange}`
  - [ ] 10.5: Check cache before calculation, return cached result if valid (not expired)
  - [ ] 10.6: Create optional Web Worker: `src/workers/correlationWorker.ts` (optional enhancement)
  - [ ] 10.7: Move Spearman calculations to worker when >500 pairs to calculate
  - [ ] 10.8: Add performance measurement: track start/end time, log duration
  - [ ] 10.9: Emit performance events: `{ event: 'correlation-calc-complete', duration, pairsCalculated }`
  - [ ] 10.10: Target validation: test with 1000 pairs, ensure completion in <5 seconds

- [ ] Task 11: Write comprehensive unit tests (AC: #6.3.9)
  - [ ] 11.1: Create `src/lib/services/statistics/__tests__/spearmanCorrelation.test.ts`
  - [ ] 11.2: Test perfect positive correlation: ([1,2,3], [2,4,6]) → ρ = 1
  - [ ] 11.3: Test perfect negative correlation: ([1,2,3], [6,4,2]) → ρ = -1
  - [ ] 11.4: Test zero correlation: ([1,2,3,4,5], [3,1,4,2,5]) → ρ ≈ 0
  - [ ] 11.5: Test tied ranks: ([1,2,2,3], [4,5,5,6]) → verify average ranking applied
  - [ ] 11.6: Test edge case n=1: return null (insufficient data)
  - [ ] 11.7: Test edge case n=2: return ρ = ±1 (trivial correlation)
  - [ ] 11.8: Test all identical values: ([5,5,5], [3,3,3]) → return undefined
  - [ ] 11.9: Test p-value calculation accuracy against known statistical tables
  - [ ] 11.10: Test significance filtering: verify |ρ| >= 0.3, n >= 10, p < 0.05 logic
  - [ ] 11.11: Add integration test: full correlation engine flow end-to-end

- [ ] Task 12: Create correlation engine integration tests
  - [ ] 12.1: Create `src/lib/services/__tests__/correlationEngine.test.ts`
  - [ ] 12.2: Test findSignificantCorrelations() with mock data
  - [ ] 12.3: Test data extraction from repositories
  - [ ] 12.4: Test lag window generation (0, 6, 12, 24, 48 hours)
  - [ ] 12.5: Test filtering by significance criteria
  - [ ] 12.6: Test ranking by correlation strength
  - [ ] 12.7: Test repository persistence (save/retrieve correlations)
  - [ ] 12.8: Test background calculation service debouncing
  - [ ] 12.9: Test cache expiration and invalidation
  - [ ] 12.10: Verify all tests pass with `npm test`

## Dev Notes

### Technical Architecture

This story implements the correlation engine foundation for Epic 6 (Health Insights & Correlation Analytics), enabling automated discovery of statistical relationships between tracked health data. The Spearman rank correlation algorithm is ideal for this use case because it handles non-linear monotonic relationships and is robust to outliers in health data.

**Key Architecture Points:**
- **Statistical Rigor:** Spearman's ρ with p-value testing ensures only statistically significant correlations surface
- **Lag Windows:** Detect delayed effects (e.g., food consumed today causing symptom spike tomorrow)
- **Background Calculation:** Debounced recalculation prevents UI blocking during data entry
- **Performance:** Batching and caching ensure smooth UX even with large datasets (1000+ correlation pairs)
- **Repository Pattern:** Follows existing flareRepository, foodRepository patterns for consistency

### Learnings from Previous Story

**From Story 6-2-daily-log-page (Status: review)**

- **IndexedDB Schema Versioning:** Story 6.2 incremented schema to version 24 for dailyLogs table. This story will increment to version 25 for correlations table. Follow same migration pattern in client.ts.

- **Repository Pattern Established:** Story 6.2 created dailyLogsRepository with full CRUD operations (create, getByDate, update, upsert, listByDateRange). Apply same pattern for correlationRepository.

- **Compound Index Usage:** Story 6.2 used [userId+date] compound index to enforce one entry per user per day. This story will use [userId+type], [userId+item1], [userId+item2] for efficient correlation lookups.

- **Data Model in schema.ts:** Story 6.2 added DailyLogRecord interface to schema.ts. This story will add CorrelationRecord interface following same pattern.

- **Files Created by 6.2:**
  - `src/types/daily-log.ts` - Type definitions (use as template for src/types/correlation.ts)
  - `src/lib/repositories/dailyLogsRepository.ts` - Repository (template for correlationRepository)
  - `src/lib/db/schema.ts` - Modified to add DailyLogRecord
  - `src/lib/db/client.ts` - Modified to add dailyLogs table version 24

**Key Pattern for This Story:** Correlation engine is a pure service layer (no UI components in this story). All TypeScript code with comprehensive unit tests. Story 6.4 will build the UI components that consume correlation data.

[Source: stories/6-2-daily-log-page.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
```
src/types/
  └── correlation.ts (NEW - CorrelationResult, CorrelationType interfaces and Zod schemas)

src/lib/services/statistics/
  └── spearmanCorrelation.ts (NEW - Spearman's ρ algorithm implementation)

src/lib/services/
  ├── correlationEngine.ts (NEW - main correlation engine service)
  ├── correlationDataExtractor.ts (NEW - time-series data extraction)
  ├── correlationCalculationService.ts (NEW - background calculation with debouncing)
  └── __tests__/
      ├── spearmanCorrelation.test.ts (NEW - algorithm unit tests)
      └── correlationEngine.test.ts (NEW - service integration tests)

src/lib/repositories/
  └── correlationRepository.ts (NEW - correlation CRUD operations)

src/workers/ (OPTIONAL ENHANCEMENT)
  └── correlationWorker.ts (NEW - Web Worker for heavy calculations)
```

**Files to Modify:**
- `src/lib/db/schema.ts` - Add CorrelationRecord interface
- `src/lib/db/client.ts` - Add correlations table, increment version to 25

### Data Model Interface

**CorrelationRecord TypeScript Interface:**
```typescript
export interface CorrelationRecord {
  id: string; // UUID
  userId: string; // Current user ID

  // Correlation metadata
  type: CorrelationType; // food-symptom | trigger-symptom | medication-symptom | food-flare | trigger-flare
  item1: string; // Food/trigger/medication ID or name
  item2: string; // Symptom/flare ID or name

  // Statistical results
  coefficient: number; // Spearman's ρ (-1 to +1)
  strength: CorrelationStrength; // strong | moderate | weak
  significance: number; // p-value (0-1)
  sampleSize: number; // n (number of data points)
  lagHours: number; // Time lag in hours (0, 6, 12, 24, 48)
  confidence: "high" | "medium" | "low"; // Based on p-value and sample size

  // Temporal context
  timeRange: "7d" | "30d" | "90d"; // Time window used for calculation
  calculatedAt: number; // Unix timestamp when correlation was calculated

  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export type CorrelationType =
  | "food-symptom"
  | "trigger-symptom"
  | "medication-symptom"
  | "food-flare"
  | "trigger-flare";

export type CorrelationStrength = "strong" | "moderate" | "weak";

export interface CorrelationCoefficient {
  rho: number; // -1 to +1
  strength: CorrelationStrength;
  sampleSize: number;
  pValue: number; // Statistical significance
  isSignificant: boolean; // p < 0.05
}
```

**Dexie Schema Definition:**
```typescript
// In src/lib/db/schema.ts
export const db = new Dexie('SymptomTrackerDB') as Dexie & {
  // ... existing tables
  correlations: Dexie.Table<CorrelationRecord, string>;
};

db.version(25).stores({
  // ... existing tables from version 24
  correlations: 'id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt',
});
```

### Spearman Rank Correlation Algorithm

**Mathematical Formula:**

```
ρ = 1 - (6 * Σd²) / (n * (n² - 1))

Where:
- ρ (rho) = Spearman's rank correlation coefficient
- d = difference between paired ranks
- n = number of observations
```

**Algorithm Steps:**

1. **Rank the data:** Convert values to ranks (1 = smallest, n = largest)
2. **Handle ties:** Average the ranks for tied values
3. **Calculate rank differences:** d[i] = rank(x[i]) - rank(y[i])
4. **Sum squared differences:** Σd² = sum of all d[i]²
5. **Apply formula:** ρ = 1 - (6 * Σd²) / (n * (n² - 1))
6. **Classify strength:**
   - |ρ| >= 0.7: Strong correlation
   - 0.3 <= |ρ| < 0.7: Moderate correlation
   - |ρ| < 0.3: Weak correlation (usually filtered out)

**Example Calculation:**

```typescript
// Input data
const foodConsumption = [1, 2, 3, 4, 5]; // Days with dairy consumption
const symptomSeverity = [2, 4, 6, 8, 10]; // Headache severity on those days

// Step 1: Rank the data (already ranked in this example)
const ranksX = [1, 2, 3, 4, 5];
const ranksY = [1, 2, 3, 4, 5];

// Step 2: Calculate differences
const d = [0, 0, 0, 0, 0]; // Perfect correlation: all differences are 0

// Step 3: Sum of squared differences
const sumD2 = 0;

// Step 4: Apply formula
const n = 5;
const rho = 1 - (6 * 0) / (5 * (25 - 1)); // = 1 - 0 / 120 = 1

// Result: ρ = 1.0 (perfect positive correlation)
// Interpretation: Dairy consumption strongly correlates with headache severity
```

### Lag Window Implementation

**Purpose:** Detect delayed effects where trigger occurs hours before symptom appears.

**Example Scenarios:**
- Food consumed at noon causes symptom spike at 6 PM (6-hour lag)
- Medication taken at night reduces symptoms next morning (12-hour lag)
- Trigger exposure today causes flare tomorrow (24-hour lag)

**Implementation Strategy:**

```typescript
function alignTimeSeriesWithLag(
  series1: TimeSeriesData[], // e.g., food consumption
  series2: TimeSeriesData[], // e.g., symptom severity
  lagHours: number // 0, 6, 12, 24, or 48
): [number[], number[]] {
  // Shift series2 backward by lagHours
  const lagMs = lagHours * 60 * 60 * 1000;

  const aligned1: number[] = [];
  const aligned2: number[] = [];

  for (const point1 of series1) {
    // Find corresponding point in series2 that occurs lagHours later
    const point2 = series2.find(p =>
      Math.abs(p.timestamp - (point1.timestamp + lagMs)) < hourInMs
    );

    if (point2) {
      aligned1.push(point1.value);
      aligned2.push(point2.value);
    }
  }

  return [aligned1, aligned2];
}
```

**Example:**
```
Day 1, 12:00 PM: Ate dairy (consumption = 1)
Day 1, 6:00 PM:  Headache severity = 7
Day 2, 12:00 PM: Ate dairy (consumption = 1)
Day 2, 6:00 PM:  Headache severity = 8

With 6-hour lag:
- Pair 1: Dairy at noon (consumption=1) → Headache at 6 PM (severity=7)
- Pair 2: Dairy at noon (consumption=1) → Headache at 6 PM (severity=8)
- Calculate correlation between [1,1] and [7,8]
```

### Statistical Significance Testing

**P-Value Calculation (for n >= 10):**

```typescript
function calculatePValue(rho: number, n: number): number {
  if (n < 10) {
    return 1; // Insufficient data, not significant
  }

  // t-statistic approximation for Spearman correlation
  const t = rho * Math.sqrt((n - 2) / (1 - rho * rho));
  const df = n - 2; // Degrees of freedom

  // Calculate two-tailed p-value from t-distribution
  // (Use jStat library or approximation)
  const pValue = tDistribution.cdf(Math.abs(t), df);

  return 2 * (1 - pValue); // Two-tailed test
}

function isSignificant(pValue: number, alpha: number = 0.05): boolean {
  return pValue < alpha;
}
```

**Significance Criteria (Triple Filter):**

1. **Effect Size:** |ρ| >= 0.3 (moderate or stronger)
2. **Sample Size:** n >= 10 (statistical validity)
3. **P-Value:** p < 0.05 (95% confidence)

**Example:**
```
Dairy-Headache correlation:
- ρ = 0.68 (moderate-strong positive correlation) ✓
- n = 15 data points ✓
- p = 0.008 (statistically significant) ✓
→ SIGNIFICANT: Include in results
```

### Performance Optimization Strategy

**Challenge:** Calculating 1000+ correlation pairs can block UI thread for seconds.

**Solutions:**

1. **Batching (100 pairs per batch):**
```typescript
async function calculateCorrelationsBatched(
  pairs: CorrelationPair[]
): Promise<CorrelationResult[]> {
  const results: CorrelationResult[] = [];
  const batchSize = 100;

  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize);

    // Calculate batch
    for (const pair of batch) {
      const result = calculateCorrelation(pair.series1, pair.series2);
      results.push(result);
    }

    // Yield to UI thread between batches
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}
```

2. **In-Memory Caching (1-hour TTL):**
```typescript
const correlationCache = new Map<string, {
  result: CorrelationResult;
  expiresAt: number;
}>();

function getCachedCorrelation(cacheKey: string): CorrelationResult | null {
  const cached = correlationCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result;
  }
  correlationCache.delete(cacheKey); // Expired
  return null;
}

function cacheCorrelation(cacheKey: string, result: CorrelationResult) {
  correlationCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
  });
}
```

3. **Web Worker (Optional Enhancement for >500 pairs):**
```typescript
// src/workers/correlationWorker.ts
self.onmessage = (e) => {
  const { pairs } = e.data;
  const results = pairs.map(pair =>
    calculateSpearmanCorrelation(pair.series1, pair.series2)
  );
  self.postMessage({ results });
};

// Main thread
const worker = new Worker('/workers/correlationWorker.js');
worker.postMessage({ pairs: largePairList });
worker.onmessage = (e) => {
  const { results } = e.data;
  // Process results
};
```

### Background Calculation Service

**Debouncing Strategy:**

```typescript
let recalculationTimeout: NodeJS.Timeout | null = null;

export function scheduleRecalculation(userId: string) {
  // Clear existing timeout
  if (recalculationTimeout) {
    clearTimeout(recalculationTimeout);
  }

  // Schedule new recalculation in 5 minutes
  recalculationTimeout = setTimeout(() => {
    recalculateCorrelations(userId);
  }, 5 * 60 * 1000); // 5 minutes
}

// Called when user logs new data
export function onDataLogged(userId: string, eventType: string) {
  console.log(`Data logged: ${eventType}, scheduling recalculation...`);
  scheduleRecalculation(userId);
}
```

**Trigger Events:**
- New food event logged → `scheduleRecalculation(userId)`
- New symptom logged → `scheduleRecalculation(userId)`
- New medication event → `scheduleRecalculation(userId)`
- New trigger event → `scheduleRecalculation(userId)`
- Daily log saved → `scheduleRecalculation(userId)`

### Testing Strategy

**Unit Tests (Spearman Algorithm):**

```typescript
describe('spearmanCorrelation', () => {
  it('should return ρ = 1 for perfect positive correlation', () => {
    const result = spearmanCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]);
    expect(result.rho).toBe(1);
    expect(result.strength).toBe('strong');
  });

  it('should return ρ = -1 for perfect negative correlation', () => {
    const result = spearmanCorrelation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2]);
    expect(result.rho).toBe(-1);
    expect(result.strength).toBe('strong');
  });

  it('should return ρ ≈ 0 for no correlation', () => {
    const result = spearmanCorrelation([1, 2, 3, 4, 5], [3, 1, 4, 2, 5]);
    expect(Math.abs(result.rho)).toBeLessThan(0.3);
    expect(result.strength).toBe('weak');
  });

  it('should handle tied ranks correctly', () => {
    const result = spearmanCorrelation([1, 2, 2, 3], [4, 5, 5, 6]);
    expect(result.rho).toBeGreaterThan(0.9); // Strong positive
  });

  it('should return null for insufficient data (n < 3)', () => {
    const result = spearmanCorrelation([1], [2]);
    expect(result).toBeNull();
  });
});
```

**Integration Tests (Correlation Engine):**

```typescript
describe('CorrelationEngine', () => {
  it('should find significant food-symptom correlations', async () => {
    // Setup mock data
    await seedMockData();

    const engine = new CorrelationEngine();
    const results = await engine.findSignificantCorrelations('user-123', '30d', 0.3);

    // Verify results
    expect(results).toHaveLength(greaterThan(0));
    expect(results[0].type).toBe('food-symptom');
    expect(Math.abs(results[0].coefficient)).toBeGreaterThanOrEqual(0.3);
    expect(results[0].sampleSize).toBeGreaterThanOrEqual(10);
    expect(results[0].significance).toBeLessThan(0.05);
  });

  it('should test multiple lag windows', async () => {
    const engine = new CorrelationEngine();
    const results = await engine.findSignificantCorrelations('user-123', '30d');

    // Verify lag windows tested
    const lagHours = results.map(r => r.lagHours);
    expect(lagHours).toContain(0);
    expect(lagHours).toContain(6);
    expect(lagHours).toContain(12);
    expect(lagHours).toContain(24);
    expect(lagHours).toContain(48);
  });
});
```

### References

- [Source: docs/epics.md#Story-6.3] - Story acceptance criteria and requirements
- [Source: docs/data-models.md#flareEvents] - Existing data model patterns
- [Source: docs/data-models.md#foodEvents] - Food event structure
- [Source: docs/data-models.md#symptomInstances] - Symptom severity tracking
- [Source: stories/6-2-daily-log-page.md#Dev-Agent-Record] - Repository pattern from Story 6.2
- [Statistical Methods] - Spearman's rank correlation coefficient formula
- [Cohen's Guidelines] - Correlation strength classification (0.3 moderate, 0.7 strong)

### Integration Points

**This Story Depends On:**
- Story 6.2: Daily Log Page (review) - Provides mood/sleep data for correlation analysis
- Epic 3.5: Intervention Effectiveness Analysis (done) - Established intervention effectiveness patterns that inform correlation engine design
- Existing repositories: foodEventRepository, symptomInstanceRepository, medicationEventRepository, triggerEventRepository

**This Story Enables:**
- Story 6.4: Health Insights Hub UI - Consumes correlation data to display insights
- Story 6.5: Timeline Pattern Detection - Uses correlation results to highlight patterns
- Story 6.7: Treatment Effectiveness Tracker - Extends correlation engine for treatment analysis

### Risk Mitigation

**Risk: Statistical misinterpretation by users (correlation ≠ causation)**
- Mitigation: Medical disclaimer in all UI consuming correlation data
- Strict significance filtering prevents false positives
- Documentation emphasizes consulting healthcare providers

**Risk: Performance degradation with large datasets**
- Mitigation: Batching ensures UI remains responsive
- Caching reduces redundant calculations
- Optional Web Worker for heavy computation

**Risk: Insufficient data leading to spurious correlations**
- Mitigation: Triple filter (|ρ| >= 0.3, n >= 10, p < 0.05)
- Clear minimum sample size requirements
- Confidence levels based on statistical validity

**Risk: Background calculation consuming excessive resources**
- Mitigation: 5-minute debouncing prevents constant recalculation
- Calculation runs only when needed (new data logged)
- Cache prevents redundant work within 1-hour window

### Breaking Changes

**For Developers:**
- New data model CorrelationRecord added to IndexedDB (schema version 25)
- New repository correlationRepository following existing patterns
- New service correlationEngine providing correlation API
- All TypeScript with comprehensive unit tests required

**For Users:**
- No breaking changes (backend-only story)
- No UI changes in this story (UI comes in Story 6.4)
- Data logging workflows unchanged

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added by context workflow -->

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List

## Change Log

**Date: 2025-11-08**
- Created Story 6.3 - Correlation Engine and Spearman Algorithm
- Defined 10 acceptance criteria for correlation engine implementation
- Created 12 tasks with detailed subtasks (105 total subtasks)
- Documented Spearman algorithm, lag windows, significance testing, performance optimization
- Story ready for context generation and development

## Status

**Current Status:** drafted

**Previous Status:** backlog

Story drafted and ready for context generation workflow (story-context).
