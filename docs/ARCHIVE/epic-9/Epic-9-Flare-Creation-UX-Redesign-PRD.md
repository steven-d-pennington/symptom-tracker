# Epic 9: Flare Creation UX Redesign - Product Requirements Document

**Author:** Steven
**Date:** 2025-11-14
**Version:** 1.0
**Epic Type:** UX/UI Enhancement
**Project:** symptom-tracker (HS Symptom Tracking Web App)

---

## Executive Summary

Epic 9 redesigns the flare creation user experience by eliminating modal-based workflows in favor of full-page flows that match the established pattern used for symptoms, triggers, foods, and medications. This redesign addresses UI inconsistency, improves mobile usability, and establishes a scalable pattern for future tracking features.

### What Makes This Special

**Clean, flexible UI that scales as the app grows.** This isn't just about fixing flare creation - it's about establishing the UX pattern that will carry the app forward as we add more trackable entities. Every new feature will benefit from this foundation.

---

## Project Classification

**Technical Type:** Web Application (PWA)
**Domain:** Healthcare (Hidradenitis Suppurativa symptom tracking)
**Complexity:** Medium (regulated healthcare domain, offline-first architecture)

**Context:** symptom-tracker is a Progressive Web App for Hidradenitis Suppurativa patients to track flares, symptoms, triggers, foods, and medications. Current implementation uses inconsistent UI patterns - some features use modals (flares), others use full-page flows (symptoms/triggers/foods). This creates confusion and limits mobile usability.

---

## Success Criteria

### User Experience Success
- **Consistency:** Flare creation flow matches symptom/trigger/food logging pattern (zero learning curve for existing users)
- **Mobile-first:** Full-page flow eliminates cramped modal UI on small screens
- **Onboarding:** Multi-flare logging in single session supports new users tracking existing active flares
- **Power users:** "Add another" workflow reduces friction for users with multiple active sites

### Technical Success
- **Pattern establishment:** Reusable full-page flow architecture that future features can adopt
- **Component reuse:** Existing body map, lifecycle selector, and form components integrate seamlessly
- **Maintainability:** Eliminating CreateFlareModal reduces code complexity and modal state management

### Business Success
- **Adoption:** Existing users transition to new flow without support requests
- **Engagement:** Users log flares more frequently due to improved UX
- **Scalability:** Architecture supports adding new trackable entities (pain points, treatments, etc.) without UX redesign

---

## Product Scope

### MVP - Minimum Viable Product

**Core Flow Redesign:**
- Replace modal-based flare creation with full-page flow
- Two entry points: Dashboard "Flare" button and Body-map "+" button
- Body map placement page with layer selector (top of page)
- Details page with severity, lifecycle stage, notes, layer display
- Success screen with "Add another flare" and contextual return button

**Multi-Marker Support (Preserve Existing):**
- Region-specific multi-marker placement (e.g., 3 markers in left armpit)
- All markers saved to single flare event with bodyMapLocations
- Maintains existing coordinate capture and region zoom behavior

**Component Cleanup:**
- Remove CreateFlareModal component
- Refactor FlareUpdateModal to focus only on updates (not creation)
- Update navigation wiring for dashboard and body-map entry points

### Growth Features (Post-MVP)

**Enhanced Multi-Flare Logging:**
- Batch mode: Place markers across multiple regions before proceeding to details
- Details page shows expandable cards for each region's flare
- Single save creates all flares at once

**State Persistence:**
- Draft state preservation if user navigates away mid-flow
- Resume incomplete flare creation from where they left off
- Local storage or IndexedDB-backed draft system

**Smart Suggestions:**
- "Add another" button suggests previously affected body regions
- Pre-fill severity/lifecycle stage based on recent flares in same region
- "Copy from last flare" quick-fill option

### Vision (Future)

**Template-Based Creation:**
- Save flare profiles (e.g., "Right groin flare - typical pattern")
- One-tap creation from saved templates
- Edit template defaults over time as patterns change

**Voice Input:**
- Voice-to-text for notes during flare creation
- Hands-free logging for users with mobility limitations

