# E2E Test Execution - Quick Reference

**Quick guide for running complete application E2E tests**

---

## Quick Start

### 1. Setup
```bash
# Start app
npm run dev

# Clear browser data (for onboarding tests)
# Open DevTools → Application → Storage → Clear site data

# Navigate to app
http://localhost:3001
```

### 2. Run Test Suite

**Choose your approach:**

- **Manual Execution:** Follow test plan step-by-step
- **MCP Orchestration:** Use Playwright MCP tools
- **Automated:** Script the test scenarios (future)

---

## Test Suite Organization

### 📘 Complete App Tests
**File:** `e2e-test-plan-complete-app.md`

| Journey | Scenarios | Est. Time | Priority |
|---------|-----------|-----------|----------|
| 1. Onboarding | 2 | 5 min | P0 |
| 2. Daily Tracking | 3 | 8 min | P0 |
| 3. Flare Management | 3 | 10 min | P1 |
| 4. Body Map Usage | 3 | 12 min | P1 |
| 5. Analytics | 3 | 8 min | P1 |
| Quick Log Suite | 6 | 10 min | P0 |
| Data Management | 3 | 8 min | P2 |
| Integration Tests | 3 | 12 min | P1 |

**Total: ~73 minutes for full suite**

### 📗 Body Map Tests
**File:** `e2e-test-plan-body-map.md`

| Feature | Scenarios | Est. Time | Priority |
|---------|-----------|-----------|----------|
| Region Focus | 2 | 4 min | P1 |
| Marker Preview | 4 | 8 min | P1 |
| Full-Screen | 3 | 6 min | P1 |
| History Toggle | 1 | 3 min | P2 |
| Accessibility | 3 | 5 min | P1 |
| Mobile | 1 | 3 min | P1 |

**Total: ~29 minutes**

---

## Daily Smoke Tests (15 minutes)

**Run these critical paths daily:**

### 1. Onboarding Flow (3 min)
```
✓ Landing → Get Started → Data Selection → Dashboard
✓ Empty state shows
✓ Quick log buttons visible
```

### 2. Quick Logging (5 min)
```
✓ Log symptom → Appears on dashboard
✓ Log food → Appears on timeline
✓ Log medication → Saves successfully
```

### 3. Flare Creation (4 min)
```
✓ Create flare → Add body map marker → Save
✓ Flare appears in active list
✓ Marker visible on body map
```

### 4. Analytics View (3 min)
```
✓ Navigate to analytics
✓ Charts load with data
✓ No console errors
```

**Pass Criteria:** All 4 flows complete without errors

---

## Pre-Release Full Regression (90 minutes)

**Run before every release:**

### Phase 1: Core Features (30 min)
```
□ Complete onboarding flow
□ All quick log modals
□ Dashboard layout and widgets
□ Navigation between pages
```

### Phase 2: Advanced Features (30 min)
```
□ Flare creation and management
□ Body map with markers
□ Region focus and zoom
□ Full-screen mode
□ History toggle
```

### Phase 3: Analytics & Data (30 min)
```
□ Dashboard analytics
□ Correlation analysis
□ Calendar/timeline view
□ Data export
□ Data import
□ Clear data
```

---

## Test Execution Patterns

### Pattern 1: Modal Test
```javascript
// 1. Open modal
Click: [data-testid="quick-log-{type}"]
Screenshot: "{type}/modal-open.png"

// 2. Verify form
Evaluate: Has required fields

// 3. Fill form
Fill: All fields with test data

// 4. Submit
Click: button:has-text("Save")

// 5. Verify result
Evaluate: Entry appears on dashboard
Screenshot: "{type}/saved-entry.png"
```

### Pattern 2: Navigation Test
```javascript
// 1. Click nav link
Click: a[href="/page"]

// 2. Verify page loaded
Evaluate: window.location.pathname === "/page"
Screenshot: "page-loaded.png"

// 3. Verify content
Evaluate: Expected elements present

// 4. Verify no errors
Console: Check for errors
```

### Pattern 3: Data Persistence Test
```javascript
// 1. Perform action (log entry)
// 2. Screenshot: "before-refresh.png"
// 3. Refresh page
Navigate: Same URL

// 4. Verify data persists
Evaluate: Entry still visible
Screenshot: "after-refresh.png"
```

---

## Common Test Scenarios

### Scenario: Complete User Journey
**Time:** 20 minutes

