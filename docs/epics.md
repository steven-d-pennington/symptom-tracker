# symptom-tracker - Epic Breakdown

**Author:** Steven
**Date:** 2025-10-18
**Project Level:** 2
**Target Scale:** Medium - Multiple Epics

---

## Overview

This document provides the detailed epic breakdown for symptom-tracker Flare Tracking & Body Map Enhancements, expanding on the high-level epic list in the [PRD](./PRD.md).

Each epic includes:

- Expanded goal and value proposition
- Complete story breakdown with user stories
- Acceptance criteria for each story
- Story sequencing and dependencies

**Epic Sequencing Principles:**

- Epic 1 establishes body map precision foundation
- Epic 2 builds flare lifecycle tracking on the enhanced body map
- Epic 3 adds analytics leveraging the flare data
- Epic 4 (lower priority) adds photo documentation

**No forward dependencies** - each story builds only on previous work

---

## Epic 0: UI/UX Revamp & Navigation Harmonization _(NEW)_

### Expanded Goal

Deliver a cohesive, production-ready user experience by harmonizing navigation, simplifying high-traffic screens, and preparing the interface for upcoming accessibility upgrades. This epic leverages findings documented in `docs/ui/ui-ux-revamp-blueprint.md`.

### Value Proposition

- Reduces friction for new and returning users by presenting a single, predictable navigation model across devices.
- Clarifies the “Track → Analyze → Manage → Support” journeys so daily logging and insights are accessible within three interactions.
- Creates a consistent layout foundation that accelerates future accessibility and analytics work.

### Story Breakdown

**Story 0.1: Consolidate Track Navigation**

As a user moving between desktop and mobile,
I want the primary navigation to use the same labels and destinations everywhere,
So that I always know where to go to log, review, or manage information.

**Acceptance Criteria:**
1. Sidebar (`Sidebar.tsx`), Bottom Tabs (`BottomTabs.tsx`), and any menu toggles expose the Track / Analyze / Manage / Support pillar structure described in the blueprint.
2. `/more` hub is removed or redirected; all links it contained are reachable from the new pillars without duplicates.
3. Navigation labels are consistent (“Log” vs. “Daily Reflection”, “Manage Data”, etc.) and match the central config.
4. Keyboard and screen-reader navigation follows the new ordering with aria-labels updated appropriately.

**Prerequisites:** Blueprint approved (`docs/ui/ui-ux-revamp-blueprint.md`).

---

**Story 0.2: Dashboard “Today” Refresh**

As a user landing on the dashboard,
I want a focused “Today” view with highlights and quick actions,
So that I can log events or review context without scanning multiple panels.

**Acceptance Criteria:**
1. Dashboard layout presents three primary modules in order: Highlights (active flares + alerts), Quick Actions (buttons to log flare, symptom, medication, trigger, photo), and Today’s Timeline preview.
2. Quick Actions open route-based sheets or full-screen dialogs on mobile instead of stacking modals.
3. Empty states and helper text guide first-time users (no flares, no events, etc.).
4. Page title, breadcrumbs, and navigation highlight align with the new pillars.

**Prerequisites:** Story 0.1 (navigation consolidation) to ensure entry points align with final IA.

---

**Story 0.3: Flares View Simplification**

As a user reviewing flare activity,
I want an approachable flares view that grows with my needs,
So that I am not overwhelmed the first time I open it but can still access map and stats when ready.

**Acceptance Criteria:**
1. Default state shows cards-only view with clear CTA to enable map/split view; persisted preference stored per user.
2. Body map guidance uses progressive disclosure (inline tips, context-aware hints) and works with keyboard focus in preparation for Story 1.6.
3. Statistics and filters are grouped in a collapsible summary panel that can be expanded on demand.
4. All toggles, buttons, and tabs are reachable via keyboard with aria attributes updated.

**Prerequisites:** Story 0.1 (navigation) and Story 0.2 (dashboard refresh) for consistent entry/return paths.

---

**Story 0.4: Navigation Title & Layout Harmonization**

As a developer maintaining navigation,
I want a single source of truth for route titles and layout behaviors,
So that future pages automatically display the right heading and navigation state.

