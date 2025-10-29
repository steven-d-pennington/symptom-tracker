# Story 3.5.5: Redesign Trigger & Medication Logging (Modals → Pages)

Status: ready-for-dev

**Priority:** HIGH
**Points:** 5

## Story

As a user tracking triggers and medications,
I want dedicated pages for each logging type,
So that I can use the same improved patterns as symptom and food logging.

## Acceptance Criteria

1. **AC3.5.5.1 — Trigger logging opens as dedicated page:** Create trigger logging page at `/log/trigger` route following patterns from Stories 3.5.3 and 3.5.4, dashboard "Log Trigger" button navigates to page, full-screen layout with natural scrolling, mobile-first responsive design, implements collapsible categories with smart defaults (if triggers have categories), follows same quick log + add details pattern. [Source: docs/epics.md#Story-3.5.5]

2. **AC3.5.5.2 — Medication logging opens as dedicated page:** Create medication logging page at `/log/medication` route following established patterns, dashboard "Log Medication" button navigates to page, supports both medications and treatments (warm compress, ice pack, etc.), groups by type if applicable (medications, treatments, self-care), same quick log + add details pattern as other logging types. [Source: docs/epics.md#Story-3.5.5]

3. **AC3.5.5.3 — Collapsible categories for triggers:** Trigger categories: Environmental (heat, humidity, weather), Physical (friction, exercise, sweat), Emotional (stress, anxiety), Lifestyle (sleep, diet), custom triggers prominently displayed at top, favorites and recents sections if user has usage history, remaining categories collapsed by default, expansion state persisted to localStorage. [Source: docs/epics.md#Story-3.5.5]

4. **AC3.5.5.4 — Collapsible categories for medications:** Medication/treatment categories: Pain Relief, Anti-inflammatory, Antibiotics, Topical Treatments, Self-Care (compress, rest, drainage), custom medications/treatments at top, favorites and recents if applicable, categories collapsed by default with smart expansion. [Source: docs/epics.md#Story-3.5.5]

5. **AC3.5.5.5 — Quick log mode for both types:** Trigger quick log captures: trigger selection, severity/intensity (optional), timestamp, "Add Details" expands to show notes and related data links, Medication quick log captures: medication/treatment selection, dosage/duration (optional), timestamp, "Add Details" expands to show notes, effectiveness rating, side effects. [Source: docs/epics.md#Story-3.5.5]

6. **AC3.5.5.6 — Settings allow disabling defaults:** Users can disable default triggers and medications they don't use from Settings > Manage Data page, disabled defaults excluded from logging interfaces via `where({ isActive: true })` query filter, disabled items can be re-enabled at any time, custom items can be edited or deleted normally. [Source: docs/epics.md#Story-3.5.5]

7. **AC3.5.5.7 — Mobile responsive for both pages:** Both pages optimized for 320px width minimum, 44x44px minimum touch targets for all interactive elements, category headers and item selections touch-friendly, keyboard opens without breaking layout, natural scrolling without nested containers, tested on iOS Safari and Android Chrome. [Source: docs/epics.md#Story-3.5.5]

## Tasks / Subtasks

- [ ] Task 1: Create trigger logging page (AC: #3.5.5.1, #3.5.5.3, #3.5.5.5)
  - [ ] 1.1: Create `src/app/(protected)/log/trigger/page.tsx`
  - [ ] 1.2: Implement page structure following food logging pattern (Story 3.5.4)
  - [ ] 1.3: Create trigger categories: Environmental, Physical, Emotional, Lifestyle
  - [ ] 1.4: Implement collapsible category components
  - [ ] 1.5: Add custom triggers section at top
  - [ ] 1.6: Build quick log form with add details expansion
  - [ ] 1.7: Update dashboard button navigation

- [ ] Task 2: Create medication logging page (AC: #3.5.5.2, #3.5.5.4, #3.5.5.5)
  - [ ] 2.1: Create `src/app/(protected)/log/medication/page.tsx`
  - [ ] 2.2: Implement page structure following established patterns
  - [ ] 2.3: Create medication categories: Pain Relief, Anti-inflammatory, Antibiotics, Topical, Self-Care
  - [ ] 2.4: Implement collapsible categories
  - [ ] 2.5: Add custom medications/treatments section
  - [ ] 2.6: Build quick log form with medication-specific fields (dosage, effectiveness)
  - [ ] 2.7: Update dashboard button navigation

- [ ] Task 3: Implement Settings integration (AC: #3.5.5.6)
  - [ ] 3.1: Update Settings > Manage Data page to show triggers section
  - [ ] 3.2: Add disable/enable buttons for default triggers
  - [ ] 3.3: Update trigger queries to filter `where({ isActive: true })`
  - [ ] 3.4: Update Settings > Manage Data page to show medications section
  - [ ] 3.5: Add disable/enable buttons for default medications
  - [ ] 3.6: Update medication queries to filter by isActive

- [ ] Task 4: Mobile optimization (AC: #3.5.5.7)
  - [ ] 4.1: Test both pages on 320px width
  - [ ] 4.2: Verify touch targets meet 44x44px minimum
  - [ ] 4.3: Test category interactions on touch devices
  - [ ] 4.4: Test keyboard behavior
  - [ ] 4.5: Test on iOS and Android

- [ ] Task 5: Add comprehensive tests (AC: All)
  - [ ] 5.1: Test trigger logging page: categories, quick log, details
  - [ ] 5.2: Test medication logging page: categories, quick log, details
  - [ ] 5.3: Test Settings disable/enable functionality
  - [ ] 5.4: Test mobile responsive layouts
  - [ ] 5.5: Integration tests for full logging flows

## Dev Notes

### Architecture Context

- **Completes Modal Redesign:** Final story completing modal-to-page migration for all logging types. Consistent UX across symptoms, foods, triggers, and medications. [Source: docs/epics.md#Epic-3.5]
- **Reuses Established Patterns:** Follows category organization from Story 3.5.4 and quick log pattern from Story 3.5.3. Minimal new UI patterns needed. [Source: docs/epics.md#Story-3.5.3-4]
- **Settings Integration:** Connects to Story 3.5.1 default data management. Users can customize which defaults appear in logging interfaces. [Source: docs/epics.md#Story-3.5.1]

### Implementation Guidance

**Reuse Components:**
- Category component from Story 3.5.4 (adapt for triggers/medications)
- Quick log pattern from Story 3.5.3 (adapt field types)
- Toast notifications from Story 3.5.3
- Page layout structure from Stories 3.5.3-4

### Project Structure Notes

**New Files:**
- `src/app/(protected)/log/trigger/page.tsx`
- `src/app/(protected)/log/medication/page.tsx`
- `src/components/trigger-logging/TriggerQuickLogForm.tsx`
- `src/components/medication-logging/MedicationQuickLogForm.tsx`

**Modified Files:**
- Dashboard component - Update trigger and medication buttons
- Settings > Manage Data page - Add disable/enable functionality

### References

- [Source: docs/epics.md#Story-3.5.5] - Complete story specification
- [Source: docs/epic-3.5-production-ux.md] - Epic 3.5 overview

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-29 | Initial story creation from Epic 3.5 breakdown | Dev Agent (claude-sonnet-4-5) |
