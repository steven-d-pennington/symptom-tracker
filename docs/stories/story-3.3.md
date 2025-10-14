# Story 3.3: Update Exports and Trigger Correlation

Status: TODO

## Story (Export)

As a user exporting data,
I want to export all event types in CSV and JSON,
so that I can share comprehensive data with my doctor or analyze externally.

## Story (Correlation)

As a user analyzing triggers,
I want to see correlations based on trigger events and symptom events,
so that I can identify cause-and-effect relationships.

## Acceptance Criteria - Export

1. CSV export includes all event types: one row per event with columns: type, timestamp, name, details
2. JSON export structured by event type: `{ medicationEvents: [...], triggerEvents: [...], ... }`
3. Export includes flare progression: severity history and interventions
4. Export preserves timestamps in ISO 8601 format for external tools
5. File size reasonable for 1 year of data (<5MB for typical user)

## Acceptance Criteria - Trigger Correlation

1. Correlation dashboard queries triggerEvents table for exposures
2. Queries symptomInstances and flares for symptom data
3. Correlation calculation uses timestamps for temporal analysis (trigger at T, symptom at T+2h)
4. Displays correlation matrix: triggers vs symptoms with correlation coefficients
5. Time-lag analysis: shows most common delay between trigger and symptom

## Tasks / Subtasks

- [ ] Update export service for event stream (AC-Export: 1,2,3,4,5)
  - [ ] Update `src/lib/services/exportService.ts`
  - [ ] Add CSV export for all event types
  - [ ] Add JSON export structured by event type
  - [ ] Include flare severityHistory and interventions
  - [ ] Format timestamps as ISO 8601
  - [ ] Test file size with 1-year dataset

- [ ] Implement CSV export format (AC-Export: 1)
  - [ ] Header: `type,timestamp,name,details`
  - [ ] One row per event
  - [ ] Example: `medication,2025-10-13T08:00:00.000Z,Humira,taken`

- [ ] Implement JSON export format (AC-Export: 2)
  - [ ] Top-level keys: medicationEvents, triggerEvents, symptomInstances, flares
  - [ ] Each key contains array of events
  - [ ] Preserve full event structure

- [ ] Update trigger correlation dashboard (AC-Correlation: 1,2,3,4,5)
  - [ ] Update `src/components/triggers/TriggerCorrelationDashboard.tsx`
  - [ ] Query triggerEvents table
  - [ ] Query symptomInstances and flares
  - [ ] Implement temporal correlation (trigger at T, symptom at T+Δt)
  - [ ] Display correlation matrix
  - [ ] Show time-lag analysis

- [ ] Implement temporal correlation analysis (AC-Correlation: 3,5)
  - [ ] For each trigger event, find symptoms within time windows
  - [ ] Time buckets: 0-2h, 2-4h, 4-6h, 6-12h, 12-24h
  - [ ] Calculate correlation coefficients (Pearson or Spearman)
  - [ ] Identify most common time-lag per trigger-symptom pair

- [ ] Create correlation matrix visualization (AC-Correlation: 4)
  - [ ] Rows: triggers
  - [ ] Columns: symptoms
  - [ ] Cells: correlation coefficient (-1 to +1)
  - [ ] Color coding: red (positive correlation), blue (negative), gray (no correlation)

## Dev Notes

**Technical Approach:**
- Update exportService to query event tables instead of dailyEntries
- CSV format: simple row-per-event structure
- JSON format: structured by event type for programmatic access
- Temporal correlation: bucket analysis for time-lag detection

**CSV Export Format:**
```csv
type,timestamp,name,details
medication,2025-10-13T08:00:00.000Z,Humira,taken
trigger,2025-10-13T12:30:00.000Z,Dairy,medium
symptom,2025-10-13T14:45:00.000Z,Headache,severity:6
flare,2025-10-13T15:00:00.000Z,Right armpit,severity:7
```

**JSON Export Format:**
```json
{
  "medicationEvents": [...],
  "triggerEvents": [...],
  "symptomInstances": [...],
  "flares": [...]
}
```

**Correlation Calculation:**
- For each trigger: count trigger events
- For each symptom: count symptom instances within time window after trigger
- Calculate Pearson correlation coefficient
- Time-lag: most common bucket with highest correlation

### Project Structure Notes

**Files to Update:**
- `src/lib/services/exportService.ts`
- `src/components/triggers/TriggerCorrelationDashboard.tsx`

**Dependencies:**
- All event repositories (medication, trigger, symptom, flare)
- Correlation calculation library or custom implementation

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 3.3]
- [Service: src/lib/services/exportService.ts]
- [Component: src/components/triggers/TriggerCorrelationDashboard.tsx]
- [Correlation: Pearson correlation coefficient algorithm]
- Time Estimate: 8-10 hours

## Dev Agent Record

### Context Reference

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