**Acceptance Criteria:**
1. Create/shared configuration defining route metadata (title, pillar, mobile/desktop visibility) consumed by `NavLayout`, `TopBar`, Sidebar, and Bottom Tabs.
2. Top bar titles and breadcrumbs automatically update based on the shared config.
3. Route configuration supports hiding nav for special pages (onboarding, landing) without duplicated logic.
4. Unit tests cover key routes to prevent regressions (e.g., verifying “Log” renders the expected title on mobile and desktop).

**Prerequisites:** Story 0.1 completion; run after navigation structure is in place.

---

**Story 0.5: UX Instrumentation & Validation**

As a product owner validating the redesign,
I want scripts and basic instrumentation to measure success criteria,
So that I can confirm the revamp improved usability before resuming flare implementation.

**Acceptance Criteria:**
1. Document task walkthrough scripts (log flare by dashboard, open analytics, manage data) with target timings, stored alongside blueprint or tests directory.
2. Capture navigation event instrumentation hooks (or log placeholders) for key interactions (Quick Action taps, navigation switches).
3. Update documentation (README or blueprint) with instructions on running the walkthrough tests and interpreting results.
4. Summarize findings and remaining risks in workflow status once run at least once.

**Prerequisites:** Stories 0.1 – 0.4 implemented and merged, so validation reflects final experience.

---

## Epic 0.5: Pre-Launch Stabilization _(CRITICAL)_

### Expanded Goal

Address critical bugs discovered during pre-launch testing that block stable user onboarding and core flare management workflows. Ensure production readiness before resuming analytics feature development.

### Value Proposition

- Enables users to complete onboarding successfully and reach the dashboard
- Restores core flare update and resolve functionality
- Completes repository migration started in Epic 2
- Removes pre-launch blockers preventing user testing

### Story Breakdown

**Story 0.5.1: Fix Onboarding Completion Routing**

As a user completing onboarding,
I want to be taken to the dashboard when I click "Go to dashboard",
So that I can immediately start using the app as intended.

**Acceptance Criteria:**
1. "Go to dashboard" button in CompletionStep routes to `/dashboard` instead of `/`
2. Users land on dashboard page after completing onboarding
3. Dashboard displays correctly for new users
4. Onboarding completion flow tested end-to-end

**Prerequisites:** Epic 0 complete.

---

**Story 0.5.2: Fix Flare Update/Resolve Workflows**

As a user managing active flares,
I want my status updates and resolutions to save correctly,
So that I can track flare progression accurately.

**Acceptance Criteria:**
1. EventDetailModal migrates from deprecated `updateSeverity()`/`update()` methods to new `updateFlare()`/`addFlareEvent()` API
2. Flare severity updates save correctly and persist to IndexedDB
3. Flare status changes create proper FlareEvent records (append-only pattern)
4. Console deprecation warnings eliminated
5. EventDetailModal follows same patterns as FlareUpdateModal and FlareResolveModal
6. Update and resolve workflows tested end-to-end with data verification

**Prerequisites:** Epic 2 complete (repository infrastructure exists).

---

## Epic 1: Enhanced Body Map with Precision Location Tracking

### Expanded Goal

Transform the existing body map from a general location indicator into a precision tracking tool by adding critical missing body regions (groin areas) and implementing zoom/pan functionality that allows users to pinpoint exact flare locations with coordinate-level precision. This foundation enables accurate flare tracking in Epic 2.

### Value Proposition

Users with Hidradenitis Suppurativa frequently experience flares in the groin region, which is currently not represented on the body map. Additionally, being able to zoom into any body region and mark precise locations will:
- Reduce vague location data
- Enable tracking of multiple flares in the same general area
- Provide medical-grade location accuracy for healthcare consultations
- Support pattern recognition across specific body zones

### Story Breakdown

**Story 1.1: Add Groin Regions to Body Map SVG**

As a user tracking HS flares,
I want groin-specific regions (left groin, right groin, center groin) visible on all body map views,
So that I can accurately log flare locations in these critical areas.

**Acceptance Criteria:**
1. Front body view displays three distinct groin regions: left groin, right groin, center groin
2. Groin regions are anatomically accurate and tastefully rendered
3. Each groin region is a selectable SVG path element with hover/active states
4. Groin regions visible on all body map views (front, back if applicable, side views)
5. Groin region selection triggers the same flare-location flow as other body regions
6. Region labels display "Left Groin", "Right Groin", "Center Groin" when selected or hovered

**Prerequisites:** None (foundational story)

---

**Story 1.2: Implement Zoom Controls for Body Map**

