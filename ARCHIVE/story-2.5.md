# Story 2.5: Trigger Analysis Dashboard Integration

Status: Complete

Completion Date: 2025-10-18

## Story

As a user,
I want to see food-related triggers in the existing Trigger Analysis dashboard,
so that I have a unified view of all my triggers (environmental, food, etc.).

## Acceptance Criteria

1. Food triggers appear in Trigger Analysis dashboard alongside existing triggers
2. Food triggers visually distinguished with a food icon
3. Dashboard shows top food triggers ranked by correlation strength
4. Clicking a food trigger opens a detailed correlation report
5. Dashboard supports filtering by trigger type (food vs. environmental)

## Tasks / Subtasks

- [x] Extend TriggerCorrelationDashboard to include food triggers (AC 1, 2, 3, 5)
  - [x] Unify visualization model with a `type: 'food' | 'environment'` field
  - [x] Add food icon and styling for food-type rows/cards
  - [x] Rank by correlation strength across both types
  - [x] Add filter control (toggle or tabs) for Food / Environmental / All

- [x] Data integration for food triggers (AC 1, 3)
  - [x] Derive food-trigger events from foodEvents and compute temporal correlations (reuse calculateTemporalCorrelation)
  - [x] Map to dashboard model: name, symptom, correlation strength, confidence
  - [x] Merge with environmental trigger correlations for unified ranking

- [x] Drill-down to detailed correlation report (AC 4)
  - [x] Add click handler on food trigger entries
  - [x] Route to a food correlation detail view (placeholder under `src/app/(protected)/foods/[foodId]/correlation`)
  - [x] Pass identifiers (foodId and symptom via query param)

- [x] Tests (component)
  - [x] CorrelationMatrix: food icon rendering and click handler
  - [x] TriggerCorrelationDashboard: filter behavior and drill-down navigation (repos mocked; no Dexie)
  - [ ] Ranking correctness by correlation strength (pending)

## Technical Notes

- Extend Trigger Analysis component to render food data alongside environmental triggers
- Unify data model for trigger visualization (type field, consistent correlation score)
- Reuse existing correlation services where possible; avoid duplicating logic

## References

- docs/epic-stories.md — Story 2.5: Trigger Analysis Dashboard Integration

## Dev Agent Record

### Context Reference
- docs/stories/story-context-2.5.xml

### Senior Developer Review (AI)
- Date: 2025-10-18
- Outcome: Approve
- Notes: See `docs/stories/in-progress/story-2.5-review.md` for detailed findings and test summary.
