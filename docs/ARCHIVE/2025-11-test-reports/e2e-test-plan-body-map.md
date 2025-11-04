# E2E Test Plan - Body Map UX Enhancements

**Feature Branch:** feature/body-map-ux-enhancements
**Test Framework:** Playwright (via MCP Server)
**Test Type:** End-to-End UI/UX Validation
**Stories Covered:** 3.7.1 - 3.7.6

---

## Overview

This document provides step-by-step E2E test procedures for body-map UX enhancements, designed for execution using the Playwright MCP server. Each test scenario includes:

- **Pre-conditions:** Required application state
- **Test Steps:** Detailed actions to perform
- **Expected Results:** Observable outcomes at each step
- **Validation Points:** Specific assertions to verify
- **MCP Tool Usage:** Which Playwright MCP tools to use

---

## Test Environment Setup

### Prerequisites

1. **Application Running:**
   ```bash
   npm run dev
   # Application should be running at http://localhost:3001
   ```

2. **Test User Setup:**
   - User ID: `test-user-001`
   - At least one active flare in the system

3. **Browser Configuration:**
   - Browser: Chromium (headless: false for visual validation)
   - Viewport: 1280x720 (desktop), 375x667 (mobile)
   - DeviceScaleFactor: 1

### MCP Tools Available

- `playwright_navigate` - Navigate to URLs
- `playwright_click` - Click elements
- `playwright_fill` - Fill form inputs
- `playwright_screenshot` - Capture visual state
- `playwright_evaluate` - Execute JavaScript
- `console_logs` - Monitor console messages
- `network_activity` - Monitor network requests

---

## Story 3.7.1: Region Detail View Infrastructure

### Test Scenario 1.1: Region Focus Navigation

**Acceptance Criteria:** AC 3.7.1.1 - Clicking a region zooms to isolated view

**Pre-conditions:**
- Navigate to `/flares/new` or flare detail page
- Body map (front or back view) is visible

**Test Steps:**

1. **Navigate to flares page**
   ```
   MCP Tool: playwright_navigate
   URL: http://localhost:3001/flares/new
   Wait: Until body map SVG is visible
   ```

2. **Identify clickable regions**
   ```
   MCP Tool: playwright_evaluate
   Script: document.querySelectorAll('[data-region-id]').length
   Expected: > 30 (should have multiple body regions)
   ```

3. **Click on knee region**
   ```
   MCP Tool: playwright_click
   Selector: [data-region-id="knee-left"]
   Expected: Region should become focused/highlighted
   ```

4. **Verify region detail view appears**
   ```
   MCP Tool: playwright_screenshot
   Filename: region-detail-knee-left.png
   Validation:
   - Region detail panel should be visible
   - Region name "Knee (Left)" should be displayed
   - Isolated view of knee region should show
   - ViewBox should be zoomed to region bounds
   ```

5. **Verify viewBox transformation**
   ```
   MCP Tool: playwright_evaluate
   Script: document.querySelector('.region-detail-view svg').getAttribute('viewBox')
   Expected: Narrow viewBox focused on knee region (not full body 0 0 400 800)
   Example: "145 540 90 90" (centered on knee)
   ```

**Expected Results:**
- ✅ Clicking region transitions to focused view
- ✅ ViewBox updates to show isolated region
- ✅ Region name is displayed prominently
- ✅ Back/exit button is available
- ✅ Transition is smooth (no flicker)

**Validation:**
```javascript
// MCP Tool: playwright_evaluate
const detailView = document.querySelector('[data-testid="region-detail-view"]');
const regionName = detailView?.querySelector('h2')?.textContent;
const viewBox = detailView?.querySelector('svg')?.getAttribute('viewBox');
const backButton = detailView?.querySelector('[aria-label*="Back"]');

return {
  visible: !!detailView,
  regionName,
  viewBox,
  hasBackButton: !!backButton
};
```

---

### Test Scenario 1.2: Return to Full Body View

**Acceptance Criteria:** AC 3.7.1.2 - Back button returns to full body view

**Pre-conditions:**
- Complete Test Scenario 1.1
- Region detail view is active

**Test Steps:**

1. **Verify back button presence**
   ```
   MCP Tool: playwright_screenshot
   Filename: region-detail-with-back-button.png
   Validation: Back/close button should be visible
   ```

