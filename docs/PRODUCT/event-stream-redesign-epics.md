# Pocket Symptom Tracker - Event Stream Redesign Epics

**Author:** Steven
**Date:** 2025-10-13
**Project Level:** Level 2 (Medium Project)
**Target Scale:** 8-10 weeks, 12-17 stories across 3 epics

---

## Epic Overview

The Event Stream Redesign transforms the Pocket Symptom Tracker from a daily summary model to an event stream model through three sequential epics. **Epic 1 (Database Schema)** creates the data foundation, **Epic 2 (UI Components)** builds the quick-log interface, and **Epic 3 (Integration)** connects existing features to the new event stream.

**Epic Summary:**
- **Epic 1: Database Schema & Repositories** - 4-5 stories - Event-based data model with repositories
- **Epic 2: UI Components & Quick-Log System** - 5-7 stories - Lightning-fast event logging UI
- **Epic 3: Integration & Feature Updates** - 3-5 stories - Connect features to event stream

**Total Story Count:** 12-17 stories

**Implementation Timeline:** Sequential (Epic 1 → Epic 2 → Epic 3) over 8-10 weeks

**Key Advantage:** Zero active users = clean slate schema redesign (no migration complexity)

---

## Epic Details

---

# Epic 1: Database Schema & Repositories

**Goal:** Implement event-based database schema from scratch, enabling timestamped event logging for medications, triggers, and enhanced flare tracking.

**Value Proposition:** Foundation for event stream model, replacing daily summary architecture with discrete timestamped events.

**Prerequisites:**
- Existing Dexie database infrastructure
- Existing definition tables (symptoms, medications, triggers)
- Phase 1 & 2 photo and body mapping systems

**Dependencies:**
- Dexie.js for IndexedDB
- Existing repositories for reference patterns
- DevDataControls component

---

## Story 1.1: Design and Implement New Schema

**As a** developer building the event stream foundation
**I want to** design and implement new database schema types for the event model
**So that** all event types can be stored with proper structure and indexes

**Acceptance Criteria:**
1. Defines `MedicationEventRecord` interface with all required fields (id, userId, medicationId, timestamp, taken, dosage, notes, timingWarning)
2. Defines `TriggerEventRecord` interface with fields (id, userId, triggerId, timestamp, intensity, notes)
3. Enhances `FlareRecord` interface with new fields (severity, severityHistory array, interventions array, resolutionNotes)
4. Updates Dexie schema to Version 1 (clean slate) with new tables and indexes
5. Creates compound indexes for efficient queries: [userId+timestamp], [userId+medicationId], [userId+triggerId]
6. Documents schema migration approach (blow away existing, no backward compatibility)
7. Tests database initialization with new schema

**Technical Notes:**
- Update `src/lib/db/schema.ts` with new TypeScript interfaces
- Update `src/lib/db/client.ts` with Dexie schema definition
- Version 1 of event model (not Version 10, start fresh)
- Indexes optimized for timeline queries (userId + timestamp most common)
- No migration script needed (0 users = clean slate)
- SeverityHistory tracks progression: `{ timestamp: number, severity: number, status: 'active' | 'improving' | 'worsening' }[]`
- Interventions track treatments: `{ timestamp: number, type: 'ice' | 'medication' | 'rest' | 'other', notes?: string }[]`

**Time Estimate:** 4-6 hours

---

## Story 1.2: Create MedicationEvent Repository

**As a** system managing medication logs
**I want to** perform CRUD operations on medication events
**So that** users can log medications taken/skipped throughout the day

**Acceptance Criteria:**
1. Implements `medicationEventRepository` with methods: create, findById, findByUserId, findByDateRange, findByMedicationId, update, delete
2. `create()` validates required fields (userId, medicationId, timestamp, taken)
3. `findByDateRange()` efficiently queries events for timeline display using [userId+timestamp] index
4. `findByMedicationId()` retrieves history for specific medication adherence tracking
5. Includes timing validation: calculates if event is within ±2 hours of scheduled time, returns timingWarning flag
6. Handles timezone correctly using epoch timestamps
7. Comprehensive test coverage (80%+) with edge cases: missing fields, invalid timestamps, non-existent medication IDs

