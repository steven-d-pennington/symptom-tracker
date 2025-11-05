# E2E Test Execution Guide - Playwright MCP

**Quick Reference:** How to execute E2E tests using Playwright MCP Server

---

## Quick Start

### 1. Prerequisites

```bash
# Start the application
npm run dev
# App should be at http://localhost:3001

# Ensure Playwright MCP server is connected
# Check MCP connection in your IDE/tool
```

### 2. Test Execution Commands

**To execute a specific test scenario**, follow the step-by-step instructions in `e2e-test-plan-body-map.md` and use the Playwright MCP tools as specified.

---

## MCP Tool Quick Reference

### Navigation
```
Tool: playwright_navigate
URL: http://localhost:3001/flares/new
Wait condition: networkidle / domcontentloaded
```

### Element Interaction
```
Tool: playwright_click
Selector: [data-testid="add-marker-button"]
OR
Selector: button:has-text("Save")
```

### Form Input
```
Tool: playwright_fill
Selector: input[name="severity"]
Value: "7"
```

### Visual Validation
```
Tool: playwright_screenshot
Filename: marker-preview-state.png
Full page: true (optional)
```

### JavaScript Evaluation
```
Tool: playwright_evaluate
Script: |
  const markers = document.querySelectorAll('[data-marker-id]');
  return {
    count: markers.length,
    visible: markers.length > 0
  };
```

### Console Monitoring
```
Tool: console_logs
Filter: error | warning | all
Since: last execution
```

### Network Monitoring
```
Tool: network_activity
Filter: fetch | xhr | all
Pattern: /api/* (optional)
```

---

## Example: Complete Test Scenario Execution

### Scenario: "Region Focus Navigation" (Test 1.1)

**Step 1: Navigate to page**
```
MCP Tool: playwright_navigate
Parameters:
  url: "http://localhost:3001/flares/new"
  waitUntil: "networkidle"
```

**Step 2: Verify body map loaded**
```
MCP Tool: playwright_evaluate
Parameters:
  expression: "document.querySelectorAll('[data-region-id]').length > 30"

Expected Output: true
```

**Step 3: Take baseline screenshot**
```
MCP Tool: playwright_screenshot
Parameters:
  path: "screenshots/body-map-initial.png"
  fullPage: false
```

**Step 4: Click knee region**
```
MCP Tool: playwright_click
Parameters:
  selector: "[data-region-id='knee-left']"
  timeout: 5000
```

**Step 5: Verify region detail view**
```
MCP Tool: playwright_screenshot
Parameters:
  path: "screenshots/region-detail-knee.png"
```

**Step 6: Validate viewBox transformation**
```
MCP Tool: playwright_evaluate
Parameters:
  expression: |
    const svg = document.querySelector('.region-detail-view svg');
    const viewBox = svg?.getAttribute('viewBox');
    const isZoomed = viewBox && viewBox !== '0 0 400 800';
    return {
      viewBox,
      isZoomed,
      regionName: document.querySelector('[data-testid="region-detail-view"] h2')?.textContent
    };

Expected Output:
  {
    viewBox: "145 540 90 90" (or similar focused viewBox),
    isZoomed: true,
    regionName: "Knee (Left)"
  }
```

**Step 7: Monitor for errors**
```
MCP Tool: console_logs
Parameters:
  filter: "error"

Expected Output: [] (no errors)
```

**✅ Test Pass Criteria:**
- All MCP commands execute without errors
- Screenshots show expected UI states
- ViewBox is focused on knee region
- No console errors

---

## Common Test Patterns

### Pattern 1: Click → Screenshot → Validate

```javascript
// 1. Perform action
MCP Tool: playwright_click
Selector: "[data-testid='action-button']"

// 2. Capture result
MCP Tool: playwright_screenshot
Filename: "result-state.png"

// 3. Validate outcome
MCP Tool: playwright_evaluate
Script: |
  return {
    success: document.querySelector('[data-success="true"]') !== null,
    message: document.querySelector('.message')?.textContent
  };
```

### Pattern 2: Form Fill → Submit → Verify

```javascript
// 1. Fill form fields
MCP Tool: playwright_fill
Selector: "#severity"
Value: "7"

MCP Tool: playwright_fill
Selector: "#notes"
Value: "Test note"

// 2. Submit form
MCP Tool: playwright_click
Selector: "button:has-text('Save')"

// 3. Wait for network
MCP Tool: network_activity
Filter: "fetch"
// Verify POST request completed

// 4. Verify result
MCP Tool: playwright_evaluate
Script: "!!document.querySelector('[data-saved=\"true\"]')"
```

