# UX Validation Scripts – Epic 0 Validation

These scripts confirm that the Epic 0 navigation and dashboard revamp meets the measurable success metrics defined in the UI/UX blueprint (§5.3–5.4). They should be executed before each release or when navigation/instrumentation code changes.

## 1. Prerequisites

- ✅ Stories 0.1–0.4 deployed (navigation consolidation, dashboard refresh, flares simplification, layout harmonization)
- ✅ Story 0.5 tooling installed (UX instrumentation repository + export script)
- ✅ Analytics opt-in enabled for the test user (`Privacy → Analytics` toggle)
- ✅ Fake IndexedDB available (use existing Jest/fake-indexeddb mocks when automating)
- ✅ Test data:
  - At least one active flare, symptom, medication, and trigger to exercise quick actions
  - Timeline populated with recent entries to validate scroll targets
  - Manage Data catalog seeded with default symptoms/triggers (auto-populated on first load)

## 2. General Execution Notes

- Use a stopwatch to capture durations; note seconds to one decimal place.
- Record total step count (number of discrete user actions, e.g., button press, navigation change).
- Capture screenshots for any unexpected states and attach them to the release ticket (not stored in repo).
- All instrumentation remains local; export via `npm run ux:validate` if data review is required.

## 3. Validation Scripts

### Script A — Log a Flare from Dashboard Quick Actions (≤ 30 seconds, ≤ 6 steps)

| Step | Action | Expected System Response |
| --- | --- | --- |
| 1 | From Dashboard landing, locate **Quick Actions** module | Module visible with flare button |
| 2 | Select **New Flare** quick action | Route updates to `?quickAction=flare`; flare modal opens |
| 3 | Fill required flare details (location, severity, notes) | Input validation passes |
| 4 | Submit flare | Modal closes on success |
| 5 | Confirm timeline updates | New flare entry visible in Today Timeline |
| 6 | Verify dashboard URL reset (`/dashboard`) | Route cleared; instrumentation event recorded |

**Observation Checklist**
- [ ] Actual duration: ______ seconds (target ≤ 30)
- [ ] Recorded step count: ______ (target ≤ 6)
- [ ] UX events captured (use export script): ______
- [ ] Blockers/friction observed:
- [ ] Regression risks or follow-ups:

#### Baseline — 2025-10-22
- Duration: 18.2s (target ≤ 30s)
- Steps: 5 (target ≤ 6)
- Events: quickAction.flare ×1 (dashboard.quickActions)
- Notes: Modal loads in 1.6s; no blockers observed.

### Script B — Reach Analytics from Any Primary Surface (≤ 3 hops)

| Step | Action | Expected System Response |
| --- | --- | --- |
| 1 | Start on any pillar surface (Track/Dashboard, Manage, etc.) | Current route confirmed |
| 2 | Use primary navigation to switch to **Analyze** pillar | Sidebar/Bottom Tabs highlight Analyze |
| 3 | Select **Analytics** destination | Route transitions to `/analytics`, instrumentation event logged |

**Observation Checklist**
- [ ] Actual hop count: ______ (target ≤ 3)
- [ ] Actual duration: ______ seconds
- [ ] UX events captured (pillar switch + analytics open):
- [ ] Blockers/friction observed:
- [ ] Regression risks or follow-ups:

#### Baseline — 2025-10-22
- Hop count: 2 (target ≤ 3)
- Duration: 6.8s
- Events: navigation.destination.select ×1 (sidebar.desktop → /analytics)
- Notes: No blockers; analytics dashboard renders in 1.2s.

### Script C — Locate Manage Data (primary navigation only)

| Step | Action | Expected System Response |
| --- | --- | --- |
| 1 | From any screen, open primary navigation | Sidebar/Bottom Tabs visible |
| 2 | Switch to **Manage** pillar | Navigation highlights Manage pillar |
| 3 | Choose **Manage Data** | Route transitions to `/manage`, instrumentation event logged |
| 4 | Confirm subsections load (medications, symptoms, triggers, foods) | Tabs visible and interactive |

**Observation Checklist**
- [ ] Actual hop count: ______
- [ ] Actual duration: ______ seconds
- [ ] UX events captured (pillar switch + manage data open):
- [ ] Blockers/friction observed:
- [ ] Regression risks or follow-ups:

#### Baseline — 2025-10-22
- Hop count: 3 (open nav → Manage pillar → Manage Data)
- Duration: 8.9s
- Events: navigation.destination.select ×1 (sidebar.desktop → /manage)
- Notes: Tabs preloaded; no blockers.

## 4. Baseline Results — 2025-10-22

| Metric | Target | Observed | Notes / Follow-ups |
| --- | --- | --- | --- |
| Time to log flare | ≤ 30s | 18.2s | Captured quickAction.flare ×1 |
| Steps to reach Analytics | ≤ 3 hops | 2 hops | navigation.destination.select ×1 |
| Steps to reach Manage Data | ≤ 3 hops | 3 hops | navigation.destination.select ×1 |
| Privacy opt-in respected | Yes | Enabled via Settings → Privacy | Opt-out confirmed post-run |
| Instrumentation data exported | JSON/CSV | baseline-2025-10-22.json (stored in `.local/ux-events/`) | Reviewed with `npm run ux:validate` |

**Open Risks & Blockers**
- Quick action instrumentation depends on analytics opt-in; add reminder in release checklist to verify preferences before measurement.
- Analytics load time still tied to dashboard data volume; monitor if active flares exceed 25 entries.

**Regression Watchlist**
- Ensure QuickLogButtons instrumentation remains disabled in contexts that already wrap handlers to avoid duplicate events.
- Re-run validation after Story 1.6 (accessibility) to confirm focus order changes do not alter step counts.

## 5. Clean-up

- Toggle analytics opt-out if user declined persistent tracking.
- Run `npm run ux:validate` to review the exported events, then delete the archive once reporting is complete.
- Archive exported telemetry in local `./.local/ux-events/` (ignored) and note deletion timeline.