**Technical Notes:**
- Create `src/lib/repositories/medicationEventRepository.ts`
- Follow existing repository patterns (symptomInstanceRepository as reference)
- Use Dexie compound index for date range queries
- Timing validation: compare event timestamp to medication schedule from medications table
- Test file: `src/lib/repositories/__tests__/medicationEventRepository.test.ts`
- Mock Dexie database for unit tests

**Time Estimate:** 6-8 hours

---

## Story 1.3: Create TriggerEvent Repository

**As a** system managing trigger logs
**I want to** perform CRUD operations on trigger events
**So that** users can log exposures to triggers throughout the day

**Acceptance Criteria:**
1. Implements `triggerEventRepository` with methods: create, findById, findByUserId, findByDateRange, findByTriggerId, update, delete
2. `create()` validates required fields (userId, triggerId, timestamp, intensity)
3. `findByDateRange()` efficiently queries events for timeline and correlation analysis
4. `findByTriggerId()` retrieves history for specific trigger pattern analysis
5. Intensity validation: ensures value is 'low' | 'medium' | 'high'
6. Supports bulk creation for multiple triggers logged simultaneously
7. Comprehensive test coverage (80%+) including bulk operations

**Technical Notes:**
- Create `src/lib/repositories/triggerEventRepository.ts`
- Similar structure to medicationEventRepository
- Bulk creation useful for "multiple triggers at once" scenarios
- Test file: `src/lib/repositories/__tests__/triggerEventRepository.test.ts`
- Consider aggregation methods for correlation analysis (findFrequentTriggers, etc.)

**Time Estimate:** 5-7 hours

---

## Story 1.4: Enhance Flare Repository with Severity Tracking

**As a** system managing flare lifecycles
**I want to** extend flare repository to support severity updates and interventions
**So that** users can track flare progression over hours/days

**Acceptance Criteria:**
1. Adds `updateSeverity()` method that appends to severityHistory array with timestamp, new severity, and status
2. Adds `addIntervention()` method that appends to interventions array with timestamp, type, and notes
3. Adds `resolve()` method that sets endDate, status='resolved', and captures resolutionNotes
4. Adds `getActiveFlaresWithTrend()` method that returns active flares with trend indicators (↑↓→) based on severity changes in last 24 hours
5. Trend calculation logic: comparing current severity to 24h ago, returns 'worsening' | 'stable' | 'improving'
6. `updateSeverity()` automatically updates status based on severity delta (±2 points = status change)
7. Tests cover: severity progression, multiple interventions, trend calculation edge cases (new flares, single data point)

**Technical Notes:**
- Update existing `src/lib/repositories/flareRepository.ts`
- SeverityHistory is append-only (never delete history)
- Trend calculation: compare severityHistory[-1].severity to severityHistory[-24h].severity
- Active flares: status != 'resolved' AND endDate == null
- Test trend indicators with various severity patterns
- ResolutionNotes help analytics understand what treatments work

**Time Estimate:** 6-8 hours

---

## Story 1.5: Update DevDataControls for Event Generation

**As a** developer testing the event stream UI
**I want to** generate realistic test data for the event model
**So that** I can test components with varied scenarios without manual data entry

**Acceptance Criteria:**
1. Adds `generateEventStreamData()` function that creates 7 days of realistic events
2. Generates 3-5 events per day distributed across morning (6-10am), afternoon (12-4pm), evening (6-10pm)
3. Creates 1-2 active flares with severity progression (initial + 2-3 updates showing worsening/improving)
4. Generates medication events matching user's scheduled medications (consistent timing)
5. Generates trigger events with varied intensity (not all 'high')
6. Includes symptom instances for non-flare symptoms (headaches, fatigue, etc.)
7. Events have realistic temporal relationships (trigger at lunch → symptom 2h later)
8. Provides presets: "First Day" (minimal), "One Week" (standard), "Heavy User" (30 days, multiple flares), "Edge Cases" (unusual patterns)

