# Event Stream Redesign - Kickoff Plan

**Date:** 2025-10-13
**Timeline:** 8-10 weeks (simplified - 0 users = no migration)
**Status:** Ready to begin

---

## ✅ Decisions Made

All design decisions finalized:
1. No automatic end-of-day prompt
2. Timeline shows today only (load more on scroll)
3. Flare severity: 1-10 slider
4. Medication timing: ±2 hour warning window
5. Quick-log buttons: Top section (below active flares)
6. Migration: Clean slate (blow away schema)
7. Legacy form: Repurpose as `/reflection` route

---

## 🎯 Phase 1: Database Schema (Week 1-2)

### Objective
Design and implement the new event-based database schema from scratch.

### Tasks

#### Task 1.1: Design New Schema
**Time:** 2-3 hours
**Output:** Updated schema definition

```typescript
// New schema structure (Version 1 of event model)

// EXISTING (Keep):
- users
- symptoms (definitions)
- medications (definitions)
- triggers (definitions)
- photoAttachments
- photoComparisons
- bodyMapLocations

// EXISTING (Enhance):
- flares → Add severity tracking, interventions

// NEW (Event tables):
- symptomEvents (replaces symptomInstances)
- medicationEvents (NEW)
- triggerEvents (NEW)

// EXISTING (Repurpose):
- dailyEntries → Becomes optional reflection
```

#### Task 1.2: Implement Schema Changes
**Files to modify:**
- `src/lib/db/schema.ts` - Add new types
- `src/lib/db/client.ts` - Update Dexie schema

**Action:** Create Version 1 of event-based schema (fresh start, no migrations)

#### Task 1.3: Create Repositories
**New files:**
- `src/lib/repositories/medicationEventRepository.ts`
- `src/lib/repositories/triggerEventRepository.ts`
- `src/lib/repositories/symptomEventRepository.ts` (or rename existing)

**Update:**
- `src/lib/repositories/flareRepository.ts` - Add update/severity methods

---

## 🎯 Phase 2: Developer Tools (Week 2)

### Objective
Update DevDataControls to generate realistic test data for the new event model.

### Tasks

#### Task 2.1: Update DevDataControls Component
**File:** `src/components/settings/DevDataControls.tsx`

**New test data generators:**

```typescript
// Generate realistic event stream
generateTestEvents(userId: string, days: number = 7) {
  // Generate 3-5 events per day
  // Mix of: medication events, symptom events, trigger events
  // Create 1-2 active flares
  // Distribute events throughout each day (8am-10pm)
  // Add severity progression to flares
}

// Example distribution per day:
// 8:00am - Medication (Humira)
// 2:30pm - Flare update (severity 7→8)
// 7:15pm - Trigger (ate dairy)
// 9:45pm - Symptom (headache)
```

#### Task 2.2: Create Seed Data Presets
**Presets:**
- "First Day" - Minimal data (onboarding test)
- "One Week" - 7 days of events
- "Heavy User" - 30 days, multiple flares
- "Edge Cases" - Unusual patterns for testing

---

## 🎯 Phase 3: Core Components (Week 3-5)

### Objective
Build the 9 new UI components that power the event stream model.

### Task 3.1: Quick-Log System (Week 3)

**Priority Order:**
1. **QuickLogButtons** (2-3 hours)
   - Simple button grid
   - Opens appropriate modal

2. **MedicationLogModal** (4-6 hours)
   - List of scheduled meds
   - Checkboxes
   - Timing warnings
   - Smart note suggestions

3. **SymptomLogModal** (3-4 hours)
   - Recent symptoms first
   - One-tap logging
   - Optional detail expansion

4. **TriggerLogModal** (3-4 hours)
   - Common triggers
   - Intensity selector
   - Optional notes

### Task 3.2: Flare Management (Week 4)

**Priority Order:**
1. **FlareCreationModal** (8-10 hours) - MOST COMPLEX
   - Compact body map integration
   - Severity slider
   - Progressive disclosure

2. **FlareUpdateModal** (4-6 hours)
   - Show previous severity
   - Quick status buttons
   - Intervention options

3. **ActiveFlareCards** (4-6 hours)
   - Card list display
   - Update/Resolve buttons
   - Severity trends (↑↓→)

### Task 3.3: Timeline & Display (Week 5)

**Priority Order:**
1. **TimelineView** (6-8 hours)
   - Chronological event feed
   - Group by day
   - Expand/collapse details
   - "Load previous day" button

2. **EventDetailModal** (4-6 hours)
   - Progressive disclosure
   - Add photos, notes, context
   - Link related events

---

## 🎯 Phase 4: Home Screen Integration (Week 6)

### Objective
Integrate all components into the new home/dashboard experience.

