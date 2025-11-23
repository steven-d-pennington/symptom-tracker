# DevDataControls Enhancement Plan

## Overview

DevDataControls.tsx is a development utility component that generates synthetic test data for the symptom-tracker application. It's only visible to users named "Steven" and provides various scenarios for testing different app features. This document outlines comprehensive enhancements needed to support newly implemented analytics features and improve the overall testing experience.

## Current State (as of 2024-11-10)

### Existing Capabilities
- **Location**: `src/components/settings/DevDataControls.tsx`
- **Data Generators**: Located in `src/lib/dev/generators/`
- **Scenarios**: 7 predefined scenarios (quick-start, flare-progression, food-correlations, trigger-analysis, problem-areas, comprehensive, stress-test)
- **Generated Data Types**:
  - Medication events with adherence patterns
  - Trigger events with optional correlations
  - Symptom instances
  - Flares with lifecycle events
  - Food events with patterns
  - Body map locations
  - Photo attachments
  - UX events
  - Mood entries (basic)
  - Sleep entries (basic)

### Recently Implemented Features Not Fully Supported
1. **Story 6.2**: Daily Log Page - Added unified daily reflection page
2. **Story 6.3**: Correlation Engine - Added Spearman correlation analysis
3. **Story 6.5**: Timeline Pattern Detection - Added pattern visualization
4. **Story 5**: Multi-layer body map (flares, pain, inflammation layers)

## Identified Gaps

### 1. Missing Daily Log Data Generation
**Problem**: Story 6.2 introduced `dailyLogs` table but data generators don't create entries
**Impact**: Cannot test daily log features or correlations with mood/sleep data
**Required Fields**: mood (1-5), sleepHours, sleepQuality (1-5), notes, flareUpdates

### 2. No Correlation Data Generation
**Problem**: Story 6.3 added correlation engine but synthetic data doesn't populate correlations
**Impact**: Insights page shows empty, correlation features can't be demonstrated
**Solution Needed**: Run correlation engine after data generation

### 3. Pattern Detection Not Demonstrated
**Problem**: Story 6.5 added timeline patterns but no intentional patterns in test data
**Impact**: Pattern detection features appear broken/empty
**Solution Needed**: Create recurring sequences with consistent delays

### 4. Multi-Layer Body Map Data
**Problem**: Story 5 added layers but only flare layer gets data
**Impact**: Layer toggle features can't be tested properly
**Solution Needed**: Generate pain and inflammation markers on other layers

### 5. Outdated UI Controls
**Problem**: DevDataControls has legacy sections that don't align with new features
**Impact**: Confusing UI, redundant controls, missing new feature controls

## Implementation Plan

### Phase 1: Core Data Generation (High Priority)

#### 1.1 Daily Log Generator
**File**: `src/lib/dev/generators/generateDailyLogs.ts`

```typescript
import { GenerationContext } from "./base/types";
import { generateId } from "@/lib/utils/idGenerator";

export function generateDailyLogs(context: GenerationContext) {
  const { userId, startDate, endDate, daysToGenerate } = context;
  const entries: any[] = [];

  // Target 60-80% coverage for realistic daily logging
  const coveragePercent = 0.60 + Math.random() * 0.20;
  const targetDays = Math.floor(daysToGenerate * coveragePercent);

  // Generate entries for random days
  const selectedDays = new Set<number>();
  while (selectedDays.size < targetDays) {
    selectedDays.add(Math.floor(Math.random() * daysToGenerate));
  }

  for (const dayOffset of Array.from(selectedDays)) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);

    // Format as YYYY-MM-DD for dailyLogs table
    const dateStr = date.toISOString().split('T')[0];

    // Generate correlated mood (worse mood during flares)
    const hasActiveFlare = Math.random() > 0.5; // Simplified - should check actual flares
    const baseMood = hasActiveFlare ? 2 : 4;
    const mood = Math.max(1, Math.min(5, baseMood + Math.floor(Math.random() * 2)));

    // Sleep quality correlates with mood
    const baseSleepQuality = mood >= 3 ? 3 : 2;
    const sleepQuality = Math.max(1, Math.min(5, baseSleepQuality + Math.floor(Math.random() * 2)));
    const sleepHours = 5 + Math.random() * 4; // 5-9 hours

    entries.push({
      id: generateId(),
      userId,
      date: dateStr,
      mood,
      sleepHours: Math.round(sleepHours * 2) / 2, // Round to 0.5
      sleepQuality,
      notes: Math.random() > 0.7 ? `Daily reflection for ${dateStr}` : "",
      flareUpdates: [], // Could add flare quick updates here
      createdAt: date.getTime(),
      updatedAt: date.getTime(),
    });
  }

  return entries;
}
```

