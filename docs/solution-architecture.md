# Solution Architecture - Flare Tracking & Body Map Enhancements

**Project:** symptom-tracker
**Author:** Steven
**Date:** 2025-10-18
**Track:** method
**Field Type:** brownfield

---

## Executive Summary

**Scope:** Enhance existing symptom tracker with precision body mapping and comprehensive flare lifecycle tracking.

**Approach:** Brownfield enhancement leveraging existing Next.js/React/Dexie infrastructure. Minimal schema changes, focused UI/analytics additions.

**Key Changes:**
- Add groin regions + zoom/pan to existing body map SVG
- Extend FlareRecord with coordinate linking
- New analytics service layer for problem area detection
- Enhanced UI components for flare management

**Impact:** Transforms basic flare logging into precision medical-grade tracking system.

---

## Technology Stack and Library Decisions

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Framework** | Next.js | 15.5.4 | Existing - App Router with RSC |
| **Runtime** | React | 19.1.0 | Existing - Latest stable |
| **Language** | TypeScript | 5.x | Existing - Type safety |
| **Styling** | Tailwind CSS | 4.x | Existing - Utility-first |
| **Database** | Dexie | 4.2.0 | Existing - IndexedDB wrapper |
| **Charts** | Chart.js | 4.5.0 | Existing - Extend for analytics |
| **Chart Plugins** | chartjs-plugin-annotation | 3.1.0 | Existing - Timeline annotations |
| **Icons** | Lucide React | 0.544.0 | Existing - Consistent iconography |
| **SVG Manipulation** | react-zoom-pan-pinch | 3.6.1 | **NEW** - Body map zoom/pan |
| **UUID** | uuid | 13.0.0 | Existing - Flare IDs |
| **Testing** | Jest + RTL | 30.x + 16.x | Existing - Unit + integration |
| **IndexedDB Mock** | fake-indexeddb | 6.2.4 | Existing - Test infrastructure |

**New Dependency:** `react-zoom-pan-pinch` for declarative SVG pan/zoom without D3 overhead.

---

## Repository and Service Architecture

**Repository Strategy:** Monorepo (existing)

**Project Structure:** Next.js App Router

```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/       # Authenticated routes
│   │   ├── body-map/      # NEW: Enhanced body map page
│   │   ├── flares/        # NEW: Flare management
│   │   │   ├── page.tsx           # Active flares list
│   │   │   ├── [id]/              # Flare detail
│   │   │   ├── analytics/         # Analytics dashboard
│   │   │   └── resolved/          # Archive
│   └── api/               # API routes (if needed)
├── components/
│   ├── body-map/          # NEW: Body map components
│   │   ├── BodyMapInteractive.tsx
│   │   ├── BodyMapZoom.tsx
│   │   ├── CoordinateCapture.tsx
│   │   ├── FlareMarkers.tsx
│   │   └── regions/              # SVG region definitions
│   ├── flares/            # NEW: Flare management
│   │   ├── FlareList.tsx
│   │   ├── FlareDetail.tsx
│   │   ├── FlareTimeline.tsx
│   │   ├── FlareCreateModal.tsx
│   │   ├── FlareUpdateModal.tsx
│   │   └── InterventionLog.tsx
│   ├── analytics/         # NEW: Analytics components
│   │   ├── ProblemAreasView.tsx
│   │   ├── MetricsDashboard.tsx
│   │   ├── FlareT rendChart.tsx
│   │   └── InterventionEffectiveness.tsx
│   └── ui/                # Existing: Shared UI primitives
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Existing - minor updates
│   │   └── database.ts           # Existing Dexie instance
│   ├── repositories/      # Existing pattern
│   │   ├── flareRepository.ts    # Extend existing
│   │   ├── bodyMapRepository.ts  # NEW
│   │   └── analyticsRepository.ts # NEW
│   ├── services/          # Existing pattern
│   │   ├── flareService.ts       # NEW
│   │   ├── bodyMapService.ts     # NEW
│   │   └── analyticsService.ts   # NEW
│   ├── utils/
│   │   ├── coordinates.ts        # NEW: Coordinate transforms
│   │   └── statistics/           # Existing - extend
│   └── hooks/             # Existing pattern
│       ├── useFlares.ts          # NEW
│       ├── useBodyMap.ts         # NEW
│       └── useAnalytics.ts       # NEW
└── types/                 # Existing
    └── flare.ts                  # NEW: Type definitions
```

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js App (RSC)                  │
│  ┌──────────────────────────────────────────────┐  │
│  │         Client Components (Interactive)       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────┐ │  │
│  │  │  Body Map  │  │   Flare    │  │Analytics│ │  │
│  │  │ Interactive│  │ Management │  │Dashboard│ │  │
│  │  └─────┬──────┘  └──────┬─────┘  └────┬────┘ │  │
│  │        │                 │             │      │  │
│  │  ┌─────▼─────────────────▼─────────────▼────┐ │  │
│  │  │          Service Layer (Hooks)           │ │  │
│  │  │  useFlares │ useBodyMap │ useAnalytics  │ │  │
│  │  └──────────────────┬───────────────────────┘ │  │
│  └───────────────────  ─│─────────────────────────┘  │
│                         │                            │
│  ┌──────────────────────▼──────────────────────────┐ │
│  │           Repository Layer (Dexie)              │ │
│  │  flareRepo │ bodyMapRepo │ analyticsRepo       │ │
│  └──────────────────────┬──────────────────────────┘ │
│                         │                            │
└─────────────────────────┼────────────────────────────┘
                          │
                  ┌───────▼────────┐
                  │   IndexedDB    │
                  │  (Offline PWA) │
                  └────────────────┘
