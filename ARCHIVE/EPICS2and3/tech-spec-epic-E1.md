# Technical Specification: Food Logging & Management

Date: 2025-10-16
Author: Steven
Epic ID: E1
Status: Draft

---

## Overview

Epic 1 expands the symptom-tracker platform with an offline-first Food Journal flow so users can log meals in real time, enrich entries with context, and feed the unified event stream required for downstream food-symptom correlation. The work introduces a food quick-log surface, pre-populated food catalog, and structured meal capture aligned with the PRD goals of rapid entry (<15 seconds) and rich metadata for correlation.

The effort reuses the existing Dexie/IndexedDB data layer, dashboard quick-log paradigms, and photo encryption pipeline. Food events become first-class citizens alongside symptoms, medications, and triggers so that all client and server components share a consistent event stream, satisfying FR001–FR017 while remaining compatible with the hybrid architecture documented in the solution architecture.

## Objectives and Scope

**In Scope**
- Add a food quick-log action on the dashboard with modal-based meal composition that responds within 500ms using local persistence.
- Seed 200+ default foods with allergen metadata and expose full-text search, category filters, and color-coded allergen tags.
- Support user-defined foods, editable metadata, and soft-deletion semantics (`isActive` / `isDefault` alignment).
- Introduce `foodEvents` Dexie table with compound indexes for `[userId+timestamp]`, `[userId+mealType]`, and `[userId+allergenTag]` filters, plus background sync hooks to the server event stream.
- Allow logging multiple foods per meal with portions, notes, optional photos, and favorites for rapid recall.
- Integrate food events into the existing Timeline view and provide a history panel with search, filtering, and favorite pinning.

**Out of Scope**
- Correlation computation, confidence scoring, and analytics dashboards (Epic 2 scope).
- Export formats beyond wiring food data into the existing export service (handled later in Story 2.8).
- Server-side statistical jobs, dose-response analysis, and allergen-wide insights.
- Multi-device real-time sync; this epic delivers queued sync hooks but not bi-directional conflict resolution.

## System Architecture Alignment

The feature follows the hybrid architecture: Dexie handles instant writes and offline UX, while the unified event stream feeds Vercel Postgres via background sync so Epic 2 analytics can consume consistent data. React Context encapsulates food state in parity with existing `DashboardContext`. UI additions (quick-log button, modals, timeline entries) reuse functional components and Tailwind utility patterns. Photo attachments delegate to the established AES-256-GCM pipeline, ensuring privacy requirements continue to be met.

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs / Outputs | Owner |
| --- | --- | --- | --- |
| `foodRepository` (`src/lib/repositories/foodRepository.ts`) | CRUD for foods table, seed detection, JSON parsing of allergen tags/categories, soft-delete toggles | Input: `FoodDraft`; Output: `FoodRecord[]`, individual records | Data Platform |
| `foodEventRepository` (`src/lib/repositories/foodEventRepository.ts`) | Persist and query meal logs with compound indexes, handle edits/deletes, enforce validation (portion enums, meal types) | Input: `FoodEventDraft`; Output: `FoodEventRecord[]`, stats summaries | Data Platform |
| `foodSeedService` (`src/lib/services/food/seedFoodsService.ts`) | Install 200+ preset foods during Dexie v11 upgrade, map allergen taxonomy, ensure idempotent seeding | Input: `userId`; Output: seeding status | Platform Ops |
| `foodFavoritesService` (`src/lib/services/food/favoritesService.ts`) | Manage favorite links stored in `UserPreferences.foodFavorites`, expose ranked lists for quick-log UI | Input: `userId`, `foodId`; Output: updated preferences | Domain |
| `FoodContext` + `FoodProvider` (`src/lib/hooks/useFoodContext.tsx`) | Cache foods/events in memory, expose hooks (`useFoods`, `useFoodEvents`, `useFoodHistoryFilters`) with Dexie subscriptions | Input: Dexie observables; Output: React context values | Frontend |
| `FoodLogModal` (`src/components/food/FoodLogModal.tsx`) | Guided meal logging UI with search, portion sliders, allergen chips, photo picker, and validation messaging | Input: context data, callbacks; Output: create/update actions | Frontend |
| `MealComposer` (`src/components/food/MealComposer.tsx`) | Multi-select builder for meals, handles grouping of foods, quantity capture, and combination metadata persisted to event record | Input: selected foods; Output: normalized payload passed to repository | Frontend |
| `QuickLogButtons` enhancement (`src/components/quick-log/QuickLogButtons.tsx`) | Adds “Food” button with accessible iconography and instrumentation parity with existing quick-log actions | Input: `onLogFood`; Output: event handler invocation | Frontend |
| `TimelineView` adapter (`src/components/timeline/TimelineView.tsx`) | Extend timeline to render food events, iconography, expandable details, edit affordances | Input: `foodEventRepository` results; Output: merged `TimelineEvent[]` | Frontend |
| `FoodHistoryPanel` (`src/components/food/FoodHistoryPanel.tsx`) | Search and filter UI (date range, meal type, allergen tag) with IndexedDB-backed pagination and favorite toggles | Input: filter state; Output: filtered list rendering | Frontend |