**Technical Notes:**
- Update `src/components/settings/DevDataControls.tsx`
- Use existing repositories to create events
- Temporal relationships: medication in AM, flare onset afternoon, trigger at meals
- Active flares: 1 worsening (severity increasing), 1 improving (severity decreasing)
- Realistic severity progression: 7→8→9 (worsening over 3 days), 8→7→5→3 (improving over 4 days)
- Random but seeded for reproducibility (same seed = same data)
- Clear existing events before generating new test data

**Example Event Distribution:**
```
Day 1 (Today):
- 8:00am: Medication (Humira taken)
- 2:14pm: Flare started (right armpit, severity 7)
- 4:30pm: Symptom (headache)
- 8:43pm: Trigger (ate dairy, medium intensity)

Day 2:
- 8:05am: Medication (Humira taken)
- 2:30pm: Flare updated (right armpit, severity 8, getting worse)
- 7:15pm: Trigger (high stress, high intensity)
- 9:00pm: Intervention on flare (ice applied)
```

**Time Estimate:** 6-8 hours

---

# Epic 2: UI Components & Quick-Log System

**Goal:** Build 9 new UI components that enable lightning-fast event logging with progressive disclosure and timeline display.

**Value Proposition:** Users can log events in 2-15 seconds (down from 2-5 minutes for daily entry), matching their mental model of discrete timestamped events.

**Prerequisites:**
- Epic 1 completed (database schema and repositories)
- DevDataControls generating test events
- Existing body mapping system (Phase 2)

**Dependencies:**
- React 19 + TypeScript
- Tailwind CSS for styling
- Existing UI patterns (modals, buttons, forms)
- Body mapping components from Phase 2

---

## Story 2.1: QuickLog Buttons Component

**As a** user wanting to log an event
**I want to** see 4 prominent quick-log buttons on the home screen
**So that** I have clear entry points for each event type

**Acceptance Criteria:**
1. Renders 4 buttons in 2x2 grid: "🔥 New Flare", "💊 Medication", "😣 Symptom", "⚠️ Trigger"
2. Each button displays emoji icon and label text
3. Buttons are visually prominent with appropriate color coding (red for flare, blue for med, etc.)
4. Tap target size ≥44px for mobile accessibility
5. Buttons disabled state when modals are open (prevent double-tap)
6. Each button opens its corresponding modal: FlareCreationModal, MedicationLogModal, SymptomLogModal, TriggerLogModal
7. Responsive layout: 2x2 grid on mobile, single row on desktop
8. Loading states while modals initialize

**Technical Notes:**
- Create `src/components/quick-log/QuickLogButtons.tsx`
- Use React state to manage which modal is open
- Pass modal open/close handlers as props
- Follow existing button component patterns
- Emoji icons: 🔥 💊 😣 ⚠️ (Unicode, no image dependencies)
- ARIA labels for screen readers: "Log new flare", "Log medication", etc.

**Time Estimate:** 3-4 hours

---

## Story 2.2: Active Flare Cards Component

**As a** user managing active flares
**I want to** see all active flares prominently displayed with quick actions
**So that** I can easily update severity and resolve flares as they heal

**Acceptance Criteria:**
1. Displays 0-5 active flare cards at top of home screen
2. Each card shows: body location, duration (days since onset), current severity (X/10), trend arrow (↑↓→)
3. Quick action buttons on each card: [Update] [Resolve]
4. Empty state when no active flares: "No active flares right now" with encouraging message
5. Trend arrows calculated from severityHistory: ↑ worsening (red), → stable (yellow), ↓ improving (green)
6. Duration shows "Day 1", "Day 3", etc. based on startDate to now
7. Tap [Update] opens FlareUpdateModal pre-filled with current flare data
8. Tap [Resolve] shows confirmation dialog, then resolves flare (removes from active display)
9. Cards sortable by severity (highest first) or recency (newest first)

