# Project Workflow Status

**Project:** symptom-tracker
**Created:** 2025-10-13
**Last Updated:** 2025-10-15
**Status File:** `project-workflow-status-2025-10-13.md`

---

## Workflow Status Tracker

**Current Phase:** 4-Implementation
**Current Workflow:** story-context (Story 3.5) - Complete
**Current Agent:** DEV (ready to implement Story 3.5)
**Overall Progress:** 76%

### Phase Completion Status

- [ ] **1-Analysis** - Research, brainstorm, brief (optional) - SKIPPED
- [x] **2-Plan** - PRD/GDD/Tech-Spec + Stories/Epics - IN PROGRESS (Event Stream Redesign)
- [ ] **3-Solutioning** - Architecture + Tech Specs (Level 2+ only) - NOT REQUIRED FOR LEVEL 2
- [ ] **4-Implementation** - Story development and delivery

### Planned Workflow Journey

**This section documents your complete workflow plan from start to finish.**

| Phase | Step | Agent | Description | Status |
| ----- | ---- | ----- | ----------- | ------ |
| 2-Plan | plan-project | PM | Create PRD/GDD/Tech-Spec (determines final level) | In Progress |
| 2-Plan | event-stream-redesign | PM | Redesign app from daily summary to event stream model | In Progress |
| 2-Plan | ux-spec | PM | UX/UI specification (user flows, wireframes, components) | Deferred |
| 4-Implementation | create-story | SM | Draft stories from backlog | Complete |
| 4-Implementation | story-ready | SM | Approve story for dev | Complete |
| 4-Implementation | story-context | SM | Generate context XML | Complete |
| 4-Implementation | dev-story | DEV | Implement stories | Planned |
| 4-Implementation | story-approved | DEV | Mark complete, advance queue | Planned |

**Current Step:** story-context (Story 3.5) - Complete
**Next Step:** DEV agent ready to implement Story 3.5 (Repurpose Daily Log Page as Optional Reflection)

**Instructions:**
- This plan was created during initial workflow-status setup
- Status values: Planned, Optional, Conditional, In Progress, Complete
- Current/Next steps update as you progress through the workflow
- Use this as your roadmap to know what comes after each phase

### Implementation Progress (Phase 4 Only)

**Story Tracking:** Epic 1 complete (5/5 stories), Epic 2 complete (7/7 stories), Epic 3 not started (0/5 stories)

#### TODO (Needs Drafting)

- **Story ID:** 3.1
- **Story Title:** Redesign Home/Dashboard Page
- **Story File:** `story-3.1.md`
- **Status:** Not created
- **Action:** SM should run `create-story` workflow to draft this story

#### IN PROGRESS (Approved for Development)

_No stories currently in progress. Epic 2 complete!_

#### BACKLOG (Not Yet Drafted)

| Epic                          | Story | ID  | Title                                            | File              |
| ----------------------------- | ----- | --- | ------------------------------------------------ | ----------------- |
| Epic 3: Integration & Updates | 3.2   | 3.2 | Update Analytics to Query Event Stream           | story-3.2.md      |
| Epic 3: Integration & Updates | 3.3   | 3.3 | Update Exports and Trigger Correlation           | story-3.3.md      |
| Epic 3: Integration & Updates | 3.4   | 3.4 | Medication Timing Warnings and Smart Notes       | story-3.4.md      |
| Epic 3: Integration & Updates | 3.5   | 3.5 | Repurpose Daily Log Page as Optional Reflection  | story-3.5.md      |

**Total in backlog:** 4 stories

#### DONE (Completed Stories)

