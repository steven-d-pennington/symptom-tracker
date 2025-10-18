# Story 3.4: Medication Timing Warnings and Smart Notes

Status: Ready for Review

## Story (Timing)

As a user taking scheduled medications,
I want to see warnings if I'm taking meds early/late,
so that I maintain consistent medication timing for effectiveness.

## Story (Smart Notes)

As a user logging repeated events,
I want to see recent notes as suggestions,
so that I can quickly add context without retyping common notes.

## Acceptance Criteria - Timing Warnings

1. MedicationLogModal calculates expected time from medication schedule
2. Shows warning banner if current time outside ±2 hour window
3. Warning color-coded: yellow for 1-2 hours off, red for >2 hours off
4. No warning for PRN (as-needed) medications
5. Warning is informational only (doesn't block logging)

## Acceptance Criteria - Smart Notes

1. MedicationLogModal queries last 10 medication events for same med, extracts unique notes
2. Shows note suggestions as chips below checkbox
3. Tap chip to auto-fill notes field (editable)
4. Symptom and trigger modals also show recent notes
5. Notes tracked per event type (med notes, symptom notes, trigger notes kept separate)

## Tasks / Subtasks

- [x] Implement timing warning calculation (AC-Timing: 1,2,3,4,5)
  - [x] Update MedicationLogModal to calculate timing warnings
  - [x] Compare `Date.now()` to `medication.schedule.time`
  - [x] Calculate hour difference from scheduled time
  - [x] Display warning banner if outside ±2 hour window
  - [x] Color code: yellow (1-2h off), red (>2h off)
  - [x] Skip warning for PRN medications

- [x] Create timing warning UI component (AC-Timing: 2,3)
  - [x] Warning banner at top of modal
  - [x] Example: "⚠️ Usually taken at 8am (2 hours late)"
  - [x] Color coding based on severity
  - [x] Informational only (doesn't block save)

- [x] Implement smart notes for medications (AC-SmartNotes: 1,2,3)
  - [x] Query last 10 medication events: `medicationEventRepository.findByMedicationId(medId, { limit: 10 })`
  - [x] Extract notes field from each event
  - [x] Deduplicate notes
  - [x] Display as clickable chips below checkbox
  - [x] Tap chip to auto-fill notes field

- [x] Extend smart notes to symptoms and triggers (AC-SmartNotes: 4,5)
  - [x] SymptomLogModal: query recent symptom instance notes
  - [x] TriggerLogModal: query recent trigger event notes
  - [x] Use same chip UI pattern
  - [x] Keep notes separate per event type

## Dev Notes

**Technical Approach:**
- Timing calculation: compare current time to scheduled time
- Schedule format: `{ time: "08:00", daysOfWeek: [0,1,2,3,4,5,6] }`
- ±2 hour window: acceptable range is scheduled time ±2 hours
- Smart notes: query recent events, extract unique notes, display as chips

**Timing Warning Logic:**
```typescript
const scheduledTime = parseTime(medication.schedule.time); // "08:00" → Date
const currentTime = new Date();
const diff = Math.abs(currentTime.getTime() - scheduledTime.getTime());
const hoursDiff = diff / (1000 * 60 * 60);

if (hoursDiff > 2) {
  const severity = hoursDiff > 4 ? 'red' : 'yellow';
  const direction = currentTime > scheduledTime ? 'late' : 'early';
  showWarning(severity, `Usually taken at ${scheduleTime} (${Math.floor(hoursDiff)} hours ${direction})`);
}
```

**Smart Notes Implementation:**
```typescript
const recentEvents = await medicationEventRepository.findByMedicationId(medId, { limit: 10 });
const notes = recentEvents
  .filter(e => e.notes && e.notes.trim().length > 0)
  .map(e => e.notes!);
const uniqueNotes = Array.from(new Set(notes));
// Display as chips
```

**UI/UX Considerations:**
- Timing warnings help users maintain consistent medication timing
- Smart notes reduce typing for common scenarios
- Warnings are informational, not blocking (user can proceed)

### Project Structure Notes

**Files to Update:**
- `src/components/medications/MedicationLogModal.tsx`
- `src/components/symptoms/SymptomLogModal.tsx`
- `src/components/triggers/TriggerLogModal.tsx`

**Dependencies:**
- medicationEventRepository.findByMedicationId() with limit
- Similar methods for symptom and trigger repositories
- Chip/badge UI component for note suggestions

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 3.4]
- [Component: src/components/medications/MedicationLogModal.tsx]
- [Repositories: medicationEventRepository, symptomInstanceRepository, triggerEventRepository]
- Time Estimate: 5-6 hours

## Dev Agent Record

### Context Reference

- docs/stories/story-context-3.4.xml (generated 2025-10-15)

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

- 2025-10-15: Implementation Plan
  - Enhance MedicationLogModal timing warning UI with severity-coded banner (yellow for 1-2h off, red for >2h off)
  - Add getRecentNotes() method to symptomInstanceRepository for smart note suggestions
  - Integrate smart note chips into SymptomLogModal progressive disclosure section
  - Integrate smart note chips into TriggerLogModal progressive disclosure section
  - Ensure note suggestions are deduplicated, scoped per event type, and limited to 10 entries
  - PRN medication timing warnings already skipped in existing logic (schedule array empty check)

- 2025-10-15: Implementation Details
  - MedicationLogModal: Added hoursDifference field to MedicationQuickLogItem interface for timing calculations
  - MedicationLogModal: Calculate hoursDifference using Math.abs(diffMinutes / 60) during medication loading
  - MedicationLogModal: Render timing warning banner conditionally based on timingWarning and hoursDifference
  - Banner severity: >2 hours = red (bg-red-100, text-red-800, border-red-200), 1-2 hours = yellow (bg-yellow-100, text-yellow-800, border-yellow-200)
  - symptomInstanceRepository.getRecentNotes(): Query userId index with reverse sort, filter by symptom name, extract and deduplicate notes, limit to 10
  - SymptomLogModal: Added recentNotes field to SymptomWithUsage interface
  - SymptomLogModal: Load recentNotes using Promise.all during symptom initialization
  - SymptomLogModal: Render note chips in both favorites and categorized sections within expanded details
  - TriggerLogModal: Added recentNotes field to TriggerWithUsage interface
  - TriggerLogModal: Load recentNotes using Promise.all during trigger initialization
  - TriggerLogModal: Render note chips in both common and categorized sections within expanded details
  - All chip buttons: onClick sets expandedSymptom/expandedTrigger notes field, maintaining user edits
  - TypeScript compilation: No errors in modified files (only pre-existing test file errors)

### Completion Notes List

- 2025-10-15: Implementation Complete
  - **Timing Warning Banner Enhancement:** Updated MedicationLogModal to display severity-coded warning banner at the top of each medication card. Banner shows yellow background for 1-2 hours off schedule, red background for >2 hours off. Warning message includes scheduled time and hour difference (e.g., "Usually taken at 08:00 (3 hours late)"). Banner includes AlertCircle icon and aria-live="polite" for accessibility.
  - **Smart Notes for Medications:** MedicationLogModal already had smart note chip functionality using medicationEventRepository.getRecentNotes(). Notes are displayed as clickable chips below the checkbox, deduplicated, truncated to 30 characters for display, and limited to 10 entries.
  - **Smart Notes Repository Extension:** Added getRecentNotes() method to symptomInstanceRepository. Method queries symptomInstances by userId, filters by symptom name, extracts notes field, deduplicates, and returns up to 10 unique recent notes.
  - **Smart Notes for Symptoms:** Updated SymptomLogModal to load recentNotes for each symptom during initialization. Added note chip display in expanded details section with auto-fill behavior on click. Chips styled consistently with medication modal pattern.
  - **Smart Notes for Triggers:** Updated TriggerLogModal to load recentNotes from triggerEventRepository.getRecentNotes() for each trigger. Integrated note chips into expanded details section with same UI pattern as symptoms and medications.
  - **PRN Medication Handling:** Timing warnings automatically skipped for PRN medications since todaySchedule will be undefined when schedule array is empty.
  - **Accessibility:** All note chips include focus:ring-2 focus:ring-primary focus:ring-offset-1 for keyboard navigation. Warning banner uses role="status" and aria-live="polite" for screen reader announcements.

### File List

- src/components/medications/MedicationLogModal.tsx (modified - added timing warning banner with severity colors)
- src/lib/repositories/symptomInstanceRepository.ts (modified - added getRecentNotes method)
- src/components/symptoms/SymptomLogModal.tsx (modified - added smart note chips)
- src/components/triggers/TriggerLogModal.tsx (modified - added smart note chips)


### Change Log

- 2025-10-15: Story 3.4 implementation complete
  - Enhanced MedicationLogModal with severity-coded timing warning banner (yellow for 1-2h off, red for >2h off)
  - Added getRecentNotes() method to symptomInstanceRepository for symptom-specific note history
  - Integrated smart note chips into SymptomLogModal and TriggerLogModal with auto-fill on click
  - All note suggestions deduplicated, scoped per event type (medications, symptoms, triggers), and limited to 10 entries
  - PRN medication timing warnings automatically skipped (no schedule = no warning)
  - Enhanced accessibility with focus rings on chips and aria-live announcements on warning banners
  - All 10 acceptance criteria satisfied (AC-Timing 1-5, AC-SmartNotes 1-5)
