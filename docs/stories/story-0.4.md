# Story 0.4: Navigation Title & Layout Harmonization

Status: Ready

## Story

As a developer maintaining navigation,
I want a single source of truth for route titles and layout behaviors,
So that future pages automatically display the right heading and navigation state.

## Acceptance Criteria

1. Create/shared configuration defining route metadata (title, pillar, mobile/desktop visibility) consumed by `NavLayout`, `TopBar`, Sidebar, and Bottom Tabs.
2. Top bar titles and breadcrumbs automatically update based on the shared config.
3. Route configuration supports hiding nav for special pages (onboarding, landing) without duplicated logic.
4. Unit tests cover key routes to prevent regressions (e.g., verifying "Log" renders the expected title on mobile and desktop).

## Tasks / Subtasks

- [ ] Task 1: Verify shared navigation configuration completeness
  - [ ] Review existing `src/config/navigation.ts` NAV_PILLARS structure
  - [ ] Confirm all route metadata includes title, pillar, and surface visibility
  - [ ] Validate pillar ordering (Track → Analyze → Manage → Support)
- [ ] Task 2: Audit component consumption of shared config
  - [ ] Verify `NavLayout` uses `getPageTitle()` for all routes
  - [ ] Confirm `TopBar` receives and displays titles from NavLayout
  - [ ] Ensure `Sidebar` consumes `getNavPillars("desktop")`
  - [ ] Validate `BottomTabs` uses `getNavDestinations("mobile")`
- [ ] Task 3: Implement navigation visibility logic
  - [ ] Add `NO_NAV_ROUTES` configuration to shared nav config
  - [ ] Update `NavLayout` to use centralized route visibility logic
  - [ ] Remove duplicated navigation hiding logic from individual components
- [ ] Task 4: Add integration tests for title rendering
  - [ ] Create tests verifying "Log" renders correct title on mobile and desktop
  - [ ] Add tests for "Dashboard" title consistency across surfaces
  - [ ] Test navigation visibility for special routes (onboarding, landing)
  - [ ] Verify breadcrumb rendering uses shared config
- [ ] Task 5: Update documentation and validate
  - [ ] Update component JSDoc to reference shared navigation config
  - [ ] Add configuration examples to developer docs
  - [ ] Run full test suite to ensure no regressions

## Dev Notes

- Relevant architecture patterns and constraints: Brownfield enhancement maintaining existing Next.js/App Router structure. Shared configuration follows existing repository pattern used in other config files.

- Source tree components to touch:
  - `src/config/navigation.ts` - May need to add navigation visibility configuration
  - `src/components/navigation/NavLayout.tsx` - Ensure uses shared config for route visibility
  - `src/components/navigation/TopBar.tsx` - Already consumes title via props
  - `src/components/navigation/Sidebar.tsx` - Already uses `getNavPillars("desktop")`
  - `src/components/navigation/BottomTabs.tsx` - Already uses `getNavDestinations("mobile")`
  - Test files: Add integration tests to `__tests__` directories

- Testing standards summary: Use React Testing Library with accessible queries for component integration tests. Follow existing Jest + RTL patterns in navigation component tests. Maintain 80% coverage threshold.

### Project Structure Notes

- Alignment with unified project structure: Follows existing config pattern (`src/config/`) and component organization (`src/components/navigation/`). No structural changes needed.
- Detected conflicts or variances: Navigation config already exists from Story 0.1; this story validates and completes the harmonization.

### References

- Cite all technical details with source paths and sections
- [Source: docs/ui/ui-ux-revamp-blueprint.md#3-Proposed-Information-Architecture] - Pillar structure and navigation guidelines
- [Source: docs/epics.md#Epic-0:-UI/UX-Revamp-&-Navigation-Harmonization] - Story 0.4 acceptance criteria
- [Source: src/config/navigation.ts] - Existing shared navigation configuration
- [Source: src/components/navigation/NavLayout.tsx] - Current navigation layout implementation
- [Source: src/config/__tests__/navigation.test.ts] - Existing navigation configuration tests

## Dev Agent Record

### Context Reference

- Path: docs/stories/story-context-0.4.xml

### Agent Model Used

Amp

### Debug Log References

### Completion Notes List

### File List