#### 1.2 Update Orchestrator
**File**: `src/lib/dev/generators/orchestrator.ts` (additions)

```typescript
// Add to imports
import { generateDailyLogs } from "./generateDailyLogs";

// Add after Step 12 (around line 215)
// Step 13: Generate daily logs (Story 6.2)
console.log("[Orchestrator] Step 13: Generating daily logs");
const dailyLogs = generateDailyLogs(context);
if (dailyLogs.length > 0) {
  await db.dailyLogs!.bulkAdd(dailyLogs);
  console.log(`[Orchestrator] Generated ${dailyLogs.length} daily log entries`);
}

// Step 14: Run correlation engine (Story 6.3)
console.log("[Orchestrator] Step 14: Running correlation analysis");
try {
  const { correlationCalculationService } = await import('@/lib/services/correlationCalculationService');
  await correlationCalculationService.recalculateCorrelations(userId);

  // Get correlation count for reporting
  const correlations = await db.correlations?.where({ userId }).toArray();
  console.log(`[Orchestrator] Generated ${correlations?.length || 0} correlations`);
} catch (error) {
  console.warn("[Orchestrator] Correlation calculation failed:", error);
}

// Add to result object
dailyLogsCreated: dailyLogs.length,
correlationsGenerated: correlations?.length || 0,
```

### Phase 2: Enhanced Scenarios (High Priority)

#### 2.1 Add Analytics Showcase Scenario
**File**: `src/lib/dev/config/scenarios.ts` (additions)

```typescript
'analytics-showcase': {
  id: 'analytics-showcase',
  name: 'Analytics Showcase',
  description: 'Perfect correlations and patterns to demonstrate all analytics features. Generates strong correlations, clear patterns, and rich data for insights.',
  icon: '📈',
  recommendedYears: 1,
  config: (years = 1) => ({
    timeRange: {
      daysBack: Math.floor(years * 365),
      yearsToGenerate: years,
    },
    flares: {
      count: { min: 20, max: 25 }, // Many flares for better analytics
      regionClustering: true,
      clusteringIntensity: 'high', // Strong clustering for problem areas
      generateEvents: true,
      eventsPerFlare: { min: 8, max: 12 },
      interventionProbability: 0.9, // High intervention rate
    },
    foodPatterns: {
      repeatCombinations: true,
      correlationStrength: 'high', // Strong correlations
      patternsToCreate: 6, // Multiple clear patterns
    },
    triggers: {
      correlationWithSymptoms: true,
      delayWindow: 'consistent', // Consistent delays for clear patterns
      correlationRate: 0.85, // Very high correlation
    },
    uxEvents: {
      generate: true,
      eventsPerDay: { min: 8, max: 15 },
    },
    bodyMapLocations: {
      generate: true,
      locationsPerSymptom: { min: 1, max: 3 },
      multiLayer: true, // Enable multi-layer generation
    },
    photoAttachments: {
      generate: true,
      photosPerFlare: { min: 2, max: 4 },
    },
    dailyLogs: {
      generate: true,
      coveragePercent: 0.8, // 80% of days have logs
      correlateWithFlares: true, // Mood/sleep correlate with flares
    },
    patterns: {
      generateIntentional: true,
      dayOfWeekPatterns: true, // Monday stress patterns, etc.
      foodDelayPatterns: true, // Consistent 6-12 hour delays
      medicationEffectiveness: true, // Clear improvement patterns
    },
  }),
},

'pattern-detection': {
  id: 'pattern-detection',
  name: 'Pattern Detection',
  description: 'Rich patterns for timeline visualization. Creates recurring sequences, consistent delays, and clear correlations.',
  icon: '🔍',
  recommendedYears: 0.5,
  config: (years = 0.5) => ({
    // Similar config focused on patterns
    // Shorter timeframe for focused pattern visibility
  }),
},
```

