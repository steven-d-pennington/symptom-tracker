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

## Epic 3.6: Interactive Onboarding Enhancement _(COMPLETE)_

### Expanded Goal

Transform the onboarding experience from passive auto-population to active user engagement by allowing users to select which symptoms, triggers, medications, and foods are relevant to them. This creates a personalized, intentional first-use experience that reduces overwhelm and improves data quality.

### Value Proposition

The original onboarding auto-populated ALL defaults (50+ items), which felt overwhelming and impersonal. This enhancement:
- **Empowers users** to actively choose relevant items from day one
- **Reduces cognitive load** by showing only items they selected
- **Improves data quality** through intentional selection vs passive acceptance
- **Enables customization** by allowing custom item creation during onboarding
- **Prepares for cloud sync** with GUID-based user ID generation

### Story Breakdown

**Story 3.6.1: Interactive Data Selection During Onboarding** _(COMPLETE - 13 points)_

As a new user going through onboarding,
I want to select which symptoms, triggers, medications, and foods are relevant to me,
So that my dashboard only shows items I actually use and I feel in control of my data from day one.

**Acceptance Criteria:**
1. Add symptom selection step with collapsible categories and checkboxes
2. Add real-time search functionality across ALL selection steps (symptoms, triggers, medications, foods)
3. Allow adding custom items during onboarding with inline form
4. Add trigger selection step with same UX pattern
5. Add medication selection step with same UX pattern
6. Add food selection step with same UX pattern
7. Update progress indicator for new steps
8. Add skip functionality for each selection step
9. Preserve selections when using back button
10. Batch creation on onboarding completion (only selected items)
11. Responsive design for mobile, tablet, desktop
12. Analytics tracking for selection patterns
13. Use GUID for user ID generation (cloud sync preparation)

**Technical Implementation:**
- Created reusable `SelectionStep` component for all 4 data types
- Implemented `OnboardingSelectionsContext` for state management
- Added search with debouncing (300ms) for performance
- Batch creation reduces DB operations from 100+ to 4
- sessionStorage persistence for refresh resilience
- GUID/UUID v4 format for user IDs

**Prerequisites:** Story 3.5.1 (defaults data structure)

**Completed:** 2025-11-02

---

## Epic 3.7: Body Map UX Enhancements - Region Focus & Full-Screen _(HIGH PRIORITY)_

### Expanded Goal

Enhance the body map with precision-focused features that improve usability for all users, particularly those with motor control challenges or larger body types. This epic addresses two key UX challenges: precision in marker placement and viewport space limitations through dedicated region-focused views and full-screen mode.

### Value Proposition

Current body map limitations create barriers for accurate symptom tracking:
- **Precision challenges:** Small regions make precise marker placement difficult, especially for users with motor control issues
- **Limited viewport space:** Body map competes with navigation, header, and UI elements
- **Repetitive data entry:** Users re-enter the same severity/notes repeatedly
- **Visual clutter:** Hard to focus on specific regions without distraction

This epic transforms the body map into a precision tool through:
- **Region Detail View:** Isolated regions fill viewport for maximum precision
- **Smart Defaults:** Last-used severity/notes reduce repetitive input
- **Full-Screen Mode:** Removes all UI chrome for focused work
- **History Toggle:** Show/hide past markers for context or clean workspace

### Story Breakdown

**Story 3.7.1: Region Detail View Infrastructure (5 pts)**

As a user with a larger body type,
I want body regions to fill my screen when placing markers,
So I have enough surface area for comfortable, precise interaction.

**Acceptance Criteria:**
1. Clicking any body region switches to isolated region view
2. Region fills viewport (maximum space, isolated from full body)
3. Cannot navigate to adjacent regions without returning to full body first
4. Shows existing markers on that region (toggleable via History)
5. Can place multiple markers before returning to full body
6. "Back to Body Map" button returns to full body view
7. Region-relative coordinate system (0.0-1.0 scale) for responsive positioning
8. Coordinates transform correctly between full body and region views

**Technical Implementation:**
- RegionDetailView component
- View switching state management (full-body ↔ region-detail)
- Coordinate transformation: region-relative to viewport
- Back navigation with state preservation

**Prerequisites:** Epic 1 complete (body map foundation)

---

**Story 3.7.2: Marker Preview and Positioning (5 pts)**

As a user with shaky hands,
I want to preview and adjust marker position before confirming,
So I can place markers exactly where I intend despite motor control challenges.

**Acceptance Criteria:**
1. Tapping region surface shows translucent preview marker
2. Tapping elsewhere on region moves preview (no drag gestures required)
3. Can tap multiple times to adjust position before confirming
4. "Confirm Position" button explicitly locks marker position
5. Preview marker visually distinct from final markers (outlined/translucent)
6. After confirm, form appears for severity/notes entry
7. Can cancel to remove preview and try again
8. Touch targets meet accessibility standards (44x44px minimum)

**Technical Implementation:**
- MarkerPreview component with distinct styling
- Tap-only interaction (no drag required)
- ConfirmPositionButton floating action button
- Sequential flow: position → confirm → details form

