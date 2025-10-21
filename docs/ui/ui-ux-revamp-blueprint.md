# UI/UX Revamp Blueprint – Symptom Tracker

## 1. Purpose & Scope
- Align navigation, dashboard, and core workflows to deliver a production-ready user experience ahead of broader release.
- Consolidate current findings from the UX expert review, product audit, and requirements analysis into a single source of truth for upcoming implementation stories.
- Cover initial launch scope (Epic 1) while setting patterns that will scale through flare lifecycle and analytics work in later epics.

## 2. Current Experience Audit

### 2.1 Navigation Surfaces (Desktop & Mobile)
- `src/components/navigation/Sidebar.tsx:26` – Primary desktop nav with three sections (“Primary”, “Health Tracking”, “Settings”). Labels diverge from mobile equivalents (e.g., “Daily Reflection” vs. “Log”).
- `src/components/navigation/BottomTabs.tsx:18` – Mobile bottom tabs (“Log”, “Dashboard”, “Analytics”, “Gallery”, “More”). “More” links to an additional hub.
- `src/app/(protected)/more/page.tsx:17` – Secondary menu repeating “Manage”, “Calendar”, “Settings”, etc., creating redundant entry points.
- `src/components/navigation/NavLayout.tsx:22` – Decides when to render sidebar/top bar/bottom tabs; uses hard-coded titles that do not cover all routes.

### 2.2 Key Screens Reviewed
- Dashboard (`src/app/(protected)/dashboard/page.tsx`) – Presents Active Flares, Quick Log buttons, and Timeline in a single scroll view with multiple modal entry points.
- Daily Log (`src/app/(protected)/log/page.tsx`) – Standalone reflection flow with optional notice; name mismatch (“Daily Reflection” vs. “Log”) depending on surface.
- Flares (`src/app/(protected)/flares/page.tsx`) – Split view default, showing cards, body map interaction, and stats simultaneously. Powerful but high cognitive load for first-time use.
- Manage Data (`src/app/(protected)/manage/page.tsx`) – Tabbed management experience (medications, symptoms, triggers, foods) hidden beneath multiple navigation layers.

### 2.3 Audit Summary
- **Inconsistency:** Two naming systems for the same destinations (e.g., “Daily Reflection” vs. “Log”) depending on navigation entry.
- **Redundancy:** “More” hub repeats items already available in sidebar/top bar; no unique functionality.
- **Overload:** Dashboard and Flares page surface advanced options immediately, creating steep learning curves for first-run experience.
- **Accessibility debt (pre-Story 1.6):** Keyboard focus and aria-label harmonization pending; current layout complicates upcoming work.

## 3. Proposed Information Architecture

### 3.1 Primary Pillars
1. **Track** – Dashboard (landing), Log (Daily Reflection), Flares (map/cards), Quick Photo capture.
2. **Analyze** – Analytics overview, Calendar timeline.
3. **Manage** – Manage Data (medications, symptoms, triggers, foods), Export, Settings/Privacy.
4. **Support** – About, Documentation/Help.

### 3.2 Navigation Mapping

```mermaid
flowchart TD
  A[Track] --> A1[Dashboard (/dashboard)]
  A --> A2[Log (/log)]
  A --> A3[Flares (/flares)]
  A --> A4[Photos (/photos)]

  B[Analyze] --> B1[Analytics (/analytics)]
  B --> B2[Calendar (/calendar)]

  C[Manage] --> C1[Manage Data (/manage)]
  C --> C2[Export Data (/export)]
  C --> C3[Settings (/settings)]
  C --> C4[Privacy (/privacy)]

  D[Support] --> D1[About (/about)]
  D --> D2[Docs/Help (future)]
```

### 3.3 Navigation Guidelines
- **Single primary nav:** Sidebar (desktop) + bottom tabs (mobile) share titles/ordering from the structure above.
- **No “More” hub:** Retire `/more` once surfaces migrate to the pillars.
- **Top bar titles:** Source names from a central map so page names remain consistent.

## 4. Heuristic Findings & Priorities

| Area | Issue | Notes & References | Severity | Impact |
| --- | --- | --- | --- | --- |
| Navigation labeling | Mixed terminology (“Daily Reflection”, “Log”, “Manage Data”) creates confusion between desktop/mobile | `Sidebar.tsx:26`, `BottomTabs.tsx:18`, `log/page.tsx:5` | High | High |
| Navigation redundancy | `/more` page duplicates existing routes without adding value | `src/app/(protected)/more/page.tsx` | Medium | Medium |
| Dashboard overload | Active flares, quick log, timeline, and multiple modals all compete for attention on first visit | `dashboard/page.tsx:80` | Medium | High |
| Flares entry complexity | Default split view with filters and stats overwhelms first-time users | `flares/page.tsx:18` | Medium | Medium |
| Mobile modality | Modal stacking (Dashboard quick log -> multiple dialogs) interrupts flow on small screens | `dashboard/page.tsx:141` et al. | Medium | Medium |
| Accessibility preparedness | Upcoming Story 1.6 needs unified focus order & aria labels; current layout exposes many entry points | Navigation components & Flares page | High | High |