```
1. Onboarding
   - Get Started → Select tracking options → Enter app
   - Verify: Dashboard with empty state

2. First Logs
   - Log symptom: "Headache" severity 7
   - Log food: "Coffee" at Breakfast
   - Verify: Both appear on timeline

3. Create Flare
   - Navigate to /flares
   - Create flare: "Knee - Left" severity 8
   - Add body map marker
   - Verify: Flare active, marker visible

4. View Analytics
   - Navigate to /analytics
   - Verify: Charts show logged data
   - Check correlation: Food → Symptom

5. Data Management
   - Export data to JSON
   - Verify: Download completes
   - Import back
   - Verify: Data appears

✅ Pass if all 5 steps complete successfully
```

---

## Debugging Failed Tests

### When a test fails:

**1. Capture Evidence**
```
Screenshot: "failure-state.png"
Console logs: Check for errors
Network: Check for failed requests
```

**2. Verify Pre-conditions**
```
Is app running?
Is data cleared (if required)?
Is browser in correct state?
```

**3. Check Common Issues**

| Issue | Check | Fix |
|-------|-------|-----|
| Element not found | Is selector correct? | Update selector |
| Timing issue | Is element loaded? | Add wait |
| Data not persisting | IndexedDB working? | Clear and retry |
| Modal not opening | Is button clickable? | Check z-index |
| Form not submitting | Validation errors? | Check required fields |

**4. Isolate the Problem**
```
Run just the failing step
Check if previous steps affected state
Try in fresh browser session
```

**5. Document and Report**
```
Create bug ticket with:
- Steps to reproduce
- Expected vs actual result
- Screenshots
- Console errors
- Environment info
```

---

## Test Data Management

### Creating Test Data

**Symptom Data:**
```json
{
  "symptom": "Headache",
  "severity": 7,
  "timestamp": "2025-01-15T10:00:00",
  "notes": "Throbbing pain, right temple"
}
```

**Food Data:**
```json
{
  "food": "Apple",
  "mealType": "Breakfast",
  "portion": "1 medium",
  "timestamp": "2025-01-15T08:00:00"
}
```

**Flare Data:**
```json
{
  "bodyRegion": "knee-left",
  "severity": 8,
  "status": "active",
  "startDate": "2025-01-15T07:00:00",
  "notes": "Sharp pain when walking"
}
```

### Test User Profiles

**Profile: New User**
- No data
- Complete onboarding
- Log first entries

**Profile: Active User**
- 7-14 days of data
- 1-2 active flares
- Regular logging

**Profile: Power User**
- 30+ days of data
- Multiple flares (active + resolved)
- Uses all features

---

## Performance Benchmarks

### Target Metrics

| Action | Target | Acceptable | Fail |
|--------|--------|------------|------|
| Dashboard Load | < 1s | < 2s | > 2s |
| Modal Open | < 200ms | < 300ms | > 500ms |
| Body Map Render | < 500ms | < 1s | > 2s |
| Analytics Load | < 2s | < 3s | > 5s |
| Form Submit | < 300ms | < 500ms | > 1s |
| Page Navigation | < 500ms | < 1s | > 2s |

### Measuring Performance

```javascript
MCP Tool: playwright_evaluate
Script: |
  performance.mark('action-start');

  // Perform action
  document.querySelector('button').click();

  // Wait for completion
  await new Promise(resolve => {
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-loaded]')) {
        performance.mark('action-end');
        performance.measure('action', 'action-start', 'action-end');
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { subtree: true, childList: true });
  });

  const measure = performance.getEntriesByName('action')[0];
  return {
    duration: measure.duration,
    acceptable: measure.duration < 2000
  };
```

---

## Accessibility Checklist

**Run on every major page:**

### Keyboard Navigation
```
□ Tab navigates to all interactive elements
□ Enter/Space activates buttons
□ Escape closes modals
□ Arrow keys work in dropdowns
□ Focus is visible (outline/highlight)
```

### ARIA Labels
```
□ All buttons have aria-label or text
□ All inputs have labels
□ All regions have aria-label
□ Interactive elements have roles
```

### Visual
```
□ Text contrast meets WCAG AA (4.5:1)
□ Touch targets are 44x44px minimum
□ Focus indicators are visible
□ No flashing/seizure triggers
```

### Screen Reader
```
□ Page structure is logical
□ Headings are properly nested
□ Forms are clearly labeled
□ Errors are announced
□ Success messages are announced
```