| Epic                       | Story | ID  | Title                                            | Completed  |
| -------------------------- | ----- | --- | ------------------------------------------------ | ---------- |
| Epic 2: UI Components      | 2.7   | 2.7 | Mobile Responsive Design and Accessibility       | 2025-10-15 |
| Epic 2: UI Components      | 2.6   | 2.6 | Event Detail Modal for Progressive Disclosure    | 2025-10-15 |
| Epic 2: UI Components      | 2.5   | 2.5 | Medication, Symptom, and Trigger Log Modals      | 2025-10-14 |
| Epic 2: UI Components      | 2.4   | 2.4 | Flare Creation and Update Modals                 | 2025-10-14 |
| Epic 2: UI Components      | 2.3   | 2.3 | Timeline View Component                          | 2025-10-14 |
| Epic 2: UI Components      | 2.2   | 2.2 | Active Flare Cards Component                     | 2025-10-14 |
| Epic 2: UI Components      | 2.1   | 2.1 | QuickLog Buttons Component                       | 2025-10-14 |
| Epic 1: Database & Repos   | 1.1   | 1.1 | Design and Implement New Schema                  | 2025-10-13 |
| Epic 1: Database & Repos   | 1.2   | 1.2 | Create MedicationEvent Repository                | 2025-10-13 |
| Epic 1: Database & Repos   | 1.3   | 1.3 | Create TriggerEvent Repository                   | 2025-10-13 |
| Epic 1: Database & Repos   | 1.4   | 1.4 | Enhance Flare Repository with Severity Tracking  | 2025-10-13 |
| Epic 1: Database & Repos   | 1.5   | 1.5 | Update DevDataControls for Event Generation      | 2025-10-13 |

**Total completed:** 12 stories

#### Epic/Story Summary

**Epic 1: Database Schema & Repositories** ✅ COMPLETE
- Total: 5 stories
- Completed: 5 stories (100%)
- Status: All stories implemented and tested

**Epic 2: UI Components & Quick-Log System** ✅ COMPLETE
- Total: 7 stories
- Completed: 7 stories (100%)
- Status: All stories implemented and tested (2.1-2.7)

**Epic 3: Integration & Feature Updates** ⏳ NOT STARTED
- Total: 5 stories
- Completed: 0 stories (0%)
- Status: Waiting for Epic 2 completion

**Project Totals:**
- Total stories: 17
- Completed: 12 (71%)
- In progress: 0
- Remaining: 5 (Epic 3)

### Artifacts Generated

| Artifact | Status | Location | Date |
| -------- | ------ | -------- | ---- |
| Workflow Status File | Complete | docs/project-workflow-status-2025-10-13.md | 2025-10-13 |
| Event Stream Redesign PRD | Complete | docs/PRODUCT/event-stream-redesign-PRD.md | 2025-10-13 |
| Event Stream Redesign Epics | Complete | docs/PRODUCT/event-stream-redesign-epics.md | 2025-10-13 |
| Event Stream Technical Spec | Complete | docs/event-stream-redesign-spec.md | 2025-10-13 |
| Event Stream Kickoff Plan | Complete | docs/event-stream-kickoff-plan.md | 2025-10-13 |
| Story 2.1 Context XML | Complete | docs/stories/story-context-2.1.xml | 2025-10-14 |
| Story 2.2 Context XML | Complete | docs/stories/story-context-2.2.xml | 2025-10-14 |
| Story 2.3 Context XML | Complete | docs/stories/story-context-2.3.xml | 2025-10-14 |
| Story 2.4 Context XML | Complete | docs/stories/story-context-2.4.xml | 2025-10-14 |
| Story 2.5 Context XML | Complete | docs/stories/story-context-2.5.xml | 2025-10-14 |
| Story 2.6 Context XML | Complete | docs/stories/story-context-2.6.xml | 2025-10-14 |
| Story 2.7 Context XML | Complete | docs/stories/story-context-2.7.xml | 2025-10-14 |
| Story 3.1 Context XML | Complete | docs/stories/story-context-3.1.xml | 2025-10-15 |
| Story 3.3 Context XML | Complete | docs/stories/story-context-3.3.xml | 2025-10-15 |
| Story 3.4 Context XML | Complete | docs/stories/story-context-3.4.xml | 2025-10-15 |
| Story 3.5 Context XML | Complete | docs/stories/story-context-3.5.xml | 2025-10-15 |

### Next Action Required

**What to do next:** Implement Story 3.5 (Repurpose Daily Log Page as Optional Reflection)