As a user marking flare locations,
I want to zoom into any body region,
So that I can see an enlarged view for precise location marking.

**Acceptance Criteria:**
1. Zoom controls (zoom in/out buttons) are accessible on body map interface
2. Pinch-to-zoom gesture works on mobile/touch devices
3. Scroll-wheel zoom works on desktop browsers
4. Zoom level ranges from 1x (full body view) to 3x minimum
5. Zoom focuses on cursor/touch position (not center of screen)
6. Zoom level persists when switching between body views (front/back/side)
7. Reset button returns to 1x zoom
8. All zoom interactions respond within 100ms (NFR001)

**Prerequisites:** None

---

**Story 1.3: Implement Pan Controls for Zoomed Body Map**

As a user viewing a zoomed body region,
I want to pan/drag the view,
So that I can navigate to different parts of the enlarged body map.

**Acceptance Criteria:**
1. When zoomed, user can click-and-drag (desktop) or touch-and-drag (mobile) to pan
2. Pan is constrained to body map boundaries (cannot pan into empty space)
3. Pan cursor changes to indicate drag capability
4. Pan momentum/inertia provides smooth movement feel
5. Pan position resets when zoom is reset to 1x
6. Pan interactions respond within 100ms (NFR001)

**Prerequisites:** Story 1.2 (Zoom Controls)

---

**Story 1.4: Coordinate-based Location Marking in Zoomed View**

As a user marking a precise flare location,
I want to tap/click an exact spot within a zoomed body region,
So that the system captures precise X/Y coordinates for the flare.

**Acceptance Criteria:**
1. When zoomed and region is selected, tap/click captures precise X/Y coordinates
2. Coordinates are normalized relative to the selected body region (0-1 scale)
3. Visual crosshair or pin appears at the marked location
4. Coordinate data is stored with the body region ID (e.g., "left-groin", x: 0.42, y: 0.67)
5. Users can adjust marked location by tapping a different spot (before saving)
6. Marked location persists when zooming out and back in
7. Coordinate precision enables distinguishing multiple flares in the same region

**Prerequisites:** Story 1.1 (Groin Regions), Story 1.2 (Zoom), Story 1.3 (Pan)

---

**Story 1.5: Display Flare Markers on Body Map**

As a user with active or historical flares,
I want to see visual markers on the body map showing where my flares are located,
So that I can quickly understand my flare distribution.

**Acceptance Criteria:**
1. Active flares display as colored markers on the body map at their precise coordinates
2. Marker color/icon indicates flare status: Active (red), Improving (yellow), Worsening (orange), Resolved (gray)
3. Multiple flares in the same region display without overlap (slight position offset if needed)
4. Marker size is touch-friendly (minimum 44x44px touch target per NFR001)
5. Tapping a marker opens the flare detail view
6. Markers update in real-time when flare status changes
7. Zoom level affects marker clustering/visibility (show all markers when zoomed)

**Prerequisites:** Story 1.4 (Coordinate Marking)

---

**Story 1.6: Body Map Accessibility and Keyboard Navigation**

As a user with accessibility needs,
I want to navigate and interact with the body map using keyboard and screen readers,
So that I can use the precision tracking features regardless of my input method.

**Acceptance Criteria:**
1. Tab key navigates between body regions in logical order
2. Enter/Space key selects a region
3. Arrow keys allow fine-tuned positioning within a zoomed region
4. Screen readers announce region names and flare counts
5. ARIA labels provide context for all interactive elements
6. Keyboard shortcuts for zoom (+/- keys) and pan (arrow keys when zoomed)
7. Focus indicators clearly show current keyboard position

**Prerequisites:** Story 1.1-1.5 (all body map functionality)

---

## Epic 2: Flare Lifecycle Management

### Expanded Goal

Enable users to track individual flares as persistent entities through their complete lifecycle - from onset through progression (worsening/improving) to resolution. This event stream-based tracking allows users to monitor treatment effectiveness, understand flare duration patterns, and maintain comprehensive flare history for medical consultations.

### Value Proposition

Current symptom logging treats each entry as an isolated event. Users cannot:
- Track how a specific flare changes over time
- See if treatments are helping or if a flare is worsening
- Understand typical flare durations
- Provide complete flare progression data to doctors

Flare lifecycle tracking solves these problems by creating persistent flare entities with complete history.

### Story Breakdown