### Pattern 3: State Check → Action → State Recheck

```javascript
// 1. Capture initial state
MCP Tool: playwright_evaluate
Script: |
  return {
    markerCount: document.querySelectorAll('[data-marker-id]').length,
    isFullscreen: !!document.querySelector('[data-fullscreen="true"]')
  };

// 2. Perform action
MCP Tool: playwright_click
Selector: "[aria-label='Enter full screen']"

// 3. Verify state changed
MCP Tool: playwright_evaluate
Script: |
  return {
    markerCount: document.querySelectorAll('[data-marker-id]').length,
    isFullscreen: !!document.querySelector('[data-fullscreen="true"]')
  };
// Expect: markerCount unchanged, isFullscreen changed to true
```

---

## Debugging Failed Tests

### When a test fails:

1. **Check the last screenshot**
   - Visual state may reveal unexpected UI

2. **Review console logs**
   ```
   MCP Tool: console_logs
   Filter: "error"
   ```

3. **Inspect element state**
   ```
   MCP Tool: playwright_evaluate
   Script: |
     const element = document.querySelector('[selector]');
     return {
       exists: !!element,
       visible: element?.offsetParent !== null,
       classes: element?.className,
       attributes: Object.fromEntries(
         Array.from(element?.attributes || []).map(a => [a.name, a.value])
       )
     };
   ```

4. **Check network activity**
   ```
   MCP Tool: network_activity
   Filter: "all"
   // Look for failed requests (status !== 200)
   ```

5. **Verify timing issues**
   - Add explicit waits
   - Check for race conditions
   - Verify async operations completed

---

## Test Data Management

### Setting Up Test Data

**Before running tests, ensure:**

```javascript
// Check test user exists
MCP Tool: playwright_evaluate
Script: |
  // Navigate to /flares first
  return fetch('/api/flares?userId=test-user-001')
    .then(r => r.json())
    .then(flares => ({
      userExists: true,
      flareCount: flares.length,
      hasActive: flares.some(f => f.status === 'active'),
      hasResolved: flares.some(f => f.status === 'resolved')
    }));

Expected:
  {
    userExists: true,
    flareCount: >= 1,
    hasActive: true,
    hasResolved: true (for history tests)
  }
```

### Cleaning Up After Tests

```javascript
// Optional: Clean up test markers
MCP Tool: playwright_evaluate
Script: |
  // Delete test markers created during testing
  const testMarkers = document.querySelectorAll('[data-marker-test="true"]');
  testMarkers.forEach(m => m.remove());
  return { cleaned: testMarkers.length };
```

---

## Performance Monitoring

### Measuring Transition Times

```javascript
MCP Tool: playwright_evaluate
Script: |
  performance.mark('transition-start');

  // Perform action
  document.querySelector('[data-region-id="knee-left"]').click();

  // Wait for transition
  await new Promise(resolve => {
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-testid="region-detail-view"]')) {
        performance.mark('transition-end');
        performance.measure('transition', 'transition-start', 'transition-end');
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { subtree: true, childList: true });
  });

  const measure = performance.getEntriesByName('transition')[0];
  return {
    duration: measure.duration,
    acceptable: measure.duration < 300 // 300ms budget
  };
```

---

## Accessibility Validation

### ARIA Label Audit

```javascript
MCP Tool: playwright_evaluate
Script: |
  const violations = [];
  const interactive = document.querySelectorAll('button, [role="button"], input, select, a');

  interactive.forEach(el => {
    const hasLabel = el.getAttribute('aria-label') ||
                     el.getAttribute('aria-labelledby') ||
                     el.textContent?.trim();

    if (!hasLabel) {
      violations.push({
        tag: el.tagName,
        id: el.id,
        class: el.className
      });
    }
  });

  return {
    total: interactive.length,
    violations: violations.length,
    details: violations
  };

Expected: violations === 0
```

### Touch Target Size Audit

```javascript
MCP Tool: playwright_evaluate
Script: |
  const tooSmall = [];
  const interactive = document.querySelectorAll('button, [role="button"], a');

  interactive.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      tooSmall.push({
        element: el.getAttribute('aria-label') || el.textContent?.substring(0, 20),
        width: rect.width,
        height: rect.height
      });
    }
  });

  return {
    total: interactive.length,
    violations: tooSmall.length,
    details: tooSmall
  };

Expected: violations === 0
```

---

## Mobile Testing

### Set Mobile Viewport