### Data Models and Contracts

```typescript
// src/lib/db/schema.ts additions
export interface FoodRecord {
  id: string;
  userId: string;
  name: string;
  category: string; // JSON string persisted as category metadata
  allergenTags: string; // JSON-stringified string[] per local-first convention
  preparationMethod?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FoodEventRecord {
  id: string;
  userId: string;
  mealId: string; // uuid links grouped foods
  foodIds: string; // JSON-stringified string[]
  timestamp: number; // epoch ms
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portionMap: string; // JSON-stringified Record<foodId, PortionSize>
  notes?: string;
  photoIds?: string; // JSON-stringified string[] referencing photoAttachments
  favoritesSnapshot?: string; // JSON-stringified foodIds favorited when logged
  createdAt: number;
  updatedAt: number;
}

type PortionSize = 'small' | 'medium' | 'large';
```

- **Dexie migration:** introduce version 11 with stores: `foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]"` and `foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]"`. Seed defaults inside `upgrade()` guard.
- **Favorites storage:** extend `UserPreferences` with `foodFavorites?: string[]` and persist via `userRepository.updatePreferences`.
- **Server event stream:** augment Prisma `Event` model `eventType` union to include `"food"` and serialize the same payload stored in Dexie `data` JSON for sync parity.

### APIs and Interfaces

- `foodRepository`
  - `getAll(userId: string): Promise<FoodRecord[]>`
  - `search(userId: string, query: string, filters: FoodFilters): Promise<FoodRecord[]>`
  - `create(food: FoodDraft): Promise<string>` (validates allergen taxonomy)
  - `update(id: string, changes: Partial<FoodDraft>): Promise<void>`
  - `archive(id: string): Promise<void>` (sets `isActive = false`)
- `foodEventRepository`
  - `create(event: FoodEventDraft): Promise<string>` (ensures timestamp + at least one food)
  - `update(id: string, changes: Partial<FoodEventDraft>): Promise<void>`
  - `delete(id: string): Promise<void>`
  - `findByDateRange(userId: string, start: number, end: number): Promise<FoodEventRecord[]>`
  - `findByMealType(userId: string, mealType: MealType): Promise<FoodEventRecord[]>`
  - `getFavoritesUsage(userId: string): Promise<Record<string, number>>`
- `foodFavoritesService`
  - `toggleFavorite(userId: string, foodId: string): Promise<FoodRecord>`
  - `getFavorites(userId: string, limit?: number): Promise<FoodRecord[]>`
- `foodHistoryService`
  - `queryHistory(userId: string, filters: FoodHistoryFilters): Promise<PaginatedResult<FoodEventRecord>>`
  - `hydrateMeals(events: FoodEventRecord[]): Promise<MealDisplayModel[]>`
- `FoodContext`
  - `useFoods()`, `useFoodEvents(range)`, `useFoodFilters()`, `useFavoriteFoods()` return memoized values and dispatchers for UI.
- Background sync hook (`src/lib/services/food/foodSyncService.ts`)
  - `queueForSync(eventId: string): Promise<void>`
  - `flush(userId: string): Promise<SyncResult>`; invoked on connectivity regain or scheduled worker.
- API Route `POST /api/sync/food-events`
  - **Request:** `{ userId: string; events: SyncedFoodEvent[] }`
  - **Response:** `{ success: true; synced: number; conflicts: ConflictResolution[] }`
  - Validates signature, upserts to Prisma `Event`, and returns conflict diagnostics for retries.

### Workflows and Sequencing

1. **Quick Log Flow**
   1. User taps new "Food" quick-log button.
   2. `FoodLogModal` loads favorites + recent foods from `FoodContext` cache.
   3. User selects foods, optionally toggles portion sizes, attaches notes/photos; validation ensures at least one food.
   4. `foodEventRepository.create` writes to Dexie (<500ms), `foodSyncService.queueForSync` schedules server push, and toast confirms save.
   5. `TimelineView` hears Dexie change event and rehydrates UI with new entry without page reload.