```

### Data Flow

**Flare Creation Flow:**
```
User selects body map region → Zoom component → Coordinate capture
  → FlareCreateModal → flareService.createFlare()
  → flareRepository.create() → Dexie → IndexedDB
  → React Query invalidation → UI update
```

**Analytics Calculation Flow:**
```
Analytics page load → useAnalytics hook
  → analyticsService.getProblemAreas()
  → analyticsRepository.aggregateByRegion()
  → Dexie query (indexed by bodyRegionId)
  → Return aggregated metrics → Chart.js visualization
```

---

## Data Architecture

### Schema Extensions

**Minimal changes to existing schema:**

```typescript
// EXISTING: FlareRecord (minor extension)
interface FlareRecord {
  // ... existing fields ...
  bodyRegionId: string;  // PRIMARY region
  coordinates?: {        // NEW: Link to precise location
    x: number;          // Normalized 0-1
    y: number;          // Normalized 0-1
  };
}

// EXISTING: BodyMapLocationRecord (already supports coordinates)
interface BodyMapLocationRecord {
  id: string;
  bodyRegionId: string;
  coordinates?: { x: number; y: number }; // ✅ Already exists!
  severity: number;
  // ... existing fields ...
}

// NEW: Body region enum extension
enum BodyRegion {
  // ... existing regions ...
  LEFT_GROIN = 'left-groin',
  RIGHT_GROIN = 'right-groin',
  CENTER_GROIN = 'center-groin'
}
```

**Analytics Data Model (calculated, not stored):**

```typescript
interface ProblemArea {
  bodyRegionId: string;
  bodyRegionName: string;
  flareCount: number;
  averageDuration: number;
  averageSeverity: number;
  recurrenceRate: number; // flares/90days
}

interface FlareMetrics {
  totalFlares: number;
  activeFlares: number;
  averageDuration: number;
  medianDuration: number;
  severityDistribution: Record<string, number>;
  trendStatus: 'improving' | 'stable' | 'declining';
}
```

### Dexie Indexes

**Existing indexes** (already optimized):
- `flares`: `[userId+status]`, `[userId+bodyRegionId]`
- `bodyMapLocations`: `[userId+bodyRegionId]`

**No new indexes needed** - existing compound indexes support analytics queries.

---

## Component Architecture

### Body Map Enhancement (Epic 1)

**BodyMapInteractive.tsx** - Main component
```typescript
<TransformWrapper>
  <TransformComponent>
    <svg viewBox="0 0 800 1200">
      <BodyRegions onRegionClick={handleZoom} />
      <FlareMarkers flares={activeFlares} />
    </svg>
  </TransformComponent>