### Task 4.1: Redesign Dashboard
**File:** `src/app/(protected)/dashboard/page.tsx`

**New Layout:**
```
┌─────────────────────────────┐
│ Active Flares (0-5)         │  ← ActiveFlareCards
├─────────────────────────────┤
│ Quick Log:                  │  ← QuickLogButtons
│ [🔥 Flare] [💊 Med]        │
│ [😣 Symptom] [⚠️ Trigger]   │
├─────────────────────────────┤
│ Today's Timeline            │  ← TimelineView
│ ├─ 8:00am 💊 Humira        │
│ ├─ 2:14pm 🔥 Right armpit  │
│ └─ 8:43pm ⚠️ Ate dairy     │
│                             │
│ [Load previous day]         │
└─────────────────────────────┘
```

### Task 4.2: Repurpose Daily Log
**File:** `src/app/(protected)/log/page.tsx`

**Options:**
- Redirect to dashboard with message
- OR: Repurpose as `/reflection` page

### Task 4.3: Create Reflection Page (Optional)
**File:** `src/app/(protected)/reflection/page.tsx`
- End-of-day summary form
- Mood, sleep quality, overall notes
- NOT required, just available

---

## 🎯 Phase 5: Feature Updates (Week 7)

### Objective
Update existing features to consume event stream data.

### Task 5.1: Analytics Dashboard
**File:** `src/lib/services/TrendAnalysisService.ts`

**Changes:**
- Query `symptomEvents` instead of `dailyEntries.symptoms`
- Query `flares` for flare-specific trends
- Aggregate event data by day/week/month

### Task 5.2: Trigger Correlation
**Files:**
- `src/components/triggers/TriggerCorrelationDashboard.tsx`
- Correlation service

**Changes:**
- Query `triggerEvents` + `symptomEvents`
- Maintain correlation algorithm
- Update visualization

### Task 5.3: Export/Import
**File:** `src/lib/services/exportService.ts`

**Changes:**
- Export event stream (all event types)
- CSV: One row per event
- JSON: Structured by event type
- Include flare progression history

---

## 🎯 Phase 6: Testing & Polish (Week 8-9)

### Task 6.1: Unit Tests
- All repositories (80% coverage)
- Event creation/update logic
- Timeline aggregation

### Task 6.2: Integration Tests
- Quick-log flows (end-to-end)
- Flare lifecycle (create → update → resolve)
- Timeline rendering with 100+ events

### Task 6.3: Manual Testing
- Use DevDataControls to generate varied scenarios
- Test all quick-log flows
- Verify timeline performance
- Check analytics with event data

### Task 6.4: Polish
- Loading states
- Error handling
- Empty states ("No events today yet")
- Onboarding for first-time users

---

## 🎯 Phase 7: Launch (Week 10)

### Task 7.1: Final Review
- [ ] All tests passing
- [ ] Performance targets met (<1s load, 60fps scroll)
- [ ] DevDataControls generates good test data
- [ ] Analytics working with new data
- [ ] Export/import functional

### Task 7.2: Documentation
- [ ] Update README with new flow
- [ ] Update API_REFERENCE if needed
- [ ] Document event schema

### Task 7.3: Deploy
- [ ] Clear local IndexedDB (blow away old schema)
- [ ] Deploy to production
- [ ] Monitor for errors

---

## 📋 Week 1 Action Items (THIS WEEK)

### Day 1-2: Database Schema
- [ ] Design new schema types (medicationEvents, triggerEvents, enhanced flares)
- [ ] Update `src/lib/db/schema.ts`
- [ ] Update `src/lib/db/client.ts` (Version 1 - clean slate)
- [ ] Test database initialization

### Day 3-4: Repositories
- [ ] Create medicationEventRepository
- [ ] Create triggerEventRepository
- [ ] Update flareRepository (add update/severity methods)
- [ ] Write basic CRUD tests

### Day 5: DevDataControls
- [ ] Update test data generator for event model
- [ ] Create realistic event distribution
- [ ] Test with generated data
- [ ] Verify timeline-friendly data

**Deliverable by end of Week 1:** New database schema + working test data generator

---

## 🚀 Ready to Start?

You're now set up to begin implementation. The decisions are made, the plan is clear, and with 0 users you have maximum flexibility.

**Recommended Starting Point:**
1. Start with database schema (Task 1.1-1.2)
2. Then DevDataControls (Task 2.1) so you can test as you build
3. Then tackle components in priority order

**Estimated Total Time:** 8-10 weeks part-time, or 4-6 weeks full-time

---

**Questions?** Refer back to:
- `docs/event-stream-redesign-spec.md` - Full technical spec
- `docs/design-thinking-2025-10-13.md` - Design research & rationale