2. **Meal Composition with Photo Encryption**
   1. From modal, user taps "Add Photo" → delegates to existing `photoRepository` to encrypt and persist.
   2. Photo id appended to `FoodEventDraft.photoIds`; after event creation, thumbnails appear in timeline event detail.
   3. Deleting photo triggers `photoRepository.delete` and event update to remove stale ids.

3. **Food History Search & Favorites**
   1. User opens Food History panel from dashboard (link near quick-log section) or timeline filter.
   2. Panel applies search query, allergen tag, meal type, or date range; `foodHistoryService.queryHistory` leverages `[userId+timestamp]` and in-memory filtering for tags stored as JSON.
   3. Tapping star icon calls `foodFavoritesService.toggleFavorite`, updating preferences and triggering context refresh to bubble favorites to top of quick-log suggestions.

4. **Dexie Migration & Seed**
   1. App bootstraps Dexie v11 upgrade; `foodSeedService` checks sentinel key in `foods` table to avoid reseeding.
   2. Seed routine batches inserts (chunks of 50) to avoid blocking main thread, using `Dexie.bulkAdd` inside transaction.
   3. Migration ensures `isDefault = true`, `isActive = true`, `preparationMethod` default `"standard"` when unspecified.

5. **Edit / Delete Food Events**
   1. Timeline event or history panel exposes "Edit" / "Delete" options.
   2. Edit re-opens modal pre-filled with event data. On save, `foodEventRepository.update` adjusts Dexie record and enqueues sync update.
   3. Delete sets `deletedAt` flag (soft delete) in Dexie for audit trail while removing from default timeline queries; server sync marks event as inactive via API payload.

## Non-Functional Requirements

### Performance
- Quick-log modal must open and persist a meal within 500ms on median devices; Dexie write + UI acknowledgement tracked via performance marks.
- Search/filter operations should return results <250ms for 5-year datasets (use indexed queries first, then in-memory tag filtering).
- Meal composer virtualization ensures large default catalog (200+ foods) renders under 16ms per frame.

### Security
- Food photos leverage existing AES-256-GCM encryption utilities; reuse IV/key handling, ensuring keys imported before encrypting.
- All Dexie mutations validated client-side; API sync route enforces userId header + payload schema (zod validator) to prevent tampering.
- Apply consistent allergen color coding and avoid storing PII beyond food metadata; notes remain local unless explicitly exported.

### Reliability/Availability
- Offline-first: all CRUD actions succeed without network; sync queue retries with exponential backoff when connectivity resumes.
- Soft-delete semantics maintain audit trail (`isActive` flag for foods, `softDelete` flag for events) to avoid data loss.
- Background sync job logs failures and caps queue size (e.g., 500 events) with user notification when threshold exceeded.

### Observability
- Instrument quick-log success/failure counts via existing analytics logging utility; include latency metrics and sync queue depth gauges.
- Log Dexie migration start/end and seeding stats to console in dev and to lightweight telemetry object stored in IndexedDB for support export.
- API route emits structured logs (`food-sync`) with counts, conflicts, and timing for production monitoring.

## Dependencies and Integrations

- **Dexie 4.2.0** – new version 11 schema (foods, foodEvents) and bulk seeding transactions.
- **uuid 13.x** – generate `mealId` and entity ids; already in dependencies.
- **lucide-react** – add consistent food iconography (e.g., `Utensils`) to quick-log and timeline.
- **Existing photo encryption utilities** (`src/lib/utils/photos/encryption.ts`) – reused without modification.
- **userRepository** – extended `updatePreferences` to persist `foodFavorites` array and favorites timestamp for analytics.
- **timeline + quick-log components** – integrated to surface food events uniformly with other event types.
- **Vercel Postgres via Prisma** – leverage existing connection; add migration `20251016_add_food_event_tables` to extend `Event` type and insert seeded catalog snapshot for server-side analytics (read-only copy).

## Acceptance Criteria (Authoritative)

1. Dashboard quick-log displays a "Food" button with accessible label, and pressing it opens the food logging modal in <500ms (FR001, FR005).
2. Food logging modal lists 200+ default foods with name search, category filter pills, and allergen tags rendered consistently (FR002, FR016).
3. Users can add custom foods with required name, optional category, preparation method, and allergen tags; custom items appear in search with a "Custom" badge (FR003, FR015).
4. Logging a meal allows selecting multiple foods, capturing meal type, portions, and notes in a single submission that persists locally without network (FR004, FR015).
5. Users can attach, view, and remove encrypted food photos from logs; thumbnails surface in timeline entries (FR017).
6. Food events appear in the timeline with distinct iconography, chronological ordering, expandable detail view, and edit/delete controls (FR005, FR012).
7. Users can search and filter food history by name, date range, meal type, or allergen tag, with favorites pinned to the top of suggestion lists (FR009, FR010, FR020).
8. Marking a food as favorite updates quick-log suggestions and persists preference across sessions (FR010).
9. Food events write to Dexie `foodEvents` and queue for server sync into the unified event stream with millisecond timestamps (FR003, FR011).
10. Editing or deleting a food log updates the audit trail (timestamped `updatedAt`) and maintains consistency between timeline, history panel, and Dexie records (FR012).

