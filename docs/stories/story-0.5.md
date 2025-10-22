# Story 0.5: UX Instrumentation & Validation

Status: Ready

## Story

As a product owner validating the redesign,
I want scripts and basic instrumentation to measure success criteria,
so that I can confirm the revamp improved usability before resuming flare implementation.

## Acceptance Criteria

1. **AC0.5.1 — UX walkthrough scripts captured with targets:** Document step-by-step walkthroughs for (a) logging a flare from the Dashboard quick actions, (b) opening Analytics from any primary surface, and (c) locating Manage Data, including the expected step counts and timing targets (≤30 seconds to log a flare, ≤3 hops to reach Analytics) defined in the UI revamp blueprint; store the scripts alongside the blueprint so the team can rerun them before each release. [Source: docs/epics.md#Story-0.5-UX-Instrumentation--Validation] [Source: docs/ui/ui-ux-revamp-blueprint.md#5.3-Success-Metrics]
2. **AC0.5.2 — Privacy-aware navigation instrumentation implemented:** Introduce a local-only instrumentation module that records navigation intents (quick action taps, pillar switches, major route transitions) when the user has opted into analytics, persists events to IndexedDB with compound indexes for user/event type, and adds regression coverage verifying quick actions emit telemetry while opt-out users record nothing. [Source: docs/epics.md#Story-0.5-UX-Instrumentation--Validation] [Source: src/lib/db/schema.ts:8] [Source: src/app/onboarding/components/PrivacyStep.tsx:16] [Source: src/app/(protected)/privacy/page.tsx:54]
3. **AC0.5.3 — Documentation updated for running validation:** Update the blueprint (or companion validation doc) and README notes with instructions on executing the walkthrough scripts, collecting instrumentation exports, and interpreting success criteria so future agents can repeat the validation without guesswork. [Source: docs/epics.md#Story-0.5-UX-Instrumentation--Validation] [Source: docs/ui/ui-ux-revamp-blueprint.md#5.4-Measurement-Ideas]
4. **AC0.5.4 — Baseline results captured and status updated:** Run the scripts once using the new tooling, capture baseline timings and outstanding risks in the validation doc, and summarize the findings in `docs/bmm-workflow-status.md` under Implementation Progress. [Source: docs/epics.md#Story-0.5-UX-Instrumentation--Validation] [Source: docs/ui/ui-ux-revamp-blueprint.md#5.4-Measurement-Ideas]

## Tasks / Subtasks

- [ ] Task 1: Author reproducible UX validation scripts (AC: #0.5.1, #0.5.3)
  - [ ] 1.1: Create `docs/ui/ux-validation-scripts.md` (or similar) describing the three required walkthroughs, enumerating expected steps, screenshots/callouts, and timing targets from the blueprint. [Source: docs/ui/ui-ux-revamp-blueprint.md#5.3-Success-Metrics]
  - [ ] 1.2: Reference prerequisite stories (0.1–0.4) and required test data so the scripts are portable across environments. [Source: docs/epics.md#Epic-0-UIUX-Revamp--Navigation-Harmonization-NEW]
  - [ ] 1.3: Add checklist sections for recording observed timings, blockers, and regression risks to feed into the status file update. [Source: docs/ui/ui-ux-revamp-blueprint.md#5.4-Measurement-Ideas]
- [ ] Task 2: Extend data layer for UX telemetry (AC: #0.5.2)
  - [ ] 2.1: Define a `UxEventRecord` interface in `src/lib/db/schema.ts` with compound index fields (`[userId+eventType]`, `timestamp`) and bump Dexie to version 17 to add a `uxEvents` table following local-first storage conventions. [Source: src/lib/db/schema.ts:8] [Source: src/lib/db/client.ts:264]
  - [ ] 2.2: Implement `uxEventRepository` in `src/lib/repositories/uxEventRepository.ts` providing `recordEvent`, `listRecent`, and `clear` helpers with JSON stringification for payload details. [Source: AGENTS.md#Database-Architecture]
  - [ ] 2.3: Add Jest unit tests mocking Dexie (see existing repository tests) to ensure events persist and indexes filter by `[userId+eventType]`. [Source: src/lib/repositories/userRepository.ts] [Source: jest.setup.js]
- [ ] Task 3: Wire instrumentation into navigation surfaces (AC: #0.5.2)
  - [ ] 3.1: Create a `useUxInstrumentation` hook in `src/lib/hooks/useUxInstrumentation.ts` that checks `user.preferences.privacy.analyticsOptIn` and exposes `recordUxEvent(eventType, metadata)`; fall back to a no-op when analytics are disabled. [Source: src/app/onboarding/components/PrivacyStep.tsx:16] [Source: src/lib/repositories/userRepository.ts]
  - [ ] 3.2: Invoke `recordUxEvent` from Dashboard quick action handlers (`handleLogFlare`, etc.) and QuickLogButtons so each user intent is tracked once. [Source: src/app/(protected)/dashboard/page.tsx:111] [Source: src/components/quick-log/QuickLogButtons.tsx:27]
  - [ ] 3.3: Instrument pillar navigation (TopBar/Sidebar/BottomTabs) to emit events when users switch surfaces, ensuring shared config remains the single source of truth. [Source: docs/stories/story-0.4.md] [Source: src/config/navigation.ts]
  - [ ] 3.4: Add component tests (RTL + fake-indexeddb) asserting events fire for opt-in users and remain silent for opt-out scenarios. [Source: AGENTS.md#Testing-Requirements]
- [ ] Task 4: Document instrumentation workflow (AC: #0.5.3)
  - [ ] 4.1: Update `docs/ui/ui-ux-revamp-blueprint.md` Phase 5 section with links to the scripts, opt-in requirement, and instructions for exporting UX events (JSON/CSV). [Source: docs/ui/ui-ux-revamp-blueprint.md#Phase-5--Validation--Instrumentation]
  - [ ] 4.2: Add a README note under privacy/measurement clarifying that telemetry is local-only and requires explicit opt-in. [Source: README.md:189] [Source: src/app/(protected)/privacy/page.tsx:54]
  - [ ] 4.3: Provide a `package.json` script or developer command (`npm run ux:validate`) that prints recent UX events for reporting. [Source: AGENTS.md#Development-Workflow]
- [ ] Task 5: Capture baseline results and update status (AC: #0.5.4)
  - [ ] 5.1: Execute the walkthrough scripts with instrumentation enabled, logging actual durations, event counts, and any noted friction into the validation doc. [Source: docs/ui/ui-ux-revamp-blueprint.md#5.4-Measurement-Ideas]
  - [ ] 5.2: Summarize findings, risks, and follow-ups in `docs/bmm-workflow-status.md` under Implementation Progress (Story 0.5) and note next workflow to run (`story-ready`). [Source: docs/bmm-workflow-status.md]
  - [ ] 5.3: Archive the captured JSON/CSV output (if any) in a local-only directory ignored by Git, documenting cleanup steps so telemetry does not persist in the repo. [Source: README.md:189]

## Dev Notes

### Architecture Context

- Epic 0’s blueprint requires measurable proof that navigation and dashboard refresh reduce effort before Epic 2 resumes, making instrumentation and walkthrough scripts essential to the release gate. [Source: docs/epics.md#Story-0.5-UX-Instrumentation--Validation] [Source: docs/ui/ui-ux-revamp-blueprint.md#5.3-Success-Metrics]
- The product promises zero third-party tracking; any telemetry must remain local, respect analytics opt-in, and be exportable for manual review only. [Source: README.md:189] [Source: src/app/(protected)/privacy/page.tsx:54]

### Implementation Guidance

- Follow repository pattern when adding `uxEventRepository` so instrumentation stays behind the data-access layer and can be reused by future analytics stories. [Source: AGENTS.md#Repository-Pattern]
- Quick action handlers in the Dashboard and navigation components are prime event sources; instrument them at the handler level to avoid duplicate events from child components. [Source: src/app/(protected)/dashboard/page.tsx:111] [Source: src/components/quick-log/QuickLogButtons.tsx:27] [Source: src/config/navigation.ts]
- Expose a developer-focused `useUxInstrumentation` hook so future components (e.g., flare detail shortcuts) can opt in without duplicating privacy gating logic. [Source: AGENTS.md#Custom-Hooks]

### Data & State Considerations

- Store UX events in Dexie with compound indexes on userId and eventType to keep retrieval efficient while supporting multi-user futures. [Source: AGENTS.md#Compound-Indexes] [Source: src/lib/db/client.ts:264]
- Persist event payloads as JSON strings (metadata map) consistent with existing schema conventions for arrays/objects. [Source: AGENTS.md#JSON-Stringification]
- Ensure repositories always include `userId` queries, aligning with single-user-now, multi-user-later strategy. [Source: AGENTS.md#Repository-Pattern]

### Testing Strategy

- Use Jest + React Testing Library with fake-indexeddb to assert instrumentation writes and privacy gating across quick actions and nav components. [Source: AGENTS.md#Testing-Requirements]
- Add repository tests to confirm query filters (`listRecent`) respect userId/eventType indexes and handle opt-out paths gracefully. [Source: src/lib/repositories/userRepository.ts]
- Include manual validation checklist execution as part of story completion, recording timings in the new doc to satisfy AC0.5.4. [Source: docs/ui/ui-ux-revamp-blueprint.md#5.4-Measurement-Ideas]

### References

- docs/epics.md#Story-0.5-UX-Instrumentation--Validation
- docs/ui/ui-ux-revamp-blueprint.md#5.3-Success-Metrics
- docs/ui/ui-ux-revamp-blueprint.md#5.4-Measurement-Ideas
- src/lib/db/schema.ts:8
- src/lib/db/client.ts:264
- src/app/onboarding/components/PrivacyStep.tsx:16
- src/app/(protected)/privacy/page.tsx:54
- src/app/(protected)/dashboard/page.tsx:111
- src/components/quick-log/QuickLogButtons.tsx:27
- src/config/navigation.ts
- README.md:189
- docs/bmm-workflow-status.md

## Change Log

| Date | Author | Notes |
| --- | --- | --- |
| 2025-10-22 | Draft | Initial story created via create-story workflow. |

## Dev Agent Record

### Context Reference

- Path: docs/stories/story-context-0.5.xml (generated 2025-10-22 via story-context workflow)

### Agent Model Used

TBD

### Debug Log References

- Pending implementation; no execution logs yet.

### Completion Notes

- Pending (story is Ready with context; implementation still outstanding).

### Completion Notes List

- Pending (populate after dev-story delivers instrumentation and validation artifacts).

### File List

- Pending (populate after implementation).
