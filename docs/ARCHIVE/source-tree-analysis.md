# Source Tree Analysis

**Project**: Pocket Symptom Tracker
**Last Updated**: 2025-11-04
**Structure**: Next.js 15 monolith with App Router

## Project Root Structure

```
symptom-tracker/
├── src/                    # Application source code (Next.js App Router)
├── public/                 # Static assets and PWA manifest
├── docs/                   # Project documentation (70+ files)
├── scripts/                # Build and utility scripts
├── bmad/                   # BMad Method workflow framework
├── ARCHIVE/                # Historical documentation
├── build-docs/             # Build-time documentation tasks
├── __mocks__/              # Test mocks (Jest)
├── .github/                # GitHub workflows and configs
├── .claude/                # Claude Code IDE configurations
├── .cursor/                # Cursor IDE configurations
├── .gemini/                # Gemini IDE configurations
├── .roo/                   # Roo IDE configurations
├── .playwright-mcp/        # Playwright MCP server tests
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration (strict mode)
├── next.config.ts          # Next.js configuration (PWA support)
├── tailwind.config.js      # Tailwind CSS v4 configuration
├── jest.config.js          # Jest testing configuration
├── eslint.config.mjs       # ESLint configuration
├── postcss.config.mjs      # PostCSS configuration
└── vercel.json             # Vercel deployment configuration
```

---

## Source Code (`src/`)

### Application Structure (`src/app/`)

Next.js 15 App Router with file-system based routing:

```
src/app/
├── layout.tsx                  # Root layout (theme, fonts, providers)
├── page.tsx                    # Landing page (/)
├── globals.css                 # Global styles (Tailwind CSS)
├── icon.svg                    # App icon
│
├── (protected)/                # Protected routes (requires onboarding)
│   ├── layout.tsx             # Protected layout with navigation
│   │
│   ├── dashboard/             # Today view (Track pillar)
│   │   └── page.tsx           # → /dashboard
│   │
│   ├── log/                   # Daily health reflection (Track)
│   │   └── page.tsx           # → /log
│   │
│   ├── flares/                # Active flare tracking (Track)
│   │   ├── page.tsx           # → /flares (list view)
│   │   └── [id]/              # → /flares/:id (detail view)
│   │       └── page.tsx
│   │
│   ├── photos/                # Encrypted photo gallery (Track)
│   │   └── page.tsx           # → /photos
│   │
│   ├── analytics/             # Correlation insights (Analyze pillar)
│   │   └── page.tsx           # → /analytics
│   │
│   ├── calendar/              # Timeline visualization (Analyze)
│   │   └── page.tsx           # → /calendar
│   │
│   ├── triggers/              # Trigger correlation (Analyze)
│   │   └── page.tsx           # → /triggers
│   │
│   ├── foods/                 # Food correlation (Analyze)
│   │   └── [foodId]/
│   │       └── correlation/
│   │           └── page.tsx   # → /foods/:foodId/correlation
│   │
│   ├── manage/                # Configure entities (Manage pillar)
│   │   └── page.tsx           # → /manage
│   │
│   ├── export/                # Data export/backup (Manage)
│   │   └── page.tsx           # → /export
│   │
│   ├── settings/              # App preferences (Manage)
│   │   └── page.tsx           # → /settings
│   │
│   ├── privacy/               # Privacy controls (Manage)
│   │   └── page.tsx           # → /privacy
│   │
│   ├── more/                  # Additional features (Support pillar)
│   │   └── page.tsx           # → /more
│   │
│   └── active-flares/         # Flare monitoring shortcut
│       └── page.tsx           # → /active-flares
│
├── onboarding/                # First-time setup wizard
│   ├── page.tsx               # → /onboarding
│   └── components/            # Onboarding-specific components
│       ├── WelcomeStep.tsx
│       ├── ProfileStep.tsx
│       ├── ConditionStep.tsx
│       ├── PreferencesStep.tsx
│       ├── EducationStep.tsx
│       ├── PrivacyStep.tsx
│       └── ProgressIndicator.tsx
│
└── api/                       # API routes (server-side)
    └── correlation/           # Correlation computation endpoints
        ├── compute/           # → /api/correlation/compute (POST/GET)
        │   └── route.ts
        ├── enhanced/          # → /api/correlation/enhanced (POST/GET)
        │   └── route.ts
        └── cron/              # → /api/correlation/cron (GET - Vercel Cron)
            └── route.ts
```