**Prerequisites:** Story 3.7.1 (region view exists)

---

**Story 3.7.3: Smart Defaults System (3 pts)**

As a user tracking frequent symptoms,
I want severity pre-filled from my last entry,
So I can quickly place markers without repetitive input.

**Acceptance Criteria:**
1. Form remembers last-used severity per layer (pain, flares, etc.)
2. Last-used notes shown as placeholder (gray text, not auto-filled)
3. User can tap "Save" immediately to accept defaults (quick entry)
4. User can override defaults for specific markers
5. Placeholder disappears when user starts typing
6. Placeholder NOT saved unless user explicitly keeps it
7. Defaults persist across sessions (localStorage)
8. Layer-aware: Pain defaults don't affect flare defaults

**Technical Implementation:**
- LayerDefaults interface with per-layer storage
- localStorage persistence: 'pocket:layerDefaults'
- Form pre-population logic in MarkerDetailsForm
- Placeholder behavior vs actual value distinction

**Prerequisites:** Story 3.7.2 (marker form exists)

---

**Story 3.7.4: Full-Screen Mode (3 pts)**

As a user who gets distracted easily,
I want to remove all UI clutter and focus only on the body map,
So I can concentrate on accurately tracking my symptoms.

**Acceptance Criteria:**
1. Full-screen toggle button (⛶) available in normal view
2. Full-screen removes all surrounding UI (header, nav, sidebars)
3. Thin control bar remains at top with essential controls
4. Control bar includes: Back button (region view), Layer selector, History toggle (region view), Exit button
5. ESC key exits full-screen from any view
6. Full-screen state persists when switching to region view
7. Returning to body map maintains full-screen state
8. Browser native full-screen API with fallback

**Technical Implementation:**
- Browser Fullscreen API integration
- Persistent control bar component (40-50px height)
- State persistence through view transitions
- ESC key listener and fullscreenchange event handler
- High contrast control bar for accessibility

**Prerequisites:** Story 3.7.1 (region view), Story 3.7.2 (marker placement)

---

**Story 3.7.5: History Toggle (2 pts)**

As a user tracking patterns over time,
I want to see previous markers when adding new ones,
So I can identify recurring problem areas and avoid duplicates.

**Acceptance Criteria:**
1. History toggle available in region view control bar
2. Default state: History ON (shows existing markers)
3. When ON: Shows all existing markers from past sessions with dates
4. When OFF: Clean workspace showing only preview and newly placed markers
5. Historical markers visually distinct from new markers (opacity/styling)
6. Toggle state persists during session
7. Helps prevent duplicate marker placement
8. Tapping historical marker shows details (read-only or edit if Story 3.7.6)

**Technical Implementation:**
- Toggle component in control bar
- Filter existing markers by showHistory state
- Visual styling for historical vs new markers
- Session state persistence

**Prerequisites:** Story 3.7.1 (region view), Story 3.7.2 (markers exist)

---

**Story 3.7.6: Polish and Accessibility (3 pts)**

As a user with accessibility needs,
I want full keyboard navigation and touch-optimized interactions,
So I can use all features regardless of input method.

**Acceptance Criteria:**
1. ESC key exits full-screen from any view
2. Enter key confirms marker position
3. Tab key navigates through form fields
4. Arrow keys adjust severity slider
5. Touch targets minimum 44x44px (mobile)
6. Smooth transitions between views (< 300ms)
7. High contrast mode support
8. Screen reader announcements for state changes
9. Visual feedback for all interactions (hover, active, focus)
10. Tested across devices: mobile (iOS/Android), tablet, desktop

**Technical Implementation:**
- Keyboard event handlers for all interactions
- CSS transitions for view changes
- ARIA labels and roles
- Touch target size verification
- Cross-device testing suite

**Prerequisites:** Stories 3.7.1-3.7.5 (all features exist)

---

**Story 3.7.7: Multi-Location Flare Persistence (5 pts)**

As a user tracking flare-ups,
I want all marked body locations to be saved when I create a flare,
So that I can accurately record and review which areas were affected during a single flare episode.

**Acceptance Criteria:**
1. Create `flare_body_locations` IndexedDB table with schema: id, flareId, bodyRegionId, coordinates (x, y), createdAt
2. When saving a flare with multiple locations, create one FlareRecord + multiple body location records
3. flareRepository.createFlare() accepts array of body locations and persists all to database
4. Flare queries join body locations so retrieved flares include all marked areas
5. FlareCreationModal saves all accumulated locations (not just first)
6. Flare detail view displays all body locations with coordinates
7. Flare list/cards show location count badge (e.g., "3 locations") when multiple exist
8. Body map visualization shows all marked locations when viewing a flare
9. Existing flares with single location continue to work (backward compatibility)
10. All body location data includes region ID and normalized coordinates (0-1 scale)

**Technical Implementation:**
- New IndexedDB object store: `flare_body_locations` with compound index [flareId+bodyRegionId]
- Update flareRepository.createFlare() signature to accept `locations: FlareLocation[]`
- Transaction-based atomic writes (flare + all locations in single transaction)
- Update getFlareById/getActiveFlares to LEFT JOIN body locations
- FlareCreationModal passes complete locations array to save handler
- Update FlareRecord TypeScript interface to include `bodyLocations?: FlareBodyLocation[]`
- Database migration strategy for adding new table to existing installations

