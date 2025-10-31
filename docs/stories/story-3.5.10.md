# Story 3.5.10: CRITICAL: Calendar page crashes on loading data

Status: ContextReadyDraft

## Story

As a user,
I want to view the calendar without the application crashing,
so that I can review my historical data.

## Acceptance Criteria

1. The `/calendar` page loads and displays successfully, even with symptom records that have an undefined `severityScale`.
2. The application does not throw a `SyntaxError: "undefined" is not valid JSON` error during data loading.
3. The `recordToSymptom` function in `symptomInstanceRepository.ts` includes a check to ensure `severityScale` is not `undefined` before attempting to parse it.

## Tasks / Subtasks

- [ ] Task 1 (AC: #1, #3): Modify `recordToSymptom` in `src/lib/repositories/symptomInstanceRepository.ts` to add a conditional check for `record.severityScale` before parsing.
- [ ] Task 2 (AC: #2): Add a unit test to a relevant test file to verify that `recordToSymptom` correctly handles a record with an undefined `severityScale`.
- [ ] Task 3 (AC: #1): Manually test the `/calendar` page with a mix of old and new data to confirm the fix.

## Dev Notes

This is a critical regression fix for Story 3.5.7.

The root cause is an unconditional `JSON.parse(record.severityScale)` call in the `recordToSymptom` function. This fails when older data without a `severityScale` value is loaded from the database.

The fix is to add a ternary operator to protect the parser, consistent with how `triggers` and `photos` are handled in the same function:
`severityScale: record.severityScale ? JSON.parse(record.severityScale) : undefined`

### Project Structure Notes

- The required change is in an existing file: `src/lib/repositories/symptomInstanceRepository.ts`.
- A new unit test should be added to the corresponding test file to prevent future regressions.

### References

- Source File: `src/lib/repositories/symptomInstanceRepository.ts`
- Related Story: `docs/stories/story-3.5.7.md`

## Dev Agent Record

### Context Reference

- docs/stories/story-context-3.5.10.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