**Story 2.1: Flare Data Model and IndexedDB Schema**

As a developer implementing flare tracking,
I want a robust Dexie schema for flare entities and flare events,
So that flare data persists locally with proper relationships and queries.

**Acceptance Criteria:**
1. Dexie schema includes `flares` table with: id (UUID), userId, startDate, endDate, status, bodyRegionId, coordinates{x,y}, createdAt, updatedAt
2. Dexie schema includes `flareEvents` table with: id, flareId, eventType, timestamp, severity, trend, notes, interventions
3. Compound indexes support efficient queries: [userId+status], [userId+bodyRegionId], [flareId+timestamp]
4. Schema migration from current version handled cleanly
5. TypeScript interfaces define FlareRecord and FlareEventRecord types
6. Repository pattern implemented: flareRepository with CRUD operations
7. All writes use offline-first pattern with immediate IndexedDB persistence (NFR002)

**Prerequisites:** None (foundational data layer)

---

**Story 2.2: Create New Flare from Body Map**

As a user experiencing a new flare,
I want to create a flare entity by marking its location on the body map,
So that I can begin tracking its progression.

**Acceptance Criteria:**
1. After marking precise location on body map (Epic 1), "Create Flare" button appears
2. Create Flare modal captures: initial severity (1-10 slider), optional notes (text field), timestamp (auto-populated)
3. System assigns unique persistent flare ID (UUID)
4. Flare is created with status "Active"
5. Flare appears immediately in "Active Flares" list
6. Flare marker appears on body map at marked coordinates
7. Confirmation message shows flare was saved successfully
8. Data persists to IndexedDB immediately (NFR002)

**Prerequisites:** Epic 1 complete, Story 2.1 (Data Model)

---

**Story 2.3: Active Flares Dashboard**

As a user with active flares,
I want to see a list of all my current active flares,
So that I can quickly review and update them.

**Acceptance Criteria:**
1. Active Flares page displays list of all flares with status "Active"
2. Each list item shows: body location (region name), severity (1-10 with color coding), trend arrow (if available), days active (calculated from startDate), last updated timestamp
3. List is sorted by severity (highest first) or by most recently updated
4. Tapping a flare opens the flare detail view
5. Empty state message shown if no active flares: "No active flares. Tap body map to track a new flare."
6. Pull-to-refresh updates the list (mobile)
7. Flare count badge shows total active flares

**Prerequisites:** Story 2.2 (Create Flare)

---

**Story 2.4: Update Flare Status (Severity and Trend)**

As a user tracking a flare's progression,
I want to update the flare's severity and trend status,
So that I can record whether it's getting better or worse.

**Acceptance Criteria:**
1. Flare detail view shows "Update Status" button
2. Update modal captures: new severity (1-10 slider showing previous value for context), trend (radio buttons: Improving/Stable/Worsening), optional notes, timestamp (auto-populated)
3. System creates new FlareEvent record with eventType="status_update"
4. Flare's current severity updates to new value
5. Trend indicator updates on Active Flares list
6. Historical severity/trend data preserved in flareEvents table
7. Update appears in flare history timeline immediately
8. Data persists to IndexedDB immediately (NFR002)
9. Cannot accidentally modify historical data (NFR003 - immutability)

**Prerequisites:** Story 2.3 (Active Flares Dashboard)

---

**Story 2.5: Log Flare Interventions**

As a user managing an active flare,
I want to record treatment interventions (medications, ice, rest, etc.),
So that I can track what I've tried and evaluate effectiveness.

**Acceptance Criteria:**
1. Flare detail view shows "Log Intervention" button
2. Intervention modal captures: intervention type (dropdown: Ice, Heat, Medication, Rest, Drainage, Other), specific details (text field), timestamp (auto-populated, editable)
3. System creates FlareEvent record with eventType="intervention"
4. Intervention appears in flare history timeline with icon/label
5. Multiple interventions can be logged for same flare
6. Intervention history visible in chronological order
7. Data persists to IndexedDB immediately (NFR002)

**Prerequisites:** Story 2.3 (Active Flares Dashboard)

---

**Story 2.6: View Flare History Timeline**

As a user reviewing a flare's progression,
I want to see a chronological timeline of all status changes and interventions,
So that I can understand the flare's complete history.