</TransformWrapper>
```

**Key Props:**
- `selectedRegion`: string | null
- `onCoordinateSelect`: (coords: {x, y}) => void
- `activeFlares`: FlareRecord[]
- `zoomEnabled`: boolean

**State Management:**
- Local state for zoom level, pan position
- React Query for flare data
- No global state needed

### Flare Management (Epic 2)

**FlareList.tsx** - Dashboard
```typescript
const { flares, isLoading } = useFlares({ status: 'active' });
// Table view with quick actions
```

**FlareDetail.tsx** - Detail/timeline view
```typescript
const { flare, history } = useFlare(flareId);
// Timeline chart + intervention log
```

**FlareTimeline.tsx** - Severity progression chart
```typescript
<Line data={severityHistory} options={chartConfig} />
// Chart.js with annotation plugin for interventions
```

### Analytics (Epic 3)

**ProblemAreasView.tsx** - Heat map or ranked list
```typescript
const { problemAreas } = useAnalytics({ timeRange: '90d' });
// Bar chart or body map overlay
```

**MetricsDashboard.tsx** - Aggregate metrics
```typescript
const { metrics } = useFlareMetrics({ timeRange });
// KPI cards + distribution charts
```

---

## API Design

**No backend API needed** - Pure client-side PWA with IndexedDB.

**Service Layer APIs:**

```typescript
// flareService.ts
interface FlareService {
  createFlare(data: CreateFlareDTO): Promise<FlareRecord>;
  updateFlare(id: string, update: UpdateFlareDTO): Promise<FlareRecord>;
  resolveFlare(id: string, notes?: string): Promise<FlareRecord>;
  getActiveFlares(userId: string): Promise<FlareRecord[]>;
  getFlareHistory(flareId: string): Promise<FlareEvent[]>;
}

// analyticsService.ts
interface AnalyticsService {
  getProblemAreas(userId: string, timeRange: string): Promise<ProblemArea[]>;
  getFlareMetrics(userId: string, timeRange: string): Promise<FlareMetrics>;
  getInterventionEffectiveness(userId: string): Promise<InterventionStats[]>;
}