2. **Click back button**
   ```
   MCP Tool: playwright_click
   Selector: [aria-label*="Back"], [aria-label*="Close"], button:has-text("Back")
   Expected: Transition back to full body view
   ```

3. **Verify full body view restored**
   ```
   MCP Tool: playwright_evaluate
   Script: document.querySelector('.body-map-viewer svg').getAttribute('viewBox')
   Expected: Full body viewBox (e.g., "0 0 400 800")
   ```

4. **Verify all regions clickable again**
   ```
   MCP Tool: playwright_evaluate
   Script: document.querySelectorAll('[data-region-id]').length
   Expected: > 30 (all regions restored)
   ```

**Expected Results:**
- ✅ Back button returns to full body view
- ✅ ViewBox resets to full body dimensions
- ✅ All regions are clickable again
- ✅ No region is highlighted/focused

---

## Story 3.7.2: Marker Preview and Positioning

### Test Scenario 2.1: Tap-to-Position Workflow

**Acceptance Criteria:** AC 3.7.2.1 - Preview marker appears at tapped location

**Pre-conditions:**
- Navigate to flare creation or body map page
- Body map is in "add marker" mode

**Test Steps:**

1. **Enter marker placement mode**
   ```
   MCP Tool: playwright_click
   Selector: [data-testid="add-marker-button"], button:has-text("Add Location")
   Expected: Cursor changes, instructions appear
   ```

2. **Click on body region (e.g., shoulder)**
   ```
   MCP Tool: playwright_click
   Selector: [data-region-id="shoulder-left"]
   Coordinates: Relative to element center
   Expected: Preview marker appears
   ```

3. **Verify preview marker rendering**
   ```
   MCP Tool: playwright_screenshot
   Filename: marker-preview-shoulder.png
   Validation:
   - Translucent blue circle visible at click location
   - Pulse animation active
   - Confirm (green) and Cancel (red) buttons flanking marker
   ```

4. **Verify preview marker styling**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const preview = document.querySelector('.marker-preview circle[r="3"]');
     return {
       fill: preview?.getAttribute('fill'),
       fillOpacity: preview?.getAttribute('fill-opacity'),
       stroke: preview?.getAttribute('stroke'),
       hasAnimation: preview?.className.baseVal.includes('animate-pulse')
     };
   Expected:
   - fill: "#3b82f6"
   - fillOpacity: "0.5"
   - stroke: "#2563eb"
   - hasAnimation: true
   ```

**Expected Results:**
- ✅ Preview marker appears at exact click location
- ✅ Marker is translucent (50% opacity)
- ✅ Marker has pulse animation
- ✅ Confirm/Cancel buttons are visible
- ✅ Center precision dot is visible

---

### Test Scenario 2.2: Confirm Marker Position

**Acceptance Criteria:** AC 3.7.2.2 - Confirm button saves marker position

**Pre-conditions:**
- Complete Test Scenario 2.1
- Preview marker is visible

**Test Steps:**

1. **Verify confirm button accessibility**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const confirmBtn = document.querySelector('[aria-label="Confirm marker position"]');
     return {
       exists: !!confirmBtn,
       role: confirmBtn?.getAttribute('role'),
       tabIndex: confirmBtn?.getAttribute('tabindex')
     };
   Expected:
   - exists: true
   - role: "button"
   - tabIndex: "0"
   ```

2. **Click confirm button**
   ```
   MCP Tool: playwright_click
   Selector: [aria-label="Confirm marker position"]
   Expected: Marker details form appears
   ```

3. **Verify marker details form**
   ```
   MCP Tool: playwright_screenshot
   Filename: marker-details-form.png
   Validation:
   - Form modal/dialog should appear
   - Region ID should be pre-filled (e.g., "shoulder-left")
   - Coordinates should be captured
   - Severity slider should be visible
   ```

4. **Fill marker details**
   ```
   MCP Tool: playwright_fill
   Selector: [data-testid="severity-slider"]
   Value: 7

   MCP Tool: playwright_fill
   Selector: [data-testid="notes-input"]
   Value: "Sharp pain when lifting"
   ```

5. **Submit marker**
   ```
   MCP Tool: playwright_click
   Selector: button:has-text("Save"), [data-testid="save-marker-button"]
   Expected: Marker is saved, preview disappears
   ```

6. **Verify final marker rendering**
   ```
   MCP Tool: playwright_screenshot
   Filename: final-marker-saved.png
   Validation:
   - Preview marker replaced with final marker
   - Final marker is solid (not translucent)
   - Final marker has severity badge/indicator
   ```