**Technical Notes:**
- Create `src/components/flares/ActiveFlareCards.tsx`
- Query active flares using `flareRepository.getActiveFlaresWithTrend()`
- Calculate duration: `Math.floor((Date.now() - flare.startDate) / (1000 * 60 * 60 * 24)) + 1` days
- Trend arrow logic from severityHistory (compare current to 24h ago)
- Resolve confirmation: simple dialog with "What helped?" optional field
- Use existing Card component patterns
- Empty state component: `<EmptyFlareState />`

**Time Estimate:** 6-8 hours

---

## Story 2.3: Timeline View Component

**As a** user wanting to see what happened today
**I want to** view a chronological feed of all events
**So that** I can understand my day's health patterns at a glance

**Acceptance Criteria:**
1. Displays events in reverse chronological order (most recent first)
2. Each timeline item shows: time (HH:MM am/pm), emoji icon, summary text, optional details preview
3. Events grouped by day with date headers ("Today", "Yesterday", "Oct 12", etc.)
4. Tap timeline item to open EventDetailModal for that event
5. "Add details →" link shown on events with minimal data (logged via quick-log without notes/photos)
6. "Load previous day" button at bottom, loads one more day on tap
7. Loading states: skeleton UI while querying, spinne r for "Load more"
8. Empty state: "No events today yet. Use quick-log buttons above to get started!"
9. Responsive: full width on mobile, 2/3 width on desktop

**Event Summary Formats:**
- Medication: "💊 Humira (taken)" or "💊 Metformin (skipped)"
- Symptom: "😣 Headache" with severity if present
- Trigger: "⚠️ Ate dairy (medium intensity)"
- Flare created: "🔥 Right armpit flare started, severity 7/10"
- Flare updated: "🔥 Right armpit updated: 8/10 (+1)"
- Flare resolved: "🔥 Right armpit flare resolved"

**Technical Notes:**
- Create `src/components/timeline/TimelineView.tsx`
- Query all event types from repositories, sort by timestamp descending
- Aggregate events from: medicationEvents, triggerEvents, symptomInstances, flares (updates tracked via severityHistory)
- Type: `TimelineEvent = { id, type, timestamp, summary, details?, eventRef }`
- Pagination: load 1 day at a time, track currentDate state
- Use virtualization for performance with 100+ events (react-window or similar)
- Date formatting: use Intl.DateTimeFormat or date-fns

**Time Estimate:** 8-10 hours

---

## Story 2.4: Flare Creation and Update Modals

**As a** user experiencing a flare
**I want to** quickly log new flares and update existing ones
**So that** I can track flare progression over hours/days

**Acceptance Criteria - FlareCreationModal:**
1. Step 1: Compact body map for location selection (reuse existing BodyMapViewer in compact mode)
2. Step 2: Severity slider 1-10 with clear labels (1="Minimal", 10="Excruciating")
3. Step 3: Optional notes field with placeholder "Any details? (optional)"
4. Two save buttons: [Save] (quick 10-15 sec flow) and [Add Details] (opens EventDetailModal after save)
5. Timestamp auto-captured on save
6. Creates FlareRecord with initial severity in severityHistory
7. Modal closes after save, returns to home with flare in Active Flares section
8. Form validation: body location required, severity required, notes optional
9. Mobile responsive: full-screen modal on mobile, centered dialog on desktop

**Acceptance Criteria - FlareUpdateModal:**
1. Shows flare context: "Right Armpit - Day 3"
2. Shows previous severity: "Severity was: 7/10"
3. Severity slider for new severity
4. Status buttons: [Getting Worse] [Same] [Improving] (optional, auto-detected if not selected)
5. Quick intervention buttons: [Ice] [Meds] [Rest] [Other] (optional)
6. Optional notes field
7. Calls `flareRepository.updateSeverity()` with new data
8. If intervention selected, calls `flareRepository.addIntervention()`
9. Timeline shows update event after save
10. Completed in 5-10 seconds for typical update

