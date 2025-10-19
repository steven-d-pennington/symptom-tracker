# Pocket Symptom Tracker - Event Stream Redesign PRD

**Author:** Steven
**Date:** 2025-10-13
**Project Level:** Level 2 (Medium Project)
**Project Type:** Web application (Progressive Web App)
**Target Scale:** 8-10 weeks, 12-15 stories across 3 epics

---

## Description, Context and Goals

### Description

The Event Stream Redesign transforms the Pocket Symptom Tracker from a "daily summary" model to an "event stream" model, fundamentally changing how users interact with the application. Instead of filling out a comprehensive daily form, users will log health events as they happen throughout the day—medications at 8am, flare updates at 2pm, triggers at dinner—creating a chronological timeline that matches their lived experience of chronic illness.

This redesign addresses the core UX issue discovered through user feedback: the current daily log form is "confusing and overwhelming," causing users to abandon the app mid-entry. The new event-based model enables lightning-fast logging (2-15 seconds depending on event type), progressive disclosure of optional details, and a timeline view that shows "what happened when" rather than forcing reconstruction of the entire day.

**Zero Users = Clean Slate Advantage:** With no active users, we can redesign the database schema from scratch without migration complexity, reducing implementation time from 12 weeks to 8-10 weeks.

### Deployment Intent

This is a **foundational architecture change** deployed as a complete replacement of the current daily log system. The event stream redesign will:

- Replace the daily entry form with quick-log buttons and timeline view
- Introduce new database tables (medicationEvents, triggerEvents, enhanced flares)
- Repurpose the daily log page as an optional end-of-day reflection
- Maintain existing features (analytics, body mapping, photos) by adapting them to consume event stream data

**Rollout Strategy:**
- Clean slate deployment (blow away existing schema, no migration needed)
- All features updated to use event-based data model
- Update DevDataControls to generate realistic test data for new schema
- Comprehensive testing before launch (no real users to impact)

### Context

People living with autoimmune conditions like Hidradenitis Suppurativa experience their symptoms as **discrete timestamped events throughout the day**, not as daily summaries to reconstruct later. A user's reality looks like:

- 8:00am: Take Humira injection
- 2:14pm: Notice new flare in right armpit, severity 7/10
- 4:30pm: Headache started
- 8:43pm: Ate dairy at dinner (known trigger)
- 9:15pm: Flare worsened to 8/10, applied ice

However, the current app forces a **single daily summary form** with 5 sections (Health, Symptoms, Medications, Triggers, Notes), creating:

**Cognitive Dissonance:**
- "Do I average symptoms? Report the worst? List them all?"
- "I already logged at lunch... do I fill this out again?"
- "What's required vs optional?"

**Data Loss:**
- Multiple flare events per day collapsed into one entry
- Temporal context lost (when did it happen relative to meals, meds, stress?)
- Can't track flare progression over hours/days

**User Frustration:**
- Direct feedback: "Dang it! What the heck?" - users abandon mid-entry
- Takes 2-5 minutes when users are in pain and need speed
- Overwhelmed by decision paralysis: 5 sections × multiple fields = cognitive overload

The fundamental problem isn't UI polish—it's a **conceptual model mismatch**. Users need to log events as they happen (event stream), not reconstruct their day later (daily summary). This architectural mismatch causes all downstream confusion and abandonment.

**Why Now:**
- User feedback confirms the daily log is the primary pain point
- With 0 active users, we can redesign the schema without migration risk
- The event stream model is validated by analogous apps (Apple Health, Papaya)
- Quick-log flows reduce logging time from 2-5 minutes to 2-15 seconds

### Goals

1. **Speed - Primary Goal** - Enable users to log health events in 2-15 seconds (depending on event type), down from the current 2-5 minutes for daily entry completion

2. **Cognitive Load Reduction** - Eliminate decision paralysis by providing clear entry points for each event type with progressive disclosure of optional details

3. **Temporal Accuracy** - Capture when events happened throughout the day with automatic timestamps, preserving cause-and-effect relationships between triggers, medications, and symptoms

