# Story 3.4: Medication Timing Warnings and Smart Notes

Status: TODO

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

- [ ] Implement timing warning calculation (AC-Timing: 1,2,3,4,5)
  - [ ] Update MedicationLogModal to calculate timing warnings
  - [ ] Compare `Date.now()` to `medication.schedule.time`
  - [ ] Calculate hour difference from scheduled time
  - [ ] Display warning banner if outside ±2 hour window
  - [ ] Color code: yellow (1-2h off), red (>2h off)
  - [ ] Skip warning for PRN medications

- [ ] Create timing warning UI component (AC-Timing: 2,3)
  - [ ] Warning banner at top of modal
  - [ ] Example: "⚠️ Usually taken at 8am (2 hours late)"
  - [ ] Color coding based on severity
  - [ ] Informational only (doesn't block save)

- [ ] Implement smart notes for medications (AC-SmartNotes: 1,2,3)
  - [ ] Query last 10 medication events: `medicationEventRepository.findByMedicationId(medId, { limit: 10 })`
  - [ ] Extract notes field from each event
  - [ ] Deduplicate notes
  - [ ] Display as clickable chips below checkbox
  - [ ] Tap chip to auto-fill notes field

- [ ] Extend smart notes to symptoms and triggers (AC-SmartNotes: 4,5)
  - [ ] SymptomLogModal: query recent symptom instance notes
  - [ ] TriggerLogModal: query recent trigger event notes
  - [ ] Use same chip UI pattern
  - [ ] Keep notes separate per event type

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

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