### Phase 3: Pattern-Rich Data Generation (Medium Priority)

#### 3.1 Pattern Generator
**File**: `src/lib/dev/generators/generatePatternData.ts`

```typescript
export function generateIntentionalPatterns(config: GeneratorConfig, context: GenerationContext) {
  const patterns = [];

  // Day-of-week pattern: Monday stress → Tuesday symptoms
  if (config.patterns?.dayOfWeekPatterns) {
    patterns.push(generateMondayStressPattern(context));
  }

  // Food delay pattern: Dairy → Headache after 6-12 hours
  if (config.patterns?.foodDelayPatterns) {
    patterns.push(generateDairyHeadachePattern(context));
  }

  // Medication effectiveness: Adherence → Improvement
  if (config.patterns?.medicationEffectiveness) {
    patterns.push(generateMedicationImprovementPattern(context));
  }

  return patterns;
}

function generateDairyHeadachePattern(context: GenerationContext) {
  const events = [];
  const dairyFood = context.foods.find(f => f.name.toLowerCase().includes('dairy'));
  const headacheSymptom = context.symptoms.find(s => s.name === 'Headache');

  if (!dairyFood || !headacheSymptom) return events;

  // Create 10 instances of dairy → headache pattern
  for (let i = 0; i < 10; i++) {
    const dayOffset = i * 7; // Weekly pattern
    const foodTime = new Date(context.startDate);
    foodTime.setDate(foodTime.getDate() + dayOffset);
    foodTime.setHours(12, 0, 0, 0); // Noon

    // Food event
    events.push({
      type: 'food',
      foodIds: [dairyFood.id],
      timestamp: foodTime.getTime(),
    });

    // Symptom 8 hours later
    const symptomTime = new Date(foodTime);
    symptomTime.setHours(20, 0, 0, 0); // 8 PM

    events.push({
      type: 'symptom',
      symptomId: headacheSymptom.id,
      severity: 7,
      timestamp: symptomTime.getTime(),
    });
  }

  return events;
}
```

### Phase 4: Multi-Layer Body Map Data (Medium Priority)

#### 4.1 Layer Data Generator
**File**: `src/lib/dev/generators/generateLayerData.ts`

```typescript
export function generateMultiLayerBodyMapData(context: GenerationContext) {
  const locations = [];

  // Pain layer (yellow indicators)
  locations.push(...generatePainMarkers(context));

  // Inflammation layer (purple indicators)
  locations.push(...generateInflammationMarkers(context));

  return locations;
}

function generatePainMarkers(context: GenerationContext) {
  const markers = [];
  const painRegions = ['lower-back', 'knee-right', 'knee-left', 'shoulder-right'];

  painRegions.forEach(region => {
    markers.push({
      id: generateId(),
      userId: context.userId,
      layer: 'pain',
      bodyRegionId: region,
      coordinates: { x: Math.random(), y: Math.random() },
      severity: Math.floor(Math.random() * 5) + 3,
      timestamp: Date.now(),
    });
  });

  return markers;
}
```

### Phase 5: UI Updates (Low Priority)

#### 5.1 DevDataControls.tsx Updates

