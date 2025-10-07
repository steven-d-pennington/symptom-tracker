# Task 10: Enhanced Trigger Tracking Implementation

## Task Overview

**Status**: Not Started
**Assigned To**: Unassigned
**Priority**: Medium
**Estimated Hours**: 20
**Dependencies**: Phase 1 complete
**Parallel Work**: Can be worked on simultaneously with Tasks 7-9

## Objective

Enhance the existing trigger tracking system with advanced correlation analysis, pattern detection, and predictive insights. Build upon Phase 1's basic trigger repository to help users identify what factors influence their symptoms and make informed decisions about lifestyle and environmental modifications.

## Detailed Requirements

### User Experience Goals
- **Easy Discovery**: Simple interface to identify potential triggers
- **Visual Correlations**: Clear charts showing trigger-symptom relationships
- **Actionable Insights**: Specific recommendations for trigger avoidance
- **Confidence Scoring**: Statistical confidence in correlations
- **Trigger Categories**: Organized by food, environment, stress, activity, etc.
- **Prediction**: Early warning when high-risk triggers present

### Technical Requirements
- **Statistical Analysis**: Correlation coefficients and significance testing
- **Pattern Detection**: Machine learning-lite pattern recognition
- **Temporal Analysis**: Time-lag correlation (trigger → symptom delay)
- **Multi-factor Analysis**: Combined trigger effects
- **Performance**: Fast calculations even with years of data

## Implementation Steps

### Step 1: Enhanced Trigger Data Model
**Estimated Time**: 3 hours

1. Extend trigger types:
   ```typescript
   interface EnhancedTrigger extends TriggerRecord {
     category: TriggerCategory;
     subcategory?: string;
     severity?: number; // Some triggers are more potent
     typicalDelay?: number; // Hours until symptom appears
     confidence?: number; // User's confidence this is a trigger
   }

   type TriggerCategory =
     | 'food'
     | 'environmental'
     | 'stress'
     | 'activity'
     | 'sleep'
     | 'medication'
     | 'weather'
     | 'hormonal'
     | 'other';

   interface TriggerExposure {
     id: string;
     userId: string;
     triggerId: string;
     dailyEntryId?: string;
     exposureLevel: number; // 1-10 intensity
     timestamp: Date;
     notes?: string;
   }

   interface TriggerCorrelation {
     id: string;
     userId: string;
     triggerId: string;
     symptomId: string;
     correlationCoefficient: number; // -1 to 1
     significance: number; // p-value
     dataPoints: number;
     averageDelay: number; // hours
     confidence: 'low' | 'medium' | 'high' | 'very_high';
     lastCalculated: Date;
   }
   ```

2. Create trigger analytics tables:
   ```typescript
   this.version(5).stores({
     triggerExposures: 'id, userId, triggerId, dailyEntryId, timestamp',
     triggerCorrelations: 'id, userId, triggerId, symptomId, [userId+triggerId], [userId+symptomId]',
   });
   ```

**Files to Create**:
- `lib/types/enhanced-trigger.ts`
- `lib/repositories/triggerExposureRepository.ts`
- `lib/repositories/triggerCorrelationRepository.ts`

**Testing**: Schema updates, repositories functional

---

### Step 2: Correlation Analysis Engine
**Estimated Time**: 5 hours

1. Implement statistical analysis:
   ```typescript
   class TriggerAnalyzer {
     // Calculate Pearson correlation between trigger exposure and symptom severity
     async calculateCorrelation(
       userId: string,
       triggerId: string,
       symptomId: string,
       days: number
     ): Promise<TriggerCorrelation>;

     // Find time lag between trigger and symptom
     async findOptimalDelay(
       userId: string,
       triggerId: string,
       symptomId: string
     ): Promise<number>;

     // Calculate statistical significance
     async calculateSignificance(
       correlation: number,
       sampleSize: number
     ): Promise<number>;

     // Identify most impactful triggers
     async getRankedTriggers(
       userId: string,
       symptomId?: string
     ): Promise<TriggerCorrelation[]>;
   }
   ```

