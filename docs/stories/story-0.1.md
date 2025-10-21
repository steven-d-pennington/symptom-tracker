# Story 0.1: Consolidate Track Navigation

Status: Ready

## Story

As a user moving between desktop and mobile,
I want the primary navigation to use the same labels and destinations everywhere,
So that I always know where to go to log, review, or manage information.

## Acceptance Criteria

1. **AC0.1**: Sidebar, bottom tabs, and any navigation toggles present the Track / Analyze / Manage / Support pillars in the pillar order defined in the blueprint, with consistent destinations across desktop and mobile surfaces.
2. **AC0.2**: The `/more` hub is removed or redirected; every link previously exposed there is reachable from the pillar navigation without duplication.
3. **AC0.3**: Navigation labels originate from a single shared configuration so route titles, sidebar items, and bottom tabs display the same text across all surfaces (e.g., "Log", "Manage Data").
4. **AC0.4**: Keyboard and screen-reader navigation reflects the new ordering, with aria-labels updated for all navigation elements (sidebar, bottom tabs, menu toggles) to match the shared configuration.

## Tasks / Subtasks

- [ ] Task 1: Create shared navigation configuration (AC: #0.1, #0.3)
  - [ ] 1.1: Define `NavPillar` structure including `id`, `label`, `icon`, `hrefs`, and accessibility metadata.
  - [ ] 1.2: Store configuration in a new module (e.g., `src/config/navigation.ts`) exporting pillar data and helper selectors.
  - [ ] 1.3: Include aria-label text and ordering information to be reused by web and mobile navigation.
- [ ] Task 2: Update Sidebar to consume configuration (AC: #0.1, #0.3)
  - [ ] 2.1: Replace hard-coded `navSections` with data derived from the shared navigation config.
  - [ ] 2.2: Ensure desktop sidebar renders pillars in Track → Analyze → Manage → Support order.
  - [ ] 2.3: Update aria-labels to reflect pillar names and navigation purpose.
- [ ] Task 3: Update Bottom Tabs to consume configuration (AC: #0.1, #0.3)
  - [ ] 3.1: Replace hard-coded `tabs` array with entries sourced from shared config.
  - [ ] 3.2: Render only mobile-valid destinations while preserving pillar order.
  - [ ] 3.3: Align aria-labels and icon assignments with the shared configuration.
- [ ] Task 4: Retire `/more` hub (AC: #0.2)
  - [ ] 4.1: Remove or redirect `src/app/(protected)/more/page.tsx`.
  - [ ] 4.2: Re-home documentation/help links under Support pillar destinations.
  - [ ] 4.3: Add regression test ensuring `/more` no longer appears in rendered navigation.
- [ ] Task 5: Harmonize NavLayout and titles (AC: #0.1, #0.3, #0.4)
  - [ ] 5.1: Derive top bar titles from shared navigation config instead of hard-coded lookup.
  - [ ] 5.2: Ensure `NO_NAV_ROUTES` logic handles support pages relocated from `/more`.
  - [ ] 5.3: Update TopBar aria-labels to match pillar route labels.
- [ ] Task 6: Accessibility verification (AC: #0.4)
  - [ ] 6.1: Confirm keyboard tab order follows pillar ordering on desktop and mobile.
  - [ ] 6.2: Validate screen reader announcements for each nav item using `aria-label`/`aria-current`.
  - [ ] 6.3: Document focus order and aria label updates in QA notes.
- [ ] Task 7: Testing and documentation updates (AC: All)
  - [ ] 7.1: Add unit tests for navigation config helpers (e.g., ordering, lookups).
  - [ ] 7.2: Update existing navigation component tests to assert consistent labels and absence of `/more`.
  - [ ] 7.3: Document new navigation structure in developer notes or blueprint updates if needed.

## Dev Notes

### Architecture Context

- Epic 0 introduces a UI/UX revamp focused on harmonizing navigation as the foundation for forthcoming accessibility and dashboard work before resuming flare tracking efforts. [Source: docs/epics.md#Epic-0-UIUX-Revamp--Navigation-Harmonization-NEW]
- The UI/UX blueprint defines the Track / Analyze / Manage / Support pillar model, the specific routes under each pillar, and the mandate to retire the `/more` hub. [Source: docs/ui/ui-ux-revamp-blueprint.md#3-Proposed-Information-Architecture]
- Story 0.1 unblocks subsequent Epic 0 stories (dashboard refresh, flares simplification, layout harmonization) by delivering consistent navigation labels and entry points.

### Technical Implementation Guidance

```typescript
// src/config/navigation.ts
export interface NavDestination {
  href: string;
  label: string;
  ariaLabel?: string;
  icon?: LucideIcon;
  surface: "desktop" | "mobile" | "all";
}

export interface NavPillar {
  id: "track" | "analyze" | "manage" | "support";
  label: string;
  order: number;
  destinations: NavDestination[];
}

export const NAV_PILLARS: NavPillar[] = [
  // Populate from blueprint mapping
];

export const getNavDestinations = (surface: "desktop" | "mobile") =>
  NAV_PILLARS.flatMap((pillar) =>
    pillar.destinations.filter(
      (destination) =>
        destination.surface === surface || destination.surface === "all",
    ),
  );
```

- Import the shared configuration into `Sidebar.tsx` and `BottomTabs.tsx` to eliminate divergent label sets.
- Update `useActiveRoute` consumers to rely on `aria-label` and `aria-current` derived from the central config for consistent screen reader narration.
- Ensure icon mapping stays centralized (e.g., export a `NAV_ICONS` record) so both sidebar and bottom tabs use identical glyphs.
- Redirect `/more` to the Support pillar landing page (e.g., `/about` or `/support`) until a dedicated support route exists; update Next.js route handling accordingly.

### Accessibility and IA Considerations

- Tab order must follow the pillar list; avoid custom keyboard traps that break the logical reading order.
- Each nav element should surface the pillar in its accessible name, e.g., “Track – Dashboard”.
- Confirm that top bar breadcrumbs or highlights update automatically when navigation labels change, preventing stale titles.
- Coordinate with Story 0.4 (navigation title harmonization) to reuse the configuration for layout metadata, reducing duplication.

### Project Structure Notes

- **Files to Create:** `src/config/navigation.ts` (shared pillar configuration and helpers).
- **Files to Modify:** `src/components/navigation/Sidebar.tsx`, `src/components/navigation/BottomTabs.tsx`, `src/components/navigation/NavLayout.tsx`, `src/components/navigation/TopBar.tsx`, `src/components/navigation/hooks/useActiveRoute.tsx`, `src/app/(protected)/more/page.tsx` (remove or redirect), related navigation tests under `src/__tests__/`.
- Maintain TypeScript strict mode by providing explicit types for configuration exports and component props.

### Testing Standards Summary

- **Unit Tests:** Validate config helpers (ordering, label lookups) and ensure `getNavDestinations` filters correctly per surface.
- **Component Tests:** Use React Testing Library to assert sidebar and bottom tabs render Track / Analyze / Manage / Support in order with consistent labels; verify `/more` no longer appears.
- **Accessibility Tests:** Include axe checks and keyboard navigation flows to confirm aria-labels and `aria-current` behavior align with the shared config.
- **Regression Checks:** Run `npm run lint` and `npm test` to ensure navigation updates do not break existing suites or TypeScript types.

### References

- [Source: docs/epics.md#Epic-0-UIUX-Revamp--Navigation-Harmonization-NEW] – Story definition and acceptance criteria.
- [Source: docs/ui/ui-ux-revamp-blueprint.md#2-1-Navigation-Surfaces-Desktop--Mobile] – Current navigation audit informing required changes.
- [Source: docs/ui/ui-ux-revamp-blueprint.md#3-2-Navigation-Mapping] – Pillar structure and route mapping to implement.

## Dev Agent Record

### Context Reference

- docs/stories/story-context-0.1.xml

### Agent Model Used

To be recorded during implementation.

### Debug Log References

### Completion Notes List

### File List