4. **Flare Lifecycle Tracking** - Enable users to create, update, and resolve active flares over hours/days, tracking severity progression and interventions

5. **Match Mental Model** - Align the app's data model with how users actually experience chronic illness (discrete events) rather than forcing daily summaries

## Requirements

### Functional Requirements

**Event Logging (FR1-FR8)**

**FR1. Quick-Log Buttons** - System shall provide 4 prominent quick-log buttons on home screen: "🔥 New Flare", "💊 Medication", "😣 Symptom", "⚠️ Trigger", each opening a focused modal for that event type.

**FR2. Medication Event Logging** - System shall display scheduled medications for the day with one-tap checkboxes for taken/skipped, optional timing warnings if taken outside ±2 hour window, and smart note suggestions based on recent entries, completing in <5 seconds.

**FR3. Symptom Event Logging** - System shall show recent/favorite symptoms first with one-tap instant logging, optional tap-again for severity and notes, completing in 3-5 seconds for basic log, 10-15 seconds with details.

**FR4. Trigger Event Logging** - System shall display common triggers with one-tap logging, optional intensity selector (low/medium/high), and notes field, completing in 3-5 seconds.

**FR5. Flare Creation (HS-Specific)** - System shall provide compact body map for location selection, severity slider (1-10), and optional notes, with two save options: "Save" (quick 10-15 sec) or "Add Details" (progressive disclosure for photos, triggers, interventions).

**FR6. Flare Updates** - System shall allow quick severity updates on active flares showing previous vs new severity, status buttons (Getting Worse/Same/Improving), quick intervention options (Ice/Meds/Rest/Other), completing in 5-10 seconds.

**FR7. Flare Resolution** - System shall provide "Resolve" action on active flares with confirmation prompt, optional "What helped?" field to capture treatment effectiveness, and removal from active dashboard while preserving history.

**FR8. Automatic Timestamping** - System shall automatically capture current timestamp for all event creations and updates, with no manual time entry required.

**Timeline & Display (FR9-FR13)**

**FR9. Timeline View** - System shall display today's events in chronological order showing event type icon, time, summary text, and expandable details, with "Load previous day" button at bottom.

**FR10. Active Flares Display** - System shall show 0-5 active flares at top of home screen with cards displaying: location, duration (days since onset), current severity, trend arrow (↑↓→), and quick [Update] [Resolve] buttons.

**FR11. Event Detail Modal** - System shall allow tapping any timeline event to expand full details with options to add photos, body location, notes, and links to related events (progressive disclosure).

**FR12. Empty States** - System shall show helpful messages when no data exists: "No events today yet" with suggestions to use quick-log buttons, "No active flares" with encouragement.

**FR13. Flare Progression Indicators** - System shall display trend arrows on active flare cards: ↑ (worsening), → (stable), ↓ (improving) based on severity changes over last 24 hours.

**Optional Reflection (FR14-FR15)**

**FR14. End-of-Day Reflection** - System shall provide optional end-of-day reflection form (repurposed daily log) accessible via navigation, capturing overall mood, sleep quality, and daily notes without being required.

**FR15. Daily Summary Optional** - System shall never block or require daily summary completion; event stream is primary data model, summaries are supplemental context only.

### Non-Functional Requirements

**NFR1. Performance - Logging Speed** - Event creation shall complete in <200ms from user tap to database save, with optimistic UI updates showing event immediately while saving asynchronously in background.

**NFR2. Performance - Home Load Time** - Home screen with active flares + today's timeline shall load in <1 second for datasets up to 100 events, using efficient IndexedDB queries with proper indexes.

**NFR3. Performance - Timeline Scrolling** - Timeline shall maintain 60fps scroll performance with 100+ events using virtual scrolling and lazy loading of expanded details.

**NFR4. Usability - Speed Targets** - Medication logging <5 sec, symptom logging <10 sec, flare logging <20 sec, flare update <10 sec, measured via task completion time in user testing.

**NFR5. Usability - Progressive Disclosure** - All quick-log flows shall start with minimum required fields (2-5 seconds), with "Add Details" option for comprehensive data entry when users have time.

