# Story 2.2: Active Flare Cards Component

Status: Ready

## Story

As a user managing active flares,
I want to see all active flares prominently displayed with quick actions,
so that I can easily update severity and resolve flares as they heal.

## Acceptance Criteria

1. Displays 0-5 active flare cards at top of home screen
2. Each card shows: body location, duration (days since onset), current severity (X/10), trend arrow (↑↓→)
3. Quick action buttons on each card: [Update] [Resolve]
4. Empty state when no active flares: "No active flares right now" with encouraging message
5. Trend arrows calculated from severityHistory: ↑ worsening (red), → stable (yellow), ↓ improving (green)
6. Duration shows "Day 1", "Day 3", etc. based on startDate to now
7. Tap [Update] opens FlareUpdateModal pre-filled with current flare data
8. Tap [Resolve] shows confirmation dialog, then resolves flare (removes from active display)
9. Cards sortable by severity (highest first) or recency (newest first)

## Tasks / Subtasks

- [ ] Create ActiveFlareCards component (AC: 1,2,4)
  - [ ] Set up component file `src/components/flares/ActiveFlareCards.tsx`
  - [ ] Query active flares using `flareRepository.getActiveFlaresWithTrend()`
  - [ ] Render flare cards with body location, duration, severity, trend arrow
  - [ ] Implement empty state component

- [ ] Calculate and display flare metrics (AC: 2,5,6)
  - [ ] Calculate duration: `Math.floor((Date.now() - flare.startDate) / (1000 * 60 * 60 * 24)) + 1` days
  - [ ] Display trend arrows: ↑ worsening (red), → stable (yellow), ↓ improving (green)
  - [ ] Format severity as "X/10"

- [ ] Implement quick actions (AC: 3,7,8)
  - [ ] Add [Update] button that opens FlareUpdateModal
  - [ ] Add [Resolve] button with confirmation dialog
  - [ ] Pass flare data to modals when opened
  - [ ] Implement resolve handler that calls `flareRepository.resolve()`

- [ ] Add sorting functionality (AC: 9)
  - [ ] Implement sort by severity (highest first)
  - [ ] Implement sort by recency (newest first)
  - [ ] Add sort toggle UI

## Dev Notes

**Technical Approach:**
- Create `src/components/flares/ActiveFlareCards.tsx`
- Use `flareRepository.getActiveFlaresWithTrend()` from Story 1.4
- Trend indicators come from the repository method (already calculates 24h comparison)
- Use existing Card component patterns from the codebase

**Data Flow:**
- Query flares on component mount and after updates
- Pass flare ID to modals for updates
- Refresh flare list after resolve action

**UI/UX Considerations:**
- Cards should be visually prominent (top of home screen)
- Trend arrows use color coding for quick assessment
- Confirmation dialog prevents accidental resolution

### Project Structure Notes

**Component Location:**
- Directory: `src/components/flares/`
- Main component: `ActiveFlareCards.tsx`
- Empty state component: `EmptyFlareState.tsx` (optional sub-component)

**Dependencies:**
- `flareRepository.getActiveFlaresWithTrend()` from Story 1.4
- Modal components (FlareUpdateModal from Story 2.4)
- Existing Card UI components

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 2.2]
- [Repository: src/lib/repositories/flareRepository.ts:204-245]
- Time Estimate: 6-8 hours

## Dev Agent Record

### Context Reference

- **Context File:** `docs/stories/story-context-2.2.xml`
- **Generated:** 2025-10-14
- **Status:** Ready for DEV agent implementation

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
