# Event Stream Redesign - Technical Specification

**Date:** 2025-10-13
**Status:** Planning
**Priority:** P0 - Foundation Fix
**Estimated Timeline:** 12 weeks

---

## Executive Summary

Transform the Pocket Symptom Tracker from a "daily summary" model to an "event stream" model, addressing the core UX issue where users find the daily log confusing and overwhelming.

**Problem:** Users experience chronic illness as discrete timestamped events throughout the day, but the app forces a single daily summary form.

**Solution:** Event-based logging with quick-capture UI, timeline view, and progressive disclosure.

---

## Current vs. Target Architecture

### Current Model (Daily Summary)
```
User Journey:
1. Open app → sees daily entry form
2. Fill out 5 sections (Health, Symptoms, Meds, Triggers, Notes)
3. Unclear what's required vs optional
4. Takes 2-5 minutes
5. Result: Frustration, abandonment

Data Model:
- One dailyEntry record per day
- Embedded symptoms, medications, triggers
- Loses temporal context (when did events happen?)
```

### Target Model (Event Stream)
```
User Journey:
1. Open app → sees today's timeline + quick-log buttons
2. Tap "🔥 New Flare" → body map + severity → save (10-15 sec)
3. Event appears in timeline with timestamp
4. Optional: Tap event later to add details
5. Result: Fast, intuitive, matches mental model

Data Model:
- symptomInstances (already exists!)
- medicationEvents (new table)
- triggerEvents (new table)
- flares (already exists!)
- dailyEntries → optional summary (not primary)
```

---

## Database Schema Changes

### Version 10: Add Event Tables

**New Tables:**

#### medicationEvents
```typescript
interface MedicationEventRecord {
  id: string;                    // UUID
  userId: string;                // Owner
  medicationId: string;          // Reference to medications table
  timestamp: number;             // When taken (epoch ms)
  taken: boolean;                // true if taken, false if skipped/missed
  dosage?: string;               // Optional override (e.g., "2 tablets instead of 1")
  notes?: string;                // Optional context
  timingWarning?: 'early' | 'late' | null; // If taken outside schedule
  createdAt: number;             // When logged
  updatedAt: number;             // Last modified
}

// Indexes:
// Primary: id
// Query: [userId+timestamp] - Get user's events by time
// Query: [userId+medicationId] - Get history for specific med
```

#### triggerEvents
```typescript
interface TriggerEventRecord {
  id: string;                    // UUID
  userId: string;                // Owner
  triggerId: string;             // Reference to triggers table
  timestamp: number;             // When exposed (epoch ms)
  intensity: 'low' | 'medium' | 'high'; // Exposure level
  notes?: string;                // Optional context
  createdAt: number;             // When logged
  updatedAt: number;             // Last modified
}

// Indexes:
// Primary: id
// Query: [userId+timestamp] - Get user's events by time
// Query: [userId+triggerId] - Get history for specific trigger
```

**Modified Tables:**

#### flares (Enhancements)
```typescript
interface FlareRecord {
  // Existing fields:
  id: string;
  userId: string;
  symptomId: string;
  bodyRegionId: string;
  status: 'active' | 'improving' | 'worsening' | 'resolved';
  startDate: number;
  endDate?: number;

  // New fields:
  severity: number;              // Current severity (1-10)
  severityHistory: {             // Track progression
    timestamp: number;
    severity: number;
    status: 'active' | 'improving' | 'worsening';
  }[];
  interventions: {               // Track treatments
    timestamp: number;
    type: 'ice' | 'medication' | 'rest' | 'other';
    notes?: string;
  }[];
  resolutionNotes?: string;      // What helped?

  // Existing:
  createdAt: number;
  updatedAt: number;
}
```

#### dailyEntries (Becomes Optional)
```typescript
// No schema changes needed
// Just change UI treatment:
// - Not shown by default
// - Prompted at end of day (optional)
// - Used for overall reflection, mood, sleep quality
```

**Migration Strategy:**

