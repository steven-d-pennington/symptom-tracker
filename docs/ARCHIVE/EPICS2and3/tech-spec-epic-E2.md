# Technical Specification: Food-Symptom Correlation Analysis

Date: 2025-10-16
Author: Steven
Epic ID: E2
Status: Draft

---

## Overview

Epic 2 extends the symptom-tracker platform with automated analytics that discover relationships between logged foods and subsequent symptoms. Building on the hybrid architecture, the feature ingests unified event stream data (food, symptom, medication, trigger), runs statistical analysis across predefined delay windows, and surfaces actionable insights with confidence scoring. The work operationalizes FR006–FR020, delivering the Trigger Analysis food tab, downloadable reports, and export-ready datasets needed for longitudinal dietary investigations.

The solution splits responsibilities between client and server: Dexie continues to cache correlations for fast, offline-friendly reads, while Vercel-hosted Prisma + Postgres jobs compute time-window metrics, dose-response trends, and combination effects. UI components mirror UX specifications for confidence badges, allergen filters, and detailed correlation drill-downs.

## Objectives and Scope

**In Scope**
- Extend the correlation engine to process food events alongside existing symptom and trigger data using chi-square and Pearson statistics with p-value enforcement (ADR-008).
- Persist correlation summaries, combination findings, and dose-response metrics in Vercel Postgres (`FoodCorrelation`, `FoodCombination`) and hydrate the client cache via `/api/correlation/results`.
- Add background job orchestration (Vercel Cron + API trigger) to recalculate analytics every four hours and on demand (ADR-007).
- Integrate food correlations into the Trigger Analysis dashboard with drill-down detail views, allergen filters, and confidence indicators matching UX spec requirements.
- Update export services to include food journal data, correlation summaries, and supporting metadata (FR013, FR019).
- Produce CSV/JSON exports and PDF summaries that capture correlation percentages, confidence, time delays, sample sizes, and dose-response findings.

**Out of Scope**
- Predictive or ML-based trigger forecasting beyond chi-square/Pearson methods (future consideration noted in PRD).
- Real-time streaming analytics or push notifications when fresh correlations become available.
- Third-party integrations (nutrition APIs, clinician portals) and multi-user synchronization features.
- UI modifications outside the Trigger Analysis dashboard, export flows, and food correlation detail surfaces defined in UX spec.

## System Architecture Alignment

Epic 2 operates within the documented hybrid architecture:
- **Client** retains cached correlation results in Dexie (`analysisResults` table) for offline viewing and quick dashboard renders.
- **Server** handles correlation computation in Vercel Postgres via Prisma-backed services, ensuring NFR004 scalability across 100K+ events.
- **Background Jobs** run on Vercel Cron every four hours, invoking `CorrelationJobRunner` to recompute affected correlations, persist outputs, and publish version metadata. Manual triggers call the same service through `/api/correlation/analyze`.
- **Data Flow:** Food/symptom events sync from Dexie to Postgres → job computes correlations → `/api/correlation/results` returns aggregated records → client cache updated for next render.

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs / Outputs | Owner |
| --- | --- | --- | --- |
| `CorrelationService` (`src/lib/services/CorrelationService.ts`) | Core analytics engine; computes chi-square significance, Pearson dose-response, and windowed correlation metrics | Input: unified event payloads; Output: `FoodCorrelationResult` objects | Data Science |
| `CombinationAnalysisService` (`src/lib/services/food/CombinationAnalysisService.ts`) | Detects synergistic food pairs/meals and compares against individual correlations | Input: grouped meal events; Output: `FoodCombinationResult` | Data Science |
| `DoseResponseService` (`src/lib/services/food/DoseResponseService.ts`) | Performs regression across portion size vs symptom severity to establish dose-response relationships | Input: normalized portion/severity arrays; Output: `DoseResponseSummary` | Data Science |
| `CorrelationJobRunner` (`src/lib/services/food/CorrelationJobRunner.ts`) | Orchestrates scheduled/on-demand jobs, chunks event windows, writes Postgres rows, invalidates caches | Input: job configuration (userId, time windows); Output: job metrics, persisted rows | Platform Ops |
| `correlationRepository` (`src/lib/repositories/correlationRepository.ts`) | Prisma-backed CRUD for `FoodCorrelation` and `FoodCombination`, plus metadata tracking | Input: correlation DTOs; Output: persisted records | Data Platform |
| `correlationCacheService` (`src/lib/services/food/CorrelationCacheService.ts`) | Syncs server results into Dexie `analysisResults`, manages TTL, exposes stale/refresh checks | Input: API responses; Output: Dexie mutations | Platform Ops |
| `FoodCorrelationWidget` (`src/components/food/FoodCorrelationWidget.tsx`) | Dashboard module showing top correlations, confidence badges, filters, and refresh actions | Input: `useFoodCorrelations` hook data; Output: UI render, analytics events | Frontend |
| `FoodCorrelationDetailView` (`src/components/food/FoodCorrelationDetailView.tsx`) | Detailed view for a specific food-symptom pair, including time-delay chart, dose-response plot, and instance list | Input: selected correlation; Output: UI render | Frontend |
| `FoodCombinationCard` (`src/components/food/FoodCombinationCard.tsx`) | Surfaces combination effects with synergy indicators and supporting stats | Input: combination results; Output: UI render | Frontend |
| `/api/correlation/analyze` route | Accepts trigger requests, validates payload, queues job, returns status | Input: `{ userId, eventType }`; Output: `{ jobId, correlationVersion }` | Backend |
| `/api/correlation/results/[userId]` route | Returns latest correlation, combination, and metadata payloads with filtering support | Input: query params (confidence, allergen); Output: correlation payload | Backend |
| `/api/export/food-journal` route | Generates export bundles containing correlation summaries plus raw food events | Input: export request body; Output: signed download URL | Backend |