**NFR6. Usability - One-Handed Operation** - All quick-log flows shall be operable with thumb only on mobile devices, with tap targets ≥44px and no required two-handed interactions.

**NFR7. Offline Capability** - All quick-log actions shall work offline with local IndexedDB storage, showing success immediately and syncing when connection restored (full offline parity with online).

**NFR8. Data Integrity - No Migration** - With 0 active users, system shall implement clean slate schema (Version 1 of event model) without backward compatibility, allowing schema optimization.

**NFR9. Accessibility - Screen Reader Support** - Timeline events, quick-log buttons, and active flare cards shall have proper ARIA labels and keyboard navigation support (WCAG 2.1 AA compliance).

**NFR10. Testability - DevData Generation** - DevDataControls shall generate realistic event stream test data (3-5 events per day distributed across morning/afternoon/evening, 1-2 active flares) to support development and testing.

## User Journeys

**Journey 1: Sarah Logs a Morning Flare (Quick-Log Flow)**

Sarah wakes up with a new flare in her right armpit. She's in pain and needs to log it quickly before work.

1. **Opens App** - Home screen shows today's timeline (currently empty) and quick-log buttons
2. **Taps "🔥 New Flare"** - Modal opens with compact body map (1 second)
3. **Selects Location** - Taps right armpit on body map (3-4 seconds)
4. **Sets Severity** - Drags slider to 7/10 (3-4 seconds)
5. **Skips Notes** - Opts not to add notes since she's rushing
6. **Taps [Save]** - Event saves, modal closes (1 second)
7. **Views Result** - Active Flares section now shows "Right Armpit - Day 1, Severity 7/10", timeline shows "🔥 Right armpit flare started, 7/10" with timestamp 7:23am
8. **Total Time: 10-12 seconds** - Successfully logged during morning rush

**Later that day...**

9. **Flare Worsens** - At 2pm, Sarah notices the flare is worse
10. **Taps [Update]** - On the active flare card
11. **Quick Update Modal** - Shows "Was: 7 → Now: ?" with severity slider
12. **Adjusts Severity** - Drags to 8/10, taps [Getting Worse]
13. **Logs Intervention** - Taps [Ice] to record treatment
14. **Taps [Save]** - Update logged (5-7 seconds total)
15. **Views Update** - Card now shows "8/10 ↑" with red up arrow, timeline adds "🔥 Right armpit updated: 8/10 (+1)"

**Journey 2: Marcus Tracks His Medications (Daily Routine Flow)**

Marcus takes Humira weekly and metformin daily. He wants to log his morning medications quickly.

1. **Opens App** - Sees reminder that medications are scheduled today
2. **Taps "💊 Medication"** - Modal opens showing scheduled meds list
3. **Views List** - Sees "Metformin (8:00am due)" and "Humira (weekly injection)"
4. **Checks Boxes** - Taps checkboxes for both medications (2 seconds)
5. **Sees Timing** - No warnings (within ±2 hour window)
6. **Skips Notes** - No additional notes needed
7. **Auto-Save** - Medications log automatically on checkbox (3 seconds total)
8. **Timeline Updates** - Shows "💊 Metformin (taken)" and "💊 Humira (taken)" with 8:05am timestamp

**Journey 3: Chen Discovers a Trigger Pattern (Timeline Exploration Flow)**

Chen had a bad flare yesterday and wants to understand what triggered it by reviewing her timeline.

1. **Opens App** - Views today's timeline
2. **Loads Previous Day** - Taps "Load previous day" at bottom
3. **Reviews Timeline** - Sees chronological list:
   - 8:00am 💊 Medications
   - 12:30pm 🔥 Flare started (right groin, 6/10)
   - 1:15pm ⚠️ Ate dairy
   - 6:00pm 🔥 Flare updated (8/10 ↑)
4. **Identifies Pattern** - Notices flare worsened 5 hours after dairy trigger
5. **Adds Retroactive Note** - Taps dairy trigger event, adds note: "Restaurant had hidden dairy in sauce"
6. **Mental Note** - Decides to avoid that restaurant in future
7. **Value Realized** - Timeline view makes cause-and-effect visible

