# Solution Architecture Document

**Project:** symptom-tracker - Food Journal Feature
**Date:** 2025-10-16
**Author:** Steven

## Executive Summary

This architecture extends the existing symptom-tracker application with a Food Journal feature that enables users to log dietary intake and discover food-related symptom triggers through automated correlation analysis. The hybrid architecture leverages client-side (Dexie/IndexedDB) for offline-first food logging and server-side (PostgreSQL) for computationally intensive correlation analysis across extended time windows (15min-72hrs).

**Key Architectural Decisions:**
- **Hybrid data layer:** Client-side food capture, server-side correlation processing
- **Brownfield integration:** Extends existing event stream architecture without breaking changes
- **Performance optimization:** Background correlation jobs, result caching, incremental updates
- **Offline-first UX:** 200+ food database in IndexedDB, photo encryption, sync-when-online pattern

**Scope:** 2 epics, 15 stories, 20 functional requirements, 5 non-functional requirements

## 1. Technology Stack and Decisions

### 1.1 Technology and Library Decision Table

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| Framework | Next.js | 15.5.4 | Existing brownfield app, App Router for modern patterns |
| Language | TypeScript | 5.x | Type safety, existing codebase standard |
| UI Library | React | 19.1.0 | Existing stack, concurrent features for better UX |
| Styling | Tailwind CSS | 4.x | Existing stack, utility-first for rapid development |
| Client Database | Dexie | 4.2.0 | Existing stack, offline-first food database (200+ items) |
| Server Database | Vercel Postgres | Latest | Managed PostgreSQL, Vercel integration, serverless pooling |
| ORM | Prisma | 6.x | Type-safe queries, schema migrations, existing pattern compatibility |
| State Management | React Context + hooks | Built-in | Existing pattern (DashboardContext), lightweight, sufficient for scope |
| Auth | localStorage userId | Custom | Existing system, simple single-user local app |
| Icons | Lucide React | 0.544.0 | Existing stack, consistent iconography |
| Charts | Chart.js + react-chartjs-2 | 4.5.0 / 5.3.0 | Existing stack, correlation visualizations |
| Testing | Jest + React Testing Library | 30.x / 16.x | Existing stack, comprehensive coverage |
| Photo Storage | IndexedDB (encrypted blobs) | Native | Existing encryption infrastructure, local privacy |
| Correlation Engine | Custom (TypeScript) | N/A | Statistical methods (chi-square, Pearson), time-window analysis |
| Background Jobs | Vercel Cron + API routes | Native | Incremental correlation recalculation |
| Export | Custom service | N/A | Extend existing exportService for CSV/JSON/PDF |

**Additional Libraries:**

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| Utilities | uuid | 13.0.0 | Existing stack, unique IDs for food events |
| Annotations | chartjs-plugin-annotation | 3.1.0 | Existing stack, time-delay markers on correlation charts |
| Tooltips | @radix-ui/react-tooltip | 1.2.8 | Existing stack, accessible UI patterns |

## 2. Application Architecture

### 2.1 Architecture Pattern

**Hybrid Monolith with Client-Heavy Data Layer**

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Client)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  React Components (UI Layer)                        │ │
│  │  - FoodLogModal, TimelineView, CorrelationDashboard│ │
│  └───────────────────┬────────────────────────────────┘ │
│                      │                                   │
│  ┌───────────────────▼────────────────┐                 │
│  │  React Context (State Layer)       │                 │
│  │  - FoodContext, DashboardContext   │                 │
│  └───────────────────┬────────────────┘                 │
│                      │                                   │
│  ┌───────────────────▼────────────────────────────────┐ │
│  │  Dexie/IndexedDB (Local Database)                  │ │
│  │  - foods (200+ pre-populated + custom)             │ │
│  │  - foodEvents (logged consumption)                 │ │
│  │  - symptomInstances (existing)                     │ │
│  │  - photos (encrypted blobs)                        │ │
│  │  - correlationCache (read-only, synced from server)│ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ API Calls (correlation triggers, sync)
                       ▼
