# Story 3.2: Update Analytics to Query Event Stream

Status: TODO

## Story

As a user viewing analytics,
I want to see insights based on my event stream data,
so that trend analysis and correlations use accurate timestamped events.

## Acceptance Criteria

1. TrendAnalysisService queries symptomInstances table instead of dailyEntries.symptoms
2. Flare-specific trends query flares table with severityHistory
3. Medication adherence calculated from medicationEvents (% taken vs scheduled)
4. Symptom frequency aggregated from symptomInstances by date/week/month
5. Analytics dashboard displays correctly with event-based data
6. No regressions: all existing charts render properly
7. Performance: queries complete in <2 seconds for 90-day datasets

## Tasks / Subtasks

- [ ] Update TrendAnalysisService (AC: 1,2,4)
  - [ ] Update `src/lib/services/TrendAnalysisService.ts`
  - [ ] Change symptom queries to use symptomInstances table
  - [ ] Add flare severity trend extraction from severityHistory
  - [ ] Aggregate symptom frequency by date/week/month

- [ ] Implement medication adherence calculation (AC: 3)
  - [ ] Query medicationEvents where taken=true
  - [ ] Count scheduled doses from medications table
  - [ ] Calculate percentage: (taken / scheduled) * 100
  - [ ] Display adherence per medication and overall

- [ ] Extract and visualize flare severity trends (AC: 2)
  - [ ] Query flares with severityHistory
  - [ ] Extract severity data points over time
  - [ ] Plot severity progression for each flare
  - [ ] Show trend indicators (improving/worsening/stable)

- [ ] Update analytics dashboard components (AC: 5,6)
  - [ ] Update all analytics components to use new service methods
  - [ ] Test all existing charts with event-based data
  - [ ] Ensure no visual regressions

- [ ] Optimize query performance (AC: 7)
  - [ ] Use date range filters on all queries
  - [ ] Leverage compound indexes from Story 1.1
  - [ ] Aggregate by date using `new Date(timestamp).toDateString()`
  - [ ] Test with 90-day dataset, target <2 second query time

## Dev Notes

**Technical Approach:**
- Update `src/lib/services/TrendAnalysisService.ts` to query event tables
- Use compound indexes for efficient date range queries
- Aggregate events by day/week/month for trend visualization

**Data Transformation:**
- Symptom frequency: Group symptomInstances by date, count occurrences
- Flare trends: Extract severityHistory array, map to time series
- Medication adherence: Compare medicationEvents (taken=true) to scheduled doses

**Performance Optimization:**
- Use date range filters: `findByDateRange(userId, startTimestamp, endTimestamp)`
- Leverage [userId+timestamp] compound indexes
- Aggregate in memory after fetching (IndexedDB doesn't support GROUP BY)

**Testing Strategy:**
- Generate 90-day dataset using DevDataControls (Story 1.5)
- Measure query performance
- Compare analytics output with legacy system for accuracy

### Project Structure Notes

**Files to Update:**
- `src/lib/services/TrendAnalysisService.ts` (main update)
- Analytics dashboard components (consumption of updated service)
- May need new service methods for flare severity trends

**Dependencies:**
- Event repositories from Stories 1.2, 1.3, 1.4
- Compound indexes from Story 1.1
- Existing analytics dashboard components

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 3.2]
- [Service: src/lib/services/TrendAnalysisService.ts]
- [Repositories: medicationEventRepository, triggerEventRepository, flareRepository]
- Time Estimate: 6-8 hours

## Dev Agent Record

### Context Reference

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
