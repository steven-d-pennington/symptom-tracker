# Story 1.6: Body Map Accessibility and Keyboard Navigation

Status: Ready

## Story

As a user with accessibility needs,
I want to navigate and interact with the body map using keyboard and screen readers,
So that I can use the precision tracking features regardless of my input method.

## Acceptance Criteria

1. **AC1:** Tab key navigates between body regions in logical order (top-to-bottom, left-to-right anatomical flow)
2. **AC2:** Enter/Space key selects a focused region
3. **AC3:** Arrow keys allow fine-tuned positioning within a zoomed region for coordinate marking
4. **AC4:** Screen readers announce region names, flare counts, and current interaction context
5. **AC5:** ARIA labels provide descriptive context for all interactive elements (regions, zoom controls, markers)
6. **AC6:** Keyboard shortcuts for zoom (+/- keys) and pan (arrow keys when zoomed, before region selection)
7. **AC7:** Focus indicators clearly show current keyboard position with visible outline and high contrast

## Tasks / Subtasks

- [ ] Task 1: Implement keyboard navigation for body regions (AC: #1, #2)
  - [ ] 1.1: Add tabIndex management to BodyRegions components (FrontBody, BackBody)
  - [ ] 1.2: Implement logical tab order (head → neck → shoulders → arms → torso → groin → legs)
  - [ ] 1.3: Add onKeyDown handler for Enter/Space to trigger region selection
  - [ ] 1.4: Ensure tab navigation works within BodyMapZoom's TransformComponent
  - [ ] 1.5: Test tab order matches anatomical flow across all body views

- [ ] Task 2: Implement arrow key coordinate positioning in zoomed regions (AC: #3)
  - [ ] 2.1: Add arrow key listener to CoordinateCapture component when region is selected and zoomed
  - [ ] 2.2: Implement 1% coordinate adjustment per arrow key press (0.01 units on 0-1 scale)
  - [ ] 2.3: Display crosshair/pin at keyboard-adjusted coordinates
  - [ ] 2.4: Add visual feedback showing current coordinate position (e.g., tooltip with x/y values)
  - [ ] 2.5: Ensure coordinate bounds checking (clamp to 0-1 range)

- [ ] Task 3: Add comprehensive ARIA labels and screen reader support (AC: #4, #5)
  - [ ] 3.1: Add aria-label to each body region SVG path (e.g., "Left Groin, 2 active flares")
  - [ ] 3.2: Implement dynamic ARIA label updates when flare count changes
  - [ ] 3.3: Add aria-live region for announcing interaction state changes
  - [ ] 3.4: Add ARIA labels to zoom controls ("Zoom In", "Zoom Out", "Reset Zoom")
  - [ ] 3.5: Add aria-describedby for flare markers with status context
  - [ ] 3.6: Add role="application" to BodyMapInteractive with aria-label="Interactive body map"
  - [ ] 3.7: Test with screen reader (NVDA/JAWS on Windows, VoiceOver on Mac/iOS)

- [ ] Task 4: Implement zoom and pan keyboard shortcuts (AC: #6)
  - [ ] 4.1: Add global keyboard listener for +/- keys to control zoom
  - [ ] 4.2: Implement arrow key pan when zoomed (before region selection mode)
  - [ ] 4.3: Add keyboard shortcut help overlay (? key shows shortcuts)
  - [ ] 4.4: Ensure shortcuts don't conflict with browser defaults
  - [ ] 4.5: Add visual indicator showing current mode (pan mode vs coordinate mode)
  - [ ] 4.6: Implement Escape key to cancel region selection/reset mode

- [ ] Task 5: Design and implement focus indicators (AC: #7)
  - [ ] 5.1: Add CSS focus-visible styles with 2px solid outline and high-contrast color
  - [ ] 5.2: Ensure focus indicator visible against all backgrounds (body map, UI controls)
  - [ ] 5.3: Implement focus indicator for SVG regions (use :focus-visible pseudo-class)
  - [ ] 5.4: Add focus styles to FlareMarkers when keyboard-navigable
  - [ ] 5.5: Test focus visibility in light and dark themes
  - [ ] 5.6: Ensure focus ring meets WCAG 2.1 contrast requirements (3:1 minimum)

- [ ] Task 6: Integration testing and compatibility verification (AC: All)
  - [ ] 6.1: Test complete keyboard workflow: Tab to region → Enter to select → Zoom with + → Arrow to position → Enter to mark
  - [ ] 6.2: Verify compatibility with Stories 1.2 (Zoom), 1.3 (Pan), 1.4 (Coordinates), 1.5 (Markers)
  - [ ] 6.3: Test with multiple screen readers (NVDA, JAWS, VoiceOver)
  - [ ] 6.4: Verify color-blind safe palette for severity indicators (existing, validate only)
  - [ ] 6.5: Test keyboard navigation performance meets NFR001 (<100ms response)
  - [ ] 6.6: Create accessibility testing checklist and document keyboard shortcuts

## Dev Notes

### Accessibility Implementation Patterns

**1. Keyboard Navigation State Machine:**
```typescript
enum KeyboardMode {
  NAVIGATE = 'navigate',  // Tab between regions
  PAN = 'pan',           // Arrow keys pan zoomed view
  POSITION = 'position'  // Arrow keys position coordinate
}

// Mode transitions:
// NAVIGATE → (select region + zoom) → PAN → (Enter coordinate mode) → POSITION
```

**2. ARIA Labels for Body Regions:**
```typescript
// bodyRegions.ts extension
interface BodyRegion {
  id: string;
  label: string;
  ariaLabel: (flareCount: number) => string;
  // e.g., ariaLabel: (count) => `${label}, ${count} active flare${count !== 1 ? 's' : ''}`
}
```

**3. Focus Management with react-zoom-pan-pinch:**
The TransformWrapper from react-zoom-pan-pinch must not trap focus. Use `centerOnInit={false}` and ensure tabbing works within transformed content.

**4. Keyboard Shortcut Implementation:**
```typescript
// useBodyMapKeyboard.ts hook
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case '+': case '=': zoomIn(); break;
    case '-': case '_': zoomOut(); break;
    case 'Escape': resetView(); break;
    case 'ArrowUp': mode === 'pan' ? panUp() : adjustCoordY(-0.01); break;
    // ... etc
  }
};
```

**5. Screen Reader Announcements:**
Use aria-live="polite" region for non-critical updates, aria-live="assertive" for important state changes.

### Architecture Constraints

- **NFR001 Performance:** All keyboard interactions must respond within 100ms (same as mouse/touch)
- **WCAG 2.1 Level AA Compliance:** Focus indicators, color contrast, keyboard operability
- **Component Structure:**
  - Accessibility logic encapsulated in `useBodyMapAccessibility` hook
  - Focus management handled at BodyMapInteractive level
  - ARIA labels computed dynamically based on flare state
- **Backward Compatibility:**
  - Must preserve existing mouse/touch interactions from Stories 1.1-1.5
  - Should enhance, not replace, existing interaction patterns

### Project Structure Notes

**Files to Modify:**
1. `src/components/body-map/BodyMapZoom.tsx` - Add keyboard event handlers, focus management
2. `src/components/body-map/BodyMapViewer.tsx` - Add role="application", aria-labels
3. `src/components/body-map/FlareMarkers.tsx` - Add keyboard navigation for markers
4. `src/lib/data/bodyRegions.ts` - Add ariaLabel function to each region definition
5. `src/components/body-mapping/bodies/FrontBody.tsx` - Add tabIndex, onKeyDown, focus styles
6. `src/components/body-mapping/bodies/BackBody.tsx` - Same as FrontBody

**Files to Create:**
1. `src/lib/hooks/useBodyMapAccessibility.ts` - Keyboard navigation hook
2. `src/lib/hooks/useBodyMapKeyboard.ts` - Keyboard shortcut handler
3. `src/components/body-map/KeyboardShortcutsHelp.tsx` - Help overlay component

**Test Files to Create:**
1. `src/__tests__/hooks/useBodyMapAccessibility.test.ts` - Hook unit tests
2. `src/__tests__/components/body-map/BodyMapAccessibility.test.tsx` - Integration tests
3. `src/__tests__/integration/body-map-keyboard-flow.test.tsx` - E2E keyboard workflow test

### Testing Standards Summary

**Unit Tests:**
- Test keyboard event handlers in isolation
- Verify ARIA label generation logic
- Test focus management state transitions

**Integration Tests:**
- Test complete keyboard navigation flow (tab → select → zoom → position)
- Verify screen reader announcements (use @testing-library/react with aria-live regions)
- Test keyboard shortcut conflicts and mode switching

**Accessibility Testing:**
- Manual screen reader testing (NVDA, JAWS, VoiceOver)
- Automated accessibility audit with jest-axe
- Keyboard-only navigation testing (no mouse/touch)
- Color contrast validation for focus indicators

**Performance Testing:**
- Measure keyboard event → UI update latency (target: <100ms per NFR001)
- Test keyboard navigation with 20+ active flares (FlareMarkers)

### References

**Source Documents:**
- [Source: docs/epics.md#Story-1.6] - Full acceptance criteria and prerequisites
- [Source: docs/PRD.md#User-Interface-Design-Goals] - Mobile-first, desktop-enhanced approach
- [Source: docs/solution-architecture.md#ADR-001] - react-zoom-pan-pinch integration
- [Source: docs/solution-architecture.md#Accessibility] - ARIA labels, keyboard nav, screen reader support

**Prerequisite Stories:**
- Story 1.1 (Groin Regions) - Body region definitions
- Story 1.2 (Zoom Controls) - BodyMapZoom component to enhance
- Story 1.3 (Pan Controls) - Pan behavior to make keyboard-accessible
- Story 1.4 (Coordinate Marking) - Coordinate positioning to support with arrow keys
- Story 1.5 (Flare Markers) - Markers to make keyboard-navigable

**Standards:**
- WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- React Accessibility: https://react.dev/learn/accessibility

## Dev Agent Record

### Context Reference

- docs/stories/story-context-1.6.xml

### Agent Model Used

<!-- Agent model name and version will be recorded here during implementation -->

### Debug Log References

<!-- Links to debug logs will be added here during implementation -->

### Completion Notes List

<!-- Completion notes will be added here after implementation -->

### File List

<!-- List of files created/modified will be added here during implementation -->