2. Add pattern detection:
   - Identify trigger combinations
   - Detect threshold effects (small amounts OK, large amounts bad)
   - Find seasonal patterns
   - Recognize cumulative effects

3. Implement confidence scoring:
   - High confidence: p < 0.01, n > 30
   - Medium confidence: p < 0.05, n > 15
   - Low confidence: p < 0.1, n > 10
   - Insufficient data: below thresholds

**Files to Create**:
- `lib/utils/triggerAnalyzer.ts`
- `lib/utils/statisticalTests.ts`

**Testing**: Calculations accurate, patterns detected, confidence scores appropriate

---

### Step 3: Trigger Discovery Interface
**Estimated Time**: 4 hours

1. Create `TriggerDiscovery.tsx`:
   - Suggest potential triggers based on data
   - Show correlation strength
   - Display confidence level
   - Provide test recommendations

2. Implement `TriggerCorrelationChart.tsx`:
   - Scatter plot of trigger exposure vs symptom severity
   - Trend line with correlation coefficient
   - Color by confidence level
   - Interactive tooltips

3. Add `TriggerRecommendations.tsx`:
   - List confirmed triggers to avoid
   - Suggest triggers to test
   - Provide avoidance strategies
   - Track avoidance success

**Files to Create**:
- `components/trigger/TriggerDiscovery.tsx`
- `components/trigger/TriggerCorrelationChart.tsx`
- `components/trigger/TriggerRecommendations.tsx`

**Testing**: Discovery shows relevant triggers, charts accurate, recommendations helpful

---

### Step 4: Trigger Testing Workflow
**Estimated Time**: 3 hours

1. Create elimination testing:
   - Guided elimination diet/lifestyle protocol
   - Reintroduction scheduling
   - Clear symptom tracking during tests
   - Results analysis

2. Implement `TriggerTest.tsx`:
   - Create test plan
   - Track baseline period
   - Elimination phase
   - Reintroduction phase
   - Results summary

3. Add test analytics:
   - Before/after comparison
   - Statistical significance of results
   - Confidence in trigger identification
   - Recommendations based on test

**Files to Create**:
- `components/trigger/TriggerTest.tsx`
- `components/trigger/TriggerTestResults.tsx`
- `lib/utils/triggerTestAnalysis.ts`

**Testing**: Test workflow clear, tracking works, results accurate

---

### Step 5: Advanced Trigger Insights
**Estimated Time**: 3 hours

1. Create `TriggerInsights.tsx`:
   - Heatmap of trigger patterns
   - Time-of-day sensitivity
   - Cumulative trigger load
   - Trigger interactions (synergistic effects)

2. Implement trigger forecasting:
   - Predict high-risk days based on planned exposures
   - Warn about trigger accumulation
   - Suggest preventive measures
   - Track forecast accuracy

3. Add trigger journal:
   - Narrative of trigger discoveries
   - Success stories (eliminated triggers)
   - Failed elimination attempts
   - Doctor discussion notes

**Files to Create**:
- `components/trigger/TriggerInsights.tsx`
- `components/trigger/TriggerForecast.tsx`
- `components/trigger/TriggerJournal.tsx`

**Testing**: Insights valuable, forecasts reasonable, journal functional

---

### Step 6: Integration and Reporting
**Estimated Time**: 2 hours

1. Integrate with daily entry:
   - Quick trigger logging
   - Suggested triggers based on symptoms
   - Historical trigger exposure
   - Avoidance tracking

2. Add to calendar:
   - Mark trigger exposures
   - Show correlation timeline
   - Highlight test periods
   - Visual pattern recognition

3. Create trigger report:
   - Summary of confirmed triggers
   - Correlation data for doctors
   - Elimination test results
   - Recommendations for management

**Files to Modify**:
- `components/daily-entry/EntrySections/TriggerSection.tsx`
- `components/calendar/CalendarView.tsx`

**Testing**: Integration seamless, reports comprehensive

