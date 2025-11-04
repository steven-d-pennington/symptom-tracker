# Comprehensive Test Scenarios - Beta Release
# Symptom Tracker Application

**Generated**: 2025-10-31
**Author**: Murat (Master Test Architect)
**Purpose**: Pre-beta release comprehensive QA test execution
**Test Type**: Manual + Agent-Assisted Execution

---

## Executive Summary

**Application**: Symptom Tracker for Hidradenitis Suppurativa
**Tech Stack**: Next.js 15, React 19, TypeScript, Dexie (IndexedDB), Chart.js
**Architecture**: Offline-first PWA with client-side encryption

**Test Coverage Summary**:
- **P0 Critical**: 22 scenarios (≈6-8 hours testing)
- **P1 High**: 28 scenarios (≈8-10 hours testing)
- **P2 Medium**: 18 scenarios (≈4-5 hours testing)
- **Total**: 68 scenarios (~18-23 hours comprehensive testing)

**Risk Summary**:
- **CRITICAL Risks (Score=9)**: 5 identified (all DATA/SEC category)
- **HIGH Risks (Score 6-8)**: 12 identified
- **MEDIUM Risks (Score 4-5)**: 8 identified

---

## How to Use This Document

### For Human QA Testers:
1. Start with **P0 Smoke Tests** (Section 1) - complete in first 1-2 hours
2. Execute **P0 scenarios** by feature area - must complete before beta launch
3. Execute **P1 scenarios** if time permits
4. **Report findings** using the template in Section 13

### For AI Agent Testing:
1. Load this document as test specification
2. Execute scenarios systematically by priority
3. Document pass/fail with evidence (screenshots, console logs)
4. Flag any blockers immediately

### Testing Environment:
- **Browser**: Chrome/Edge (desktop), Safari (mobile)
- **Data State**: Start with **clean database** (use Dev Data Controls to reset)
- **Network**: Test both **online** and **offline** modes

---

## Test Execution Tracking

| Priority | Total Scenarios | Completed | Pass | Fail | Blocked |
|----------|----------------|-----------|------|------|---------|
| P0       | 22             | 0         | 0    | 0    | 0       |
| P1       | 28             | 0         | 0    | 0    | 0       |
| P2       | 18             | 0         | 0    | 0    | 0       |
| **Total**| **68**         | **0**     | **0**| **0**| **0**   |

---

## Section 1: P0 Smoke Tests (<30 min)

**Purpose**: Fast validation that core application loads and critical paths are accessible.