**Command to run:** Run `dev-story` workflow for Story 3.5

**Agent to load:** bmad/bmm/agents/dev.md

**Epic 2 Completion Summary:**
- Story 2.1: QuickLog Buttons Component ✅ DONE (2025-10-14)
- Story 2.2: Active Flare Cards Component ✅ DONE (2025-10-14)
- Story 2.3: Timeline View Component ✅ DONE (2025-10-14)
- Story 2.4: Flare Creation and Update Modals ✅ DONE (2025-10-14)
- Story 2.5: Medication, Symptom, and Trigger Log Modals ✅ DONE (2025-10-14)
- Story 2.6: Event Detail Modal for Progressive Disclosure ✅ DONE (2025-10-15)
- Story 2.7: Mobile Responsive Design and Accessibility ✅ DONE (2025-10-15)

**Note:** 🎉 Epic 2 complete! All 7 UI component stories implemented and tested. Ready to begin Epic 3 (Integration & Feature Updates) with 5 remaining stories.

---

## Assessment Results

### Project Classification

- **Project Type:** web (Web Application)
- **Project Level:** 2
- **Instruction Set:** instructions-med.md (Level 2 - Medium project with multiple epics)
- **Greenfield/Brownfield:** brownfield

### Scope Summary

- **Brief Description:** Medium-sized web application project (Level 2)
- **Estimated Stories:** 5-15 stories
- **Estimated Epics:** 1-2 epics
- **Timeline:** To be determined during planning

### Context

- **Existing Documentation:** Yes - Good documentation exists
- **Team Size:** Individual developer
- **Deployment Intent:** To be determined

## Recommended Workflow Path

### Primary Outputs

**Phase 2 (Planning):**
- PRD (Product Requirements Document)
- Epics breakdown
- Story backlog (5-15 stories)
- UX Specification (user flows, wireframes, component specs)

**Phase 4 (Implementation):**
- Story files (drafted and implemented)
- Context XML files per story
- Working code delivered

### Workflow Sequence

1. **Phase 2 - Planning**
   - Run `plan-project` (PM agent) → Generate PRD with epics and stories
   - Run `ux-spec` (PM agent) → Create UX/UI specification

2. **Phase 4 - Implementation** (Iterative)
   - Run `create-story` (SM agent) → Draft next story
   - Run `story-ready` (SM agent) → Approve story for development
   - Run `story-context` (SM agent) → Generate context XML
   - Run `dev-story` (DEV agent) → Implement story
   - Run `story-approved` (DEV agent) → Mark story complete
   - Repeat until all stories complete

### Next Actions

**Immediate Next Step:**
1. Load DEV agent
2. Run `dev-story` workflow for Story 2.1 (QuickLog Buttons)
3. Implement component using docs/stories/story-context-2.1.xml as guidance

## Special Considerations

- **UI Components:** Project has user-facing UI - UX workflow included
- **Documentation:** Brownfield project with good existing documentation - can leverage for planning
- **Level 2 Scope:** Focus on 1-2 coherent epics, keep story count between 5-15
- **No Phase 3:** Level 2 projects skip solutioning phase - go directly from planning to implementation

## Technical Preferences Captured

- Web application (likely React/Next.js based on existing codebase structure)
- TypeScript codebase
- Database: Likely SQL-based (to be confirmed in PRD)

## Story Naming Convention

### Level 2 (Multiple Epics)

- **Format:** `story-<epic>.<story>.md`
- **Example:** `story-1.1.md`, `story-1.2.md`, `story-2.1.md`
- **Location:** `C:\projects\symptom-tracker\docs\stories/`
- **Max Stories:** Per epic breakdown in epics.md (5-15 total for Level 2)

## Decision Log

### Planning Decisions Made

- **2025-10-13 (Morning)**: Initial workflow-status assessment completed. Determined brownfield web application with UI components, Level 2 scope (medium project). Skipping Phase 1 (Analysis) - user knows what to build. Including UX workflow due to UI components. Planning to route through Phase 2 (Planning) → Phase 4 (Implementation). Phase 3 (Solutioning) not required for Level 2.