**Technical Notes:**
- Create `src/components/flares/FlareCreationModal.tsx`
- Create `src/components/flares/FlareUpdateModal.tsx`
- Reuse `<BodyMapViewer compact={true} />` from Phase 2
- Severity slider: `<input type="range" min="1" max="10" />`
- Status auto-detection: severity +2 = worsening, -2 = improving, else stable
- Save handlers call appropriate repository methods
- Pass `isOpen` and `onClose` props for modal management

**Time Estimate:** 10-12 hours (2 complex modals)

---

## Story 2.5: Medication, Symptom, and Trigger Log Modals

**As a** user logging routine events
**I want to** use simple, focused modals for each event type
**So that** I can log medications, symptoms, and triggers in 2-5 seconds

**Acceptance Criteria - MedicationLogModal:**
1. Shows list of scheduled medications for today from medications table
2. Each medication has checkbox: [ ] Humira, [ ] Metformin
3. Timing warning shown if current time is outside ±2 hour window: "⚠️ Usually taken at 8am (2 hours early)"
4. Recent notes shown as suggestion chips below checkboxes
5. Optional notes field: "Any notes? (optional)"
6. Auto-saves on checkbox change (no explicit save button needed)
7. Completed in 2-3 seconds for simple checkbox, 5-10 seconds with notes

**Acceptance Criteria - SymptomLogModal:**
1. Shows recent/favorite symptoms first (last logged in past 30 days)
2. Full symptom list below with categories
3. One-tap logging: tap symptom name → immediately logs
4. Optional: tap same symptom again to add severity/notes (progressive disclosure)
5. Search filter at top for finding specific symptoms
6. Completed in 3-5 seconds for one-tap, 10-15 seconds with details

**Acceptance Criteria - TriggerLogModal:**
1. Shows common triggers first (dietary, stress, sleep, weather)
2. Full trigger list below
3. One-tap logging: tap trigger → immediately logs with medium intensity
4. Optional: tap again to adjust intensity (low/medium/high) and add notes
5. Completed in 3-5 seconds for one-tap

**Technical Notes:**
- Create `src/components/medications/MedicationLogModal.tsx`
- Create `src/components/symptoms/SymptomLogModal.tsx`
- Create `src/components/triggers/TriggerLogModal.tsx`
- MedicationLogModal: calculate timing warnings by comparing current time to medication schedule
- SymptomLogModal: query recent symptoms via symptomInstanceRepository.findByUserId() grouped by symptomId, sorted by last used
- Smart notes: query medicationEventRepository.findByMedicationId(), extract unique notes, show as chips
- All modals: timestamp = Date.now() on log
- Auto-close after log (or keep open for multi-log scenarios)

**Time Estimate:** 12-14 hours (3 modals)

---

## Story 2.6: Event Detail Modal for Progressive Disclosure

**As a** user who quick-logged an event
**I want to** add additional context later when I have time
**So that** I can capture comprehensive data without slowing down initial logging

**Acceptance Criteria:**
1. Opens when user taps timeline event or taps [Add Details] in quick-log modals
2. Shows event summary at top: type icon, time, name (e.g., "💊 Humira at 8:05am")
3. Form fields for additional details based on event type:
   - Medications: Dosage override, detailed notes
   - Symptoms: Severity (1-10), body location, triggers, notes
   - Triggers: Intensity, suspected cause, notes
   - Flares: Already detailed, but can add photos, additional notes
4. Photo attachment: "Add photo" button opens camera/gallery
5. Links to related events: "Link to trigger" suggests recent trigger events
6. Notes field with rich text (bold, lists) via simple markdown
7. [Save] button updates event record with new details
8. [Delete Event] button with confirmation (destructive action)