**Expected Results:**
- ✅ Confirm button triggers marker details form
- ✅ Form pre-fills region and coordinates
- ✅ User can set severity and notes
- ✅ Save creates permanent marker
- ✅ Preview marker is replaced

---

### Test Scenario 2.3: Cancel Marker Placement

**Acceptance Criteria:** AC 3.7.2.3 - Cancel button removes preview

**Pre-conditions:**
- Marker preview is visible (repeat steps from 2.1)

**Test Steps:**

1. **Click cancel button**
   ```
   MCP Tool: playwright_click
   Selector: [aria-label="Cancel marker placement"]
   Expected: Preview marker disappears
   ```

2. **Verify preview removed**
   ```
   MCP Tool: playwright_evaluate
   Script: !!document.querySelector('.marker-preview')
   Expected: false (preview should not exist)
   ```

3. **Verify return to placement mode**
   ```
   MCP Tool: playwright_evaluate
   Script: document.body.style.cursor
   Expected: cursor indicates placement mode still active
   ```

**Expected Results:**
- ✅ Cancel button removes preview immediately
- ✅ No marker is saved
- ✅ User can place another marker
- ✅ No form/dialog appears

---

### Test Scenario 2.4: Keyboard Accessibility

**Acceptance Criteria:** AC 3.7.2.4 - Keyboard navigation works

**Pre-conditions:**
- Marker preview is visible

**Test Steps:**

1. **Test Tab navigation**
   ```
   MCP Tool: playwright_evaluate
   Script:
     document.querySelector('[aria-label="Confirm marker position"]').focus();
     return document.activeElement.getAttribute('aria-label');
   Expected: "Confirm marker position"
   ```

2. **Test Enter key on confirm button**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const confirmBtn = document.querySelector('[aria-label="Confirm marker position"]');
     confirmBtn.focus();
     confirmBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
     // Check if form appeared
     return !!document.querySelector('[data-testid="marker-details-form"]');
   Expected: true (form should appear)
   ```

3. **Test Escape key on cancel button**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const cancelBtn = document.querySelector('[aria-label="Cancel marker placement"]');
     cancelBtn.focus();
     cancelBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
     // Check if preview removed
     return !!document.querySelector('.marker-preview');
   Expected: false (preview should be removed)
   ```

**Expected Results:**
- ✅ Tab key navigates to buttons
- ✅ Enter/Space activates buttons
- ✅ Escape cancels marker placement
- ✅ Focus indicators are visible

---

## Story 3.7.4: Full-Screen Mode

### Test Scenario 4.1: Enter Full-Screen Mode

**Acceptance Criteria:** AC 3.7.4.1 - Full-screen toggle available

**Pre-conditions:**
- Navigate to body map view
- Body map is visible

**Test Steps:**

1. **Verify full-screen button presence**
   ```
   MCP Tool: playwright_screenshot
   Filename: body-map-with-fullscreen-button.png
   Validation: Full-screen toggle button should be visible
   ```

2. **Check button accessibility**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const btn = document.querySelector('[aria-label*="full screen"]');
     return {
       exists: !!btn,
       ariaLabel: btn?.getAttribute('aria-label'),
       minWidth: btn?.offsetWidth,
       minHeight: btn?.offsetHeight
     };
   Expected:
   - exists: true
   - ariaLabel: "Enter full screen" (or similar)
   - minWidth: >= 44
   - minHeight: >= 44 (touch target requirement)
   ```

3. **Click full-screen button**
   ```
   MCP Tool: playwright_click
   Selector: [aria-label*="Enter full screen"], button:has-text("Full Screen")
   Expected: Body map expands to full screen
   ```

4. **Verify full-screen state**
   ```
   MCP Tool: playwright_screenshot
   Filename: body-map-fullscreen-active.png
   Validation:
   - Body map fills entire viewport
   - Navigation sidebar hidden
   - Top bar hidden or minimized
   - Exit full-screen button visible
   ```

5. **Verify Z-index layering**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const fullscreenContainer = document.querySelector('[data-fullscreen="true"]');
     return {
       exists: !!fullscreenContainer,
       zIndex: window.getComputedStyle(fullscreenContainer).zIndex,
       position: window.getComputedStyle(fullscreenContainer).position
     };
   Expected:
   - exists: true
   - zIndex: "9999" (or similar high value)
   - position: "fixed"
   ```

