# symptom-tracker Product Requirements Document (PRD)

**Author:** Steven
**Date:** 2025-10-18
**Project Level:** 2
**Target Scale:** Medium - Multiple Epics

---

## Goals and Background Context

### Goals

- **Improve body map location precision** by adding groin-specific areas and implementing zoom functionality for all body regions, enabling users to pinpoint exact flare locations
- **Enable accurate flare progression tracking** through persistent flare entities with severity monitoring and trend analysis (improving vs worsening)
- **Identify problem areas** by analyzing flare recurrence patterns across body regions to help users understand which areas are most frequently affected
- **Support medical documentation** by providing detailed flare history and progression data that users can share with healthcare providers

### Background Context

The symptom tracker currently provides basic symptom logging and timeline visualization. However, users with Hidradenitis Suppurativa and similar chronic conditions report two critical gaps:

**Location Tracking Gap:** Users report flares in the groin area, but the current body map doesn't include groin-specific regions. Additionally, the existing body map regions are too broad to accurately pinpoint where individual flares occur, leading to vague location data that limits analytical value.

**Flare Lifecycle Gap:** The current system treats each symptom log as an isolated event. Users cannot track individual flares over their complete lifecycle - from onset through progression (worsening or improving) to resolution. This makes it impossible to monitor treatment effectiveness or understand flare patterns over time.

These enhancements will transform the body map from a general location indicator into a precision tracking tool, while adding an event stream-based flare tracking system that follows individual flares through their complete lifecycle. The resulting data will enable pattern recognition to identify which body areas are most problematic, supporting both self-management and medical consultation.

---

## Requirements

### Functional Requirements

**Body Map Enhancements**

- **FR001:** System shall include groin-specific regions (left groin, right groin, center groin) on all body map views (front, back, side)
- **FR002:** System shall provide zoom functionality for all body map regions, allowing users to view enlarged region details for precise flare location marking
- **FR003:** System shall support coordinate-based or grid-based location marking within zoomed regions, capturing precise X/Y coordinates relative to the body region
- **FR004:** System shall display existing flare markers on the body map with visual indicators for flare status (active, improving, worsening, resolved)

**Flare Lifecycle Tracking**

- **FR005:** System shall enable users to create a new flare entity with: body location (region + precise coordinates), initial severity (1-10), optional notes, and timestamp
- **FR006:** System shall assign each flare a unique persistent ID that remains constant throughout the flare's lifecycle
- **FR007:** System shall allow users to update an existing active flare with: new severity rating, trend status (improving/worsening/stable), treatment interventions, and timestamp
- **FR008:** System shall track complete flare history including all severity changes, trend updates, and interventions in chronological order
- **FR009:** System shall allow users to mark flares as resolved with resolution date and optional resolution notes

**Flare Analysis & Reporting**

- **FR010:** System shall identify and display "problem areas" - body regions with highest flare frequency and recurrence rates
- **FR011:** System shall provide per-region flare history showing all flares that have occurred in each body area
- **FR012:** System shall calculate and display flare progression metrics: average duration, severity trends, and resolution patterns

**Photo Integration** _(Lower Priority)_

- **FR013:** System shall support photo attachment to flares with timestamps for progression documentation
- **FR014:** System shall provide photo timeline view for flare-specific before/during/after comparison

### Non-Functional Requirements

- **NFR001:** Body map zoom and pan interactions shall respond within 100ms to maintain smooth user experience on mobile and desktop devices
- **NFR002:** All flare data (creation, updates, resolution) shall persist to local IndexedDB immediately with offline-first architecture, ensuring zero data loss even without network connectivity
- **NFR003:** System shall maintain data integrity for flare lifecycle tracking, ensuring severity history and timestamps are immutably recorded and cannot be accidentally modified or deleted

---

## User Journeys

### Journey 1: Tracking a New Flare from Onset to Resolution

**Actor:** User with active HS flare

**Scenario:** User notices a new painful lesion in their left groin area and wants to track its progression over time.

1. **Day 1 - Flare Onset**
   - User opens body map interface
   - Selects "left groin" region on front body view
   - Clicks zoom to see enlarged groin area
   - Taps precise location on zoomed view where flare is located
   - System captures exact coordinates
   - User sets initial severity: 7/10
   - User adds note: "Painful, red, about 2cm"
   - System creates flare entity with unique ID and marks status as "Active"

2. **Day 3 - Worsening**
   - User opens "Active Flares" list
   - Selects the left groin flare from Day 1
   - Updates severity: 9/10
   - Marks trend: "Worsening"
   - Adds intervention note: "Applied ice pack, took ibuprofen"
   - System records update in flare history timeline

3. **Day 7 - Improving**
   - User updates same flare
   - New severity: 5/10
   - Marks trend: "Improving"
   - Adds note: "Less pain, draining"
   - System updates flare history

4. **Day 12 - Resolution**
   - User marks flare as "Resolved"
   - System records resolution date
   - Flare moves to "Resolved" list but remains accessible for review
   - Body map updates: flare marker changes to "resolved" status

5. **Analysis View**
   - User views "Problem Areas" dashboard
   - System shows left groin has 3 flares in past 90 days
   - User sees average flare duration: 11 days
   - User shares flare progression chart with doctor at next appointment