**Prerequisites:** Story 3.7.4 (fullscreen multi-marker UX complete)

**⚠️ DEPENDENCY NOTE:** This story should be completed BEFORE Story 3.7.5 (History Toggle) to avoid rework. Story 3.7.5 queries markers from IndexedDB, and this story changes the schema. Implementing 3.7.5 first would require rewriting its data access logic after 3.7.7's schema change.

**Current State:**
- UX fully implemented: users can place multiple markers in fullscreen mode
- "Done Marking" button accumulates all markers
- FlareCreationModal displays all marked locations
- Only first location currently persists to database (schema limitation)

---

**Total Epic Points:** 26 points (High complexity)

**Dependencies:**
- Epic 1 complete (body map foundation with regions and markers)
- No blocking dependencies on other in-progress work

**Enables:**
- Better accessibility for motor control challenges
- Improved precision for all users
- Foundation for future enhancements (zoom within region, multi-marker editing)

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

## Epic 5: Body Map Multi-Layer Enhancement

### Expanded Goal

Transform the body map from a single-purpose flare tracking tool into a multi-layer visualization system that allows users to track different types of body-area-related conditions (flares, pain, mobility restrictions, inflammation) on separate layers. Users can switch between layers for focused tracking and view multiple layers simultaneously for comprehensive health analysis.

### Value Proposition

- **Reduces visual clutter** by separating different condition types on distinct layers with unique visual markers
- **Enables focused analysis** through layer-specific filtering and visualization for tracking trends in individual conditions
- **Provides scalable architecture** for adding future tracking types without redesigning the core system
- **Improves data quality** by allowing users to clearly distinguish between flare-related pain, general chronic pain, mobility issues, and inflammation
- **Streamlines daily logging** through persistent layer selection that remembers the user's most-used tracking mode

### Story Breakdown

**Story 5.1: Add Layer Field to Data Model and IndexedDB Schema (3 pts)**

As a developer implementing multi-layer support,
I want to extend the body map data model to include layer information,
So that markers can be categorized by tracking type with efficient querying.

**Acceptance Criteria:**
1. BodyMapMarker interface extended with `layer` field of type `'flares' | 'pain' | 'mobility' | 'inflammation'`
2. IndexedDB schema migration adds `layer` field to existing body map marker records
3. All existing flare markers automatically assigned `layer: 'flares'` during migration (backward compatible)
4. Compound index created on `[userId+layer+timestamp]` for efficient layer-filtered queries
5. TypeScript `LayerType` type definition created and exported from data model
6. FlareRepository updated to support layer-filtered queries without breaking existing functionality
7. Migration script tested with existing data to ensure no data loss
8. Schema version incremented and migration handler registered in Dexie configuration
9. Database queries maintain offline-first pattern (NFR002)

**Prerequisites:** Epic 2 complete (body map data model exists)

---

**Story 5.2: Implement Layer Preferences and Persistence (2 pts)**

As a user who primarily tracks one condition type,
I want my last-used layer to persist between sessions,
So that I don't have to re-select my preferred layer every time I log data.

**Acceptance Criteria:**
1. New `bodyMapPreferences` IndexedDB table created with fields: userId, lastUsedLayer, visibleLayers, defaultViewMode
2. Preference repository implemented with get/set operations for layer preferences
3. Last-used layer persists immediately when user switches layers (NFR002)
4. Body map loads with last-used layer active on subsequent sessions
5. Default layer set to 'flares' for new users (backward compatible)
6. Preference updates happen without blocking UI interactions
7. Preferences respect user isolation (userId-scoped)
8. Import/export functionality includes preference data
9. DevDataControls updated to support layer preference testing

**Prerequisites:** Story 5.1 (layer field exists in data model)

---

**Story 5.3: Create Layer Selector Component for Tracking Mode (3 pts)**

As a user tracking different condition types,
I want to select which layer I'm logging to before marking body regions,
So that my data is categorized correctly without extra steps.

**Acceptance Criteria:**
1. LayerSelector component displays current active layer with dropdown/tab interface
2. Layer options shown: Flares (🔥), Pain (⚡), Mobility (🔒), Inflammation (🟣) with icons and labels
3. Layer selection updates immediately when clicked (optimistic UI)
4. Last-used layer badge displays "Last used: [layer name]" for user context
5. Layer selector positioned prominently in body map tracking interface (above body diagram)
6. Mobile-optimized with thumb-friendly touch targets (minimum 44x44px per NFR001)
7. Keyboard navigation supported: Tab to focus, Arrow keys to navigate options, Enter to select
8. Layer change persists via preference repository (Story 5.2)
9. Screen reader announces layer selection: "Pain layer selected" with appropriate ARIA labels

**Prerequisites:** Story 5.2 (layer preferences exist)

---

**Story 5.4: Implement Layer-Aware Marker Rendering (5 pts)**

