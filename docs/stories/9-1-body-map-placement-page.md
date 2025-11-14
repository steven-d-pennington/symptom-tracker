# Story 9.1: Body Map Placement Page

Status: ready-for-dev

## Story

As a user tracking HS flares,
I want to select flare locations on a full-page body map,
so that I can precisely mark where my flares are occurring using a spacious, mobile-friendly interface.

## Acceptance Criteria

1. **AC9.1.1 — Route `/flares/place` exists and renders:** System shall provide route `/flares/place` that renders a full-page body map placement interface. Route shall be accessible from dashboard and body-map views. Page shall parse URL params: `source` (required), `layer` (optional, defaults to 'flares'). [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#FR9.1.1, docs/Epic-9-Architecture-Addendum.md#Route-Definitions]

2. **AC9.1.2 — Layer selector displayed conditionally:** When `source=dashboard`, display layer selector at top of page with tabs: Flares | Pain | Custom. When `source=body-map`, hide layer selector (layer inherited from current view). Selected layer defaults to 'flares' when entered from dashboard. [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#FR9.1.2, docs/Epic-9-Architecture-Addendum.md#FlareBodyMapPlacementPage]

3. **AC9.1.3 — Body map renders with interactive region selection:** Page shall render full-page body map using existing `BodyMapInteractive` component. User can click any body region → region fills viewport (zoom behavior from Epic 3.7). Body map shall support all regions from existing schema. [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#FR9.1.3, docs/Epic-9-Architecture-Addendum.md#Component-Reuse]

4. **AC9.1.4 — Multi-marker placement within single region:** After region selected, user shall be able to place multiple markers within that region by tapping/clicking. System shall capture precise X/Y coordinates for each marker relative to region SVG. Markers shall render with visual feedback (e.g., red dots with border). [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#FR9.1.3]

5. **AC9.1.5 — "Next" button enabled after marker placement:** "Next" button shall be disabled initially. Button becomes enabled when at least 1 marker has been placed. Button shall display marker count when enabled: "Next (2 markers)" if 2 markers placed. [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#FR9.1.3]

6. **AC9.1.6 — Navigation to details page with marker data:** Clicking "Next" shall navigate to `/flares/details` with URL params: `source`, `layer`, `bodyRegionId`, `markerCoordinates` (JSON array of {x, y} objects). Example: `/flares/details?source=dashboard&layer=flares&bodyRegionId=left-armpit&markerCoordinates=[{"x":0.42,"y":0.67}]`. [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#FR9.1.3, docs/Epic-9-Architecture-Addendum.md#Route-Definitions]

7. **AC9.1.7 — Dashboard entry point wiring:** Dashboard "Flare" quick action button shall navigate to `/flares/place?source=dashboard` (not open modal). Remove any `CreateFlareModal` state/handlers from dashboard page. [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#FR9.1.1, docs/Epic-9-Architecture-Addendum.md#Entry-Point-Integration]

8. **AC9.1.8 — Mobile-first responsive design:** Full-page layout shall work on mobile (iOS/Android), tablet, and desktop browsers. Touch targets shall meet WCAG 2.1 Level AA (44x44px minimum). Body map shall be scrollable/zoomable on small screens without modal scroll container conflicts. [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#NFR9.3-9.4]

9. **AC9.1.9 — Accessibility compliance:** All interactive elements shall have proper ARIA labels. Page transition shall announce "Flare placement" to screen readers via aria-live region. Keyboard navigation: Tab to region/markers, Enter to select, Escape to cancel/return. [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#NFR9.6-9.8]

10. **AC9.1.10 — Analytics event tracking:** Fire `flare_creation_started` event when page loads with source param. Fire `flare_creation_placement_completed` event when "Next" clicked with markerCount. Fire `flare_creation_abandoned` event if user navigates away without completing. [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md#FR9.5.1, docs/Epic-9-Architecture-Addendum.md#Analytics-Tracking]

## Tasks / Subtasks

- [ ] Task 1: Create route structure and page component (AC: #9.1.1)
  - [ ] 1.1: Create directory structure: `src/app/(protected)/flares/place/`
  - [ ] 1.2: Create `page.tsx` file with `FlareBodyMapPlacementPage` component
  - [ ] 1.3: Import Next.js routing hooks: `useRouter`, `useSearchParams`
  - [ ] 1.4: Parse URL params: `source` (required), `layer` (optional, default='flares')
  - [ ] 1.5: Add param validation: redirect to `/dashboard` if source invalid
  - [ ] 1.6: Set up page layout with full-viewport height (no scroll container)
  - [ ] 1.7: Add TypeScript types for URL params: `FlareCreationSource`, `LayerType`

- [ ] Task 2: Implement layer selector with conditional rendering (AC: #9.1.2)
  - [ ] 2.1: Import existing `LayerSelector` component from Epic 5
  - [ ] 2.2: Add conditional rendering: show if `source === 'dashboard'`, hide if `source === 'body-map'`
  - [ ] 2.3: Initialize selectedLayer state from URL param or default to 'flares'
  - [ ] 2.4: Handle layer change: update local state (no URL change yet - preserved for details page)
  - [ ] 2.5: Style layer selector at top of page with proper spacing
  - [ ] 2.6: Test layer selector visibility based on source param

- [ ] Task 3: Integrate body map with region selection (AC: #9.1.3)
  - [ ] 3.1: Import `BodyMapInteractive` component from Epic 1
  - [ ] 3.2: Import `RegionDetailView` component from Epic 3.7
  - [ ] 3.3: Set up state: `selectedRegion`, `isRegionZoomed`
  - [ ] 3.4: Handle region click: set selectedRegion, trigger zoom (reuse Epic 3.7 behavior)
  - [ ] 3.5: Render body map in main content area (full-page, no modal wrapper)
  - [ ] 3.6: Test region selection and zoom on all supported body regions

- [ ] Task 4: Implement multi-marker placement (AC: #9.1.4)
  - [ ] 4.1: Set up markers state: `markers: Array<{x: number, y: number, regionId: string}>`
  - [ ] 4.2: Add click handler to zoomed region view: capture x/y coordinates relative to region SVG
  - [ ] 4.3: On each click, append new marker to markers array
  - [ ] 4.4: Render markers as visual indicators (red dots with white border, 12px diameter)
  - [ ] 4.5: Add hover state for markers (scale up slightly, show coordinates on hover)
  - [ ] 4.6: Implement marker removal: click existing marker to remove from array
  - [ ] 4.7: Test multi-marker placement: add 5+ markers, verify coordinates captured correctly

- [ ] Task 5: Implement "Next" button with marker count (AC: #9.1.5)
  - [ ] 5.1: Create "Next" button component at bottom of page (fixed position or in footer)
  - [ ] 5.2: Implement disabled state logic: `disabled={markers.length === 0}`
  - [ ] 5.3: Display marker count in button text: "Next" → "Next (2 markers)" when markers.length > 0
  - [ ] 5.4: Style button with primary color, large touch target (48px height minimum)
  - [ ] 5.5: Add loading state for navigation transition
  - [ ] 5.6: Test button enable/disable behavior, marker count display

- [ ] Task 6: Implement navigation to details page (AC: #9.1.6)
  - [ ] 6.1: Create handleNext function to build details page URL
  - [ ] 6.2: Construct URL params object: source, layer, bodyRegionId, markerCoordinates (JSON.stringify array)
  - [ ] 6.3: Use `router.push()` to navigate to `/flares/details?${params}`
  - [ ] 6.4: Test URL construction: verify params are correctly encoded and parseable
  - [ ] 6.5: Test navigation: ensure details page receives data correctly
  - [ ] 6.6: Handle edge case: if markers array empty, prevent navigation (button should be disabled)

- [ ] Task 7: Wire dashboard entry point (AC: #9.1.7)
  - [ ] 7.1: Open `src/app/(protected)/dashboard/page.tsx`
  - [ ] 7.2: Locate "Flare" quick action button
  - [ ] 7.3: Remove any CreateFlareModal state/handlers (e.g., `showCreateModal`, `setShowCreateModal`)
  - [ ] 7.4: Update button onClick: `router.push('/flares/place?source=dashboard')`
  - [ ] 7.5: Remove `CreateFlareModal` component import and JSX
  - [ ] 7.6: Test dashboard → placement page navigation

- [ ] Task 8: Implement mobile-responsive design (AC: #9.1.8)
  - [ ] 8.1: Add responsive styles for mobile (320px+), tablet (768px+), desktop (1024px+)
  - [ ] 8.2: Ensure all touch targets are minimum 44x44px (buttons, markers, region selection)
  - [ ] 8.3: Test body map rendering on iPhone, Android, iPad, desktop browsers
  - [ ] 8.4: Verify zoom/pan controls work on touch devices
  - [ ] 8.5: Test landscape orientation on mobile
  - [ ] 8.6: Ensure no scroll container conflicts (body map should zoom, not scroll weirdly)

- [ ] Task 9: Implement accessibility features (AC: #9.1.9)
  - [ ] 9.1: Add page-level ARIA: `<main role="main" aria-label="Flare placement">`
  - [ ] 9.2: Add aria-live region for page announcements
  - [ ] 9.3: Add ARIA labels to layer selector tabs
  - [ ] 9.4: Implement keyboard navigation: Tab to regions, Enter to select, Escape to return
  - [ ] 9.5: Add aria-label to "Next" button with marker count
  - [ ] 9.6: Test with screen reader (NVDA, VoiceOver, TalkBack)
  - [ ] 9.7: Test keyboard-only navigation (no mouse)

- [ ] Task 10: Implement analytics tracking (AC: #9.1.10)
  - [ ] 10.1: Create analytics utility function: `trackFlareCreationEvent(event, data)`
  - [ ] 10.2: Fire `flare_creation_started` on page load (useEffect with source param)
  - [ ] 10.3: Fire `flare_creation_placement_completed` when "Next" clicked (include markerCount)
  - [ ] 10.4: Fire `flare_creation_abandoned` on page unmount if not navigated to details
  - [ ] 10.5: Test analytics events fire correctly in dev tools
  - [ ] 10.6: Add event timestamp, source, and markerCount to event data

- [ ] Task 11: Write unit and integration tests
  - [ ] 11.1: Create test file: `src/app/(protected)/flares/place/__tests__/page.test.tsx`
  - [ ] 11.2: Test: Page renders with body map
  - [ ] 11.3: Test: Layer selector shown when source=dashboard, hidden when source=body-map
  - [ ] 11.4: Test: Region click triggers zoom
  - [ ] 11.5: Test: Marker placement adds to markers array
  - [ ] 11.6: Test: "Next" button disabled when no markers, enabled when markers exist
  - [ ] 11.7: Test: "Next" button displays marker count correctly
  - [ ] 11.8: Test: Navigation to details page with correct URL params
  - [ ] 11.9: Test: Analytics events fire on load, next click, and unmount
  - [ ] 11.10: Test: Invalid source param redirects to dashboard
  - [ ] 11.11: Run all tests and ensure 100% pass rate

## Dev Notes

### Architecture & Integration Points

This story establishes the foundation for Epic 9's full-page flare creation flow by creating the body map placement page. Key architectural decisions:

**URL-Based State Management:**
- Primary state mechanism: URL params (`source`, `layer`)
- Page-local state: `markers`, `selectedRegion`, `isRegionZoomed`
- Navigation context preserved via `source` param throughout flow

**Component Reuse Strategy:**
- `BodyMapInteractive` (Epic 1): Proven body map rendering
- `RegionDetailView` (Epic 3.7): Region zoom and multi-marker placement logic
- `LayerSelector` (Epic 5): Layer tab selection
- No modifications to existing components - adapts to their APIs

**Entry Point:** Dashboard "Flare" button → `/flares/place?source=dashboard`

### Learnings from Previous Story (Story 8.2)

**From Story 8.2 (Lifecycle Stage UI Components & Integration)**

- **Review Outcome:** Changes Requested - Tests written but not executed (Task 6.13 false completion)
- **Critical Lesson:** DO NOT mark test tasks complete without actually running tests and documenting pass/fail results
- **Testing Pattern:** Story 8.2 created comprehensive test suites (17 test cases) - follow this pattern for Story 9.1
- **Component Reuse:** Story 8.2 successfully reused lifecycle utilities - Story 9.1 will reuse body map components
- **JSDOM Compatibility:** Story 8.2 encountered Radix UI test issues - avoid similar issues by testing UI components with proper polyfills
- **Accessibility:** Story 8.2 implemented 44x44px touch targets - apply same standard here
- **Mobile Testing:** Story 8.2 marked device testing complete without documentation - ensure actual device testing with screenshots/notes
- **UI Integration:** Story 8.2 integrated LifecycleStageSelector into modals - Story 9.1 will integrate body map into full-page layout

**Action Items Applied to Story 9.1:**
- **Task 11.11 (Run tests):** Will execute tests AND document results before marking complete
- **Task 8.3 (Device testing):** Will test on actual devices and document results with device models, OS versions, screenshots
- **Accessibility:** Follow WCAG 2.1 Level AA standards established in Story 8.2
- **Component Testing:** Create comprehensive test suite covering all acceptance criteria

[Source: stories/8-2-lifecycle-stage-ui-components-and-integration.md#Senior-Developer-Review]

### Component Architecture

**FlareBodyMapPlacementPage Component:**
```typescript
// src/app/(protected)/flares/place/page.tsx

interface FlareBodyMapPlacementPageProps {
  // No props - reads from URL params via useSearchParams()
}

// URL Param Types
type FlareCreationSource = 'dashboard' | 'body-map';
type LayerType = 'flares' | 'pain' | 'custom';

// State Management
const [selectedLayer, setSelectedLayer] = useState<LayerType>('flares');
const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
const [isRegionZoomed, setIsRegionZoomed] = useState(false);
const [markers, setMarkers] = useState<Array<{x: number, y: number, regionId: string}>>([]);

// Navigation
const handleNext = () => {
  const params = new URLSearchParams({
    source,
    layer: selectedLayer,
    bodyRegionId: selectedRegion!,
    markerCoordinates: JSON.stringify(markers.map(m => ({x: m.x, y: m.y})))
  });
  router.push(`/flares/details?${params.toString()}`);
};
```

### UI/UX Design Principles

**Progressive Disclosure:**
- Step 1: Select region (body map overview)
- Step 2: Place markers (zoomed region view)
- Step 3: Proceed to details (enabled after marker placement)

**Mobile-First:**
- Full viewport height (no cramped modal)
- Large touch targets (44x44px minimum)
- No nested scroll containers (body map zooms, doesn't scroll)

**Visual Feedback:**
- Markers render immediately on tap
- Marker count displayed in "Next" button
- Hover state for markers (desktop)

### Project Structure Notes

**Files to Create:**
```
src/app/(protected)/flares/place/
├── page.tsx                           (NEW - FlareBodyMapPlacementPage component)
└── __tests__/
    └── page.test.tsx                  (NEW - Unit and integration tests)
```

**Files to Modify:**
```
src/app/(protected)/dashboard/page.tsx (MODIFIED - Wire "Flare" button to route)
```

**Component Dependencies:**
- `BodyMapInteractive` (Epic 1) - src/components/body-mapping/BodyMapInteractive.tsx
- `RegionDetailView` (Epic 3.7) - src/components/body-mapping/RegionDetailView.tsx
- `LayerSelector` (Epic 5) - src/components/body-mapping/LayerSelector.tsx

### Implementation Order

1. **Create page structure** - Route, component skeleton, URL param parsing
2. **Integrate body map** - BodyMapInteractive + RegionDetailView
3. **Add layer selector** - Conditional rendering based on source
4. **Implement marker placement** - State management, coordinate capture, rendering
5. **Add "Next" button** - Disable logic, marker count display, navigation
6. **Wire dashboard entry point** - Remove modal, add route navigation
7. **Mobile optimization** - Responsive styles, touch targets
8. **Accessibility** - ARIA labels, keyboard navigation, screen reader announcements
9. **Analytics** - Event tracking on load, next, abandon
10. **Testing** - Unit tests, integration tests, device testing

### Testing Strategy

**Unit Tests:**
- URL param parsing and validation
- Layer selector conditional rendering
- Marker placement state management
- "Next" button enable/disable logic
- Navigation URL construction

**Integration Tests:**
- Dashboard → placement page flow
- Region selection → zoom
- Multi-marker placement
- Navigation to details page with marker data
- Analytics event firing

**Device Testing:**
- iPhone (iOS Safari)
- Android phone (Chrome)
- iPad (Safari)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Document: device model, OS version, screenshots, any issues found

**Accessibility Testing:**
- Screen reader testing (NVDA, VoiceOver, TalkBack)
- Keyboard-only navigation
- ARIA label verification
- Touch target size verification (44x44px minimum)

### References

- [Source: docs/Epic-9-Flare-Creation-UX-Redesign-PRD.md] - Product requirements and user journeys
- [Source: docs/Epic-9-Architecture-Addendum.md] - Routing architecture and component reuse strategy
- [Source: stories/8-2-lifecycle-stage-ui-components-and-integration.md] - Previous story learnings and review findings
- [Source: src/components/body-mapping/BodyMapInteractive.tsx] - Body map component API
- [Source: src/components/body-mapping/RegionDetailView.tsx] - Region zoom and marker placement logic
- [Source: src/components/body-mapping/LayerSelector.tsx] - Layer selection component

## Dev Agent Record

### Context Reference

- [9-1-body-map-placement-page.context.xml](./9-1-body-map-placement-page.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

**Date: 2025-11-14 (Story Creation)**
- Created Story 9.1 - Body Map Placement Page
- Defined 10 acceptance criteria for full-page body map placement
- Created 11 tasks with detailed subtasks (70+ total subtasks)
- Incorporated learnings from Story 8.2 (test execution, device testing, accessibility)
- Added comprehensive Dev Notes with component architecture and URL state management
- Story ready for development
- Status: drafted