**Success Criteria:**
- User can track complete flare lifecycle in one persistent entity
- Severity trend is clear and actionable
- Body map provides precise location data
- Historical data supports medical consultation

---

## UX Design Principles

**Precision Without Complexity**
- Body map zoom should feel natural and immediate (pinch-to-zoom on mobile, scroll-wheel on desktop)
- Grid or coordinate system should be visually subtle - users shouldn't feel like they're using a technical tool
- Flare location marking should be as simple as "tap where it hurts"

**Progressive Disclosure**
- Default body map view shows overview with all active flares
- Zoom reveals detail only when needed
- Flare history/details expand on demand rather than cluttering the main view

**Tactile Feedback & Responsiveness**
- All body map interactions provide immediate visual feedback
- Flare status changes (severity updates, trend marking) feel instantaneous
- Touch targets are mobile-optimized (minimum 44x44px)

**Medical-Grade Accuracy**
- Precise location data captured but presented in human-readable format
- Severity trends use clear visual language (color coding, trend arrows)
- Data integrity safeguards prevent accidental deletion or modification

---

## User Interface Design Goals

**Body Map Interface**
- Clean, anatomically accurate SVG-based body representations
- Groin regions clearly delineated but tastefully rendered
- Zoom interactions feel smooth and natural (no lag or jumpiness)
- Active flares shown with status-coded markers (color/icon indicates active/improving/worsening/resolved)
- Support for both light and dark themes

**Flare Management Interface**
- "Active Flares" list provides at-a-glance status dashboard
- Each flare shows: location, current severity, trend arrow, days active
- Quick-update interface for severity/trend changes (minimize taps/clicks)
- Historical timeline shows severity progression as simple line chart
- Problem Areas view uses heat map or ranked list to show trouble zones

**Mobile-First, Desktop-Enhanced**
- Primary design for mobile touch interactions
- Desktop version adds keyboard shortcuts and mouse precision
- Responsive layouts adapt to screen size without losing functionality
- Offline-capable PWA architecture maintains full feature set without connectivity

---

## Epic List

### Epic 1: Enhanced Body Map with Precision Location Tracking
**Goal:** Enable users to accurately pinpoint flare locations by adding groin-specific regions and implementing zoom functionality for precise coordinate capture.

**Scope:**
- Add groin regions (left, right, center) to all body map views
- Implement zoom/pan controls for all body regions
- Create coordinate-based location marking system
- Display flare markers with status indicators on body map

**Estimated Stories:** 6-7 stories

---

### Epic 2: Flare Lifecycle Management
**Goal:** Allow users to track individual flares from onset through resolution, capturing severity progression and treatment interventions in a persistent event stream.

**Scope:**
- Design and implement flare data model (IndexedDB schema)
- Create flare creation interface (from body map)
- Build flare update interface (severity, trend, interventions)
- Implement flare history tracking
- Add flare resolution workflow
- Create active flares dashboard

**Estimated Stories:** 7-8 stories

---

### Epic 3: Flare Analytics and Problem Areas
**Goal:** Provide insights into flare patterns by analyzing recurrence rates, progression trends, and identifying high-frequency body regions.

**Scope:**
- Calculate and display "problem areas" (regions with most flares)
- Build per-region flare history views
- Compute progression metrics (duration, severity trends)
- Create analytics dashboard/visualization

**Estimated Stories:** 4-5 stories

---

### Epic 4: Photo Documentation Integration _(Lower Priority)_
**Goal:** Enable visual flare documentation through photo attachments with timeline views for progression tracking.

**Scope:**
- Photo attachment to flare entities
- Photo timeline view per flare
- Before/after comparison interface
- Integration with existing photo encryption system

**Estimated Stories:** 3-4 stories

---

**Total Estimated Stories:** 20-24 stories
**Total Epics:** 4 (3 high-priority + 1 lower priority)

> **Note:** Detailed epic breakdown with full story specifications is available in [epics.md](./epics.md)

---

## Out of Scope

The following capabilities are explicitly excluded from this phase:

**Emergency Management Features**
- Emergency contact notifications during severe flares
- Healthcare provider alerts and telemedicine integration  
- Emergency protocol activation workflows
- Crisis management features from build-docs/08-active-flare-dashboard.md

**Advanced Predictive Analytics**
- Flare prediction engine based on historical patterns
- Cyclical flare detection algorithms
- Trigger-based flare prediction
- Machine learning pattern recognition

**Multi-Device Synchronization**
- Cloud backup and sync across devices
- Real-time data synchronization
- Peer-to-peer sync mechanisms

**Export and Sharing Enhancements**
- Medical-grade PDF report generation for flares
- Healthcare provider dashboard integration
- Structured data export for research participation

**Advanced Photo Features**
- AI-powered photo analysis or measurement
- Photo comparison algorithms
- Annotation tools beyond basic attachments

**Body Map Extensions Beyond Core Requirements**
- 3D body models or advanced visualization
- Additional body regions beyond groin (can be added incrementally later)
- Custom body region creation by users

**Gamification or Engagement Features**
- Achievement systems for tracking adherence
- Social/community features
- Progress rewards or streaks

---

**Rationale:** This phase focuses on core precision tracking (body map + flare lifecycle). Advanced analytics, emergency management, and sync features will be considered for future phases after validating the fundamental tracking workflow with users.
