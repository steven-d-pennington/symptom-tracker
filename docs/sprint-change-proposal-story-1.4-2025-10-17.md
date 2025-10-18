# Sprint Change Proposal — Story 1.4 Scope Adjustment

Date: 2025-10-17
Author: Steven
Project: symptom-tracker

## 1. Issue Summary

- Trigger: Story 1.4 (Meal Composition Logging) Tasks 7 and 8 deferred.
- Problem: Current timeline infrastructure does not yet support grouped meal rendering and edit flow; AC7 could not be delivered within Story 1.4 scope.
- Evidence: `docs/stories/story-1.4.md` marks AC7 and related tasks as DEFERRED with rationale (timeline overhaul needed). AC1–6 are implemented.

## 2. Impact Analysis

- Epic E1 viability: Intact. Timeline behavior should live under Story 1.6.
- PRD: FR004/FR005/FR012 remain valid; no scope change, only sequence.
- Architecture: Timeline adapter must support meal grouping by `mealId`, hydration join with foods, accessible expand/collapse, and edit affordance.
- UX: Timeline grouped meal entry behavior, ARIA, and motion specified.
- Testing: Add grouped timeline render tests, hydration/memoization unit tests, and a11y checks.

## 3. Recommended Approach

- Selected Option: Direct Adjustment (move AC7/edit flow into Story 1.6; resequence Story 1.6 before 1.5).
- Effort: Medium. Risk: Low–Medium (grouping/hydration correctness, a11y details).
- Timeline Impact: Pull Story 1.6 forward; Story 1.5 follows to leverage timeline thumbnails.

## 4. Detailed Change Proposals (Applied)

1) Story 1.4 updates (APPLIED)
- File: `docs/stories/story-1.4.md`
- Status → “Ready for Review (AC1–6 Complete; AC7 moved to Story 1.6)”
- AC7 → “Deferred: Timeline grouped meal rendering and edit flow moved to Story 1.6”

2) Story 1.6 acceptance criteria & notes (APPLIED)
- File: `docs/epic-stories.md` (Story 1.6 section)
- Adds grouping by `mealId`, collapsed→expanded details (portions, notes, allergen tags, photo), [Edit]/[Delete], hydration via `foodRepository.getByIds()`, parse JSON arrays, memoization, a11y.

3) Solution Architecture clarifications (APPLIED)
- File: `docs/solution-architecture.md`
- `/timeline` specifies grouped-by-`mealId` rendering + edit affordance; E1 matrix notes timeline grouping/hydration.

4) UX specification updates (APPLIED)
- File: `docs/ux-specification.md`
- Adds “Timeline — Grouped Meal Entries” flow; ARIA & keyboard requirements; motion constraints.

5) Status/backlog resequencing (APPLIED)
- File: `docs/bmm-workflow-status.md`
- Next Action: Review Story 1.4 (`review-story`); Agent: SM; backlog order: 1.6 before 1.5; counts updated.

## 5. Implementation Handoff

- Scope Classification: Moderate
- Recipients & Responsibilities:
  - Development: Implement Story 1.6 timeline grouping/hydration/edit/delete with tests and a11y.
  - PO/SM: Maintain resequenced backlog (1.6 → 1.5) and run `review-story` for 1.4.
- Success Criteria:
  - Story 1.4 approved (AC1–6 verified) with review notes appended.
  - Story 1.6 delivers grouped meals with a11y + edit/delete; tests passing per coverage standards.

## 6. Approvals

- User approval received: 2025-10-17 — Proceed with plan (mode: incremental).