┌─────────────────────────────────────────────────────────┐
│             Next.js Server (Vercel)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  API Routes (/api/correlation/*)                    │ │
│  │  - POST /api/correlation/analyze                   │ │
│  │  - GET /api/correlation/results/:userId            │ │
│  │  - POST /api/export/food-journal                   │ │
│  └───────────────────┬────────────────────────────────┘ │
│                      │                                   │
│  ┌───────────────────▼────────────────┐                 │
│  │  Correlation Engine (Background)   │                 │
│  │  - Time-based analysis (8 windows) │                 │
│  │  - Statistical tests (p-values)    │                 │
│  │  - Confidence calculation          │                 │
│  │  - Dose-response analysis          │                 │
│  └───────────────────┬────────────────┘                 │
│                      │                                   │
│  ┌───────────────────▼────────────────────────────────┐ │
│  │  Vercel Postgres (via Prisma)                      │ │
│  │  - events (unified event stream)                   │ │
│  │  - correlations (computed results)                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. **Food Logging:** User logs food → Dexie (instant) → Background sync to Postgres
2. **Correlation Trigger:** New food/symptom event → API call → Enqueue correlation job
3. **Correlation Processing:** Background job → Query Postgres events → Compute correlations → Store results
4. **Correlation Display:** Dashboard loads → Fetch from correlationCache (IndexedDB) or API → Display with confidence badges

**Rationale:**
- **Client-first for UX:** 500ms response requirement (NFR001) demands local data
- **Server-side for compute:** 72-hour correlation windows across 100K+ events exceed browser capacity
- **Offline-capable:** Food logging works without connectivity
- **Existing pattern extension:** Event stream architecture already proven in codebase

### 2.2 Server-Side Rendering Strategy

**Hybrid: SSR for Shell + CSR for Dynamic Content**

- **SSR (Initial Load):** Dashboard shell, navigation, layout
- **CSR (Data Layer):** Timeline events, correlations, charts (client-side fetched)
- **Static:** Marketing pages, onboarding flows (if applicable)

**Food Journal Pages:**
- `/dashboard` - SSR shell + CSR food quick-log widget
- `/timeline` - SSR shell + CSR event stream (including food events)
- `/triggers` - SSR shell + CSR correlation dashboard
- All pages hydrate client-side for interactivity

### 2.3 Page Routing and Navigation

**Existing Routes (Enhanced):**
- `/dashboard` - Add food quick-log button
- `/log` - Daily Reflection (existing, unchanged)
- `/timeline` - Extend to render food events grouped by `mealId`, with collapsed/expanded meal entries and edit affordance (reopen FoodLogModal pre-filled)
- `/triggers` - Extend with food correlation tab

**No New Routes Required** - Food journal integrates into existing pages per UX design.

**Navigation Structure:**
```
Sidebar (existing):
├── Dashboard (+ food quick-log button)
├── Timeline (+ food events)
├── Trigger Analysis (+ food tab)
├── Daily Reflection
└── Settings
```

### 2.4 Data Fetching Approach

**Client-Side Data Fetching (React hooks + Dexie):**

```typescript
// Food events from IndexedDB
const { foodEvents, loading } = useFoodEvents(userId, dateRange);

// Correlation results (cached locally, sync from server)
const { correlations, refetch } = useCorrelations(userId);
```

**Server API Calls (when needed):**
- Trigger correlation analysis: `POST /api/correlation/analyze`
- Fetch latest correlations: `GET /api/correlation/results/:userId`
- Export data: `POST /api/export/food-journal`

**Pattern:** Optimistic UI updates (write to Dexie immediately, sync to server in background).

## 3. Data Architecture

### 3.1 Database Schema

**Client Database (Dexie/IndexedDB):**

```typescript
// New Tables
foods: {
  id: string;           // UUID
  userId: string;
  name: string;
  category: string;     // "dairy", "grains", "proteins", etc.
  allergenTags: string[]; // ["dairy", "gluten"]
  preparationMethod?: string; // "raw", "cooked", "fried"
  isDefault: boolean;   // true for pre-populated, false for custom
  isActive: boolean;
  createdAt: number;
}

foodEvents: {
  id: string;
  userId: string;
  foodIds: string[];    // References to foods table
  mealId?: string;      // Shared ID for multi-food meals
  timestamp: number;    // Consumption time (epoch ms)
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  portionSize?: "small" | "medium" | "large";
  quantity?: number;    // 1-3 mapping
  notes?: string;
  photoIds?: string[];  // References to existing photo table
  createdAt: number;
  updatedAt: number;
}

// Existing tables (unchanged):
symptomInstances, medications, triggers, dailyEntries, photos, users
```

**Server Database (Vercel Postgres via Prisma):**

```prisma
// Unified event stream (extend existing)
model Event {
  id          String   @id @default(uuid())
  userId      String
  eventType   String   // "symptom", "medication", "trigger", "food"
  timestamp   DateTime
  data        Json     // Event-specific data
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, timestamp])
  @@index([userId, eventType, timestamp])
}

// New: Food-specific correlation results
model FoodCorrelation {
  id              String   @id @default(uuid())
  userId          String
  foodId          String
  foodName        String
  symptomId       String
  symptomName     String

  // Correlation metrics
  correlationPct  Float    // 0-100%
  pValue          Float
  confidence      String   // "high", "medium", "low"
  sampleSize      Int
  consistency     Float    // % of times food → symptom

  // Time-delay analysis
  timeWindowStart Int      // minutes
  timeWindowEnd   Int      // minutes
  avgDelay        Int      // average minutes

  // Dose-response (if applicable)
  doseResponse    Json?    // { small: { rate, severity }, medium, large }

  lastAnalyzedAt  DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, foodId, symptomId])
  @@index([userId, confidence])
}

// Combination effects
model FoodCombination {
  id              String   @id @default(uuid())
  userId          String
  foodIds         String[] // Sorted array for consistency
  foodNames       String[]
  symptomId       String
  symptomName     String

  combinationCorrelation Float
  individualMax   Float    // Strongest individual food correlation
  synergistic     Boolean  // true if combination > individual

  pValue          Float
  confidence      String
  sampleSize      Int

  lastAnalyzedAt  DateTime
  createdAt       DateTime @default(now())

  @@unique([userId, foodIds, symptomId])
}
```

**Migration Strategy:**
- **Additive only:** New tables, no changes to existing schema
- **Backward compatible:** Existing features unaffected
- **Prisma migrations:** `prisma migrate dev` for schema evolution
- **Seed data:** Pre-populate 200+ foods with allergen tags on first run

### 3.2 Data Models and Relationships

**Client-Side (Dexie):**

```
foods (1) ←──────── (N) foodEvents
             foodIds[]

foodEvents (1) ─────→ (N) photos
              photoIds[]

foodEvents ────mealId───→ foodEvents
(meal grouping, shared timestamp)
```

**Server-Side (Postgres):**

```
Event (food, symptom) ───→ CorrelationEngine ───→ FoodCorrelation
                                           ───→ FoodCombination

User (1) ←────── (N) FoodCorrelation
User (1) ←────── (N) FoodCombination
```

**Sync Pattern:**
- Food events: Dexie → Postgres (background sync)
- Correlations: Postgres → Dexie correlationCache (on-demand fetch)

### 3.3 Data Migrations Strategy

**Client-Side (Dexie):**
- Version bumps in `src/lib/db/client.ts`
- `db.version(2).stores({ foods: "...", foodEvents: "..." })`
- Seed 200+ foods on first launch

**Server-Side (Prisma):**
```bash
# Development
npx prisma migrate dev --name add_food_correlation_tables

# Production (Vercel)
npx prisma migrate deploy
```

**Rollback Plan:**
- Prisma migrations reversible via `prisma migrate resolve`
- Keep food tables isolated (no foreign keys to existing tables initially)

## 4. API Design

### 4.1 API Structure

**REST API via Next.js App Router API Routes**

Base path: `/api/`

**Authentication:** Middleware reads `userId` from request headers (set by client from localStorage)

**Response Format:**
```typescript
{
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  metadata?: { correlationVersion: number; timestamp: string };
}
```

### 4.2 API Routes

**Correlation Analysis:**

```typescript
POST /api/correlation/analyze
Body: { userId: string; eventType: "food" | "symptom" }
Response: { jobId: string; estimatedCompletionMs: number }
// Triggers background correlation recalculation

GET /api/correlation/results/:userId
Query: ?minConfidence=medium&allergenTag=dairy
Response: { correlations: FoodCorrelation[]; combinations: FoodCombination[] }
// Fetch computed correlations with filters

GET /api/correlation/food/:foodId
Response: { correlation: FoodCorrelation; history: EventInstance[] }
// Detailed report for specific food
```

**Export:**

```typescript
POST /api/export/food-journal
Body: { userId: string; dateRange: { start, end }, format: "csv" | "json" | "pdf" }
Response: { downloadUrl: string; expiresAt: string }
// Generate export file, return signed URL
```

**Sync (Optional - Future):**

```typescript
POST /api/sync/food-events
Body: { userId: string; events: FoodEvent[] }
Response: { synced: number; conflicts: ConflictResolution[] }
// Batch sync from client to server
```

### 4.3 Form Actions and Mutations

**Client-Side Mutations (Dexie + Optimistic UI):**

```typescript
// Add food event
await foodEventRepository.create({
  userId,
  foodIds,
  timestamp,
  mealType,
  portionSize,
  notes,
});
// Immediate UI update, background API call

// Update food event
await foodEventRepository.update(eventId, { notes: "updated" });

// Delete food event
await foodEventRepository.delete(eventId);
// Soft delete: isActive = false
```

**Server-Side Actions (when sync occurs):**
- Background job processes Dexie → Postgres sync
- Trigger correlation recalculation on new events

## 5. Authentication and Authorization

### 5.1 Auth Strategy

**Current:** localStorage-based userId (simple single-user local app)

**Food Journal Extension:** No changes to auth system required

**Future Consideration:** If multi-device sync is added, implement proper auth (Supabase Auth, NextAuth.js, or Clerk)

### 5.2 Session Management

**Client:** `localStorage.getItem("pocket:currentUserId")`

**Server API:** Read `x-user-id` header from client requests

**Security Note:** Current auth is **not secure for multi-user scenarios**. Acceptable for single-user local-first app.

### 5.3 Protected Routes

**All routes protected** via `useCurrentUser` hook:
- If no userId in localStorage → Redirect to onboarding
- Existing pattern, no changes needed

### 5.4 Role-Based Access Control

**N/A** - Single-user app, no RBAC needed

## 6. State Management

### 6.1 Server State

**Pattern:** React Context + hooks (existing DashboardContext pattern)

**Food-Specific Context:**

```typescript
// src/contexts/FoodContext.tsx
interface FoodContextState {
  foods: Food[];              // Pre-populated + custom
  foodEvents: FoodEvent[];    // Logged consumption
  correlations: FoodCorrelation[];
  loading: boolean;
  error: string | null;

  // Actions
  logFood: (food: CreateFoodEvent) => Promise<void>;
  updateFood: (id: string, data: Partial<FoodEvent>) => Promise<void>;
  deleteFoodEvent: (id: string) => Promise<void>;
  refetchCorrelations: () => Promise<void>;
}

// Usage
const { foods, logFood, correlations } = useFoodContext();
```

**Existing Contexts (Reuse):**
- `DashboardContext` - Extend to include food correlations in analysis
- `UserContext` (via `useCurrentUser`) - User ID management

### 6.2 Client State

**Local Component State (useState):**
- Form inputs (FoodLogModal: search query, selected foods, portion size)
- UI state (modal open/closed, filters, sort order)

**Shared State (Context):**
- Food database (foods list)
- Food events (recent logs, timeline data)
- Correlation results (dashboard data)

### 6.3 Form State

**Pattern:** Controlled components with local `useState`

```typescript
const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
const [mealType, setMealType] = useState<MealType>("breakfast");
const [portionSize, setPortionSize] = useState<PortionSize>("medium");
const [notes, setNotes] = useState("");

const handleSubmit = async () => {
  await logFood({ selectedFoods, mealType, portionSize, notes, timestamp: Date.now() });
  closeModal();
};
```

**Validation:** Client-side validation before submission (required: at least 1 food, valid mealType)

### 6.4 Caching Strategy

**Client-Side Cache (IndexedDB):**
- **Foods database:** Cache indefinitely, refresh on app update
- **Food events:** Cache all (needed for correlation)
- **Correlation results:** Cache with TTL (24 hours), refetch on dashboard load

**Server-Side Cache:**
- **In-memory:** Correlation results (per userId, 15 min TTL)
- **No Redis:** Start with in-memory, add Redis if performance degrades

**Invalidation:**
- New food/symptom event → Invalidate correlation cache
- Background job recalculates → Update cache

## 7. UI/UX Architecture

### 7.1 Component Structure

**Component Hierarchy:**

```
App
├── Layout (existing)
│   ├── Sidebar (enhanced: food nav items)
│   └── Main Content
│       ├── Dashboard
│       │   ├── QuickLogButtons (enhanced: + food button)
│       │   └── FoodLogModal (new)
│       │       ├── FoodSearchInput
│       │       ├── FoodList (with allergen badges)
│       │       ├── MealTypeSelector
│       │       ├── PortionSizeSelector
│       │       └── NotesInput
│       ├── Timeline
│       │   ├── EventList (enhanced: render food events)
│       │   │   ├── FoodEventCard (new)
│       │   │   ├── SymptomEventCard (existing)
│       │   │   └── MedicationEventCard (existing)
│       │   └── AllergenFilter (new)
│       └── TriggerAnalysis
│           ├── TriggerDashboard (enhanced: food tab)
│           ├── FoodCorrelationWidget (new)
│           │   ├── CorrelationChart
│           │   ├── ConfidenceBadge
│           │   └── TimeDelayVisualization
│           └── FoodCorrelationDetailView (new)
└── Contexts
    ├── UserContext (existing)
    ├── DashboardContext (existing)
    └── FoodContext (new)
```

**Component Reuse:**
- Modal base component (FoodLogModal extends existing pattern)
- Timeline event card (FoodEventCard follows SymptomEventCard structure)
- Correlation charts (reuse Chart.js setup from existing TrendChart)

**New Components:**
- `FoodLogModal` - Quick food logging interface
- `FoodEventCard` - Timeline food event display
- `FoodCorrelationWidget` - Dashboard correlation summary
- `FoodCorrelationDetailView` - Detailed food-symptom report
- `AllergenFilter` - Timeline filter by allergen tags
- `FoodDatabaseManager` - Manage custom foods

### 7.2 Styling Approach

**Tailwind CSS 4 (Existing):**

```typescript
// Component example
<button className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
  Log Food
</button>
```

**Design Tokens (Existing):**
- Primary colors, spacing, typography defined in `tailwind.config.ts`
- Food-specific additions:
  - `food-accent` color (distinct from symptom/medication colors)
  - Allergen tag colors (consistent palette: dairy=blue, gluten=orange, etc.)

**Accessibility:**
- WCAG 2.1 AA compliance (NFR005)
- Contrast ratios >= 4.5:1
- Color + text labels (not color-alone)
- Keyboard navigation support

### 7.3 Responsive Design

**Mobile-First (Primary Target):**
- Quick-log button: 56x56pt touch target
- Food search: Full-screen modal on mobile
- Timeline: Vertical scrolling, card layout
- Charts: Simplified on small screens

**Desktop (Secondary):**
- Food search: Centered modal (600px width)
- Timeline: Multi-column grid
- Dashboard: 2-column widget layout

**Breakpoints (Tailwind):**
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px

### 7.4 Accessibility

**WCAG 2.1 Level AA (NFR005):**

- **Keyboard Navigation:** All interactive elements tabbable, Enter to submit
- **Screen Reader:** Semantic HTML, aria-labels on icons, role attributes
- **Focus Indicators:** Visible focus rings (2px outline)
- **Color Independence:** Allergen tags = color + icon + text label
- **Form Labels:** Explicit `<label for="...">` associations
- **Error Messages:** Clear, actionable error text
- **Loading States:** Announce to screen readers via aria-live

**Testing:** Axe DevTools, manual keyboard navigation, screen reader testing (NVDA/JAWS)

## 8. Performance Optimization

### 8.1 SSR Caching

**Next.js Cache Config:**
```typescript
// Dashboard (static shell)
export const revalidate = 3600; // 1 hour

// API routes (no cache - dynamic per user)
export const revalidate = 0;
```

### 8.2 Static Generation

**Not applicable** - All food journal pages are dynamic (user-specific data)

### 8.3 Image Optimization

**Photos:** Encrypted blobs in IndexedDB (existing pattern)
- Compression on upload (max 1MB per photo)
- Thumbnails generated client-side
- No server-side image optimization needed

**UI Icons:** Lucide React (SVG, tree-shakeable)

### 8.4 Code Splitting

**Dynamic Imports:**
```typescript
// Load FoodLogModal only when needed
const FoodLogModal = dynamic(() => import("@/components/food/FoodLogModal"), {
  loading: () => <LoadingSpinner />,
});

// Load correlation charts only on trigger analysis page
const FoodCorrelationWidget = dynamic(() => import("@/components/food/FoodCorrelationWidget"));
```

**Route-Based Splitting:** Next.js automatic code splitting per route

**Library Chunking:** Chart.js, Dexie bundled separately (vendor chunks)

## 9. SEO and Meta Tags

### 9.1 Meta Tag Strategy

**N/A for Food Journal** - No public pages, all authenticated/local

If marketing pages added later:
```typescript
export const metadata = {
  title: "Food Journal - Track Your Dietary Triggers",
  description: "Discover food sensitivities with automated correlation analysis",
};
```

### 9.2 Sitemap

**N/A** - No public indexing required

### 9.3 Structured Data

**N/A** - No SEO requirements

## 10. Deployment Architecture

### 10.1 Hosting Platform

**Vercel:**
- Next.js optimal environment
- Automatic deployments from git
- Edge network (global CDN)
- Serverless functions for API routes

**Configuration:**
```json
// vercel.json
{
  "env": {
    "DATABASE_URL": "@postgres-url",
    "DIRECT_URL": "@postgres-direct-url"
  },
  "crons": [
    {
      "path": "/api/cron/correlations",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

### 10.2 CDN Strategy

**Vercel Edge Network:**
- Static assets (JS, CSS, images) cached at edge
- API routes NOT cached (dynamic per-user data)

**Cache Headers:**
```typescript
// Static assets
export const headers = {
  "Cache-Control": "public, max-age=31536000, immutable",
};

// API routes
export const headers = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate",
};
```

### 10.3 Edge Functions

**Not needed initially** - Standard serverless functions sufficient

**Future:** Move correlation trigger to Edge Runtime for global low latency

### 10.4 Environment Configuration

**Environment Variables:**
```bash
# .env.local
DATABASE_URL="postgresql://..."          # Prisma connection string
DIRECT_URL="postgresql://..."            # Direct connection (migrations)
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

**Vercel Environment Variables:**
- Production: Set via Vercel dashboard
- Preview: Inherit from production
- Development: .env.local

## 11. Component and Integration Overview

### 11.1 Major Modules

**Food Logging Module:**
- `FoodLogModal` - Quick-log UI
- `FoodDatabaseManager` - Pre-populated + custom foods
- `foodEventRepository` - Dexie CRUD operations

**Food Correlation Module:**
- `CorrelationEngine` - Server-side analysis
- `FoodCorrelationWidget` - Dashboard visualization
- `FoodCorrelationDetailView` - Detailed reports

**Timeline Integration Module:**
- `FoodEventCard` - Food event renderer
- `AllergenFilter` - Filter timeline by allergen tags
- `timelineService` - Unified event stream queries

**Export Module:**
- `ExportService` (extend existing)
- PDF/CSV generation with correlations

### 11.2 Page Structure

**Enhanced Pages:**

```
/dashboard
├── QuickLogButtons (+ food button)
├── FoodLogModal (modal overlay)
└── RecentActivity (includes food events)

/timeline
├── AllergenFilter (new filter option)
└── EventList
    ├── FoodEventCard (new)
    ├── SymptomEventCard (existing)
    └── MedicationEventCard (existing)

/triggers
├── TriggerTabs (+ "Food" tab)
└── FoodCorrelationWidget
    ├── TopFoodTriggers (ranked list)
    ├── CorrelationChart (bar chart)
    └── ConfidenceBadges
```

**No New Top-Level Pages** - Integrates into existing structure

### 11.3 Shared Components

**Reused from Existing Codebase:**
- `Button` (Tailwind styled)
- `Input`, `Textarea` (form controls)
- `Modal` (base modal wrapper)
- `LoadingSpinner`
- `ErrorBoundary`
- `Tooltip` (Radix UI)

**New Shared Components:**
- `ConfidenceBadge` - Displays High/Medium/Low with colors
- `AllergenTag` - Colored badge with icon (dairy, gluten, etc.)
- `TimeDelayVisualization` - Timeline showing food → symptom delay

### 11.4 Third-Party Integrations

**None** - Fully self-contained feature

**Future Considerations (Out of Scope):**
- USDA Food Database API (nutrition data)
- Barcode scanning (for packaged foods)

## 12. Architecture Decision Records

### ADR-001: Hybrid Data Architecture (Client + Server)

**Context:** Need offline-first food logging with complex correlation analysis

**Decision:** Client-side (Dexie) for data capture, server-side (Postgres) for correlation processing

**Rationale:**
- 500ms response requirement (NFR001) demands local data
- 72-hour correlation windows across 100K+ events exceed browser capacity
- Offline capability critical for food logging (capture in moment)

**Consequences:**
- More complex sync logic
- Eventual consistency between client/server
- Correlation results may be slightly stale (acceptable - 24hr TTL)

### ADR-002: React Context over Redux/Zustand

**Context:** Need global state for food data and correlations

**Decision:** Extend existing React Context pattern (DashboardContext)

**Rationale:**
- Existing codebase uses Context + hooks successfully
- Scope limited (FoodContext is isolated module)
- No need for Redux complexity (time-travel debugging, middleware, etc.)
- Performance sufficient for food journal use case

**Consequences:**
- Simpler codebase, easier onboarding
- May need Zustand if state management becomes complex (future refactor)

### ADR-003: Vercel Postgres over Supabase

**Context:** Need PostgreSQL for server-side correlation processing

**Decision:** Vercel Postgres (managed PostgreSQL)

**Rationale:**
- Already deploying to Vercel (optimal integration)
- Serverless connection pooling (auto-scaling)
- No need for Supabase Auth/Storage (using existing localStorage auth, local photo storage)
- Simpler billing (single platform)

**Consequences:**
- Locked into Vercel ecosystem
- Migration to Supabase feasible if multi-device sync added later

### ADR-004: Prisma ORM

**Context:** Need type-safe database access

**Decision:** Prisma for server-side database queries

**Rationale:**
- Type-safe schema + TypeScript integration
- Excellent migration tooling
- Active ecosystem, good Next.js integration
- Industry standard for TypeScript + PostgreSQL

**Consequences:**
- Schema-first development (Prisma schema defines types)
- Migration files managed in version control

### ADR-005: In-Memory Cache over Redis (Initially)

**Context:** Need caching for correlation results

**Decision:** Start with in-memory cache, add Redis later if needed

**Rationale:**
- Serverless functions are stateless, but 15-min TTL acceptable for correlations
- Avoid Redis cost and complexity initially
- Can add Vercel KV (Redis) easily if performance degrades

**Consequences:**
- Cache per function instance (some duplication)
- Slightly higher API latency on cold starts
- Acceptable trade-off for MVP

**Key Decisions Summary:**

- **Framework:** Next.js 15 (brownfield, existing)
- **SSR vs SSG:** Hybrid (SSR shell + CSR data)
- **Database:** Dexie (client) + Vercel Postgres (server)
- **Hosting:** Vercel (Next.js optimal, existing deployment)

## 13. Implementation Guidance

### 13.1 Development Workflow

**Local Development:**
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit DATABASE_URL, DIRECT_URL

# Run Prisma migrations
npx prisma migrate dev

# Seed food database
npx prisma db seed

# Start dev server
npm run dev

# Run tests
npm test
```

**Feature Branch Workflow:**
1. Branch from `main`: `git checkout -b feature/food-journal-story-1.1`
2. Implement story with tests
3. Run tests: `npm test`
4. Commit with message: "feat(food): implement story 1.1 quick-log button"
5. Push and create PR
6. Review, merge to `main`
7. Auto-deploy to Vercel staging
8. Promote to production

### 13.2 File Organization

**Proposed Source Tree** (see Section 14 below)

**Conventions:**
- `src/components/food/` - Food-specific UI components
- `src/lib/repositories/` - Dexie CRUD operations (foodEventRepository, foodRepository)
- `src/lib/services/` - Business logic (CorrelationService, ExportService)
- `src/app/api/correlation/` - Server API routes
- `src/lib/db/schema.ts` - Dexie schema definitions
- `prisma/schema.prisma` - Postgres schema

### 13.3 Naming Conventions

**Files:**
- Components: PascalCase (FoodLogModal.tsx)
- Hooks: camelCase with `use` prefix (useFoodEvents.ts)
- Repositories: camelCase with `Repository` suffix (foodEventRepository.ts)
- Services: PascalCase with `Service` suffix (CorrelationService.ts)
- Types: PascalCase (FoodEvent.ts)

**Variables:**
- camelCase (foodEvents, userId)
- Constants: UPPER_SNAKE_CASE (MAX_PORTION_SIZE)
- React components: PascalCase (FoodLogModal)

**Database:**
- Tables: camelCase (foodEvents, foodCorrelations)
- Columns: camelCase (userId, createdAt)

### 13.4 Best Practices

**TypeScript:**
- Strict mode enabled
- Avoid `any` - use `unknown` if type unclear
- Define interfaces for all data shapes

**React:**
- Functional components only
- Custom hooks for reusable logic
- Memoization (`useMemo`, `useCallback`) for expensive operations
- Error boundaries around async components

**Testing:**
- Unit tests for repositories, services, utilities
- Component tests for UI (React Testing Library)
- E2E tests for critical flows (food logging, correlation display)
- Target: 80% coverage

**Performance:**
- Lazy load heavy components (Chart.js, FoodCorrelationWidget)
- Virtualize long lists (food search results if > 100 items)
- Debounce search inputs (300ms)
- Background sync (don't block UI)

**Accessibility:**
- Semantic HTML (`<button>`, `<label>`, `<input>`)
- Keyboard navigation tested
- ARIA labels on icon-only buttons
- Screen reader announcements for async actions

## 14. Proposed Source Tree

```
symptom-tracker/
├── src/
│   ├── app/
│   │   ├── (protected)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx                    # Enhanced: + food quick-log
│   │   │   │   └── __tests__/
│   │   │   ├── log/
│   │   │   │   └── page.tsx                    # Unchanged (daily reflection)
│   │   │   ├── timeline/
│   │   │   │   ├── page.tsx                    # Enhanced: render food events
│   │   │   │   └── __tests__/
│   │   │   └── triggers/
│   │   │       ├── page.tsx                    # Enhanced: + food tab
│   │   │       └── __tests__/
│   │   ├── api/
│   │   │   ├── correlation/
│   │   │   │   ├── analyze/
│   │   │   │   │   └── route.ts                # POST trigger analysis
│   │   │   │   ├── results/
│   │   │   │   │   └── [userId]/
│   │   │   │   │       └── route.ts            # GET correlations
│   │   │   │   └── food/
│   │   │   │       └── [foodId]/
│   │   │   │           └── route.ts            # GET food detail
│   │   │   ├── export/
│   │   │   │   └── food-journal/
│   │   │   │       └── route.ts                # POST export
│   │   │   └── cron/
│   │   │       └── correlations/
│   │   │           └── route.ts                # Background job
│   │   └── layout.tsx                          # Root layout
│   ├── components/
│   │   ├── food/                               # NEW MODULE
│   │   │   ├── FoodLogModal.tsx                # Quick-log UI
│   │   │   ├── FoodSearchInput.tsx             # Search foods
│   │   │   ├── FoodList.tsx                    # Food selection list
│   │   │   ├── MealTypeSelector.tsx            # Breakfast/lunch/etc
│   │   │   ├── PortionSizeSelector.tsx         # Small/medium/large
│   │   │   ├── FoodEventCard.tsx               # Timeline card
│   │   │   ├── FoodCorrelationWidget.tsx       # Dashboard widget
│   │   │   ├── FoodCorrelationDetailView.tsx   # Detailed report
│   │   │   ├── AllergenFilter.tsx              # Filter by allergen
│   │   │   ├── AllergenTag.tsx                 # Allergen badge
│   │   │   ├── ConfidenceBadge.tsx             # High/Med/Low
│   │   │   ├── TimeDelayVisualization.tsx      # Food→symptom timeline
│   │   │   ├── FoodDatabaseManager.tsx         # Manage custom foods
│   │   │   └── __tests__/
│   │   │       ├── FoodLogModal.test.tsx
│   │   │       ├── FoodEventCard.test.tsx
│   │   │       └── FoodCorrelationWidget.test.tsx
│   │   ├── analytics/                          # Existing
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── DashboardContext.tsx            # Extended for food
│   │   │   └── TrendChart.tsx
│   │   ├── navigation/                         # Existing
│   │   │   └── Sidebar.tsx                     # Unchanged
│   │   └── ui/                                 # Existing (Tailwind components)
│   ├── contexts/
│   │   ├── FoodContext.tsx                     # NEW
│   │   └── UserContext.tsx                     # Existing
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts                       # Dexie setup (enhanced)
│   │   │   └── schema.ts                       # Enhanced with food tables
│   │   ├── repositories/
│   │   │   ├── foodRepository.ts               # NEW - Food CRUD
│   │   │   ├── foodEventRepository.ts          # NEW - Food event CRUD
│   │   │   ├── __tests__/
│   │   │   │   ├── foodRepository.test.ts
│   │   │   │   └── foodEventRepository.test.ts
│   │   │   ├── symptomInstanceRepository.ts    # Existing
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── CorrelationService.ts           # NEW - Analysis engine
│   │   │   ├── FoodCorrelationService.ts       # NEW - Food-specific
│   │   │   ├── ExportService.ts                # Enhanced
│   │   │   ├── TrendAnalysisService.ts         # Existing
│   │   │   ├── __tests__/
│   │   │   │   ├── CorrelationService.test.ts
│   │   │   │   └── FoodCorrelationService.test.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── statistics/
│   │   │   │   ├── correlation.ts              # NEW - Chi-square, Pearson
│   │   │   │   ├── pvalue.ts                   # NEW - Statistical tests
│   │   │   │   ├── doseResponse.ts             # NEW - Regression
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── correlation.test.ts
│   │   │   │   │   └── doseResponse.test.ts
│   │   │   │   └── linearRegression.ts         # Existing
│   │   │   └── correlation.ts                  # Existing (extended)
│   │   ├── hooks/
│   │   │   ├── useFoodEvents.ts                # NEW
│   │   │   ├── useFoodCorrelations.ts          # NEW
│   │   │   ├── useFoodDatabase.ts              # NEW
│   │   │   ├── useCurrentUser.ts               # Existing
│   │   │   └── __tests__/
│   │   └── types/
│   │       ├── food.ts                         # NEW
│   │       ├── foodEvent.ts                    # NEW
│   │       ├── foodCorrelation.ts              # NEW
│   │       └── ...
│   └── styles/
│       └── globals.css                         # Tailwind + custom
├── prisma/
│   ├── schema.prisma                           # Postgres schema
│   ├── migrations/
│   │   └── 20251015_add_food_tables/
│   │       └── migration.sql
│   └── seed.ts                                 # Seed 200+ foods
├── public/
│   └── data/
│       └── foods.json                          # Pre-populated food data
├── docs/
│   ├── PRD.md                                  # Product requirements
│   ├── epic-stories.md                         # Story breakdown
│   └── solution-architecture.md                # This document
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── jest.config.js
└── .env.local                                  # Environment variables
```

**Critical Folders:**

- **`src/components/food/`**: All food journal UI components - isolated module for easy maintenance and testing
- **`src/lib/services/CorrelationService.ts`**: Core correlation analysis logic - statistical engine for time-based analysis, confidence calculation, dose-response
- **`src/app/api/correlation/`**: Backend API routes for correlation processing - triggers background jobs, returns computed results
- **`prisma/`**: Database schema and migrations - additive changes only, no breaking modifications to existing tables

## 15. Testing Strategy

### 15.1 Unit Tests

**Coverage Targets:**
- Repositories: 90% (CRUD operations are critical)
- Services: 85% (complex business logic)
- Utilities: 95% (pure functions, statistical methods)
- Hooks: 80%

**Example:**
```typescript
// src/lib/services/__tests__/CorrelationService.test.ts
describe("CorrelationService", () => {
  describe("computeFoodSymptomCorrelation", () => {
    it("returns high confidence for 5+ occurrences with 70%+ consistency", () => {
      const result = correlationService.compute({
        foodEvents: mockFoodEvents(5),
        symptomEvents: mockSymptomEvents(5),
        timeWindow: { start: 120, end: 240 }, // 2-4 hours
      });

      expect(result.confidence).toBe("high");
      expect(result.pValue).toBeLessThan(0.05);
    });
  });
});
```

**Tools:**
- Jest (existing)
- React Testing Library (components)
- Dexie export for in-memory database testing

### 15.2 Integration Tests

**Scope:** API routes + database interactions

**Example:**
```typescript
// src/app/api/correlation/analyze/__tests__/route.test.ts
describe("POST /api/correlation/analyze", () => {
  it("triggers correlation job and returns jobId", async () => {
    const response = await POST(new Request("http://localhost/api/correlation/analyze", {
      method: "POST",
      body: JSON.stringify({ userId: "test-user", eventType: "food" }),
    }));

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.jobId).toBeDefined();
  });
});
```

**Tools:**
- Supertest or native `fetch` (Next.js 15)
- Test database (SQLite or Postgres test instance)

### 15.3 E2E Tests

**Critical Flows:**
1. Food logging: Dashboard → Quick-log button → Select food → Save → View in timeline
2. Correlation discovery: Log food → Log symptom → Trigger analysis → View correlation in dashboard
3. Export: Trigger Analysis → Export button → Download CSV/PDF

**Tools:**
- Playwright (recommended for Next.js)
- Cypress (alternative)

**Example:**
```typescript
test("user can log food and view in timeline", async ({ page }) => {
  await page.goto("/dashboard");
  await page.click('[data-testid="quick-log-food"]');
  await page.fill('[data-testid="food-search"]', "milk");
  await page.click('[data-testid="food-milk"]');
  await page.click('[data-testid="save-food-log"]');

  await page.goto("/timeline");
  await expect(page.locator('[data-testid="food-event-milk"]')).toBeVisible();
});
```

### 15.4 Coverage Goals

- **Overall:** 80% line coverage
- **Critical paths:** 95% (correlation engine, food logging, data sync)
- **UI components:** 70% (focus on logic, not styling)

**Enforcement:**
```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "lines": 80,
      "statements": 80,
      "functions": 80,
      "branches": 75
    },
    "src/lib/services/CorrelationService.ts": {
      "lines": 95
    }
  }
}
```

## 16. DevOps and CI/CD

**GitHub Actions Workflow:**

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npx prisma generate
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Deployment Pipeline:**
1. Push to `main` → GitHub Actions CI
2. Run tests, lint, build
3. Auto-deploy to Vercel production
4. Run Prisma migrations: `npx prisma migrate deploy`
5. Health check API endpoint

**Environments:**
- **Development:** Local (localhost:3001)
- **Staging:** Vercel preview deployments (per PR)
- **Production:** Vercel production (main branch)

**Database Migrations:**
- Development: `npx prisma migrate dev`
- Production: `npx prisma migrate deploy` (via Vercel build command)

**Rollback Plan:**
- Vercel instant rollback via dashboard
- Database migrations: Prisma migrate rollback or manual SQL

## 17. Security

**Current Security Posture:**
- **Auth:** localStorage userId (not secure for multi-user)
- **Data:** Local-only (encrypted photos)
- **API:** No authentication middleware currently

**Food Journal Security Additions:**

**1. API Route Protection:**
```typescript
// middleware.ts
export function middleware(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Add userId to request context
}
```

**2. Input Validation:**
```typescript
import { z } from "zod";

const FoodEventSchema = z.object({
  userId: z.string().uuid(),
  foodIds: z.array(z.string().uuid()).min(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  timestamp: z.number().positive(),
});

// Validate before processing
FoodEventSchema.parse(requestBody);
```

**3. SQL Injection Prevention:**
- Prisma ORM (parameterized queries)
- No raw SQL with user input

**4. XSS Prevention:**
- React escapes by default
- DOMPurify for rich text (if added)

**5. Data Privacy:**
- Photos encrypted in IndexedDB (existing)
- No sensitive data in logs
- Food/symptom data never leaves device unless user initiates sync

**6. Rate Limiting:**
```typescript
// middleware.ts (future)
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

const { success } = await ratelimit.limit(userId);
if (!success) return new Response("Rate limit exceeded", { status: 429 });
```

**Security Audit Checklist:**
- [ ] API routes protected with userId validation
- [ ] Input validation on all API endpoints (Zod schemas)
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS prevented (React + CSP headers)
- [ ] Rate limiting on correlation API (future)
- [ ] HTTPS only (Vercel enforced)

**Future Security Enhancements (Out of Scope):**
- Multi-user authentication (NextAuth.js or Clerk)
- End-to-end encryption for cloud sync
- HIPAA compliance (if medical use case)

---

## 18. Epic Alignment Matrix

| Epic | Core Outcomes | Key Modules & Services | Primary Data Surfaces | Test Focus |
| --- | --- | --- | --- | --- |
| E1 – Food Logging & Management | Rapid meal capture (<500ms), searchable catalog, timeline integration (grouped by mealId) + edit flow, favorites | `FoodLogModal`, `MealComposer`, `foodRepository`, `foodEventRepository`, `FoodContext`, timeline adapters | Dexie `foods`/`foodEvents`, timeline view, quick-log dashboard, food history panel | Repository CRUD, modal UX, Dexie migrations, timeline grouping/hydration, offline queue, photo encryption |
| E2 – Food-Symptom Correlation Analysis | Time-window correlations, dose-response, combination insights, exports | `CorrelationService`, `FoodCorrelationService`, `FoodCorrelationWidget`, API routes under `/api/correlation/*`, Vercel Cron job, export extension | Prisma `FoodCorrelation`/`FoodCombination`, correlation cache, trigger analysis dashboard, export payloads | Statistical engines (chi-square, Pearson), API integration, cron scheduling, dashboard rendering, export pipelines |

**Traceability:**
- Epics map directly to the component clusters listed above; each story in `docs/epic-stories.md` traces to a module or service in the matrix.
- QA should align regression suites to the “Test Focus” column when building coverage for each epic.

---

## Specialist Sections

**Testing Specialist:** Basic test strategy inline (Section 15). Comprehensive test architecture not required for Level 2 project.

**DevOps Specialist:** CI/CD strategy inline (Section 16). Standard GitHub Actions + Vercel deployment sufficient.

**Security Specialist:** Security considerations inline (Section 17). No complex compliance requirements; standard web security practices applied.

---

_Generated using BMad Method Solution Architecture workflow - Level 2 (Medium) web application with hybrid client-server architecture_