// bodyMapService.ts
interface BodyMapService {
  normalizeCoordinates(region: string, rawCoords: {x, y}): {x, y};
  denormalizeCoordinates(region: string, normCoords: {x, y}): {x, y};
  getRegionMetadata(regionId: string): BodyRegionMeta;
}
```

---

## Cross-Cutting Concerns

### Performance

**Target:** <100ms interaction latency (NFR001)

**Optimizations:**
- React.memo for body map SVG (prevents re-render on zoom)
- Virtual scrolling for flare lists (>100 items)
- Debounced zoom/pan handlers
- Lazy-loaded analytics charts
- Dexie indexes for O(log n) queries

**Monitoring:**
```typescript
// Performance wrapper for critical interactions
const measureInteraction = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  if (duration > 100) console.warn(`Slow: ${name} ${duration}ms`);
};
```

### Offline Support

**Strategy:** Offline-first (existing pattern)

- All Dexie writes use immediate persistence (NFR002)
- Service Worker caches app shell (existing PWA)
- No network dependency for core features
- Photo encryption/decryption client-side (existing)

### Data Integrity

**Immutability (NFR003):**
```typescript
// FlareEvent history is append-only
const addFlareEvent = (flareId: string, event: FlareEvent) => {
  // Never modify existing severityHistory array
  await db.flares.update(flareId, {
    severityHistory: [...existing.severityHistory, event],
    updatedAt: Date.now()
  });
};
```

**Validation:**
- Zod schemas for all DTOs
- Severity range validation (1-10)
- Coordinate bounds validation (0-1 normalized)
- Timestamp monotonicity checks

### Accessibility

- ARIA labels on all body map regions
- Keyboard navigation for zoom (+ /- keys)
- Screen reader announcements for flare status changes
- Focus management in modals
- Color-blind safe palette for severity indicators

### Testing Strategy

**Unit Tests:**
- Service layer logic (Dexie mocked with fake-indexeddb)
- Coordinate transformation functions
- Analytics aggregation calculations

**Integration Tests:**
- Flare CRUD workflows
- Body map coordinate capture flow
- Analytics query performance

**E2E (if needed):**
- Complete flare lifecycle (create → update → resolve)
- Body map interaction flow

**Coverage Target:** 80% for service/util layers

---

## Epic-Component-Data Mapping

### Epic 1: Body Map Precision Tracking (6 stories)

**Components:**
- `BodyMapInteractive` - Main zoom/pan wrapper
- `BodyRegions` - SVG path definitions (add groin)
- `CoordinateCapture` - Click/tap coordinate extraction
- `FlareMarkers` - Overlay flares on map
- `BodyMapAccessibility` - Keyboard nav + ARIA

**Services:**
- `bodyMapService` - Coordinate transforms, region metadata

**Data:**
- `BodyRegion` enum extension (groin regions)
- `FlareRecord.coordinates` link

**Acceptance Criteria:**
- Groin regions selectable on front view
- Zoom 1x-3x smooth on mobile/desktop
- Pan constrained to SVG bounds
- Coordinates normalized 0-1 scale
- Flare markers update real-time

---

### Epic 2: Flare Lifecycle Management (8 stories)

**Components:**
- `FlareList` - Active/resolved lists
- `FlareDetail` - Detail view with tabs
- `FlareCreateModal` - Wizard from body map
- `FlareUpdateModal` - Severity/trend/intervention
- `FlareTimeline` - Chart.js timeline
- `InterventionLog` - Log ice/meds/rest

**Services:**
- `flareService` - Business logic for CRUD + state transitions

**Repositories:**
- `flareRepository` - Dexie operations on FlareRecord

**Data:**
- `FlareRecord` (existing schema, minor extensions)
- `FlareEvent` type (part of severityHistory)

**Acceptance Criteria:**
- Create flare with UUID, location, severity
- Update creates immutable history entry
- Resolve sets endDate, moves to archive
- Timeline shows severity progression chart
- Interventions logged with timestamps

---

### Epic 3: Flare Analytics (5 stories)

**Components:**
- `ProblemAreasView` - Ranked list or heat map
- `PerRegionHistory` - Drill-down per region
- `MetricsDashboard` - KPIs + charts
- `FlareT rendChart` - Time-series line chart
- `InterventionEffectiveness` - Correlation view

**Services:**
- `analyticsService` - Metrics calculation, aggregations

**Repositories:**
- `analyticsRepository` - Complex Dexie queries

**Data:**
- `ProblemArea` interface (calculated)
- `FlareMetrics` interface (calculated)
- `InterventionStats` interface (calculated)

**Acceptance Criteria:**
- Problem areas ranked by flare count (90d)
- Metrics: avg duration, severity distribution
- Trend line indicates improving/stable/declining
- Intervention effectiveness with caveat disclaimer
- Time range selector: 30d/90d/1y/all

---

### Epic 4: Photo Integration (4 stories) - Lower Priority

**Components:**
- `PhotoTimeline` - Chronological photo grid
- `PhotoComparison` - Side-by-side with slider
- `PhotoAnnotation` - Simple text/arrow tools

**Services:**
- `photoService` - Extend existing for flare linking

**Data:**
- `PhotoAttachmentRecord.relatedFlareId` (add foreign key)

**Acceptance Criteria:**
- Photos linked to flareId
- Timeline sorted by capturedAt
- Comparison shows before/after
- Annotations encrypted with photo

---

## Architecture Decision Records (ADRs)

### ADR-001: Use react-zoom-pan-pinch for Body Map

**Context:** Need smooth zoom/pan on SVG body map for mobile and desktop.

**Decision:** Use `react-zoom-pan-pinch` library.

**Rationale:**
- Declarative React API (vs imperative D3)
- Built-in mobile gesture support
- Small bundle (15KB)
- Active maintenance
- Works with SVG/Canvas/HTML

**Alternatives Considered:**
- D3.js zoom: Imperative, larger bundle, overkill
- Custom implementation: Risk of gesture edge cases

**Consequences:**
- New dependency
- Must normalize coordinates relative to transform scale

---

### ADR-002: No Global State Management

**Context:** Flare and body map data needs state management.

**Decision:** Use React Query + local component state only.

**Rationale:**
- Data is user-scoped (no sharing between users)
- React Query handles cache/optimistic updates
- No complex derived state needs
- Keeps bundle small

**Alternatives Considered:**
- Zustand: Overhead for simple use case
- Redux: Massive overkill

**Consequences:**
- Props drilling for zoom state (acceptable - shallow tree)
- React Query handles all server state (IndexedDB)

---

### ADR-003: Append-Only Flare History

**Context:** Need immutable flare severity history (NFR003).

**Decision:** FlareRecord.severityHistory is append-only array.

**Rationale:**
- Medical data integrity
- Audit trail for progression
- Simple to implement with Dexie
- Prevents accidental data loss

**Implementation:**
```typescript
// Never mutate existing array
await db.flares.update(id, {
  severityHistory: [...existing.severityHistory, newEvent]
});
```

**Consequences:**
- Array grows unbounded (acceptable - 10 entries/year typical)
- No edit/delete of historical events

---

### ADR-004: Analytics Calculated On-Demand

**Context:** Problem areas and metrics need aggregation across flares.

**Decision:** Calculate analytics on page load, no pre-aggregation.

**Rationale:**
- Data set small (<1000 flares per user realistic)
- Dexie indexes make queries fast (<10ms)
- Avoids complex cache invalidation
- Simpler implementation

**Alternatives Considered:**
- Pre-aggregate on write: Complex, cache invalidation bugs
- Background worker: Overkill for data size

**Consequences:**
- Analytics page load: ~50ms for aggregations
- Must memoize expensive calculations

---

### ADR-005: Groin Regions as Separate SVG Paths

**Context:** Need to add groin regions to existing body map SVG.

**Decision:** Define groin as 3 separate clickable SVG paths (left/right/center).

**Rationale:**
- Matches existing pattern (all regions are separate paths)
- Allows precise click detection
- Enables future per-region styling

**SVG Structure:**
```xml
<g id="groin-regions">
  <path id="left-groin" d="..." />
  <path id="center-groin" d="..." />
  <path id="right-groin" d="..." />