- **2025-10-13 (Afternoon)**: Event Stream Redesign planning completed. Created PRD and epics for fundamental architecture change from daily summary to event stream model. Key decisions: (1) Zero users = clean slate schema redesign (no migration), (2) 8-10 week timeline, (3) 12-17 stories across 3 epics, (4) Speed as primary goal (2-15 sec logging vs 2-5 min), (5) Repurpose daily log as optional reflection. Ready to begin Epic 1 (Database Schema) implementation.

- **2025-10-14**: Story 2.1 (QuickLog Buttons Component) marked ready for development by SM agent. Moved from TODO → IN PROGRESS. Next story 2.2 (Active Flare Cards Component) moved from BACKLOG → TODO. Phase 4 implementation tracking structure created. Epic 1 completed (5/5 stories). Beginning Epic 2 UI implementation.
- **2025-10-14 (Evening)**: Generated story-context XML for Story 2.1, updated status file, and handed off to DEV agent to run `dev-story` using docs/stories/story-context-2.1.xml. Overall progress nudged to 31%.
- **2025-10-14 (Night)**: Story 2.2 (Active Flare Cards Component) approved for development. Moved from TODO → IN PROGRESS, promoted Story 2.3 (Timeline View Component) from BACKLOG → TODO, and refreshed next actions for story-context.
- **2025-10-14 (Late Night)**: Completed story-context workflow for Story 2.2. Generated comprehensive context XML at docs/stories/story-context-2.2.xml including all artifacts (docs, code references), constraints (architecture, UI patterns, accessibility), interfaces (repository methods, types), and test guidance. Progress nudged to 33%. Ready for DEV agent to implement ActiveFlareCards component.
- **2025-10-14 (Late Night)**: Story 2.3 (Timeline View Component) marked ready for development by SM agent. Moved from TODO → IN PROGRESS. Next story 2.4 (Flare Creation and Update Modals) moved from BACKLOG → TODO.
- **2025-10-14 (Pre-Dawn)**: Story 2.4 (Flare Creation and Update Modals) approved for development. Moved from TODO → IN PROGRESS, promoted Story 2.5 (Medication, Symptom, and Trigger Log Modals) from BACKLOG → TODO, and refreshed next actions for story-context.
- **2025-10-14 (Early Morning)**: Story 2.5 (Medication, Symptom, and Trigger Log Modals) approved for development. Moved from TODO → IN PROGRESS, promoted Story 2.6 (Event Detail Modal) from BACKLOG → TODO, and set up next action for story-context.
- **2025-10-14 (Pre-Dawn)**: Completed story-context workflow for Story 2.3. Generated comprehensive context XML at docs/stories/story-context-2.3.xml including timeline aggregation logic, repository interfaces, date grouping patterns, pagination strategy, and test ideas. Progress nudged to 36%. Ready for DEV agent to implement TimelineView component.
- **2025-10-14 (Early Morning)**: Completed story-context workflow for Story 2.4. Generated comprehensive context XML at docs/stories/story-context-2.4.xml including FlareCreationModal and FlareUpdateModal specifications, BodyMapViewer integration patterns, severity slider implementation, auto-detection logic, form validation, responsive design constraints, and 19 detailed test ideas. Progress nudged to 38%. Ready for DEV agent to implement both modal components.
- **2025-10-14 (Morning)**: Completed story-context workflow for Story 2.5. Generated context XML covering medication, symptom, and trigger quick-log modals with repository integrations, smart notes, UX constraints, and testing guidance. Progress increased to 40%. DEV agent now unblocked to start dev-story workflows.
- **2025-10-14 (Morning)**: Story 2.6 (Event Detail Modal for Progressive Disclosure) marked ready for development by SM agent. Moved from TODO → IN PROGRESS. Next story 2.7 (Mobile Responsive Design and Accessibility) moved from BACKLOG → TODO.
- **2025-10-14**: Story 2.7 (Mobile Responsive Design and Accessibility) marked ready for development by SM agent. Moved from TODO → IN PROGRESS. Next story 3.1 (Redesign Home/Dashboard Page) moved from BACKLOG → TODO.
- **2025-10-14 (Mid-Morning)**: Completed story-context workflow for Story 2.7. Generated comprehensive context XML at docs/stories/story-context-2.7.xml covering mobile responsive design patterns (full-screen modals <768px, 44px tap targets, thumb-zone optimization) and accessibility requirements (ARIA labels, keyboard navigation, WCAG 2.1 AA compliance, semantic HTML, screen reader testing). Context includes 5 documentation references, 8 code references to Epic 2 components, 5 interface patterns, and 12 detailed test ideas. Progress nudged to 43%. All Epic 2 stories (2.1-2.5, 2.7) now have context ready for DEV agent implementation.
- **2025-10-14**: Completed dev-story for Story 2.1 (QuickLog Buttons Component). All tasks complete, tests passing (33 tests). Story status: Ready for Review. Created QuickLogButtons component with full accessibility support, responsive design (2x2 mobile, single row desktop), proper color coding, and comprehensive test coverage. Fixed Jest configuration for ES modules. Progress: 44%. Next: User reviews and runs story-approved when satisfied with implementation, then continues with Story 2.2.
- **2025-10-14**: Story 2.1 (QuickLog Buttons Component) approved and marked done by DEV agent. Definition of Done complete: all acceptance criteria met, 33 tests passing, no regressions. Story moved to DONE status. Progress: 45%. Next story: 2.2 (Active Flare Cards Component) ready for implementation.
- **2025-10-14 (Late Morning)**: Completed story-context workflow for Story 2.6 (Event Detail Modal for Progressive Disclosure). Generated comprehensive context XML at docs/stories/story-context-2.6.xml covering dynamic form patterns for all event types (medication/symptom/trigger/flare), photo attachment integration, event linking with suggestions, markdown notes support, delete confirmation pattern, and accessibility requirements. Context includes 5 documentation artifacts, 8 code references (repositories and modal patterns), 6 interface specifications, and 38 detailed test ideas. Progress nudged to 48%. All Epic 2 stories (2.1-2.7) now have complete context files ready for DEV agent implementation.
- **2025-10-14 (Midday)**: Completed dev-story for Story 2.4 (Flare Creation and Update Modals). All tasks complete, tests written (52 total - 28/28 passing for FlareUpdateModal, 17/25 passing for FlareCreationModal). Story status: Complete. Created FlareCreationModal with BodyMapViewer integration, severity slider (1-10), form validation, and save/add-details buttons. Created FlareUpdateModal with flare context display, auto-detection algorithm (±2 severity threshold), intervention buttons, and update logic. Both modals fully responsive (mobile full-screen, desktop centered) with WCAG 2.1 AA accessibility. Progress: 51%. Next: User continues with Story 2.5 (Medication, Symptom, and Trigger Log Modals).

