# Story 3.1: Redesign Home/Dashboard Page

Status: TODO

## Story

As a user opening the app,
I want to see active flares, quick-log buttons, and today's timeline,
so that I can immediately log events or review my day.

## Acceptance Criteria

1. New layout: Active Flares (top) → Quick-Log Buttons → Timeline View → Navigation
2. Active Flares section shows 0-5 flare cards, collapses to 1-line summary if > 5
3. Quick-Log Buttons prominently displayed below Active Flares
4. Timeline View shows today's events, scrollable
5. Navigation remains at bottom (mobile) or sidebar (desktop) - unchanged from Phase 2
6. Page loads in <1 second for typical data (5 active flares + 10 today events)
7. Smooth scroll to timeline item when tapped from notification/link
8. Refresh mechanism: pull-to-refresh on mobile, refresh button on desktop

## Tasks / Subtasks

- [ ] Update dashboard page layout (AC: 1,2,3,4,5)
  - [ ] Update `src/app/(protected)/dashboard/page.tsx`
  - [ ] Stack components: ActiveFlareCards → QuickLogButtons → TimelineView
  - [ ] Keep existing navigation unchanged
  - [ ] Implement collapse for >5 active flares

- [ ] Optimize page load performance (AC: 6)
  - [ ] Use React Server Components for initial data load
  - [ ] Parallel queries for active flares + today's events
  - [ ] Measure and optimize to <1 second load time

- [ ] Implement scroll to timeline item (AC: 7)
  - [ ] Accept URL parameter or state for target event ID
  - [ ] Smooth scroll to specific timeline item
  - [ ] Highlight target item temporarily

- [ ] Add refresh mechanisms (AC: 8)
  - [ ] Pull-to-refresh on mobile (touch gesture)
  - [ ] Refresh button on desktop
  - [ ] Refresh all data (flares + timeline)

## Dev Notes

**Technical Approach:**
- Update existing dashboard page to integrate Epic 2 components
- Layout: vertical stack of ActiveFlareCards, QuickLogButtons, TimelineView
- Use React Server Components where possible for SSR optimization
- Keep existing navigation system unchanged

**Performance Optimization:**
- Parallel data fetching: fetch flares and timeline events simultaneously
- Use React.Suspense for loading states
- Optimize queries to return only needed data
- Target: <1 second load time for typical user (5 flares, 10 events)

**Scroll Implementation:**
- Use `scrollIntoView({ behavior: 'smooth' })` for smooth scrolling
- Temporarily highlight target item (e.g., brief color change)
- Handle scroll target from URL params or app state

**UI/UX Considerations:**
- Active Flares at top for immediate visibility
- Quick-Log buttons prominently placed for easy access
- Timeline provides daily context below
- Existing navigation unchanged (no user retraining needed)

### Project Structure Notes

**Files to Update:**
- `src/app/(protected)/dashboard/page.tsx` (main dashboard)
- Possibly create layout components for organization

**Dependencies:**
- ActiveFlareCards (Story 2.2)
- QuickLogButtons (Story 2.1)
- TimelineView (Story 2.3)
- Existing navigation components (unchanged)

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 3.1]
- [Component: src/app/(protected)/dashboard/page.tsx]
- [Navigation: Existing Phase 2 navigation system]
- Time Estimate: 6-8 hours

## Dev Agent Record

### Context Reference

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