</g>
```

**Consequences:**
- Must update BodyRegion enum
- Must add 3 new SVG paths to front body view

---

## Implementation Guidance

### Development Workflow

1. **Epic 1 (Body Map):** Foundation - implement first
   - Story 1.1: Add groin SVG paths
   - Story 1.2-1.3: Zoom/pan component
   - Story 1.4: Coordinate capture
   - Story 1.5: Flare markers
   - Story 1.6: Accessibility

2. **Epic 2 (Lifecycle):** Core feature
   - Story 2.1: Schema/repository setup
   - Story 2.2: Create flare flow
   - Story 2.3: Active flares list
   - Story 2.4-2.5: Update UI
   - Story 2.6: Timeline chart
   - Story 2.7-2.8: Resolution flow

3. **Epic 3 (Analytics):** Value-add
   - Story 3.1: Problem areas
   - Story 3.2: Per-region history
   - Story 3.3-3.5: Metrics/charts

4. **Epic 4 (Photos):** Polish
   - Integrate with existing photo system

### Testing Priorities

**Critical Path (must test):**
- Flare CRUD operations
- Coordinate normalization
- Analytics aggregations
- Immutable history appends

**Important (should test):**
- Zoom/pan interactions
- Chart rendering
- Photo linking

**Nice-to-have:**
- Accessibility edge cases
- Performance benchmarks

### Performance Benchmarks

**Target Metrics:**
- Zoom interaction: <50ms (NFR001: <100ms)
- Flare list render: <100ms for 100 items
- Analytics calculation: <200ms for 1000 flares
- Photo timeline: <300ms for 50 photos

**Measurement:**
```typescript
// Wrap critical paths
performance.mark('flare-create-start');
await flareService.createFlare(data);
performance.mark('flare-create-end');
performance.measure('flare-create', 'flare-create-start', 'flare-create-end');
```

---

## Proposed Source Tree

```
src/
├── app/
│   ├── (protected)/
│   │   ├── body-map/
│   │   │   └── page.tsx                    # NEW: Interactive body map
│   │   ├── flares/
│   │   │   ├── page.tsx                    # NEW: Active flares list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                # NEW: Flare detail
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx                # NEW: Analytics dashboard
│   │   │   └── resolved/
│   │   │       └── page.tsx                # NEW: Resolved archive
│   │   └── ... (existing pages)
│   └── api/                                 # Existing (no new API routes needed)
├── components/
│   ├── body-map/                            # NEW
│   │   ├── BodyMapInteractive.tsx
│   │   ├── BodyMapZoom.tsx
│   │   ├── CoordinateCapture.tsx
│   │   ├── FlareMarkers.tsx
│   │   └── regions/
│   │       ├── FrontBody.tsx                # Updated: Add groin paths
│   │       ├── BackBody.tsx
│   │       └── types.ts
│   ├── flares/                              # NEW
│   │   ├── FlareList.tsx
│   │   ├── FlareCard.tsx
│   │   ├── FlareDetail.tsx
│   │   ├── FlareTimeline.tsx
│   │   ├── FlareCreateModal.tsx
│   │   ├── FlareUpdateModal.tsx
│   │   ├── InterventionLog.tsx
│   │   └── StatusBadge.tsx
│   ├── analytics/                           # NEW
│   │   ├── ProblemAreasView.tsx
│   │   ├── PerRegionHistory.tsx
│   │   ├── MetricsDashboard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── FlareTrendChart.tsx
│   │   └── InterventionEffectiveness.tsx
│   └── ui/                                  # Existing
│       └── ... (shared primitives)
├── lib/
│   ├── db/
│   │   ├── schema.ts                        # Updated: Groin regions, coordinates link
│   │   └── database.ts                      # Existing
│   ├── repositories/
│   │   ├── flareRepository.ts               # Updated: New queries
│   │   ├── bodyMapRepository.ts             # NEW
│   │   └── analyticsRepository.ts           # NEW
│   ├── services/
│   │   ├── flareService.ts                  # NEW
│   │   ├── bodyMapService.ts                # NEW
│   │   └── analyticsService.ts              # NEW
│   ├── utils/
│   │   ├── coordinates.ts                   # NEW: Transform utilities
│   │   └── statistics/
│   │       └── ... (existing)
│   └── hooks/
│       ├── useFlares.ts                     # NEW
│       ├── useFlare.ts                      # NEW
│       ├── useBodyMap.ts                    # NEW
│       └── useAnalytics.ts                  # NEW
├── types/
│   ├── flare.ts                             # NEW
│   ├── body-map.ts                          # NEW
│   └── analytics.ts                         # NEW
└── __tests__/                               # Existing pattern
    ├── services/
    │   ├── flareService.test.ts             # NEW
    │   ├── bodyMapService.test.ts           # NEW
    │   └── analyticsService.test.ts         # NEW
    └── utils/
        └── coordinates.test.ts              # NEW