As a user viewing marked body areas,
I want to see different visual markers for each layer type,
So that I can instantly distinguish between flares, pain, mobility issues, and inflammation.

**Acceptance Criteria:**
1. Marker component (generalized from FlareMarker) renders layer-specific icons: Flares (🔥 red/orange), Pain (⚡ yellow/amber), Mobility (🔒 blue), Inflammation (🟣 purple)
2. Marker size scales with severity (1-10 scale) maintaining touch-friendly minimum
3. Marker opacity indicates recency (newer markers more opaque: 100% for <7 days, 70% for 7-30 days, 50% for >30 days)
4. Multiple markers in same region position with smart offset to prevent complete overlap
5. Body map queries filter markers by active layer in tracking mode (single layer view)
6. Marker rendering performance optimized to handle 50+ markers without lag (NFR001)
7. All marker types maintain accessibility: distinct shapes/icons AND colors for colorblind users
8. Tapping marker opens layer-appropriate detail view (flare detail, pain log, etc.)
9. Markers update in real-time when new data logged or layer switched

**Prerequisites:** Story 5.3 (layer selector determines active layer)

---

**Story 5.5: Add Multi-Layer View Controls and Filtering (5 pts)**

As a user analyzing my overall health patterns,
I want to view multiple layers simultaneously with toggle controls,
So that I can see the complete picture of all my tracked conditions.

**Acceptance Criteria:**
1. LayerToggle component displays checkboxes for each layer with current marker counts: "☑ Flares (3) ☑ Pain (5) ☐ Mobility (0) ☑ Inflammation (2)"
2. View mode selector includes: "Single Layer" (shows active layer only) and "All Layers" (shows all enabled layers)
3. Individual layer visibility toggled on/off via checkboxes without affecting persistence
4. All enabled layers render simultaneously using distinct marker styles from Story 5.4
5. Layer visibility state persists via preferences (visibleLayers field)
6. Smart positioning algorithm prevents marker overlap when multiple layers visible (stagger positions)
7. Performance remains responsive with all layers visible (60fps interactions per NFR001)
8. Keyboard shortcuts added: Numbers 1-4 toggle individual layers, 'A' toggles all layers view
9. Empty state messaging when no layers have active markers: "No markers on enabled layers. Switch to tracking mode to add data."

**Prerequisites:** Story 5.4 (layer-aware markers render correctly)

---

**Story 5.6: Create Layer Legend and Accessibility Features (3 pts)**

As a user viewing multi-layer body maps,
I want a clear legend explaining what each marker represents,
So that I can quickly interpret the visualization without confusion.

**Acceptance Criteria:**
1. LayerLegend component displays all layer types with: icon, color, label, and brief description
2. Legend shows only currently visible layers in multi-layer view (auto-updates on toggle)
3. Legend positioned prominently but non-intrusively (collapsible on mobile to save space)
4. Each legend item clickable to toggle that layer's visibility
5. Color contrast verified for WCAG AA compliance in both light and dark modes
6. Screen reader support: Legend read as "Legend: Flares shown as red flame icons, Pain shown as yellow lightning icons..." with proper ARIA structure
7. Keyboard navigation: Tab through legend items, Enter toggles layer visibility
8. Help tooltip available explaining layer system: "Layers separate different tracking types. Switch layers to log different conditions, or view all layers to see comprehensive patterns."
9. Legend exports with body map screenshots for medical consultations (future Story 4.x integration point)

**Prerequisites:** Story 5.5 (multi-layer view and controls implemented)

---

## Epic 6: Health Insights & Correlation Analytics

### Expanded Goal

Transform the symptom tracker from a passive logging tool into an intelligent health insights platform by implementing correlation analysis that detects meaningful relationships between tracked data (foods, symptoms, medications, triggers, flares) and surfaces actionable insights. This epic delivers the correlation engine foundation, visual insights dashboard, enhanced timeline with pattern detection, and body map customization.

### Value Proposition

Users currently log extensive health data but lack tools to understand what drives their symptoms. This epic provides:
- **Automated correlation discovery** - Spearman rank correlation finds relationships between foods/triggers and symptom severity
- **Actionable insights** - Clear, prioritized insights help users identify patterns they'd never spot manually
- **Pattern-aware timeline** - Visual highlighting of recurring patterns and trigger-symptom windows
- **Personalized body map** - Gender/body-type variants for user comfort and accuracy
- **Treatment guidance** - Data-driven insights into which interventions correlate with improvement

### Story Breakdown

**Story 6.1: Navigation Restructure & shadcn/ui Integration** _(COMPLETE)_

As a user navigating the symptom tracker application,
I want clear, intuitive navigation with renamed routes that reflect their purpose and modern UI components,
so that I can easily find features like the body map, health insights, and timeline without confusion.

