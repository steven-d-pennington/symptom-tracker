# Story 2.3: Timeline View Component

Status: Ready

## Story

As a user wanting to see what happened today,
I want to view a chronological feed of all events,
so that I can understand my day's health patterns at a glance.

## Acceptance Criteria

1. Displays events in reverse chronological order (most recent first)
2. Each timeline item shows: time (HH:MM am/pm), emoji icon, summary text, optional details preview
3. Events grouped by day with date headers ("Today", "Yesterday", "Oct 12", etc.)
4. Tap timeline item to open EventDetailModal for that event
5. "Add details →" link shown on events with minimal data
6. "Load previous day" button at bottom, loads one more day on tap
7. Loading states: skeleton UI while querying, spinner for "Load more"
8. Empty state: "No events today yet. Use quick-log buttons above to get started!"
9. Responsive: full width on mobile, 2/3 width on desktop

## Tasks / Subtasks

- [ ] Create TimelineView component (AC: 1,2,3,9)
  - [ ] Set up component file `src/components/timeline/TimelineView.tsx`
  - [ ] Query all event types from repositories
  - [ ] Aggregate and sort events by timestamp descending
  - [ ] Group events by day with date headers
  - [ ] Implement responsive width (full on mobile, 2/3 on desktop)

- [ ] Format timeline items (AC: 2)
  - [ ] Medication: "💊 Humira (taken)" or "💊 Metformin (skipped)"
  - [ ] Symptom: "😣 Headache" with severity if present
  - [ ] Trigger: "⚠️ Ate dairy (medium intensity)"
  - [ ] Flare created: "🔥 Right armpit flare started, severity 7/10"
  - [ ] Flare updated: "🔥 Right armpit updated: 8/10 (+1)"
  - [ ] Flare resolved: "🔥 Right armpit flare resolved"

- [ ] Implement interactivity (AC: 4,5,6)
  - [ ] Tap timeline item opens EventDetailModal
  - [ ] Show "Add details →" link for minimal events
  - [ ] Add "Load previous day" button with pagination
  - [ ] Track currentDate state for pagination

- [ ] Add loading and empty states (AC: 7,8)
  - [ ] Skeleton UI while initial query loads
  - [ ] Spinner for "Load more" action
  - [ ] Empty state message with guidance

- [ ] Optimize for performance (AC: Performance)
  - [ ] Use virtualization for 100+ events (react-window or similar)
  - [ ] Pagination: load 1 day at a time

## Dev Notes

**Technical Approach:**
- Create `src/components/timeline/TimelineView.tsx`
- Query all event types: medicationEvents, triggerEvents, symptomInstances, flares
- Aggregate into unified timeline type: `TimelineEvent = { id, type, timestamp, summary, details?, eventRef }`
- Use Intl.DateTimeFormat or date-fns for date formatting

**Data Aggregation:**
- Query from all repositories in parallel
- Merge into single array sorted by timestamp
- Group by day using date string comparison

**Performance Considerations:**
- Pagination prevents loading entire history at once
- Virtualization handles large day counts (100+ events)
- Consider memoization for expensive calculations

### Project Structure Notes

**Component Location:**
- Directory: `src/components/timeline/`
- Main component: `TimelineView.tsx`
- Types: Define TimelineEvent type

**Dependencies:**
- All event repositories (medication, trigger, symptom, flare)
- EventDetailModal (Story 2.6)
- Date formatting library (date-fns or Intl)
- Optional: react-window for virtualization

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 2.3]
- [Repositories: src/lib/repositories/]
- Time Estimate: 8-10 hours

## Dev Agent Record

### Context Reference

- **Context File:** `docs/stories/story-context-2.3.xml`
- **Generated:** 2025-10-14
- **Status:** Ready for DEV agent implementation

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