```typescript
// Version 10 migration
this.version(10).stores({
  // ... existing tables
  medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
  triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
  flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate]",
}).upgrade(async (trans) => {
  // Migrate existing dailyEntries to events
  const dailyEntries = await trans.table("dailyEntries").toArray();

  for (const entry of dailyEntries) {
    const entryDate = new Date(entry.date).getTime();

    // Migrate medications to medicationEvents
    if (entry.medications?.length > 0) {
      for (const med of entry.medications) {
        await trans.table("medicationEvents").add({
          id: generateId(),
          userId: entry.userId,
          medicationId: med.medicationId,
          timestamp: entryDate, // Use entry date
          taken: med.taken,
          notes: med.notes,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        });
      }
    }

    // Migrate triggers to triggerEvents
    if (entry.triggers?.length > 0) {
      for (const trigger of entry.triggers) {
        await trans.table("triggerEvents").add({
          id: generateId(),
          userId: entry.userId,
          triggerId: trigger.triggerId,
          timestamp: entryDate,
          intensity: trigger.intensity || 'medium',
          notes: trigger.notes,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        });
      }
    }
  }

  // Don't delete dailyEntries - keep for notes/mood/reflection
});
```

---

## Component Architecture

### New Components

#### 1. QuickLogButtons
```tsx
// Location: src/components/quick-log/QuickLogButtons.tsx
// Purpose: Primary entry point for all logging

interface QuickLogButtonsProps {
  onLogFlare: () => void;
  onLogMedication: () => void;
  onLogSymptom: () => void;
  onLogTrigger: () => void;
}

// Renders 4 prominent buttons with emoji icons
// Fixed position or prominent on home screen
```

#### 2. ActiveFlareCards
```tsx
// Location: src/components/flares/ActiveFlareCards.tsx
// Purpose: Show active flares with quick update/resolve

interface ActiveFlareCardsProps {
  flares: FlareRecord[];
  onUpdate: (flareId: string) => void;
  onResolve: (flareId: string) => void;
}

// Shows list of active flares
// Each card shows: location, duration, severity, trend arrow
// Quick [Update] [Resolve] buttons
```

#### 3. TimelineView
```tsx
// Location: src/components/timeline/TimelineView.tsx
// Purpose: Chronological feed of today's events

interface TimelineEvent {
  id: string;
  type: 'medication' | 'symptom' | 'trigger' | 'flare' | 'photo';
  timestamp: number;
  summary: string; // "Humira (taken)" or "Right armpit flare updated: 8/10"
  details?: any;
}

interface TimelineViewProps {
  events: TimelineEvent[];
  onEventTap: (eventId: string) => void;
  onAddDetails: (eventId: string) => void;
}

// Chronological list of events
// Tap to expand/view details
// "Add details" button for quick-logged items
```

#### 4. FlareCreationModal
```tsx
// Location: src/components/flares/FlareCreationModal.tsx
// Purpose: Quick flare logging with body map + severity

interface FlareCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewFlareData) => Promise<void>;
}

interface NewFlareData {
  bodyRegionId: string;
  severity: number;
  notes?: string;
}

// Step 1: Compact body map for location selection
// Step 2: Severity slider (1-10)
// Step 3: Optional notes
// [Save] or [Add Details] buttons
```

#### 5. FlareUpdateModal
```tsx
// Location: src/components/flares/FlareUpdateModal.tsx
// Purpose: Quick severity update for active flares

interface FlareUpdateModalProps {
  flare: FlareRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (update: FlareUpdate) => Promise<void>;
}

interface FlareUpdate {
  severity: number;
  status: 'active' | 'improving' | 'worsening';
  intervention?: 'ice' | 'medication' | 'rest' | 'other';
  notes?: string;
}

// Shows previous severity: "Was: 7 → Now: ?"
// Severity slider
// Status buttons: [Getting Worse] [Same] [Improving]
// Quick intervention: [Ice] [Meds] [Rest] [Other]
// Optional notes
```