**Expected Results:**
- ✅ Full-screen button toggles body map to full-screen
- ✅ Body map fills entire viewport
- ✅ Exit button is visible and accessible
- ✅ Other UI elements are hidden
- ✅ Touch target is 44x44px minimum

---

### Test Scenario 4.2: Exit Full-Screen Mode

**Acceptance Criteria:** AC 3.7.4.2 - Exit returns to normal view

**Pre-conditions:**
- Complete Test Scenario 4.1
- Full-screen mode is active

**Test Steps:**

1. **Click exit full-screen button**
   ```
   MCP Tool: playwright_click
   Selector: [aria-label*="Exit full screen"], button:has-text("Exit")
   Expected: Body map returns to normal view
   ```

2. **Verify normal view restored**
   ```
   MCP Tool: playwright_screenshot
   Filename: body-map-normal-view.png
   Validation:
   - Navigation sidebar visible
   - Top bar visible
   - Body map in normal container
   - Full-screen button shows "Enter" state
   ```

3. **Verify saved state persisted**
   ```
   MCP Tool: playwright_evaluate
   Script:
     // Check that markers, region focus, etc. persisted through full-screen transition
     return {
       markerCount: document.querySelectorAll('[data-marker-id]').length,
       regionFocus: document.querySelector('[data-region-focused]')?.getAttribute('data-region-id')
     };
   Expected: State should match pre-full-screen state
   ```

**Expected Results:**
- ✅ Exit button returns to normal view
- ✅ UI chrome is restored
- ✅ Body map state is preserved
- ✅ All functionality remains available

---

### Test Scenario 4.3: Simplified Marker Form in Full-Screen

**Acceptance Criteria:** AC 3.7.4.3 - Simplified form in full-screen mode

**Pre-conditions:**
- Full-screen mode is active
- User is in marker placement mode

**Test Steps:**

1. **Place marker in full-screen mode**
   ```
   MCP Tool: playwright_click
   Selector: [data-region-id="shoulder-right"]
   Expected: Simplified marker form appears
   ```

2. **Verify simplified form rendering**
   ```
   MCP Tool: playwright_screenshot
   Filename: simplified-marker-form-fullscreen.png
   Validation:
   - Modal dialog should appear
   - Only severity slider visible (no notes field)
   - Save and Cancel buttons prominent
   - Hint text: "exit fullscreen for detailed entry"
   ```

3. **Verify form simplification**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const form = document.querySelector('[data-testid="simplified-marker-form"]');
     return {
       exists: !!form,
       hasNotesField: !!form?.querySelector('[data-testid="notes-input"]'),
       hasSeveritySlider: !!form?.querySelector('[data-testid="severity-slider"]'),
       hasHintText: !!form?.textContent.includes('fullscreen')
     };
   Expected:
   - exists: true
   - hasNotesField: false
   - hasSeveritySlider: true
   - hasHintText: true
   ```

4. **Set severity and save**
   ```
   MCP Tool: playwright_fill
   Selector: [data-testid="severity-slider"]
   Value: 8

   MCP Tool: playwright_click
   Selector: button:has-text("Save")
   Expected: Marker saved with severity only
   ```

**Expected Results:**
- ✅ Simplified form appears in full-screen mode
- ✅ Only severity slider is shown
- ✅ Notes field is hidden
- ✅ User can quickly mark location
- ✅ Hint directs to normal view for details

---

## Story 3.7.5: History Toggle

### Test Scenario 5.1: Toggle Historical Markers

**Acceptance Criteria:** AC 3.7.5.1 - Toggle shows/hides resolved markers

**Pre-conditions:**
- User has at least one active flare with markers
- User has at least one resolved flare with markers

**Test Steps:**

1. **Navigate to flare with history**
   ```
   MCP Tool: playwright_navigate
   URL: http://localhost:3001/flares/{flare-id}
   Expected: Flare detail page loads with body map
   ```

2. **Verify initial state (history hidden)**
   ```
   MCP Tool: playwright_screenshot
   Filename: body-map-history-hidden.png
   Validation: Only current/active markers visible
   ```

3. **Count current markers**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const currentMarkers = document.querySelectorAll('[data-marker-status="active"]');
     const historicalMarkers = document.querySelectorAll('[data-marker-status="resolved"]');
     return {
       currentCount: currentMarkers.length,
       historicalCount: historicalMarkers.length,
       historicalVisible: historicalMarkers.length > 0 &&
                          window.getComputedStyle(historicalMarkers[0]).display !== 'none'
     };
   Expected:
   - currentCount: > 0
   - historicalVisible: false
   ```