**Technical Notes:**
- Create `src/components/timeline/EventDetailModal.tsx`
- Dynamic form based on event.type: switch case for medication/symptom/trigger/flare
- Photo attachment: integrate with existing photoAttachments table, link via eventId
- Event linking: query events from same day, show suggestions
- Markdown: use simple parser (marked or react-markdown)
- Update methods: call appropriate repository.update(id, newData)

**Time Estimate:** 8-10 hours

---

## Story 2.7: Mobile Responsive Design and Accessibility

**As a** user on mobile devices
**I want to** operate all quick-log flows with one hand
**So that** I can log events while in pain or on-the-go

**As a** user with accessibility needs
**I want to** use screen readers and keyboard navigation
**So that** the app is usable regardless of my abilities

**Acceptance Criteria - Mobile Responsive:**
1. All modals full-screen on mobile (<768px), centered dialog on desktop
2. Tap targets ≥44px for buttons and interactive elements
3. Thumb-zone optimization: important actions in bottom half of screen
4. Sliders operable with thumb (large touch area)
5. Keyboard closes automatically when not needed (severity slider, checkboxes)
6. Tested on iPhone SE (small screen) and iPhone 14 Pro (large screen)

**Acceptance Criteria - Accessibility:**
1. All interactive elements have ARIA labels: aria-label="Log new flare"
2. Keyboard navigation: Tab through form fields, Enter to submit, Esc to close modals
3. Focus management: when modal opens, focus moves to first input
4. Screen reader announcements: "Flare logged successfully" on save
5. Color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for UI components)
6. Severity slider has aria-valuenow, aria-valuemin, aria-valuemax
7. Timeline events have semantic HTML: <article> tags with time element
8. Tested with VoiceOver (iOS) and TalkBack (Android)

**Technical Notes:**
- Use Tailwind responsive utilities: `<button className="w-full md:w-auto">`
- Touch targets: `className="min-h-[44px] min-w-[44px]"`
- ARIA attributes on all components
- Focus management: useEffect(() => inputRef.current?.focus(), [isOpen])
- Screen reader announcements: use aria-live regions or custom announcement hook
- Run axe-core accessibility audit on all components

**Time Estimate:** 6-8 hours (audit + fixes across all components)

---

# Epic 3: Integration & Feature Updates

**Goal:** Update existing features (analytics, exports, correlations) to consume event stream data and integrate new home screen experience.

**Value Proposition:** Seamless transition to event model without breaking existing functionality, complete end-to-end system.

**Prerequisites:**
- Epic 1 & 2 completed
- All components built and tested
- DevDataControls generating realistic event data

**Dependencies:**
- Existing analytics services
- Export/import services
- Trigger correlation components
- Home/dashboard page

---

## Story 3.1: Redesign Home/Dashboard Page

**As a** user opening the app
**I want to** see active flares, quick-log buttons, and today's timeline
**So that** I can immediately log events or review my day

**Acceptance Criteria:**
1. New layout: Active Flares (top) → Quick-Log Buttons → Timeline View → Navigation
2. Active Flares section shows 0-5 flare cards, collapses to 1-line summary if > 5
3. Quick-Log Buttons prominently displayed below Active Flares
4. Timeline View shows today's events, scrollable
5. Navigation remains at bottom (mobile) or sidebar (desktop) - unchanged from Phase 2
6. Page loads in <1 second for typical data (5 active flares + 10 today events)
7. Smooth scroll to timeline item when tapped from notification/link
8. Refresh mechanism: pull-to-refresh on mobile, refresh button on desktop

**Technical Notes:**
- Update `src/app/(protected)/dashboard/page.tsx`
- Layout stack: `<ActiveFlareCards /> → <QuickLogButtons /> → <TimelineView />`
- Use React Server Components for initial data load (SSR-compatible)
- Client components: all interactive modals
- Data fetching: parallel queries for active flares + today's events
- Page title: "Home" or "Dashboard"

**Time Estimate:** 6-8 hours

---

## Story 3.2: Update Analytics to Query Event Stream

