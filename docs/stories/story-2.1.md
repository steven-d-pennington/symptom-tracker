# Story 2.1: QuickLog Buttons Component

Status: Ready

## Story

As a user wanting to log an event,
I want to see 4 prominent quick-log buttons on the home screen,
so that I have clear entry points for each event type.

## Acceptance Criteria

1. Renders 4 buttons in 2x2 grid: "🔥 New Flare", "💊 Medication", "😣 Symptom", "⚠️ Trigger"
2. Each button displays emoji icon and label text
3. Buttons are visually prominent with appropriate color coding (red for flare, blue for med, etc.)
4. Tap target size ≥44px for mobile accessibility
5. Buttons disabled state when modals are open (prevent double-tap)
6. Each button opens its corresponding modal: FlareCreationModal, MedicationLogModal, SymptomLogModal, TriggerLogModal
7. Responsive layout: 2x2 grid on mobile, single row on desktop
8. Loading states while modals initialize

## Tasks / Subtasks

- [ ] Create QuickLogButtons component (AC: 1,2,3,7)
  - [ ] Set up component file `src/components/quick-log/QuickLogButtons.tsx`
  - [ ] Implement 2x2 grid layout with Tailwind (mobile) and single row (desktop)
  - [ ] Add 4 buttons with emoji icons and labels
  - [ ] Apply color coding: red (flare), blue (medication), yellow (symptom), orange (trigger)

- [ ] Implement modal state management (AC: 5,6)
  - [ ] Add React state to track which modal is open
  - [ ] Pass modal open/close handlers as props
  - [ ] Disable buttons when any modal is open

- [ ] Ensure mobile accessibility (AC: 4)
  - [ ] Set minimum tap target size to 44px
  - [ ] Add ARIA labels for screen readers
  - [ ] Test on mobile devices

- [ ] Add loading states (AC: 8)
  - [ ] Show loading indicator while modals initialize
  - [ ] Disable buttons during loading

## Dev Notes

**Technical Approach:**
- Create `src/components/quick-log/QuickLogButtons.tsx`
- Use React state to manage which modal is open
- Follow existing button component patterns from the codebase
- Emoji icons: 🔥 💊 😣 ⚠️ (Unicode, no image dependencies)

**UI/UX Considerations:**
- Buttons should be large and easy to tap on mobile
- Color coding helps users quickly identify event types
- Disabled state prevents accidental double-taps

**Testing:**
- Test button clicks open correct modals
- Test responsive layout on mobile and desktop
- Test accessibility with screen readers

### Project Structure Notes

**Component Location:**
- New directory: `src/components/quick-log/`
- Main component: `QuickLogButtons.tsx`

**Dependencies:**
- React hooks (useState)
- Tailwind CSS for styling
- Modal components (to be created in later stories)

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 2.1]
- Time Estimate: 3-4 hours

## Dev Agent Record

### Context Reference

- docs/stories/story-context-2.1.xml (generated 2025-10-14)

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