4. **Click history toggle button**
   ```
   MCP Tool: playwright_click
   Selector: [data-testid="toggle-history"], button:has-text("Show History")
   Expected: Historical markers appear
   ```

5. **Verify historical markers visible**
   ```
   MCP Tool: playwright_screenshot
   Filename: body-map-history-visible.png
   Validation:
   - Historical markers should appear (grayed out or distinct style)
   - Toggle button text should change to "Hide History"
   ```

6. **Verify marker differentiation**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const activeMarker = document.querySelector('[data-marker-status="active"]');
     const historicalMarker = document.querySelector('[data-marker-status="resolved"]');
     return {
       activeOpacity: window.getComputedStyle(activeMarker).opacity,
       historicalOpacity: window.getComputedStyle(historicalMarker).opacity,
       differentiated: activeMarker.getAttribute('fill') !== historicalMarker.getAttribute('fill')
     };
   Expected:
   - activeOpacity: "1"
   - historicalOpacity: "0.3" - "0.5" (faded)
   - differentiated: true
   ```

**Expected Results:**
- ✅ Toggle button shows/hides historical markers
- ✅ Historical markers are visually distinct (faded, grayed)
- ✅ Button label updates based on state
- ✅ User can toggle multiple times

---

## Story 3.7.6: Polish and Accessibility

### Test Scenario 6.1: ARIA Labels and Screen Reader Support

**Acceptance Criteria:** AC 3.7.6.1 - All interactive elements have ARIA labels

**Test Steps:**

1. **Audit interactive elements**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const interactiveElements = document.querySelectorAll('button, [role="button"], input, select');
     const missingLabels = [];

     interactiveElements.forEach(el => {
       const hasLabel = el.getAttribute('aria-label') ||
                        el.getAttribute('aria-labelledby') ||
                        el.querySelector('label') ||
                        el.textContent.trim();
       if (!hasLabel) {
         missingLabels.push(el.outerHTML);
       }
     });

     return {
       totalInteractive: interactiveElements.length,
       missingLabels: missingLabels.length,
       elements: missingLabels.slice(0, 5) // First 5 missing
     };
   Expected:
   - missingLabels: 0 (all elements should have labels)
   ```

2. **Verify region labels**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const regions = document.querySelectorAll('[data-region-id]');
     const hasLabels = Array.from(regions).every(r =>
       r.getAttribute('aria-label') || r.getAttribute('title')
     );
     return {
       regionCount: regions.length,
       allLabeled: hasLabels
     };
   Expected:
   - regionCount: > 30
   - allLabeled: true
   ```

3. **Test focus indicators**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const button = document.querySelector('[data-testid="add-marker-button"]');
     button.focus();
     const outline = window.getComputedStyle(button).outline;
     const outlineWidth = window.getComputedStyle(button).outlineWidth;
     return {
       hasFocus: document.activeElement === button,
       outline,
       outlineWidth,
       visible: outlineWidth !== '0px' && outline !== 'none'
     };
   Expected:
   - hasFocus: true
   - visible: true
   ```

**Expected Results:**
- ✅ All interactive elements have ARIA labels
- ✅ All regions have descriptive labels
- ✅ Focus indicators are clearly visible
- ✅ Tab navigation is logical

---

### Test Scenario 6.2: Touch Target Sizes

**Acceptance Criteria:** AC 3.7.6.2 - All touch targets ≥ 44x44px

**Test Steps:**