---

## Technical Specifications

### Statistical Methods
- **Pearson Correlation**: For linear relationships
- **Spearman Rank Correlation**: For non-linear relationships
- **Chi-Square Test**: For categorical triggers
- **T-Tests**: For before/after comparisons
- **Multiple Comparisons Correction**: Bonferroni or FDR

### Performance Requirements
- Correlation calculation <2 seconds
- Pattern detection <5 seconds
- Dashboard load <1 second
- Handle 1000+ trigger exposures
- Real-time confidence updates

### Data Requirements
- Minimum 10 data points for correlation
- Minimum 30 for high confidence
- At least 2 weeks of data
- Balanced exposure (both presence and absence)

## Testing Checklist

### Unit Tests
- [ ] Statistical calculations
- [ ] Pattern detection algorithms
- [ ] Confidence scoring
- [ ] Significance testing

### Component Tests
- [ ] Trigger discovery displays
- [ ] Correlation charts render
- [ ] Test workflow functions
- [ ] Insights are helpful

### Integration Tests
- [ ] Complete trigger workflow
- [ ] Integration with daily entries
- [ ] Calendar integration
- [ ] Report generation

### Statistical Validation
- [ ] Correlations accurate
- [ ] Significance tests correct
- [ ] Confidence scores appropriate
- [ ] No false positives

## Files Created/Modified

### New Files
- `lib/types/enhanced-trigger.ts`
- `lib/repositories/triggerExposureRepository.ts`
- `lib/repositories/triggerCorrelationRepository.ts`
- `lib/utils/triggerAnalyzer.ts`
- `lib/utils/statisticalTests.ts`
- `lib/utils/triggerTestAnalysis.ts`
- `components/trigger/TriggerDiscovery.tsx`
- `components/trigger/TriggerCorrelationChart.tsx`
- `components/trigger/TriggerRecommendations.tsx`
- `components/trigger/TriggerTest.tsx`
- `components/trigger/TriggerTestResults.tsx`
- `components/trigger/TriggerInsights.tsx`
- `components/trigger/TriggerForecast.tsx`
- `components/trigger/TriggerJournal.tsx`

### Modified Files
- `src/lib/db/client.ts`
- `src/lib/db/schema.ts`
- `components/daily-entry/EntrySections/TriggerSection.tsx`
- `components/calendar/CalendarView.tsx`

## Success Criteria

- [ ] Correlation analysis provides accurate insights
- [ ] Trigger discovery identifies likely triggers
- [ ] Statistical confidence scores are trustworthy
- [ ] Elimination testing workflow is clear
- [ ] Forecasting helps prevent symptoms
- [ ] Integration with daily entries seamless
- [ ] Reports useful for medical consultations
- [ ] Performance targets met

## Integration Points

*Integrates with:*
- Task 2: Symptom Tracking (trigger-symptom correlations)
- Task 3: Daily Entry System (trigger logging)
- Task 4: Calendar/Timeline (trigger timeline)
- Task 5: Data Storage (trigger repositories)
- Task 7: Body Mapping (trigger-region correlations)
- Task 9: Active Flare Dashboard (flare triggers)

## Notes and Decisions

*Add detailed notes here during implementation:*

- **Date**: [Date]
- **Decision**: [What was decided and why]
- **Impact**: [How it affects other components]
- **Testing**: [Test results and issues found]

## Blockers and Issues

*Document any blockers encountered:*

- **Blocker**: [Description]
- **Date Identified**: [Date]
- **Resolution**: [How it was resolved or @mention for help]
- **Impact**: [Effect on timeline]

---

## Status Updates

*Update this section with daily progress:*

- **Date**: [Date] - **Status**: [Current Status] - **Assigned**: [Your Name]
- **Completed**: [What was finished]
- **Next Steps**: [What's planned next]
- **Hours Spent**: [Time spent today]
- **Total Hours**: [Cumulative time]

---

*Task Document Version: 1.0 | Last Updated: October 5, 2025*
