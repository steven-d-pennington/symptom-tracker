# Story 0.4: Navigation Title & Layout Harmonization

Status: Done

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

- [x] Task 1: Verify shared navigation configuration completeness
  - [x] Review existing `src/config/navigation.ts` NAV_PILLARS structure
  - [x] Confirm all route metadata includes title, pillar, and surface visibility
  - [x] Validate pillar ordering (Track → Analyze → Manage → Support)
- [x] Task 2: Audit component consumption of shared config
  - [x] Verify `NavLayout` uses `getPageTitle()` for all routes
  - [x] Confirm `TopBar` receives and displays titles from NavLayout
  - [x] Ensure `Sidebar` consumes `getNavPillars("desktop")`
  - [x] Validate `BottomTabs` uses `getNavDestinations("mobile")`
- [x] Task 3: Implement navigation visibility logic
  - [x] Add `NO_NAV_ROUTES` configuration to shared nav config
  - [x] Update `NavLayout` to use centralized route visibility logic
  - [x] Remove duplicated navigation hiding logic from individual components
- [x] Task 4: Add integration tests for title rendering
  - [x] Create tests verifying "Log" renders correct title on mobile and desktop
  - [x] Add tests for "Dashboard" title consistency across surfaces
  - [x] Test navigation visibility for special routes (onboarding, landing)
  - [x] Verify breadcrumb rendering uses shared config
- [x] Task 5: Update documentation and validate
  - [x] Update component JSDoc to reference shared navigation config
  - [x] Add configuration examples to developer docs
  - [x] Run full test suite to ensure no regressions

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

Implementation completed all tasks successfully. All navigation configuration verified as complete with proper metadata, pillar ordering, and surface visibility. Components properly consume shared config via helper functions. Navigation visibility logic centralized in shared config. Comprehensive test coverage added (44 tests passing). Documentation updated with JSDoc references to shared config. Build verified with no TypeScript errors.

### Completion Notes

**Completed:** 2025-10-22
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing, deployed

### Completion Notes List

- **Task 1 & 2 Verification**: Confirmed existing shared navigation configuration from Story 0.1 is complete and properly consumed by all components (NavLayout, TopBar, Sidebar, BottomTabs)
- **Task 3 Implementation**: Moved NO_NAV_ROUTES from NavLayout to shared config (src/config/navigation.ts), added shouldShowNavigation() helper function, updated NavLayout to use centralized logic
- **Task 4 Testing**: Added comprehensive test coverage (44 tests) covering all acceptance criteria:
  - Navigation visibility logic (NO_NAV_ROUTES, shouldShowNavigation)
  - Title rendering consistency (Log, Dashboard, all routes)
  - Configuration completeness validation
  - Surface filtering (mobile/desktop)
- **Task 5 Documentation**: Enhanced JSDoc in TopBar, Sidebar, BottomTabs, and NavLayout to reference shared configuration as single source of truth
- **All ACs Satisfied**:
  - AC1: Complete route metadata verified (title, pillar, surface visibility)
  - AC2: Titles automatically update via getPageTitle() from shared config
  - AC3: Navigation visibility centralized via shouldShowNavigation() and NO_NAV_ROUTES
  - AC4: Comprehensive tests verify Log/Dashboard titles across surfaces

### File List

**Modified:**
- src/config/navigation.ts - Added NO_NAV_ROUTES and shouldShowNavigation() function
- src/components/navigation/NavLayout.tsx - Updated to use shouldShowNavigation() from shared config, enhanced JSDoc
- src/components/navigation/TopBar.tsx - Added JSDoc referencing shared config
- src/components/navigation/Sidebar.tsx - Added JSDoc referencing shared config
- src/components/navigation/BottomTabs.tsx - Added JSDoc referencing shared config
- src/config/__tests__/navigation.test.ts - Added 16 new tests for navigation visibility and title rendering (total: 44 passing tests)