**Acceptance Criteria:**
1. Flare detail view includes "History" tab showing timeline of all FlareEvents
2. Timeline displays: date/time, event type icon, severity (for status updates), trend arrow (for status updates), intervention details (for interventions), notes
3. Timeline sorted reverse-chronologically (most recent first)
4. Visual line chart shows severity progression over time
5. Timeline is filterable: All Events, Status Updates Only, Interventions Only
6. Each timeline entry is tappable to view full details
7. Timeline loads efficiently for flares with many events

**Prerequisites:** Story 2.4 (Update Status), Story 2.5 (Log Interventions)

---

**Story 2.7: Mark Flare as Resolved**

As a user whose flare has healed,
I want to mark the flare as resolved,
So that it moves out of active tracking and into historical records.

**Acceptance Criteria:**
1. Flare detail view shows "Mark Resolved" button
2. Resolve modal captures: resolution date (defaults to today, editable), optional resolution notes, confirmation dialog
3. System updates flare status to "Resolved" and sets endDate
4. Flare immediately moves from "Active Flares" to "Resolved Flares" list
5. Body map marker changes to resolved status indicator (gray)
6. Flare history timeline shows resolution event
7. Resolved flares remain accessible for review but cannot be updated
8. Resolution data persists to IndexedDB immediately (NFR002)

**Prerequisites:** Story 2.6 (Flare History)

---

**Story 2.8: Resolved Flares Archive**

As a user reviewing past flares,
I want to access a list of all resolved flares,
So that I can review historical patterns and outcomes.

**Acceptance Criteria:**
1. Resolved Flares page displays list of all flares with status "Resolved"
2. Each list item shows: body location, resolution date, total duration (days from start to resolution), peak severity (highest recorded severity)
3. List is sorted by resolution date (most recent first)
4. Tapping a resolved flare opens read-only detail view
5. Search/filter by body region, date range, duration
6. Empty state message if no resolved flares
7. Resolved flares count badge

**Prerequisites:** Story 2.7 (Mark Resolved)

---

## Epic 3: Flare Analytics and Problem Areas

### Expanded Goal

Provide actionable insights into flare patterns by analyzing recurrence rates across body regions, calculating progression metrics, and identifying "problem areas" - regions with the highest flare frequency. These analytics help users understand their condition and support medical consultations.

### Value Proposition

Raw flare data is valuable, but pattern recognition adds significant insight:
- Which body areas flare most frequently?
- What's the typical flare duration?
- Are flares generally improving or worsening?
- How effective are interventions?

This epic transforms flare data into actionable intelligence.

### Story Breakdown

**Story 3.1: Calculate and Display Problem Areas**

As a user analyzing my flare patterns,
I want to see which body regions have the most flares,
So that I can identify my problem areas and discuss them with my doctor.

**Acceptance Criteria:**
1. Analytics page shows "Problem Areas" section
2. Problem areas ranked by flare frequency (count of flares in last 90 days)
3. Each problem area shows: body region name, flare count, percentage of total flares, visual indicator (bar chart or heat map)
4. Time range selector: Last 30 days, Last 90 days, Last Year, All Time
5. Empty state if no flares in selected time range
6. Tapping a problem area navigates to per-region flare history (Story 3.2)
7. Problem areas update immediately when new flares are added

**Prerequisites:** Epic 2 complete (flare data exists)

---

**Story 3.2: Per-Region Flare History**

As a user exploring a specific body region,
I want to see all flares that have occurred in that region,
So that I can understand region-specific patterns.

**Acceptance Criteria:**
1. Region detail page shows list of all flares for selected body region
2. Flares displayed in reverse-chronological order (most recent first)
3. Each flare shows: start date, resolution date (or "Active"), duration, peak severity, trend outcome
4. Timeline visualization shows flare occurrences over time
5. Statistics summary: total flare count, average duration, average severity, recurrence rate
6. Filter by status: All, Active, Resolved
7. Tapping a flare navigates to flare detail view

**Prerequisites:** Story 3.1 (Problem Areas)

---

**Story 3.3: Flare Duration and Severity Metrics**

As a user tracking flare patterns,
I want to see statistical summaries of flare duration and severity,
So that I can understand typical outcomes and identify outliers.

**Acceptance Criteria:**
1. Analytics page shows "Progression Metrics" section
2. Metrics displayed: average flare duration (days), median flare duration, shortest/longest duration, average peak severity, severity trend distribution (% improving vs worsening vs stable)
3. Metrics calculated for selected time range
4. Visual charts: duration histogram, severity distribution, trend pie chart
5. Metrics update when time range changes
6. Empty state if insufficient data (< 3 flares)