#### 6. MedicationLogModal
```tsx
// Location: src/components/medications/MedicationLogModal.tsx
// Purpose: Quick medication logging

interface MedicationLogModalProps {
  medications: MedicationRecord[];
  isOpen: boolean;
  onClose: () => void;
  onLog: (eventData: MedicationEventData) => Promise<void>;
}

// Shows scheduled medications for today
// Checkboxes for taken/not taken
// Timing warnings if early/late
// Recent notes as suggestions
// Optional notes field
```

#### 7. SymptomLogModal
```tsx
// Location: src/components/symptoms/SymptomLogModal.tsx
// Purpose: Quick general symptom logging (not flares)

interface SymptomLogModalProps {
  symptoms: SymptomRecord[];
  recentSymptoms: string[]; // IDs of recently logged
  isOpen: boolean;
  onClose: () => void;
  onLog: (data: SymptomInstanceData) => Promise<void>;
}

// Shows recent/favorite symptoms first
// Full symptom list below
// Tap to log instantly
// Optional: Tap again for severity/notes
```

#### 8. TriggerLogModal
```tsx
// Location: src/components/triggers/TriggerLogModal.tsx
// Purpose: Quick trigger logging

interface TriggerLogModalProps {
  triggers: TriggerRecord[];
  isOpen: boolean;
  onClose: () => void;
  onLog: (data: TriggerEventData) => Promise<void>;
}

// Shows common triggers
// Tap to log
// Optional: Intensity selector (low/medium/high)
// Optional notes
```

#### 9. EventDetailModal
```tsx
// Location: src/components/timeline/EventDetailModal.tsx
// Purpose: Progressive disclosure - add details to quick-logged events

interface EventDetailModalProps {
  event: TimelineEvent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: any) => Promise<void>;
}

// Shows event summary
// Form fields for additional details:
// - Photos
// - Body location (if symptom)
// - Triggers (if flare)
// - Detailed notes
// - Links to other events
```

### Modified Components

#### Dashboard/Home Page
```tsx
// Location: src/app/(protected)/dashboard/page.tsx
// Changes:
// - Add <ActiveFlareCards> at top
// - Add <QuickLogButtons> prominently
// - Add <TimelineView> showing today's events
// - Move existing dashboard content below
```

#### Daily Log Page
```tsx
// Location: src/app/(protected)/log/page.tsx
// Changes:
// - Redirect to dashboard (or remove route entirely)
// - OR: Repurpose as "End of Day Reflection" (optional form)
// - Show message: "Log events as they happen from the home screen"
```

---

## Data Flow

### Quick-Log Flow (Example: Flare)

```
User Action: Tap "🔥 New Flare" button
           ↓
FlareCreationModal opens
           ↓
User selects body location (body map)
           ↓
User drags severity slider to 7/10
           ↓
User taps [Save]
           ↓
Create FlareRecord:
  - id: generated UUID
  - userId: current user
  - bodyRegionId: selected
  - severity: 7
  - severityHistory: [{timestamp: now, severity: 7, status: 'active'}]
  - status: 'active'
  - startDate: now
  - timestamp: now
           ↓
Save to flares table
           ↓
Update UI:
  - Add to ActiveFlareCards
  - Add to Timeline ("🔥 Right armpit flare started, severity 7/10")
           ↓
Done - total time: 10-15 seconds
```

### Update Flow (Example: Flare Progression)

```
User Action: Tap [Update] on active flare card
           ↓
FlareUpdateModal opens
  - Shows: "Right Armpit - Day 3"
  - Shows: "Severity was: 7/10"
           ↓
User drags slider to 8/10
User taps [Getting Worse]
User taps [Meds] (intervention)
           ↓
User taps [Save]
           ↓
Update FlareRecord:
  - severity: 8
  - status: 'worsening'
  - severityHistory.push({timestamp: now, severity: 8, status: 'worsening'})
  - interventions.push({timestamp: now, type: 'medication'})
           ↓
Update UI:
  - Flare card shows: "8/10 ↑" (red up arrow)
  - Timeline adds: "🔥 Right armpit updated: 8/10 (+1)"
           ↓
Done - total time: 5-10 seconds
```

---

## Integration Points

### Existing Features (No Breaking Changes)