```typescript
// Key changes to implement:

1. Remove legacy controls:
   - Remove "Check Database" button (redundant)
   - Remove "Cleanup Ghost User" (one-time fix)

2. Add new sections:
   - "Analytics Testing" section with specialized scenarios
   - Progress indicator during generation
   - Statistics display after generation

3. Improve scenario cards:
   - Group by purpose (Basic, Analytics, Performance)
   - Show what features each scenario tests
   - Add "recommended for" labels

4. Add generation statistics:
   - Show counts of each data type created
   - Display correlation statistics
   - Show pattern counts

5. Visual improvements:
   - Better color coding
   - Clearer section separation
   - Loading states during generation
```

## Testing Strategy

### 1. Verify Daily Logs
```typescript
// After generation, check:
const dailyLogs = await db.dailyLogs.where({ userId }).toArray();
console.log('Daily logs created:', dailyLogs.length);
console.log('Coverage:', (dailyLogs.length / daysGenerated) * 100 + '%');
```

### 2. Verify Correlations
```typescript
// After generation, check:
const correlations = await db.correlations.where({ userId }).toArray();
const significant = correlations.filter(c => Math.abs(c.coefficient) >= 0.3);
console.log('Total correlations:', correlations.length);
console.log('Significant correlations:', significant.length);
```

### 3. Verify Patterns
```typescript
// Check for recurring sequences
const foodEvents = await db.foodEvents.where({ userId }).toArray();
const symptomEvents = await db.symptomInstances.where({ userId }).toArray();
// Analyze for patterns...
```

## Expected Outcomes

After implementing these enhancements:

1. **Complete Feature Coverage**: All implemented features will have appropriate test data
2. **Realistic Correlations**: The insights page will show meaningful correlations
3. **Visible Patterns**: Timeline will display detectable patterns
4. **Multi-Layer Support**: Body map layers will have appropriate data
5. **Better UX**: Cleaner, more intuitive dev controls interface
6. **Analytics Ready**: Full demonstration of analytics capabilities

## Implementation Checklist

### High Priority
- [ ] Create `generateDailyLogs.ts`
- [ ] Update orchestrator to generate daily logs
- [ ] Update orchestrator to run correlation engine
- [ ] Add analytics-showcase scenario
- [ ] Add pattern-detection scenario

### Medium Priority
- [ ] Create `generatePatternData.ts`
- [ ] Create `generateLayerData.ts`
- [ ] Update existing scenarios with better parameters
- [ ] Add generation statistics to UI

### Low Priority
- [ ] Clean up DevDataControls UI
- [ ] Remove legacy controls
- [ ] Add progress indicators
- [ ] Improve scenario categorization

## Files to Modify

1. `src/lib/dev/generators/orchestrator.ts` - Add daily logs and correlation engine
2. `src/lib/dev/config/scenarios.ts` - Add new scenarios
3. `src/components/settings/DevDataControls.tsx` - UI updates
4. `src/lib/dev/generators/generateDailyLogs.ts` - NEW FILE
5. `src/lib/dev/generators/generatePatternData.ts` - NEW FILE
6. `src/lib/dev/generators/generateLayerData.ts` - NEW FILE

## Dependencies

- Correlation engine must be working (Story 6.3)
- Daily logs repository must exist (Story 6.2)
- Pattern detection service must be implemented (Story 6.5)
- Multi-layer body map must be functional (Story 5)

## Notes

- All generated data should be realistic but demonstrate features clearly
- Patterns should be obvious enough to be detected but not unrealistic
- Correlations should include variety (strong, moderate, weak)
- UI should provide clear feedback about what was generated
- Consider adding "demo mode" flag to mark synthetic data

## MUST REFERENCE

- In addition to this document you MUST read the related story documents in the docs/stories folder
- ALSO reference the docs/epics.md file
- Scan for relevent documentation in the docs folder and reference real code to inform your data generation decisions