**Acceptance Criteria:**
1. Navigation config updated with new route structure: `/flares` → `/body-map`, `/analytics` → `/insights`, `/calendar` → `/timeline`
2. Route redirects implemented for renamed paths with 308 permanent redirects
3. Page components moved to new route paths
4. shadcn/ui initialized and integrated with Tailwind CSS and Radix UI
5. Navigation icons updated for new routes (MapPin, TrendingUp, Calendar, FileText)
6. Deprecated mood/sleep routes removed from navigation
7. Analyze pillar renamed to Insights in navigation config
8. Manage Data route renamed to My Data (`/my-data`)
9. Navigation component integration tests updated
10. shadcn/ui components documented in `docs/ui/shadcn-ui-components.md`

**Prerequisites:** Epic 0 complete (UI/UX foundation)

**Status:** Done (completed in earlier work)

---

**Story 6.2: Daily Log Page** _(IN REVIEW)_

As a user tracking my health symptoms,
I want a unified daily log page where I can reflect on my mood, sleep quality, and overall day in one place,
so that I can capture end-of-day reflections and understand daily patterns that complement my event-based tracking throughout the day.

**Acceptance Criteria:**
1. Create daily log page route and navigation at `/daily-log`
2. Implement DailyLog data model in IndexedDB with mood, sleep, notes, flare updates
3. Build EmoticonMoodSelector component (5 mood states with emoji)
4. Build SleepQualityInput component (hours + star rating)
5. Build FlareQuickUpdateList component showing active flares with inline update
6. Implement event summary section showing counts of today's logged items
7. Create daily notes text area with 2000 char limit and auto-save draft
8. Implement smart defaults and date navigation (← Prev | Today | Next →)
9. Add save functionality with offline-first persistence
10. Create tests and documentation for daily log flow

**Prerequisites:** Story 6.1 (navigation structure exists)

**Status:** In Review (implementation complete, under review)

---

**Story 6.3: Correlation Engine and Spearman Algorithm** _(IN REVIEW)_

As a user seeking to understand what triggers my symptoms,
I want an automated correlation analysis system that finds statistical relationships in my data,
So that I can discover which foods, medications, or triggers correlate with symptom changes without manually analyzing months of logs.

**Acceptance Criteria:**
1. ✅ Implement Spearman rank correlation coefficient algorithm in TypeScript with proper statistical formula (ρ = 1 - (6Σd²)/(n(n²-1)))
2. ✅ Create CorrelationEngine service class with methods: calculateCorrelation(series1, series2), findSignificantCorrelations(threshold), rankByStrength()
3. ✅ Implement data windowing logic: extract time-series data for foods, symptoms, medications, triggers over configurable time range (7, 30, 90 days)
4. ✅ Create correlation pairs: food-symptom, trigger-symptom, medication-symptom, food-flare, trigger-flare with lag windows (0-48 hours)
5. ✅ Filter correlations by significance: |ρ| >= 0.3 (moderate), sample size n >= 10, p-value < 0.05 (statistical significance)
6. ✅ Create CorrelationResult data model: { type, item1, item2, coefficient, strength, significance, sampleSize, lagHours, confidence }
7. ✅ Implement correlation repository with CRUD operations and efficient IndexedDB queries using compound indexes
8. ✅ Add background calculation service that recalculates correlations on data changes (debounced, not real-time)
9. ✅ Create unit tests for Spearman algorithm accuracy, edge cases (ties, perfect correlation, zero correlation, insufficient data)
10. ✅ Add performance optimization: calculation batching, caching results for 1 hour, Web Worker for heavy computation (optional enhancement)

**Prerequisites:** Story 6.2 (daily log data available for correlation), Epic 3.5 (intervention effectiveness patterns established)

**Status:** In Review (implementation complete, 37/37 tests passing, ready for code review)

---

**Story 6.4: Health Insights Hub UI**

As a user reviewing my health patterns,
I want a visual insights dashboard that presents correlation findings in clear, actionable cards,
So that I can quickly understand the most important relationships in my data and take action.

**Acceptance Criteria:**
1. Create `/insights` page route (renamed from `/analytics`) with responsive layout
2. Build InsightCard component displaying: insight type icon, headline ("High Dairy → Increased Symptoms"), correlation strength (strong/moderate/weak), confidence level, timeframe, sample size, action button
3. Implement insight prioritization algorithm: sort by |coefficient| × log(sampleSize), surface strong correlations first, group by insight type
4. Create correlation scatter plot visualization using Chart.js: X-axis = item consumption/exposure, Y-axis = symptom severity, trend line overlay, interactive tooltips
5. Build FlareAnalytics heat map component: body regions on Y-axis, time periods on X-axis, color intensity = flare frequency, clickable cells drill down to region detail
6. Add time range selector: Last 7 days, Last 30 days, Last 90 days, All time (affects all visualizations)
7. Implement empty state: "Log data for at least 10 days to see insights" with progress indicator
8. Add medical disclaimer banner: "Insights show correlations, not causation. Discuss findings with your healthcare provider."
9. Create insight detail modal: shows full correlation data, scatter plot, related events timeline, export as PDF option
10. Build responsive grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop, smooth loading skeletons

**Prerequisites:** Story 6.3 (correlation engine produces data)

---

**Story 6.5: Timeline Pattern Detection**

As a user reviewing my health history,
I want the timeline to visually highlight recurring patterns and symptom-trigger windows,
So that I can see at a glance when patterns occur and what precedes my symptoms.

