# Story 2.4: Flare Creation and Update Modals

Status: Ready

## Story

As a user experiencing a flare,
I want to quickly log new flares and update existing ones,
so that I can track flare progression over hours/days.

## Acceptance Criteria - FlareCreationModal

1. Step 1: Compact body map for location selection (reuse existing BodyMapViewer in compact mode)
2. Step 2: Severity slider 1-10 with clear labels (1="Minimal", 10="Excruciating")
3. Step 3: Optional notes field with placeholder "Any details? (optional)"
4. Two save buttons: [Save] (quick 10-15 sec flow) and [Add Details] (opens EventDetailModal after save)
5. Timestamp auto-captured on save
6. Creates FlareRecord with initial severity in severityHistory
7. Modal closes after save, returns to home with flare in Active Flares section
8. Form validation: body location required, severity required, notes optional
9. Mobile responsive: full-screen modal on mobile, centered dialog on desktop

## Acceptance Criteria - FlareUpdateModal

1. Shows flare context: "Right Armpit - Day 3"
2. Shows previous severity: "Severity was: 7/10"
3. Severity slider for new severity
4. Status buttons: [Getting Worse] [Same] [Improving] (optional, auto-detected if not selected)
5. Quick intervention buttons: [Ice] [Meds] [Rest] [Other] (optional)
6. Optional notes field
7. Calls `flareRepository.updateSeverity()` with new data
8. If intervention selected, calls `flareRepository.addIntervention()`
9. Timeline shows update event after save
10. Completed in 5-10 seconds for typical update

## Tasks / Subtasks

- [ ] Create FlareCreationModal (AC-Creation: 1-9)
  - [ ] Set up component file `src/components/flares/FlareCreationModal.tsx`
  - [ ] Integrate BodyMapViewer in compact mode for location selection
  - [ ] Add severity slider (1-10) with labels
  - [ ] Add optional notes field
  - [ ] Implement [Save] and [Add Details] buttons
  - [ ] Form validation (location + severity required)
  - [ ] Call `flareRepository.create()` on save
  - [ ] Handle modal open/close state

- [ ] Create FlareUpdateModal (AC-Update: 1-10)
  - [ ] Set up component file `src/components/flares/FlareUpdateModal.tsx`
  - [ ] Display flare context (location, day count)
  - [ ] Show previous severity
  - [ ] Add severity slider for new severity
  - [ ] Add status buttons (optional, with auto-detection)
  - [ ] Add quick intervention buttons [Ice] [Meds] [Rest] [Other]
  - [ ] Add optional notes field
  - [ ] Call `flareRepository.updateSeverity()` on save
  - [ ] Call `flareRepository.addIntervention()` if intervention selected

- [ ] Implement responsive design (AC-Creation: 9)
  - [ ] Full-screen modal on mobile (<768px)
  - [ ] Centered dialog on desktop
  - [ ] Touch-optimized controls

- [ ] Auto-detect status based on severity change (AC-Update: 4)
  - [ ] If severity +2: suggest "worsening"
  - [ ] If severity -2: suggest "improving"
  - [ ] Otherwise: suggest "stable"

## Dev Notes

**Technical Approach:**
- Create two modal components: FlareCreationModal and FlareUpdateModal
- Reuse existing BodyMapViewer component from Phase 2 (compact mode)
- Severity slider: `<input type="range" min="1" max="10" />`
- Status auto-detection: compare new severity to previous (±2 threshold)

**Data Flow:**
- FlareCreationModal: Creates new flare with initial severity
- FlareUpdateModal: Updates existing flare severity and optionally adds intervention
- Both modals refresh parent component after save

**UI/UX Considerations:**
- Quick save flow (10-15 sec for creation, 5-10 sec for update)
- Progressive disclosure: optional fields don't block quick logging
- Clear severity labels help users quantify pain levels
- Auto-detection reduces cognitive load

### Project Structure Notes

**Component Location:**
- Directory: `src/components/flares/`
- FlareCreationModal.tsx
- FlareUpdateModal.tsx

**Dependencies:**
- BodyMapViewer component (existing from Phase 2)
- `flareRepository.create()`, `updateSeverity()`, `addIntervention()` (Story 1.4)
- Modal/Dialog UI components

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 2.4]
- [Repository: src/lib/repositories/flareRepository.ts]
- [Component: Body mapping system from Phase 2]
- Time Estimate: 10-12 hours (2 complex modals)

## Dev Agent Record

### Context Reference

- **Context File:** `docs/stories/story-context-2.4.xml`
- **Generated:** 2025-10-14
- **Status:** Ready for DEV agent implementation

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
