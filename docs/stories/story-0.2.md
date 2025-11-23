# Story 0.2: Dashboard "Today" Refresh

Status: Done

## Story

As a user landing on the dashboard,
I want a focused "Today" view with highlights and quick actions,
so that I can log events or review context without scanning multiple panels.

## Acceptance Criteria

1. **AC0.2.1 - Three-module layout:** Dashboard renders three vertically ordered modules (Highlights, Quick Actions, Today's Timeline) with responsive cards that preserve ordering on desktop and mobile, using consistent spacing and headings that match the Track pillar blueprint. The Highlights module surfaces active flare summaries and alerts pulled from existing data sources.  
2. **AC0.2.2 - Route-based quick actions:** Quick Actions buttons launch dedicated route-based sheets or full-screen dialogs on mobile instead of stacking client-side modals, preserving accessibility focus management and ensuring each action is deep-linkable/reload safe (e.g., `/dashboard?quickAction=flare`).  
3. **AC0.2.3 - Guided empty states:** Each module provides first-run helper text and contextual CTAs when no data exists (no active flares, no logged events today, no recent actions), aligning copy with blueprint guidance and ensuring empty states are reachable via accessibility tree.  
4. **AC0.2.4 - Navigation alignment:** Dashboard title, breadcrumb (if present), and navigation highlighting align with the Track pillar configuration delivered in Story 0.1, ensuring sidebar, bottom tabs, and layout chrome identify Dashboard as the active destination with consistent labels.

## Tasks / Subtasks

- [x] Task 1: Restructure dashboard layout into Today modules (AC: #0.2.1, #0.2.3, #0.2.4)
  - [x] 1.1: Create composable section components (e.g., `<TodayHighlightsCard>`, `<TodayQuickActionsCard>`, `<TodayTimelineCard>`) that wrap `ActiveFlareCards`, `QuickLogButtons`, and `TimelineView`, applying consistent card styles, headings, and responsive stack order.
  - [x] 1.2: Update `src/app/(protected)/dashboard/page.tsx` to use the new section components, ensure semantic landmarks (e.g., `role="region"`, headings hierarchy) and remove redundant container nesting.
  - [x] 1.3: Ensure layout respects Track pillar visuals (spacing, typography) and wires through navigation metadata for breadcrumbs/top bar titles via shared config helpers.
- [x] Task 2: Convert Quick Actions to route-based sheets (AC: #0.2.2, #0.2.4)
  - [x] 2.1: Add route-aware quick action handler (e.g., router query param or nested route) that swaps current modal booleans for navigation-driven overlays, supporting direct linking and browser back navigation.
  - [x] 2.2: Refactor `QuickLogButtons` to emit navigation intents (e.g., `router.push("/dashboard?quickAction=flare")`) and ensure desktop uses drawer/sheet while mobile displays full-screen dialog triggered by the route state.
  - [x] 2.3: Update modal components (`FlareCreationModal`, `MedicationLogModal`, etc.) to observe the new route state, ensuring accessibility focus trapping and closing behavior push route back instead of toggling internal state.
- [x] Task 3: Implement guided empty states (AC: #0.2.1, #0.2.3)
  - [x] 3.1: Add empty state presenters for Highlights (e.g., "No active flares yet"), Quick Actions (explain how to start), and Timeline (encourage logging today), referencing blueprint language and PRD onboarding goals.
  - [x] 3.2: Cover edge cases (offline mode, error states) with fallback messaging and ensure tests assert correct helper text rendering when repositories return empty arrays.
  - [x] 3.3: Document helper copy in UI blueprint or story notes for future localization.
- [x] Task 4: Regression coverage & instrumentation (AC: #0.2.2, #0.2.3, #0.2.4)
  - [x] 4.1: Add component tests validating module ordering, empty state copy, and accessibility labels across breakpoints.
  - [x] 4.2: Add integration test ensuring quick action routes render appropriate sheets and are dismissible via history navigation.
  - [x] 4.3: Instrument navigation events (optional) and update documentation/story blueprint references with new Today layout screenshots or descriptions.

## Dev Notes

### Architecture Context

- Epic 0 prioritizes harmonized navigation and dashboard refresh to prepare for upcoming flare tracking work; Story 0.2 builds directly on Story 0.1 and the UI/UX revamp blueprint. [Source: docs/epics.md#Epic-0-UIUX-Revamp--Navigation-Harmonization-NEW]  
- Blueprint Phase 3 calls for reframing the dashboard into Highlights, Quick Actions, and Timeline modules, converting modal launches into route-based sheets, and adding guided empty states for first-run experience. [Source: docs/ui/ui-ux-revamp-blueprint.md#Phase-3--Dashboard-Refresh]  
- PRD UI goals emphasize an at-a-glance Active Flares dashboard, quick-update flows, and responsive layouts optimized for mobile-first interactions. [Source: docs/PRD.md#User-Interface-Design-Goals]

### Implementation Guidance

- Current dashboard implementation mixes stateful modals and scroll container logic, requiring refactor to route-driven overlays for better accessibility and shareable URLs. [Source: src/app/(protected)/dashboard/page.tsx:1]  
- Shared Track pillar configuration from Story 0.1 should provide dashboard metadata (title, aria labels) to keep navigation surfaces aligned after layout changes. [Source: docs/stories/story-0.1.md]  
- Quick action sheets should reuse existing modal contents but be re-mounted based on route state (e.g., `quickAction` query) to support direct linking, history navigation, and SSR-safe rendering.

### Data & State Considerations

- Highlights module can reuse `ActiveFlareCards` fetching logic; ensure refresh behavior remains intact when switching to section components.  
- Quick Actions continue to rely on Dexie-backed repositories for create flows; validate that route-based overlays correctly await repository operations and surface optimistic updates or refresh triggers.  
- Timeline preview may limit entries to current day; consider existing filters in `TimelineView` and expose props to constrain range if necessary.

### Testing Strategy

- Unit test new section components for semantic structure and ensure empty state copy is localized through constants for deterministic assertions.  
- Integration tests should mount dashboard page with mocked repositories to assert route-based overlays open/close via navigation events.  
- Accessibility checks: verify heading order (H1 for Dashboard, H2 for modules), region landmarks, focus management in overlays, and keyboard dismissal paths.

### References

- docs/epics.md#Epic-0-UIUX-Revamp--Navigation-Harmonization-NEW  
- docs/ui/ui-ux-revamp-blueprint.md#Phase-3--Dashboard-Refresh  
- docs/ui/ui-ux-revamp-blueprint.md#2-Current-Experience-Audit  
- docs/PRD.md#User-Interface-Design-Goals  
- src/app/(protected)/dashboard/page.tsx:1  
- docs/stories/story-0.1.md

## Dev Agent Record

### Context Reference

- `docs/stories/story-context-0.2.xml`

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

N/A

### Completion Notes
**Completed:** 2025-10-21
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing, deployed

### Completion Notes List

- Successfully refactored dashboard into three Today modules (Highlights, Quick Actions, Timeline) with semantic HTML structure using proper region landmarks and heading hierarchy.
- Converted all quick action modals to route-based navigation using query parameters (`/dashboard?quickAction=<type>`), enabling deep linking, browser back button support, and SSR-safe rendering.
- Implemented guided empty states for all modules with appropriate ARIA roles and clear messaging aligned with PRD onboarding goals.
- Created comprehensive test suite with 38 new tests covering module components, empty states, and route-based navigation patterns - all passing.
- Build verified with Next.js 15.5.4 - no TypeScript errors.
- Note: ActiveFlareCards component already provides empty state ("No active flares right now"), which aligns with HighlightsEmptyState. TimelineView component already provides empty state messaging ("No events today yet...").

### File List

Files Created:
- src/components/dashboard/TodayHighlightsCard.tsx
- src/components/dashboard/TodayQuickActionsCard.tsx
- src/components/dashboard/TodayTimelineCard.tsx
- src/components/dashboard/TodayEmptyStates.tsx
- src/components/dashboard/__tests__/TodayModuleCards.test.tsx
- src/components/dashboard/__tests__/TodayEmptyStates.test.tsx
- src/app/(protected)/dashboard/__tests__/RouteBasedQuickActions.test.tsx

Files Modified:
- src/app/(protected)/dashboard/page.tsx
- src/app/(protected)/dashboard/__tests__/page.test.tsx
