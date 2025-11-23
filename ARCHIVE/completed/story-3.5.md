# Story 3.5: Repurpose Daily Log Page as Optional Reflection

Status: Complete

## Story

As a user who wants to add end-of-day context,
I want to access an optional reflection form,
so that I can capture overall mood, sleep quality, and daily notes without it being required.

## Acceptance Criteria

1. Daily log page `/log` repurposed as end-of-day reflection (optional)
2. Shows simplified form: mood (1-5 scale), sleep quality (1-5 scale), overall notes textarea
3. Event stream remains primary: reflection is supplemental context
4. No prompt or reminder to fill out reflection (user must navigate manually)
5. Alternative: redirect `/log` to dashboard with banner: "Log events as they happen from quick-log buttons"
6. If reflection form kept, it's accessible via navigation: "Daily Reflection" or "End-of-Day Notes"
7. Reflection entries stored in dailyEntries table (reuse existing structure, keep for backward compatibility)

## Tasks / Subtasks

- [x] Decide on approach (AC: 1,5)
  - [x] Option A: Simplified reflection form
  - [ ] Option B: Redirect to dashboard with informational banner
  - [x] Get stakeholder (Steven) input on preferred approach (DECISION: Option A selected)

- [x] Option A: Implement simplified reflection form (AC: 1,2,3,6,7)
  - [x] Update `src/app/(protected)/log/page.tsx`
  - [x] Remove symptom/medication/trigger sections
  - [x] Keep only: mood slider (1-5), sleep quality slider (1-5), notes textarea
  - [x] Add prominent message: "Optional - Events are your primary logs"
  - [x] Save to dailyEntries table
  - [x] Update navigation label to "Daily Reflection"

- [ ] Option B: Redirect to dashboard (AC: 5) [NOT IMPLEMENTED - Option A selected]
  - [ ] Update `src/app/(protected)/log/page.tsx` to redirect to dashboard
  - [ ] Show informational banner: "Log events as they happen from quick-log buttons"
  - [ ] Consider adding optional "Reflection" link to navigation
  - [ ] Preserve dailyEntries table for those who want to use it manually

- [x] Preserve backward compatibility (AC: 7)
  - [x] Keep dailyEntries table structure unchanged
  - [x] Ensure old reflection entries still accessible
  - [x] Allow users who prefer daily summaries to continue using them

## Dev Notes

**Decision Point:**
This story requires a decision from stakeholder (Steven) on which approach to take:

**Option A: Simplified Reflection Form**
- Pros: Preserves optional daily reflection capability
- Pros: Users can add end-of-day context (mood, sleep, overall notes)
- Cons: Adds another page to maintain
- Implementation: ~3-4 hours

**Option B: Redirect to Dashboard**
- Pros: Simplifies app navigation
- Pros: Reinforces event stream as primary model
- Cons: Removes daily reflection capability entirely
- Implementation: ~2-3 hours

**Recommendation:**
Option A (Simplified Reflection Form) preserves flexibility for users who want end-of-day journaling while clearly marking it as optional and supplemental to event stream data.

**Technical Approach (Option A):**
- Update page to show only mood/sleep/notes
- Remove all event-related sections
- Add prominent "Optional" messaging
- Continue using dailyEntries table
- Update navigation to "Daily Reflection"

**Technical Approach (Option B):**
- Redirect /log to /dashboard
- Show informational banner on first visit
- Optionally add "Reflection" link to navigation
- Keep dailyEntries table for backward compatibility

### Project Structure Notes

**Files to Update:**
- `src/app/(protected)/log/page.tsx` (main update)
- Navigation components (if changing label or adding new link)

**Dependencies:**
- Existing dailyEntries table (preserve for backward compatibility)
- Dashboard page (if implementing redirect)

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 3.5]
- [Page: src/app/(protected)/log/page.tsx]
- [Decision Needed: Confirm with stakeholder which approach to take]
- Time Estimate: 4-5 hours

## Dev Agent Record

### Context Reference

- docs/stories/story-context-3.5.xml (generated 2025-10-15)

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

**Implementation Summary (2025-10-15):**
- Implemented Option A: Simplified Reflection Form
- Created clean, focused UI with only mood (1-5), sleep quality (1-5), and notes
- Added prominent "Optional Daily Reflection" banner to clarify supplemental nature
- Updated navigation from "Daily Log" to "Daily Reflection"
- Preserved full backward compatibility with dailyEntries table
- Form loads existing daily reflection and updates/creates entries as needed
- All acceptance criteria met

**Technical Details:**
- Replaced complex DailyEntryForm with simple, standalone component
- Used dailyEntryRepository for data persistence
- Preserved all existing fields (symptoms, medications, triggers) when saving
- Implemented auto-load of today's reflection on page visit
- Added loading states and save confirmation feedback

**Testing:**
- Created comprehensive test suite with 30 test cases
- Tests cover: rendering, form interactions, data loading, saving, accessibility
- All core functionality validated through automated tests

### Completion Notes List

### File List

**Modified:**
- `src/app/(protected)/log/page.tsx` - Replaced complex daily log with simplified reflection form
- `src/components/navigation/Sidebar.tsx` - Updated nav label from "Daily Log" to "Daily Reflection"

**Created:**
- `src/app/(protected)/log/__tests__/page.test.tsx` - Comprehensive test suite for Daily Reflection page
