# Story 3.5: Repurpose Daily Log Page as Optional Reflection

Status: TODO

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

- [ ] Decide on approach (AC: 1,5)
  - [ ] Option A: Simplified reflection form
  - [ ] Option B: Redirect to dashboard with informational banner
  - [ ] Get stakeholder (Steven) input on preferred approach

- [ ] Option A: Implement simplified reflection form (AC: 1,2,3,6,7)
  - [ ] Update `src/app/(protected)/log/page.tsx`
  - [ ] Remove symptom/medication/trigger sections
  - [ ] Keep only: mood slider (1-5), sleep quality slider (1-5), notes textarea
  - [ ] Add prominent message: "Optional - Events are your primary logs"
  - [ ] Save to dailyEntries table
  - [ ] Update navigation label to "Daily Reflection" or "End-of-Day Notes"

- [ ] Option B: Redirect to dashboard (AC: 5)
  - [ ] Update `src/app/(protected)/log/page.tsx` to redirect to dashboard
  - [ ] Show informational banner: "Log events as they happen from quick-log buttons"
  - [ ] Consider adding optional "Reflection" link to navigation
  - [ ] Preserve dailyEntries table for those who want to use it manually

- [ ] Preserve backward compatibility (AC: 7)
  - [ ] Keep dailyEntries table structure unchanged
  - [ ] Ensure old reflection entries still accessible
  - [ ] Allow users who prefer daily summaries to continue using them

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

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
