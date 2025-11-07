# BMM Workflow Status — symptom-tracker

- **Project:** symptom-tracker
- **Created:** 2025-10-18
- **Last Updated:** 2025-11-07 (Epic 6: UX Redesign - Ready to Begin)
- **Project Level:** 2
- **Project Type:** web
- **Context:** brownfield

---

## Current State

- **Current Phase:** Phase 4: Implementation (In Progress)
- **Current Workflow:** Epic 6 (UX Redesign & Navigation Overhaul) - Ready to Begin
- **Overall Progress:** Epics 3.5, 3.6 complete. Epic 3.7.1 done. Epic 6 planned and ready.
- **Next Action:** Begin Epic 6 Phase 1 (Navigation & Structure) - HIGHEST PRIORITY for go-live
- **Command to Run:** /bmad:bmm:workflows:create-story (to draft Epic 6 stories)
- **Agent to Load:** sm (Scrum Master) or dev (Developer)
- **Note:** UX Design Specification complete. Epic 6 is critical for production go-live - addresses navigation confusion, adds Health Insights analytics hub, Daily Log unified tracking, and Timeline pattern detection.

---

## Phase Completion Overview

- [x] Phase 1: Analysis (Optional - skipped, brownfield enhancement)
- [x] Phase 2: Plan (Complete - PRD + Epics)
- [x] Phase 3: Solutioning (Complete - Architecture)
- [ ] Phase 4: Implementation (In Progress)

---

## Implementation Progress (Phase 4 Only)

#### DRAFTED (Story Created, Context Generated, Ready for Development)

*No stories currently drafted.*

---

#### BACKLOG (Not Yet Drafted)

**Epic 6: UX Redesign & Navigation Overhaul (PRIORITY - Required for Go-Live)**

| Epic | Story | ID | Title | Description | Points | Priority |
|------|-------|-----|-------|-------------|--------|----------|
| 6 | 1 | 6.1 | Navigation Restructure & shadcn/ui Integration | Update nav config, rename paths (/flares→/body-map, /analytics→/insights, /calendar→/timeline), integrate shadcn/ui components | 8 | CRITICAL |
| 6 | 2 | 6.2 | Daily Log Page - Mood & Sleep Reflection | Create /daily-log page with mood selector, sleep input, notes, and event summary links | 13 | CRITICAL |
| 6 | 3 | 6.3 | Correlation Engine & Spearman Algorithm | Implement correlation calculation service with Spearman rank correlation for sleep×flares, mood×flares patterns | 13 | HIGH |
| 6 | 4 | 6.4 | Health Insights Hub UI | Build /insights page with InsightCard components, correlation visualizations, problem areas heat map | 13 | HIGH |
| 6 | 5 | 6.5 | Timeline Pattern Detection | Build multi-layer timeline with mood/sleep/flares layers, pattern highlighting, day detail modal | 13 | HIGH |
| 6 | 6 | 6.6 | Body Map Gender/Type Customization | Enhanced SVG variants (female/male/neutral), body-type selection, settings storage | 8 | MEDIUM |
| 6 | 7 | 6.7 | Treatment Effectiveness Tracker | Algorithm to correlate interventions with recovery time, effectiveness display in insights | 8 | MEDIUM |

**Epic 4: Photo Documentation (On Hold - Defer to Epic 6)**

| Epic | Story | ID | Title | File | Points | Priority |
|------|-------|-----|-------|------|--------|----------|
| 4 | 1 | 4.1 | Attach Photos to Flare Entities | story-4.1.md | 8 | DEFERRED |
| 4 | 2 | 4.2 | Flare Photo Timeline View | story-4.2.md | 8 | DEFERRED |
| 4 | 3 | 4.3 | Before/After Photo Comparison | story-4.3.md | 5 | DEFERRED |
| 4 | 4 | 4.4 | Photo Annotation (Simple) | story-4.4.md | 5 | DEFERRED |

**Epic 2: Backlog Items**

| Epic | Story | ID | Title | File | Points | Priority |
|------|-------|-----|-------|------|--------|----------|
| 2 | 8 | 2.8 | Resolved Flares Archive | story-2.8.md | 5 | LOW |