### ST-001: Application Loads Successfully
**Priority**: P0
**Risk**: DATA-9 (Critical - app won't load = total failure)

**Steps**:
1. Navigate to application URL (http://localhost:3001)
2. Wait for page to load completely

**Expected**:
- [ ] Landing page displays within 3 seconds
- [ ] No JavaScript console errors
- [ ] Navigation elements visible
- [ ] "Get Started" or "Sign In" button present

**Fail Criteria**: Any console errors, white screen, infinite loading

---

### ST-002: Onboarding Flow Completes
**Priority**: P0
**Risk**: BUS-9 (Critical - users can't start using app)

**Steps**:
1. Click "Get Started" button
2. Complete onboarding steps 1-4 (personal info, preferences, symptom selection, medication setup)
3. Click "Go to Dashboard" on completion step

**Expected**:
- [ ] All 4 onboarding steps load without errors
- [ ] "Go to Dashboard" button navigates to `/dashboard` route
- [ ] Dashboard displays with welcome message
- [ ] No console errors during flow

**Fail Criteria**: Cannot complete onboarding, stuck on any step, routing failure

---

### ST-003: Can Log a Symptom
**Priority**: P0
**Risk**: BUS-8 (High - core logging functionality broken)

**Steps**:
1. From dashboard, click "Log Symptom" quick action
2. Select any default symptom from list
3. Set severity slider to 5
4. Click "Save" button

**Expected**:
- [ ] Symptom logging page loads (`/log/symptom`)
- [ ] Default symptoms are visible in list
- [ ] Symptom saves successfully (success message displayed)
- [ ] Symptom appears in dashboard timeline

**Fail Criteria**: Empty symptom list, save fails, no confirmation message

---

### ST-004: Can Create a Flare on Body Map
**Priority**: P0
**Risk**: BUS-8 (High - primary feature broken)

**Steps**:
1. Navigate to Flares page (`/flares`)
2. Click on any body region on the body map
3. Fill in flare details: severity 7, note "Test flare"
4. Click "Create Flare"

**Expected**:
- [ ] Body map displays with clickable regions
- [ ] Flare creation modal opens on region click
- [ ] Flare saves successfully
- [ ] Flare marker appears on body map
- [ ] Flare appears in Active Flares list

**Fail Criteria**: Body map doesn't load, can't click regions, save fails

---

### ST-005: Offline Mode Works
**Priority**: P0
**Risk**: DATA-9 (Critical - offline-first architecture broken)

**Steps**:
1. Open DevTools Network tab
2. Select "Offline" throttling
3. Navigate to dashboard
4. Log a new symptom entry

**Expected**:
- [ ] Application continues to function offline
- [ ] Dashboard loads from cache
- [ ] Symptom saves to IndexedDB
- [ ] "Offline" indicator visible (if implemented)
- [ ] No network errors crash the app

**Fail Criteria**: App crashes offline, cannot save data, error messages

---

## Section 2: Onboarding & User Setup (P0-P1)

### ON-001: First-Time Onboarding Happy Path
**Priority**: P0
**Risk**: BUS-9 (Critical blocker - new users can't start)
**Category**: Business Impact

**Pre-conditions**:
- Clean browser state (clear IndexedDB and localStorage)
- Navigate to `/`

**Steps**:
1. Click "Get Started" button on landing page
2. **Step 1 - Personal Info**: Enter name, optionally select date of birth, click "Next"
3. **Step 2 - Preferences**: Select display preferences (theme, language), click "Next"
4. **Step 3 - Symptoms**: Select or create initial symptoms to track, click "Next"
5. **Step 4 - Medications**: Add current medications (optional), click "Next"
6. **Completion**: Review onboarding summary, click "Go to Dashboard"

**Expected Results**:
- [ ] All 4 steps load without errors
- [ ] Form validation works (e.g., name required in Step 1)
- [ ] "Go to Dashboard" button navigates to `/dashboard` (NOT `/`)
- [ ] Dashboard displays personalized welcome message with user's name
- [ ] Default symptoms, foods, triggers, medications are pre-populated
- [ ] User can immediately log data without hitting empty states

**Fail Criteria**:
- Routing to `/` instead of `/dashboard` after completion (BLOCKER)
- Empty symptom/food lists preventing initial logging
- Console errors during onboarding steps

**Test Data**: Name: "Test User", Theme: "Light", Symptoms: "Pain", Medications: "None"

---

### ON-002: Skip Optional Steps in Onboarding
**Priority**: P1
**Risk**: BUS-4 (Medium - some users want minimal setup)

**Steps**:
1. Start onboarding flow
2. Enter name in Step 1, click "Next"
3. Skip preferences in Step 2 (click "Next" without changes)
4. Skip symptoms in Step 3 (click "Next")
5. Skip medications in Step 4 (click "Next")
6. Click "Go to Dashboard"

**Expected**:
- [ ] Can complete onboarding with minimal input
- [ ] Dashboard loads successfully
- [ ] Default data is still pre-populated
- [ ] Empty states display guidance for adding custom data

---

### ON-003: Onboarding Data Persists
**Priority**: P0
**Risk**: DATA-9 (Critical - data loss on refresh)

**Steps**:
1. Complete onboarding (ON-001) with name "Persistence Test"
2. Note the selected preferences and symptoms
3. Refresh the browser (F5)
4. Navigate to `/dashboard`

**Expected**:
- [ ] User is NOT redirected back to onboarding
- [ ] Dashboard displays with saved name
- [ ] Selected preferences are persisted (theme, etc.)
- [ ] Initial symptoms are available for logging
- [ ] No data loss after refresh

**Fail Criteria**: User redirected to onboarding, name lost, preferences reset

---

## Section 3: Body Map & Flare Location Tracking (P0-P1)

### BM-001: Select Body Region and Create Flare
**Priority**: P0
**Risk**: BUS-8 (High - core flare tracking broken)

**Steps**:
1. Navigate to `/flares`
2. Click on "Left Groin" region on body map (front view)
3. Verify flare creation modal opens
4. Enter: Severity 7, Note "First flare - left groin"
5. Click "Create Flare"

**Expected**:
- [ ] Body map displays with all regions including groin areas
- [ ] Left groin region is clickable
- [ ] Flare creation modal opens with empty form
- [ ] Severity slider works (1-10 range)
- [ ] Flare saves successfully (success toast)
- [ ] Flare marker appears on left groin region
- [ ] Flare appears in "Active Flares" list

**Fail Criteria**: Region not clickable, save fails, marker doesn't appear

---

### BM-002: Zoom Into Body Region
**Priority**: P1
**Risk**: TECH-6 (High - precision tracking feature broken)

**Steps**:
1. Navigate to `/flares`
2. Click zoom controls or use pinch gesture (mobile) on body map
3. Zoom into left groin region (3x zoom)
4. Pan to navigate within zoomed view
5. Click precise location for flare
6. Reset zoom to 1x

**Expected**:
- [ ] Zoom controls are visible (+ / - buttons or pinch gesture works)
- [ ] Zoom level increases smoothly to 3x
- [ ] Pan/drag works to navigate zoomed map
- [ ] Can click precise coordinates within zoomed region
- [ ] Reset zoom returns to full body view
- [ ] Zoom interactions respond <100ms (NFR001)

**Fail Criteria**: Zoom doesn't work, pan is janky/slow, cannot mark precise location

---

### BM-003: Multiple Flares on Same Region
**Priority**: P1
**Risk**: DATA-6 (High - overlapping markers cause data loss)

**Steps**:
1. Navigate to `/flares`
2. Create first flare on left groin: severity 5, note "Flare A"
3. Create second flare on left groin (different precise coordinates): severity 8, note "Flare B"
4. Verify both markers are visible on body map

**Expected**:
- [ ] Both flares save successfully to IndexedDB
- [ ] Two distinct markers appear on left groin region
- [ ] Markers are slightly offset to prevent complete overlap
- [ ] Can tap each marker to view individual flare details
- [ ] Active Flares list shows both flares

**Fail Criteria**: Second flare overwrites first, markers overlap completely, can't distinguish flares

---

### BM-004: Flare Marker Status Indicators
**Priority**: P1
**Risk**: BUS-4 (Medium - visual confusion about flare status)

**Steps**:
1. Create flare with severity 7 (active)
2. Update flare to "Improving" status
3. Update flare to "Worsening" status
4. Resolve flare
5. Check body map marker colors/icons after each step

**Expected**:
- [ ] Active flare marker is red/orange color
- [ ] Improving flare marker is yellow color
- [ ] Worsening flare marker is orange/red color
- [ ] Resolved flare marker is gray color
- [ ] Marker visual changes immediately after status update

**Fail Criteria**: Markers don't change color, all markers look identical

---

### BM-005: Groin Regions Visible on All Views
**Priority**: P0
**Risk**: BUS-6 (High - missing critical body regions)

**Steps**:
1. Navigate to `/flares`
2. Verify body map shows "Front" view by default
3. Switch to "Back" view (if available)
4. Switch to "Side" view (if available)

**Expected**:
- [ ] Front view displays: Left Groin, Right Groin, Center Groin regions
- [ ] All groin regions are clearly labeled
- [ ] Groin regions are anatomically accurate and tastefully rendered
- [ ] Each groin region is clickable/selectable
- [ ] Region labels appear on hover or click

**Fail Criteria**: Groin regions missing, not clickable, or unlabeled

---

### BM-006: Body Map Accessibility (Keyboard Navigation)
**Priority**: P1
**Risk**: SEC-4 (Medium - accessibility compliance)

**Steps**:
1. Navigate to `/flares`
2. Use Tab key to navigate through body regions
3. Use Enter key to select a region
4. Use Arrow keys for precise positioning within zoomed region
5. Use Escape key to cancel selection

**Expected**:
- [ ] Tab key cycles through body regions in logical order
- [ ] Focus indicator clearly visible on current region
- [ ] Enter/Space selects focused region
- [ ] Arrow keys work for precise positioning (when zoomed)
- [ ] Screen reader announces region names
- [ ] All controls have ARIA labels

**Fail Criteria**: Cannot navigate with keyboard, no focus indicators, screen reader silent

---

## Section 4: Flare Lifecycle Management (P0-P1)

### FL-001: Create Flare and Assign Persistent ID
**Priority**: P0
**Risk**: DATA-9 (Critical - flare tracking requires unique IDs)

**Steps**:
1. Navigate to `/flares`
2. Create flare: Left shoulder, severity 6, note "Shoulder pain"
3. Open browser DevTools → Application → IndexedDB → symptom-tracker → flares table
4. Verify flare record exists with unique UUID

**Expected**:
- [ ] Flare saves to IndexedDB `flares` table
- [ ] Flare has unique `id` field (UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- [ ] Flare record includes: userId, startDate, bodyRegionId, coordinates, severity, status="Active"
- [ ] Flare ID remains constant across updates

**Fail Criteria**: No flare ID, duplicate IDs, ID changes on update

---

### FL-002: Update Flare Severity and Trend
**Priority**: P0
**Risk**: DATA-8 (High - severity tracking broken)

**Steps**:
1. Create flare (severity 5)
2. Navigate to Active Flares list (`/active-flares`)
3. Click on created flare to open detail modal
4. Click "Update Status" button
5. Change severity to 8, set trend to "Worsening", add note "Getting worse"
6. Save update

**Expected**:
- [ ] Update modal opens with current severity (5) pre-filled
- [ ] Can adjust severity slider to new value (8)
- [ ] Trend options available: Improving, Stable, Worsening
- [ ] Update saves successfully
- [ ] FlareEvent record created in IndexedDB `flareEvents` table with eventType="status_update"
- [ ] Flare detail shows updated severity (8) and trend (Worsening)
- [ ] Active Flares list shows updated severity and trend arrow

**Fail Criteria**: Update fails, severity doesn't change, no FlareEvent created

---

### FL-003: Flare History Timeline Preserves All Updates
**Priority**: P0
**Risk**: DATA-9 (Critical - immutability requirement violated)

**Steps**:
1. Create flare (severity 5)
2. Update severity to 7 (Day 1)
3. Update severity to 9, trend "Worsening" (Day 2)
4. Update severity to 4, trend "Improving" (Day 3)
5. View flare detail history tab
6. Check IndexedDB `flareEvents` table

**Expected**:
- [ ] History timeline shows 4 events (creation + 3 updates)
- [ ] Each event displays: timestamp, severity, trend, notes
- [ ] Events are in chronological order (oldest first or reverse)
- [ ] All previous severity values are preserved (5, 7, 9, 4)
- [ ] Cannot edit or delete historical events (NFR003 - immutability)
- [ ] IndexedDB has 4 FlareEvent records linked to same flareId

**Fail Criteria**: History missing events, can edit past events, data overwritten

---

### FL-004: Log Intervention to Flare
**Priority**: P1
**Risk**: BUS-6 (High - treatment tracking broken)

**Steps**:
1. Open active flare detail
2. Click "Log Intervention" button
3. Select intervention type: "Ice"
4. Add details: "Applied ice pack for 20 minutes"
5. Save intervention

**Expected**:
- [ ] Intervention modal opens with type dropdown
- [ ] Type options include: Ice, Heat, Medication, Rest, Drainage, Other
- [ ] Details text field accepts input
- [ ] Intervention saves successfully
- [ ] FlareEvent created with eventType="intervention"
- [ ] Intervention appears in flare history timeline
- [ ] Intervention has icon/label (ice icon for "Ice" type)

**Fail Criteria**: Cannot save intervention, doesn't appear in history

---

### FL-005: Mark Flare as Resolved
**Priority**: P0
**Risk**: DATA-8 (High - flare lifecycle incomplete)

**Steps**:
1. Open active flare detail
2. Click "Mark Resolved" button
3. Confirm resolution date (default: today)
4. Add resolution note: "Fully healed"
5. Confirm resolution

**Expected**:
- [ ] Resolve modal shows confirmation dialog
- [ ] Resolution date defaults to today, can be edited
- [ ] Flare status changes to "Resolved"
- [ ] Flare `endDate` field populated in IndexedDB
- [ ] Flare moves from Active Flares list to Resolved Flares list
- [ ] Body map marker changes to resolved status (gray color)
- [ ] Can still view flare detail but cannot update severity

**Fail Criteria**: Flare stays in active list, can still update after resolution

---

### FL-006: Resolved Flares Archive Accessible
**Priority**: P1
**Risk**: BUS-4 (Medium - historical data inaccessible)

**Steps**:
1. Create and resolve 3 flares (different body regions)
2. Navigate to Resolved Flares page (`/flares/resolved`)
3. View list of resolved flares
4. Click on a resolved flare to view details

**Expected**:
- [ ] Resolved Flares page displays all 3 resolved flares
- [ ] Each list item shows: body location, resolution date, total duration (days), peak severity
- [ ] List sorted by resolution date (most recent first)
- [ ] Can open resolved flare detail (read-only view)
- [ ] Flare history timeline is accessible
- [ ] Cannot update or delete resolved flares

**Fail Criteria**: Resolved flares missing, cannot view details, can edit resolved flares

---

### FL-007: Flare Duration Calculation
**Priority**: P1
**Risk**: DATA-4 (Medium - incorrect analytics)

**Steps**:
1. Create flare on Nov 1, 2025 (severity 6)
2. Manually set creation date in DevTools if needed
3. Resolve flare on Nov 12, 2025
4. View flare detail

**Expected**:
- [ ] Flare duration calculated as: 11 days (Nov 12 - Nov 1)
- [ ] Duration displayed in flare detail: "11 days"
- [ ] Duration appears in resolved flares list

**Fail Criteria**: Duration incorrect, negative duration, duration not displayed

---

## Section 5: Daily Logging (Symptoms, Food, Triggers, Medications, Mood, Sleep) (P0-P1)

### DL-001: Log Symptom with Default Data
**Priority**: P0
**Risk**: BUS-8 (High - core logging broken)

**Steps**:
1. Navigate to `/log/symptom`
2. Verify default symptoms are visible (not empty)
3. Select default symptom: "Pain"
4. Set severity: 6
5. Click "Save"

**Expected**:
- [ ] Symptom logging page loads (dedicated page, not modal)
- [ ] Default symptoms pre-populated (from Story 3.5.1)
- [ ] Can select symptom from list
- [ ] Severity slider works (1-10 range)
- [ ] Symptom saves successfully
- [ ] Success toast message displays
- [ ] Symptom appears in dashboard timeline
- [ ] Symptom persists in IndexedDB

**Fail Criteria**: Empty symptom list (BLOCKER), save fails, no success message

---

### DL-002: Log Custom Symptom
**Priority**: P1
**Risk**: BUS-6 (High - user customization broken)

**Steps**:
1. Navigate to `/manage` (Manage Data page)
2. Click "Add Custom Symptom"
3. Enter symptom name: "Custom Test Symptom"
4. Save custom symptom
5. Navigate to `/log/symptom`
6. Verify custom symptom appears in list
7. Log custom symptom with severity 5

**Expected**:
- [ ] Can create custom symptom from Manage Data page
- [ ] Custom symptom appears at top of symptom list (or in "Custom" section)
- [ ] Custom symptom badge displays (visual indicator)
- [ ] Can log custom symptom like default symptoms
- [ ] Custom symptom persists after page refresh

**Fail Criteria**: Cannot create custom symptom, doesn't appear in log list

---

### DL-003: Log Food with Categories
**Priority**: P0
**Risk**: BUS-8 (High - food tracking broken)

**Steps**:
1. Navigate to `/log/food`
2. Verify food categories are present (Dairy, Grains, Proteins, Vegetables, etc.)
3. Expand "Dairy" category
4. Select "Milk" from list
5. Add optional note: "Whole milk, 1 cup"
6. Save food entry

**Expected**:
- [ ] Food logging page loads (dedicated page per Story 3.5.4)
- [ ] Foods organized in collapsible categories
- [ ] Can expand/collapse categories
- [ ] Default foods pre-populated in each category
- [ ] Can select food and save
- [ ] Food entry appears in dashboard timeline
- [ ] Food persists in IndexedDB

**Fail Criteria**: Empty food list (BLOCKER), categories missing, save fails

---

### DL-004: Food Favorites and Recents
**Priority**: P1
**Risk**: BUS-4 (Medium - UX improvement feature)

**Steps**:
1. Log food "Milk" (from DL-003)
2. Log food "Bread" from Grains category
3. Return to `/log/food` page
4. Check if Recents section appears at top

**Expected**:
- [ ] "Recents" section displays at top of food list
- [ ] Recently logged foods appear in Recents (Milk, Bread)
- [ ] Can quickly re-log from Recents section
- [ ] Recents section is expanded by default

**Fail Criteria**: No Recents section, recently logged foods not shown

---

### DL-005: Log Mood Entry
**Priority**: P0
**Risk**: BUS-6 (High - missing essential tracking per Story 3.5.2)

**Steps**:
1. Navigate to `/mood`
2. Select mood rating: 7/10
3. Add optional note: "Feeling good today"
4. Save mood entry

**Expected**:
- [ ] Mood logging page loads
- [ ] Mood scale (1-10) or emotion picker available
- [ ] Can add optional notes
- [ ] Mood saves to IndexedDB `moodEntries` table
- [ ] Mood entry appears in dashboard timeline
- [ ] Success message displays

**Fail Criteria**: Mood page doesn't exist, cannot save mood entry

---

### DL-006: Log Sleep Entry
**Priority**: P0
**Risk**: BUS-6 (High - missing essential tracking per Story 3.5.2)

**Steps**:
1. Navigate to `/sleep`
2. Enter hours slept: 7.5
3. Select sleep quality: 6/10
4. Add note: "Woke up twice"
5. Save sleep entry

**Expected**:
- [ ] Sleep logging page loads
- [ ] Hours field accepts decimal input (e.g., 7.5)
- [ ] Sleep quality slider works (1-10 range)
- [ ] Can add optional notes
- [ ] Sleep saves to IndexedDB `sleepEntries` table
- [ ] Sleep entry appears in dashboard timeline

**Fail Criteria**: Sleep page doesn't exist, cannot save sleep entry

---

### DL-007: Log Trigger
**Priority**: P1
**Risk**: BUS-6 (High - trigger tracking for correlation analysis)

**Steps**:
1. Navigate to `/log/trigger`
2. Select default trigger: "Stress"
3. Add note: "Work deadline stress"
4. Save trigger entry

**Expected**:
- [ ] Trigger logging page loads (dedicated page per Story 3.5.5)
- [ ] Default triggers pre-populated
- [ ] Can select and save trigger
- [ ] Trigger appears in dashboard timeline
- [ ] Trigger persists in IndexedDB

**Fail Criteria**: Empty trigger list, save fails

---

### DL-008: Log Medication
**Priority**: P1
**Risk**: BUS-6 (High - medication tracking for correlation)

**Steps**:
1. Navigate to `/log/medication`
2. Select default medication: "Ibuprofen"
3. Add dosage: "200mg"
4. Save medication entry

**Expected**:
- [ ] Medication logging page loads (dedicated page per Story 3.5.5)
- [ ] Default medications pre-populated
- [ ] Can add dosage information
- [ ] Medication appears in dashboard timeline

**Fail Criteria**: Empty medication list, save fails

---

### DL-009: Quick Log Mode (Minimal Fields)
**Priority**: P1
**Risk**: BUS-4 (Medium - UX efficiency)

**Steps**:
1. Navigate to `/log/symptom`
2. Select symptom, set severity, click "Save" (do NOT click "Add Details")
3. Verify symptom saves without requiring additional fields

**Expected**:
- [ ] Can save entry with only required fields (symptom, severity, timestamp)
- [ ] "Add Details" button is optional, not required
- [ ] Quick log completes in <5 seconds

**Fail Criteria**: Forced to fill optional fields, slow save performance

---

### DL-010: Logging Persists Offline
**Priority**: P0
**Risk**: DATA-9 (Critical - offline-first architecture)

**Steps**:
1. Open DevTools → Network → Select "Offline" throttling
2. Navigate to `/log/symptom`
3. Log symptom: "Pain", severity 7
4. Save entry
5. Check IndexedDB for saved entry
6. Go back online
7. Verify entry still exists

**Expected**:
- [ ] Can log entries while offline
- [ ] Entry saves to IndexedDB immediately (NFR002)
- [ ] Success message displays
- [ ] Entry appears in dashboard when back online
- [ ] No data loss

**Fail Criteria**: Cannot save offline, data lost, error messages

---

## Section 6: Calendar & Timeline (P1-P2)

### CAL-001: Calendar Displays Logged Data
**Priority**: P1
**Risk**: DATA-6 (High - calendar data wiring broken per Story 3.5.7)

**Steps**:
1. Log symptom on Nov 10 (severity 6)
2. Log food on Nov 10 (Milk)
3. Log mood on Nov 10 (rating 7)
4. Navigate to `/calendar`
5. Select Nov 10 date
6. Verify all entries display

**Expected**:
- [ ] Calendar page loads (`/calendar`)
- [ ] Nov 10 shows count badges (3 entries)
- [ ] Clicking Nov 10 shows summary:
  - Symptom: Pain (6)
  - Food: Milk
  - Mood: 7/10
- [ ] Calendar updates when new data logged
- [ ] Empty dates display without errors

**Fail Criteria**: Calendar empty, data doesn't appear, console errors (BLOCKER per Story 3.5.7)

---

### CAL-002: Calendar Historical Mode
**Priority**: P1
**Risk**: BUS-4 (Medium - can't review past data)

**Steps**:
1. Create test data across multiple dates (Nov 1, Nov 5, Nov 10)
2. Navigate to `/calendar`
3. Navigate to previous month (October)
4. Navigate back to November

**Expected**:
- [ ] Can navigate between months using prev/next buttons
- [ ] Historical data displays correctly for past months
- [ ] Calendar performance is acceptable (<1 second to load month view)

**Fail Criteria**: Cannot navigate months, slow performance, historical data missing

---

### CAL-003: Calendar Empty State
**Priority**: P2
**Risk**: BUS-2 (Low - cosmetic issue)

**Steps**:
1. Reset database (use Dev Data Controls)
2. Navigate to `/calendar`
3. Verify empty state message displays

**Expected**:
- [ ] Empty state shows helpful message: "No data logged yet. Start logging to see your timeline."
- [ ] No errors when calendar is empty

**Fail Criteria**: Console errors, blank screen

---

## Section 7: Analytics & Insights (P1-P2)

### AN-001: Problem Areas Calculation
**Priority**: P1
**Risk**: DATA-6 (High - analytics core feature)

**Steps**:
1. Create 5 flares on "Left Groin" (different dates)
2. Create 2 flares on "Right Shoulder"
3. Create 1 flare on "Neck"
4. Navigate to `/flares/analytics`
5. View "Problem Areas" section

**Expected**:
- [ ] Analytics page loads
- [ ] Problem Areas shows ranked list:
  1. Left Groin (5 flares, 62.5%)
  2. Right Shoulder (2 flares, 25%)
  3. Neck (1 flare, 12.5%)
- [ ] Visual indicator (bar chart or heat map) displays
- [ ] Percentages calculated correctly
- [ ] Can select time range (Last 30/90 days, etc.)

**Fail Criteria**: Problem Areas missing, incorrect counts, percentages wrong

---

### AN-002: Per-Region Flare History
**Priority**: P1
**Risk**: BUS-4 (Medium - regional analysis feature)

**Steps**:
1. From Problem Areas (AN-001), click on "Left Groin"
2. View per-region flare history page (`/flares/analytics/regions/left-groin`)

**Expected**:
- [ ] Region detail page loads
- [ ] Shows list of all flares for left groin region (5 flares)
- [ ] Flares sorted reverse-chronologically (most recent first)
- [ ] Each flare shows: start date, resolution date, duration, peak severity
- [ ] Statistics summary displays:
  - Total flare count: 5
  - Average duration
  - Average severity
  - Recurrence rate

**Fail Criteria**: Region page doesn't exist, flare list empty, stats incorrect

---

### AN-003: Flare Duration Metrics
**Priority**: P2
**Risk**: DATA-4 (Medium - analytics accuracy)

**Steps**:
1. Ensure multiple resolved flares exist with varying durations (5 days, 10 days, 15 days)
2. Navigate to `/flares/analytics`
3. View "Progression Metrics" section

**Expected**:
- [ ] Metrics section displays:
  - Average flare duration (e.g., 10 days)
  - Median flare duration
  - Shortest/longest duration
  - Average peak severity
  - Severity trend distribution (% improving vs worsening vs stable)
- [ ] Metrics update when time range changes
- [ ] Empty state if <3 flares: "Insufficient data for metrics"

**Fail Criteria**: Metrics missing, incorrect calculations, divide-by-zero errors

---

### AN-004: Trend Chart Visualization
**Priority**: P2
**Risk**: BUS-3 (Medium - visual analytics)

**Steps**:
1. Create flares across 3 months (varying severity)
2. Navigate to `/flares/analytics`
3. View "Flare Trends" chart

**Expected**:
- [ ] Line chart displays flare frequency over time (monthly buckets)
- [ ] Overlay shows average severity per month
- [ ] Chart is interactive (hover shows exact values)
- [ ] Can select time range (Last 6 months, Last Year, All Time)

**Fail Criteria**: Chart doesn't load, incorrect data, not interactive

---

### AN-005: Intervention Effectiveness Analysis
**Priority**: P2
**Risk**: DATA-4 (Medium - correlation analysis)

**Steps**:
1. Create flare with severity 8
2. Log intervention: "Ice" with note "Applied ice pack"
3. Update flare severity to 5 (48 hours later)
4. Repeat for multiple flares with different interventions
5. Navigate to `/flares/analytics`
6. View "Intervention Effectiveness" section

**Expected**:
- [ ] Intervention Effectiveness section displays
- [ ] Each intervention type shows:
  - Usage count
  - Average severity change after intervention
  - Success rate (% times severity decreased within 48 hours)
- [ ] Interventions ranked by effectiveness
- [ ] Caveat message: "Correlation not causation - discuss with your doctor"
- [ ] Minimum 5 intervention instances required before showing data

**Fail Criteria**: Section missing, incorrect effectiveness calculations

---

## Section 8: Data Management (Import/Export, Manage Custom Data) (P0-P1)

### DM-001: Export Data to JSON
**Priority**: P0
**Risk**: DATA-9 (Critical - data portability for beta users)

**Steps**:
1. Log multiple entries (symptoms, foods, flares, mood, sleep)
2. Navigate to `/export` (or Settings → Export Data)
3. Click "Export All Data" button
4. Download JSON file

**Expected**:
- [ ] Export function triggers download
- [ ] JSON file contains all user data:
  - Symptoms, foods, triggers, medications, mood, sleep entries
  - Flares and flare events
  - Custom user data (custom symptoms, etc.)
  - Preferences
- [ ] JSON is well-formatted and readable
- [ ] File size is reasonable (<10MB for typical usage)

**Fail Criteria**: Export fails, incomplete data, corrupted JSON

---

### DM-002: Import Data from JSON
**Priority**: P0
**Risk**: DATA-9 (Critical - data recovery/migration)

**Steps**:
1. Export data (DM-001) and save JSON file
2. Clear all data using Dev Data Controls
3. Navigate to `/export` (or Settings → Import Data)
4. Click "Import Data" button
5. Select previously exported JSON file
6. Confirm import

**Expected**:
- [ ] Import function accepts JSON file
- [ ] All data restored from export:
  - Symptoms, foods, flares, mood, sleep entries
  - Custom user data
  - Preferences
- [ ] Success message displays: "Import complete: X entries restored"
- [ ] Dashboard shows restored data
- [ ] No duplicate entries created

**Fail Criteria**: Import fails, partial data restore, duplicate entries

---

### DM-003: Import/Export Compatibility (Story 3.5.1)
**Priority**: P0
**Risk**: DATA-9 (Critical - pre-populated defaults compatibility)

**Steps**:
1. Start with clean database (pre-populated defaults from Story 3.5.1)
2. Export data (should include defaults)
3. Add custom symptom "Custom Item"
4. Export data again
5. Import first export file
6. Verify defaults + custom item coexist

**Expected**:
- [ ] Export includes both defaults and custom items
- [ ] Import doesn't overwrite defaults
- [ ] Import maintains custom items
- [ ] No schema conflicts between defaults and custom data

**Fail Criteria**: Defaults lost on import, custom items overwritten

---

### DM-004: Manage Custom Symptoms
**Priority**: P1
**Risk**: BUS-6 (High - user customization core feature)

**Steps**:
1. Navigate to `/manage`
2. Click "Add Custom Symptom"
3. Enter: "Custom Shoulder Pain"
4. Save custom symptom
5. Verify symptom appears in Symptoms section
6. Edit custom symptom (rename to "Shoulder Pain Variant")
7. Delete custom symptom (with confirmation)

**Expected**:
- [ ] Can create custom symptom
- [ ] Custom symptom badge displays (visual indicator)
- [ ] Can edit custom symptom name
- [ ] Can delete custom symptom (with "Are you sure?" confirmation)
- [ ] Deleted symptom removed from logging lists
- [ ] Cannot delete default symptoms (only custom)

**Fail Criteria**: Cannot create/edit/delete custom items, can delete defaults

---

### DM-005: Manage Custom Foods
**Priority**: P1
**Risk**: BUS-6 (High - food tracking customization)

**Steps**:
1. Navigate to `/manage`
2. Add custom food: "Almond Milk (Unsweetened)"
3. Optionally assign category: "Dairy Alternatives"
4. Save custom food
5. Navigate to `/log/food`
6. Verify custom food appears at top of list

**Expected**:
- [ ] Can create custom food
- [ ] Can assign category to custom food
- [ ] Custom food appears prominently in food logging (top or "Custom" section)
- [ ] Custom food badge displays
- [ ] Can edit/delete custom food from Manage Data page

**Fail Criteria**: Cannot create custom food, doesn't appear in log list

---

## Section 9: Settings & Preferences (P1-P2)

### SET-001: Dark Mode Toggle
**Priority**: P1
**Risk**: BUS-4 (Medium - UX critical for HS users - photo sensitivity)

**Steps**:
1. Navigate to `/settings`
2. Toggle "Dark Mode" switch to ON
3. Navigate to different pages (dashboard, flares, logging)
4. Verify dark mode applies everywhere
5. Toggle dark mode OFF

**Expected**:
- [ ] Dark mode toggle is available in settings
- [ ] Dark mode applies immediately (no page refresh)
- [ ] All text is visible in dark mode (light text on dark backgrounds)
- [ ] All pages respect dark mode preference
- [ ] Dark mode preference persists after refresh
- [ ] WCAG AA contrast ratios met (per Story 3.5.6)

**Fail Criteria**: Text invisible in dark mode (BLOCKER per Story 3.5.6), preference doesn't persist

---

### SET-002: Theme Preference Persists
**Priority**: P1
**Risk**: DATA-4 (Medium - preferences not saved)

**Steps**:
1. Set dark mode ON
2. Close browser tab
3. Reopen application
4. Verify dark mode is still ON

**Expected**:
- [ ] Theme preference persists in localStorage or IndexedDB
- [ ] Theme applies on page load (no flash of light mode)

**Fail Criteria**: Theme resets to default

---

### SET-003: Language/Locale Settings (if implemented)
**Priority**: P2
**Risk**: BUS-2 (Low - optional feature)

**Steps**:
1. Navigate to `/settings`
2. Check for language/locale options
3. If available, change language setting
4. Verify UI updates

**Expected**:
- [ ] Language setting available (or N/A if not implemented)
- [ ] Changing language updates UI text
- [ ] Preference persists

**Fail Criteria**: N/A if not implemented

---

## Section 10: Accessibility & Keyboard Navigation (P1)

### ACC-001: Keyboard Navigation - Tab Order
**Priority**: P1
**Risk**: SEC-4 (Medium - accessibility compliance per Story 3.5.8)

**Steps**:
1. Navigate to `/dashboard`
2. Press Tab key repeatedly
3. Verify tab order is logical (top to bottom, left to right)
4. Verify all interactive elements are reachable

**Expected**:
- [ ] Tab key cycles through all interactive elements
- [ ] Tab order is logical and predictable
- [ ] Focus indicators clearly visible on all focusable elements
- [ ] Skip to main content link available (accessibility best practice)

**Fail Criteria**: Cannot reach elements via Tab, no focus indicators

---

### ACC-002: Keyboard Shortcuts - Logging
**Priority**: P1
**Risk**: BUS-4 (Medium - productivity feature per Story 3.5.8)

**Steps**:
1. Navigate to `/dashboard`
2. Press keyboard shortcut: `Shift+S` (or documented shortcut for symptom logging)
3. Verify symptom logging page opens
4. Test other shortcuts: `Shift+F` (food), `Shift+M` (medication), etc.

**Expected**:
- [ ] Keyboard shortcuts documented in Help page (`/help/keyboard-shortcuts`)
- [ ] Shortcuts work from dashboard
- [ ] Shortcuts do NOT interfere when typing in text fields (disabled when input focused)
- [ ] Escape key closes modals/dialogs

**Fail Criteria**: Shortcuts trigger while typing, shortcuts don't work, no documentation

---

### ACC-003: Screen Reader Announcements
**Priority**: P2
**Risk**: SEC-4 (Medium - accessibility compliance)

**Steps**:
1. Enable screen reader (NVDA on Windows, JAWS, or VoiceOver on Mac)
2. Navigate to `/flares`
3. Tab through body map regions
4. Listen to screen reader announcements

**Expected**:
- [ ] Screen reader announces region names ("Left Groin", "Right Shoulder")
- [ ] Screen reader announces flare counts per region
- [ ] Form labels are properly announced
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] ARIA labels present on all interactive elements

**Fail Criteria**: Screen reader silent, missing labels, poor announcements

---

## Section 11: Performance & Non-Functional Requirements (P0-P1)

### PERF-001: Body Map Zoom/Pan Performance
**Priority**: P0
**Risk**: PERF-6 (High - NFR001 requirement: <100ms response)

**Steps**:
1. Navigate to `/flares`
2. Zoom into body region (3x zoom)
3. Pan across zoomed view using drag gesture
4. Measure response time (Chrome DevTools Performance tab)

**Expected**:
- [ ] Zoom interactions respond within 100ms (NFR001)
- [ ] Pan interactions respond within 100ms
- [ ] No jank or stuttering during zoom/pan
- [ ] Smooth 60fps animations

**Fail Criteria**: Zoom/pan laggy (>100ms), visual stuttering, dropped frames

---

### PERF-002: IndexedDB Write Performance
**Priority**: P0
**Risk**: DATA-9 (Critical - NFR002 requirement: immediate persistence)

**Steps**:
1. Open DevTools Console
2. Log symptom entry
3. Immediately check IndexedDB (before any network request)
4. Verify entry exists in IndexedDB

**Expected**:
- [ ] Data persists to IndexedDB immediately (<50ms)
- [ ] No network delay before IndexedDB write
- [ ] Offline-first architecture confirmed (IndexedDB first, sync later)

**Fail Criteria**: Data not in IndexedDB immediately, network required for save

---

### PERF-003: Calendar Month Load Performance
**Priority**: P1
**Risk**: PERF-6 (High - calendar performance per Story 3.5.7)

**Steps**:
1. Create 100+ entries across a month
2. Navigate to `/calendar`
3. Load month with 100+ entries
4. Measure load time (DevTools Performance tab)

**Expected**:
- [ ] Calendar month loads in <1 second (Story 3.5.7)
- [ ] No UI freezing or blocking
- [ ] Calendar remains responsive during load

**Fail Criteria**: Load time >1 second, UI freezes, unresponsive

---

### PERF-004: Large Dataset Handling
**Priority**: P2
**Risk**: PERF-4 (Medium - long-term usage scaling)

**Steps**:
1. Use Dev Data Controls to generate 1000 entries
2. Navigate to dashboard
3. Navigate to calendar
4. Navigate to analytics
5. Measure page load times

**Expected**:
- [ ] Dashboard loads in <2 seconds with 1000 entries
- [ ] Calendar loads in <2 seconds
- [ ] Analytics loads in <3 seconds
- [ ] No browser crashes or memory issues

**Fail Criteria**: Page loads >5 seconds, browser crash, out of memory

---

## Section 12: Security & Data Integrity (P0)

### SEC-001: Data Isolation Between Users
**Priority**: P0
**Risk**: SEC-9 (Critical - data privacy violation)

**Steps**:
1. Create User A (onboarding with name "User A")
2. Log 5 entries as User A
3. Clear browser data (simulate new user)
4. Create User B (onboarding with name "User B")
5. Verify User B cannot see User A's data

**Expected**:
- [ ] User B dashboard is empty (no User A data)
- [ ] IndexedDB queries filter by userId
- [ ] No cross-user data leakage

**Fail Criteria**: User B sees User A's data (CRITICAL BLOCKER)

---

### SEC-002: Data Immutability (NFR003)
**Priority**: P0
**Risk**: DATA-9 (Critical - flare history integrity)

**Steps**:
1. Create flare with severity 5
2. Update severity to 8
3. Attempt to edit historical FlareEvent record in DevTools
4. Verify application prevents modification

**Expected**:
- [ ] Cannot edit past FlareEvent records via UI
- [ ] Historical severity values are immutable
- [ ] Timestamps cannot be modified after creation
- [ ] Audit trail preserved (NFR003)

**Fail Criteria**: Can edit historical data, timestamps modified

---

### SEC-003: No Sensitive Data in Console Logs
**Priority**: P1
**Risk**: SEC-6 (High - data exposure in production)

**Steps**:
1. Open DevTools Console
2. Navigate through application (logging, flares, analytics)
3. Review console logs

**Expected**:
- [ ] No user data logged to console (symptoms, flares, notes)
- [ ] No API keys or secrets in console
- [ ] Debug logs disabled in production build

**Fail Criteria**: User data visible in console, API keys exposed

---

## Section 13: Critical UI Fixes Validation (P0 - Story 3.5.6)

### UI-001: Dark Mode Text Visibility
**Priority**: P0
**Risk**: BUS-8 (High - dark mode broken per Story 3.5.6)

**Steps**:
1. Enable dark mode in settings
2. Navigate to all major pages: dashboard, flares, logging, calendar, analytics
3. Verify all text is visible (light text on dark backgrounds)

**Expected**:
- [ ] All text visible in dark mode (no invisible text)
- [ ] Buttons and controls visible
- [ ] Form inputs readable
- [ ] WCAG AA contrast ratios met

**Fail Criteria**: Any invisible text (BLOCKER per Story 3.5.6)

---

### UI-002: Onboarding Step 5 Removed
**Priority**: P0
**Risk**: BUS-6 (High - broken onboarding per Story 3.5.6)

**Steps**:
1. Start onboarding flow
2. Count total steps (should be 4, not 5)
3. Verify no "Learning Modules" step appears

**Expected**:
- [ ] Onboarding has exactly 4 steps (Personal Info, Preferences, Symptoms, Medications)
- [ ] No Step 5 "Learning Modules" section (modules don't exist)
- [ ] Onboarding completes after Step 4

**Fail Criteria**: Step 5 still present (BLOCKER)

---

### UI-003: Flares Page - Remove Broken Buttons
**Priority**: P0
**Risk**: BUS-6 (High - broken UI per Story 3.5.6)

**Steps**:
1. Navigate to `/flares`
2. Verify page layout
3. Look for "Explore map view" and "Show split layout" buttons

**Expected**:
- [ ] "Explore map view" button is REMOVED (feature not implemented)
- [ ] "Show split layout" button is REMOVED (feature not implemented)
- [ ] Flares page shows body map and active flares list without broken buttons

**Fail Criteria**: Broken buttons still present

---

### UI-004: Toast Messages - No Layout Shift
**Priority**: P1
**Risk**: BUS-4 (Medium - UX annoyance per Story 3.5.6)

**Steps**:
1. Log a symptom entry
2. Observe success toast message appears
3. Verify page content doesn't jump/shift when toast appears

**Expected**:
- [ ] Toast messages use absolute positioning
- [ ] No layout shift when toast appears
- [ ] Toast appears in consistent location (top-right or bottom-right)
- [ ] Toast auto-dismisses after 3-5 seconds

**Fail Criteria**: Page content shifts when toast appears

---

### UI-005: Info Boxes - Persistent Icons (Not Closable)
**Priority**: P1
**Risk**: BUS-3 (Medium - UX improvement per Story 3.5.6)

**Steps**:
1. Navigate to pages with informational content
2. Look for info boxes or help text
3. Verify info icons (ℹ️) are present, not closable boxes

**Expected**:
- [ ] Info content uses persistent "i" icons instead of closable boxes
- [ ] Clicking icon shows/hides info content (tooltip or popover)
- [ ] Info icons don't clutter UI

**Fail Criteria**: Closable boxes still present (bad UX)

---

## Section 14: Edge Cases & Error Handling (P1-P2)

### EDGE-001: Empty State - No Data Logged
**Priority**: P1
**Risk**: BUS-4 (Medium - first-time user experience)

**Steps**:
1. Reset database (clean state)
2. Complete onboarding
3. Navigate to dashboard

**Expected**:
- [ ] Dashboard displays empty state with helpful guidance
- [ ] Empty state message: "Welcome! Start logging your symptoms, food, and flares to track patterns."
- [ ] Quick action buttons prominently displayed
- [ ] No errors or blank screens

**Fail Criteria**: Blank dashboard, no guidance, console errors

---

### EDGE-002: Invalid Form Input - Symptom Severity
**Priority**: P1
**Risk**: DATA-4 (Medium - data validation)

**Steps**:
1. Navigate to `/log/symptom`
2. Select symptom
3. Attempt to set severity to 0 (invalid)
4. Attempt to set severity to 11 (invalid)
5. Attempt to save without selecting symptom

**Expected**:
- [ ] Severity slider constrained to 1-10 range
- [ ] Cannot set severity < 1 or > 10
- [ ] Form validation prevents saving without required fields
- [ ] Error messages display for invalid input

**Fail Criteria**: Can save invalid severity, no validation errors

---

### EDGE-003: Long Text Input - Notes Field
**Priority**: P2
**Risk**: DATA-3 (Medium - text truncation)

**Steps**:
1. Create flare
2. Enter very long note (>1000 characters) in notes field
3. Save flare
4. View flare detail

**Expected**:
- [ ] Notes field accepts long input (up to reasonable limit, e.g., 5000 chars)
- [ ] Long notes display correctly (no truncation or overflow)
- [ ] Notes saved completely to IndexedDB

**Fail Criteria**: Notes truncated, overflow issues, save fails

---

### EDGE-004: Date Boundary - Midnight Logging
**Priority**: P2
**Risk**: DATA-4 (Medium - timezone handling)

**Steps**:
1. Set system time to 11:59 PM
2. Log symptom entry
3. Wait until 12:01 AM
4. Log another symptom entry
5. Check calendar for both dates

**Expected**:
- [ ] First entry logged on previous date (11:59 PM)
- [ ] Second entry logged on new date (12:01 AM)
- [ ] Calendar shows entries on correct dates
- [ ] Timezone handling correct (local time vs UTC)

**Fail Criteria**: Entries logged on wrong dates, timezone bugs

---

### EDGE-005: Network Failure - Graceful Degradation
**Priority**: P1
**Risk**: OPS-6 (High - offline resilience)

**Steps**:
1. Start with online connection
2. Disconnect network (DevTools Offline mode)
3. Log symptom entry
4. Navigate between pages
5. Reconnect network

**Expected**:
- [ ] Application continues to function offline
- [ ] Offline indicator displays (if implemented)
- [ ] All logging saves to IndexedDB
- [ ] No network errors crash the app
- [ ] When reconnected, app continues normally

**Fail Criteria**: App crashes offline, data lost, error dialogs block usage

---

## Section 15: Test Reporting Template

### Bug Report Format

When reporting issues, use this template:

```markdown
## Bug Report: [Short Description]

**Test ID**: [e.g., DL-001]
**Priority**: [P0/P1/P2]
**Risk Category**: [DATA/SEC/BUS/TECH/PERF/OPS]
**Risk Score**: [1-9]

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:
-

**Actual Result**:
-

**Evidence**:
- [ ] Screenshot attached
- [ ] Console logs attached
- [ ] IndexedDB state captured
- [ ] Network logs (if relevant)

**Environment**:
- Browser: [Chrome 120, Safari 17, etc.]
- OS: [Windows 11, macOS 14, iOS 17, etc.]
- Screen Size: [Desktop 1920x1080, Mobile 375x667, etc.]
- Online/Offline: [Online/Offline]

**Severity**:
- [ ] Blocker (P0 - blocks beta release)
- [ ] Critical (P1 - must fix before launch)
- [ ] Major (P2 - fix if time permits)
- [ ] Minor (P3 - defer to post-beta)
```

---

## Section 16: Risk Assessment Matrix

| Risk ID | Category | Description                                     | Probability | Impact | Score | Priority | Mitigation                             |
|---------|----------|-------------------------------------------------|-------------|--------|-------|----------|----------------------------------------|
| R-001   | DATA     | Flare history data loss on update               | 2           | 3      | 6     | P0       | Test FL-003 immutability               |
| R-002   | DATA     | Offline data not persisting to IndexedDB        | 2           | 3      | 6     | P0       | Test DL-010, PERF-002 offline mode     |
| R-003   | BUS      | Onboarding completion routing to `/` not `/dashboard` | 3   | 3      | 9     | P0       | Test ON-001, UI-002 (Story 0.5.1 fix)  |
| R-004   | BUS      | Empty symptom/food lists on first use          | 3           | 3      | 9     | P0       | Test DL-001, DL-003 (Story 3.5.1 fix)  |
| R-005   | DATA     | Import/export data corruption                   | 2           | 3      | 6     | P0       | Test DM-001, DM-002, DM-003            |
| R-006   | SEC      | Cross-user data leakage                         | 1           | 3      | 3     | P0       | Test SEC-001 data isolation            |
| R-007   | DATA     | Flare ID not persistent across updates         | 2           | 3      | 6     | P0       | Test FL-001 UUID persistence           |
| R-008   | BUS      | Dark mode text invisible                        | 3           | 2      | 6     | P0       | Test UI-001 (Story 3.5.6 fix)          |
| R-009   | PERF     | Body map zoom/pan laggy                         | 2           | 2      | 4     | P1       | Test PERF-001 (<100ms NFR001)          |
| R-010   | DATA     | Calendar doesn't display logged data            | 3           | 2      | 6     | P1       | Test CAL-001 (Story 3.5.7 fix)         |
| R-011   | BUS      | Flare update broken (deprecated API)            | 3           | 3      | 9     | P0       | Test FL-002 (Story 0.5.2 fix)          |
| R-012   | DATA     | Historical flare data can be edited             | 2           | 3      | 6     | P0       | Test SEC-002 immutability (NFR003)     |
| R-013   | BUS      | Mood/sleep tracking missing                     | 3           | 2      | 6     | P0       | Test DL-005, DL-006 (Story 3.5.2)      |
| R-014   | PERF     | Calendar slow with large dataset                | 2           | 2      | 4     | P1       | Test PERF-003 performance              |
| R-015   | SEC      | User data logged to console in production       | 2           | 2      | 4     | P1       | Test SEC-003 console logs              |
| R-016   | BUS      | Problem Areas analytics incorrect               | 2           | 2      | 4     | P1       | Test AN-001 calculation accuracy       |
| R-017   | OPS      | Application crashes offline                     | 2           | 3      | 6     | P1       | Test EDGE-005 offline resilience       |
| R-018   | DATA     | Invalid severity values saved                   | 2           | 2      | 4     | P1       | Test EDGE-002 form validation          |

**Risk Summary**:
- **CRITICAL (Score 9)**: 3 risks - R-003, R-004, R-011 (all P0 blockers)
- **HIGH (Score 6-8)**: 9 risks - require mitigation before beta
- **MEDIUM (Score 4-5)**: 6 risks - monitor closely

**Gate Decision**: FAIL if any Score=9 risks unresolved.

---

## Section 17: Test Execution Summary

### Test Execution Plan

**Phase 1: P0 Smoke Tests** (30 minutes)
- Execute ST-001 to ST-005
- STOP if any smoke test fails - resolve before continuing

**Phase 2: P0 Critical Scenarios** (6-8 hours)
- Execute all P0 scenarios across all sections
- Priority order: Onboarding → Flare Tracking → Daily Logging → Data Management
- STOP on any blocker (Score 9 risk)

**Phase 3: P1 High-Priority Scenarios** (8-10 hours)
- Execute all P1 scenarios
- Can proceed to beta with P1 warnings (Score 6-8 risks) if documented

**Phase 4: P2 Medium-Priority Scenarios** (4-5 hours)
- Execute P2 scenarios if time permits
- Can defer to post-beta

**Total Estimated Effort**: 18-23 hours comprehensive testing

---

### Quality Gate Criteria

**PASS (Ready for Beta)**:
- [ ] All P0 smoke tests pass (ST-001 to ST-005)
- [ ] All P0 scenarios pass (100% pass rate)
- [ ] No CRITICAL risks (Score 9) open
- [ ] ≥95% P1 scenarios pass
- [ ] All HIGH risks (Score 6-8) have documented mitigations

**CONCERNS (Beta with Warnings)**:
- [ ] All P0 scenarios pass
- [ ] 90-94% P1 scenarios pass
- [ ] HIGH risks have mitigation plans and owners

**FAIL (Block Beta Release)**:
- [ ] Any P0 scenario fails
- [ ] Any CRITICAL risk (Score 9) unresolved
- [ ] Onboarding broken (R-003, R-004)
- [ ] Data loss risk present (R-001, R-002, R-005)

---

## Section 18: Notes for QA Team

### Testing Best Practices

1. **Start Clean**: Use Dev Data Controls to reset database before each test section
2. **Test Offline**: At least 20% of tests should be executed offline (toggle DevTools Network → Offline)
3. **Check IndexedDB**: After every data operation, verify IndexedDB state in DevTools → Application → IndexedDB
4. **Document Evidence**: Take screenshots for pass/fail results, especially for blocker issues
5. **Test Multiple Browsers**: Execute P0 scenarios on Chrome + Safari (mobile)

### Known Limitations (Out of Scope for Beta)

Per PRD, these features are NOT implemented:
- Emergency management features
- Advanced predictive analytics (flare prediction)
- Multi-device synchronization
- Medical-grade PDF export
- AI-powered photo analysis
- 3D body models
- Gamification features

**Do NOT report missing features from above list as bugs.**

### Test Environment Setup

**Browser DevTools Shortcuts**:
- `F12` - Open DevTools
- `Ctrl+Shift+I` - Open DevTools
- `Application → IndexedDB` - View database
- `Network → Offline` - Simulate offline
- `Performance → Record` - Measure performance

**Dev Data Controls** (if implemented):
- Navigate to `/debug` or Settings → Dev Tools
- "Reset All Data" - Clear IndexedDB
- "Generate Sample Data" - Create test entries
- "Export State" - Save test state for reproduction

---

## Appendix: Test Coverage Summary by Feature Area

| Feature Area                  | P0 Tests | P1 Tests | P2 Tests | Total | Est. Hours |
|-------------------------------|----------|----------|----------|-------|------------|
| Smoke Tests                   | 5        | 0        | 0        | 5     | 0.5        |
| Onboarding & User Setup       | 3        | 0        | 0        | 3     | 1          |
| Body Map & Flare Location     | 3        | 3        | 0        | 6     | 2          |
| Flare Lifecycle Management    | 4        | 3        | 0        | 7     | 3          |
| Daily Logging                 | 5        | 5        | 0        | 10    | 4          |
| Calendar & Timeline           | 0        | 2        | 1        | 3     | 1          |
| Analytics & Insights          | 0        | 2        | 3        | 5     | 2          |
| Data Management               | 3        | 2        | 0        | 5     | 2          |
| Settings & Preferences        | 0        | 2        | 1        | 3     | 1          |
| Accessibility & Keyboard Nav  | 0        | 3        | 0        | 3     | 1.5        |
| Performance & NFRs            | 2        | 2        | 0        | 4     | 2          |
| Security & Data Integrity     | 3        | 0        | 0        | 3     | 1          |
| Critical UI Fixes (Story 3.5.6)| 3       | 2        | 0        | 5     | 1          |
| Edge Cases & Error Handling   | 0        | 3        | 2        | 5     | 2          |
| **TOTAL**                     | **22**   | **28**   | **18**   | **68**| **18-23**  |

---

## Changelog

**Version 1.0** - 2025-10-31
- Initial comprehensive test scenarios document
- 68 scenarios across 14 feature areas
- Risk assessment matrix with 18 identified risks
- P0-P2 priority classification
- Estimated 18-23 hours total test execution time

---

**Generated by**: BMad TEA (Master Test Architect) - Workflow: `testarch/test-design`
**For Questions**: Contact Steven (steven-d-pennington)
**Documentation**: See `/docs` folder for PRD, epics, and stories
