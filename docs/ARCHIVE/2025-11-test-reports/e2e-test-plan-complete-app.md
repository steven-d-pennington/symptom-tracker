# Complete Application E2E Test Plan - Symptom Tracker

**Scope:** End-to-end testing of entire application
**Framework:** Playwright (via MCP Server)
**Coverage:** Onboarding → Quick Logs → Flares → Body Map → Analytics → Data Verification

---

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [User Journey 1: First-Time User Onboarding](#user-journey-1-first-time-user-onboarding)
3. [User Journey 2: Daily Symptom Tracking](#user-journey-2-daily-symptom-tracking)
4. [User Journey 3: Flare Management](#user-journey-3-flare-management)
5. [User Journey 4: Body Map Usage](#user-journey-4-body-map-usage)
6. [User Journey 5: Analytics & Insights](#user-journey-5-analytics--insights)
7. [Feature Test Suite: Quick Log Modals](#feature-test-suite-quick-log-modals)
8. [Feature Test Suite: Dashboard](#feature-test-suite-dashboard)
9. [Feature Test Suite: Data Management](#feature-test-suite-data-management)
10. [Integration Tests: Cross-Feature Validation](#integration-tests-cross-feature-validation)
11. [Regression Test Suite](#regression-test-suite)

---

## Test Environment Setup

### Prerequisites

```bash
# 1. Start application
npm run dev
# App at: http://localhost:3001

# 2. Clear browser data (for fresh onboarding test)
# IndexedDB: symptom-tracker-db
# LocalStorage: clear all keys

# 3. Prepare test data files (for import tests)
# - test-export.json (sample export file)
# - test-photos.zip (sample photos)
```

### Test User Profiles

**Profile 1: First-Time User (Alex)**
- Never used the app
- Needs onboarding
- Will log symptoms, food, medications

**Profile 2: Active User (Jordan)**
- Has 2 weeks of data
- Has active flare
- Uses analytics regularly

**Profile 3: Power User (Taylor)**
- 3+ months of data
- Multiple flares (active and resolved)
- Uses all features (body map, correlations, exports)

### Browser Configuration

```javascript
// Desktop
viewport: { width: 1280, height: 720 }
deviceScaleFactor: 1

// Mobile
viewport: { width: 375, height: 667 }
deviceScaleFactor: 2
```

---

## User Journey 1: First-Time User Onboarding

### Scenario 1.1: Landing Page → Onboarding

**User Story:** As a first-time user, I want to understand what the app does and start tracking

**Pre-conditions:**
- Clear browser data
- Navigate to http://localhost:3001

**Test Steps:**

#### Step 1: Verify Landing Page

```
MCP Tool: playwright_navigate
URL: http://localhost:3001
Wait: networkidle

MCP Tool: playwright_screenshot
Filename: onboarding/01-landing-page.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  return {
    title: document.querySelector('h1')?.textContent,
    hasGetStarted: !!document.querySelector('button:has-text("Get Started")'),
    hasDescription: document.body.textContent.includes('track') ||
                    document.body.textContent.includes('symptom')
  };

Expected:
  {
    title: "Symptom Tracker" (or similar),
    hasGetStarted: true,
    hasDescription: true
  }
```

#### Step 2: Click Get Started

```
MCP Tool: playwright_click
Selector: button:has-text("Get Started"), [data-testid="get-started-button"]

MCP Tool: playwright_screenshot
Filename: onboarding/02-onboarding-start.png
```

#### Step 3: Onboarding - Data Selection

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  return {
    currentStep: document.querySelector('[data-testid="onboarding-step"]')?.textContent,
    hasSymptomOption: !!document.querySelector('[data-value="symptoms"]'),
    hasFoodOption: !!document.querySelector('[data-value="food"]'),
    hasFlareOption: !!document.querySelector('[data-value="flares"]')
  };
```

**Action: Select tracking options**
```
MCP Tool: playwright_click
Selector: [data-value="symptoms"]

MCP Tool: playwright_click
Selector: [data-value="food"]

MCP Tool: playwright_click
Selector: [data-value="flares"]

MCP Tool: playwright_screenshot
Filename: onboarding/03-data-selection.png
```

#### Step 4: Continue to Main App

```
MCP Tool: playwright_click
Selector: button:has-text("Continue"), button:has-text("Start Tracking")

MCP Tool: playwright_screenshot
Filename: onboarding/04-dashboard-first-view.png
```

**Validation: Dashboard loaded**
```javascript
MCP Tool: playwright_evaluate
Script: |
  return {
    url: window.location.pathname,
    hasSidebar: !!document.querySelector('[data-testid="sidebar"]'),
    hasQuickLog: !!document.querySelector('[data-testid="quick-log-buttons"]'),
    hasEmptyState: document.body.textContent.includes('No data yet') ||
                   document.body.textContent.includes('Start logging')
  };

Expected:
  {
    url: "/dashboard" (or similar),
    hasSidebar: true,
    hasQuickLog: true,
    hasEmptyState: true
  }
```

**Expected Results:**
- ✅ Onboarding flow completes successfully
- ✅ User lands on dashboard
- ✅ Empty state shows (no data yet)
- ✅ Quick log buttons visible
- ✅ Navigation sidebar present

---

### Scenario 1.2: Dashboard Tour / Feature Discovery

**Pre-conditions:**
- User completed onboarding
- On dashboard

**Test Steps:**

#### Step 1: Identify Quick Log Options

```javascript
MCP Tool: playwright_evaluate
Script: |
  const buttons = document.querySelectorAll('[data-testid*="quick-log"], button[aria-label*="Log"]');
  return {
    count: buttons.length,
    types: Array.from(buttons).map(b => b.textContent || b.getAttribute('aria-label'))
  };

Expected: At least 4-5 quick log options (Symptom, Food, Medication, Trigger, etc.)
```

#### Step 2: Verify Navigation Menu

```javascript
MCP Tool: playwright_evaluate
Script: |
  const navItems = document.querySelectorAll('nav a, [role="navigation"] a');
  return {
    menuItems: Array.from(navItems).map(a => ({
      text: a.textContent?.trim(),
      href: a.getAttribute('href')
    }))
  };

Expected navigation items:
  - Dashboard
  - Flares
  - Analytics / Correlations
  - Calendar / Timeline
  - Settings / Data Management
```

#### Step 3: Take Tour Screenshot

```
MCP Tool: playwright_screenshot
Filename: onboarding/05-dashboard-overview.png
```

**Expected Results:**
- ✅ All quick log buttons visible
- ✅ Navigation menu accessible
- ✅ Clean, organized layout
- ✅ Clear call-to-action for first log

---

## User Journey 2: Daily Symptom Tracking

### Scenario 2.1: Log First Symptom

**User Story:** As a user, I want to quickly log a symptom when I experience it

**Pre-conditions:**
- User is on dashboard
- No previous symptom logs

**Test Steps:**

#### Step 1: Open Symptom Log Modal

```
MCP Tool: playwright_click
Selector: [data-testid="quick-log-symptom"], button:has-text("Log Symptom")

MCP Tool: playwright_screenshot
Filename: symptoms/01-symptom-modal-open.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const modal = document.querySelector('[data-testid="symptom-modal"]');
  return {
    modalOpen: !!modal,
    hasSymptomInput: !!modal?.querySelector('input[name="symptom"], select[name="symptom"]'),
    hasSeverityInput: !!modal?.querySelector('input[type="range"], input[name="severity"]'),
    hasTimeInput: !!modal?.querySelector('input[type="datetime-local"], input[name="timestamp"]')
  };

Expected: All fields should be present
```

#### Step 2: Fill Symptom Details

```
# Select symptom type
MCP Tool: playwright_click
Selector: select[name="symptom"]

MCP Tool: playwright_click
Selector: option:has-text("Headache")

# Set severity
MCP Tool: playwright_fill
Selector: input[name="severity"], input[type="range"]
Value: 7

# Add notes (optional)
MCP Tool: playwright_fill
Selector: textarea[name="notes"]
Value: "Throbbing pain, right temple"

MCP Tool: playwright_screenshot
Filename: symptoms/02-symptom-form-filled.png
```

#### Step 3: Submit Symptom Log

```
MCP Tool: playwright_click
Selector: button:has-text("Save"), button:has-text("Log Symptom")

# Wait for modal to close
MCP Tool: playwright_evaluate
Script: |
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    modalClosed: !document.querySelector('[data-testid="symptom-modal"]'),
    successMessage: document.querySelector('[role="alert"]')?.textContent
  };

Expected:
  {
    modalClosed: true,
    successMessage: contains "logged" or "saved"
  }
```

#### Step 4: Verify Symptom Appears on Dashboard

```
MCP Tool: playwright_screenshot
Filename: symptoms/03-symptom-on-dashboard.png

MCP Tool: playwright_evaluate
Script: |
  const entries = document.querySelectorAll('[data-testid="symptom-entry"]');
  const firstEntry = entries[0];

  return {
    entryCount: entries.length,
    firstEntry: {
      symptom: firstEntry?.textContent,
      severity: firstEntry?.querySelector('[data-testid="severity"]')?.textContent,
      timestamp: firstEntry?.querySelector('[data-testid="timestamp"]')?.textContent
    }
  };

Expected:
  {
    entryCount: 1,
    firstEntry: {
      symptom: contains "Headache",
      severity: "7",
      timestamp: "Today" or recent time
    }
  }
```

**Expected Results:**
- ✅ Modal opens with all required fields
- ✅ Form accepts user input
- ✅ Save closes modal with success message
- ✅ Symptom appears on dashboard
- ✅ Timestamp is correct

---

### Scenario 2.2: Log Food Entry

**Pre-conditions:**
- User is on dashboard

**Test Steps:**

#### Step 1: Open Food Log Modal

```
MCP Tool: playwright_click
Selector: [data-testid="quick-log-food"], button:has-text("Log Food")

MCP Tool: playwright_screenshot
Filename: food/01-food-modal-open.png
```

#### Step 2: Search and Add Food Item

```
# Type in food search
MCP Tool: playwright_fill
Selector: input[placeholder*="Search"], input[name="foodSearch"]
Value: "Apple"

# Wait for autocomplete
MCP Tool: playwright_evaluate
Script: |
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    suggestions: document.querySelectorAll('[role="option"], [data-suggestion]').length
  };

# Click on suggestion or add custom
MCP Tool: playwright_click
Selector: [role="option"]:has-text("Apple"), button:has-text("Add")

MCP Tool: playwright_screenshot
Filename: food/02-food-item-selected.png
```

#### Step 3: Set Meal Time and Portion

```
# Select meal type
MCP Tool: playwright_click
Selector: select[name="mealType"]

MCP Tool: playwright_click
Selector: option:has-text("Breakfast")

# Set portion (optional)
MCP Tool: playwright_fill
Selector: input[name="portion"]
Value: "1 medium"

MCP Tool: playwright_screenshot
Filename: food/03-food-details-complete.png
```

#### Step 4: Save Food Entry

```
MCP Tool: playwright_click
Selector: button:has-text("Save"), button:has-text("Log Food")

MCP Tool: playwright_screenshot
Filename: food/04-food-on-dashboard.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const foodEntries = document.querySelectorAll('[data-testid="food-entry"]');
  return {
    entryCount: foodEntries.length,
    containsApple: Array.from(foodEntries).some(e =>
      e.textContent.toLowerCase().includes('apple')
    )
  };

Expected:
  {
    entryCount: >= 1,
    containsApple: true
  }
```

**Expected Results:**
- ✅ Food search works
- ✅ Autocomplete provides suggestions
- ✅ Can add custom foods
- ✅ Meal type and portion captured
- ✅ Food entry appears on dashboard

---

### Scenario 2.3: Log Multiple Entries in Succession

**Pre-conditions:**
- Dashboard with existing entries

**Test Steps:**

1. **Log Medication**
```
Click: [data-testid="quick-log-medication"]
Fill: medication name = "Ibuprofen"
Fill: dosage = "200mg"
Save
Verify: Medication appears on timeline
```

2. **Log Trigger**
```
Click: [data-testid="quick-log-trigger"]
Select: trigger type = "Stress"
Fill: notes = "Work deadline"
Save
Verify: Trigger appears on timeline
```

3. **Verify Timeline Order**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const timeline = document.querySelector('[data-testid="timeline"]');
  const entries = timeline?.querySelectorAll('[data-entry]');

  return {
    entryCount: entries?.length || 0,
    chronological: true, // Should be newest first
    types: Array.from(entries || []).map(e => e.getAttribute('data-entry-type'))
  };

Expected:
  {
    entryCount: >= 4,
    chronological: true,
    types: ["trigger", "medication", "food", "symptom"] (in reverse chronological)
  }
```

**Expected Results:**
- ✅ Can log multiple entry types successively
- ✅ All entries appear on timeline
- ✅ Entries are chronologically ordered
- ✅ Each entry type has distinct visual styling

---

## User Journey 3: Flare Management

### Scenario 3.1: Create New Flare

**User Story:** As a user experiencing a symptom flare, I want to track it as a distinct event

**Pre-conditions:**
- User has logged some symptoms
- Navigate to /flares

**Test Steps:**

#### Step 1: Navigate to Flares Page

```
MCP Tool: playwright_click
Selector: a[href="/flares"], nav:has-text("Flares")

MCP Tool: playwright_screenshot
Filename: flares/01-flares-page-empty.png
```

#### Step 2: Start New Flare

```
MCP Tool: playwright_click
Selector: button:has-text("New Flare"), [data-testid="create-flare-button"]

MCP Tool: playwright_screenshot
Filename: flares/02-create-flare-modal.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const modal = document.querySelector('[data-testid="flare-modal"]');
  return {
    modalOpen: !!modal,
    hasBodyRegionSelect: !!modal?.querySelector('[name="bodyRegion"]'),
    hasSeverityInput: !!modal?.querySelector('[name="severity"]'),
    hasNotesField: !!modal?.querySelector('[name="notes"]')
  };
```

#### Step 3: Fill Flare Details

```
# Select body region
MCP Tool: playwright_click
Selector: select[name="bodyRegion"]

MCP Tool: playwright_click
Selector: option:has-text("Knee - Left")

# Set initial severity
MCP Tool: playwright_fill
Selector: input[name="severity"]
Value: 8

# Add description
MCP Tool: playwright_fill
Selector: textarea[name="notes"]
Value: "Sharp pain when walking, started this morning"

MCP Tool: playwright_screenshot
Filename: flares/03-flare-details-filled.png
```

#### Step 4: Save Flare

```
MCP Tool: playwright_click
Selector: button:has-text("Create Flare"), button:has-text("Save")

MCP Tool: playwright_screenshot
Filename: flares/04-flare-created.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const flareCards = document.querySelectorAll('[data-testid="flare-card"]');
  const activeFlares = Array.from(flareCards).filter(c =>
    c.querySelector('[data-status="active"]')
  );

  return {
    totalFlares: flareCards.length,
    activeFlares: activeFlares.length,
    firstFlare: {
      region: activeFlares[0]?.querySelector('[data-region]')?.textContent,
      severity: activeFlares[0]?.querySelector('[data-severity]')?.textContent,
      status: activeFlares[0]?.getAttribute('data-status')
    }
  };

Expected:
  {
    totalFlares: 1,
    activeFlares: 1,
    firstFlare: {
      region: "Knee - Left",
      severity: "8",
      status: "active"
    }
  }
```

**Expected Results:**
- ✅ Flare creation modal opens
- ✅ Can select body region
- ✅ Can set severity
- ✅ Flare appears in active flares list
- ✅ Status shows as "active"

---

### Scenario 3.2: Update Flare Severity

**Pre-conditions:**
- Active flare exists
- On flares page

**Test Steps:**

#### Step 1: Open Flare Details

```
MCP Tool: playwright_click
Selector: [data-testid="flare-card"]:first-of-type

MCP Tool: playwright_screenshot
Filename: flares/05-flare-detail-view.png
```

#### Step 2: Add Severity Update

```
MCP Tool: playwright_click
Selector: button:has-text("Update Severity"), [data-testid="update-severity-button"]

# Change severity
MCP Tool: playwright_fill
Selector: input[name="severity"]
Value: 6

# Add update note
MCP Tool: playwright_fill
Selector: textarea[name="notes"]
Value: "Pain has decreased after rest and ice"

MCP Tool: playwright_click
Selector: button:has-text("Save Update")

MCP Tool: playwright_screenshot
Filename: flares/06-flare-updated.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const flareHistory = document.querySelectorAll('[data-testid="flare-history-entry"]');

  return {
    historyCount: flareHistory.length,
    latestSeverity: flareHistory[0]?.querySelector('[data-severity]')?.textContent,
    hasNote: flareHistory[0]?.textContent.includes('decreased')
  };

Expected:
  {
    historyCount: 2, // Initial + update
    latestSeverity: "6",
    hasNote: true
  }
```

**Expected Results:**
- ✅ Can update flare severity
- ✅ Update appears in flare history
- ✅ Current severity reflects latest update
- ✅ Notes are captured

---

### Scenario 3.3: Resolve Flare

**Pre-conditions:**
- Active flare exists with updates

**Test Steps:**

```
MCP Tool: playwright_click
Selector: button:has-text("Mark as Resolved"), [data-testid="resolve-flare-button"]

# Confirm resolution
MCP Tool: playwright_click
Selector: button:has-text("Confirm"), button:has-text("Yes")

MCP Tool: playwright_screenshot
Filename: flares/07-flare-resolved.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const activeFlares = document.querySelectorAll('[data-status="active"]');
  const resolvedFlares = document.querySelectorAll('[data-status="resolved"]');

  return {
    activeCount: activeFlares.length,
    resolvedCount: resolvedFlares.length,
    flareStatus: document.querySelector('[data-testid="flare-card"]')?.getAttribute('data-status')
  };

Expected:
  {
    activeCount: 0,
    resolvedCount: 1,
    flareStatus: "resolved"
  }
```

**Expected Results:**
- ✅ Flare moves to resolved status
- ✅ No longer appears in active flares
- ✅ Shows in resolved/history section
- ✅ Resolution timestamp captured

---

## User Journey 4: Body Map Usage

### Scenario 4.1: Mark Location on Body Map

**User Story:** As a user, I want to precisely mark where on my body I'm experiencing symptoms

**Pre-conditions:**
- Active flare exists OR creating new flare
- Body map is visible

**Test Steps:**

#### Step 1: Access Body Map

```
MCP Tool: playwright_navigate
URL: http://localhost:3001/flares/new
OR
URL: http://localhost:3001/flares/{flare-id}

MCP Tool: playwright_screenshot
Filename: bodymap/01-body-map-initial.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const svg = document.querySelector('[data-testid="body-map-viewer"] svg');
  const regions = document.querySelectorAll('[data-region-id]');

  return {
    svgExists: !!svg,
    viewBox: svg?.getAttribute('viewBox'),
    regionCount: regions.length,
    isInteractive: regions[0]?.style.cursor === 'pointer' ||
                   regions[0]?.classList.contains('clickable')
  };

Expected:
  {
    svgExists: true,
    viewBox: "0 0 400 800" (or similar full body view),
    regionCount: > 30,
    isInteractive: true
  }
```

#### Step 2: Click on Body Region

```
MCP Tool: playwright_click
Selector: [data-region-id="knee-left"]

MCP Tool: playwright_screenshot
Filename: bodymap/02-region-clicked.png
```

**Expected: Region detail view or marker preview**

#### Step 3: Place Marker with Preview

```
# If preview mode active:
# Preview marker should appear

MCP Tool: playwright_evaluate
Script: |
  return {
    previewVisible: !!document.querySelector('.marker-preview'),
    confirmButton: !!document.querySelector('[aria-label*="Confirm"]'),
    cancelButton: !!document.querySelector('[aria-label*="Cancel"]')
  };

Expected: All should be true
```

#### Step 4: Confirm Marker Position

```
MCP Tool: playwright_click
Selector: [aria-label="Confirm marker position"]

MCP Tool: playwright_screenshot
Filename: bodymap/03-marker-details-form.png
```

#### Step 5: Fill Marker Details

```
# Severity
MCP Tool: playwright_fill
Selector: input[name="severity"]
Value: 7

# Notes
MCP Tool: playwright_fill
Selector: textarea[name="notes"]
Value: "Sharp pain, inner side of knee"

MCP Tool: playwright_screenshot
Filename: bodymap/04-marker-form-filled.png
```

#### Step 6: Save Marker

```
MCP Tool: playwright_click
Selector: button:has-text("Save")

MCP Tool: playwright_screenshot
Filename: bodymap/05-marker-saved.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const markers = document.querySelectorAll('[data-marker-id]');
  const kneeMarkers = Array.from(markers).filter(m =>
    m.getAttribute('data-region') === 'knee-left'
  );

  return {
    totalMarkers: markers.length,
    kneeMarkers: kneeMarkers.length,
    markerSeverity: kneeMarkers[0]?.getAttribute('data-severity'),
    markerVisible: kneeMarkers[0]?.offsetParent !== null
  };

Expected:
  {
    totalMarkers: >= 1,
    kneeMarkers: 1,
    markerSeverity: "7",
    markerVisible: true
  }
```

**Expected Results:**
- ✅ Can click on body region
- ✅ Preview marker appears
- ✅ Can position marker precisely
- ✅ Marker details form opens
- ✅ Marker saves and appears on body map
- ✅ Marker has correct severity indicator

---

### Scenario 4.2: Region Focus and Zoom

**Pre-conditions:**
- Body map with at least one marker

**Test Steps:**

#### Step 1: Click Region to Focus

```
MCP Tool: playwright_click
Selector: [data-region-id="shoulder-right"]

MCP Tool: playwright_screenshot
Filename: bodymap/06-region-focused.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const svg = document.querySelector('.region-detail-view svg') ||
              document.querySelector('[data-view="region-detail"] svg');
  const viewBox = svg?.getAttribute('viewBox');

  // Parse viewBox
  const [x, y, width, height] = viewBox?.split(' ').map(Number) || [];

  return {
    inDetailView: !!document.querySelector('[data-testid="region-detail-view"]'),
    viewBox,
    isZoomed: width < 400 && height < 800, // Zoomed if smaller than full body
    regionName: document.querySelector('h2')?.textContent
  };

Expected:
  {
    inDetailView: true,
    isZoomed: true,
    regionName: contains "Shoulder"
  }
```

#### Step 2: Add Marker in Zoomed View

```
# Click on precise location within region
MCP Tool: playwright_click
Selector: svg
Coordinates: { x: 200, y: 150 } (relative to SVG)

# Confirm marker
MCP Tool: playwright_click
Selector: [aria-label="Confirm marker position"]

# Quick fill (may be simplified form in some views)
MCP Tool: playwright_fill
Selector: input[name="severity"]
Value: 5

MCP Tool: playwright_click
Selector: button:has-text("Save")

MCP Tool: playwright_screenshot
Filename: bodymap/07-marker-in-zoomed-view.png
```

#### Step 3: Return to Full Body View

```
MCP Tool: playwright_click
Selector: button:has-text("Back"), [aria-label*="Back to full"], [data-testid="back-button"]

MCP Tool: playwright_screenshot
Filename: bodymap/08-back-to-full-view.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const svg = document.querySelector('.body-map-viewer svg');
  const viewBox = svg?.getAttribute('viewBox');
  const markers = document.querySelectorAll('[data-marker-id]');

  return {
    viewBox,
    isFullView: viewBox === '0 0 400 800' || viewBox?.includes('400') && viewBox?.includes('800'),
    markerCount: markers.length,
    allMarkersVisible: Array.from(markers).every(m => m.offsetParent !== null)
  };

Expected:
  {
    isFullView: true,
    markerCount: >= 2,
    allMarkersVisible: true
  }
```

**Expected Results:**
- ✅ Region focus zooms to isolated view
- ✅ Can add markers in zoomed view
- ✅ Back button returns to full body view
- ✅ All markers remain visible

---

### Scenario 4.3: Full-Screen Body Map

**Pre-conditions:**
- Body map visible

**Test Steps:**

#### Step 1: Enter Full-Screen

```
MCP Tool: playwright_click
Selector: [aria-label*="full screen"], button:has-text("Full Screen")

MCP Tool: playwright_screenshot
Filename: bodymap/09-fullscreen-mode.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const fullscreenContainer = document.querySelector('[data-fullscreen="true"]');
  const navHidden = !document.querySelector('nav')?.offsetParent ||
                   window.getComputedStyle(document.querySelector('nav')).display === 'none';

  return {
    isFullscreen: !!fullscreenContainer,
    zIndex: window.getComputedStyle(fullscreenContainer || document.body).zIndex,
    navHidden,
    viewportFilled: fullscreenContainer?.offsetWidth === window.innerWidth
  };

Expected:
  {
    isFullscreen: true,
    zIndex: >= 9999,
    navHidden: true,
    viewportFilled: true
  }
```

#### Step 2: Add Marker in Full-Screen

```
MCP Tool: playwright_click
Selector: [data-region-id="abdomen-lower"]

MCP Tool: playwright_click
Selector: [aria-label="Confirm marker position"]

# Simplified form should appear
MCP Tool: playwright_fill
Selector: input[name="severity"]
Value: 6

MCP Tool: playwright_click
Selector: button:has-text("Save")

MCP Tool: playwright_screenshot
Filename: bodymap/10-marker-added-fullscreen.png
```

#### Step 3: Exit Full-Screen

```
MCP Tool: playwright_click
Selector: button:has-text("Exit"), [aria-label*="Exit full"]

MCP Tool: playwright_screenshot
Filename: bodymap/11-exit-fullscreen.png
```

**Expected Results:**
- ✅ Full-screen mode hides navigation
- ✅ Body map fills viewport
- ✅ Can add markers in full-screen
- ✅ Simplified form appears
- ✅ Exit button returns to normal view
- ✅ Markers persist after exiting

---

## User Journey 5: Analytics & Insights

### Scenario 5.1: View Dashboard Analytics

**User Story:** As a user, I want to see trends and patterns in my symptom data

**Pre-conditions:**
- User has 7+ days of logged data
- Multiple symptoms, foods, and triggers logged

**Test Steps:**

#### Step 1: Navigate to Analytics/Dashboard

```
MCP Tool: playwright_navigate
URL: http://localhost:3001/dashboard
OR
URL: http://localhost:3001/analytics

MCP Tool: playwright_screenshot
Filename: analytics/01-dashboard-with-data.png
```

#### Step 2: Verify Trend Widgets

```javascript
MCP Tool: playwright_evaluate
Script: |
  const widgets = {
    symptomChart: !!document.querySelector('[data-testid="symptom-trend-chart"]'),
    severityChart: !!document.querySelector('[data-testid="severity-chart"]'),
    correlationWidget: !!document.querySelector('[data-testid="correlation-widget"]'),
    recentActivity: !!document.querySelector('[data-testid="recent-activity"]')
  };

  return {
    widgets,
    widgetCount: Object.values(widgets).filter(Boolean).length
  };

Expected:
  {
    widgetCount: >= 3,
    widgets: { at least 3 should be true }
  }
```

#### Step 3: Interact with Symptom Trend Chart

```
MCP Tool: playwright_screenshot
Filename: analytics/02-symptom-trend-chart.png

# Hover over data point (if interactive)
MCP Tool: playwright_evaluate
Script: |
  const chart = document.querySelector('[data-testid="symptom-trend-chart"]');
  const dataPoint = chart?.querySelector('.data-point, circle, rect');

  if (dataPoint) {
    dataPoint.dispatchEvent(new MouseEvent('mouseenter'));
  }

  return {
    hasTooltip: !!document.querySelector('[role="tooltip"], .tooltip'),
    chartType: chart?.getAttribute('data-chart-type')
  };
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  return {
    hasChartData: !!document.querySelector('canvas, svg[data-chart]'),
    timeRange: document.querySelector('[data-testid="time-range"]')?.textContent,
    dataPoints: document.querySelectorAll('.data-point, circle[data-value]').length
  };

Expected:
  {
    hasChartData: true,
    timeRange: "7 days" or "30 days" (should show selected range),
    dataPoints: >= 7
  }
```

**Expected Results:**
- ✅ Analytics widgets load with data
- ✅ Charts display trend data
- ✅ Interactive elements respond (hover, click)
- ✅ Time range selector available
- ✅ Data is chronologically ordered

---

### Scenario 5.2: Food-Symptom Correlation Analysis

**Pre-conditions:**
- User has logged food and symptoms
- At least 2 weeks of data

**Test Steps:**

#### Step 1: Navigate to Correlations

```
MCP Tool: playwright_click
Selector: a[href*="correlation"], nav:has-text("Correlations")

MCP Tool: playwright_screenshot
Filename: analytics/03-correlations-page.png
```

#### Step 2: View Food Correlations

```javascript
MCP Tool: playwright_evaluate
Script: |
  const correlationCards = document.querySelectorAll('[data-testid="correlation-card"]');
  const foodCorrelations = Array.from(correlationCards).filter(c =>
    c.getAttribute('data-type') === 'food'
  );

  return {
    totalCorrelations: correlationCards.length,
    foodCorrelations: foodCorrelations.length,
    topCorrelation: {
      food: foodCorrelations[0]?.querySelector('[data-food]')?.textContent,
      symptom: foodCorrelations[0]?.querySelector('[data-symptom]')?.textContent,
      confidence: foodCorrelations[0]?.querySelector('[data-confidence]')?.textContent
    }
  };
```

#### Step 3: Click on Correlation for Details

```
MCP Tool: playwright_click
Selector: [data-testid="correlation-card"]:first-of-type

MCP Tool: playwright_screenshot
Filename: analytics/04-correlation-detail.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const detailView = document.querySelector('[data-testid="correlation-detail"]');

  return {
    hasDetailView: !!detailView,
    hasTimeline: !!detailView?.querySelector('[data-testid="correlation-timeline"]'),
    hasConfidenceScore: !!detailView?.querySelector('[data-testid="confidence-score"]'),
    hasOccurrences: !!detailView?.querySelector('[data-testid="occurrences"]')
  };

Expected: All should be true
```

**Expected Results:**
- ✅ Correlations are calculated and displayed
- ✅ Confidence scores shown
- ✅ Can view correlation details
- ✅ Timeline shows co-occurrences
- ✅ Statistical metrics provided

---

### Scenario 5.3: Calendar/Timeline View

**Pre-conditions:**
- User has data spanning multiple days

**Test Steps:**

#### Step 1: Navigate to Calendar

```
MCP Tool: playwright_click
Selector: a[href*="calendar"], nav:has-text("Calendar")

MCP Tool: playwright_screenshot
Filename: analytics/05-calendar-view.png
```

#### Step 2: Verify Calendar Layout

```javascript
MCP Tool: playwright_evaluate
Script: |
  const calendar = document.querySelector('[data-testid="calendar"]');
  const days = calendar?.querySelectorAll('[data-day]');
  const eventsOnDays = Array.from(days || []).filter(d =>
    d.querySelector('[data-event]')
  );

  return {
    hasCalendar: !!calendar,
    dayCount: days?.length || 0,
    daysWithEvents: eventsOnDays.length,
    currentMonth: document.querySelector('[data-testid="current-month"]')?.textContent
  };

Expected:
  {
    hasCalendar: true,
    dayCount: 28-31 (depending on month),
    daysWithEvents: >= 7
  }
```

#### Step 3: Click on Day with Events

```
MCP Tool: playwright_click
Selector: [data-day][data-has-events="true"]:first-of-type

MCP Tool: playwright_screenshot
Filename: analytics/06-day-detail.png
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const dayDetail = document.querySelector('[data-testid="day-detail"]');
  const events = dayDetail?.querySelectorAll('[data-event]');

  return {
    detailOpen: !!dayDetail,
    eventCount: events?.length || 0,
    eventTypes: Array.from(events || []).map(e => e.getAttribute('data-event-type'))
  };
```

**Expected Results:**
- ✅ Calendar displays all logged days
- ✅ Days with events are visually distinct
- ✅ Clicking day shows event details
- ✅ Multiple event types shown per day
- ✅ Can navigate between months

---

## Feature Test Suite: Quick Log Modals

### All Quick Log Modals - Standardized Tests

**For each modal type:**
- Symptom Log
- Food Log
- Medication Log
- Trigger Log
- UX Event Log

**Test Template:**

```javascript
// Test 1: Modal Opens
MCP Tool: playwright_click
Selector: [data-testid="quick-log-{type}"]

Expected: Modal with title "{Type} Log" appears

// Test 2: Required Fields Present
MCP Tool: playwright_evaluate
Script: |
  const modal = document.querySelector('[data-testid="{type}-modal"]');
  return {
    hasTypeField: !!modal?.querySelector('[name="{type}Type"]'),
    hasSeverity: !!modal?.querySelector('[name="severity"]'),
    hasTimestamp: !!modal?.querySelector('[name="timestamp"]'),
    hasNotes: !!modal?.querySelector('[name="notes"]')
  };

// Test 3: Form Validation
# Try to submit empty form
MCP Tool: playwright_click
Selector: button:has-text("Save")

Expected: Validation errors appear OR submit button disabled

// Test 4: Fill and Submit
# Fill all required fields
# Click Save
Expected: Modal closes, success message, entry appears on dashboard

// Test 5: Cancel/Close
# Open modal again
MCP Tool: playwright_click
Selector: button:has-text("Cancel"), [aria-label="Close"]

Expected: Modal closes without saving

// Test 6: Keyboard Navigation
# Press Tab multiple times
# Press Enter to submit
# Press Escape to cancel
Expected: All keyboard interactions work
```

### Specific Quick Log Tests

#### Symptom Log Modal - Comprehensive

```
Test: Can select from symptom dropdown
Test: Can enter custom symptom
Test: Severity slider works (1-10)
Test: Can set specific timestamp
Test: Can add detailed notes
Test: Saved symptom appears in symptom list
Test: Symptom shows on timeline
```

#### Food Log Modal - Comprehensive

```
Test: Search autocomplete works
Test: Can select multiple foods (if supported)
Test: Meal type dropdown works (Breakfast, Lunch, Dinner, Snack)
Test: Can set portion size
Test: Can add ingredients (if supported)
Test: Food shows on timeline with meal type
Test: Food appears in food history
```

#### Medication Log Modal - Comprehensive

```
Test: Can select medication from list
Test: Can enter custom medication
Test: Dosage field accepts text
Test: Time selector works
Test: Frequency/schedule options (if available)
Test: Medication shows on timeline
Test: Shows in medication list
```

---

## Feature Test Suite: Dashboard

### Dashboard Layout Tests

```javascript
MCP Tool: playwright_evaluate
Script: |
  return {
    hasSidebar: !!document.querySelector('[data-testid="sidebar"]'),
    hasHeader: !!document.querySelector('header'),
    hasQuickLog: !!document.querySelector('[data-testid="quick-log-section"]'),
    hasTimeline: !!document.querySelector('[data-testid="timeline"]'),
    hasWidgets: document.querySelectorAll('[data-widget]').length >= 3
  };

Expected: All layout sections present
```

### Today's Summary Widget

```javascript
// Should show today's entries
MCP Tool: playwright_evaluate
Script: |
  const todaySection = document.querySelector('[data-testid="today-summary"]');
  const entries = todaySection?.querySelectorAll('[data-entry]');

  return {
    hasToday: !!todaySection,
    entryCount: entries?.length || 0,
    showsDate: !!todaySection?.textContent.includes('Today')
  };
```

### Recent Activity Feed

```javascript
MCP Tool: playwright_evaluate
Script: |
  const feed = document.querySelector('[data-testid="recent-activity"]');
  const items = feed?.querySelectorAll('[data-activity-item]');

  return {
    hasFeed: !!feed,
    itemCount: items?.length || 0,
    chronological: true, // Verify newest first
    hasTimestamps: Array.from(items || []).every(i =>
      !!i.querySelector('[data-timestamp]')
    )
  };
```

---

## Feature Test Suite: Data Management

### Scenario DM.1: Export Data

**Pre-conditions:**
- User has logged data

**Test Steps:**

```
# Navigate to Settings/Data Management
MCP Tool: playwright_navigate
URL: http://localhost:3001/settings

# Click Export
MCP Tool: playwright_click
Selector: button:has-text("Export Data")

# Verify export options
MCP Tool: playwright_evaluate
Script: |
  return {
    hasJSONOption: !!document.querySelector('[value="json"]'),
    hasCSVOption: !!document.querySelector('[value="csv"]'),
    hasDateRange: !!document.querySelector('[name="dateRange"]')
  };

# Select JSON export
MCP Tool: playwright_click
Selector: [value="json"]

# Confirm export
MCP Tool: playwright_click
Selector: button:has-text("Export")

# Verify download initiated
# (May need to check downloads or monitor network)
```

**Expected Results:**
- ✅ Export options available
- ✅ Can select format (JSON/CSV)
- ✅ Can filter by date range
- ✅ Export downloads file
- ✅ File contains valid data

---

### Scenario DM.2: Import Data

**Pre-conditions:**
- Have test export file ready
- User may have existing data

**Test Steps:**

```
# Navigate to Import
MCP Tool: playwright_click
Selector: button:has-text("Import Data")

# Upload file
MCP Tool: playwright_fill
Selector: input[type="file"]
Value: "path/to/test-export.json"

# Verify preview
MCP Tool: playwright_screenshot
Filename: data/import-preview.png

MCP Tool: playwright_evaluate
Script: |
  return {
    showsPreview: !!document.querySelector('[data-testid="import-preview"]'),
    recordCount: document.querySelector('[data-record-count]')?.textContent,
    hasWarnings: !!document.querySelector('[data-warning]')
  };

# Confirm import
MCP Tool: playwright_click
Selector: button:has-text("Import")

# Verify success
MCP Tool: playwright_evaluate
Script: |
  return {
    successMessage: document.querySelector('[role="alert"]')?.textContent,
    importComplete: !document.querySelector('[data-testid="import-preview"]')
  };

# Verify data appears on dashboard
MCP Tool: playwright_navigate
URL: http://localhost:3001/dashboard

MCP Tool: playwright_screenshot
Filename: data/post-import-dashboard.png
```

**Expected Results:**
- ✅ Can upload import file
- ✅ Preview shows data to be imported
- ✅ Warning for duplicates/conflicts
- ✅ Import completes successfully
- ✅ Imported data appears on dashboard

---

### Scenario DM.3: Clear All Data

**Pre-conditions:**
- User has data
- On settings page

**Test Steps:**

```
# Click Clear Data
MCP Tool: playwright_click
Selector: button:has-text("Clear All Data")

# Verify warning dialog
MCP Tool: playwright_screenshot
Filename: data/clear-data-warning.png

MCP Tool: playwright_evaluate
Script: |
  const dialog = document.querySelector('[role="alertdialog"], [data-testid="confirm-dialog"]');
  return {
    showsWarning: !!dialog,
    hasConfirmButton: !!dialog?.querySelector('button:has-text("Confirm")'),
    warningText: dialog?.textContent.includes('permanent') ||
                 dialog?.textContent.includes('cannot be undone')
  };

# Type confirmation (if required)
MCP Tool: playwright_fill
Selector: input[name="confirmText"]
Value: "DELETE"

# Confirm deletion
MCP Tool: playwright_click
Selector: button:has-text("Confirm")

# Verify data cleared
MCP Tool: playwright_navigate
URL: http://localhost:3001/dashboard

MCP Tool: playwright_evaluate
Script: |
  return {
    hasEntries: document.querySelectorAll('[data-entry]').length > 0,
    showsEmptyState: !!document.querySelector('[data-testid="empty-state"]')
  };

Expected:
  {
    hasEntries: false,
    showsEmptyState: true
  }
```

**Expected Results:**
- ✅ Shows warning before deletion
- ✅ Requires explicit confirmation
- ✅ All data is cleared
- ✅ Dashboard shows empty state
- ✅ No errors occur

---

## Integration Tests: Cross-Feature Validation

### Integration Test 1: Symptom → Flare Workflow

**Scenario:** User logs symptom, realizes it's a flare, creates flare from symptom

```
1. Log symptom (severity 8, "knee pain")
2. Navigate to flares
3. Create new flare
4. Link to recent symptom (if supported)
5. Add body map marker
6. Verify symptom and flare are connected
7. Update flare severity
8. Verify symptom timeline reflects flare
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  // Check if symptom and flare are linked
  const symptom = document.querySelector('[data-symptom-id]');
  const flare = document.querySelector('[data-flare-id]');

  return {
    symptomLinked: symptom?.getAttribute('data-linked-flare') === flare?.id,
    bothVisible: !!symptom && !!flare,
    timelineShowsBoth: document.querySelectorAll('[data-timeline-entry]').length >= 2
  };
```

---

### Integration Test 2: Food → Symptom Correlation

**Scenario:** Log food, then symptom, verify correlation appears

```
1. Log food: "Dairy - Milk" at 8:00 AM
2. Wait or fast-forward time (if supported)
3. Log symptom: "Stomach pain" severity 6 at 10:00 AM
4. Navigate to correlations
5. Verify dairy-stomach pain correlation appears
6. Check confidence score
7. Click correlation for details
8. Verify timeline shows both events
```

**Validation:**
```javascript
MCP Tool: playwright_evaluate
Script: |
  const correlations = document.querySelectorAll('[data-correlation]');
  const dairyCorrelation = Array.from(correlations).find(c =>
    c.textContent.toLowerCase().includes('dairy') ||
    c.textContent.toLowerCase().includes('milk')
  );

  return {
    hasCorrelations: correlations.length > 0,
    hasDairyCorrelation: !!dairyCorrelation,
    confidence: dairyCorrelation?.querySelector('[data-confidence]')?.textContent,
    delay: dairyCorrelation?.querySelector('[data-delay]')?.textContent
  };
```

---

### Integration Test 3: Multi-Day Tracking with Analytics

**Scenario:** Log data over multiple days, verify analytics update

```
1. Clear existing data
2. Log Day 1: Breakfast (eggs), symptom (headache - 5)
3. Log Day 2: Breakfast (eggs), symptom (headache - 6)
4. Log Day 3: Breakfast (oatmeal), no symptom
5. Log Day 4: Breakfast (eggs), symptom (headache - 7)
6. Navigate to analytics
7. Verify trend chart shows symptom increasing on egg days
8. Verify correlation suggests eggs → headache
```

**Expected Results:**
- ✅ Data persists across sessions
- ✅ Analytics update in real-time
- ✅ Correlations are calculated correctly
- ✅ Trends are visualized accurately

---

## Regression Test Suite

### Critical Path Tests (Run Before Every Release)

```
✅ User can complete onboarding
✅ User can log a symptom
✅ User can log food
✅ User can create a flare
✅ User can add body map marker
✅ Dashboard loads with data
✅ Analytics page shows charts
✅ User can export data
✅ User can import data
✅ Navigation works between all pages
```

### Data Integrity Tests

```
✅ Logged entries persist after refresh
✅ Flare status updates persist
✅ Body map markers remain after navigation
✅ Correlations don't duplicate
✅ Timeline order is correct
✅ Export contains all logged data
✅ Import doesn't create duplicates
```

### Performance Tests

```
✅ Dashboard loads in < 2 seconds
✅ Quick log modal opens in < 300ms
✅ Body map renders in < 1 second
✅ Analytics charts load in < 3 seconds
✅ No memory leaks after 10+ logs
✅ Smooth scrolling with 100+ entries
```

### Accessibility Tests

```
✅ All buttons have ARIA labels
✅ All forms are keyboard navigable
✅ Focus indicators are visible
✅ Color contrast meets WCAG AA
✅ Screen reader can navigate app
✅ Touch targets are 44x44px minimum
```

---

## Test Execution Summary Template

```markdown
# E2E Test Execution Report

**Date:** [DATE]
**Tester:** [Name/Agent]
**Build:** [Commit SHA]
**Duration:** [X minutes]

## Summary
- Total Scenarios: 35
- Passed: 33 ✅
- Failed: 2 ❌
- Skipped: 0

## User Journeys
- [✅] Journey 1: Onboarding (3/3 scenarios passed)
- [✅] Journey 2: Daily Tracking (3/3 scenarios passed)
- [✅] Journey 3: Flare Management (3/3 scenarios passed)
- [⚠️] Journey 4: Body Map (3/4 scenarios passed)
- [✅] Journey 5: Analytics (3/3 scenarios passed)

## Failed Tests
1. **Scenario 4.2: Region Focus** - FAILED
   - Issue: ViewBox not updating correctly
   - Screenshot: bodymap/06-region-focused.png
   - Expected: Zoomed viewBox
   - Actual: Full body viewBox retained

2. **Scenario DM.2: Import Data** - FAILED
   - Issue: Import preview not showing
   - Error: "Cannot read property 'length' of undefined"
   - Needs investigation

## Performance Metrics
- Dashboard Load: 1.2s ✅
- Modal Open: 180ms ✅
- Body Map Render: 950ms ✅
- Analytics Load: 2.8s ✅

## Recommendations
1. Fix region zoom bug in BodyMapViewer component
2. Add error handling to import preview
3. All other features working as expected
4. Ready for release pending bug fixes
```

---

## Success Criteria

**All tests pass when:**

- ✅ User can complete full onboarding flow
- ✅ All quick log modals work correctly
- ✅ Flares can be created, updated, and resolved
- ✅ Body map markers can be placed and saved
- ✅ Analytics show accurate trends
- ✅ Data export/import works
- ✅ All navigation links work
- ✅ No console errors
- ✅ Data persists across sessions
- ✅ Performance meets budgets
- ✅ Accessibility standards met

**Ready for Production when:**

- All critical path tests pass
- No P0 or P1 bugs
- Performance acceptable
- Accessibility audit clean
- Cross-browser tested
- Mobile experience validated