**Total in backlog:** 13 stories (7 Epic 6, 4 Epic 4, 1 Epic 2, 1 Epic 3.7)

#### IN PROGRESS (Approved for Development / Review)

*No stories currently in progress.*

---

#### DONE (Completed Stories)

| Story ID | File | Completed Date | Points | Epic |
|----------|------|----------------|--------|------|
| 3.7.1 | docs/stories/3-7-1-region-detail-view-infrastructure.md | 2025-11-02 | 5 | Epic 3.7: Body Map UX Enhancements |
| 3.6.1 | docs/stories/3.6.1-onboarding-data-selection-flow.md | 2025-11-02 | 13 | Epic 3.6: Onboarding Enhancement |
| 3.5.10 | docs/stories/story-3.5.10.md | 2025-11-01 | 1 | Epic 3.5: Production UX (Bug Fix) |
| 3.5.9 | docs/stories/3-5-9-help-pages-and-landing-page.md | 2025-10-31 | 5 | Epic 3.5: Production UX |
| 3.5.8 | docs/stories/3-5-8-add-keyboard-navigation-accessibility.md | 2025-10-31 | 5 | Epic 3.5: Production UX |
| 3.5.7 | docs/stories/3-5-7-fix-calendar-data-wiring.md | 2025-10-31 | 3 | Epic 3.5: Production UX |
| 3.5.6 | docs/stories/3-5-6-critical-ui-fixes-bundle.md | 2025-10-30 | 5 | Epic 3.5: Production UX |
| 3.5.5 | docs/stories/3-5-5-redesign-trigger-and-medication-logging-to-pages.md | 2025-10-30 | 5 | Epic 3.5: Production UX |
| 3.5.4 | docs/stories/3-5-4-redesign-food-logging-modal-to-page.md | 2025-10-30 | 8 | Epic 3.5: Production UX |
| 3.5.3 | docs/stories/3-5-3-redesign-symptom-logging-modal-to-page.md | 2025-10-30 | 5 | Epic 3.5: Production UX |
| 3.5.2 | docs/stories/3-5-2-mood-and-sleep-basic-logging.md | 2025-10-30 | 8 | Epic 3.5: Production UX |
| 3.5.1 | docs/stories/3-5-1-fix-empty-state-crisis-and-pre-populate-defaults.md | 2025-10-30 | 8 | Epic 3.5: Production UX |
| ... | ... | ... | ... | ... |

---

### Next Action Required

**🎯 Epic 6 Ready — UX Redesign Critical for Go-Live**

Epic 6 (UX Redesign & Navigation Overhaul) has been fully designed and is ready for implementation. This epic is **CRITICAL** for production go-live and should be prioritized over Epic 4.

**What Epic 6 Delivers:**
- Fixes navigation confusion (Flares → Body Map, new Insights section)
- Health Insights analytics hub with correlation detection
- Daily Log unified tracking (mood, sleep, notes in one place)
- Timeline with pattern detection
- Body map enhancements (gender/body-type variants)
- Treatment effectiveness tracking

**Design Documentation:**
- **UX Specification:** [docs/ux-design-specification.md](./ux-design-specification.md)
- **Interactive Mockups:**
  - [docs/ux-health-insights-demo.html](./ux-health-insights-demo.html)
  - [docs/ux-daily-log-demo.html](./ux-daily-log-demo.html)

**Next Steps:**
1. **Command:** `/bmad:bmm:workflows:create-story` to draft Story 6.1 (Navigation Restructure)
2. **Agent:** Load `sm` (Scrum Master) to create stories or `dev` (Developer) to begin implementation
3. **Priority Order:** 6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 → 6.7
4. **Epic:** Epic 6 (76 total story points estimated - ~14 weeks)
5. **Must-Have for MVP:** Stories 6.1, 6.2, 6.4, 6.5 (47 points - ~8 weeks)

**Why Epic 6 First:**
- Addresses user-reported navigation confusion
- Fixes broken analytics page
- Adds competitive differentiator (correlation insights)
- Required for production go-live credibility

---

## Decision Log