**Journey 4: Lisa Tracks a Multi-Day Flare Resolution (Flare Lifecycle Flow)**

Lisa has been managing an active flare for 3 days and it's finally resolving.

**Day 1:**
1. Logs new flare (left thigh, severity 8/10) - 15 seconds
2. Flare appears in Active Flares section

**Day 2:**
3. Updates severity to 9/10, status "Getting Worse" - 5 seconds
4. Logs intervention: Ice pack applied - included in update
5. Later updates severity to 8/10, status "Improving" after medication - 5 seconds

**Day 3:**
6. Updates severity to 5/10, still improving - 5 seconds
7. By evening, flare almost gone
8. Taps [Resolve] on active flare card
9. Modal asks: "Mark as resolved? What helped?"
10. Selects "Medication + Ice" from suggestions
11. Taps [Confirm]
12. Flare removed from active dashboard, preserved in history
13. Timeline shows full progression: 8→9→8→5→resolved over 3 days

## UX Design Principles

1. **Event Stream Over Daily Summary** - Design every interaction around logging discrete timestamped events as they happen, never force users to reconstruct their entire day in one sitting.

2. **Speed as Primary Metric** - Every quick-log flow must be optimized for minimum time to completion (2-15 seconds), measured and validated with real users in pain experiencing cognitive load.

3. **Progressive Disclosure by Default** - Start with bare minimum required fields (medication checkbox, symptom name, flare location + severity), reveal optional fields ("Add Details" button) only when user has time and energy.

4. **Flares ≠ Symptoms** - Treat HS flares as ongoing states requiring lifecycle management (create → update → resolve) with prominent active flare display, not as discrete symptom events.

5. **Timeline as Primary View** - Replace the daily entry form with a chronological event feed showing "what happened when" with automatic timestamps, making cause-and-effect relationships visible.

6. **One-Tap Whenever Possible** - Optimize for common cases (checking medication, logging recent symptom, marking trigger) to complete with single tap, expanding to details only when needed.

7. **Visual Indicators for State** - Use trend arrows (↑↓→) for flare progression, color coding for severity, and duration badges for active flares to enable at-a-glance status understanding.

8. **Smart Defaults and Suggestions** - Show recent/favorite symptoms first, suggest medication notes from history, remember user patterns to reduce repeated decision-making.

9. **Offline-First Always** - Treat offline capability as non-negotiable; every quick-log action must work without network, storing locally and syncing transparently when online.

10. **Clear Entry Points** - Provide obvious, emoji-labeled buttons for each event type (🔥💊😣⚠️) on home screen, eliminating "what do I do?" confusion.

## Epics

### Epic 1: Database Schema & Repositories
**Goal:** Implement event-based database schema from scratch, enabling timestamped event logging for medications, triggers, and enhanced flare tracking.

**Value:** Foundation for event stream model, replacing daily summary architecture.

**Capabilities:**
- New tables: medicationEvents, triggerEvents
- Enhanced flares table: severity tracking, interventions, progression history
- Repositories: CRUD operations for all event types
- Indexes: Optimized for timeline queries (userId + timestamp)
- DevDataControls: Generate realistic test data for event model

**Success Criteria:**
- Schema Version 1 (clean slate, no migration)
- All repositories tested with 80%+ coverage
- DevDataControls generates 7 days of realistic events
- Timeline query performance <100ms for 100 events

**Story Count:** 4-5 stories

---

### Epic 2: UI Components & Quick-Log System
**Goal:** Build 9 new UI components that enable lightning-fast event logging with progressive disclosure and timeline display.

**Value:** Users can log events in 2-15 seconds (down from 2-5 minutes), matching their mental model of discrete timestamped events.

**Capabilities:**
- QuickLogButtons: 4 emoji-labeled entry points
- ActiveFlareCards: Prominent display of 0-5 active flares with update/resolve actions
- TimelineView: Chronological event feed for today with load-more pagination
- FlareCreationModal: Body map + severity (10-15 sec logging)
- FlareUpdateModal: Quick severity adjustment (5-10 sec)
- MedicationLogModal: Checkbox list with timing warnings
- SymptomLogModal: Recent symptoms, one-tap logging
- TriggerLogModal: Common triggers, intensity selector
- EventDetailModal: Progressive disclosure for adding context