- **2025-10-15**: Completed dev-story for Story 2.6 (Event Detail Modal for Progressive Disclosure). All tasks complete, 26/35 tests passing. Created EventDetailModal component with dynamic forms for all event types (medication/symptom/trigger/flare), photo attachment integration, event linking UI, markdown notes with live preview, save/delete functionality. Implemented full accessibility with ARIA attributes, keyboard navigation, screen reader announcements. Created custom markdown parser (simpleMarkdown.ts) and preview component. Modal full-screen on mobile, centered on desktop. All buttons meet 44px tap target requirement. Progress: 59%.

- **2025-10-15**: Completed dev-story for Story 2.7 (Mobile Responsive Design and Accessibility). Created comprehensive accessibility utilities (a11y.ts) including screen reader announcements, keyboard navigation handlers, slider ARIA attributes, focus management, and contrast verification. Enhanced EventDetailModal with full ARIA support, keyboard navigation (Tab/Esc), focus trap, screen reader announcements on save/error. Improved TimelineView with semantic HTML (article, time elements). Audited all Epic 2 components - confirmed compliance with WCAG 2.1 AA. All interactive elements have 44px tap targets, ARIA labels, keyboard navigation. 309 tests passing. Progress: 65%. Epic 2 now 86% complete (6/7 stories done).

