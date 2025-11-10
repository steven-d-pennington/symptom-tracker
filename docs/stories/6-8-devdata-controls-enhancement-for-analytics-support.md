# Story 6.8: DevData Controls Enhancement for Analytics Support

Status: review

## Story

As a developer testing analytics features,
I want DevDataControls to generate rich synthetic data including daily logs, correlations, treatment effectiveness data, and intentional patterns,
So that I can comprehensively test and demonstrate all Epic 6 analytics capabilities with realistic test scenarios.

## Acceptance Criteria

1. **AC6.8.1 — Create generateDailyLogs.ts generator:** Create `src/lib/dev/generators/generateDailyLogs.ts` module that generates synthetic daily log entries (from Story 6.2 schema). Generator implements: 60-80% day coverage within date range (realistic gaps), mood/sleep values correlated with flare severity (high flare days = worse mood/sleep), configurable date ranges matching other generators, returns count of daily logs created. DailyLog schema includes: date (YYYY-MM-DD string), mood (1-10), sleep hours (4-10), sleep quality (1-10), notes (optional text), flare updates (optional). Generator creates realistic variations: weekday vs weekend patterns, seasonal mood variations, clustering around flare events. [Source: docs/epics.md#Story-6.8, AC #1]

2. **AC6.8.2 — Update orchestrator.ts to call daily log generator:** Extend `src/lib/dev/generators/orchestrator.ts` (from DevDataControls component) to include daily log generation after existing data generation. Add Step 13 in orchestration sequence: `await generateDailyLogs(userId, config)` after flares/symptoms/food generation (currently Step 12). Pass through date range from scenario config. Update GenerationResult interface to include `dailyLogsCreated: number` field. Ensure daily logs generate AFTER base data exists (flares, symptoms) so correlations can be created. Return total daily logs count in generation summary. [Source: docs/epics.md#Story-6.8, AC #2]

3. **AC6.8.3 — Integrate correlation engine into orchestrator:** Extend orchestrator.ts to trigger correlation calculation after all data generated. Add Step 14 (final step): `await correlationCalculationService.recalculateCorrelations(userId)` which scans all medication/food/trigger/symptom/flare data and calculates Spearman correlations (from Story 6.3). Import CorrelationCalculationService (from Story 6.3). Correlations calculate AFTER all base data exists to ensure sufficient sample sizes (n >= 10). Add `correlationsGenerated: number` to GenerationResult interface. Log correlation generation progress to console for debugging. Correlation calculation is non-blocking (uses debouncing from Story 6.3). [Source: docs/epics.md#Story-6.8, AC #3]

4. **AC6.8.4 — Integrate treatment effectiveness calculation into orchestrator:** Extend orchestrator.ts to trigger treatment effectiveness calculation after correlation engine (Step 15). Add call to `treatmentEffectivenessService.calculateAllTreatmentEffectiveness(userId, timeRange)` from Story 6.7. Treatment effectiveness analyzes medication/intervention events and calculates effectiveness scores (baseline vs outcome severity). Requires sufficient medication/intervention instances (minimum 3 cycles per treatment). Add `treatmentEffectivenessRecordsCreated: number` to GenerationResult interface. Only calculate if medication events exist (check result.medicationEventsCreated > 0). Treatment effectiveness depends on correlation engine completing first (uses correlation data). [Source: docs/epics.md#Story-6.8, AC #4, Story 6.7 integration]

5. **AC6.8.5 — Add analytics-showcase scenario to scenarios.ts:** Create new scenario in `src/lib/dev/config/scenarios.ts` called "analytics-showcase" optimized for demonstrating Epic 6 insights features. Scenario config: high correlation strength (0.85 correlation coefficient target), 20-25 flares with clustering patterns, strong food-symptom relationships (dairy → headaches, nightshades → inflammation), 80% daily log coverage (very high), intentional patterns enabled (recurring sequences), 12-month timeframe (sufficient data without overload). Scenario icon: 📊, name: "Analytics Showcase", description: "Demonstrates correlation analysis, treatment effectiveness, and pattern detection with strong intentional patterns for insights testing". Add to scenarios list with group: "Analytics Scenarios". [Source: docs/epics.md#Story-6.8, AC #5]

6. **AC6.8.6 — Add pattern-detection scenario to scenarios.ts:** Create "pattern-detection" scenario optimized for Story 6.5 timeline pattern visualization. Scenario config: focused 6-month timeframe (concentrated patterns), recurring sequence patterns (Monday stress triggers, Friday relaxation), consistent delay windows for food-symptom correlations (6-12 hours), high pattern clustering (same triggers → same symptoms repeatedly), weekly cycles (day-of-week patterns), medication effectiveness patterns (clear before/after changes). Scenario icon: 🔍, name: "Pattern Detection", description: "Focused dataset with recurring patterns and consistent time windows for testing timeline pattern highlighting and detection". Add to scenarios list with group: "Analytics Scenarios". [Source: docs/epics.md#Story-6.8, AC #6]

7. **AC6.8.7 — Create generatePatternData.ts with intentional pattern functions:** Create `src/lib/dev/generators/generatePatternData.ts` module with helper functions for generating intentional patterns in test data. Implement three pattern generators: `generateMondayStressPattern(userId, dateRange)` creates stress trigger + headache symptom every Monday (day-of-week pattern); `generateDairyHeadachePattern(userId, dateRange)` creates dairy food event followed by headache 6-12 hours later (food delay pattern); `generateMedicationImprovementPattern(userId, dateRange)` creates medication event followed by symptom reduction 24-48 hours later (treatment effectiveness pattern). Each pattern creates 10+ instances for statistical significance. Pattern functions integrate with orchestrator when intentionalPatterns config flag is true. Return pattern counts in generation summary. [Source: docs/epics.md#Story-6.8, AC #7]

8. **AC6.8.8 — Update orchestrator result reporting:** Extend GenerationResult interface in orchestrator.ts with new analytics-related fields. Add fields: `dailyLogsCreated: number`, `correlationsGenerated: number`, `significantCorrelations: number` (|ρ| >= 0.3), `treatmentEffectivenessRecordsCreated: number`, `patternsGenerated: number` (if intentional patterns enabled). Update result summary logging to include all new counts. Update DevDataControls.tsx display message to show new statistics when present (conditional display if count > 0). Ensure generation summary clearly shows what analytics data was created for testing insights features. [Source: docs/epics.md#Story-6.8, AC #8]

9. **AC6.8.9 — DevDataControls UI displays generation statistics:** Update `src/components/settings/DevDataControls.tsx` (existing component from Epic 3.5) to display analytics generation statistics. Extend result message to include: daily log count + coverage percentage, correlation count (total and significant |ρ| >= 0.3), treatment effectiveness records generated, pattern count (if applicable). Format example: "• 182 daily logs (60% coverage)\n• 47 correlations (12 significant)\n• 8 treatment effectiveness records\n• 3 intentional patterns". Only show counts if > 0 (conditional rendering). Update message formatting to group analytics stats under "📈 **Analytics Data:**" section separate from event counts. [Source: docs/epics.md#Story-6.8, AC #9]

10. **AC6.8.10 — Add scenario grouping in DevDataControls UI:** Update DevDataControls.tsx scenario display to group scenarios by category for better organization. Create three scenario groups: "Basic Scenarios" (quick-start, comprehensive, minimal), "Analytics Scenarios" (analytics-showcase, pattern-detection), "Performance Scenarios" (stress-test, if exists). Display group headings in UI with visual separators. Each group shows scenarios in collapsible sections or clearly separated cards. Add group descriptions explaining use case for each group. Improve scenario card layout for better scanning (existing grid layout enhanced with group organization). Update help text to explain scenario groups. [Source: docs/epics.md#Story-6.8, AC #10]

## Tasks / Subtasks

- [ ] Task 1: Create generateDailyLogs.ts generator module (AC: #6.8.1)
  - [ ] 1.1: Create src/lib/dev/generators/generateDailyLogs.ts file
  - [ ] 1.2: Import dailyLogRepository from Story 6.2
  - [ ] 1.3: Define DailyLogGenerationConfig interface (userId, startDate, endDate, coveragePercent, correlateWithFlares)
  - [ ] 1.4: Implement generateDailyLogs(userId, config) main function
  - [ ] 1.5: Calculate target days to generate (coveragePercent * total days in range)
  - [ ] 1.6: Randomly select days for coverage (realistic gaps, not consecutive)
  - [ ] 1.7: Generate mood values (1-10) with variation and flare correlation
  - [ ] 1.8: Generate sleep hours (4-10) and sleep quality (1-10) with flare correlation
  - [ ] 1.9: Query flares for each day and reduce mood/sleep on high-severity flare days
  - [ ] 1.10: Generate optional notes (10% of days get notes)
  - [ ] 1.11: Add weekday vs weekend patterns (better mood/sleep on weekends)
  - [ ] 1.12: Batch create daily logs via dailyLogRepository.createBatch()
  - [ ] 1.13: Return { dailyLogsCreated: number }
  - [ ] 1.14: Add console logging for debugging generation progress

- [ ] Task 2: Update orchestrator.ts to call daily log generator (AC: #6.8.2)
  - [ ] 2.1: Open src/lib/dev/generators/orchestrator.ts
  - [ ] 2.2: Import generateDailyLogs from generateDailyLogs.ts
  - [ ] 2.3: Add Step 13 after existing data generation: Generate daily logs
  - [ ] 2.4: Call generateDailyLogs(userId, { startDate, endDate, coveragePercent: config.dailyLogCoverage || 0.6 })
  - [ ] 2.5: Update GenerationResult interface to include dailyLogsCreated: number
  - [ ] 2.6: Store daily logs count in result object
  - [ ] 2.7: Ensure daily logs generate AFTER flares exist (dependency check)
  - [ ] 2.8: Add console log: "Step 13: Generating daily logs..."

- [ ] Task 3: Integrate correlation engine into orchestrator (AC: #6.8.3)
  - [ ] 3.1: Import CorrelationCalculationService from Story 6.3 (src/lib/services/correlationCalculationService.ts)
  - [ ] 3.2: Add Step 14 after daily log generation: Calculate correlations
  - [ ] 3.3: Call await correlationCalculationService.recalculateCorrelations(userId)
  - [ ] 3.4: Update GenerationResult to include correlationsGenerated: number, significantCorrelations: number
  - [ ] 3.5: Query correlationRepository after calculation to get counts
  - [ ] 3.6: Filter significant correlations: Math.abs(correlation.coefficient) >= 0.3
  - [ ] 3.7: Store correlation counts in result object
  - [ ] 3.8: Add console log: "Step 14: Calculating correlations... [count] found"
  - [ ] 3.9: Handle case where correlation service not yet implemented (try-catch)

- [ ] Task 4: Integrate treatment effectiveness calculation (AC: #6.8.4)
  - [ ] 4.1: Import TreatmentEffectivenessService from Story 6.7 (src/lib/services/treatmentEffectivenessService.ts)
  - [ ] 4.2: Add Step 15 after correlation calculation: Calculate treatment effectiveness
  - [ ] 4.3: Check if medicationEventsCreated > 0 before calculating
  - [ ] 4.4: Call await treatmentEffectivenessService.calculateAllTreatmentEffectiveness(userId, timeRange)
  - [ ] 4.5: Update GenerationResult to include treatmentEffectivenessRecordsCreated: number
  - [ ] 4.6: Query treatmentEffectivenessRepository to get count of records created
  - [ ] 4.7: Store treatment effectiveness count in result object
  - [ ] 4.8: Add console log: "Step 15: Calculating treatment effectiveness... [count] records created"
  - [ ] 4.9: Handle case where treatment effectiveness service not yet implemented (try-catch)

- [ ] Task 5: Create generatePatternData.ts module (AC: #6.8.7)
  - [ ] 5.1: Create src/lib/dev/generators/generatePatternData.ts file
  - [ ] 5.2: Import repositories: triggerEventRepository, symptomInstanceRepository, foodEventRepository, medicationEventRepository
  - [ ] 5.3: Implement generateMondayStressPattern(userId, startDate, endDate)
  - [ ] 5.4: Find all Mondays in date range
  - [ ] 5.5: Create stress trigger event + headache symptom on each Monday (80% of Mondays)
  - [ ] 5.6: Implement generateDairyHeadachePattern(userId, startDate, endDate)
  - [ ] 5.7: Create dairy food event followed by headache 6-12 hours later (15+ instances)
  - [ ] 5.8: Implement generateMedicationImprovementPattern(userId, startDate, endDate)
  - [ ] 5.9: Create medication event followed by symptom severity reduction 24-48 hours later (10+ instances)
  - [ ] 5.10: Each pattern function returns count of pattern instances created
  - [ ] 5.11: Create orchestrator integration: generateAllPatterns(userId, config) wrapper function
  - [ ] 5.12: Add console logging for each pattern type generated

- [ ] Task 6: Add analytics scenarios to scenarios.ts (AC: #6.8.5, #6.8.6)
  - [ ] 6.1: Open src/lib/dev/config/scenarios.ts
  - [ ] 6.2: Create analytics-showcase scenario config object
  - [ ] 6.3: Set scenario properties: id: 'analytics-showcase', name: 'Analytics Showcase', icon: '📊', group: 'analytics'
  - [ ] 6.4: Configure scenario: flareCount: 20-25, correlationStrength: 0.85, dailyLogCoverage: 0.8, intentionalPatterns: true, timeframeMonths: 12
  - [ ] 6.5: Add description explaining use case for insights testing
  - [ ] 6.6: Create pattern-detection scenario config object
  - [ ] 6.7: Set scenario properties: id: 'pattern-detection', name: 'Pattern Detection', icon: '🔍', group: 'analytics'
  - [ ] 6.8: Configure scenario: timeframeMonths: 6, recurringPatterns: true, consistentDelays: true, weeklyPatterns: true, dailyLogCoverage: 0.7
  - [ ] 6.9: Add scenarios to getAllScenarios() export array
  - [ ] 6.10: Update scenario TypeScript types if needed

- [ ] Task 7: Update orchestrator result reporting (AC: #6.8.8)
  - [ ] 7.1: Open GenerationResult interface in orchestrator.ts
  - [ ] 7.2: Add new fields: dailyLogsCreated, correlationsGenerated, significantCorrelations, treatmentEffectivenessRecordsCreated, patternsGenerated
  - [ ] 7.3: Update all return statements to include new fields (default to 0 if not generated)
  - [ ] 7.4: Update console.log summary at end of orchestrator
  - [ ] 7.5: Log analytics data separately: "Analytics Data: X daily logs, Y correlations (Z significant), W treatment records"
  - [ ] 7.6: Ensure all generators return their counts properly
  - [ ] 7.7: Test result object structure matches interface

- [ ] Task 8: Update DevDataControls.tsx to display analytics stats (AC: #6.8.9)
  - [ ] 8.1: Open src/components/settings/DevDataControls.tsx
  - [ ] 8.2: Update handleGenerateScenario result message construction
  - [ ] 8.3: Add conditional section for daily logs (if dailyLogsCreated > 0)
  - [ ] 8.4: Calculate and display coverage percentage: (dailyLogsCreated / totalDaysInRange) × 100
  - [ ] 8.5: Add conditional section for correlations (if correlationsGenerated > 0)
  - [ ] 8.6: Display total correlations and significant correlations count
  - [ ] 8.7: Add conditional section for treatment effectiveness (if treatmentEffectivenessRecordsCreated > 0)
  - [ ] 8.8: Add conditional section for patterns (if patternsGenerated > 0)
  - [ ] 8.9: Group all analytics stats under "📈 **Analytics Data:**" heading
  - [ ] 8.10: Update message formatting with proper line breaks and emoji icons
  - [ ] 8.11: Test message display with and without analytics data

- [ ] Task 9: Add scenario grouping to DevDataControls UI (AC: #6.8.10)
  - [ ] 9.1: Open DevDataControls.tsx scenario rendering section
  - [ ] 9.2: Group scenarios by category: basic, analytics, performance
  - [ ] 9.3: Update getAllScenarios() to return scenarios with group field
  - [ ] 9.4: Implement scenario filtering by group in component
  - [ ] 9.5: Create group header UI components (collapsible sections or visual separators)
  - [ ] 9.6: Add group descriptions: "Basic Scenarios: Quick exploration and comprehensive testing"
  - [ ] 9.7: Add group description: "Analytics Scenarios: Optimized for Epic 6 insights features"
  - [ ] 9.8: Add group description: "Performance Scenarios: Stress testing with large datasets"
  - [ ] 9.9: Update scenario card layout within groups (maintain grid layout)
  - [ ] 9.10: Update help text to explain scenario groups
  - [ ] 9.11: Test UI with multiple scenarios in each group

- [ ] Task 10: Handle missing services gracefully (AC: #6.8.3, #6.8.4)
  - [ ] 10.1: Wrap correlation engine call in try-catch block
  - [ ] 10.2: If CorrelationCalculationService not found, log warning and continue
  - [ ] 10.3: Set correlationsGenerated = 0 if service missing
  - [ ] 10.4: Wrap treatment effectiveness call in try-catch block
  - [ ] 10.5: If TreatmentEffectivenessService not found, log warning and continue
  - [ ] 10.6: Set treatmentEffectivenessRecordsCreated = 0 if service missing
  - [ ] 10.7: Add console warnings for missing services: "Skipping [service] - not yet implemented"
  - [ ] 10.8: Ensure orchestrator completes successfully even if analytics services missing

- [ ] Task 11: Test DevData generation with analytics scenarios (AC: #6.8.5, #6.8.6)
  - [ ] 11.1: Open DevDataControls UI in Settings page
  - [ ] 11.2: Select "Analytics Showcase" scenario
  - [ ] 11.3: Generate test data and verify all counts appear
  - [ ] 11.4: Check console logs for correlation and treatment effectiveness calculation
  - [ ] 11.5: Navigate to Insights page and verify correlations display
  - [ ] 11.6: Navigate to Timeline page and verify pattern highlighting (if Story 6.5 complete)
  - [ ] 11.7: Generate "Pattern Detection" scenario
  - [ ] 11.8: Verify recurring patterns appear in timeline
  - [ ] 11.9: Test "Clear All Data" button removes analytics data
  - [ ] 11.10: Regenerate scenario and confirm analytics data recreates

- [ ] Task 12: Update data model imports and dependencies (AC: all)
  - [ ] 12.1: Ensure dailyLogRepository is exported and accessible (from Story 6.2)
  - [ ] 12.2: Ensure CorrelationCalculationService is exported (from Story 6.3)
  - [ ] 12.3: Ensure TreatmentEffectivenessService is exported (from Story 6.7)
  - [ ] 12.4: Verify all repository imports work with dynamic imports
  - [ ] 12.5: Update TypeScript types for all new interfaces
  - [ ] 12.6: Resolve any circular dependency issues in generators

## Dev Notes

### Technical Architecture

This story enhances the existing DevDataControls system (from Epic 3.5) to support comprehensive testing of Epic 6 analytics features. The orchestrator pattern chains data generation across multiple generators, ensuring dependencies are met (base data → daily logs → correlations → treatment effectiveness). The enhancement enables developers to test insights features (Story 6.4), timeline patterns (Story 6.5), and treatment effectiveness tracking (Story 6.7) with realistic, intentionally-patterned synthetic data.

**Key Architecture Points:**
- **Orchestrator Pattern:** Chains generators in dependency order (12 existing steps + 3 new analytics steps)
- **Daily Log Generator:** Creates mood/sleep data correlated with flare severity for realistic testing
- **Correlation Integration:** Triggers Story 6.3 correlation engine after all base data exists
- **Treatment Effectiveness Integration:** Calculates Story 6.7 treatment effectiveness scores after correlations complete
- **Pattern Generation:** Intentional recurring patterns for testing pattern detection (Story 6.5)
- **Scenario System:** Grouped scenarios (Basic/Analytics/Performance) optimize test data for specific use cases

### Learnings from Previous Story

**From Story 6-7-treatment-effectiveness-tracker (Status: ready-for-dev)**

- **Treatment Effectiveness Service:** Story 6.7 creates TreatmentEffectivenessService.calculateAllTreatmentEffectiveness(userId, timeRange) which this story must invoke after data generation. Service requires minimum 3 treatment cycles per medication/intervention for valid effectiveness scores. [Source: stories/6-7-treatment-effectiveness-tracker.md#AC6.7.4]

- **Treatment Effectiveness Data Model:** Story 6.7 adds treatmentEffectiveness table (schema v27) with fields: treatmentId, effectivenessScore, trendDirection, sampleSize, confidence. DevData generation must create sufficient medication events to trigger meaningful effectiveness calculations. [Source: stories/6-7-treatment-effectiveness-tracker.md#AC6.7.1]

- **Baseline/Outcome Analysis:** Treatment effectiveness algorithm compares severity 7 days before treatment vs 7-30 days after. DevData must generate medication events with sufficient surrounding symptom data for baseline/outcome calculations. [Source: stories/6-7-treatment-effectiveness-tracker.md#Dev-Notes]

- **Correlation Engine Dependency:** Treatment effectiveness uses correlation data from Story 6.3 for related factor analysis. Orchestrator must run correlation calculation BEFORE treatment effectiveness (Step 14 → Step 15). [Source: stories/6-7-treatment-effectiveness-tracker.md#AC6.7.2]

- **Alert System:** Story 6.7 includes treatment alert system. DevData should generate data patterns that trigger alerts (effectiveness drops, low effectiveness) for comprehensive testing. [Source: stories/6-7-treatment-effectiveness-tracker.md#AC6.7.8]

- **Files Referenced by Story 6.7:**
  - `src/lib/services/treatmentEffectivenessService.ts` - Service to invoke from orchestrator
  - `src/lib/repositories/treatmentEffectivenessRepository.ts` - Query treatment effectiveness records
  - `src/lib/services/correlationCalculationService.ts` (Story 6.3) - Must run before treatment effectiveness

**Key Integration Point:** This story's orchestrator must invoke Story 6.7's treatment effectiveness calculation as the final analytics step (Step 15), after correlation engine (Step 14), to populate treatment effectiveness records for insights page testing.

### Project Structure Notes

**Files to Create:**
```
src/lib/dev/generators/
  ├── generateDailyLogs.ts (NEW - daily log synthetic data)
  └── generatePatternData.ts (NEW - intentional pattern generators)
```

**Files to Modify:**
- `src/lib/dev/generators/orchestrator.ts` - Add Steps 13-15 (daily logs, correlations, treatment effectiveness)
- `src/lib/dev/config/scenarios.ts` - Add analytics-showcase and pattern-detection scenarios
- `src/components/settings/DevDataControls.tsx` - Display analytics statistics, scenario grouping

**Dependencies:**
- Story 6.2: Daily Log Page (done) - Provides dailyLogRepository and DailyLog schema
- Story 6.3: Correlation Engine (review) - Provides CorrelationCalculationService
- Story 6.4: Health Insights Hub UI (done) - Insights page displays correlation data
- Story 6.5: Timeline Pattern Detection (done) - Timeline uses pattern data
- Story 6.7: Treatment Effectiveness Tracker (ready-for-dev) - Provides TreatmentEffectivenessService
- Epic 3.5: DevDataControls component exists and working

### Daily Log Generation Algorithm

**Coverage Strategy:**
```typescript
function generateDailyLogs(userId: string, config: DailyLogConfig): Promise<GenerationResult> {
  const { startDate, endDate, coveragePercent } = config;

  // Calculate total days and target days
  const totalDays = daysBetween(startDate, endDate);
  const targetDays = Math.floor(totalDays * coveragePercent);

  // Randomly select days for coverage (realistic gaps)
  const selectedDays = randomlySelectDays(totalDays, targetDays);

  // Generate daily logs
  const dailyLogs = await Promise.all(selectedDays.map(async (day) => {
    const date = addDays(startDate, day);

    // Query flares for this day to correlate mood/sleep
    const flares = await flareRepository.getFlaresByDate(userId, date);
    const maxFlareSeverity = Math.max(...flares.map(f => f.severity), 0);

    // Generate mood (1-10) - reduce on high flare days
    const baseMood = randomInt(5, 8); // baseline mood
    const flarePenalty = maxFlareSeverity > 7 ? randomInt(2, 4) : 0;
    const mood = Math.max(1, baseMood - flarePenalty);

    // Generate sleep (hours + quality)
    const baseSleepHours = randomFloat(6.5, 8.5);
    const sleepPenalty = maxFlareSeverity > 7 ? randomFloat(1, 2) : 0;
    const sleepHours = Math.max(4, baseSleepHours - sleepPenalty);

    const baseSleepQuality = randomInt(6, 9);
    const qualityPenalty = maxFlareSeverity > 7 ? randomInt(2, 3) : 0;
    const sleepQuality = Math.max(1, baseSleepQuality - qualityPenalty);

    // Weekend boost
    if (isWeekend(date)) {
      mood += 1;
      sleepHours += 0.5;
      sleepQuality += 1;
    }

    return {
      userId,
      date: formatDateString(date),
      mood,
      sleepHours,
      sleepQuality,
      notes: Math.random() < 0.1 ? generateRandomNote() : null,
    };
  }));

  // Batch create
  await dailyLogRepository.createBatch(dailyLogs);

  return { dailyLogsCreated: dailyLogs.length };
}
```

### Orchestrator Integration Flow

**Updated Orchestrator Sequence:**
```typescript
async function generateComprehensiveData(userId: string, config: ScenarioConfig) {
  // Steps 1-12: Existing data generation (symptoms, flares, medications, triggers, food)
  // ... existing code ...

  // Step 13: Generate daily logs (NEW)
  console.log("Step 13: Generating daily logs...");
  const dailyLogResult = await generateDailyLogs(userId, {
    startDate: config.startDate,
    endDate: config.endDate,
    coveragePercent: config.dailyLogCoverage || 0.6,
    correlateWithFlares: true,
  });

  // Step 14: Calculate correlations (NEW)
  console.log("Step 14: Calculating correlations...");
  try {
    const { correlationCalculationService } = await import("@/lib/services/correlationCalculationService");
    await correlationCalculationService.recalculateCorrelations(userId);

    // Query correlation counts
    const { correlationRepository } = await import("@/lib/repositories/correlationRepository");
    const correlations = await correlationRepository.findAll(userId);
    const significantCorrelations = correlations.filter(c => Math.abs(c.coefficient) >= 0.3);

    result.correlationsGenerated = correlations.length;
    result.significantCorrelations = significantCorrelations.length;
    console.log(`Correlations calculated: ${correlations.length} total, ${significantCorrelations.length} significant`);
  } catch (err) {
    console.warn("Correlation calculation skipped - service not yet implemented");
    result.correlationsGenerated = 0;
    result.significantCorrelations = 0;
  }

  // Step 15: Calculate treatment effectiveness (NEW)
  console.log("Step 15: Calculating treatment effectiveness...");
  if (result.medicationEventsCreated > 0) {
    try {
      const { treatmentEffectivenessService } = await import("@/lib/services/treatmentEffectivenessService");
      await treatmentEffectivenessService.calculateAllTreatmentEffectiveness(userId, {
        startDate: config.startDate,
        endDate: config.endDate,
      });

      // Query treatment effectiveness counts
      const { treatmentEffectivenessRepository } = await import("@/lib/repositories/treatmentEffectivenessRepository");
      const treatments = await treatmentEffectivenessRepository.findAll(userId);

      result.treatmentEffectivenessRecordsCreated = treatments.length;
      console.log(`Treatment effectiveness calculated: ${treatments.length} records`);
    } catch (err) {
      console.warn("Treatment effectiveness calculation skipped - service not yet implemented");
      result.treatmentEffectivenessRecordsCreated = 0;
    }
  } else {
    console.log("Skipping treatment effectiveness - no medication events generated");
    result.treatmentEffectivenessRecordsCreated = 0;
  }

  return result;
}
```

### Intentional Pattern Generation

**Pattern Types for Analytics Testing:**

**Pattern 1: Monday Stress (Day-of-Week)**
```typescript
// Every Monday: Stress trigger → Headache symptom
// Tests: Day-of-week pattern detection, recurring sequences
async function generateMondayStressPattern(userId, startDate, endDate) {
  const mondays = findAllMondays(startDate, endDate);
  let count = 0;

  for (const monday of mondays) {
    // 80% of Mondays have pattern (realistic variation)
    if (Math.random() < 0.8) {
      // Morning: Stress trigger
      await triggerEventRepository.create({
        userId,
        triggerName: "Work Stress",
        timestamp: setHours(monday, 9), // 9 AM
        intensity: randomInt(7, 9),
      });

      // Afternoon: Headache symptom
      await symptomInstanceRepository.create({
        userId,
        symptomName: "Headache",
        severity: randomInt(6, 8),
        timestamp: setHours(monday, 14), // 2 PM (5 hours later)
      });

      count++;
    }
  }

  return count;
}
```

**Pattern 2: Dairy-Headache Correlation (Food Delay)**
```typescript
// Dairy food → Headache 6-12 hours later
// Tests: Food-symptom correlation detection, lag window analysis
async function generateDairyHeadachePattern(userId, startDate, endDate) {
  const targetInstances = 15; // Sufficient for statistical significance
  const days = generateRandomDays(startDate, endDate, targetInstances);

  for (const day of days) {
    // Dairy consumption (dinner time)
    await foodEventRepository.create({
      userId,
      foodName: "Dairy (Milk/Cheese)",
      timestamp: setHours(day, 19), // 7 PM
    });

    // Headache 6-12 hours later (early morning next day)
    const delayHours = randomInt(6, 12);
    await symptomInstanceRepository.create({
      userId,
      symptomName: "Headache",
      severity: randomInt(5, 8),
      timestamp: addHours(setHours(day, 19), delayHours),
    });
  }

  return targetInstances;
}
```

**Pattern 3: Medication Effectiveness (Treatment Response)**
```typescript
// Medication → Symptom reduction 24-48 hours later
// Tests: Treatment effectiveness calculation, correlation analysis
async function generateMedicationImprovementPattern(userId, startDate, endDate) {
  const targetInstances = 10;
  const days = generateRandomDays(startDate, endDate, targetInstances);

  for (const day of days) {
    // Baseline: High symptom severity before medication
    await symptomInstanceRepository.create({
      userId,
      symptomName: "Joint Pain",
      severity: randomInt(7, 9), // High severity
      timestamp: setHours(day, 8), // 8 AM
    });

    // Medication event
    await medicationEventRepository.create({
      userId,
      medicationName: "Ibuprofen",
      timestamp: setHours(day, 10), // 10 AM
      dosage: "400mg",
    });

    // Outcome: Reduced severity 24-48 hours later
    const delayHours = randomInt(24, 48);
    await symptomInstanceRepository.create({
      userId,
      symptomName: "Joint Pain",
      severity: randomInt(2, 4), // Significantly reduced
      timestamp: addHours(setHours(day, 10), delayHours),
    });
  }

  return targetInstances;
}
```

### Analytics Scenario Configurations

**Analytics-Showcase Scenario:**
```typescript
{
  id: 'analytics-showcase',
  name: 'Analytics Showcase',
  icon: '📊',
  group: 'analytics',
  description: 'Demonstrates correlation analysis, treatment effectiveness, and pattern detection with strong intentional patterns for insights testing',
  config: {
    timeframeMonths: 12,
    flareCount: 22, // 20-25 range
    correlationStrength: 0.85, // High correlations
    dailyLogCoverage: 0.8, // 80% coverage
    intentionalPatterns: true, // Enable pattern generators
    medicationAdherence: 0.9, // High adherence for treatment effectiveness
    foodDiversityLevel: 'moderate',
    symptomVariety: 'diverse',
  }
}
```

**Pattern-Detection Scenario:**
```typescript
{
  id: 'pattern-detection',
  name: 'Pattern Detection',
  icon: '🔍',
  group: 'analytics',
  description: 'Focused dataset with recurring patterns and consistent time windows for testing timeline pattern highlighting and detection',
  config: {
    timeframeMonths: 6, // Concentrated patterns
    recurringPatterns: true, // Weekly cycles
    consistentDelays: true, // Same food → symptom delays
    weeklyPatterns: true, // Day-of-week patterns
    dailyLogCoverage: 0.7, // Good coverage
    flareCount: 12,
    patternTypes: ['monday-stress', 'dairy-headache', 'medication-improvement'],
  }
}
```

### DevDataControls UI Message Format

**Enhanced Result Message:**
```
✅ Generated comprehensive test data:

📊 **Event Counts:**
• 245 medication events
• 189 trigger events
• 432 symptom instances
• 22 flares
• 87 flare events
• 356 food events

📈 **Analytics Data:**
• 292 daily logs (80% coverage)
• 47 correlations (12 significant |ρ| >= 0.3)
• 8 treatment effectiveness records
• 3 intentional patterns

📅 **Time Range:** 1/1/2024 to 12/31/2024

**Refresh the page to see your data!**
```

### Testing Strategy

**Unit Tests:**
- Daily log generator creates correct coverage percentage
- Daily logs correlate with flare severity (high flares = worse mood/sleep)
- Pattern generators create expected number of instances
- Orchestrator steps execute in correct order

**Integration Tests:**
- Full orchestrator run with analytics-showcase scenario
- Verify correlation calculation completes
- Verify treatment effectiveness records created
- Verify all counts appear in DevDataControls result message

**Manual Testing:**
- Generate "Analytics Showcase" scenario
- Navigate to Insights page → Verify correlations display
- Navigate to Timeline page → Verify pattern highlighting (Story 6.5)
- Navigate to Treatment Tracker (Story 6.7) → Verify effectiveness records
- Check Daily Log page → Verify daily logs created with correct coverage

**Edge Cases:**
- Orchestrator handles missing correlation service (try-catch)
- Orchestrator handles missing treatment effectiveness service (try-catch)
- Daily log generator handles 100% coverage (no gaps)
- Daily log generator handles 0% coverage (no logs)
- Pattern generators handle short date ranges (insufficient days)

### References

- [Source: docs/epics.md#Story-6.8] - Story acceptance criteria and requirements
- [Source: stories/6-2-daily-log-page.md] - DailyLog schema and dailyLogRepository
- [Source: stories/6-3-correlation-engine-and-spearman-algorithm.md] - CorrelationCalculationService and correlation data model
- [Source: stories/6-4-health-insights-hub-ui.md] - Insights page displaying correlations
- [Source: stories/6-5-timeline-pattern-detection.md] - Pattern detection and timeline visualization
- [Source: stories/6-7-treatment-effectiveness-tracker.md] - TreatmentEffectivenessService and treatment effectiveness calculation
- [Source: src/components/settings/DevDataControls.tsx] - Existing DevDataControls component
- [Source: src/lib/dev/generators/orchestrator.ts] - Existing orchestrator pattern (Steps 1-12)
- [Source: src/lib/dev/config/scenarios.ts] - Existing scenario configuration system

### Integration Points

**This Story Depends On:**
- Story 6.2: Daily Log Page (done) - Provides dailyLogRepository and DailyLog schema
- Story 6.3: Correlation Engine (review) - Provides CorrelationCalculationService
- Story 6.5: Timeline Pattern Detection (done) - Uses pattern data for visualization
- Story 6.7: Treatment Effectiveness Tracker (ready-for-dev) - Provides TreatmentEffectivenessService
- Epic 3.5: DevDataControls (done) - Base component exists and working

**This Story Enables:**
- Comprehensive testing of Epic 6 analytics features
- Insights page testing with realistic correlation data
- Timeline pattern detection testing with intentional patterns
- Treatment effectiveness tracker testing with medication data
- Demonstration and validation of all analytics capabilities

### Risk Mitigation

**Risk: Correlation/treatment services not yet implemented**
- Mitigation: Wrap service calls in try-catch blocks
- Gracefully skip analytics calculations if services missing
- Log warnings to console but continue orchestrator execution
- Set analytics counts to 0 in result if services unavailable

**Risk: Daily logs generate before base data exists**
- Mitigation: Daily log generator runs as Step 13 after all base data (Steps 1-12)
- Verify flares exist before attempting correlation
- Orchestrator enforces dependency order

**Risk: Pattern generation creates unrealistic data**
- Mitigation: Patterns use 80% occurrence rate (20% variation)
- Randomize timing within reasonable windows
- Limit pattern instances to 10-15 for statistical significance
- Avoid perfect correlations (use 0.85 instead of 1.0)

**Risk: Analytics calculation performance**
- Mitigation: Correlation engine already uses debouncing (Story 6.3)
- Treatment effectiveness uses batched queries
- Console logging tracks calculation progress
- Analytics calculations non-blocking

### Future Enhancements (Out of Scope for This Story)

**Deferred to Future Stories:**
- Advanced pattern types (seasonal patterns, cluster patterns)
- Configurable correlation strength per pattern
- Pattern visualization in DevDataControls UI
- Export scenario configurations for sharing
- Automated testing suite using generated scenarios

**Nice-to-Have Features:**
- Real-time progress bar for orchestrator steps
- Undo/redo for data generation
- Scenario comparison view (A/B testing)
- Custom scenario builder UI

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

**Date: 2025-11-10 (Story Creation)**
- Created Story 6.8 - DevData Controls Enhancement for Analytics Support
- Defined 10 acceptance criteria for analytics dev data generation
- Created 12 tasks with detailed subtasks (120+ total subtasks)
- Integrated Story 6.7 treatment effectiveness calculation requirements
- Documented daily log generation algorithm, pattern generators, and orchestrator integration
- Added analytics-showcase and pattern-detection scenario configurations
- Included graceful handling for missing services (correlation engine, treatment effectiveness)
- Story ready for context generation and development
- Status: drafted, ready for sprint planning and development