**Success Criteria:**
- All 9 components built and integrated
- Speed targets validated: Med <5s, Symptom <10s, Flare <20s
- Mobile-responsive with one-handed operation
- WCAG 2.1 AA compliant

**Story Count:** 5-7 stories

---

### Epic 3: Integration & Feature Updates
**Goal:** Update existing features (analytics, exports, correlations) to consume event stream data and integrate new home screen experience.

**Value:** Seamless transition to event model without breaking existing functionality, complete end-to-end system.

**Capabilities:**
- Home screen redesign: Active flares + quick-log + timeline
- Analytics dashboard: Query event tables instead of dailyEntries
- Trigger correlation: Consume triggerEvents + symptomEvents
- Export service: Include all event types in CSV/JSON
- Daily log repurposed: Optional reflection at /reflection route
- Medication timing warnings: Alert if taken outside schedule
- Smart note suggestions: Show recent notes as templates

**Success Criteria:**
- All existing features work with event data
- No regressions in analytics or exports
- Home screen loads <1 second
- End-to-end tests passing

**Story Count:** 3-5 stories

---

**Total Estimated Stories: 12-17 stories across 3 epics**

**Implementation Sequence:**
1. **Epic 1** (Foundation) - Build database and repositories first
2. **Epic 2** (Quick-Log) - Build UI components with test data
3. **Epic 3** (Integration) - Connect features and deploy

## Out of Scope

**Advanced Event Features (Future):**
- Voice-activated quick-logging via Siri/Google Assistant
- Wearable device integration (Apple Watch complications for quick-log)
- AI-powered event suggestions ("You usually take meds now, log it?")
- Automatic event detection via device sensors
- Multi-day timeline view with week/month aggregation

**Flare Enhancements (Phase 4+):**
- Flare photo comparison slider (before/during/after)
- Flare severity heatmaps over time
- Predictive flare warnings based on patterns
- Flare treatment effectiveness scoring
- Doctor-shareable flare progression reports

**Social Features (Not Planned):**
- Shared timelines with caregivers
- Community event patterns ("Others with HS often see...")
- Support group check-ins
- Medication reminder notifications to family

**Migration Complexity (Eliminated by 0 Users):**
- Backward compatibility with old schema
- Data migration scripts from dailyEntries
- Gradual rollout with feature flags
- Legacy code path maintenance

**Rationale:** These features either introduce significant scope creep, require external integrations beyond current architecture, or were eliminated by the zero-user advantage. Focus is on core event stream model with fast logging and timeline view.

---

## Assumptions and Dependencies

**Assumptions:**

1. **Zero Active Users** - No real users exist, allowing clean slate schema redesign without migration scripts, data loss concerns, or gradual rollout complexity.

2. **User Logging Behavior** - Users will adopt quick-log buttons over comprehensive daily forms if speed difference is significant (2-15 sec vs 2-5 min).

3. **Flare Onset Timing** - Users have 10-15 seconds to log new flares (flares have gradual onset with warning signs, not sudden emergencies).

4. **Progressive Disclosure Acceptance** - Users will be comfortable logging minimal data upfront (name, time) and adding details later when they have energy.

5. **Mobile-First Usage** - Primary interaction will be on mobile devices in real-world contexts (work, home, on-the-go), requiring one-handed operation.

6. **Timeline Pagination** - Showing today only (1 day) with "Load more" will be sufficient; users don't need week/month views in primary timeline.

**Dependencies:**

**Technical Dependencies:**
- Existing codebase: Next.js 15, React 19, TypeScript, Dexie, Tailwind CSS
- Dexie.js IndexedDB wrapper for local storage
- Body mapping system from Phase 2 (reuse for flare location)
- Photo system from Phase 2 (integrate with event detail modal)
- Existing repositories (symptoms, medications, triggers definitions)

**Data Dependencies:**
- Medications table with user's current medication list
- Symptoms table with predefined + custom symptom definitions
- Triggers table with common trigger options
- Body regions table for anatomical location mapping

