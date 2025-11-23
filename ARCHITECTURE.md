# Pocket Symptom Tracker - Architecture Documentation

**Last Updated**: October 12, 2025  
**Version**: 0.1.0  
**Status**: Phase 2 in Development (Phase 1 Complete ✅, Phase 2 50% Complete 🚧)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Data Architecture](#data-architecture)
6. [Component Architecture](#component-architecture)
7. [Routing Architecture](#routing-architecture)
8. [PWA Architecture](#pwa-architecture)
9. [Security Architecture](#security-architecture)
10. [Performance Architecture](#performance-architecture)
11. [Testing Architecture](#testing-architecture)
12. [Deployment Architecture](#deployment-architecture)

---

## Overview

Pocket Symptom Tracker is a **local-first Progressive Web Application (PWA)** designed to help people with autoimmune conditions (particularly Hidradenitis Suppurativa) track symptoms, medications, triggers, and health patterns without requiring cloud storage or compromising privacy.

### Key Architectural Characteristics

- **Local-First**: All data stored in browser IndexedDB, zero server dependencies
- **Privacy-First**: No external data transmission, AES-256-GCM photo encryption
- **Offline-First**: Full functionality without network connectivity
- **Progressive**: Installable, responsive, and progressively enhanced
- **Type-Safe**: TypeScript throughout with strict mode enabled
- **Modular**: Component-based architecture with clear separation of concerns

---

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

---

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

---

## Technology Stack

### Frontend Framework
- **Next.js 15.5.4** - React framework with App Router
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - File-based routing
  - API routes (not currently used)
  - Built-in optimization (images, fonts, scripts)

- **React 19.1.0** - UI library
  - Component-based architecture
  - Hooks for state management
  - Context API for global state
  - Suspense for async rendering

- **TypeScript 5** - Static typing
  - Strict mode enabled
  - Path aliases (`@/*` → `src/*`)
  - Type inference and safety

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
  - Custom design system
  - Responsive utilities
  - Dark mode support (planned)

- **Radix UI** - Accessible component primitives
  - Tooltips
  - Dialogs (planned)
  - Dropdown menus (planned)

- **Lucide React 0.544.0** - Icon library
  - Consistent iconography
  - Tree-shakeable
  - Customizable size/color

### Data Visualization
- **Chart.js 4.5.0** - Charting library
- **react-chartjs-2 5.3.0** - React wrapper
- **chartjs-plugin-annotation 3.1.0** - Chart annotations

### Data Layer
- **Dexie 4.2.0** - IndexedDB wrapper
  - Type-safe queries
  - Schema versioning
  - Compound indexes
  - Transaction support

### Utilities
- **uuid 13.0.0** - Unique ID generation
- **Web Crypto API** - AES-256-GCM encryption

### Build & Development
- **Turbopack** - Next.js bundler (dev mode)
- **ESLint 9** - Linting with Next.js config
- **Jest 30.2.0** - Testing framework
- **Testing Library** - React component testing
- **ts-jest 29.4.4** - TypeScript support for Jest

---

## Data Architecture

### Database Schema (IndexedDB via Dexie)

```typescript
// 12 Tables, Version 8 (current)
export class SymptomTrackerDatabase extends Dexie {
  users: Table<UserRecord, string>;
  symptoms: Table<SymptomRecord, string>;
  symptomInstances: Table<SymptomInstanceRecord, string>;
  medications: Table<MedicationRecord, string>;
  triggers: Table<TriggerRecord, string>;
  dailyEntries: Table<DailyEntryRecord, string>;
  attachments: Table<AttachmentRecord, string>;
  bodyMapLocations: Table<BodyMapLocationRecord, string>;
  photoAttachments: Table<PhotoAttachmentRecord, string>;
  photoComparisons: Table<PhotoComparisonRecord, string>;
  flares: Table<FlareRecord, string>;
  analysisResults: Table<AnalysisResultRecord, string>;
}
```

### Key Entities

| Entity | Purpose | Key Fields | Indexes |
|--------|---------|------------|---------|
| `users` | User profiles & preferences | `id`, `preferences`, `createdAt` | `id` |
| `symptoms` | Symptom definitions | `id`, `userId`, `name`, `category` | `[userId+category]`, `[userId+isActive]` |
| `symptomInstances` | Individual symptom logs | `id`, `userId`, `severity`, `timestamp` | `[userId+timestamp]`, `[userId+category]` |
| `medications` | Medication records | `id`, `userId`, `name`, `dosage` | `[userId+isActive]` |
| `triggers` | Trigger definitions | `id`, `userId`, `category` | `[userId+category]` |
| `dailyEntries` | Daily health logs | `id`, `userId`, `date`, `health`, `symptoms` | `[userId+date]`, `completedAt` |
| `bodyMapLocations` | Body region selections | `id`, `userId`, `bodyRegionId`, `symptomId` | `[userId+symptomId]`, `createdAt` |
| `photoAttachments` | Encrypted photos | `id`, `userId`, `encryptedBlob`, `capturedAt` | `[userId+capturedAt]`, `[userId+bodyRegionId]` |
| `photoComparisons` | Before/after photo pairs | `id`, `beforePhotoId`, `afterPhotoId` | `createdAt` |
| `flares` | Active symptom flares | `id`, `userId`, `symptomId`, `status` | `[userId+status]`, `[userId+startDate]` |
| `analysisResults` | Cached analytics | `id`, `userId`, `metric`, `timeRange` | `[userId+metric+timeRange]` |

### Data Flow Patterns

#### Write Pattern
```
User Action → Component → Hook → Service (optional) → Repository → Dexie → IndexedDB
```

Example:
```typescript
// User logs a symptom
onClick() → <SymptomForm> → useSymptoms() → symptomRepository.create() → Dexie → IndexedDB
```

#### Read Pattern
```
Component Mount → Hook → Repository → Dexie → IndexedDB → Hook State → Component Render
```

Example:
```typescript
// Load symptom list
useEffect() → useSymptoms() → symptomRepository.getAll() → Dexie → state → <SymptomList>
```

---

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

---

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

### Navigation Components

| Component | Purpose | Used In |
|-----------|---------|---------|
| `BottomTabs` | Mobile tab bar (fixed bottom) | Protected layout (mobile) |
| `Sidebar` | Desktop navigation (left sidebar) | Protected layout (desktop) |
| `TopBar` | Header with user profile | Protected layout (all) |
| `NavLayout` | Wrapper combining nav elements | Protected route group |

---

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

### Installation Flow

1. User visits app in supported browser
2. PWA criteria met (HTTPS, manifest, service worker)
3. Browser shows install prompt (or `InstallPrompt` component)
4. User clicks "Install"
5. App added to home screen/app drawer
6. Launches in standalone mode (no browser chrome)

---

## Security Architecture

### Privacy Protection

#### 1. Local-Only Data Storage
- **Threat**: Cloud data breaches, unauthorized access
- **Mitigation**: All data stored in browser IndexedDB, never transmitted

#### 2. Photo Encryption
- **Threat**: Unauthorized photo access, device theft
- **Implementation**:
  ```typescript
  // AES-256-GCM encryption
  async function encryptPhoto(photo: Blob): Promise<EncryptedPhoto> {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      await photo.arrayBuffer()
    );
    return { encryptedData: encrypted, key, iv };
  }
  ```

#### 3. EXIF Data Stripping
- **Threat**: Location/device metadata exposure
- **Mitigation**: Strip all EXIF data before storage
  ```typescript
  function stripExifData(image: Blob): Blob {
    // Read image, remove metadata, return clean blob
  }
  ```

#### 4. No External Tracking
- **Threat**: User behavior surveillance
- **Mitigation**: Zero analytics/tracking unless explicitly opted in

### Content Security Policy (Planned)

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self';
  media-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```

---

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

## Testing Architecture

### Testing Pyramid

```
        ┌──────────┐
        │   E2E    │  ← Playwright (planned)
        └──────────┘
      ┌──────────────┐
      │ Integration  │  ← Testing Library
      └──────────────┘
    ┌──────────────────┐
    │  Unit Tests      │  ← Jest
    └──────────────────┘
```

### Test Configuration

**Jest Configuration** (`jest.config.js`):
```javascript
{
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  coverage: {
    branches: 80%,
    functions: 80%,
    lines: 80%,
    statements: 80%
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}
```

### Testing Patterns

#### 1. Component Testing
```typescript
describe('SymptomCard', () => {
  it('renders symptom name and severity', () => {
    const symptom = { id: '1', name: 'Lesion', severity: 7 };
    render(<SymptomCard symptom={symptom} />);
    
    expect(screen.getByText('Lesion')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
```

#### 2. Hook Testing
```typescript
describe('useSymptoms', () => {
  it('loads symptoms on mount', async () => {
    const { result } = renderHook(() => useSymptoms());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.symptoms).toHaveLength(5);
  });
});
```

#### 3. Repository Testing
```typescript
describe('SymptomRepository', () => {
  it('creates symptom with generated ID', async () => {
    const symptom = await symptomRepository.create({
      userId: 'user-1',
      name: 'Test',
      category: 'skin'
    });
    
    expect(symptom.id).toBeDefined();
    expect(symptom.name).toBe('Test');
  });
});
```

---

## Deployment Architecture

### Current: Vercel Deployment

**Platform**: Vercel (recommended)  
**Region**: Auto (CDN global distribution)  
**Build Command**: `npm run build`  
**Output**: Static site with ISR (Incremental Static Regeneration)

### Deployment Flow

```
GitHub Push → Vercel Webhook → Build (Next.js) → Deploy → CDN Distribution
```

### Environment Variables

Currently none required (local-first architecture), but planned for future:
- `NEXT_PUBLIC_APP_VERSION` - Version display
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Analytics toggle

### Build Optimization

- **Static Generation**: All pages pre-rendered at build time
- **Tree Shaking**: Unused code eliminated
- **Minification**: JavaScript and CSS minified
- **Image Optimization**: Automatic WebP conversion
- **Font Optimization**: Next.js font loading

### Hosting Requirements

✅ **Required**:
- HTTPS (for service worker)
- Static hosting (no server required)

❌ **Not Required**:
- Database server
- API endpoints
- Authentication service
- File storage (S3, etc.)

---

## Future Architecture Considerations

### Planned Enhancements

1. **Multi-Device Sync** (Phase 5)
   - Optional encrypted cloud sync
   - Conflict resolution
   - End-to-end encryption

2. **AI-Powered Insights** (Phase 3)
   - Pattern recognition
   - Trigger prediction
   - Symptom correlation

3. **Healthcare Provider Integration** (Future)
   - Shareable read-only reports
   - Temporary access tokens
   - FHIR compatibility

4. **Multi-User Support** (Future)
   - Family sharing
   - Caregiver access
   - Permission management

---

## References

- **Next.js Documentation**: https://nextjs.org/docs
- **Dexie.js Documentation**: https://dexie.org/
- **PWA Best Practices**: https://web.dev/progressive-web-apps/
- **IndexedDB Specification**: https://www.w3.org/TR/IndexedDB/
- **Web Crypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

---

**For detailed component documentation, see**: [docs/DEVELOPMENT/component-library.md](../docs/DEVELOPMENT/component-library.md)
**For database schema details, see**: [docs/ARCHITECTURE/data-model.md](../docs/ARCHITECTURE/data-model.md)
**For development guide, see**: [docs/DEVELOPMENT/setup-guide.md](../docs/DEVELOPMENT/setup-guide.md)