### Data Models and Contracts

```typescript
// Prisma schema additions (prisma/schema.prisma)
model FoodCorrelation {
  id             String   @id @default(uuid())
  userId         String
  foodId         String
  foodName       String
  symptomId      String
  symptomName    String
  correlationPct Float
  pValue         Float
  confidence     String   // "high" | "medium" | "low"
  sampleSize     Int
  consistency    Float    // 0-100
  timeWindowStart Int     // minutes post ingestion
  timeWindowEnd   Int
  avgDelay        Int
  doseResponse    Json?
  lastAnalyzedAt  DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, foodId, symptomId])
  @@index([userId, confidence])
}

model FoodCombination {
  id             String   @id @default(uuid())
  userId         String
  foodIds        String[]
  foodNames      String[]
  symptomId      String
  symptomName    String
  combinationCorrelation Float
  individualMax  Float
  synergistic    Boolean
  pValue         Float
  confidence     String
  sampleSize     Int
  lastAnalyzedAt DateTime
  createdAt      DateTime @default(now())

  @@unique([userId, foodIds, symptomId])
}

model CorrelationJobAudit {
  id         String   @id @default(uuid())
  userId     String
  jobType    String   // scheduled | manual
  durationMs Int
  recalculatedPairs Int
  status     String   // success | failure
  startedAt  DateTime @default(now())
  finishedAt DateTime
  error      String?
}
```

**Client Cache (`analysisResults` Dexie table):**

```typescript
export interface CachedCorrelation {
  id: string;
  userId: string;
  payload: string; // JSON-stringified FoodCorrelation[]
  combinations: string; // JSON-stringified FoodCombination[]
  correlationVersion: number;
  cachedAt: number;
  ttlMs: number; // default 86_400_000 (24h)
}
```

### APIs and Interfaces

- `CorrelationService.computeWindowedCorrelations(events, windows)` → computes per-window chi-square metrics with significance filtering.
- `CorrelationService.computeDoseResponse(foodEvents, symptomEvents)` → returns regression slope, intercept, r-squared.
- `CombinationAnalysisService.buildPairs(mealEvents)` → enumerates unique combinations with sample size thresholds.
- `CorrelationJobRunner.run({ userId, trigger })` → orchestrates fetch, compute, persist, audit logging, cache invalidation.
- `correlationRepository.saveMany(results)` → bulk upserts correlations and combinations with transactional consistency.
- `correlationCacheService.refresh(userId, payload)` → writes Dexie cache and publishes `correlationsUpdated` event for React context consumers.
- `/api/correlation/results/[userId]` supports query params: `minConfidence`, `allergen`, `timeWindow`, `includeCombinations`.

### Workflows and Sequencing

1. **Scheduled Correlation Job**
   1. Vercel Cron calls `/api/cron/correlations` (internal) every four hours.
   2. Route invokes `CorrelationJobRunner.run({ userId, trigger: "scheduled" })` per active user.
   3. Runner fetches food/symptom events for the rolling 90-day window plus baseline history.
   4. `CorrelationService` computes per-window stats; `CombinationAnalysisService` identifies synergistic pairs; dose-response executed when portion data available.
   5. Results persisted via `correlationRepository.saveMany`, old rows archived (soft delete via `updatedAt`).
   6. Audit entry recorded; Dexie caches invalidated by bumping `correlationVersion`.

2. **Manual Trigger (Dashboard Refresh)**
   1. User clicks “Refresh correlations” in `FoodCorrelationWidget`.
   2. Widget calls `POST /api/correlation/analyze` with `userId`.
   3. Route enqueues high-priority job (same runner) and returns `jobId`.
   4. UI polls `/api/correlation/status?jobId=` until `completed` or `failed`, then calls `/api/correlation/results` to hydrate context.

3. **Correlation Detail View**
   1. User selects a food row from widget table.
   2. `FoodCorrelationDetailView` fetches `/api/correlation/food/[foodId]` with optional `symptomId`.
   3. Route returns correlation record, instance history (food event + symptom pairings), dose-response summary, and combination overlaps.
   4. Component renders time-delay timeline, dose-response chart, and instance list; user can mark as “Monitor” or export.

4. **Export Pipeline**
   1. User triggers export from Trigger Analysis.
   2. `POST /api/export/food-journal` compiles food events + correlations within selected date range.
   3. Service uses `ExportBuilder` to generate CSV/JSON and optional PDF summary (via existing PDF utility).
   4. Response returns signed URL; client downloads and notifies user.