**Acceptance Criteria:**
1. Extend timeline component to query correlation data and pattern detection results
2. Implement visual pattern highlighting: colored bands around correlated events (e.g., highlight food event + symptom spike 6-12 hours later)
3. Create pattern legend showing: food-symptom correlations (orange), trigger-symptom correlations (red), medication-improvement correlations (green), custom user patterns
4. Add pattern detection algorithm: sliding window analysis (24-hour windows), detect recurring sequences (food → symptom after N hours), identify day-of-week patterns
5. Build pattern badge/icon system: badge on timeline events that are part of detected patterns, tooltip explains pattern ("This food preceded symptoms in 7 of 10 instances")
6. Implement timeline layer toggle: show/hide different event types, show/hide pattern highlights, filter by pattern strength
7. Create pattern detail panel: clicking highlighted pattern opens side panel showing: pattern description, occurrence frequency, statistical confidence, related insights link
8. Add export functionality: export timeline view as image with pattern annotations, generate pattern summary report (PDF)
9. Optimize timeline rendering: virtualization for large datasets (>1000 events), lazy load pattern highlights, smooth scrolling
10. Create timeline tests: pattern detection accuracy, visual rendering, interaction flows, performance with large datasets

**Prerequisites:** Story 6.4 (insights UI patterns established), Epic 2 complete (flare timeline exists)

---

**Story 6.7: Treatment Effectiveness Tracker**

As a user trying different treatments and interventions,
I want a dedicated tracker showing which treatments correlate with symptom improvement over time,
So that I can have data-driven conversations with my doctor about what's working.

**Acceptance Criteria:**
1. Create TreatmentEffectiveness data model: treatmentId, treatmentType (medication/intervention), effectivenessScore (0-100), trendDirection (improving/stable/declining), sampleSize, timeRange, lastCalculated
2. Extend correlation engine to calculate treatment effectiveness: compare symptom severity before/after treatment events, calculate average change over multiple instances, factor in time decay (recent data weighted higher)
3. Build TreatmentTracker component showing: list of all tracked treatments, effectiveness score with visual indicator (color-coded 0-100), trend arrow (↑↓→), confidence level based on sample size
4. Implement effectiveness calculation algorithm: baseline severity = average of 7 days before treatment start, outcome severity = average of 7-30 days after treatment, effectiveness score = ((baseline - outcome) / baseline) × 100, minimum 3 treatment cycles for valid score
5. Create TreatmentDetail modal: shows treatment timeline, before/after severity chart, statistical confidence, correlation with other factors, export treatment report
6. Add comparison view: side-by-side comparison of multiple treatments, ranked by effectiveness, shows which combination works best, statistical significance indicators
7. Implement medical disclaimer: "Effectiveness scores show correlations in your data. Many factors affect outcomes. Always consult your healthcare provider before changing treatment plans."
8. Add alert system: notify when treatment effectiveness drops significantly (decline >20% over 30 days), suggest reviewing with doctor, link to related insights
9. Create treatment journal integration: link treatment effectiveness to daily log notes, show journal entries during treatment periods, export combined treatment journal
10. Build comprehensive tests: effectiveness calculation accuracy, edge cases (insufficient data, changing treatments), UI rendering, alert triggering, export functionality

**Prerequisites:** Story 6.3 (correlation engine), Story 6.4 (insights UI patterns), Story 6.2 (daily log integration)

---

**Story 6.8: DevData Controls Enhancement for Analytics Support**

As a developer testing analytics features,
I want DevDataControls to generate rich synthetic data including daily logs, correlations, and intentional patterns,
So that I can comprehensively test and demonstrate all Epic 6 analytics capabilities with realistic test scenarios.

**Acceptance Criteria:**
1. Create `generateDailyLogs.ts` generator with 60-80% day coverage, mood/sleep correlated with flares, configurable date ranges
2. Update orchestrator.ts to call daily log generator after existing data generation (Step 13)
3. Integrate correlation engine into orchestrator: run `correlationCalculationService.recalculateCorrelations(userId)` after all data generated (Step 14)
4. Add analytics-showcase scenario to scenarios.ts: high correlation strength (0.85), 20-25 flares, strong clustering, 80% daily log coverage, intentional patterns enabled
5. Add pattern-detection scenario: focused 6-month timeframe, recurring sequences, consistent delay windows for timeline visualization
6. Create `generatePatternData.ts` with intentional pattern functions: generateMondayStressPattern (day-of-week), generateDairyHeadachePattern (food delay 6-12hr), generateMedicationImprovementPattern
7. Update orchestrator result reporting: include dailyLogsCreated, correlationsGenerated counts in generation summary
8. DevDataControls UI displays generation statistics: correlation count, significant correlations (|ρ| >= 0.3), daily log coverage percentage
9. Add scenario grouping in UI: Basic scenarios, Analytics scenarios, Performance scenarios with descriptions
10. All generators follow offline-first pattern, handle edge cases (empty data, insufficient samples), include console logging for debugging