**Photo Integration:**
- Add photo during creation flow (currently only available post-creation)
- Before/during/after photo workflow integrated into details page

---

## Functional Requirements

### FR9.1: Body Map Placement Page

**FR9.1.1: Route and Entry Points**
- System shall provide route `/flares/place` for body map placement
- Dashboard "Flare" quick log button shall navigate to `/flares/place` with context: `source=dashboard`
- Body-map view "+" button shall navigate to `/flares/details` with pre-filled marker data and context: `source=body-map`

**FR9.1.2: Layer Selection**
- System shall display layer selector at top of placement page (Flares | Pain | Custom tabs)
- Layer selector shall default to "Flares" layer when entered from dashboard
- Layer selector shall be hidden when entered from body-map view (layer auto-inherited from current view)
- Selected layer shall be passed to details page for display and persistence

**FR9.1.3: Multi-Marker Placement (Preserve Existing Behavior)**
- System shall allow user to click body region → region fills viewport
- System shall support placing multiple markers within single region
- System shall capture precise X/Y coordinates for each marker relative to region
- "Next" button shall be enabled only when at least 1 marker placed
- Clicking "Next" shall navigate to `/flares/details` with layer, region ID, and marker coordinates array

### FR9.2: Flare Details Page

**FR9.2.1: Route and Data Display**
- System shall provide route `/flares/details` accepting params: layer, bodyRegionId, markerCoordinates[], source
- System shall display body region name prominently (e.g., "Left Armpit")
- System shall show marker count if multiple: "3 markers placed in Left Armpit"
- System shall display selected layer as read-only badge

**FR9.2.2: Flare Attributes**
- System shall provide severity slider (1-10) with visual feedback
- System shall include LifecycleStageSelector component with auto-suggestion for "onset" stage for new flares
- System shall provide notes textarea with 500-character limit
- System shall validate that severity is selected before allowing save

**FR9.2.3: Save and Navigation**
- "Save" button shall create flare entity with all marker locations saved to bodyMapLocations table
- On save success, system shall navigate to success screen with flare summary
- On save failure, system shall display user-friendly error message and preserve form state

### FR9.3: Success Screen

**FR9.3.1: Confirmation Display**
- System shall display success message: "✅ Flare saved with {n} locations!"
- System shall show flare summary: Region, Severity (X/10), Lifecycle Stage

**FR9.3.2: Next Actions**
- System shall provide "🔄 Add another flare" button navigating to `/flares/place` with clean state
- System shall provide contextual return button:
  - "🏠 Back to dashboard" if source=dashboard
  - "🗺️ Back to body-map" if source=body-map
- Return buttons shall navigate to appropriate destination based on entry context

### FR9.4: Component Cleanup and Refactoring

**FR9.4.1: Remove CreateFlareModal**
- System shall remove `CreateFlareModal` component from codebase
- All references to CreateFlareModal shall be removed or replaced

**FR9.4.2: Refactor FlareUpdateModal**
- FlareUpdateModal shall only handle updates to existing flares (not creation)
- Any creation logic in FlareUpdateModal shall be removed

**FR9.4.3: Navigation Wiring**
- Dashboard "Flare" button shall route to `/flares/place` (not open modal)
- Body-map "+" button shall route to `/flares/details` with marker data (not open modal)

### FR9.5: Analytics and Tracking

**FR9.5.1: Event Tracking**
- System shall fire `flare_creation_started` event with source (dashboard | body-map)
- System shall fire `flare_creation_placement_completed` event with markerCount
- System shall fire `flare_creation_details_completed` event with severity, lifecycleStage
- System shall fire `flare_creation_saved` event on successful save
- System shall fire `flare_creation_abandoned` event when user navigates away mid-flow

---

## Non-Functional Requirements

### Performance
- **NFR9.1:** Page transitions (placement → details → success) shall complete within 200ms on mobile devices
- **NFR9.2:** Body map rendering on placement page shall reuse existing optimized SVG rendering (no performance degradation)

