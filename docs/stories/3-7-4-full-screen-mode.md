# Story 3.7.4: Full-Screen Mode

Status: ready-for-dev

## Story

As a user who gets distracted easily,
I want to remove all UI clutter and focus only on the body map,
so that I can concentrate on accurately tracking my symptoms.

## Acceptance Criteria

1. **AC3.7.4.1 — Full-screen toggle button available in normal view:** Prominent full-screen toggle button (⛶ icon or "Full Screen" label) is accessible in normal body map view, positioned in header or control area. Button clearly indicates full-screen mode availability. [Source: docs/epics.md#Story-3.7.4]

2. **AC3.7.4.2 — Full-screen removes all surrounding UI:** Entering full-screen mode hides all surrounding UI elements including: main header, navigation sidebar, bottom tabs, page breadcrumbs, and any other chrome. Only body map and thin control bar remain visible, maximizing viewport space for tracking. [Source: docs/epics.md#Story-3.7.4]

3. **AC3.7.4.3 — Thin control bar remains at top with essential controls:** Control bar (40-50px height) persists at top of screen in full-screen mode, providing essential navigation and controls without obscuring body map. Bar has high contrast background for visibility against body map. [Source: docs/epics.md#Story-3.7.4]

4. **AC3.7.4.4 — Control bar includes essential controls:** Control bar contains: "Back to Body Map" button (visible in region view), Layer selector dropdown (flares/pain/mobility/inflammation), "Show History" toggle (visible in region view), "Exit Full Screen" button. Controls are thumb-friendly (44x44px minimum) and clearly labeled. [Source: docs/epics.md#Story-3.7.4]

5. **AC3.7.4.5 — ESC key exits full-screen from any view:** Pressing ESC key immediately exits full-screen mode and returns user to normal view with all UI restored. Works from both full-body view and region detail view. Keyboard shortcut documented in help/accessibility section. [Source: docs/epics.md#Story-3.7.4]

6. **AC3.7.4.6 — Full-screen state persists when switching to region view:** When user enters full-screen mode in full-body view, then clicks a region to switch to region detail view, full-screen mode is maintained. User doesn't exit full-screen when navigating between views. [Source: docs/epics.md#Story-3.7.4]

7. **AC3.7.4.7 — Returning to body map maintains full-screen state:** When user clicks "Back to Body Map" button from region detail view while in full-screen mode, system returns to full-body view while maintaining full-screen mode. Full-screen persists across view transitions until user explicitly exits. [Source: docs/epics.md#Story-3.7.4]

8. **AC3.7.4.8 — Browser native full-screen API with fallback:** System uses browser's native Fullscreen API (document.documentElement.requestFullscreen()) for true full-screen experience. If Fullscreen API unavailable or blocked, system provides fallback mode that hides UI chrome while remaining in browser window. [Source: docs/epics.md#Story-3.7.4]

## Tasks / Subtasks

- [ ] Task 1: Create FullScreenControl component and toggle button (AC: #3.7.4.1)
  - [ ] 1.1: Create new file `src/components/body-mapping/FullScreenControl.tsx`
  - [ ] 1.2: Implement toggle button with ⛶ icon (maximize icon)
  - [ ] 1.3: Add button to BodyMapViewer header or control area
  - [ ] 1.4: Style button with clear visual indication (icon + label on hover)
  - [ ] 1.5: Implement click handler to trigger full-screen mode

- [ ] Task 2: Implement browser Fullscreen API integration (AC: #3.7.4.8)
  - [ ] 2.1: Create utility hook `useFullscreen()` with enter/exit functions
  - [ ] 2.2: Implement `enterFullscreen()` using `document.documentElement.requestFullscreen()`
  - [ ] 2.3: Handle browser prefixes (webkit, moz, ms) for cross-browser support
  - [ ] 2.4: Implement `exitFullscreen()` using `document.exitFullscreen()`
  - [ ] 2.5: Add fullscreenchange event listener to track state changes

- [ ] Task 3: Create fallback mode for unsupported browsers (AC: #3.7.4.8)
  - [ ] 3.1: Detect Fullscreen API availability
  - [ ] 3.2: Implement CSS-based fallback that hides UI chrome
  - [ ] 3.3: Add fixed positioning and z-index to create fullscreen-like effect
  - [ ] 3.4: Test fallback mode in browsers without Fullscreen API support
  - [ ] 3.5: Ensure smooth transition between native and fallback modes

- [ ] Task 4: Create thin control bar component (AC: #3.7.4.3, #3.7.4.4)
  - [ ] 4.1: Create `FullScreenControlBar.tsx` component
  - [ ] 4.2: Implement fixed positioning at top (40-50px height)
  - [ ] 4.3: Add high contrast background (dark bg with light text or vice versa)
  - [ ] 4.4: Ensure control bar stays above body map content (z-index management)
  - [ ] 4.5: Make control bar responsive for mobile and desktop

- [ ] Task 5: Add essential controls to control bar (AC: #3.7.4.4)
  - [ ] 5.1: Add "Exit Full Screen" button with ⛶ (minimize) icon
  - [ ] 5.2: Add Layer selector dropdown (conditionally visible based on feature availability)
  - [ ] 5.3: Add "Back to Body Map" button (visible only in region view)
  - [ ] 5.4: Add "Show History" toggle (visible only in region view)
  - [ ] 5.5: Ensure all controls meet 44x44px touch target minimum

- [ ] Task 6: Implement UI chrome hiding (AC: #3.7.4.2)
  - [ ] 6.1: Add CSS class or state to hide main header
  - [ ] 6.2: Hide navigation sidebar (desktop)
  - [ ] 6.3: Hide bottom tabs (mobile)
  - [ ] 6.4: Hide breadcrumbs and other chrome elements
  - [ ] 6.5: Test that body map fills entire viewport when chrome hidden

- [ ] Task 7: Implement ESC key handler (AC: #3.7.4.5)
  - [ ] 7.1: Add keyboard event listener for ESC key
  - [ ] 7.2: Trigger exitFullscreen() on ESC press
  - [ ] 7.3: Ensure handler works in both full-body and region views
  - [ ] 7.4: Prevent ESC key from conflicting with other ESC handlers (region back navigation)
  - [ ] 7.5: Add ARIA announcement for screen readers when exiting full-screen

- [ ] Task 8: Implement full-screen state persistence across views (AC: #3.7.4.6, #3.7.4.7)
  - [ ] 8.1: Add fullscreen state to BodyMapViewer component state
  - [ ] 8.2: Pass fullscreen state to RegionDetailView component
  - [ ] 8.3: Maintain fullscreen mode when switching from full-body to region view
  - [ ] 8.4: Maintain fullscreen mode when clicking "Back to Body Map" from region view
  - [ ] 8.5: Test view transitions in fullscreen mode thoroughly

- [ ] Task 9: Integration and testing (AC: All)
  - [ ] 9.1: Integrate FullScreenControl into BodyMapViewer
  - [ ] 9.2: Test full-screen mode in Chrome, Safari, Firefox, Edge
  - [ ] 9.3: Test fallback mode in browsers without Fullscreen API
  - [ ] 9.4: Test mobile full-screen behavior (iOS Safari, Android Chrome)
  - [ ] 9.5: Write unit tests for useFullscreen hook
  - [ ] 9.6: Write integration tests for full-screen workflow
  - [ ] 9.7: Test ESC key handling from all views
  - [ ] 9.8: Test state persistence across view transitions

## Dev Notes

### Technical Architecture

- **Fullscreen API:** Uses browser's native document.requestFullscreen() for true full-screen
- **Fallback Mode:** CSS-based approach for browsers without Fullscreen API support
- **Control Bar:** Fixed-position component that remains visible in full-screen mode
- **State Management:** Fullscreen state managed in BodyMapViewer, passed to child components

### Learnings from Previous Stories

**From Story 3-7-1-region-detail-view-infrastructure (Status: done)**
- RegionDetailView component exists with view mode switching
- ESC key handler already implemented for back navigation - coordinate with new ESC handler
- View state management pattern established in BodyMapViewer

**From Story 3-7-2-marker-preview-and-positioning (Status: drafted)**
- Control buttons follow established pattern with 44x44px touch targets
- Accessibility considerations for all interactive elements

**From Story 3-7-3-smart-defaults-system (Status: drafted)**
- Layer selector may be referenced in control bar for layer switching

[Source: stories/3-7-1-region-detail-view-infrastructure.md, stories/3-7-2-marker-preview-and-positioning.md]

### Component Integration Points

- **BodyMapViewer.tsx**: Main integration point - add fullscreen state and toggle logic
- **RegionDetailView.tsx**: Receive fullscreen state prop, render control bar when in fullscreen
- **FullScreenControlBar.tsx**: New component - thin control bar for fullscreen mode
- **useFullscreen.ts**: Custom hook wrapping Fullscreen API

### State Management Approach

```typescript
interface FullscreenState {
  isFullscreen: boolean;
  isSupported: boolean; // Fullscreen API available
  isFallbackMode: boolean; // Using CSS fallback
}

// Custom hook
function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      // Fallback mode
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else {
      // Fallback exit
    }
  };

  return { isFullscreen, enterFullscreen, exitFullscreen };
}
```

### Browser API Notes

**Fullscreen API Methods:**
- `document.documentElement.requestFullscreen()` - Enter fullscreen
- `document.exitFullscreen()` - Exit fullscreen
- `document.fullscreenElement` - Get current fullscreen element
- `fullscreenchange` event - Detect fullscreen state changes

**Browser Prefixes** (for older browsers):
- `webkitRequestFullscreen` (Safari, older Chrome)
- `mozRequestFullScreen` (older Firefox)
- `msRequestFullscreen` (older Edge)

### ESC Key Handler Coordination

**Challenge:** Both region detail view (Story 3.7.1) and full-screen mode use ESC key
**Solution:** Prioritize full-screen exit over region back navigation
- ESC in fullscreen region view → Exit fullscreen (stay in region view)
- ESC in normal region view → Back to full-body view
- Use event.stopPropagation() or handler priority to manage conflicts

### Project Structure Notes

**File organization:**
```
src/components/body-mapping/
  ├── FullScreenControl.tsx (NEW - toggle button)
  ├── FullScreenControlBar.tsx (NEW - thin control bar)
  ├── FullScreenControl.test.tsx (NEW)
  ├── BodyMapViewer.tsx (MODIFY - fullscreen state management)
  ├── RegionDetailView.tsx (MODIFY - render control bar in fullscreen)
src/lib/hooks/
  ├── useFullscreen.ts (NEW - Fullscreen API hook)
  ├── useFullscreen.test.ts (NEW)
```

### References

- [Source: docs/epics.md#Story-3.7.4] - Story acceptance criteria and requirements
- [Source: stories/3-7-1-region-detail-view-infrastructure.md] - View mode state management, ESC key handler
- [Source: MDN Web Docs - Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)

### Testing Considerations

- Test Fullscreen API support detection across browsers
- Verify fallback mode works in unsupported browsers
- Test ESC key priority (fullscreen exit vs region back navigation)
- Test fullscreen state persistence across view transitions
- Verify control bar visibility and functionality
- Test mobile full-screen behavior (iOS Safari quirks)
- Ensure UI chrome properly hidden/restored
- Test accessibility (screen reader announcements, keyboard navigation)

### Mobile Considerations

- **iOS Safari:** Fullscreen API behaves differently on iOS - may need special handling
- **Android Chrome:** Generally good Fullscreen API support
- **Touch Targets:** Control bar buttons must be thumb-friendly (44x44px)
- **Viewport Units:** Use `100vh` carefully due to mobile browser chrome behavior

## Dev Agent Record

### Context Reference

- [Story Context XML](./3-7-4-full-screen-mode.context.xml) - Generated 2025-11-02

### Agent Model Used

Claude 3.5 Sonnet (claude-3-5-sonnet-20241022) - SM Agent

### Debug Log References

### Completion Notes List

### File List