## 5. Requirements & Success Metrics

### 5.1 User Goals (synthesized from docs/epics.md & stories)
- Log flare events quickly with precise location support (Stories 1.1–1.5).
- Capture daily context (mood, sleep, notes) alongside events (`log/page.tsx`).
- Review and analyze flare patterns (Analytics, Calendar, Triggers views).
- Manage tracking data (medications, symptoms, triggers, foods) efficiently.

### 5.2 Problem Statements
- Users (currently internal) cannot predictably find key flows due to inconsistent navigation surfaces and naming.
- Dashboard and Flares surfaces introduce advanced options prematurely, hindering onboarding.
- Accessibility improvements (keyboard & screen reader) risk inconsistency without unified structures.

### 5.3 Success Metrics (self-test until external users exist)
- **Time to log flare from Dashboard:** ≤ 30 seconds via Quick Action.
- **Steps to open Analytics from any screen:** ≤ 3 taps/clicks.
- **Discovery of Manage Data:** reachable without using a secondary “More” hub.
- **Accessibility (post Story 1.6):** Keyboard navigation maps cleanly across Track/Analyze/Manage pillars; focus indicators consistently visible.

### 5.4 Measurement Ideas
- Instrument navigation events (route transitions, feature entry buttons).
- Maintain manual task walkthroughs (Log, Review, Manage workflows) with step counts and time.
- Define UAT checklist referencing this blueprint to prevent regressions during future changes.

## 6. Implementation Roadmap

### Phase 1 – Blueprint & Foundation (Days 1-3)
1. Finalize IA mapping in code (shared nav config for titles & ordering).
2. Introduce reusable layout primitives (section headers, cards) for consistent styling.
3. Deprecate `/more` by redirecting content into Track/Manage pillars.

### Phase 2 – Navigation Consolidation (Days 4-7)
1. Update Sidebar & Bottom Tabs to use pillar structure.
2. Normalize route titles in `NavLayout.tsx` via central definition.
3. Ensure top bar actions align with new hierarchy; confirm mobile treatment.

### Phase 3 – Dashboard Refresh (Days 8-12)
1. Reframe Dashboard as “Today” view with three modules: Highlights (active flares + alerts), Quick Actions, Timeline preview.
2. Convert modal launches to route-based sheets when practical (especially on mobile).
3. Add guided empty states for first-run usage.

### Phase 4 – Flares Experience Hardening (Days 13-16)
1. Introduce beginner-friendly default (cards-only) with clear toggle to split view.
2. Rework body map guidance (inline hints, progressive disclosure).
3. Prepare layout for Story 1.6 accessibility enhancements (focus order, aria).

### Phase 5 – Validation & Instrumentation (Days 17-20)
1. Run internal usability walkthroughs using scripts in §5.4.
2. Capture baseline telemetry if instrumentation is in scope.
3. Update `docs/bmm-workflow-status.md` with progress, feed insights into backlog.

## 7. Initial Story Seeds (to be created after blueprint acceptance)
1. **Story 1.x:** “Consolidate Track Navigation” – Update Sidebar/Bottom Tabs to pillar structure, remove redundant routes.
2. **Story 1.x:** “Dashboard ‘Today’ Refresh” – Implement new card layout, quick actions, empty states.
3. **Story 1.x:** “Flares View Simplification” – Default to beginner flow, restructure toggles, prep for Story 1.6 accessibility.
4. **Story 1.x:** “Navigation Title & Layout Harmonization” – Centralize page titles/routes, ensure NavLayout uses shared config.
5. **Story 1.x:** “UX Instrumentation & Validation” – Add task scripts, track navigation events, update documentation.

Each story will reference this document for rationale, acceptance criteria, and dependencies.

## 8. Next Steps
- Review this blueprint (team & stakeholder) and capture sign-off.
- Once approved, generate implementation stories in sequence referencing §7.
- Maintain this document as a living reference; update sections as stories land to reflect the current state.

---

**Document Owner:** UI/UX Task Force (Sally – UX, John – PM, Mary – BA)  
**Last Updated:** 2025-10-21