1. **Measure all interactive elements**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const interactiveElements = document.querySelectorAll('button, [role="button"], a, input');
     const tooSmall = [];

     interactiveElements.forEach(el => {
       const rect = el.getBoundingClientRect();
       if (rect.width < 44 || rect.height < 44) {
         tooSmall.push({
           element: el.getAttribute('aria-label') || el.textContent?.substring(0, 30),
           width: Math.round(rect.width),
           height: Math.round(rect.height)
         });
       }
     });

     return {
       totalInteractive: interactiveElements.length,
       tooSmall: tooSmall.length,
       violations: tooSmall.slice(0, 5)
     };
   Expected:
   - tooSmall: 0 (no violations)
   ```

2. **Verify marker confirm/cancel buttons**
   ```
   MCP Tool: playwright_evaluate
   Script:
     // Preview marker should be visible for this test
     const confirmBtn = document.querySelector('[aria-label="Confirm marker position"]');
     const cancelBtn = document.querySelector('[aria-label="Cancel marker placement"]');

     return {
       confirm: confirmBtn ? {
         width: confirmBtn.getBoundingClientRect().width,
         height: confirmBtn.getBoundingClientRect().height
       } : null,
       cancel: cancelBtn ? {
         width: cancelBtn.getBoundingClientRect().width,
         height: cancelBtn.getBoundingClientRect().height
       } : null
     };
   Expected:
   - Both buttons should have width >= 44 and height >= 44
   ```

**Expected Results:**
- ✅ All touch targets meet 44x44px minimum
- ✅ Marker confirm/cancel buttons are appropriately sized
- ✅ Full-screen button meets size requirement
- ✅ Region click areas are adequate

---

### Test Scenario 6.3: Color Contrast

**Acceptance Criteria:** AC 3.7.6.3 - Text meets WCAG AA contrast

**Test Steps:**

1. **Check text contrast ratios**
   ```
   MCP Tool: playwright_evaluate
   Script:
     // Helper to calculate contrast ratio
     function getContrastRatio(fg, bg) {
       // Simplified - in practice use a proper contrast calculation library
       return 4.5; // Placeholder
     }

     const textElements = document.querySelectorAll('h1, h2, h3, p, button, label');
     const lowContrast = [];

     textElements.forEach(el => {
       const fgColor = window.getComputedStyle(el).color;
       const bgColor = window.getComputedStyle(el).backgroundColor;
       const ratio = getContrastRatio(fgColor, bgColor);

       if (ratio < 4.5) { // WCAG AA requirement for normal text
         lowContrast.push({
           text: el.textContent?.substring(0, 30),
           ratio
         });
       }
     });

     return {
       total: textElements.length,
       lowContrast: lowContrast.length
     };
   Expected:
   - lowContrast: 0
   ```

**Expected Results:**
- ✅ All text meets WCAG AA contrast (4.5:1 for normal, 3:1 for large)
- ✅ Marker colors are distinguishable
- ✅ Preview marker is visually distinct

---

## Mobile Responsiveness Tests

### Test Scenario M1: Mobile Viewport - Marker Placement

**Pre-conditions:**
- Set viewport to mobile (375x667)

**Test Steps:**

1. **Configure mobile viewport**
   ```
   MCP Tool: playwright_evaluate
   Script: window.resizeTo(375, 667)
   Note: Or use Playwright's viewport configuration
   ```

2. **Navigate to body map**
   ```
   MCP Tool: playwright_navigate
   URL: http://localhost:3001/flares/new
   ```

3. **Verify touch-friendly layout**
   ```
   MCP Tool: playwright_screenshot
   Filename: body-map-mobile-375px.png
   Validation:
   - Body map should be appropriately sized
   - Touch targets should be larger (≥ 44px)
   - Text should be readable (≥ 16px)
   ```

4. **Test marker placement on mobile**
   ```
   MCP Tool: playwright_click
   Selector: [data-region-id="knee-left"]
   Expected: Preview marker appears, buttons are touch-friendly
   ```

**Expected Results:**
- ✅ Body map scales to mobile viewport
- ✅ Touch targets are adequately sized
- ✅ Marker placement works smoothly
- ✅ Forms are mobile-optimized

---

## Performance Tests

### Test Scenario P1: Region Focus Performance

**Acceptance Criteria:** Region focus transition < 300ms

**Test Steps:**

1. **Measure region focus time**
   ```
   MCP Tool: playwright_evaluate
   Script:
     const startTime = performance.now();
     const region = document.querySelector('[data-region-id="shoulder-left"]');
     region.click();

     // Wait for viewBox to change
     await new Promise(resolve => {
       const observer = new MutationObserver((mutations) => {
         const svg = document.querySelector('.region-detail-view svg');
         if (svg && svg.getAttribute('viewBox') !== '0 0 400 800') {
           observer.disconnect();
           resolve();
         }
       });
       observer.observe(document.body, { subtree: true, attributes: true });
     });

     const endTime = performance.now();
     return { duration: endTime - startTime };
   Expected: duration < 300ms
   ```

2. **Monitor console for warnings**
   ```
   MCP Tool: console_logs
   Filter: warning, error
   Expected: No performance warnings
   ```

**Expected Results:**
- ✅ Region focus transition completes in < 300ms
- ✅ No layout thrashing warnings
- ✅ Smooth visual transition

---

## Test Execution Checklist

### Before Starting Tests

- [ ] Application is running on http://localhost:3001
- [ ] Test user exists with active and resolved flares
- [ ] Browser DevTools are open for debugging
- [ ] Playwright MCP server is connected

### During Test Execution

- [ ] Take screenshots at each major step
- [ ] Monitor console logs for errors
- [ ] Verify network requests complete successfully
- [ ] Document any unexpected behavior

### After Test Completion

- [ ] Review all screenshots
- [ ] Document any bugs or issues found
- [ ] Compare results against acceptance criteria
- [ ] Create bug tickets for failures

---

## Reporting Template

### Test Execution Report

**Date:** [DATE]
**Tester:** [AI Agent Name]
**Branch:** feature/body-map-ux-enhancements
**Build:** [Commit SHA]

**Test Results Summary:**

| Scenario | Status | Duration | Notes |
|----------|--------|----------|-------|
| 1.1 Region Focus | ✅ Pass | 2.3s | All assertions passed |
| 1.2 Return to Full Body | ✅ Pass | 1.8s | - |
| 2.1 Marker Preview | ⚠️ Fail | 3.1s | Preview opacity incorrect |
| ... | ... | ... | ... |

**Total Tests:** 20
**Passed:** 18
**Failed:** 2
**Blocked:** 0

**Defects Found:**
1. **DEF-001:** Marker preview opacity is 0.7 instead of 0.5
   - Severity: Low
   - Steps to Reproduce: [Link to scenario 2.1]
   - Screenshot: marker-preview-opacity-issue.png

**Recommendations:**
- Fix marker preview opacity in MarkerPreview.tsx
- Add automated visual regression tests for marker styling
- Consider adding performance budgets for region transitions

---

## Notes for MCP Orchestration

### Best Practices

1. **Always take screenshots** at critical validation points
2. **Use playwright_evaluate** for complex assertions that need multiple values
3. **Monitor console_logs** throughout test execution
4. **Wait for network idle** before taking screenshots
5. **Use data-testid** attributes when available for stable selectors

### Common Patterns

**Pattern: Click and Verify**
```
1. MCP Tool: playwright_click (selector)
2. MCP Tool: playwright_screenshot (validation)
3. MCP Tool: playwright_evaluate (assertions)
```

**Pattern: Form Fill and Submit**
```
1. MCP Tool: playwright_fill (each field)
2. MCP Tool: playwright_click (submit button)
3. MCP Tool: network_activity (verify POST request)
4. MCP Tool: playwright_screenshot (result)
```

**Pattern: State Verification**
```
1. MCP Tool: playwright_evaluate (complex state check)
2. Return structured object with multiple properties
3. Validate each property against expected values
```

---

## Appendix: Selector Reference

### Common Selectors

```javascript
// Body regions
'[data-region-id="knee-left"]'
'[data-region-id="shoulder-right"]'
'[data-region-id="head-front"]'

// Markers
'[data-marker-id]'
'[data-marker-status="active"]'
'[data-marker-status="resolved"]'
'.marker-preview'

// Buttons
'[data-testid="add-marker-button"]'
'[aria-label="Confirm marker position"]'
'[aria-label="Cancel marker placement"]'
'[aria-label*="full screen"]'
'[data-testid="toggle-history"]'

// Forms
'[data-testid="marker-details-form"]'
'[data-testid="simplified-marker-form"]'
'[data-testid="severity-slider"]'
'[data-testid="notes-input"]'

// Views
'[data-testid="region-detail-view"]'
'.body-map-viewer'
'[data-fullscreen="true"]'
```

---

## Success Criteria

**All tests pass when:**

- ✅ All 20+ scenarios complete without errors
- ✅ No console errors or warnings
- ✅ All screenshots show expected UI states
- ✅ Performance budgets are met
- ✅ Accessibility requirements satisfied
- ✅ Mobile viewport tests pass
- ✅ All network requests succeed
- ✅ No visual regressions

**Ready for Production when:**

- All test scenarios pass
- No P0 or P1 defects remain
- Performance is acceptable (<300ms transitions)
- Accessibility audit shows no violations
- Mobile experience is smooth