## Traceability Mapping

| AC | Spec Sections | Components / APIs | Test Ideas |
| --- | --- | --- | --- |
| 1 | Services & Modules, Workflows (Quick Log Flow), Performance NFR | `QuickLogButtons`, `FoodLogModal`, performance marks | Measure modal open + save latency with Jest + React Testing Library perf hooks |
| 2 | Data Models, Services & Modules, Workflows (Dexie Migration) | `foodRepository`, seed data JSON | Snapshot tests ensuring catalog length ≥200; allergen tag rendering assertions |
| 3 | Services & Modules, Data Models | `foodRepository.create/update`, `FoodLogModal` | Repository unit tests for validation; UI test verifying custom badge |
| 4 | Workflows (Quick Log Flow, Meal Composition) | `MealComposer`, `foodEventRepository.create` | Integration test ensuring multiple foods persisted with mealId + portion map |
| 5 | Services & Modules, Security NFR | `photoRepository`, `FoodLogModal` | Mock encryption pipeline in unit test; UI test for thumbnail presence |
| 6 | Timeline adapter, Workflows (Edit/Delete) | `TimelineView` extension, `foodEventRepository.update/delete` | Timeline render tests with food icon; edit/delete actions update Dexie |
| 7 | FoodHistoryPanel, Data Models (indexes) | `foodHistoryService`, `FoodHistoryPanel` | Filtered queries return expected results; favorites pinned in UI |
| 8 | FoodFavoritesService, Workflows (History Search) | `foodFavoritesService.toggleFavorite`, `FoodContext` | Unit test verifying favorites persisted in preferences |
| 9 | Data Models, APIs & Interfaces | `foodEventRepository`, `foodSyncService`, `/api/sync/food-events` | Verify stored timestamps have ms precision; sync queue test ensures payload serialized |
| 10 | Workflows (Edit/Delete), Reliability NFR | `foodEventRepository.update`, `TimelineView` | Unit test ensuring `updatedAt` increments; UI test verifying deletion hides from timeline|

## Risks, Assumptions, Open Questions

- **Risk:** Dexie seeding of 200+ foods could block the main thread on low-end devices. *Mitigation:* batch inserts (chunks of 50) with `await Dexie.scheduler.yield()` between batches and show non-blocking loader during first run.
- **Risk:** Meal logs storing large photo blobs may exceed local storage quotas. *Mitigation:* enforce single photo per meal in UI, display storage usage indicator, reuse thumbnail compression pipeline.
- **Assumption:** Single-user model (`userRepository.getOrCreateCurrentUser`) remains valid; multi-user sync is future work.
- **Assumption:** Allergen taxonomy (dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish) stays stable across releases; changes require reseeding script update.
- **Question:** Should server sync happen immediately after each log or via scheduled background task? Recommendation: attempt immediate sync when online, fallback to periodic flush (discuss with Infra before implementation).
- **Question:** Do we need undo for accidental meal logs? If yes, scope into dashboard toast with "Undo" before event enters sync queue.

## Test Strategy Summary

- **Unit Tests:** repositories (`foodRepository`, `foodEventRepository`) validating data transformations, favorites toggling, and index usage; services for seeding and sync queuing.
- **Component Tests:** React Testing Library coverage for `FoodLogModal`, `MealComposer`, `FoodHistoryPanel`, ensuring accessibility (ARIA labels, keyboard navigation) and responsive layout compliance.
- **Integration Tests:** Simulate quick-log flow end-to-end verifying Dexie persistence, timeline refresh, and edit/delete scenarios; mock photo attachments to confirm encryption hooks invoked.
- **Performance Tests:** Measure modal open/save latency and search responsiveness with mocked large datasets to ensure <500ms / <250ms thresholds.
- **Accessibility Audits:** Automated axe checks plus manual keyboard testing for quick-log button, modal, and filters to meet WCAG 2.1 AA (NFR005).
- **Sync Tests:** Mock `/api/sync/food-events` endpoint to validate payload schema, conflict handling, and retry logic in offline/online transitions.
