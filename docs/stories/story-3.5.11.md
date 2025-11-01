# Story 3.5.11: Fix Dashboard Symptom/Trigger Logging Display and Save Issues

Status: ContextReadyDraft

## Story

As a user logging symptoms and triggers from the dashboard,
I want my logged data to save correctly and display immediately in the timeline,
So that I can see my logged entries and verify they were saved successfully.

## Acceptance Criteria

1. Symptom logging from `/log/symptom` saves data correctly to IndexedDB
2. Trigger logging from `/log/trigger` saves data correctly to IndexedDB
3. After logging a symptom or trigger, the dashboard timeline refreshes and displays the newly logged entry
4. The refresh flag (`?refresh=symptom` or `?refresh=trigger`) in the dashboard URL properly triggers timeline reload
5. Timeline component properly queries and displays all logged symptoms and triggers from IndexedDB
6. Newly logged data appears in the timeline within 1 second of navigation back to dashboard
7. Manual dashboard refresh button also correctly reloads and displays all timeline data
8. Console errors related to data loading or display are resolved
9. Data persistence verified across page reloads (data still visible after refresh)

## Tasks / Subtasks

- [ ] Task 1 (AC: #1, #2): Verify symptomInstanceRepository and triggerEventRepository save methods are working correctly
  - [ ] Add debug logging to save operations
  - [ ] Test save operations in browser console to confirm IndexedDB writes
  - [ ] Check for any errors during save that are being silently caught
- [ ] Task 2 (AC: #3, #4, #5): Debug timeline refresh and data loading
  - [ ] Verify TimelineView component receives the refreshKey prop change
  - [ ] Check if TimelineView is properly querying IndexedDB for new data
  - [ ] Ensure timeline query includes both symptoms and triggers
  - [ ] Add console logging to track refresh trigger and data reload
- [ ] Task 3 (AC: #6): Fix any race conditions or timing issues
  - [ ] Verify data is committed to IndexedDB before navigation
  - [ ] Check if timeline queries IndexedDB before save completes
  - [ ] Add proper async/await handling if needed
- [ ] Task 4 (AC: #7): Verify manual refresh functionality
  - [ ] Test manual refresh button on dashboard
  - [ ] Ensure refreshKey increment triggers proper timeline reload
- [ ] Task 5 (AC: #8, #9): Testing and verification
  - [ ] Test symptom logging → dashboard flow on multiple devices
  - [ ] Test trigger logging → dashboard flow on multiple devices
  - [ ] Verify data persists after browser reload
  - [ ] Check browser console for any errors
  - [ ] Test on mobile device (iPhone) to verify IndexedDB persistence

## Dev Notes

This is a critical regression affecting the core logging workflow from the dashboard.

**Potential Root Causes:**
1. **Timeline not refreshing**: The refreshKey mechanism might not be triggering a proper re-query of IndexedDB
2. **Race condition**: Navigation might happen before IndexedDB transaction completes
3. **Query issue**: Timeline might not be querying for the correct date range or filtering out recent data
4. **IndexedDB transaction**: Save operations might be failing silently without proper error handling

**Key Files to Investigate:**
- `src/app/(protected)/dashboard/page.tsx` - Dashboard refresh handling (lines 34-41)
- `src/components/timeline/TimelineView.tsx` - Timeline data loading
- `src/components/symptom-logging/SymptomQuickLogForm.tsx` - Symptom save and navigation (lines 129-155)
- `src/components/trigger-logging/TriggerQuickLogForm.tsx` - Trigger save and navigation (line 264)
- `src/lib/repositories/symptomInstanceRepository.ts` - Symptom save implementation
- `src/lib/repositories/triggerEventRepository.ts` - Trigger save implementation

**Testing Approach:**
1. Add console.log statements to track the full flow: save → navigation → refresh → query → display
2. Use browser DevTools to inspect IndexedDB directly and verify data is being written
3. Check Network tab for any unexpected requests that might interfere
4. Test the exact user flow: Dashboard → Quick Action Button → Log Page → Fill Form → Save → Return to Dashboard

### Project Structure Notes

All required files exist in the codebase. Changes will be limited to:
- Timeline component data loading logic
- Potential timing adjustments in logging form navigation
- Repository save operation error handling

### References

- Dashboard Page: `src/app/(protected)/dashboard/page.tsx`
- Symptom Logging: `src/components/symptom-logging/SymptomQuickLogForm.tsx`
- Trigger Logging: `src/components/trigger-logging/TriggerQuickLogForm.tsx`
- Timeline View: `src/components/timeline/TimelineView.tsx`
- Related Story: `docs/stories/story-3.5.3.md` (Symptom Logging Page)
- Related Story: `docs/stories/story-3.5.5.md` (Trigger Logging Page)

## Dev Agent Record

### Context Reference

- docs/stories/story-context-3.5.11.xml

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