**Prerequisites:** Epic 2 complete (flare data with durations exists)

---

**Story 3.4: Flare Trend Analysis Visualization**

As a user reviewing my overall flare management,
I want to see how my flares are trending over time,
So that I can assess if my condition is improving or declining.

**Acceptance Criteria:**
1. Analytics page shows "Flare Trends" visualization
2. Line chart displays flare frequency over time (monthly buckets)
3. Overlay shows average severity per month
4. Trend line indicates overall trajectory (improving/stable/declining)
5. Time range selector: Last 6 months, Last Year, Last 2 Years, All Time
6. Chart is interactive: hover shows exact values, tap shows month details
7. Export chart as image for medical consultations

**Prerequisites:** Epic 2 complete, Story 3.3 (Metrics)

---

**Story 3.5: Intervention Effectiveness Analysis**

As a user trying different treatments,
I want to see which interventions correlate with flare improvement,
So that I can identify effective treatments.

**Acceptance Criteria:**
1. Analytics page shows "Intervention Effectiveness" section
2. Each intervention type shows: usage count, average severity change after intervention (positive = improvement), success rate (% of times severity decreased within 48 hours)
3. Interventions ranked by effectiveness
4. Caveat message: "Correlation not causation - discuss with your doctor"
5. Time range selector applies to intervention analysis
6. Minimum 5 intervention instances required before showing effectiveness data
7. Drill-down to specific intervention instances

**Prerequisites:** Epic 2 complete (intervention data exists), Story 3.3 (Metrics)

---

## Epic 3.5: Production-Ready UI/UX Enhancement _(CRITICAL)_

### Expanded Goal

Transform the symptom-tracker from development build to production-ready application by fixing critical UX issues, implementing essential missing features (mood/sleep tracking), and redesigning core logging workflows for improved usability. This epic addresses critical production-readiness issues identified through comprehensive UI/UX brainstorming (role-playing and expert panel review on 2025-10-29).

### Value Proposition

- **Eliminates critical onboarding drop-off** by fixing empty state crisis where new users cannot log anything
- **Improves daily user experience** by replacing clunky modal-based logging with dedicated pages
- **Adds clinically essential features** (mood & sleep) required for correlation analytics
- **Fixes broken functionality** blocking production readiness (dark mode, calendar, navigation)
- **Enables user launch** by resolving all critical production blockers

**Note:** This epic MUST be completed BEFORE Epic 4 (Photo Documentation) to ensure core application is production-ready.

### Story Breakdown

**Story 3.5.1: Fix Empty State Crisis & Pre-populate Defaults**

As a first-time user trying to log my symptoms,
I want to see available options when I click quick action buttons,
So that I can successfully log data on my first attempt.

**Acceptance Criteria:**
1. System pre-populates default symptoms, foods, triggers, and medications at user creation
2. Default data sets are sensible and medically relevant (common HS symptoms, treatments, foods)
3. Empty state components display contextual guidance: "No custom symptoms yet. Add in Settings > Manage Data"
4. Quick action buttons (Food, Symptom, Trigger, Medication) show at least defaults when clicked
5. Guided setup flow offers to help users add their first custom items
6. Empty states include clear links to Settings/Manage Data pages
7. First-time user can complete full logging workflow without hitting dead ends
8. Import/export functionality maintains compatibility with new defaults schema
9. DevDataControls updated to support pre-populated defaults

**Prerequisites:** None (critical foundational story)

---

**Story 3.5.2: Mood & Sleep Basic Logging**

As a user tracking my health patterns,
I want to log my daily mood and sleep quality,
So that I can later analyze correlations with symptoms and flares.

**Acceptance Criteria:**
1. Mood logging interface captures: mood scale (1-10 or emotion picker), optional notes, timestamp
2. Sleep logging interface captures: hours slept, sleep quality rating (1-10), optional notes, timestamp
3. Database schema includes `moodEntries` table: id, userId, mood, notes, timestamp
4. Database schema includes `sleepEntries` table: id, userId, hours, quality, notes, timestamp
5. Mood & Sleep logging accessible from dashboard or dedicated navigation item
6. Basic history view displays logged mood and sleep entries in chronological order
7. Data persists to IndexedDB with offline-first pattern
8. Import/export functionality supports mood and sleep data
9. DevDataControls updated for mood and sleep entries