#### Analytics Dashboard
- **Current:** Queries dailyEntries for symptom data
- **New:** Query symptomInstances + flares for symptom trends
- **Migration:** Add adapter layer that queries both sources during transition

#### Trigger Correlation
- **Current:** Queries dailyEntries for triggers and symptoms
- **New:** Query triggerEvents + symptomInstances
- **Migration:** Adapter layer for backward compatibility

#### Photo Attachments
- **Current:** Links to dailyEntryId
- **New:** Links to specific eventId (symptomInstance, flare, etc.)
- **Migration:** Add optional eventId field, keep dailyEntryId for legacy

#### Body Mapping
- **Current:** Links to dailyEntryId
- **New:** Links to flareId or symptomInstanceId
- **Migration:** Make dailyEntryId optional, add flareId/symptomInstanceId

#### Export/Import
- **Current:** Exports dailyEntries as CSV/JSON
- **New:** Export event stream (all event types)
- **Migration:** Support both formats, allow user to choose

---

## Implementation Phases

### Phase 1: Design & Validation (Week 1-2)
- [x] Complete design thinking session ✅
- [ ] Create high-fidelity mockups (Figma/Sketch)
- [ ] Validate with 2-3 HS patients
- [ ] Document edge cases
- [ ] **Deliverable:** Validated mockups + user feedback

### Phase 2: Database Migration (Week 3-4)
- [ ] Implement medicationEvents table
- [ ] Implement triggerEvents table
- [ ] Enhance flares table (severity tracking)
- [ ] Write migration scripts
- [ ] Test migration with sample data
- [ ] **Deliverable:** Version 10 database schema

### Phase 3: Core Components (Week 5-7)
- [ ] Build QuickLogButtons
- [ ] Build ActiveFlareCards
- [ ] Build TimelineView
- [ ] Build FlareCreationModal
- [ ] Build FlareUpdateModal
- [ ] Build MedicationLogModal
- [ ] Build SymptomLogModal
- [ ] Build TriggerLogModal
- [ ] Build EventDetailModal
- [ ] **Deliverable:** All 9 new components

### Phase 4: Repositories & Services (Week 6-7)
- [ ] Create medicationEventRepository
- [ ] Create triggerEventRepository
- [ ] Enhance flareRepository (update/resolve methods)
- [ ] Create timelineService (aggregate events)
- [ ] Update exportService for event stream
- [ ] **Deliverable:** Data layer complete

### Phase 5: Integration (Week 8-9)
- [ ] Integrate new home screen
- [ ] Connect analytics to event stream
- [ ] Connect trigger correlation to events
- [ ] Add medication timing warnings
- [ ] Add smart note suggestions
- [ ] Update export/import for events
- [ ] **Deliverable:** Fully integrated system

### Phase 6: Testing (Week 9-10)
- [ ] Unit tests for all repositories (80% coverage)
- [ ] Integration tests for event flows
- [ ] E2E tests for critical paths
- [ ] Performance testing (timeline with 1000+ events)
- [ ] Migration testing (real data)
- [ ] **Deliverable:** Test suite passing

### Phase 7: User Testing (Week 10-11)
- [ ] Recruit 5-7 HS patients
- [ ] Task-based testing sessions
- [ ] Measure: Speed, errors, satisfaction
- [ ] Collect qualitative feedback
- [ ] Iterate on findings
- [ ] **Deliverable:** User test report

### Phase 8: Launch (Week 11-12)
- [ ] Soft launch to 10% of users
- [ ] Monitor analytics and errors
- [ ] Address critical issues
- [ ] Gradual rollout to 50%, then 100%
- [ ] Documentation updates
- [ ] **Deliverable:** Live in production

---

## Success Metrics

### Speed (Primary Goal)
- Medication logging: <5 sec (target: 2-3 sec)
- Symptom logging: <10 sec (target: 3-5 sec)
- Flare logging: <20 sec (target: 10-15 sec)
- Flare update: <10 sec (target: 5-10 sec)

### User Satisfaction
- "Easy to log" rating: >4.5/5
- Daily active usage: >70% log ≥1 event/day
- Feature abandonment: <10%
- NPS: >8/10

