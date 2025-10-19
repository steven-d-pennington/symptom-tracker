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