**Technical Implementation Notes:**
- Daily logs use date string format (YYYY-MM-DD) matching dailyLogs table schema
- Correlation calculation happens AFTER all base data exists to ensure sufficient sample sizes
- Pattern generators create 10+ instances of each pattern for statistical significance
- Analytics-showcase scenario configured for demonstrating insights page and timeline pattern detection
- Generation statistics help validate that correlation engine and pattern detection have sufficient data

**Prerequisites:** Story 6.2 (daily logs schema), Story 6.3 (correlation engine), Story 6.5 (pattern detection), Epic 5 (multi-layer body map)

---

**Story 6.6: Body Map Gender & Body Type Customization**

As a user who wants a body map that represents my body type,
I want to select gender and body type options for the body map visualization,
So that I feel comfortable using the tool and can mark locations more accurately on a body that looks like mine.

**Acceptance Criteria:**
1. Create body map settings UI in Settings > Preferences with gender selector (Female, Male, Neutral/Other) and body type selector (Slim, Average, Plus-size, Athletic)
2. Design and implement 3 enhanced body map SVG variants: female anatomical variant (with appropriate chest/hip proportions), male anatomical variant (with broader shoulders/different proportions), neutral/gender-neutral variant (current enhanced)
3. Store body map preferences in IndexedDB bodyMapPreferences table: userId, selectedGender, selectedBodyType, createdAt, updatedAt
4. Implement SVG loading system: dynamically load selected variant SVG, maintain consistent region IDs across all variants, preserve existing marker coordinates (coordinate system stays normalized 0-1)
5. Ensure all body regions present in all variants: groin regions in all maps, consistent labeling, same interaction patterns
6. Create smooth transition: fade out old SVG, fade in new SVG (300ms transition), preserve zoom/pan state during variant switch, maintain visible markers
7. Add body type customization (optional enhancement): scale proportions within variants, adjust marker positioning for body types, preserve medical accuracy
8. Implement preview modal: before saving preference, show preview of selected variant, display sample markers, confirm button applies change
9. Add accessibility features: screen reader announces body map variant change, high contrast mode support for all variants, keyboard navigation works identically
10. Create comprehensive tests: variant loading, preference persistence, coordinate preservation, transition smoothness, accessibility compliance

**Prerequisites:** Epic 1 complete (body map foundation with regions and coordinates)

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

---

## Epic 7: Cloud Sync (Manual Backup/Restore)

### Expanded Goal

Enable users to manually sync their IndexedDB data to cloud storage using encrypted backups, allowing seamless multi-device usage without real-time synchronization complexity. This MVP implementation uses Vercel Blob Storage with client-side encryption, providing a simple "backup and restore" model that can evolve into more sophisticated sync capabilities in the future.

### Value Proposition

- **Multi-device support** - Users can sync data between devices (phone, tablet, desktop) without cumbersome export/import workflows
- **Zero-knowledge encryption** - All data encrypted client-side using user passphrase; server never sees unencrypted data
- **Future-ready foundation** - Manual sync sets groundwork for future real-time sync, AI analytics, and advanced features
- **Privacy-first design** - Opt-in feature with clear disclaimers; users control their data and encryption keys
- **Simple implementation** - Leverages existing export logic and Vercel infrastructure for rapid delivery

### Story Breakdown

**Story 7.1: Cloud Sync Infrastructure Setup**

As a developer implementing cloud sync,
I want Vercel Blob Storage configured with edge functions for upload/download,
So that we have secure cloud storage infrastructure ready for encrypted backups.

**Acceptance Criteria:**
1. Vercel Blob Storage set up in project with appropriate storage limits configured
2. Create `/api/sync/upload` edge function that accepts encrypted blob, generates unique storage key from passphrase hash, stores blob in Vercel Blob, returns metadata (upload timestamp, blob size, storage key)
3. Create `/api/sync/download` edge function that accepts storage key (passphrase hash), retrieves encrypted blob from Vercel Blob, returns blob to client
4. Implement error handling for edge functions: blob not found, storage quota exceeded, invalid request format, network failures
5. Add rate limiting to prevent abuse: max 10 uploads per hour per passphrase hash, max 5 downloads per minute per passphrase hash
6. Edge functions log operations for debugging (timestamp, operation, storage key hash, success/failure)
7. Set blob retention policy and storage limits appropriate for health data
8. Test edge functions with mock encrypted data payloads
9. Documentation for API endpoints in `docs/api/cloud-sync.md`
10. Environment variables configured for Vercel Blob credentials

**Prerequisites:** None (foundational infrastructure story)

---

**Story 7.2: Encryption & Upload Implementation**

As a user wanting to back up my health data,
I want to encrypt my data with a passphrase and upload it to the cloud,
So that my data is securely backed up and accessible from other devices.