**Prerequisites:** None (parallel with Story 3.5.1)

---

**Story 3.5.3: Redesign Symptom Logging (Modal → Dedicated Page)**

As a user logging symptoms daily,
I want a dedicated symptom logging page instead of a modal,
So that I can log symptoms more comfortably without UI constraints.

**Acceptance Criteria:**
1. Symptom logging opens as dedicated page route (not modal)
2. "Quick Log" mode captures essential fields: symptom selection, severity, timestamp
3. "Add Details" button expands to show optional fields: notes, tags, related data
4. Page layout allows scrolling without nested scrollable boxes
5. Navigation updates to link dashboard buttons to symptom logging page
6. Toast messages use absolute positioning (no layout shift)
7. Symptom selection interface redesigned for full-page context
8. Mobile responsive design optimized for touch

**Prerequisites:** Story 3.5.1 (defaults exist so symptom options populated)

---

**Story 3.5.4: Redesign Food Logging (Modal → Dedicated Page)**

As a user logging meals and tracking food triggers,
I want a dedicated food logging page with organized categories,
So that I can find and log foods quickly without scrolling through massive lists.

**Acceptance Criteria:**
1. Food logging opens as dedicated page route (not modal)
2. Foods organized in collapsible categories (Dairy, Grains, Proteins, etc.)
3. Smart defaults: Favorites section expanded at top, then Recents, then collapsed categories
4. Custom foods display at top of list prominently
5. Quick search/filter functionality for finding foods quickly
6. "Quick Log" mode for frequently logged foods
7. "Add Details" button for portion size, notes, timing
8. Page scrolls naturally without nested scroll containers
9. Mobile-optimized category expansion/collapse

**Prerequisites:** Story 3.5.1 (defaults exist), parallel with Story 3.5.3

---

**Story 3.5.5: Redesign Trigger & Medication Logging (Modals → Pages)**

As a user tracking triggers and medications,
I want dedicated pages for each logging type,
So that I can use the same improved patterns as symptom and food logging.

**Acceptance Criteria:**
1. Trigger logging opens as dedicated page (following Food pattern)
2. Medication logging opens as dedicated page (following Symptom pattern)
3. Both implement collapsible categories with smart defaults (Favorites/Recents/Categories)
4. Both support Quick Log and Add Details modes
5. Navigation routing updated for both pages
6. Settings allow users to disable default triggers/medications they don't use
7. Mobile-responsive layouts optimized for each logging type

**Prerequisites:** Story 3.5.3 and 3.5.4 patterns established

---

**Story 3.5.6: Critical UI Fixes Bundle**

As a user experiencing broken UI elements,
I want all critical visual and functional bugs fixed,
So that I can use the app reliably in production.