**As a** user viewing analytics
**I want to** see insights based on my event stream data
**So that** trend analysis and correlations use accurate timestamped events

**Acceptance Criteria:**
1. TrendAnalysisService queries symptomInstances table instead of dailyEntries.symptoms
2. Flare-specific trends query flares table with severityHistory
3. Medication adherence calculated from medicationEvents (% taken vs scheduled)
4. Symptom frequency aggregated from symptomInstances by date/week/month
5. Analytics dashboard displays correctly with event-based data
6. No regressions: all existing charts render properly
7. Performance: queries complete in <2 seconds for 90-day datasets

**Technical Notes:**
- Update `src/lib/services/TrendAnalysisService.ts`
- Update analytics components to use new service methods
- Flare severity trends: extract severityHistory, plot over time
- Medication adherence: count medicationEvents where taken=true / scheduled count
- Aggregate by date: group events by day using `new Date(timestamp).toDateString()`
- Test with DevDataControls-generated 30-day dataset

**Time Estimate:** 6-8 hours

---

## Story 3.3: Update Exports and Trigger Correlation

**As a** user exporting data
**I want to** export all event types in CSV and JSON
**So that** I can share comprehensive data with my doctor or analyze externally

**As a** user analyzing triggers
**I want to** see correlations based on trigger events and symptom events
**So that** I can identify cause-and-effect relationships

**Acceptance Criteria - Export:**
1. CSV export includes all event types: one row per event with columns: type, timestamp, name, details
2. JSON export structured by event type: `{ medicationEvents: [...], triggerEvents: [...], ... }`
3. Export includes flare progression: severity history and interventions
4. Export preserves timestamps in ISO 8601 format for external tools
5. File size reasonable for 1 year of data (<5MB for typical user)

**Acceptance Criteria - Trigger Correlation:**
1. Correlation dashboard queries triggerEvents table for exposures
2. Queries symptomInstances and flares for symptom data
3. Correlation calculation uses timestamps for temporal analysis (trigger at T, symptom at T+2h)
4. Displays correlation matrix: triggers vs symptoms with correlation coefficients
5. Time-lag analysis: shows most common delay between trigger and symptom (e.g., dairy → symptom 3-5 hours later)

**Technical Notes:**
- Update `src/lib/services/exportService.ts`
- Update `src/components/triggers/TriggerCorrelationDashboard.tsx`
- CSV format: `type,timestamp,name,details\nmedication,2025-10-13T08:00:00.000Z,Humira,taken\n...`
- JSON format: structured with top-level keys for each table
- Correlation: Pearson correlation coefficient between trigger counts and symptom severity
- Time-lag: bucket analysis (0-2h, 2-4h, 4-6h, etc.) for trigger→symptom pairs

**Time Estimate:** 8-10 hours

---

## Story 3.4: Medication Timing Warnings and Smart Notes

**As a** user taking scheduled medications
**I want to** see warnings if I'm taking meds early/late
**So that** I maintain consistent medication timing for effectiveness

**As a** user logging repeated events
**I want to** see recent notes as suggestions
**So that** I can quickly add context without retyping common notes