### Usability
- **NFR9.3:** All interactive elements shall meet WCAG 2.1 Level AA touch target size (44x44px minimum)
- **NFR9.4:** Flow shall work seamlessly on mobile (iOS/Android), tablet, and desktop browsers
- **NFR9.5:** Keyboard navigation shall support full flow without mouse/touch

### Accessibility
- **NFR9.6:** All form inputs shall have proper ARIA labels
- **NFR9.7:** Page transitions shall announce route changes to screen readers
- **NFR9.8:** Success/error messages shall use appropriate ARIA live regions

### Data Integrity
- **NFR9.9:** Browser back button shall not cause data loss (URL state management)
- **NFR9.10:** All flare data shall persist to IndexedDB immediately on save (offline-first)
- **NFR9.11:** Failed saves shall preserve form state for retry

### Maintainability
- **NFR9.12:** New full-page flow architecture shall be documented as pattern for future features
- **NFR9.13:** Component reuse strategy shall be documented (LifecycleStageSelector, body map, etc.)

---

## User Experience Principles

### Consistency Over Innovation
- Flow matches symptom/trigger/food logging pattern exactly
- Users who know how to log a symptom know how to log a flare
- Zero new interaction patterns to learn

### Progressive Disclosure
- Step 1: Where is it? (body map placement)
- Step 2: What's it like? (details)
- Step 3: What's next? (success screen with options)

### Tactile Feedback & Responsiveness
- Page transitions feel immediate (no loading spinners)
- Form interactions provide instant visual feedback
- Mobile-optimized touch targets prevent mis-taps

### Power User Optimization
- "Add another" workflow minimizes friction for multiple flares
- Smart defaults reduce repetitive data entry
- Keyboard shortcuts support rapid entry on desktop

---

## Key User Journeys

### Journey 1: Dashboard Quick Log - Single Flare

**Actor:** User with new flare

**Scenario:** User on dashboard wants to quickly log a flare in left groin

1. User taps "Flare" button on dashboard
2. → `/flares/place` (layer="Flares" selected by default)
3. User taps "Left Groin" region on body map
4. Region zooms to fill viewport
5. User taps precise location of flare
6. User taps "Next" button
7. → `/flares/details` (shows "Left Groin", layer badge: "Flares")
8. User sets severity: 7/10
9. User selects lifecycle stage: "Onset" (auto-suggested)
10. User adds note: "Painful, red, about 2cm"
11. User taps "Save"
12. → Success screen: "✅ Flare saved with 1 location!"
13. User taps "🏠 Back to dashboard"
14. → Dashboard with flare now visible

**Success Criteria:**
- 6 taps to complete (vs 8+ taps in old modal flow)
- Full-page UI eliminates cramped modal experience
- Clear progress through linear flow

### Journey 2: Onboarding - Multiple Active Flares

**Actor:** New user with 3 existing active flares

**Scenario:** User setting up app wants to track all current flares in one session

1. User taps "Flare" button on dashboard
2. → `/flares/place`, places marker in left armpit
3. → `/flares/details`, fills in details (severity 8, onset, notes)
4. → Success screen
5. User taps "🔄 Add another flare"
6. → `/flares/place` (clean state), places marker in right armpit
7. → `/flares/details`, fills in details (severity 7, growth, notes)
8. → Success screen
9. User taps "🔄 Add another flare"
10. → `/flares/place`, places marker in left groin
11. → `/flares/details`, fills in details (severity 6, onset, notes)
12. → Success screen
13. User taps "🏠 Back to dashboard"
14. → Dashboard showing all 3 active flares

**Success Criteria:**
- "Add another" workflow eliminates navigation friction
- User logs all existing flares without confusion
- Dashboard reflects complete current state

### Journey 3: Body Map View - Precision Tracking

**Actor:** User exploring body map

**Scenario:** User browsing body map notices new flare, wants to mark it immediately

