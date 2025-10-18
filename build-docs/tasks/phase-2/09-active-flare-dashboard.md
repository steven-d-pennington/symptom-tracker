# Task 9: Active Flare Dashboard Implementation

## Task Overview

**Status**: Not Started
**Assigned To**: Unassigned
**Priority**: High
**Estimated Hours**: 24
**Dependencies**: Phase 1 complete, Task 7 (Body Mapping) started
**Parallel Work**: Can be worked on after Task 7 starts

## Objective

Create a real-time dashboard for monitoring active symptom flares, providing users with immediate insights into their current health status, severity trends, and actionable recommendations. This feature is crucial for managing acute episodes and recognizing when to seek medical attention.

## Detailed Requirements

### User Experience Goals
- **At-a-Glance Status**: Immediate view of current flare severity
- **Trend Visualization**: Clear graphs showing symptom progression
- **Actionable Insights**: Specific recommendations based on patterns
- **Emergency Guidance**: Clear indicators for when to seek help
- **Quick Logging**: Fast entry of flare updates
- **Motivation**: Positive reinforcement during difficult times

### Technical Requirements
- **Real-Time Updates**: Instant dashboard refresh on new data
- **Performance**: Fast loading even with large datasets
- **Smart Alerts**: Configurable notifications for concerning patterns
- **Offline Capable**: Full functionality without internet
- **Data Analysis**: Statistical analysis of flare patterns

## Implementation Steps

### Step 1: Flare Detection and Tracking
**Estimated Time**: 4 hours

1. Define flare data model:
   ```typescript
   interface ActiveFlare {
     id: string;
     userId: string;
     symptomId: string;
     startDate: Date;
     endDate?: Date;
     peakSeverity: number;
     currentSeverity: number;
     affectedBodyRegions: string[];
     triggerIds: string[];
     notes?: string;
     status: 'active' | 'improving' | 'resolved';
     createdAt: Date;
     updatedAt: Date;
   }

   interface FlareUpdate {
     id: string;
     flareId: string;
     timestamp: Date;
     severity: number;
     bodyRegions: string[];
     medications?: string[];
     notes?: string;
   }

   interface FlareAlert {
     id: string;
     flareId: string;
     type: 'severity_spike' | 'duration_long' | 'spreading' | 'seek_help';
     message: string;
     priority: 'low' | 'medium' | 'high' | 'critical';
     createdAt: Date;
     acknowledged: boolean;
   }
   ```

2. Implement flare detection algorithm:
   - Auto-detect flares from severity increases
   - Track flare duration and progression
   - Identify peak severity
   - Detect when flare is improving/resolved

3. Create repository:
   ```typescript
   class ActiveFlareRepository {
     async getActiveFlares(userId: string): Promise<ActiveFlare[]>;
     async createFlare(flareData: Omit<ActiveFlare, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
     async updateFlare(id: string, updates: Partial<ActiveFlare>): Promise<void>;
     async resolveFlare(id: string, endDate: Date): Promise<void>;
     async getFlareHistory(userId: string, days: number): Promise<ActiveFlare[]>;
   }
   ```

**Files to Create**:
- `lib/types/active-flare.ts`
- `lib/repositories/activeFlareRepository.ts`
- `lib/utils/flareDetection.ts`

**Testing**: Flare detection works, repository CRUD functional

---

### Step 2: Dashboard Main View
**Estimated Time**: 5 hours

1. Create `ActiveFlareDashboard.tsx`:
   - Current active flares summary
   - Severity trend charts
   - Body map with flare locations
   - Time since flare start
   - Quick action buttons

2. Implement `FlareCard.tsx`:
   - Symptom name and severity
   - Trend indicator (improving/worsening/stable)
   - Affected body regions
   - Days active counter
   - Quick update button

3. Add severity trend visualization:
   - Line chart of severity over time
   - Mark significant events
   - Show medication effectiveness
   - Highlight concerning patterns

**Files to Create**:
- `components/active-flare/ActiveFlareDashboard.tsx`
- `components/active-flare/FlareCard.tsx`
- `components/active-flare/SeverityTrendChart.tsx`
- `components/active-flare/FlareBodyMap.tsx`

**Testing**: Dashboard renders, cards display correctly, charts accurate

---

### Step 3: Quick Flare Updates
**Estimated Time**: 3 hours

1. Implement `QuickFlareUpdate.tsx`:
   - Slider for severity
   - Body region selector
   - Medication taken checkbox
   - Notes field
   - Submit in <15 seconds

2. Create update history:
   - Timeline of all updates
   - Show severity changes
   - Display interventions (meds, treatments)
   - Export update log

3. Add push notifications:
   - Remind to log updates
   - Alert on severity spikes
   - Encourage during improvements
   - Customizable frequency

**Files to Create**:
- `components/active-flare/QuickFlareUpdate.tsx`
- `components/active-flare/FlareUpdateHistory.tsx`
- `lib/hooks/useFlareNotifications.ts`

**Testing**: Quick update fast, history accurate, notifications work

---

### Step 4: Flare Analytics
**Estimated Time**: 4 hours

1. Create analytics utilities:
   ```typescript
   class FlareAnalytics {
     async getAverageFlareServers
(userId: string): Promise<number>;
     async getAverageFlareDuration(userId: string): Promise<number>;
     async getFlareFrequency(userId: string, months: number): Promise<number>;
     async getMostAffectedRegions(userId: string): Promise<Map<string, number>>;
     async getTriggerCorrelations(userId: string): Promise<TriggerCorrelation[]>;
     async getMedicationEffectiveness(userId: string): Promise<MedicationEffectiveness[]>;
   }
   ```

2. Implement insights generation:
   - Identify patterns in flare timing
   - Detect early warning signs
   - Suggest effective interventions
   - Predict flare likelihood