**Acceptance Criteria - Timing Warnings:**
1. MedicationLogModal calculates expected time from medication schedule
2. Shows warning banner if current time outside ±2 hour window: "⚠️ Usually taken at 8am (2 hours late)"
3. Warning color-coded: yellow for 1-2 hours off, red for >2 hours off
4. No warning for PRN (as-needed) medications
5. Warning is informational only (doesn't block logging)

**Acceptance Criteria - Smart Notes:**
1. MedicationLogModal queries last 10 medication events for same med, extracts unique notes
2. Shows note suggestions as chips below checkbox: "With food", "Injection", "Before bed"
3. Tap chip to auto-fill notes field (editable)
4. Symptom and trigger modals also show recent notes
5. Notes tracked per event type (med notes, symptom notes, trigger notes kept separate)

**Technical Notes:**
- Timing calculation: compare `Date.now()` to `medication.schedule.time`
- Schedule stored in medications table: `{ time: "08:00", frequency: "daily" }`
- ±2 hour window: 6am-10am acceptable for 8am med
- Query recent notes: `medicationEventRepository.findByMedicationId(medId, { limit: 10 })`, map to notes array, deduplicate
- Chip component: `<button onClick={() => setNotes(chip.text)}>{chip.text}</button>`

**Time Estimate:** 5-6 hours

---

## Story 3.5: Repurpose Daily Log Page as Optional Reflection

**As a** user who wants to add end-of-day context
**I want to** access an optional reflection form
**So that** I can capture overall mood, sleep quality, and daily notes without it being required

**Acceptance Criteria:**
1. Daily log page `/log` repurposed as end-of-day reflection (optional)
2. Shows simplified form: mood (1-5 scale), sleep quality (1-5 scale), overall notes textarea
3. Event stream remains primary: reflection is supplemental context
4. No prompt or reminder to fill out reflection (user must navigate manually)
5. Alternative: redirect `/log` to dashboard with banner: "Log events as they happen from quick-log buttons"
6. If reflection form kept, it's accessible via navigation: "Daily Reflection" or "End-of-Day Notes"
7. Reflection entries stored in dailyEntries table (reuse existing structure, keep for backward compatibility)

**Technical Notes:**
- Update `src/app/(protected)/log/page.tsx`
- Option A: Simplified reflection form (mood + sleep + notes only, remove symptoms/meds/triggers sections)
- Option B: Redirect to dashboard with message banner
- If Option A: make it clear this is optional ("Not required - events are your primary logs")
- If Option B: add optional "Reflection" link to navigation
- Preserve dailyEntries table for those who want to use it

**Decision Needed:** Confirm with stakeholder (Steven) which approach: simplified reflection form or redirect?

**Time Estimate:** 4-5 hours

---

## Out of Scope for This Release

**Deferred to Future Iterations:**
- Voice-activated quick-logging
- Wearable device integration (Apple Watch)
- AI-powered event suggestions
- Multi-day timeline view (week/month)
- Automatic event detection via sensors
- Social features (shared timelines, community patterns)

**Already Complete (No Changes Needed):**
- Body mapping system (reused in flare creation)
- Photo annotation (integrated with event detail modal)
- Photo comparison and blur features
- Navigation system (bottom tabs, sidebar)
- PWA infrastructure and service workers

---

## Appendix: Story Dependencies

**Sequential Dependencies:**

1. **Epic 1 must complete before Epic 2**
   - Database schema and repositories needed before UI can read/write data
   - DevDataControls must generate test data before component development

2. **Epic 2 must complete before Epic 3**
   - All components built before integration into home page
   - Modals tested standalone before analytics/exports updated

**Parallel Development Opportunities within Epics:**

**Epic 1:**
- Stories 1.2, 1.3, 1.4 can be developed in parallel after Story 1.1 (schema defined)
- Story 1.5 (DevDataControls) can start after repositories partially complete

**Epic 2:**
- Stories 2.1, 2.2, 2.3 (Buttons, Cards, Timeline) can be developed in parallel with test data
- Stories 2.4, 2.5, 2.6 (Modals) depend on 2.1 (buttons to open them) but can be parallel to each other
- Story 2.7 (Accessibility) happens after all components built (audit + fixes)

**Epic 3:**
- Stories 3.2, 3.3, 3.4 can be developed in parallel (independent feature updates)
- Story 3.1 (Dashboard) should be last (integrates all Epic 2 components)
- Story 3.5 (Daily log) can be parallel to 3.2-3.4

**Critical Path:** 1.1 → 1.2-1.4 → 1.5 → 2.1 → 2.4-2.6 → 2.2-2.3 → 2.7 → 3.2-3.5 → 3.1

---

_This epic breakdown provides detailed user stories with acceptance criteria and technical notes for the Event Stream Redesign implementation._