1. User viewing body map (already zoomed on left armpit region)
2. User taps "+" button to add marker
3. User places marker at precise location
4. User taps "+" button (flare creation button)
5. → `/flares/details` (marker data pre-filled, layer inherited from body-map view)
6. User sets severity: 5/10
7. User selects lifecycle stage: "Onset"
8. User adds note: "Small, tender"
9. User taps "Save"
10. → Success screen
11. User taps "🗺️ Back to body-map"
12. → Body map view (same layer, same region) with new flare marker visible

**Success Criteria:**
- Contextual entry point from body-map view
- Layer auto-detected (no redundant selection)
- Return to body-map preserves view state

---

## Implementation Planning

### Story Breakdown (Estimated)

**Story 9.1: Body Map Placement Page (Foundation)** - 8 points
- Create `/flares/place` route
- Move body map placement logic from modal to full page
- Add layer selector at top (conditional rendering based on source)
- Wire dashboard "Flare" button → `/flares/place`
- Handle navigation context tracking

**Story 9.2: Flare Details Page** - 8 points
- Create `/flares/details` route
- Accept marker placement data from previous page
- Display region name, marker count, layer badge
- Integrate LifecycleStageSelector component
- Severity slider + notes textarea
- Save button → create flare → navigate to success

**Story 9.3: Success Screen with "Add Another"** - 5 points
- Create success confirmation screen
- Display flare summary
- "Add another flare" button → `/flares/place`
- Contextual return button (dashboard vs body-map)
- Navigation context handling

**Story 9.4: Integration and Cleanup** - 8 points
- Wire body-map "+" button → `/flares/details` flow
- Remove CreateFlareModal component
- Refactor FlareUpdateModal (updates only)
- Add URL state management (browser back button support)
- Add analytics events (6 events total)
- End-to-end testing

**Story 9.5: Multi-Flare Onboarding Enhancement** *(Optional)* - 5 points
- Detect onboarding flow (first 7 days, <3 flares)
- Add educational prompt after first flare save
- Track onboarding multi-flare adoption metrics

**Total Estimated Points:** 34 points (29 required + 5 optional)

---

## Out of Scope

The following capabilities are explicitly excluded from Epic 9:

**State Persistence Across Sessions**
- Draft state preservation if user closes browser mid-flow
- Resume incomplete flare creation after app restart
- Rationale: MVP focuses on completing flow in single session; state persistence adds complexity

**Batch Multi-Region Flare Creation**
- Placing markers across multiple regions before proceeding to details
- Single details page handling multiple flares simultaneously
- Rationale: Current region-specific flow is proven; batch mode can be added later if needed

**Smart Suggestions and Auto-Fill**
- Pre-filling severity/lifecycle based on previous flares in same region
- "Copy from last flare" quick-fill option
- Recently affected region suggestions
- Rationale: MVP establishes flow; smart features layer on top

**Template-Based Creation**
- Saving flare profiles for one-tap creation
- Template management UI
- Rationale: Future enhancement after MVP validates core flow

**Voice Input**
- Voice-to-text for notes
- Hands-free logging workflow
- Rationale: Accessibility enhancement for future consideration

**Photo Integration During Creation**
- Adding photos during placement/details flow
- Before/during/after photo workflow
- Rationale: Photo attachment currently works post-creation; integration can be added later

---

## References

- **Existing PRD:** [docs/PRD.md](./PRD.md) - Original body map and flare tracking requirements
- **Epic 2:** Flare Lifecycle Management (foundational flare tracking)
- **Epic 3.5:** Production-Ready UI/UX Enhancement (established full-page pattern for symptoms/triggers/foods)
- **Epic 8:** HS Flare Lifecycle Tracking (lifecycle stage tracking integrated in this redesign)

---

## Next Steps

1. **Run:** `workflow create-epics-and-stories` to generate detailed story breakdown
2. **Run:** `workflow create-architecture` to define routing architecture and component composition
3. **Optional:** `workflow ux-design` for detailed wireframes and interaction design

---

_This PRD establishes the UX pattern that will scale symptom-tracker as we add new tracking features. Clean, consistent, flexible UI that grows with the product._

_Created through collaborative discovery between Steven and AI Product Manager._