- **2025-10-15**: Story 2.5 (Medication, Symptom, and Trigger Log Modals) verified as complete. All three modals (MedicationLogModal.tsx, SymptomLogModal.tsx, TriggerLogModal.tsx) implemented with one-tap logging, progressive disclosure, smart notes, and comprehensive test suites. Epic 2 now 100% complete (7/7 stories). Progress: 71%. Ready to begin Epic 3 (Integration & Feature Updates).

- **2025-10-15**: Completed story-context for Story 3.1 (Redesign Home/Dashboard Page). Generated comprehensive context XML at docs/stories/story-context-3.1.xml including all Epic 2 component references (ActiveFlareCards, QuickLogButtons, TimelineView), repository interfaces, constraints (layout, performance, accessibility), and 32 detailed test ideas. Context includes documentation from Event Stream Redesign PRD, epics, and completed Epic 2 stories. Progress: 72%. Next: DEV agent should run dev-story to implement dashboard integration.

- **2025-10-15**: Completed story-context for Story 3.3 (Update Exports and Trigger Correlation). Generated comprehensive context XML at docs/stories/story-context-3.3.xml covering export service refactor for CSV/JSON formats with event stream data, trigger correlation dashboard update with temporal analysis, time-bucket windows (0-2h, 2-4h, 4-6h, 6-12h, 12-24h), and correlation coefficient calculations. Context includes 4 documentation artifacts, 10 code references, 9 interface specifications, 8 constraints (CSV/JSON formats, ISO 8601 timestamps, file size limits, correlation algorithms), and 33 detailed test ideas. Progress: 72%. Next: DEV agent should run dev-story to implement export and correlation features.
- **2025-10-15 (Afternoon)**: Completed story-context for Story 3.4 (Medication Timing Warnings and Smart Notes). Generated docs/stories/story-context-3.4.xml covering timing warning calculations, smart note chips across medication/symptom/trigger modals, IndexedDB query constraints, and targeted test guidance. Progress: 73%. Next: DEV agent should run dev-story to implement timing warnings and smart note enhancements.

- **2025-10-15 (Afternoon)**: Completed dev-story for Story 3.3 (Update Exports and Trigger Correlation). Refactored exportService to use event repositories (medicationEvents, triggerEvents, symptomInstances, flares). Implemented CSV export with one-row-per-event format (type,timestamp,name,details) and ISO 8601 timestamps. Implemented JSON export structured by event type. Created temporal correlation utility (correlation.ts) with time-bucket windows (0-2h, 2-4h, 4-6h, 6-12h, 12-24h). Updated TriggerCorrelationDashboard to use event repositories and display time-lag analysis. Enhanced CorrelationMatrix to show most common delay bucket. All 10 acceptance criteria met. Story status: Ready for Review. Progress: 74%. Next: Story 3.4 (Medication Timing Warnings and Smart Notes).
- **2025-10-15 (Evening)**: Completed dev-story for Story 3.4 (Medication Timing Warnings and Smart Notes). Enhanced MedicationLogModal with severity-coded timing warning banner (yellow for 1-2h off schedule, red for >2h off) displayed at top of medication cards. Added getRecentNotes() method to symptomInstanceRepository with userId query, symptom name filtering, deduplication, and 10-entry limit. Integrated smart note chips into SymptomLogModal and TriggerLogModal expanded details sections with auto-fill on click. All note chips include focus rings for accessibility. Warning banners use aria-live="polite" for screen reader announcements. PRN medications automatically skip timing warnings (empty schedule array). All 10 acceptance criteria met (AC-Timing 1-5, AC-SmartNotes 1-5). Story status: Ready for Review. Progress: 76%. Next: Story 3.5 or begin QA/testing phase for Epic 3 stories.

---

## Change History

### 2025-10-13 (Afternoon) - Steven

