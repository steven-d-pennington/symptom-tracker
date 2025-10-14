# Story 2.6: Event Detail Modal for Progressive Disclosure

Status: Ready

## Story

As a user who quick-logged an event,
I want to add additional context later when I have time,
so that I can capture comprehensive data without slowing down initial logging.

## Acceptance Criteria

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

## Tasks / Subtasks

- [ ] Create EventDetailModal component (AC: 1,2)
  - [ ] Set up `src/components/timeline/EventDetailModal.tsx`
  - [ ] Display event summary with icon, time, name
  - [ ] Handle modal open/close state
  - [ ] Receive event data as props

- [ ] Implement dynamic form based on event type (AC: 3)
  - [ ] Switch case for medication/symptom/trigger/flare
  - [ ] Medication fields: dosage override, detailed notes
  - [ ] Symptom fields: severity slider, body location, trigger links, notes
  - [ ] Trigger fields: intensity selector, suspected cause, notes
  - [ ] Flare fields: photo attachment, additional notes

- [ ] Add photo attachment (AC: 4)
  - [ ] "Add photo" button
  - [ ] Integrate with existing photoAttachments table
  - [ ] Link photos via eventId
  - [ ] Display attached photos with preview

- [ ] Implement event linking (AC: 5)
  - [ ] Query events from same day
  - [ ] Show suggestions for related triggers/symptoms
  - [ ] Allow user to link events

- [ ] Add rich text notes (AC: 6)
  - [ ] Use simple markdown parser (marked or react-markdown)
  - [ ] Support bold, lists, basic formatting
  - [ ] Preview rendered markdown

- [ ] Implement save and delete (AC: 7,8)
  - [ ] [Save] button calls appropriate repository.update()
  - [ ] [Delete Event] button with confirmation dialog
  - [ ] Handle deletion from respective repository

## Dev Notes

**Technical Approach:**
- Create `src/components/timeline/EventDetailModal.tsx`
- Dynamic form: switch on event.type
- Integrate with existing photoAttachments table
- Use markdown parser for rich text notes

**Photo Integration:**
- Reuse existing photo attachment infrastructure from Phase 2
- Link photos to events via eventId field
- Display thumbnails with full-size preview

**Event Linking:**
- Query all events from same day (24h window)
- Show as suggestions filtered by type
- Store link references in event record

**UI/UX Considerations:**
- Progressive disclosure: show only relevant fields per event type
- Rich text notes allow detailed context without complex UI
- Delete confirmation prevents accidental data loss

### Project Structure Notes

**Component Location:**
- Directory: `src/components/timeline/`
- Main component: `EventDetailModal.tsx`

**Dependencies:**
- All event repositories for update/delete operations
- Existing photoAttachments table and components
- Markdown parser library (marked or react-markdown)
- Event linking logic

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 2.6]
- [Photo System: Phase 2 photo attachment infrastructure]
- [Repositories: All event repositories]
- Time Estimate: 8-10 hours

## Dev Agent Record

### Context Reference

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