**Key Conventions**:
- `(protected)/` - Route group (doesn't affect URL)
- `page.tsx` - Route component
- `layout.tsx` - Shared layout
- `[id]/` - Dynamic route segment
- `route.ts` - API route handler

---

### Components (`src/components/`)

**Organization**: 33 functional categories with 298 components

```
src/components/
├── analytics/              # Data visualization (33 components)
│   ├── AnalyticsDashboard.tsx
│   ├── TrendChart.tsx
│   ├── TrendInterpretation.tsx
│   ├── TrendWidget.tsx
│   ├── DashboardContext.tsx
│   └── __tests__/         # Component tests
│
├── body-mapping/           # Enhanced body map (Epic 1 - 18 components)
│   ├── BodyMap.tsx
│   ├── ZoomPanControls.tsx
│   ├── SymptomMarker.tsx
│   ├── SymptomOverlay.tsx
│   ├── RegionDetailPanel.tsx
│   ├── bodies/            # SVG body templates
│   │   ├── FrontBody.tsx
│   │   └── BackBody.tsx
│   └── hooks/             # Body map hooks
│       ├── useBodyMap.ts
│       ├── useBodyRegions.ts
│       └── useSymptomMarkers.ts
│
├── flare/                  # Flare lifecycle (Epic 2 - 4 components)
│   ├── FlareCard.tsx
│   ├── FlareDetail.tsx
│   ├── FlareHistory.tsx
│   └── FlareHistoryChart.tsx
│
├── daily-entry/            # Daily reflection (5 + sections)
│   ├── DailyEntryForm.tsx
│   ├── EntryHistory.tsx
│   ├── QuickEntry.tsx
│   ├── SmartSuggestions.tsx
│   ├── EntryTemplates.tsx
│   ├── EntrySections/     # Form sections
│   │   ├── SymptomSection.tsx
│   │   ├── MedicationSection.tsx
│   │   ├── TriggerSection.tsx
│   │   ├── BodyMapSection.tsx
│   │   ├── NotesSection.tsx
│   │   └── PhotoSection.tsx
│   └── hooks/
│       ├── useDailyEntry.ts
│       ├── useSmartSuggestions.ts
│       └── useEntryTemplates.ts
│
├── calendar/               # Timeline visualization (9 components)
│   ├── CalendarView.tsx
│   ├── TimelineView.tsx
│   ├── ChartView.tsx
│   ├── DatePicker.tsx
│   └── hooks/
│       ├── useDateNavigation.ts
│       ├── useCalendarFilters.ts
│       └── useCalendarExport.ts
│
├── food/                   # Food journal
│   ├── FoodLogModal.tsx
│   ├── FoodSearch.tsx
│   ├── FoodSelector.tsx
│   └── FoodCorrelationView.tsx
│
├── charts/                 # Specialized charts
│   └── FoodCorrelationDelayChart.tsx
│
├── correlation/            # Correlation display
│   ├── ConfidenceBadge.tsx
│   └── InsufficientDataBadge.tsx
│
├── common/                 # Reusable UI primitives (6 components)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── ToastContainer.tsx
│   └── MarkdownPreview.tsx
│
├── navigation/             # App navigation
│   ├── NavBar.tsx
│   ├── BottomNav.tsx
│   └── SideNav.tsx
│
├── dashboard/              # Dashboard components (4 components)
│   ├── TodayHighlightsCard.tsx
│   ├── TodayTimelineCard.tsx
│   ├── TodayQuickActionsCard.tsx
│   └── TodayEmptyStates.tsx
│
├── empty-states/           # Empty state components
│   ├── EmptyDashboard.tsx
│   ├── EmptyFlares.tsx
│   └── EmptyCalendar.tsx
│
├── providers/              # React Context providers
│   ├── DatabaseProvider.tsx
│   ├── ThemeProvider.tsx
│   └── NotificationProvider.tsx
│
├── pwa/                    # PWA functionality
│   ├── InstallPrompt.tsx
│   ├── OfflineIndicator.tsx
│   └── UpdatePrompt.tsx
│
├── photos/                 # Photo management
│   ├── PhotoGallery.tsx
│   ├── PhotoUpload.tsx
│   ├── PhotoViewer.tsx
│   └── PhotoComparison.tsx
│
├── data-management/        # Export/import
│   ├── ExportData.tsx
│   ├── ImportData.tsx
│   └── BackupManager.tsx
│
├── medication-logging/     # Medication tracking
├── symptom-logging/        # Symptom logging
├── trigger-logging/        # Trigger tracking
├── mood/                   # Mood tracking (Story 3.5.2)
├── sleep/                  # Sleep tracking (Story 3.5.2)
├── filters/                # Filter components
├── landing/                # Landing page components
├── manage/                 # Entity management
├── settings/               # Settings UI
└── quick-log/              # Quick logging shortcuts
```

---

### Business Logic (`src/lib/`)

```
src/lib/
├── db/                     # Database layer (Dexie v4)
│   ├── client.ts          # Dexie database instance (18 tables)
│   ├── schema.ts          # TypeScript interfaces for all tables
│   └── __tests__/         # Database tests
│
├── repositories/           # Data access layer (Repository pattern)
│   ├── symptomInstanceRepository.ts
│   ├── medicationEventRepository.ts
│   ├── triggerEventRepository.ts
│   ├── foodEventRepository.ts
│   ├── flareRepository.ts
│   ├── flareEventRepository.ts
│   ├── bodyMapLocationRepository.ts
│   └── photoAttachmentRepository.ts
│
├── services/               # Business logic services
│   ├── correlation/       # Correlation computation services
│   │   ├── CorrelationOrchestrationService.ts
│   │   ├── CorrelationCacheService.ts
│   │   ├── CorrelationEngine.ts
│   │   └── FoodCombinationAnalyzer.ts
│   ├── flare/             # Flare lifecycle services
│   │   ├── FlareService.ts
│   │   └── FlareEventService.ts
│   ├── analytics/         # Analytics and trend analysis
│   │   ├── TrendAnalysisService.ts
│   │   └── CorrelationAnalyticsService.ts
│   └── export/            # Data export services
│       ├── ExportService.ts
│       └── PdfGeneratorService.ts
│
├── utils/                  # Utility functions
│   ├── statistics/        # Statistical utilities
│   │   ├── linearRegression.ts
│   │   ├── correlation.ts
│   │   └── confidence.ts
│   ├── date/              # Date utilities (date-fns wrappers)
│   │   ├── date-utils.ts
│   │   └── time-range.ts
│   ├── crypto/            # Encryption utilities
│   │   ├── photo-encryption.ts
│   │   └── exif-stripping.ts
│   └── validation/        # Zod schemas
│       ├── symptom-validation.ts
│       ├── medication-validation.ts
│       └── flare-validation.ts
│
├── data/                   # Static data and seeds
│   ├── bodyRegions.ts     # 93 body regions with coordinates
│   ├── defaultSymptoms.ts # 50+ preset symptoms
│   ├── defaultMedications.ts # Preset medications
│   ├── defaultTriggers.ts # 30+ preset triggers
│   └── defaultFoods.ts    # 200+ food database with allergen tags
│
├── hooks/                  # Global custom hooks
│   ├── useDatabase.ts     # Dexie database access
│   ├── useModal.ts        # Modal state management
│   ├── useToast.ts        # Toast notifications
│   ├── useTheme.ts        # Theme switching
│   └── useMediaQuery.ts   # Responsive breakpoints
│
└── types/                  # Shared TypeScript types
    ├── flare.ts           # Flare types
    ├── symptom.ts         # Symptom types
    ├── correlation.ts     # Correlation types
    └── analytics.ts       # Analytics types
```

---

### Tests (`src/__tests__/`)

```
src/__tests__/
├── integration/            # Integration tests
│   ├── body-map-zoom.test.tsx
│   ├── body-map-groin-selection.test.tsx
│   ├── coordinate-marking.test.tsx
│   └── flare-lifecycle.test.tsx
│
└── unit/                   # Unit tests (co-located with source)
    # Most unit tests are in __tests__/ folders next to source files
```

**Test Coverage**: 85%+ for critical paths

---

### Styles (`src/styles/`)

```
src/styles/
├── globals.css             # Global Tailwind CSS imports
└── accessibility.css       # Accessibility-specific styles (focus, contrast)
```

---

## Static Assets (`public/`)

```
public/
├── icons/                  # PWA icons (multiple sizes)
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (generated)
└── robots.txt              # SEO configuration
```

---

## Documentation (`docs/`)

**Comprehensive planning and implementation documentation (70+ files)**

```
docs/
├── PRD.md                  # Product Requirements Document
├── epics.md                # Epic breakdown (4 epics, 23 stories)
├── solution-architecture.md # Technical design and ADRs
├── bmm-workflow-status.md  # BMM workflow tracking
├── backlog.md              # Product backlog
│
├── stories/                # User story documentation (30+ files)
│   ├── story-0.*.md       # Epic 0: UI/UX Revamp
│   ├── story-1.*.md       # Epic 1: Enhanced Body Map
│   ├── story-2.*.md       # Epic 2: Flare Lifecycle
│   ├── story-3.*.md       # Epic 3: Analytics
│   └── validation-report-*.md # Story validation reports
│
├── ui/                     # UI/UX documentation
│   ├── ui-ux-revamp-blueprint.md
│   └── ux-validation-scripts.md
│
├── test-reports/           # Test execution reports
│   ├── TESTING-SUMMARY.md
│   ├── QUICK-TEST-GUIDE.md
│   └── p0-smoke-test-execution-report.md
│
├── findings/               # Implementation summaries
│   ├── dev-data-controls-audit.md
│   └── flare-clustering-update.md
│
├── retrospectives/         # Epic retrospectives
│   └── epic-3-retro-2025-10-29.md
│
└── FUTURE/                 # Future planning
    ├── future-ideas.md
    ├── CLOUD_SYNC_BRAINSTORM.md
    ├── CLOUD_SYNC_IMPLEMENTATION.md
    ├── body-map-layers.md
    └── body-map-ux-enhancements.md
```

---

## Scripts (`scripts/`)

```
scripts/
└── ux-validate.js          # UX instrumentation validation script
```

**Usage**: `npm run ux:validate` - Exports UX events for analysis

---

## BMad Method Framework (`bmad/`)

**Integrated development methodology framework for AI-assisted development**

```
bmad/
├── _cfg/                   # BMad configuration
│   ├── manifest.yaml      # Master manifest
│   ├── agent-manifest.csv
│   ├── workflow-manifest.csv
│   └── agents/            # Agent configurations
│
├── bmm/                    # BMad Method (core workflows)
│   ├── agents/            # Agent persona definitions
│   │   ├── pm.md         # Product Manager
│   │   ├── architect.md  # Solution Architect
│   │   ├── dev.md        # Developer
│   │   ├── sm.md         # Scrum Master
│   │   └── tea.md        # Test Architect
│   │
│   ├── workflows/         # Workflow definitions
│   │   ├── 1-analysis/   # Analysis phase
│   │   ├── 2-plan-workflows/ # Planning phase
│   │   ├── 3-solutioning/ # Architecture phase
│   │   └── 4-implementation/ # Implementation phase
│   │
│   └── tasks/             # Reusable tasks
│
├── cis/                    # Creative Intelligence System
│   ├── agents/            # Creative agent personas
│   └── workflows/         # Creative workflows
│
└── core/                   # Core BMad utilities
    ├── agents/
    ├── tasks/
    └── workflows/
```

---

## Archive (`ARCHIVE/`)

**Historical documentation from previous project phases**

```
ARCHIVE/
├── ARCHITECTURE/           # Old architecture docs
├── DEVELOPMENT/            # Old development guides
├── EPICS2and3/            # Previous epic documentation
├── IMPLEMENTATION/         # Old implementation notes
├── PRODUCT/               # Old product docs
├── technical/             # Technical notes
└── completed/             # Completed work archive
```

---

## Configuration Files

### TypeScript Configuration

**`tsconfig.json`**:
- Strict mode enabled (100% type safety)
- ES2017 target
- Path aliases: `@/*` → `./src/*`
- Next.js plugin integration

### Next.js Configuration

**`next.config.ts`**:
- PWA support (service worker headers)
- ESLint warnings allowed during build
- Manifest.json MIME type
- Version: 0.5.0

### Deployment Configuration

**`vercel.json`**:
- Vercel platform configuration
- Cron job definitions (correlation recomputation)
- Environment variables

### Testing Configuration

**`jest.config.js`**:
- Jest 30.5.0 with jsdom environment
- React Testing Library integration
- fake-indexeddb for database mocking
- Coverage thresholds: 80%+

### Linting Configuration

**`eslint.config.mjs`**:
- ESLint 9 with Next.js plugin
- TypeScript support
- React hooks rules

---

## Entry Points

### Application Entry Points

1. **Client Entry**: `src/app/layout.tsx` → Root layout with providers
2. **Landing Page**: `src/app/page.tsx` → Public landing page
3. **Protected Routes**: `src/app/(protected)/layout.tsx` → Authenticated layout
4. **API Routes**: `src/app/api/` → Server-side endpoints

### Database Entry Point

- **Dexie Client**: `src/lib/db/client.ts` → IndexedDB instance (18 tables)

### Service Worker

- **PWA**: `public/sw.js` → Generated service worker for offline support

---

## Critical Directories Explained

### `/src/app/(protected)/`

**Purpose**: Route group for authenticated pages requiring onboarding completion

**Why grouped**:
- Shares common layout with navigation
- Enforces onboarding gate
- Organizes all main app features

**Pages**: dashboard, log, flares, photos, analytics, calendar, triggers, manage, export, settings, privacy

---

### `/src/components/`

**Purpose**: Reusable React components (298 files)

**Organization**:
- Functional categories (analytics, body-mapping, flare, etc.)
- Co-located tests (`__tests__/` folders)
- Co-located hooks (`hooks/` folders)
- Index files for clean imports

**Key Categories**:
- **body-mapping/**: Epic 1 enhanced body map with zoom/pan
- **flare/**: Epic 2 flare lifecycle management
- **analytics/**: Data visualization and insights
- **daily-entry/**: Daily health reflection form

---

### `/src/lib/`

**Purpose**: Business logic separated from UI

**Layers**:
1. **db/**: Database schema and Dexie client
2. **repositories/**: Data access layer (CRUD operations)
3. **services/**: Business logic (correlation, analytics, export)
4. **utils/**: Pure utility functions
5. **hooks/**: Reusable React hooks
6. **types/**: Shared TypeScript types

**Pattern**: Repository pattern for data access, service layer for business logic

---

### `/docs/`

**Purpose**: Comprehensive project documentation

**Contents**:
- Strategic planning (PRD, epics, architecture)
- User stories (30+ files with acceptance criteria)
- Test plans and execution reports
- UI/UX design documentation
- Retrospectives and findings
- Future ideas and enhancements

**Audience**: Development team, stakeholders, AI agents

---

## Architecture Patterns

### File Organization

**By Feature** (components):
- Each feature has its own folder
- Tests co-located with source
- Hooks co-located with components

**By Layer** (lib):
- Separation of concerns (db, repositories, services)
- Clear dependency flow: UI → Services → Repositories → DB

### Naming Conventions

- **Components**: PascalCase (`FlareCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useFlares.ts`)
- **Utilities**: kebab-case (`date-utils.ts`)
- **Types**: PascalCase (`FlareRecord`)
- **Tests**: `*.test.tsx` or `*.test.ts`

### Import Aliases

**`@/*`** → `./src/*`

**Example**: `import { db } from '@/lib/db/client'`

---

## Build Output (Excluded)

### `.next/`

**Purpose**: Next.js build output (excluded from source control)

**Contents**:
- Compiled pages and routes
- Static assets
- Server functions
- Build cache

### `node_modules/`

**Purpose**: npm dependencies (excluded from source control)

**Size**: ~500MB (300+ packages)

---

## Development Workflow

### Local Development

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev` (port 3001 with Turbopack)
3. Open: `http://localhost:3001`
4. Hot reload enabled for all file changes

### Testing

1. Run all tests: `npm test`
2. Watch mode: `npm run test:watch`
3. Coverage: `npm run test:coverage`

### Building

1. Production build: `npm run build`
2. Start production server: `npm start`

### Linting

1. Run ESLint: `npm run lint`

---

## Integration Points

### None (Local-First Architecture)

**No external APIs**: All data operations are client-side using IndexedDB

**No authentication services**: Single-user PWA without accounts

**No analytics**: Privacy-first, no telemetry (except opt-in UX events)

**Deployment only**: Vercel Cron for scheduled correlation recomputation

---

## Summary

**Total Directories**: ~150 (excluding node_modules, .next, .git)

**Source Files**:
- TypeScript/TSX: 400+ files
- Test files: 50+ files
- Documentation: 70+ markdown files

**Critical Paths**:
- Application: `src/app/`
- Components: `src/components/`
- Business Logic: `src/lib/`
- Database: `src/lib/db/`
- Documentation: `docs/`

**Architecture**: Next.js 15 monolith with App Router, offline-first PWA, IndexedDB storage, React Context state management