```javascript
// Configure for mobile testing
MCP Tool: playwright_evaluate
Script: |
  // Note: Proper viewport setting should be done via Playwright config
  // This is a simulation for validation
  document.body.style.width = '375px';
  document.body.style.height = '667px';

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
```

### Verify Mobile Layout

```javascript
MCP Tool: playwright_screenshot
Filename: "mobile-viewport-375x667.png"

MCP Tool: playwright_evaluate
Script: |
  return {
    bodyMapWidth: document.querySelector('.body-map-viewer')?.offsetWidth,
    viewportWidth: window.innerWidth,
    isMobileOptimized: document.querySelector('.body-map-viewer')?.offsetWidth <= 375
  };
```

---

## Continuous Testing Workflow

### Daily Smoke Test Suite

**Run these critical scenarios daily:**

1. Region Focus Navigation (1.1)
2. Marker Preview (2.1)
3. Confirm Marker (2.2)
4. Full-Screen Toggle (4.1)
5. ARIA Labels Audit (6.1)

**Execution time:** ~5 minutes

### Pre-Release Full Regression

**Run all scenarios before release:**
- All Story 3.7.1 scenarios (Region Focus)
- All Story 3.7.2 scenarios (Marker Preview)
- All Story 3.7.4 scenarios (Full-Screen)
- All Story 3.7.5 scenarios (History Toggle)
- All Story 3.7.6 scenarios (Accessibility)
- All Mobile scenarios
- All Performance scenarios

**Execution time:** ~30 minutes

---

## Reporting Results

### Generate Test Report

After executing all scenarios, compile results:

```markdown
# Test Execution Report - [Date]

## Summary
- Total Scenarios: 20
- Passed: 18 ✅
- Failed: 2 ❌
- Duration: 28 minutes

## Failed Scenarios
1. **Scenario 2.1 - Marker Preview**
   - Issue: Preview opacity incorrect (0.7 instead of 0.5)
   - Screenshot: marker-preview-fail.png
   - Priority: P2 (Low)

2. **Scenario 6.2 - Touch Targets**
   - Issue: Cancel button is 42x42px (should be 44x44px)
   - Screenshot: touch-target-violation.png
   - Priority: P1 (High)

## Defects Filed
- DEF-123: Marker preview opacity inconsistent
- DEF-124: Cancel button touch target too small

## Next Actions
- Fix DEF-124 (P1) before release
- DEF-123 can be addressed in next sprint
```

---

## Tips for Efficient Testing

1. **Use descriptive screenshot names**
   - ✅ `region-detail-knee-left-focused.png`
   - ❌ `screenshot1.png`

2. **Validate incrementally**
   - Don't wait until end of test to validate
   - Check state after each major action

3. **Save state between steps**
   - Store values from early steps
   - Use for comparison in later steps

4. **Document unexpected behavior immediately**
   - Take extra screenshots
   - Capture console logs
   - Note exact reproduction steps

5. **Test in isolation**
   - Each scenario should be independent
   - Don't rely on previous test state
   - Reset to known state before each test

---

## Advanced Techniques

### Visual Regression Testing

```javascript
// Capture baseline
MCP Tool: playwright_screenshot
Filename: "baseline/body-map-initial.png"

// After changes, compare
MCP Tool: playwright_screenshot
Filename: "current/body-map-initial.png"

// Manual comparison or use image diff tools
```

### Network Interception

```javascript
// Monitor specific API calls
MCP Tool: network_activity
Filter: "fetch"
Pattern: "/api/flares"

// Verify expected requests were made
Expected: POST /api/flares with marker data
```

### Custom Assertions

```javascript
MCP Tool: playwright_evaluate
Script: |
  // Custom assertion helper
  function assertMarkerState(marker, expected) {
    const actual = {
      severity: marker.getAttribute('data-severity'),
      status: marker.getAttribute('data-status'),
      region: marker.getAttribute('data-region')
    };

    return {
      pass: JSON.stringify(actual) === JSON.stringify(expected),
      actual,
      expected
    };
  }

  const marker = document.querySelector('[data-marker-id="marker-1"]');
  return assertMarkerState(marker, {
    severity: "7",
    status: "active",
    region: "knee-left"
  });
```

---

## Summary

This guide provides everything needed to execute E2E tests using the Playwright MCP server. For detailed test scenarios and acceptance criteria, refer to `e2e-test-plan-body-map.md`.

**Key Takeaways:**
- Always screenshot before and after critical actions
- Use playwright_evaluate for complex validations
- Monitor console and network activity
- Document failures with screenshots and logs
- Test incrementally, not all at once

**Success = Systematic execution + Clear documentation + Visual validation**