**Acceptance Criteria:**
1. Implement passphrase → encryption key derivation using PBKDF2: 100,000 iterations, SHA-256 hash, random 16-byte salt, produces 256-bit AES-GCM key
2. Implement passphrase → storage key derivation using SHA-256: hash passphrase to create unique blob identifier
3. Leverage existing IndexedDB export logic to serialize all data to JSON
4. Encrypt exported JSON using AES-GCM with derived key: prepend salt to encrypted blob for later decryption, include authentication tag
5. Upload encrypted blob to `/api/sync/upload` edge function with storage key
6. Store sync metadata locally in IndexedDB: lastSyncTimestamp, lastSyncSuccess, blobSizeBytes, storageKey hash
7. Implement upload progress indicator showing encryption and upload stages
8. Handle upload errors gracefully: network failures, quota exceeded, authentication errors
9. Add client-side validation: passphrase minimum 12 characters, passphrase confirmation required
10. Unit tests for encryption logic, PBKDF2 derivation, upload flow

**Prerequisites:** Story 7.1 (cloud infrastructure exists)

---

**Story 7.3: Download & Restore Implementation**

As a user restoring my data on a new device,
I want to download my encrypted backup and decrypt it using my passphrase,
So that I can restore my health data and continue tracking seamlessly.

**Acceptance Criteria:**
1. Download encrypted blob from `/api/sync/download` using storage key derived from passphrase
2. Extract salt from beginning of encrypted blob
3. Derive decryption key from passphrase using PBKDF2 with extracted salt
4. Decrypt blob using AES-GCM with derived key and validate authentication tag
5. Parse decrypted JSON and validate data structure before restoring
6. Create backup of current IndexedDB data before restore (export to temporary local file)
7. Restore data to IndexedDB with transaction-based atomic writes
8. Update sync metadata after successful restore
9. Implement restore progress indicator showing download, decryption, and restore stages
10. Handle restore errors gracefully: wrong passphrase (decryption failure), corrupted data, network failures, validation errors
11. Provide rollback mechanism if restore fails (restore from backup)
12. Unit tests for decryption logic, data validation, restore flow

**Prerequisites:** Story 7.2 (encryption and upload working)

---

**Story 7.4: UI & User Experience Polish**

As a user setting up cloud sync,
I want clear UI with guidance on creating secure passphrases and managing backups,
So that I feel confident using cloud sync without confusion or data loss.

**Acceptance Criteria:**
1. Add "Cloud Sync" section to Settings with clear description and opt-in toggle
2. Create "Upload to Cloud" button with passphrase input modal: passphrase field with show/hide toggle, passphrase confirmation field, strength indicator (weak/medium/strong), warning message: "⚠️ Write this down! If you forget your passphrase, your cloud backup cannot be recovered.", QR code option for secure offline passphrase storage (optional)
3. Create "Download from Cloud" button with passphrase input modal: passphrase field with show/hide toggle, warning message: "⚠️ This will replace all local data. Current data will be backed up first.", confirmation checkbox: "I understand this will overwrite my local data"
4. Implement progress indicators for both upload and download: encryption/decryption progress, network transfer progress, data restore progress (download only)
5. Add success/error toast messages: "✓ Backup uploaded successfully! Synced [X] MB at [timestamp]", "✓ Data restored successfully! [X] records restored", "✗ Upload failed: [error message]", "✗ Restore failed: [error message]"
6. Display sync status information: last successful sync timestamp, data size, sync health indicator (green/yellow/red)
7. Add "Cloud Sync" help documentation: explains encryption, passphrase security best practices, multi-device workflow, troubleshooting common issues
8. Implement passphrase strength validation with visual feedback: minimum 12 characters required, warns if weak (no numbers/symbols), recommends strong passphrase (16+ chars, mixed case, numbers, symbols)
9. Add confirmation dialogs for destructive actions: restore confirms data overwrite, passphrase change confirms re-encryption needed
10. Mobile-responsive design for all sync UI components
11. WCAG AA accessibility compliance: keyboard navigation, screen reader support, sufficient color contrast
12. User acceptance testing with multiple devices and scenarios

**Prerequisites:** Story 7.3 (download and restore complete)

---

### Technical Architecture Notes

**Encryption Flow:**
```
User Passphrase
  ├─→ PBKDF2(100k iterations, salt, SHA-256) → AES-256-GCM Key (encryption)
  └─→ SHA-256 → Storage Key (blob identifier)

Data Flow:
  IndexedDB → JSON Export → AES-GCM Encrypt → Vercel Blob Storage
  Vercel Blob Storage → AES-GCM Decrypt → JSON Parse → IndexedDB Restore
```

**Security Considerations:**
- Client-side encryption only (zero-knowledge)
- Passphrase never sent to server
- Storage key is hash of passphrase (server cannot reverse-engineer passphrase)
- Salt randomized per backup for key derivation security
- Authentication tag validates data integrity

**Future Evolution Path:**
- **Phase 2:** Incremental sync (track changed records, sync deltas)
- **Phase 3:** Conflict resolution (multi-device simultaneous edits)
- **Phase 4:** Real-time sync (WebSocket-based live updates)
- **Phase 5:** AI analytics (move to Supabase Postgres for server-side processing)

**Data Migration Strategy:**
When migrating to structured storage (Supabase) later:
1. Maintain encrypted blob backup as fallback
2. Add versioning metadata to backup format
3. Implement backward-compatible restore (supports both blob and structured formats)
4. Gradual migration: read from blob, write to both, eventually deprecate blob

---