**Acceptance Criteria:**
1. **Dark Mode:** All text visible (light text on dark backgrounds) via CSS variable updates
2. **Onboarding:** Remove Step 5 "learning modules" section (modules don't exist)
3. **Flares Page:** Remove "Explore map view" and "Show split layout" buttons
4. **About Page:** Update with current project information
5. **Dashboard Buttons:** Visual consistency with app design (cohesive styling)
6. **Toast Messages:** Fix layout shift issue (absolute positioning)
7. **Info Boxes:** Replace closable boxes with persistent "i" icons
8. All fixes tested across light/dark mode and mobile/desktop
9. WCAG AA contrast ratios verified for dark mode fixes

**Prerequisites:** Can run parallel with other stories

---

**Story 3.5.7: Fix Calendar Data Wiring**

As a user reviewing my health history,
I want the calendar to display my logged data,
So that I can see my activity patterns over time.

**Acceptance Criteria:**
1. Calendar component wired to IndexedDB data sources
2. Historical mode displays: symptoms, foods, triggers, medications, mood, sleep, flares
3. Each logged entry appears on appropriate calendar date
4. Calendar day view shows count badges for multiple entries
5. Clicking a date shows summary of logged data for that day
6. Calendar updates when new data is logged
7. Empty dates display appropriately without errors
8. Performance optimized for loading month view efficiently

**Prerequisites:** Story 3.5.2 (mood/sleep data exists for complete calendar)

---

**Story 3.5.8: Add Keyboard Navigation (Accessibility)**

As a user relying on keyboard navigation,
I want full keyboard access to all interactive elements,
So that I can use the app without a mouse.

**Acceptance Criteria:**
1. Tab key navigates through all interactive elements in logical order
2. Enter/Space activates buttons and links
3. Arrow keys navigate within list boxes and dropdowns
4. Escape key closes modals and dropdowns
5. Disable f/b/l/r keyboard shortcuts when typing in text fields (no interference)
6. Focus indicators clearly visible on all focusable elements
7. Screen reader announcements for state changes
8. Keyboard shortcuts documented in help/accessibility section

**Prerequisites:** Stories 3.5.3-3.5.5 (new pages need keyboard support)

---

## Epic 4: Photo Documentation Integration _(Lower Priority)_

### Expanded Goal

Enable visual documentation of flare progression through photo attachments, providing before/during/after comparisons that support medical consultations and personal tracking.

### Value Proposition

Photos provide visual evidence of flare progression that severity ratings alone cannot capture. Integration with the existing encrypted photo system ensures medical-grade privacy while enabling powerful progression tracking.

### Story Breakdown

**Story 4.1: Attach Photos to Flare Entities**

As a user documenting a flare visually,
I want to attach photos to a specific flare,
So that I can track visual progression alongside severity data.

**Acceptance Criteria:**
1. Flare detail view shows "Add Photo" button
2. Photo capture/upload uses existing encrypted photo system
3. Photo is linked to flare entity with flareId foreign key
4. Photo thumbnail appears in flare detail view
5. Multiple photos can be attached to same flare
6. Each photo includes timestamp (auto-populated, editable)
7. Photos persist with AES-256-GCM encryption (reuse existing system)
8. EXIF data stripped automatically

**Prerequisites:** Epic 2 complete, existing photo encryption system

---

**Story 4.2: Flare Photo Timeline View**

As a user reviewing flare progression,
I want to see all photos for a flare in chronological order,
So that I can visually track how the flare changed over time.

**Acceptance Criteria:**
1. Flare detail view includes "Photos" tab
2. Photos displayed in chronological order (earliest first)
3. Each photo shows: thumbnail, capture date/time, days since flare start
4. Tapping photo opens full-screen view with zoom
5. Swipe gesture navigates between photos
6. Empty state if no photos: "Add photos to visually track this flare"
7. Photo deletion with confirmation dialog

**Prerequisites:** Story 4.1 (Attach Photos)

---

**Story 4.3: Before/After Photo Comparison**

As a user evaluating flare improvement,
I want to compare an early photo with a recent photo side-by-side,
So that I can visually assess progression.

**Acceptance Criteria:**
1. Photo timeline view includes "Compare" mode toggle
2. Compare mode shows two photos side-by-side: earliest photo (before) and most recent photo (after)
3. User can select different photos for comparison (not just first/last)
4. Slider control allows fading between before/after
5. Comparison view works in both portrait and landscape
6. Comparison can be saved as image for sharing with doctor
7. Comparison respects photo encryption (no unencrypted exports)

**Prerequisites:** Story 4.2 (Photo Timeline)

---

**Story 4.4: Photo Annotation (Simple)**

As a user adding context to flare photos,
I want to add text notes or simple markers to photos,
So that I can highlight specific areas of concern.

**Acceptance Criteria:**
1. Photo detail view includes "Annotate" button
2. Annotation tools: text label, arrow pointer, circle highlight
3. Annotations saved as overlay (original photo unchanged)
4. Multiple annotations per photo
5. Annotation history preserved (who added when)
6. Annotations visible in both detail view and comparison view
7. Annotations encrypted along with photo

**Prerequisites:** Story 4.2 (Photo Timeline)

---

## Story Guidelines Reference

**Story Format:**

```
**Story [EPIC.N]: [Story Title]**

As a [user type],
I want [goal/desire],
So that [benefit/value].

**Acceptance Criteria:**
1. [Specific testable criterion]
2. [Another specific criterion]
3. [etc.]

**Prerequisites:** [Dependencies on previous stories, if any]
```

**Story Requirements:**

- **Vertical slices** - Complete, testable functionality delivery
- **Sequential ordering** - Logical progression within epic
- **No forward dependencies** - Only depend on previous work
- **AI-agent sized** - Completable in 2-4 hour focused session
- **Value-focused** - Integrate technical enablers into value-delivering stories

---

**For implementation:** Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown.