**Tool for checking:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  // Quick accessibility audit
  const issues = [];

  // Check buttons without labels
  document.querySelectorAll('button').forEach(btn => {
    if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
      issues.push('Button without label: ' + btn.outerHTML.substring(0, 50));
    }
  });

  // Check inputs without labels
  document.querySelectorAll('input').forEach(input => {
    const id = input.id;
    if (id && !document.querySelector(`label[for="${id}"]`) &&
        !input.getAttribute('aria-label')) {
      issues.push('Input without label: ' + input.name);
    }
  });

  // Check touch target sizes
  document.querySelectorAll('button, a').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      issues.push(`Small touch target: ${el.textContent?.substring(0, 20)} (${rect.width}x${rect.height})`);
    }
  });

  return {
    issueCount: issues.length,
    issues: issues.slice(0, 10)
  };
```

---

## Mobile Testing

### Setup Mobile Viewport
```javascript
// Set viewport to mobile
viewport: { width: 375, height: 667 }
deviceScaleFactor: 2

// Or use playwright_evaluate
window.resizeTo(375, 667);
```

### Mobile-Specific Tests

**1. Touch Targets**
```
Verify all buttons are 44x44px minimum
Test tap interactions (no hover required)
```

**2. Responsive Layout**
```
Body map scales appropriately
Modals are full-screen or properly sized
Navigation collapses to mobile menu
```

**3. Gestures**
```
Swipe to navigate (if supported)
Pinch to zoom on body map (if supported)
Pull to refresh (if supported)
```

**4. Performance**
```
Pages load quickly on slower network
Images are optimized
No layout shifts
```

---

## Continuous Testing

### Daily Automated Checks
```bash
# Run smoke tests every morning
# Checks critical paths: onboarding, logging, viewing

Time: 15 minutes
Frequency: Daily
Trigger: Automated schedule or git push
```

### Pre-Deployment Validation
```bash
# Full regression before each release
# All scenarios in complete test plan

Time: 90 minutes
Frequency: Before every release
Trigger: Manual or release branch creation
```

### Monitoring in Production
```bash
# Synthetic monitoring of critical flows
# Real user monitoring (RUM) for performance

Frequency: Continuous
Alerts: On failures or performance degradation
```

---

## Test Reporting

### Daily Report Template
```markdown
# Daily Smoke Test - [Date]

## Status: ✅ PASS / ❌ FAIL

### Tests Run
- Onboarding: ✅
- Quick Logging: ✅
- Flare Creation: ✅
- Analytics: ✅

### Duration: 14 minutes

### Issues: None

### Next Actions: None required
```

### Release Report Template
```markdown
# Release E2E Test Report - v[X.Y.Z]

## Summary
- Total Scenarios: 35
- Passed: 34 ✅
- Failed: 1 ❌
- Duration: 88 minutes

## Failed Tests
1. **Data Import Preview**
   - Bug: [LINK]
   - Severity: P2
   - Workaround: Manual import works

## Performance
All metrics within acceptable range ✅

## Accessibility
No violations found ✅

## Recommendation
✅ APPROVED for release
(Fix import bug in next patch)
```

---

## Quick Commands Reference

### Navigate
```
playwright_navigate
URL: http://localhost:3001/[page]
```

### Click
```
playwright_click
Selector: [data-testid="element"]
OR: button:has-text("Text")
```

### Fill
```
playwright_fill
Selector: input[name="field"]
Value: "test value"
```

### Screenshot
```
playwright_screenshot
Filename: "category/description.png"
```

### Evaluate
```
playwright_evaluate
Script: |
  return {
    property: value,
    check: condition
  };
```

### Console
```
console_logs
Filter: error | warning | all
```

### Network
```
network_activity
Pattern: /api/*
Filter: fetch | xhr
```

---

## Tips for Success

1. **Always screenshot before and after actions**
2. **Verify state after each major step**
3. **Use data-testid for stable selectors**
4. **Wait for animations to complete**
5. **Check console for errors after each action**
6. **Test in fresh browser session for critical paths**
7. **Document unexpected behavior immediately**
8. **Take extra screenshots when debugging**
9. **Use descriptive filenames for screenshots**
10. **Keep test data realistic but simple**

---

## Support

**Test Plan Documentation:**
- Complete App: `e2e-test-plan-complete-app.md`
- Body Map: `e2e-test-plan-body-map.md`
- Execution Guide: `e2e-test-execution-guide.md`

**Need Help?**
- Check test plan for detailed steps
- Review screenshots from previous runs
- Compare with expected results
- Document issue and create bug ticket

---

## Success Criteria

**Daily Smoke Tests:** All 4 critical paths pass
**Full Regression:** 95%+ scenarios pass
**Performance:** All metrics in acceptable range
**Accessibility:** Zero violations
**Mobile:** All features work on mobile viewport

**When all criteria met:** ✅ Ready for release
