# System Architecture Overview

**Last Updated**: October 12, 2025  
**Version**: 0.1.0  
**Status**: Phase 2 Complete (Phase 1 ✅, Phase 2 ✅, Phase 3-4 📋)

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [System Architecture](#system-architecture)
4. [Component Architecture](#component-architecture)
5. [Routing Architecture](#routing-architecture)
6. [PWA Architecture](#pwa-architecture)
7. [Performance Architecture](#performance-architecture)

## Overview

Pocket Symptom Tracker is a **local-first Progressive Web Application (PWA)** designed to help people with autoimmune conditions (particularly Hidradenitis Suppurativa) track symptoms, medications, triggers, and health patterns without requiring cloud storage or compromising privacy.

### Key Architectural Characteristics

- **Local-First**: All data stored in browser IndexedDB, zero server dependencies
- **Privacy-First**: No external data transmission, AES-256-GCM photo encryption
- **Offline-First**: Full functionality without network connectivity
- **Progressive**: Installable, responsive, and progressively enhanced
- **Type-Safe**: TypeScript throughout with strict mode enabled
- **Modular**: Component-based architecture with clear separation of concerns

## Architecture Principles

### 1. Privacy & Data Sovereignty
**Principle**: User owns and controls 100% of their health data.

**Implementation**:
- All data stored in IndexedDB (client-side)
- No backend servers or APIs
- No analytics or tracking without explicit opt-in
- Photo encryption with AES-256-GCM
- EXIF data stripping from photos

### 2. Offline-First
**Principle**: Application works without network connectivity.

**Implementation**:
- Service worker caching for static assets
- IndexedDB for persistent data storage
- Background sync queue for future cloud features
- Network status detection and user feedback

### 3. Progressive Enhancement
**Principle**: Core functionality works everywhere, enhanced features layered on top.

**Implementation**:
- Server-side rendering with Next.js
- Client-side hydration for interactivity
- PWA features (install, offline) enhance base experience
- Graceful degradation for older browsers

### 4. Modularity & Separation of Concerns
**Principle**: Clear boundaries between layers, loose coupling.

**Implementation**:
- Repository pattern for data access
- Service layer for business logic
- Component isolation with clear props interfaces
- Custom hooks for reusable state logic

### 5. Type Safety
**Principle**: Catch errors at compile-time, not runtime.

**Implementation**:
- TypeScript strict mode enabled
- Comprehensive type definitions for all entities
- Type-safe database schemas with Dexie
- No `any` types except for specific edge cases

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Application (Client)             │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Pages     │  │ Components  │  │   Hooks     │  │  │
│  │  │ (App Router)│  │   (React)   │  │  (Custom)   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │         │                 │                 │        │  │
│  │         └─────────────────┴─────────────────┘        │  │
│  │                          │                           │  │
│  │  ┌───────────────────────▼───────────────────────┐  │  │
│  │  │         Service Layer (Business Logic)        │  │  │
│  │  │  - Export/Import  - Analytics                 │  │  │
│  │  │  - Encryption     - Migration                 │  │  │
│  │  └───────────────────────┬───────────────────────┘  │  │
│  │                          │                           │  │
│  │  ┌───────────────────────▼───────────────────────┐  │  │
│  │  │      Repository Layer (Data Access)           │  │  │
│  │  │  - SymptomRepo    - DailyEntryRepo            │  │  │
│  │  │  - PhotoRepo      - FlareRepo                 │  │  │
│  │  └───────────────────────┬───────────────────────┘  │  │
│  │                          │                           │  │
│  │  ┌───────────────────────▼───────────────────────┐  │  │
│  │  │         Dexie Database Client                 │  │  │
│  │  └───────────────────────┬───────────────────────┘  │  │
│  │                          │                           │  │
│  └──────────────────────────┼───────────────────────────┘  │
│                             │                              │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │          IndexedDB (Browser Storage)                 │  │
│  │  - users  - symptoms  - dailyEntries  - photos      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Service Worker (PWA Layer)                   │  │
│  │  - Static Asset Caching  - Offline Support           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibilities | Examples |
|-------|-----------------|----------|
| **Pages** | Routing, layout, page composition | `/log`, `/dashboard`, `/photos` |
| **Components** | UI rendering, user interaction | `PhotoGallery`, `BodyMapViewer` |
| **Hooks** | Reusable state logic, side effects | `useSymptoms()`, `usePhotoUpload()` |
| **Services** | Business logic, orchestration | `exportService`, `photoEncryption` |
| **Repositories** | CRUD operations, queries | `symptomRepository.getAll()` |
| **Database** | Schema, indexes, migrations | Dexie client with type safety |
| **IndexedDB** | Persistent storage | Browser-native key-value store |
| **Service Worker** | Caching, offline, background sync | Custom PWA implementation |

## Component Architecture

### Component Categories

#### 1. Page Components (`src/app/`)
Top-level route components using Next.js App Router.

**Examples**:
- `app/page.tsx` - Home page
- `app/(protected)/log/page.tsx` - Daily entry form
- `app/(protected)/photos/page.tsx` - Photo gallery
- `app/(protected)/flares/page.tsx` - Active flare dashboard

**Characteristics**:
- Server components by default
- Can use `async` for data fetching
- Define route segments
- Include metadata for SEO

#### 2. Feature Components (`src/components/<feature>/`)
Domain-specific components organized by feature.

**14 Feature Directories**:
- `analytics/` - Data visualization and insights
- `body-mapping/` - Interactive body maps
- `calendar/` - Timeline and calendar views
- `daily-entry/` - Daily health logging
- `data-management/` - Export/import/backup
- `flare/` - Active flare tracking
- `manage/` - CRUD for symptoms/meds/triggers
- `navigation/` - App navigation (sidebar, tabs)
- `photos/` - Photo capture, gallery, viewer
- `providers/` - React context providers
- `pwa/` - PWA-specific components
- `settings/` - User preferences
- `symptoms/` - Symptom tracking UI
- `triggers/` - Trigger correlation analysis

#### 3. Shared Components
Reusable UI primitives used across features.

**Examples**:
- `ConfirmDialog` - Confirmation modals
- `EmptyState` - No-data placeholders
- `SeverityScale` - 1-10 scale input

### Component Design Patterns

#### Container/Presenter Pattern
```typescript
// Container (smart component with logic)
export function SymptomList() {
  const { symptoms, isLoading } = useSymptoms();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {symptoms.map(symptom => (
        <SymptomCard key={symptom.id} symptom={symptom} />
      ))}
    </div>
  );
}

// Presenter (dumb component, pure UI)
export function SymptomCard({ symptom }: { symptom: SymptomRecord }) {
  return (
    <div className="card">
      <h3>{symptom.name}</h3>
      <SeverityScale value={symptom.severity} />
    </div>
  );
}
```

#### Custom Hooks Pattern
```typescript
// Extract stateful logic into reusable hooks
export function useSymptoms() {
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function load() {
      const data = await symptomRepository.getAll('user-123');
      setSymptoms(data);
      setIsLoading(false);
    }
    load();
  }, []);
  
  const createSymptom = async (data: Omit<SymptomRecord, 'id'>) => {
    const newSymptom = await symptomRepository.create(data);
    setSymptoms(prev => [...prev, newSymptom]);
  };
  
  return { symptoms, isLoading, createSymptom };
}
```

## Routing Architecture

### Next.js App Router Structure

```
src/app/
├── page.tsx                          # Home (/)
├── layout.tsx                        # Root layout
├── globals.css                       # Global styles
├── onboarding/
│   └── page.tsx                      # Onboarding flow (/onboarding)
├── analytics/
│   └── page.tsx                      # Analytics dashboard (/analytics)
└── (protected)/                      # Route group (doesn't affect URL)
    ├── layout.tsx                    # Protected pages layout with nav
    ├── dashboard/page.tsx            # Dashboard (/dashboard)
    ├── log/page.tsx                  # Daily entry (/log)
    ├── calendar/page.tsx             # Calendar (/calendar)
    ├── photos/page.tsx               # Photo gallery (/photos)
    ├── flares/page.tsx               # Active flares (/flares)
    ├── triggers/page.tsx             # Trigger analysis (/triggers)
    ├── body-map/page.tsx             # Body mapping (/body-map)
    ├── manage/page.tsx               # Manage items (/manage)
    ├── settings/page.tsx             # Settings (/settings)
    ├── export/page.tsx               # Export data (/export)
    ├── privacy/page.tsx              # Privacy policy (/privacy)
    ├── about/page.tsx                # About page (/about)
    └── more/page.tsx                 # More menu (/more)
```

### Route Groups

**`(protected)` Route Group**:
- Shared layout with `NavLayout` component
- Bottom tabs navigation (mobile)
- Sidebar navigation (desktop)
- Common header/footer
- User profile indicator

**Why Route Groups?**
- Share layouts without affecting URL structure
- Group related pages logically
- Keep URLs clean (no `/protected/` in path)

## PWA Architecture

### Service Worker Strategy

**File**: `public/sw.js`

**Caching Strategies**:

1. **Cache-First** (Static Assets)
   - HTML, CSS, JavaScript bundles
   - Images, icons, fonts
   - Fast loading, offline support

2. **Network-First** (API Calls - future)
   - Fresh data when online
   - Fallback to cache when offline

3. **Stale-While-Revalidate** (Dynamic Content)
   - Serve cached version immediately
   - Update cache in background
   - Best user experience

**Capabilities**:
- Full offline functionality
- Background sync (for future cloud features)
- Push notifications (planned)
- App shortcuts (dashboard, new entry)

### Web App Manifest

**File**: `public/manifest.json`

**Configuration**:
- App name: "Pocket Symptom Tracker"
- Display: Standalone (looks like native app)
- Icons: 72px, 96px, 128px, 144px, 152px, 192px, 384px, 512px
- Theme color: Customizable
- Background color: Matches app theme
- Shortcuts:
  - New Daily Entry
  - View Calendar
  - Active Flares

## Performance Architecture

### Optimization Strategies

#### 1. Code Splitting
- Next.js automatic code splitting by route
- Dynamic imports for heavy components
  ```typescript
  const PhotoAnnotation = dynamic(() => import('@/components/photos/PhotoAnnotation'));
  ```

#### 2. Image Optimization
- Next.js `<Image>` component for automatic optimization
- Photo compression (max 1920px, 80% quality)
- Thumbnail generation (150x150px) for galleries

#### 3. Database Indexing
- Compound indexes for common queries:
  - `[userId+date]` - Daily entries by date
  - `[userId+timestamp]` - Symptom instances timeline
  - `[userId+capturedAt]` - Photo chronology

#### 4. Lazy Loading
- Component-level lazy loading for off-screen content
- Intersection Observer for infinite scroll (gallery)

#### 5. Memoization
```typescript
const MemoizedChart = React.memo(TrendChart, (prev, next) => {
  return prev.data === next.data && prev.timeRange === next.timeRange;
});
```

### Performance Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| First Contentful Paint (FCP) | < 1.5s | ✅ Meeting |
| Time to Interactive (TTI) | < 3s | ✅ Meeting |
| Largest Contentful Paint (LCP) | < 2.5s | ✅ Meeting |
| Cumulative Layout Shift (CLS) | < 0.1 | ✅ Meeting |
| IndexedDB Query Time | < 50ms | ✅ Meeting |
| Photo Encryption Time (1MB) | < 100ms | ⚠️ Tuning |

---

**Related Documentation**:
- [Data Model](./data-model.md) - Detailed database schema
- [Technical Stack](./technical-stack.md) - Technology decisions and frameworks
- [Security & Privacy](./security-privacy.md) - Security architecture details
