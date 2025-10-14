# Story 2.5: Medication, Symptom, and Trigger Log Modals

Status: Ready

## Story

As a user logging routine events,
I want to use simple, focused modals for each event type,
so that I can log medications, symptoms, and triggers in 2-5 seconds.

## Acceptance Criteria - MedicationLogModal

1. Shows list of scheduled medications for today from medications table
2. Each medication has checkbox: [ ] Humira, [ ] Metformin
3. Timing warning shown if current time is outside ±2 hour window
4. Recent notes shown as suggestion chips below checkboxes
5. Optional notes field: "Any notes? (optional)"
6. Auto-saves on checkbox change (no explicit save button needed)
7. Completed in 2-3 seconds for simple checkbox, 5-10 seconds with notes

## Acceptance Criteria - SymptomLogModal

1. Shows recent/favorite symptoms first (last logged in past 30 days)
2. Full symptom list below with categories
3. One-tap logging: tap symptom name → immediately logs
4. Optional: tap same symptom again to add severity/notes (progressive disclosure)
5. Search filter at top for finding specific symptoms
6. Completed in 3-5 seconds for one-tap, 10-15 seconds with details

## Acceptance Criteria - TriggerLogModal

1. Shows common triggers first (dietary, stress, sleep, weather)
2. Full trigger list below
3. One-tap logging: tap trigger → immediately logs with medium intensity
4. Optional: tap again to adjust intensity (low/medium/high) and add notes
5. Completed in 3-5 seconds for one-tap

## Tasks / Subtasks

- [ ] Create MedicationLogModal (AC-Med: 1-7)
  - [ ] Set up `src/components/medications/MedicationLogModal.tsx`
  - [ ] Query scheduled medications from medications table
  - [ ] Render checkboxes for each medication
  - [ ] Calculate timing warnings (±2 hour window from schedule)
  - [ ] Query recent notes and show as chips
  - [ ] Auto-save on checkbox change
  - [ ] Call `medicationEventRepository.create()` on log

- [ ] Create SymptomLogModal (AC-Sym: 1-6)
  - [ ] Set up `src/components/symptoms/SymptomLogModal.tsx`
  - [ ] Query recent symptoms (last 30 days) and sort by last used
  - [ ] Render full symptom list with categories
  - [ ] Implement one-tap logging (immediate save)
  - [ ] Add search filter
  - [ ] Progressive disclosure: tap again for severity/notes
  - [ ] Call `symptomInstanceRepository.create()` on log

- [ ] Create TriggerLogModal (AC-Trig: 1-5)
  - [ ] Set up `src/components/triggers/TriggerLogModal.tsx`
  - [ ] Show common triggers first
  - [ ] Render full trigger list
  - [ ] Implement one-tap logging (default medium intensity)
  - [ ] Progressive disclosure: tap again for intensity/notes
  - [ ] Call `triggerEventRepository.create()` on log

- [ ] Implement smart notes feature (AC-Med: 4)
  - [ ] Query last 10 events for each medication/symptom/trigger
  - [ ] Extract unique notes
  - [ ] Display as clickable chips
  - [ ] Tap chip to auto-fill notes field

## Dev Notes

**Technical Approach:**
- Create 3 modal components in respective directories
- One-tap logging: immediate save without confirmation
- Progressive disclosure: optional fields only shown after first tap
- Auto-save reduces friction for frequent events

**Timing Warning Calculation:**
- Compare `Date.now()` to `medication.schedule.time`
- Schedule format: `{ time: "08:00", daysOfWeek: [0,1,2,3,4,5,6] }`
- ±2 hour window: 6am-10am acceptable for 8am medication

**Smart Notes Implementation:**
- Query: `medicationEventRepository.findByMedicationId(medId, { limit: 10 })`
- Map to notes array, deduplicate
- Show as clickable chips below input field

**UI/UX Considerations:**
- Speed is critical: users should log in seconds
- One-tap for common cases, optional details for thoroughness
- Auto-save eliminates explicit save button

### Project Structure Notes

**Component Locations:**
- `src/components/medications/MedicationLogModal.tsx`
- `src/components/symptoms/SymptomLogModal.tsx`
- `src/components/triggers/TriggerLogModal.tsx`

**Dependencies:**
- Repositories: medicationEvent, symptomInstance, triggerEvent (Stories 1.2, 1.3)
- medications, symptoms, triggers tables
- Search/filter functionality

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 2.5]
- [Repositories: src/lib/repositories/medicationEventRepository.ts, triggerEventRepository.ts]
- Time Estimate: 12-14 hours (3 modals)

## Dev Agent Record

### Context Reference

- **Context File:** `docs/stories/story-context-2.5.xml`
- **Generated:** 2025-10-14
- **Status:** Ready for DEV agent implementation

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