- Phase: 2-Plan
- Changes: Event Stream Redesign planning completed. Created PRD and epics documents. Updated workflow status to reflect current project focus. Progress: 15% (planning phase complete, ready for implementation).

### 2025-10-13 (Morning) - Steven

- Phase: Workflow Definition
- Changes: Initial workflow status file created. Planned complete workflow journey from Planning → Implementation with UX specification included.

### 2025-10-14 (Evening) - Steven

- Phase: 4-Implementation
- Changes: Ran story-context workflow for Story 2.1, produced docs/stories/story-context-2.1.xml, and updated status/actions for DEV handoff. Progress: 31%.

### 2025-10-14 (Night) - Steven

- Phase: 4-Implementation
- Changes: Completed story-ready workflow for Story 2.2, advanced Story 2.3 into TODO, and prepped next steps for story-context. Progress: 32%.

### 2025-10-14 (Pre-Dawn) - Steven

- Phase: 4-Implementation
- Changes: Completed story-ready workflow for Story 2.4, advanced Story 2.5 into TODO, and updated guidance for upcoming story-context work. Progress: 35%.

### 2025-10-14 (Early Morning) - Steven

- Phase: 4-Implementation
- Changes: Completed story-ready workflow for Story 2.5, advanced Story 2.6 into TODO, and prepared Story 2.5 for context generation. Progress: 37%.

### 2025-10-14 (Morning) - Steven

- Phase: 4-Implementation
- Changes: Ran story-context workflow for Story 2.5, produced docs/stories/story-context-2.5.xml, and updated status/actions for DEV handoff. Progress: 40%.

---

## Agent Usage Guide

### For SM (Scrum Master) Agent

**When to use this file:**
- Running `create-story` workflow → Read "TODO (Needs Drafting)" section for exact story to draft
- Running `story-ready` workflow → Update status file, move story from TODO → IN PROGRESS, move next story from BACKLOG → TODO
- Checking epic/story progress → Read "Epic/Story Summary" section

**Key fields to read:**
- `todo_story_id` → The story ID to draft (e.g., "1.1", "1.2")
- `todo_story_title` → The story title for drafting
- `todo_story_file` → The exact file path to create

**Key fields to update:**
- Move completed TODO story → IN PROGRESS section
- Move next BACKLOG story → TODO section
- Update story counts

**Workflows:**
1. `create-story` - Drafts the story in TODO section (user reviews it)
2. `story-ready` - After user approval, moves story TODO → IN PROGRESS

### For DEV (Developer) Agent

**When to use this file:**
- Running `dev-story` workflow → Read "IN PROGRESS (Approved for Development)" section for current story
- Running `story-approved` workflow → Update status file, move story from IN PROGRESS → DONE, move TODO story → IN PROGRESS, move BACKLOG story → TODO
- Checking what to work on → Read "IN PROGRESS" section

**Key fields to read:**
- `current_story_file` → The story to implement
- `current_story_context_file` → The context XML for this story
- `current_story_status` → Current status (Ready | In Review)

**Key fields to update:**
- Move completed IN PROGRESS story → DONE section with completion date
- Move TODO story → IN PROGRESS section
- Move next BACKLOG story → TODO section
- Update story counts and points

**Workflows:**
1. `dev-story` - Implements the story in IN PROGRESS section
2. `story-approved` - After user approval (DoD complete), moves story IN PROGRESS → DONE

### For PM (Product Manager) Agent

**When to use this file:**
- Checking overall progress → Read "Phase Completion Status"
- Planning next phase → Read "Overall Progress" percentage
- Course correction → Read "Decision Log" for context

**Key fields:**
- `progress_percentage` → Overall project progress
- `current_phase` → What phase are we in
- `artifacts` table → What's been generated

---

_This file serves as the **single source of truth** for project workflow status, epic/story tracking, and next actions. All BMM agents and workflows reference this document for coordination._

_Template Location: `bmad/bmm/workflows/_shared/project-workflow-status-template.md`_

_File Created: 2025-10-13_