```

**File Count Summary:**
- New pages: 5
- New components: ~20
- New services: 3
- New repositories: 2
- New hooks: 4
- New types: 3
- New tests: ~10

**Total New Files:** ~47 files (manageable for 23-story project)

---

## Next Steps

1. **Review Architecture** - Validate technical approach and decisions
2. **Install New Dependency** - `npm install react-zoom-pan-pinch@3.6.1`
3. **Generate Tech Specs** - Create per-epic technical specifications (auto-generated next)
4. **Begin Implementation** - Start with Epic 1 (Body Map foundation)

---

## Security Considerations

**Data Privacy:**
- All data stored locally in IndexedDB (existing pattern)
- Photo encryption with AES-256-GCM (existing system)
- No cloud sync = no data transmission
- HIPAA-conscious design (local-only medical data)

**Input Validation:**
- Sanitize all user inputs (notes, annotations)
- Validate coordinate ranges (0-1 normalized)
- Severity bounds checking (1-10)
- SQL injection N/A (no SQL database)

---

## DevOps & Deployment

**Build Process:** Standard Next.js build (existing)

**Environment:** Vercel deployment (existing)

**PWA Updates:**
- Service Worker cache invalidation on deploy
- IndexedDB schema migrations handled by Dexie

**Monitoring:**
- Performance marks for critical paths
- Console logging for development
- No external analytics (privacy-first)

---

## Testing Strategy

**Unit Tests (Jest + fake-indexeddb):**
```typescript
// Example: flareService.test.ts
describe('flareService', () => {
  it('creates flare with normalized coordinates', async () => {
    const flare = await flareService.createFlare({
      bodyRegionId: 'left-groin',
      coordinates: { x: 0.5, y: 0.7 },
      severity: 8
    });
    expect(flare.coordinates.x).toBe(0.5);
  });
});
```

**Integration Tests:**
```typescript
// Example: Flare lifecycle test
it('tracks flare from creation to resolution', async () => {
  const flare = await flareService.createFlare(data);
  await flareService.updateFlare(flare.id, { severity: 5 });
  await flareService.resolveFlare(flare.id);
  const resolved = await flareRepository.findById(flare.id);
  expect(resolved.status).toBe('resolved');
});
```

---

## Appendix: Reference Documentation

- **Next.js 15 Docs:** https://nextjs.org/docs
- **Dexie Documentation:** https://dexie.org
- **react-zoom-pan-pinch:** https://github.com/prc5/react-zoom-pan-pinch
- **Chart.js:** https://www.chartjs.org/docs/latest/
- **PRD:** `docs/PRD.md`
- **Epic Breakdown:** `docs/epics.md`

---

**Document Version:** 1.0
**Last Updated:** 2025-10-18
**Status:** Ready for Implementation