- **2025-11-07:** Created Epic 6: UX Redesign & Navigation Overhaul (76 story points). This epic is now the **HIGHEST PRIORITY** for production go-live, superseding Epic 4 (Photo Documentation). Epic 6 addresses critical UX issues identified by stakeholder: navigation confusion (Flares→Body Map, Analytics broken, missing links), mood/sleep isolation, lack of correlation insights, and basic calendar. Comprehensive UX Design Specification completed with interactive HTML mockups. Epic includes 7 stories: (6.1) Navigation Restructure & shadcn/ui (8pt - CRITICAL), (6.2) Daily Log Page (13pt - CRITICAL), (6.3) Correlation Engine (13pt - HIGH), (6.4) Health Insights Hub (13pt - HIGH), (6.5) Timeline Pattern Detection (13pt - HIGH), (6.6) Body Map Gender/Type (8pt - MEDIUM), (6.7) Treatment Effectiveness (8pt - MEDIUM). Architecture clarified: Daily Log is end-of-day reflection (db.dailyLogs), Quick Actions remain for event-based tracking (db.foodEvents, etc.). Must-have MVP stories: 6.1, 6.2, 6.4, 6.5 (47 points ~8 weeks). Next action: Run `/bmad:bmm:workflows:create-story` to draft Story 6.1.

- **2025-11-02 (Updated):** Completed Story 3.7.1: Region Detail View Infrastructure (5 points). Successfully implemented isolated region views that fill the viewport for maximum precision when placing body map markers. Features include: RegionDetailView component with isolated region rendering, view mode state management (full-body vs region-detail), region-relative coordinate system (0-1 normalized), coordinate transformations between views, historical marker display with toggle, ESC key navigation, and back button. Fixed region click event handling to properly trigger detail view. Epic 3.7 in progress.

- **2025-11-02:** Story 3.7.1 (Region Detail View Infrastructure) created and context generated. This is the first story of Epic 3.7: Body Map UX Enhancements. The story is ready for development and focuses on implementing isolated region views that fill the viewport for better precision in marker placement. (5 points)

- **2025-11-02:** Completed Story 3.6.1: Interactive Data Selection During Onboarding (13 points). This story transformed the onboarding flow from auto-populating all defaults to allowing users to interactively select symptoms, triggers, medications, and foods. Features include: reusable SelectionStep component, real-time search across all data types, custom item creation during onboarding, skip functionality, GUID-based user ID generation for cloud sync preparation. Epic 3.6 now complete. Next priority: Add body map UX enhancements epic or begin Epic 4.

- **2025-11-01:** Completed Story 3.5.10 (CRITICAL bug fix). Fixed calendar page crash caused by undefined severityScale in old data. Added conditional check in recordToSymptom method and comprehensive unit test. All tests passing. Epic 3.5 now fully complete with 10 stories (53 points total). Epic 4 unblocked and ready to begin.

- **2025-11-01:** Created Story 3.6.1: Interactive Data Selection During Onboarding. This story expands the onboarding flow to allow users to interactively select symptoms, triggers, medications, and foods instead of auto-populating all defaults. Features include: collapsible category organization, real-time search across all data types, ability to add custom items during onboarding, and GUID-based user ID generation for cloud sync preparation. Story includes 13 acceptance criteria and 16 detailed tasks. Priority: HIGH (13 story points).

- **2025-10-31:** Created Story 3.5.10 to address a critical regression in the calendar page (`SyntaxError: "undefined" is not valid JSON`). This bug blocks production readiness. The start of Epic 4 is paused until this fix is implemented and verified. The next action is for the DEV agent to run `*dev-story` to implement the fix.

- **2025-10-31:** Corrected workflow status to reflect completion of Epic 3.5. The epic concluded with 9 stories (52 points), including the addition of story 3.5.9. All stories (3.5.1 through 3.5.9) are now marked as DONE. Phase 4 (Implementation) is now complete. The project is unblocked and ready to begin Epic 4 (Photo Documentation). The next action is for the Scrum Master to run `*create-story` to draft story 4.1.

_(Additional decision log entries preserved - see full file for complete history)_

---

_To refresh status at any time, run `*workflow-status`._