**Feature Dependencies:**
- DevDataControls must be updated BEFORE component development (need test data)
- Database schema must be complete BEFORE any UI work (data layer first)
- Timeline aggregation service needed for chronological event feed
- Flare state management separate from general symptom instances

**Integration Dependencies:**
- Analytics service must consume event stream data (not dailyEntries)
- Export service must serialize all event types (medications, triggers, symptoms, flares)
- Photo attachment system must link to eventId (not just dailyEntryId)

---

## Next Steps

**Immediate Actions (This Week):**

1. **Review and Validate PRD**
   - Confirm event stream model with stakeholder (Steven)
   - Validate speed targets (2-15 seconds) are achievable
   - Approve clean slate schema approach (no migration)

2. **Create Epics Breakdown**
   - Detailed story breakdown for Epic 1 (Database Schema)
   - Acceptance criteria for each story
   - Technical implementation notes

3. **Update Workflow Status**
   - Add event stream redesign as active project
   - Link to PRD and epics documents
   - Set current phase: Planning → Implementation

**Next Steps (Week 1-2):**

1. **Epic 1: Database Schema** (Start Implementation)
   - Design new schema types (medicationEvents, triggerEvents)
   - Update `src/lib/db/schema.ts` and `src/lib/db/client.ts`
   - Create repositories (medicationEventRepository, triggerEventRepository)
   - Update DevDataControls to generate event test data
   - Write repository tests (80% coverage target)

2. **Prepare for Epic 2** (Pre-work)
   - Create component folder structure (`src/components/quick-log/`, `src/components/timeline/`)
   - Document component APIs and props interfaces
   - Create wireframes for key flows (flare creation, medication logging)

**Complete Next Steps Checklist:**

### Phase 1: Planning ✅ (Current Phase)
- [x] Design thinking session completed
- [x] Technical specification documented
- [x] PRD created with requirements and user journeys
- [ ] Epics breakdown with detailed stories
- [ ] Workflow status updated

### Phase 2: Database Schema (Week 1-2)
- [ ] Design new schema types and interfaces
- [ ] Update Dexie client with Version 1 schema
- [ ] Create medicationEventRepository
- [ ] Create triggerEventRepository
- [ ] Update flareRepository with severity tracking
- [ ] Write repository unit tests (80% coverage)
- [ ] Update DevDataControls for event generation

### Phase 3: UI Components (Week 3-5)
- [ ] Build QuickLogButtons + 4 modal components
- [ ] Build ActiveFlareCards with update/resolve
- [ ] Build TimelineView with pagination
- [ ] Build EventDetailModal for progressive disclosure
- [ ] Mobile responsive design
- [ ] Accessibility compliance (WCAG 2.1 AA)

### Phase 4: Integration (Week 6-7)
- [ ] Redesign home/dashboard page
- [ ] Update analytics to query event tables
- [ ] Update exports for event stream
- [ ] Add medication timing warnings
- [ ] Repurpose daily log as reflection page

### Phase 5: Testing (Week 8)
- [ ] Unit tests for all components and repositories
- [ ] Integration tests for quick-log flows
- [ ] Performance testing (home load, timeline scroll)
- [ ] Accessibility audit
- [ ] User testing with task-based scenarios

### Phase 6: Launch (Week 9-10)
- [ ] Clear local IndexedDB (blow away old schema)
- [ ] Deploy to production
- [ ] Monitor for errors and performance
- [ ] Collect user feedback
- [ ] Iterate on quick wins

**Estimated Timeline:** 8-10 weeks (reduced from 12 weeks due to zero-user advantage)

## Document Status

- [x] Goals and context validated with stakeholder
- [x] Functional requirements complete
- [x] User journeys cover major workflows
- [x] Epic structure approved
- [ ] Epics breakdown complete (next step)
- [ ] Ready for implementation

_Note: See event-stream-redesign-spec.md for technical architecture details_
_Note: See event-stream-kickoff-plan.md for week-by-week implementation plan_

---

_This PRD follows BMAD Level 2 format - focused scope, clear requirements, ready for implementation._