### Behavioral
- Quick-log usage: >80% of events
- Progressive disclosure: >60% add details later
- Active flare updates: >3 per flare
- Timeline engagement: >50% tap to view details

### Technical
- Home load time: <1 sec
- Timeline scroll: 60fps with 100+ events
- Event creation: <200ms latency
- Offline support: 100% of quick-logs work offline

---

## Risks & Mitigation

### Risk 1: ~~Data Migration Fails~~ (NOT APPLICABLE - 0 Users)
- **Status:** ✅ ELIMINATED - No users = no migration risk
- **Approach:** Clean slate schema redesign
- **Benefit:** Can optimize schema without backward compatibility constraints

### Risk 2: ~~Users Don't Understand New Model~~ (REDUCED - 0 Users)
- **Status:** ✅ REDUCED - No existing users to confuse
- **Approach:** Design onboarding for new model from day 1
- **Mitigation:**
  - First-time user walkthrough
  - Example data showing best practices
  - In-context help tooltips

### Risk 3: Performance Issues (Large Timelines)
- **Impact:** Slow scrolling, laggy UI
- **Mitigation:**
  - Virtual scrolling for timeline
  - Pagination (load more on scroll)
  - Optimize queries with proper indexes
  - Performance testing with 1000+ events

### Risk 4: Breaking Existing Features
- **Impact:** Analytics, exports, photos broken
- **Mitigation:**
  - Update all feature queries to new event model
  - Comprehensive integration tests
  - **CRITICAL:** Update DevDataControls to generate test data for new schema
  - Regression testing suite

---

## Design Decisions (RESOLVED)

1. **End-of-Day Prompt:** ✅ No automatic prompt - User must manually add reflection when desired
2. **Timeline Pagination:** ✅ Today only (1 day) - "Load previous day" button at bottom
3. **Flare Severity Scale:** ✅ 1-10 slider (continuous, granular tracking)
4. **Medication Timing Window:** ✅ ±2 hours window (moderate - warns if outside schedule)
5. **Quick-Log Button Placement:** ✅ Top section below Active Flares (always visible)
6. **Migration Strategy:** ✅ Clean slate - 0 users = no migration needed, redesign schema from scratch
7. **Legacy Daily Entry Form:** ✅ Repurpose as "End of Day Reflection" at `/reflection` route (optional)

---

## 🎉 Simplified Approach: Zero Users = Clean Slate

**MAJOR ADVANTAGE:** With 0 users, we can redesign the database schema from scratch without migration complexity!

### What This Means:

✅ **No Migration Scripts** - Delete existing data, start fresh
✅ **No Backward Compatibility** - Optimize schema without constraints
✅ **No Gradual Rollout** - Deploy the new model immediately
✅ **No Adapter Layers** - Update features to use new schema directly
✅ **Faster Implementation** - Skip migration complexity (~2 weeks saved)

### Critical Action Items:

1. **Blow away current schema** - Fresh Version 1 of event-based model
2. **Update DevDataControls** - Generate test data for new schema
   - medicationEvents (sample logs)
   - triggerEvents (sample logs)
   - Enhanced flares with severity tracking
   - Timeline-friendly data distribution
3. **Update all queries** - Analytics, exports, correlations use new tables
4. **No legacy support** - Remove old dailyEntry-centric code paths

### Revised Timeline:

**Original:** 12 weeks (with migration complexity)
**New:** 8-10 weeks (clean slate approach)

**Time Saved:**
- Week 3-4: No migration scripts needed (was 2 weeks, now 0)
- Week 8-9: No backward compatibility testing (save ~1 week)
- Week 10-11: No existing user confusion (simpler onboarding)

---

## Next Steps

**Immediate (This Week):**
1. Review this spec with stakeholders
2. Create high-fidelity mockups
3. Set up user testing sessions
4. Answer open questions

**Next Week:**
1. Start Phase 2 (database migration)
2. Write migration scripts
3. Test with sample data

---

**Document Status:** Draft v1.0
**Last Updated:** 2025-10-13
**Owner:** Steven
**Reviewers:** TBD