3. Create insights display:
   - Actionable recommendations
   - Pattern explanations
   - Trend predictions
   - Success stories (past improvements)

**Files to Create**:
- `lib/utils/flareAnalytics.ts`
- `components/active-flare/FlareInsights.tsx`
- `components/active-flare/FlarePatterns.tsx`

**Testing**: Analytics accurate, insights helpful, predictions reasonable

---

### Step 5: Emergency Guidance
**Estimated Time**: 3 hours

1. Create alert system:
   - Severity threshold alerts
   - Duration concern alerts
   - Spreading pattern alerts
   - Seek medical help alerts

2. Implement `EmergencyGuidance.tsx`:
   - Clear criteria for seeking help
   - Emergency contact info
   - Local urgent care finder
   - Symptom log for doctor

3. Add crisis resources:
   - When to go to ER
   - What to tell doctors
   - Bring symptom history
   - Export for appointment

**Files to Create**:
- `components/active-flare/EmergencyGuidance.tsx`
- `components/active-flare/FlareAlerts.tsx`
- `lib/utils/emergencyThresholds.ts`

**Testing**: Alerts trigger correctly, guidance clear, export works

---

### Step 6: Flare Comparison
**Estimated Time**: 3 hours

1. Create comparison tool:
   - Compare current vs past flares
   - Side-by-side severity charts
   - Intervention effectiveness
   - Recovery time comparison

2. Implement `FlareComparison.tsx`:
   - Select flares to compare
   - Visual diff display
   - Highlight differences
   - Learning opportunities

3. Add flare journal:
   - Narrative of flare progression
   - What helped/didn't help
   - Emotional impact
   - Doctor notes

**Files to Create**:
- `components/active-flare/FlareComparison.tsx`
- `components/active-flare/FlareJournal.tsx`

**Testing**: Comparisons accurate, journal saves, insights valuable

---

### Step 7: Integration and Polish
**Estimated Time**: 2 hours

1. Integrate with calendar:
   - Show flares on calendar
   - Mark flare days
   - Flare timeline view
   - Historical patterns

2. Add to main dashboard:
   - Active flare widget
   - Quick status indicator
   - Link to full dashboard
   - Alert badges

3. Create navigation:
   - Dashboard as main route
   - Quick access from nav
   - Notifications take to dashboard
   - Breadcrumb navigation

**Files to Modify**:
- `app/(protected)/flare-dashboard/page.tsx` (new route)
- `components/calendar/CalendarView.tsx`
- Main navigation component

**Testing**: Integration smooth, navigation clear, performance good

---

## Technical Specifications

### Performance Requirements
- Dashboard load time <2 seconds
- Chart rendering <500ms
- Quick update submit <1 second
- Smooth scrolling at 60fps
- Handle 50+ active flares

### Data Analysis
- Statistical significance testing
- Trend analysis algorithms
- Correlation calculations
- Predictive modeling (basic)

### Notification System
- Configurable alert thresholds
- Smart notification timing
- Battery-efficient checking
- User preference respect

## Testing Checklist

### Unit Tests
- [ ] Flare detection algorithm
- [ ] Analytics calculations
- [ ] Alert threshold logic
- [ ] Trend analysis

### Component Tests
- [ ] Dashboard renders
- [ ] Flare cards display
- [ ] Charts update correctly
- [ ] Quick update works

### Integration Tests
- [ ] Complete flare workflow
- [ ] Integration with body map
- [ ] Calendar integration
- [ ] Notification system

### User Testing
- [ ] Dashboard is intuitive
- [ ] Insights are helpful
- [ ] Quick update is fast
- [ ] Emergency guidance clear

## Files Created/Modified

### New Files
- `lib/types/active-flare.ts`
- `lib/repositories/activeFlareRepository.ts`
- `lib/utils/flareDetection.ts`
- `lib/utils/flareAnalytics.ts`
- `lib/utils/emergencyThresholds.ts`
- `lib/hooks/useFlareNotifications.ts`
- `components/active-flare/ActiveFlareDashboard.tsx`
- `components/active-flare/FlareCard.tsx`
- `components/active-flare/SeverityTrendChart.tsx`
- `components/active-flare/FlareBodyMap.tsx`
- `components/active-flare/QuickFlareUpdate.tsx`
- `components/active-flare/FlareUpdateHistory.tsx`
- `components/active-flare/FlareInsights.tsx`
- `components/active-flare/FlarePatterns.tsx`
- `components/active-flare/EmergencyGuidance.tsx`
- `components/active-flare/FlareAlerts.tsx`
- `components/active-flare/FlareComparison.tsx`
- `components/active-flare/FlareJournal.tsx`
- `app/(protected)/flare-dashboard/page.tsx`

### Modified Files
- `src/lib/db/client.ts`
- `src/lib/db/schema.ts`
- `components/calendar/CalendarView.tsx`
- Main navigation component

## Success Criteria

- [ ] Dashboard provides clear flare status at-a-glance
- [ ] Trend charts show severity progression accurately
- [ ] Quick updates can be logged in <15 seconds
- [ ] Analytics provide actionable insights
- [ ] Emergency guidance is clear and accessible
- [ ] Flare comparison helps identify patterns
- [ ] Integration with calendar seamless
- [ ] Performance targets met
- [ ] Notifications helpful not annoying

## Integration Points

*Integrates with:*
- Task 2: Symptom Tracking (flare symptoms)
- Task 3: Daily Entry System (flare updates)
- Task 4: Calendar/Timeline (flare timeline)
- Task 7: Body Mapping (affected regions)
- Task 8: Photo Documentation (flare photos)
- Task 10: Enhanced Trigger Tracking (flare triggers)

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
