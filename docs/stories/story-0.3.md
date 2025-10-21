# Story 0.3: Flares View Simplification

Status: Ready

## Story

As a user reviewing flare activity,
I want an approachable flares view that grows with my needs,
so that I am not overwhelmed the first time I open it but can still access map and stats when ready.

## Acceptance Criteria

1. **AC0.3.1 — Cards-first entry with saved preference:** Visiting `/flares` loads a cards-only layout with a prominent CTA inviting users to enable map or split view; when a user toggles the layout, the choice persists across sessions via their Dexie-backed preferences.
2. **AC0.3.2 — Progressive body map guidance:** Body map instructions surface inline tips and context-aware hints only after the user opts in, maintain keyboard focus order, and prep the interaction model needed for Story 1.6 accessibility updates.
3. **AC0.3.3 — Collapsible insight panel:** Flares statistics and filters live inside a collapsible summary panel that defaults to closed, exposes grouped analytics on demand, and supports screen-reader announcements for state changes.
4. **AC0.3.4 — Accessible controls and navigation:** All CTA buttons, toggles, and tabs (cards/map/split, summary panel, body map helpers) are reachable via keyboard, expose descriptive `aria-*` metadata, and include regression coverage for focus management.

## Tasks / Subtasks

- [ ] Task 1: Default cards-first layout and preference persistence (AC: #0.3.1)
  - [ ] 1.1: Refactor `src/app/(protected)/flares/page.tsx` to initialize `viewMode` as cards-only, restructure the hero section copy, and add CTA buttons that introduce map/split view when the user is ready.
  - [ ] 1.2: Create CTA styling aligned with blueprint language (“Explore map view”, “Show split layout”), wiring buttons to update `viewMode` and visually emphasize the recommended next step.
  - [ ] 1.3: Extend `UserPreferences` (Dexie schema + migration) with a `flareViewMode` field, hydrate the initial `viewMode` from `userRepository.getOrCreateCurrentUser()`, and persist changes through `userRepository.updatePreferences`.
- [ ] Task 2: Progressive body map guidance (AC: #0.3.2)
  - [ ] 2.1: Introduce a guidance component (e.g., `FlaresMapIntro`) that reveals tips after the CTA is activated, explaining how to use Body Map and map/filter interactions.
  - [ ] 2.2: Ensure the guidance component manages focus, works with keyboard shortcuts, and sets up skip links or helper anchors for Screen Reader users.
  - [ ] 2.3: Update `BodyMapViewer` integration to highlight relevant regions when hints are active without forcing split view unless the user selects it.
- [ ] Task 3: Collapsible summary panel (AC: #0.3.3)
  - [ ] 3.1: Build a `FlaresSummaryPanel` component that displays stats (total, trend counts, average severity) and filter controls inside a collapsible disclosure.
  - [ ] 3.2: Default the panel to collapsed, provide accessible toggle labels/state announcements, and ensure the panel contents match blueprint grouping guidance.
  - [ ] 3.3: Wire the panel to existing `stats` and `selectedRegion` data, keeping memoization/performance in check for larger datasets.
- [ ] Task 4: Accessibility and keyboard parity (AC: #0.3.2, #0.3.4)
  - [ ] 4.1: Audit existing controls (`BodyViewSwitcher`, cards filters, CTA buttons) and update `aria-pressed`, `aria-expanded`, `aria-controls`, and focus outlines for the new layout states.
  - [ ] 4.2: Add keyboard shortcuts or shortcuts documentation where appropriate (e.g., cycling view modes with arrow keys) without conflicting with Story 1.6 scope.
  - [ ] 4.3: Validate focus management when modals open/close and when toggling between cards/map/split modes.
- [ ] Task 5: Regression coverage (AC: #0.3.1-#0.3.4)
  - [ ] 5.1: Create component tests for `FlaresPage` view toggles, ensuring default cards-only state and persisted preference across renders (use `fake-indexeddb` to simulate Dexie).
  - [ ] 5.2: Add tests for `FlaresSummaryPanel` covering collapse/expand behavior, stats rendering, and accessible announcements.
  - [ ] 5.3: Add keyboard/focus integration tests verifying CTA tab order, body map guidance reveal, and summary panel toggling via keyboard-only interaction.

## Dev Notes

- Story 0.3 builds directly on Epic 0’s UX revamp to soften the flare management entry point before accessibility hardening lands in Story 1.6. [Source: docs/epics.md#Story-0.3-Flares-View-Simplification]
- Blueprint Phase 4 mandates cards-first onboarding, progressive hints, and map intro copy aligned with the Track pillar messaging. [Source: docs/ui/ui-ux-revamp-blueprint.md#Phase-4--Flares-Experience-Hardening]
- PRD requirements emphasize capturing flare lifecycle insights while keeping advanced analytics optional until the user opts in. [Source: docs/PRD.md#Requirements]
- The current `/flares` implementation defaults to the split view with simultaneous cards, map, and summary stats, so refactors must unwind the default state without breaking existing Dexie queries. [Source: src/app/(protected)/flares/page.tsx]
- Persisting `flareViewMode` via `userRepository` ensures consistency with prior preference handling (e.g., symptom filters, food favorites). [Source: src/lib/repositories/userRepository.ts]
- Dexie versioning currently sits at v11; adding a new preference field requires bumping to v12 with a migration that seeds `flareViewMode = "cards"` for existing users. [Source: src/lib/db/client.ts]

### Implementation Guidance

- Reuse `cn` utility classes for CTA styling and match typography to Track pillar conventions introduced in Story 0.1. [Source: src/lib/utils/cn.ts]
- Favor composable components (`FlaresSummaryPanel`, `FlaresMapIntro`) under `src/components/flares/` to keep `/flares/page.tsx` declarative and testable.
- When integrating with `BodyMapViewer`, expose hint states via props rather than mutating global context to keep React Suspense compatibility for future route streaming.
- Ensure `flareRepository.getActiveFlaresWithTrend` remains the single source for stats; avoid recomputing heavy analytics on every render.

### Data & State Considerations

- Extend `UserPreferences` type and Dexie schema (including typings in `src/lib/db/schema.ts`) for the new preference, mirroring existing pattern for `foodFavorites`.
- Use `useEffect` hooks guarded by `userId` to hydrate and persist view mode; prefer `useCallback` to memoize persistence handlers.
- Consider storing progressive guidance dismissal in memory (state) for the session; long-term persistence can wait for future instrumentation story (0.5).

### Testing Strategy

- Use React Testing Library with `fake-indexeddb` to simulate Dexie and assert persisted preferences across rerenders.
- Snapshot test the cards-only layout to detect regressions in CTA messaging or summary positioning.
- Leverage `user-event` keyboard utilities to verify tab order, space/enter toggles, and `aria-expanded` transitions for the summary panel.

### Project Structure Notes

- Page entry: `src/app/(protected)/flares/page.tsx`
- Shared flare components: `src/components/flares/*`
- Body map helpers: `src/components/body-mapping/*`
- Dexie schema & migrations: `src/lib/db/schema.ts`, `src/lib/db/client.ts`
- Repository persistence: `src/lib/repositories/userRepository.ts`, `src/lib/repositories/flareRepository.ts`

### References

- docs/epics.md#Story-0.3-Flares-View-Simplification
- docs/ui/ui-ux-revamp-blueprint.md#Phase-4--Flares-Experience-Hardening
- docs/PRD.md#Requirements
- src/app/(protected)/flares/page.tsx
- src/lib/repositories/userRepository.ts
- src/lib/db/schema.ts
- src/lib/db/client.ts

## Dev Agent Record

### Context Reference

- `docs/stories/story-context-0.3.xml`

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