5. **Client Cache Refresh**
   1. After API response, `correlationCacheService.refresh` updates Dexie and notifies `FoodContext` observers.
   2. Widget re-renders with latest data; timeline filter badges show updated stats.

## Non-Functional Requirements

- **Performance (NFR004):** Scheduled job must complete within 120 seconds for 100K event datasets; API fetches return within 200ms when cached, 750ms when bypassing cache.
- **Accuracy (NFR003):** Correlations require p-value < 0.05 and minimum occurrences (3 for medium confidence, 5 for high). Dose-response regression must report r-squared; low significance flagged as “insufficient data”.
- **Scalability:** Job runner processes users sequentially but chunked by user; horizontal scaling achieved by partitioning user queues if SaaS multi-user emerges. Prisma uses connection pooling via Vercel.
- **Reliability:** Job audit logs stored in `CorrelationJobAudit`; failed jobs retried with exponential backoff (max 3 attempts) and surfaced in dashboard banner.
- **Observability:** Structured logs emitted (`correlation.job`, `correlation.export`), metrics captured (duration, correlation count). Add lightweight telemetry for sample sizes and failure causes.
- **Accessibility:** Dashboard widgets follow UX spec (aria labels, keyboard navigation, focus states, table semantics). Charts provide data tables for screen readers.

## Dependencies and Integrations

- **Prisma** – add models and migrations for correlation tables and job audit trail.
- **Vercel Postgres** – ensure connection string configured; apply migrations via `prisma migrate deploy` during deployment.
- **Dexie** – extend `analysisResults` table and context subscriptions for offline cache.
- **Chart.js + react-chartjs-2** – render correlation timelines, dose-response lines, and confidence visuals per UX spec.
- **Radix Tooltip** – reuse for confidence explanations and stat tooltips.
- **Export Service** – reuse existing export infrastructure, extending to include correlation data and PDF summary templates.
- **Vercel Cron** – configure schedule `0 */4 * * *`; environment variable `CRON_SECRET` to authorize cron route calls.

## Acceptance Criteria (Authoritative)

1. Scheduled job recalculates food correlations at least every four hours and persists results with updated timestamps, confirmed via audit log entries (FR006, FR007).
2. Trigger Analysis dashboard displays a “Food” tab listing correlations with correlation percentage, confidence badge, sample size, and typical delay window, matching UX specification layouts (FR007, FR019).
3. Manual refresh button enqueues a correlation job and updates dashboard results within five minutes, showing toast notifications for success and banner for failures (FR007).
4. Combination analysis identifies synergistic food pairs when their joint correlation exceeds individual correlations by configurable delta (default 15%), with minimum three occurrences enforced (FR018).
5. Dose-response module visualizes severity vs portion size using line charts, including confidence messaging when r-squared < 0.4 (FR009, FR019).
6. Allergen filter chips refine correlation list and detail views, reflecting allergen tag taxonomy and persisting selections across navigation (FR020).
7. Detailed correlation report lists individual food events (timestamp, meal context, portion, notes) alongside subsequent symptoms, respecting encrypted photo handling (FR008, FR018).
8. Export endpoint returns CSV/JSON and optional PDF containing food events, correlations, confidence, time windows, dose-response stats, and combination notes for given date ranges (FR013, FR014, FR019).
9. API responses enforce p-value threshold, hiding correlations that do not meet significance or marking them with “Insufficient data” badge; coverage verified via unit tests (NFR003).
10. Correlation cache falls back to last successful payload when offline, marking staleness and preventing runtime errors in dashboard components (NFR001, NFR004).

## Traceability Mapping

| AC | PRD Reference | UX Spec Reference | Modules / Tests |
| --- | --- | --- | --- |
| 1 | FR006 | UX §4.2 (Cron Refresh) | `CorrelationJobRunner`, `CorrelationJobAudit`, job integration tests |
| 2 | FR007, FR019 | UX §3 (Trigger Analysis Flow) | `FoodCorrelationWidget`, `FoodCorrelationDetailView` component tests |
| 3 | FR007 | UX §3 | `POST /api/correlation/analyze`, job polling hooks, toast notifications |
| 4 | FR018 | UX §3.2 Combination Cards | `CombinationAnalysisService`, Prisma model tests |
| 5 | FR009, FR019 | UX §5 (Visual Design) | `DoseResponseService`, chart component snapshot tests |
| 6 | FR020 | UX §3 (Filter Chips) | `AllergenFilter` enhancements, context state tests |
| 7 | FR008, FR018 | UX §3 (Detail View) | `/api/correlation/food/[foodId]`, detail component tests |
| 8 | FR013, FR014, FR019 | UX §3 (Export CTA) | Export service integration tests, snapshot comparison |
| 9 | NFR003 | UX §3 (Confidence Labels) | `CorrelationService` unit tests for p-value enforcement |
| 10 | NFR001, NFR004 | UX §1.2 (Offline Feedback) | `correlationCacheService`, context hook tests |

---

_This technical specification should remain synchronized with `docs/solution-architecture.md` and the UX specification. Update when scope, data models, or confidence thresholds change._
