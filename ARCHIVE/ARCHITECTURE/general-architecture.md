# Solution Architecture Document

**Project:** symptom-tracker
**Date:** 2025-10-07
**Author:** BMad User

## Executive Summary

Phase 3 adds the Intelligence Layer to an existing symptom tracking Progressive Web App, transforming passive data collection into active intelligence. This architecture extends the proven Next.js 15 + React 19 + Dexie 4.2 foundation from Phases 1 & 2 with three major capabilities:

1. **Data Analysis & Insights Engine** - Local statistical analytics (trend analysis, correlation detection, pattern recognition, predictive modeling) using Web Workers for computation
2. **Advanced Search & Filtering** - Sub-500ms full-text search across 10,000+ entries using IndexedDB-based inverted indices
3. **Professional Report Generation** - Medical-grade PDF reports with embedded charts using jsPDF + html2canvas

**Architecture Style:** Modular Monolith with clear epic-aligned feature boundaries
**Repository Strategy:** Monorepo (single repo, organized by feature modules)
**Rendering:** Client-Side Rendering (CSR) for Phase 3 analytics features
**Privacy Model:** 100% local processing, zero external API calls, no cloud dependencies

This architecture maintains the privacy-first, offline-capable approach while scaling to handle 5+ years of health data (1,800+ daily entries) with sustained performance.

## 1. Technology Stack and Decisions

### 1.1 Technology and Library Decision Table

| Category | Technology | Version | Justification |
| --- | --- | --- | --- |
| Framework | Next.js | 15.1.0 | Existing foundation, App Router, excellent PWA support, proven in Phases 1 & 2 |
| Language | TypeScript | 5.7.2 | Type safety for statistical calculations, reduces runtime errors, existing codebase |
| Runtime | React | 19.0.0 | Existing foundation, excellent for interactive dashboards, proven performance |
| Styling | Tailwind CSS | 4.0.0 | Existing design system, utility-first approach, custom theme established |
| Database | Dexie (IndexedDB) | 4.2.0 | Existing data layer, offline-first, proven scalability, supports complex queries |
| Charts | Chart.js | 4.5.0 | MIT license, no external dependencies, canvas-based (works offline), broad chart types |
| Chart Bindings | react-chartjs-2 | 5.3.0 | React integration for Chart.js, hooks-based API, TypeScript support |
| PDF Generation | jsPDF | 2.5.2 | Client-side PDF creation, no server required, proven reliability |
| Canvas Export | html2canvas | 1.4.1 | Chart-to-image conversion, supports complex layouts, works with Chart.js |
| Background Computation | Web Workers API | Native | Browser-native, enables non-blocking analytics, zero dependencies |
| State Management | React Context + Hooks | Native | Sufficient for Phase 3 scope, existing pattern, no external lib needed |
| Icons | Heroicons | 2.2.0 | Existing library, Tailwind-compatible, analytics icons available |
| Animations | Tailwind Transitions + Framer Motion | 4.0.0 + 11.15.0 | Tailwind for simple, Framer Motion for complex dashboard animations |
| Hosting | Vercel | Latest | Edge network, optimized for Next.js, automatic PWA deployment |
| CI/CD | GitHub Actions | Latest | Free for public repos, Next.js deployment workflow established |
| Testing (Unit) | Jest | 30.0.0 | Existing test framework, React Testing Library integration |
| Testing (E2E) | Playwright | 1.49.0 | Cross-browser, PWA support, existing setup from Phase 2 |
| Build Tool | Turbopack (Next.js 15) | Native | Faster builds than Webpack, built into Next.js 15 |

**Additional Libraries:**
- **Statistical Utilities:** Custom TypeScript implementations (linear regression, Pearson correlation, time-series analysis) - no external ML libraries to maintain privacy and control
- **Date Handling:** date-fns 4.1.0 (existing, tree-shakable, timezone-safe)
- **Search Tokenization:** Custom stemming + tokenization (no external NLP libs)
- **Compression:** pako 2.1.0 (for search index compression)

## 2. Application Architecture

### 2.1 Architecture Pattern

**Modular Monolith with Epic-Aligned Feature Modules**

```
symptom-tracker (Monorepo)
├── /app                      # Next.js 15 App Router (existing)
│   ├── /(routes)            # Page routes
│   ├── /api                 # API routes (if needed for service worker)
│   └── layout.tsx           # Root layout with PWA manifest
│
├── /src                      # Application source
│   ├── /features            # Epic-aligned feature modules (NEW)
│   │   ├── /analytics       # Epic 1: Data Analysis & Insights
│   │   │   ├── /components  # UI components (charts, dashboards)
│   │   │   ├── /services    # Analysis algorithms, Web Workers
│   │   │   ├── /hooks       # Custom React hooks
│   │   │   └── /types       # TypeScript interfaces
│   │   ├── /search          # Epic 2: Advanced Search & Filtering
│   │   │   ├── /components  # Search UI, filters, facets
│   │   │   ├── /services    # Search indexing, query engine
│   │   │   ├── /hooks       # Search state management
│   │   │   └── /types       # Search types
│   │   └── /reports         # Epic 3: Professional Report Generation
│   │       ├── /components  # Report builder, preview
│   │       ├── /services    # PDF generation, export
│   │       ├── /hooks       # Report state
│   │       └── /types       # Report types
│   │
│   ├── /core                # Shared infrastructure (existing + extended)
│   │   ├── /database        # Dexie setup, repositories
│   │   │   ├── schema.ts    # Database schema (v8 migration)
│   │   │   ├── repositories # Phase 1 & 2 repos (existing)
│   │   │   └── /phase3      # Phase 3 repositories (NEW)
│   │   │       ├── analysisRepository.ts
│   │   │       ├── searchRepository.ts
│   │   │       └── reportRepository.ts
│   │   ├── /workers         # Web Worker implementations (NEW)
│   │   │   ├── analyticsWorker.ts
│   │   │   └── searchIndexWorker.ts
│   │   └── /utils           # Shared utilities
│   │
│   ├── /components          # Shared UI components (existing)
│   └── /styles              # Global styles (existing)
│
└── /public                  # Static assets, PWA manifest (existing)
```

**Rationale:**
- **Modular Monolith:** Single deployable unit with clear module boundaries (faster iteration for solo dev)
- **Epic Alignment:** Features organized by PRD epics (analytics, search, reports) for clear ownership
- **Separation of Concerns:** Components (UI) → Hooks (state) → Services (logic) → Repositories (data)
- **Web Workers Isolation:** Heavy computation in separate thread prevents UI blocking

### 2.2 Server-Side Rendering Strategy

**Phase 3 Rendering:** Client-Side Rendering (CSR) with Progressive Enhancement

```typescript
// app/insights/page.tsx - Insights Dashboard
'use client'; // CSR for analytics features

export default function InsightsDashboard() {
  // All analysis computed client-side in Web Workers
  const { insights, loading } = useAnalytics();

  return (
    <DashboardLayout>
      <AnalyticsDashboard insights={insights} />
    </DashboardLayout>
  );
}
```

**Rationale:**
- **Privacy:** All analytics computation must happen client-side (no server access to health data)
- **Offline:** Features must work offline, CSR enables full offline capability
- **Data Locality:** Data in IndexedDB, only accessible client-side
- **Performance:** Web Workers handle heavy computation without server round-trips

**Existing Phase 1 & 2 Rendering:**
- Marketing pages: Static Site Generation (SSG)
- Daily entry forms: CSR (for offline form submission)
- Calendar views: CSR (dynamic data from IndexedDB)

### 2.3 Page Routing and Navigation

**Phase 3 Routes:**

```
/insights                    # Analytics dashboard (Epic 1)
/insights/trends             # Trend analysis detail view
/insights/correlations       # Correlation matrix view
/insights/patterns           # Pattern detection view
/insights/predictions        # Predictive modeling view

/search                      # Search interface (Epic 2)
/search?q={query}&filters={} # Search results with query params

/reports                     # Report library (Epic 3)
/reports/new                 # Report builder wizard
/reports/{id}                # Report detail/preview
/reports/{id}/share          # Shareable link access
```

**Navigation Integration:**
- Bottom tab bar (mobile): `[Home] [Daily Entry] [Insights] [Search] [More]`
- Top nav (desktop): Horizontal navigation with dropdowns
- Global search: `Cmd/Ctrl+K` keyboard shortcut triggers search modal from any page

### 2.4 Data Fetching Approach

**Client-Side Data Fetching with Dexie + Custom Hooks**

```typescript
// Custom hook example: useAnalytics
export function useAnalytics(timeRange: TimeRange) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const worker = new Worker('/workers/analyticsWorker.js');

    // Fetch data from IndexedDB
    analysisRepository.getByTimeRange(timeRange).then(data => {
      // Offload computation to Web Worker
      worker.postMessage({ type: 'analyze', data });

      worker.onmessage = (e) => {
        setInsights(e.data.insights);
        setLoading(false);
      };
    });

    return () => worker.terminate();
  }, [timeRange]);

  return { insights, loading };
}
```

**Data Flow:**
1. Component → Custom Hook → Repository → Dexie → IndexedDB
2. Data → Web Worker (computation) → Hook state → Component re-render
3. Results cached in IndexedDB `analysisResults` table for quick re-display

**No Network Requests:** All data fetching is local IndexedDB queries, no API calls for analytics.

## 3. Data Architecture

### 3.1 Database Schema

**Dexie v8 Migration - Phase 3 Tables**

```typescript
// src/core/database/schema.ts

import Dexie from 'dexie';

export interface AnalysisResult {
  id?: number;
  type: 'trend' | 'correlation' | 'pattern' | 'prediction' | 'anomaly';
  metric: string;                    // e.g., 'symptom_severity', 'medication_effectiveness'
  timeRange: { start: Date; end: Date };
  result: {
    value: number;                   // Primary metric value
    confidence: number;              // 0-100 confidence percentage
    metadata: Record<string, any>;   // Type-specific data (R², p-value, etc.)
  };
  generatedAt: Date;
  expiresAt: Date;                   // Cache TTL (e.g., 24 hours)
}

export interface SearchIndex {
  id?: number;
  token: string;                     // Stemmed search token
  documentType: 'symptom' | 'medication' | 'trigger' | 'note' | 'photo';
  documentId: number;                // Reference to original document
  fieldName: string;                 // Field being indexed (e.g., 'notes', 'name')
  position: number;                  // Token position in field (for phrase search)
  createdAt: Date;
}

export interface SavedSearch {
  id?: number;
  name: string;
  description?: string;
  query: string;
  filters: Record<string, any>;     // Serialized filter state
  facets?: string[];
  lastUsed: Date;
  usageCount: number;
  createdAt: Date;
}

export interface Report {
  id?: number;
  name: string;
  templateId: string;
  configuration: {
    timeRange: { start: Date; end: Date };
    sections: string[];              // Included section IDs
    customSections?: Array<{ title: string; content: string }>;
  };
  generatedAt: Date;
  format: 'pdf' | 'html' | 'docx' | 'json' | 'csv';
  fileSize: number;                  // In bytes
  blobUrl?: string;                  // Local Blob URL (temporary)
}

export interface ReportTemplate {
  id?: number;
  name: string;
  description: string;
  category: 'consultation' | 'insurance' | 'progress' | 'emergency' | 'custom';
  sections: Array<{
    id: string;
    title: string;
    required: boolean;
    dataSource: string;              // Which data to query
  }>;
  isCustom: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface SearchAnalytics {
  id?: number;
  query: string;
  resultCount: number;
  responseTime: number;              // In milliseconds
  clickedResults: number[];          // IDs of clicked results
  timestamp: Date;
}

export interface PatternDetection {
  id?: number;
  patternType: 'cyclical' | 'seasonal' | 'trigger-response' | 'medication-effect';
  description: string;
  confidence: number;                // 0-100
  occurrences: Array<{
    date: Date;
    relatedFactors: string[];
  }>;
  frequency?: string;                // e.g., "Every 28±3 days"
  detectedAt: Date;
  dismissed: boolean;
}

// Dexie Database Class (extending existing)
export class SymptomTrackerDB extends Dexie {
  // Phase 1 & 2 tables (existing)
  dailyEntries!: Dexie.Table<DailyEntry, number>;
  symptoms!: Dexie.Table<Symptom, number>;
  medications!: Dexie.Table<Medication, number>;
  triggers!: Dexie.Table<Trigger, number>;
  activeFlares!: Dexie.Table<ActiveFlare, number>;
  bodyMapLocations!: Dexie.Table<BodyMapLocation, number>;

  // Phase 3 tables (NEW)
  analysisResults!: Dexie.Table<AnalysisResult, number>;
  searchIndex!: Dexie.Table<SearchIndex, number>;
  savedSearches!: Dexie.Table<SavedSearch, number>;
  reports!: Dexie.Table<Report, number>;
  reportTemplates!: Dexie.Table<ReportTemplate, number>;
  searchAnalytics!: Dexie.Table<SearchAnalytics, number>;
  patternDetections!: Dexie.Table<PatternDetection, number>;

  constructor() {
    super('SymptomTrackerDB');

    this.version(8).stores({
      // Existing tables (v1-v7)
      dailyEntries: '++id, date, createdAt',
      symptoms: '++id, name, category',
      medications: '++id, name, startDate',
      triggers: '++id, name, category',
      activeFlares: '++id, startDate, endDate, isActive',
      bodyMapLocations: '++id, dailyEntryId, symptomId, bodyRegion',

      // Phase 3 tables (v8)
      analysisResults: '++id, type, metric, [type+metric], expiresAt',
      searchIndex: '++id, token, [token+documentType], documentId',
      savedSearches: '++id, name, lastUsed',
      reports: '++id, generatedAt, templateId',
      reportTemplates: '++id, name, category, isCustom',
      searchAnalytics: '++id, query, timestamp',
      patternDetections: '++id, patternType, confidence, detectedAt, dismissed',
    });
  }
}
```

**Index Strategy:**
- **Compound Indices:** `[type+metric]` for fast analysis result lookup by analysis type
- **Token Index:** `token` for full-text search, `[token+documentType]` for filtered searches
- **Expiration:** `expiresAt` on analysis results enables automatic cache cleanup
- **Usage Tracking:** `lastUsed` and `usageCount` for saved search popularity

### 3.2 Data Models and Relationships

**Phase 3 Data Relationships:**

```
AnalysisResult ----many-to-many----> DailyEntry (analyzed data)
                 (via metric + timeRange)

PatternDetection --one-to-many----> DailyEntry (occurrences)

SearchIndex ------many-to-one-----> Symptom | Medication | Trigger | DailyEntry
              (documentType + documentId)

SavedSearch ------no direct relation (query executed dynamically)

Report -----------many-to-one-----> ReportTemplate
Report -----------references-----> Multiple tables (via configuration.sections)
```

**Data Dependencies:**
- Analytics queries: `dailyEntries + symptoms + medications + triggers + bodyMapLocations`
- Search indexing: All Phase 1 & 2 tables (comprehensive full-text index)
- Report generation: All tables (reports are comprehensive data exports)

### 3.3 Data Migrations Strategy

**Migration Path: v7 (Phase 2) → v8 (Phase 3)**

```typescript
// src/core/database/migrations/v7-to-v8.ts

export async function migrateToV8(db: SymptomTrackerDB) {
  console.log('Starting v7 → v8 migration (Phase 3 Intelligence Layer)');

  // 1. Create new Phase 3 tables (handled by Dexie version() declaration)

  // 2. Build initial search index for existing data
  const indexBuilder = new SearchIndexBuilder(db);
  await indexBuilder.buildFullIndex(); // Runs in Web Worker

  // 3. Seed default report templates
  await seedDefaultReportTemplates(db);

  // 4. No data transformation needed (additive migration)

  console.log('Migration complete: v8 ready');
}

async function seedDefaultReportTemplates(db: SymptomTrackerDB) {
  const templates: ReportTemplate[] = [
    {
      name: 'Consultation Summary',
      description: 'Comprehensive report for doctor appointments',
      category: 'consultation',
      sections: [
        { id: 'symptom-timeline', title: 'Symptom Timeline', required: true, dataSource: 'dailyEntries' },
        { id: 'flare-history', title: 'Flare History', required: true, dataSource: 'activeFlares' },
        { id: 'medications', title: 'Current Medications', required: true, dataSource: 'medications' },
        { id: 'correlations', title: 'Significant Correlations', required: false, dataSource: 'analysisResults' },
        { id: 'body-map', title: 'Body Map Summary', required: false, dataSource: 'bodyMapLocations' },
      ],
      isCustom: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    // ... 7 more templates
  ];

  await db.reportTemplates.bulkAdd(templates);
}
```

**Migration Safety:**
- **Additive Only:** No modifications to existing Phase 1 & 2 tables (zero risk)
- **Background Processing:** Index building in Web Worker (doesn't block UI)
- **Rollback Plan:** Drop v8 tables, revert to v7 schema (Dexie handles versioning)
- **Progress Indicators:** Show migration progress to user during initial load

## 4. API Design

**Phase 3 Has No Traditional APIs** - All features are client-side only.

### 4.1 Internal Service Interfaces

Instead of REST/GraphQL APIs, Phase 3 uses **internal service modules** with TypeScript interfaces:

**Analytics Service:**
```typescript
// src/features/analytics/services/trendAnalysisService.ts

export interface TrendAnalysisResult {
  slope: number;                  // Regression slope
  intercept: number;              // Y-intercept
  rSquared: number;               // R² goodness of fit
  confidence: number;             // 0-100 confidence
  direction: 'increasing' | 'decreasing' | 'stable';
  changePoints?: Date[];          // Significant shifts
  interpretation: string;         // Plain-language summary
}

export class TrendAnalysisService {
  async analyzeTrend(
    metric: string,
    timeRange: { start: Date; end: Date }
  ): Promise<TrendAnalysisResult> {
    // 1. Fetch data from repository
    const data = await dailyEntryRepository.getByDateRange(timeRange);

    // 2. Extract metric values
    const points = this.extractMetricValues(data, metric);

    // 3. Compute linear regression (in Web Worker if > 100 points)
    const regression = await this.computeRegression(points);

    // 4. Calculate confidence and interpretation
    const result = this.buildResult(regression, points);

    // 5. Cache result
    await analysisRepository.saveResult('trend', metric, timeRange, result);

    return result;
  }

  private async computeRegression(points: Point[]): Promise<RegressionData> {
    if (points.length > 100) {
      // Offload to Web Worker for large datasets
      return await this.workerPool.execute('linearRegression', points);
    } else {
      // Compute inline for small datasets
      return this.linearRegression(points);
    }
  }
}
```

**Search Service:**
```typescript
// src/features/search/services/searchService.ts

export interface SearchResult {
  id: number;
  type: 'symptom' | 'medication' | 'trigger' | 'note' | 'photo';
  title: string;
  snippet: string;              // Highlighted excerpt
  date: Date;
  relevance: number;            // 0-100 relevance score
  matchedFields: string[];
}

export class SearchService {
  async search(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    const startTime = performance.now();

    // 1. Tokenize query
    const tokens = this.tokenizer.tokenize(query);

    // 2. Query search index
    const matches = await searchRepository.findByTokens(tokens, filters);

    // 3. Rank by relevance (TF-IDF)
    const ranked = this.ranker.rank(matches, tokens);

    // 4. Build result objects with snippets
    const results = await this.buildResults(ranked);

    // 5. Log analytics
    const responseTime = performance.now() - startTime;
    await searchAnalyticsRepository.log(query, results.length, responseTime);

    return results;
  }
}
```

**Report Service:**
```typescript
// src/features/reports/services/reportGenerationService.ts

export interface ReportGenerationOptions {
  templateId: string;
  timeRange: { start: Date; end: Date };
  sections: string[];
  format: 'pdf' | 'html' | 'docx';
  customSections?: CustomSection[];
}

export class ReportGenerationService {
  async generateReport(options: ReportGenerationOptions): Promise<Blob> {
    // 1. Load template
    const template = await reportRepository.getTemplate(options.templateId);

    // 2. Fetch all required data
    const data = await this.fetchReportData(template.sections, options.timeRange);

    // 3. Generate charts (html2canvas for Chart.js → image)
    const charts = await this.generateCharts(data);

    // 4. Build report document
    const document = this.buildDocument(template, data, charts, options);

    // 5. Export to format
    const blob = await this.exportToFormat(document, options.format);

    // 6. Save report record
    await reportRepository.saveReport({
      templateId: options.templateId,
      configuration: options,
      format: options.format,
      fileSize: blob.size,
      generatedAt: new Date(),
    });

    return blob;
  }

  private async exportToFormat(document: Document, format: string): Promise<Blob> {
    switch (format) {
      case 'pdf':
        return await this.pdfExporter.export(document); // jsPDF
      case 'html':
        return await this.htmlExporter.export(document);
      case 'docx':
        return await this.docxExporter.export(document); // docx lib
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}
```

### 4.2 Web Worker Communication Protocol

**Worker Message Format:**

```typescript
// Analytics Worker Messages
interface AnalyticsWorkerRequest {
  id: string;                     // Request ID for matching responses
  type: 'linearRegression' | 'correlation' | 'pattern' | 'prediction';
  payload: any;                   // Type-specific data
}

interface AnalyticsWorkerResponse {
  id: string;                     // Matching request ID
  success: boolean;
  result?: any;
  error?: string;
}

// Search Index Worker Messages
interface IndexWorkerRequest {
  type: 'buildIndex' | 'updateIndex' | 'deleteFromIndex';
  documents: Array<{ id: number; type: string; fields: Record<string, string> }>;
}

interface IndexWorkerProgress {
  type: 'progress';
  processed: number;
  total: number;
  percentage: number;
}
```

**No External APIs:** Phase 3 maintains the privacy-first architecture with zero network requests for data processing.

## 5. Authentication and Authorization

**Not Applicable for Phase 3**

Rationale:
- Single-user application (local-only data)
- No multi-user features
- No cloud sync (by design)
- Data access controlled by browser's origin policy (IndexedDB scoped to origin)

**Future Consideration (Phase 4+):**
- If cloud sync is added: OAuth 2.0 + PKCE flow
- If multi-user: Role-based access control (RBAC)
- Current Phase 3: No auth layer needed

## 6. State Management

### 6.1 Server State

**Not Applicable** - No server-side state (no backend server for Phase 3 features)

### 6.2 Client State

**React Context + Custom Hooks Pattern**

```typescript
// Analytics Context
export const AnalyticsContext = createContext<AnalyticsState | null>(null);

export function AnalyticsProvider({ children }: PropsWithChildren) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshInsights = useCallback(async () => {
    setLoading(true);
    const results = await analyticsService.getInsights(timeRange);
    setInsights(results);
    setLoading(false);
  }, [timeRange]);

  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  return (
    <AnalyticsContext.Provider value={{ timeRange, setTimeRange, insights, loading, refreshInsights }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return context;
}
```

**State Layers:**
1. **Global State:** React Context for feature-level state (analytics, search, reports)
2. **Local State:** `useState` for component-specific state (form inputs, modals)
3. **Derived State:** `useMemo` for computed values (filtered results, sorted lists)
4. **Persistent State:** IndexedDB via repositories (analysis cache, saved searches)

### 6.3 Form State

**Controlled Components with React Hook Form** (existing pattern from Phase 2)

```typescript
// Report Builder Form Example
export function ReportConfigForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ReportConfig>({
    defaultValues: {
      timeRange: { start: subMonths(new Date(), 6), end: new Date() },
      sections: ['symptoms', 'flares', 'medications'],
    },
  });

  const onSubmit = async (data: ReportConfig) => {
    await reportService.generateReport(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 6.4 Caching Strategy

**Multi-Layer Caching:**

1. **Analysis Result Cache (IndexedDB):**
   - TTL: 24 hours for trend/correlation results
   - Invalidation: On new daily entry submission
   - Key: `type + metric + timeRange`

2. **Search Index Cache:**
   - Persistent in `searchIndex` table
   - Incremental updates on data changes
   - Rebuild trigger: Manual or corruption detection

3. **Report Cache (Temporary):**
   - Generated reports stored as Blobs (temporary URLs)
   - Cleanup: On browser close or after 7 days
   - Storage: IndexedDB `reports` table + Blob storage

4. **Component-Level Cache:**
   - `useMemo` for expensive calculations
   - `useCallback` for stable function references
   - React Query NOT used (no network requests)

## 7. UI/UX Architecture

### 7.1 Component Structure

**Atomic Design Pattern (Existing from Phases 1 & 2, Extended for Phase 3)**

```
/components (Shared)
├── /atoms                   # Basic building blocks
│   ├── Button.tsx          # (existing)
│   ├── Badge.tsx           # (existing)
│   ├── ConfidenceBadge.tsx # (NEW - shows statistical confidence)
│   └── TooltipInfo.tsx     # (NEW - contextual help)
│
├── /molecules              # Combinations of atoms
│   ├── StatCard.tsx        # (NEW - single stat with icon + trend)
│   ├── InsightCard.tsx     # (NEW - analysis insight with CTA)
│   ├── FilterChip.tsx      # (NEW - removable filter tag)
│   └── LoadingSkeleton.tsx # (NEW - content placeholder)
│
├── /organisms              # Complex components
│   ├── CorrelationMatrix.tsx       # (NEW - interactive heatmap)
│   ├── TrendChart.tsx              # (NEW - Chart.js wrapper)
│   ├── GlobalSearch.tsx            # (NEW - search interface)
│   ├── FilterBuilder.tsx           # (NEW - advanced filters)
│   ├── WizardStepper.tsx           # (NEW - multi-step form)
│   └── ReportPreview.tsx           # (NEW - PDF preview)
│
├── /templates              # Page layouts
│   ├── DashboardLayout.tsx # (existing, adapted for analytics)
│   └── WizardLayout.tsx    # (NEW - report builder layout)
│
└── /pages                  # Feature pages (in /app directory)
```

**Feature-Specific Components (within /features):**
```
/features/analytics/components
├── AnalyticsDashboard.tsx         # Main dashboard grid
├── TrendAnalysisCard.tsx          # Trend analysis widget
├── CorrelationAnalysisCard.tsx    # Correlation widget
└── RecommendationsList.tsx        # Recommendations panel

/features/search/components
├── SearchInterface.tsx            # Search bar + results
├── FacetPanel.tsx                 # Faceted navigation sidebar
└── SavedSearchManager.tsx         # Saved searches UI

/features/reports/components
├── ReportBuilder.tsx              # Wizard orchestrator
├── TemplateSelector.tsx           # Template gallery
├── ReportConfigurator.tsx         # Configuration step
└── ContentEditor.tsx              # Custom section editor
```

### 7.2 Styling Approach

**Tailwind CSS 4 Utility-First (Existing Strategy)**

**Custom Design Tokens for Phase 3:**
```typescript
// tailwind.config.ts extensions

export default {
  theme: {
    extend: {
      colors: {
        // Intelligence-specific semantic colors
        confidence: {
          'very-high': '#10b981',  // emerald-500
          'high': '#3b82f6',       // blue-500
          'medium': '#f59e0b',     // amber-500
          'low': '#9ca3af',        // gray-400
        },
        trend: {
          positive: '#059669',     // emerald-600
          negative: '#dc2626',     // red-600
          neutral: '#6b7280',      // gray-500
        },
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};
```

**Component Styling Strategy:**
- Utility classes for simple components
- `@apply` for repeated patterns in complex components
- CSS Modules NOT used (Tailwind preferred)
- Inline styles for dynamic chart colors

### 7.3 Responsive Design

**Breakpoints (Tailwind defaults):**
- `sm: 640px` - Large phones (landscape)
- `md: 768px` - Tablets (portrait)
- `lg: 1024px` - Tablets (landscape), small laptops
- `xl: 1280px` - Desktops
- `2xl: 1536px` - Large displays

**Mobile-First Responsive Patterns:**

**Analytics Dashboard:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Mobile: 1 column, Desktop: 4 columns */}
</div>
```

**Search Interface:**
```tsx
{/* Mobile: Bottom sheet, Desktop: Sidebar */}
<div className="lg:flex">
  <aside className="hidden lg:block lg:w-64"> {/* Desktop sidebar */}
    <FilterPanel />
  </aside>
  <main className="flex-1">
    <SearchResults />
  </main>
  <Sheet open={showFilters} side="bottom"> {/* Mobile bottom sheet */}
    <FilterPanel />
  </Sheet>
</div>
```

**Report Builder:**
```tsx
{/* Mobile: Vertical stepper, Desktop: Horizontal */}
<Stepper orientation={isMobile ? 'vertical' : 'horizontal'}>
  {steps.map(step => <Step key={step.id}>{step.content}</Step>)}
</Stepper>
```

### 7.4 Accessibility

**WCAG 2.1 AA Compliance** (Minimum Target)

**Key Accessibility Features:**

1. **Semantic HTML:** `<main>`, `<nav>`, `<article>`, `<section>` for proper structure
2. **ARIA Labels:** `role="region"`, `aria-label`, `aria-describedby` for screen readers
3. **Keyboard Navigation:**
   - `Cmd/Ctrl+K`: Global search shortcut
   - `Tab` / `Shift+Tab`: Navigate interactive elements
   - `Arrow keys`: Navigate dashboard widgets, matrix cells
   - `Enter` / `Space`: Activate buttons, toggle widgets
4. **Focus Management:**
   - Visible focus indicators (2px outline, 3:1 contrast)
   - Focus trapping in modals
   - Auto-focus on modal open, restore on close
5. **Screen Reader Support:**
   - Live regions for search results (`aria-live="polite"`)
   - Chart data tables (toggle for screen readers)
   - Progress announcements ("Generating report... 45% complete")
6. **Color Contrast:** All text ≥4.5:1 ratio, interactive elements ≥3:1
7. **Text Alternatives:**
   - Charts have alt text + data table option
   - Icons have `aria-label` or visible text

**Accessibility Testing:**
- Automated: axe DevTools, Lighthouse
- Manual: Keyboard navigation testing, NVDA/JAWS screen reader testing
- Color: Contrast checker, colorblind simulator

## 8. Performance Optimization

### 8.1 Computation Offloading

**Web Workers for Heavy Analytics**

```typescript
// src/core/workers/analyticsWorker.ts

self.onmessage = async (e: MessageEvent<AnalyticsWorkerRequest>) => {
  const { id, type, payload } = e.data;

  try {
    let result;
    switch (type) {
      case 'linearRegression':
        result = computeLinearRegression(payload.points);
        break;
      case 'correlation':
        result = computePearsonCorrelation(payload.x, payload.y);
        break;
      case 'pattern':
        result = detectPatterns(payload.timeSeries);
        break;
      default:
        throw new Error(`Unknown analytics type: ${type}`);
    }

    self.postMessage({ id, success: true, result });
  } catch (error) {
    self.postMessage({ id, success: false, error: error.message });
  }
};

function computeLinearRegression(points: Point[]): RegressionResult {
  // Compute linear regression without blocking main thread
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const yMean = sumY / n;
  const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
  const ssResidual = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssResidual / ssTotal);

  return { slope, intercept, rSquared };
}
```

**Worker Pool Management:**
- Maximum 2 concurrent workers (avoid CPU overload)
- Worker reuse for multiple tasks (avoid spawn overhead)
- Automatic termination after 60s idle

### 8.2 IndexedDB Query Optimization

**Compound Indices for Fast Queries:**
```typescript
// Optimized query example
await db.analysisResults
  .where('[type+metric]')
  .equals(['trend', 'symptom_severity'])
  .and(result => result.expiresAt > new Date())
  .first();
```

**Batch Operations:**
```typescript
// Bulk insert for search indexing
await db.searchIndex.bulkAdd(indexEntries); // Faster than individual adds
```

**Pagination for Large Result Sets:**
```typescript
// Search results pagination
const results = await db.searchIndex
  .where('token').equals(searchToken)
  .offset(page * pageSize)
  .limit(pageSize)
  .toArray();
```

### 8.3 Search Index Compression

**Pako (gzip) for Index Storage:**
```typescript
import pako from 'pako';

// Compress large index entries
const compressed = pako.deflate(JSON.stringify(largeIndexData));
await db.searchIndex.put({ token, data: compressed });

// Decompress on retrieval
const decompressed = pako.inflate(compressed, { to: 'string' });
const data = JSON.parse(decompressed);
```

**Estimated Compression:**
- Uncompressed index: ~10MB for 10,000 entries
- Compressed index: ~2-3MB (70-80% reduction)

### 8.4 Code Splitting

**Next.js Automatic Code Splitting + Dynamic Imports**

```typescript
// Dynamic import for heavy analytics components
const CorrelationMatrix = dynamic(
  () => import('@/features/analytics/components/CorrelationMatrix'),
  { loading: () => <LoadingSkeleton type="chart" /> }
);

// Route-based splitting (automatic with Next.js App Router)
// /insights page only loads analytics code
// /search page only loads search code
// /reports page only loads report generation code
```

**Bundle Size Targets:**
- Initial load: <200KB (gzipped)
- Analytics chunk: <150KB
- Search chunk: <100KB
- Reports chunk: <200KB (includes jsPDF)

## 9. SEO and Meta Tags

**Not a Priority for Phase 3** - Intelligence features are private, user-specific (no SEO benefit)

**Basic Meta Tags (Existing from Phase 1):**
```tsx
// app/layout.tsx
export const metadata = {
  title: 'Pocket Symptom Tracker',
  description: 'Privacy-first symptom tracking for autoimmune conditions',
  manifest: '/manifest.json', // PWA manifest
};
```

**No Sitemap for Intelligence Features:** Analytics, search, and reports are dynamic, personalized pages (no public URLs to index)

## 10. Deployment Architecture

### 10.1 Hosting Platform

**Vercel** - Optimized for Next.js, Edge Network, Automatic PWA Deployment

**Configuration:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

**Deployment Regions:** Automatic edge deployment (Vercel's global CDN)

### 10.2 CDN Strategy

**Vercel Edge Network (Automatic):**
- Static assets (JS, CSS, images) cached globally
- Service worker served from edge nodes
- No additional CDN configuration needed

### 10.3 Edge Functions

**Not Used for Phase 3** - All computation is client-side

Rationale:
- Privacy: No server-side processing of health data
- Offline: Must work without network connectivity
- Cost: Avoid edge function invocation charges

### 10.4 Environment Configuration

**Environment Variables:**
```bash
# .env.local (development)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_VERSION=3.0.0-phase3

# .env.production (Vercel)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=3.0.0-phase3
```

**No Secrets Required:** No external APIs, no server-side logic, no cloud services

## 11. Component and Integration Overview

### 11.1 Major Modules

**Phase 3 Feature Modules:**

1. **Analytics Module** (`/features/analytics`)
   - **Components:** Dashboard, trend charts, correlation matrix, pattern cards
   - **Services:** TrendAnalysisService, CorrelationService, PatternDetectionService, PredictionService
   - **Workers:** analyticsWorker.ts (statistical computations)
   - **Dependencies:** Phase 1 & 2 data repositories, Chart.js

2. **Search Module** (`/features/search`)
   - **Components:** GlobalSearch, FilterBuilder, FacetPanel, SearchResults
   - **Services:** SearchService, IndexingService, RankingService
   - **Workers:** searchIndexWorker.ts (index building)
   - **Dependencies:** All Phase 1 & 2 tables (comprehensive indexing)

3. **Reports Module** (`/features/reports`)
   - **Components:** ReportBuilder, TemplateSelector, ReportPreview
   - **Services:** ReportGenerationService, PDFExporter, ChartRenderer
   - **Dependencies:** Analytics module (for charts), Search module (for data queries)

### 11.2 Integration Points

**Cross-Epic Integrations:**

```
Analytics ─────────> Reports
  (Charts embedded in generated reports)

Analytics ─────────> Search
  (Analysis results indexed for search)

Search ────────────> Reports
  (Search results can be included in custom reports)

All Modules ───────> Core Database Layer
  (All modules query Phase 1 & 2 data via repositories)
```

**External Library Integrations:**
- **Chart.js:** Used by Analytics and Reports modules
- **jsPDF:** Used by Reports module
- **html2canvas:** Used by Reports module (chart → image conversion)
- **Pako:** Used by Search module (index compression)

### 11.3 Shared Components

**Reused Across Features:**
- `LoadingSkeleton` - Used in all modules during async operations
- `EmptyState` - Used when no data/results exist
- `TooltipInfo` - Used for contextual help in all modules
- `ConfidenceBadge` - Used in Analytics and Reports
- `Button`, `Badge`, `Modal` - Existing Phase 1 & 2 components

### 11.4 Third-Party Integrations

**None for Phase 3** - Maintaining privacy-first, offline-capable architecture

**Explicitly Excluded:**
- ❌ Cloud analytics services (Google Analytics, Mixpanel)
- ❌ Error tracking (Sentry, Rollbar)
- ❌ External APIs for data processing
- ❌ CDN for health data assets
- ❌ Third-party authentication providers

**Future Considerations (Phase 4+):**
- Optional telemetry (fully anonymized, user opt-in)
- Optional cloud backup (encrypted, user-controlled)

## 12. Architecture Decision Records

### ADR-001: Client-Side Analytics Only

**Context:** Need to perform statistical analysis on health data while maintaining privacy

**Decision:** Implement all analytics client-side using Web Workers, no server-side computation

**Rationale:**
- **Privacy:** Health data never leaves user's device
- **Offline:** Works without internet connectivity
- **Cost:** No server infrastructure costs
- **Control:** Full control over algorithms and data processing

**Consequences:**
- ✅ Zero data transmission risks
- ✅ Offline-first by design
- ✅ No server costs
- ❌ Limited by browser computation power (mitigated by Web Workers)
- ❌ No cross-device sync (deferred to Phase 4+)

---

### ADR-002: IndexedDB for Search Indexing

**Context:** Need fast full-text search across 10,000+ health entries

**Decision:** Build custom inverted index in IndexedDB using stemmed tokens

**Rationale:**
- **Privacy:** Search index stored locally, no external search services
- **Offline:** Works without network connectivity
- **Performance:** IndexedDB supports efficient compound index queries
- **Control:** Custom ranking and relevance algorithms

**Consequences:**
- ✅ <500ms search response times
- ✅ Zero external dependencies for search
- ✅ Full customization of search behavior
- ❌ Initial index build time (~30s for 1000 entries)
- ❌ Storage overhead (~5-10% of original data size)

---

### ADR-003: jsPDF for Report Generation

**Context:** Need to generate medical-grade PDF reports client-side

**Decision:** Use jsPDF + html2canvas for PDF generation in browser

**Alternatives Considered:**
1. **Server-side PDF generation** - Rejected (breaks privacy model)
2. **Browser print API** - Rejected (inconsistent output across browsers)
3. **pdfmake** - Rejected (larger bundle size, less control)

**Rationale:**
- **Privacy:** PDF generated entirely client-side
- **Offline:** Works without network
- **Quality:** Professional medical-grade output
- **Bundle Size:** jsPDF ~200KB (acceptable for report feature)

**Consequences:**
- ✅ Full privacy compliance
- ✅ Offline report generation
- ✅ Consistent output across browsers
- ❌ PDF generation takes 5-10s for large reports (mitigated by progress indicators)
- ❌ Chart-to-image conversion quality depends on html2canvas

---

### ADR-004: Modular Monolith Architecture

**Context:** Need clear boundaries between analytics, search, and reports features

**Decision:** Use modular monolith with epic-aligned feature modules

**Alternatives Considered:**
1. **Microservices** - Rejected (overkill for solo dev, client-side app)
2. **Flat component structure** - Rejected (poor scalability)

**Rationale:**
- **Clarity:** Clear ownership of features by epic
- **Iteration Speed:** Single deployment, fast iteration
- **Shared Code:** Easy to share components/utilities
- **Solo Dev:** Optimal for single developer workflow

**Consequences:**
- ✅ Clear feature boundaries
- ✅ Fast development iteration
- ✅ Easy to reason about codebase
- ❌ Must maintain discipline to prevent tight coupling
- ❌ Single deployment (can't deploy epics independently)

---

### ADR-005: Web Workers for Heavy Computation

**Context:** Statistical analysis on large datasets can block UI thread

**Decision:** Offload computations >100 data points to Web Workers

**Rationale:**
- **Performance:** Non-blocking UI during analysis
- **Browser Native:** No external dependencies
- **Scalability:** Can handle 5+ years of data without freezing

**Consequences:**
- ✅ Responsive UI during analytics
- ✅ Can process large datasets (1,800+ entries)
- ❌ Complexity of worker communication protocol
- ❌ Cannot directly access DOM from worker

## 13. Implementation Guidance

### 13.1 Development Workflow

**Phase 3 Implementation Sequence:**

1. **Database Migration** (Week 1)
   - Implement Dexie v8 schema
   - Create migration script
   - Build initial search index
   - Seed default report templates

2. **Epic 1: Analytics** (Weeks 2-8)
   - Story 1.1: Trend analysis engine + Web Worker
   - Story 1.2: Correlation matrix component
   - Story 1.3: Pattern detection algorithms
   - Story 1.4: Predictive modeling
   - Story 1.5: Anomaly detection
   - Story 1.6: Analytics dashboard UI
   - Story 1.7: Recommendation engine
   - Story 1.8-1.9: Export + explainers

3. **Epic 2: Search** (Weeks 9-14)
   - Story 2.1: Search index builder + Web Worker
   - Story 2.2: Real-time search interface
   - Story 2.3: Advanced filter system
   - Story 2.4: Faceted navigation
   - Story 2.5-2.8: Suggestions, saved searches, analytics, visualization

4. **Epic 3: Reports** (Weeks 15-19)
   - Story 3.1: Report template library
   - Story 3.2: Guided report builder wizard
   - Story 3.3: Multi-format export (PDF, HTML, DOCX)
   - Story 3.4: Chart embedding (html2canvas integration)
   - Story 3.5-3.8: Customization, sharing, scheduling, QA

**Total Timeline:** 19 weeks (~4.5 months)

### 13.2 File Organization

**Proposed Source Tree (Phase 3 Extensions):**

```
symptom-tracker/
├── app/                                # Next.js App Router
│   ├── insights/
│   │   ├── page.tsx                   # Analytics dashboard
│   │   ├── trends/page.tsx            # Trend analysis detail
│   │   ├── correlations/page.tsx      # Correlation matrix detail
│   │   └── layout.tsx                 # Insights layout
│   ├── search/
│   │   └── page.tsx                   # Search interface
│   ├── reports/
│   │   ├── page.tsx                   # Report library
│   │   ├── new/page.tsx               # Report builder
│   │   └── [id]/page.tsx              # Report detail
│   └── layout.tsx                      # Root layout with PWA
│
├── src/
│   ├── features/                       # Epic-aligned modules
│   │   ├── analytics/
│   │   │   ├── components/
│   │   │   │   ├── AnalyticsDashboard.tsx
│   │   │   │   ├── TrendChart.tsx
│   │   │   │   ├── CorrelationMatrix.tsx
│   │   │   │   ├── PatternCard.tsx
│   │   │   │   └── RecommendationsList.tsx
│   │   │   ├── services/
│   │   │   │   ├── trendAnalysisService.ts
│   │   │   │   ├── correlationService.ts
│   │   │   │   ├── patternDetectionService.ts
│   │   │   │   └── predictionService.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAnalytics.tsx
│   │   │   │   ├── useTrendAnalysis.tsx
│   │   │   │   └── useCorrelations.tsx
│   │   │   ├── types/
│   │   │   │   └── analytics.types.ts
│   │   │   └── utils/
│   │   │       ├── linearRegression.ts
│   │   │       ├── pearsonCorrelation.ts
│   │   │       └── statisticalUtils.ts
│   │   │
│   │   ├── search/
│   │   │   ├── components/
│   │   │   │   ├── GlobalSearch.tsx
│   │   │   │   ├── SearchInterface.tsx
│   │   │   │   ├── FilterBuilder.tsx
│   │   │   │   ├── FacetPanel.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── services/
│   │   │   │   ├── searchService.ts
│   │   │   │   ├── indexingService.ts
│   │   │   │   ├── rankingService.ts
│   │   │   │   └── tokenizer.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useSearch.tsx
│   │   │   │   ├── useFilters.tsx
│   │   │   │   └── useSavedSearches.tsx
│   │   │   └── types/
│   │   │       └── search.types.ts
│   │   │
│   │   └── reports/
│   │       ├── components/
│   │       │   ├── ReportBuilder.tsx
│   │       │   ├── TemplateSelector.tsx
│   │       │   ├── ReportConfigurator.tsx
│   │       │   ├── ContentEditor.tsx
│   │       │   └── ReportPreview.tsx
│   │       ├── services/
│   │       │   ├── reportGenerationService.ts
│   │       │   ├── pdfExporter.ts
│   │       │   ├── htmlExporter.ts
│   │       │   ├── docxExporter.ts
│   │       │   └── chartRenderer.ts
│   │       ├── hooks/
│   │       │   ├── useReportBuilder.tsx
│   │       │   └── useReportTemplates.tsx
│   │       └── types/
│   │           └── reports.types.ts
│   │
│   ├── core/
│   │   ├── database/
│   │   │   ├── schema.ts                    # Dexie v8 schema
│   │   │   ├── index.ts                     # Database singleton
│   │   │   ├── migrations/
│   │   │   │   └── v7-to-v8.ts
│   │   │   ├── repositories/                # Phase 1 & 2 (existing)
│   │   │   │   ├── dailyEntryRepository.ts
│   │   │   │   ├── symptomRepository.ts
│   │   │   │   ├── medicationRepository.ts
│   │   │   │   └── triggerRepository.ts
│   │   │   └── phase3/                      # Phase 3 repositories
│   │   │       ├── analysisRepository.ts
│   │   │       ├── searchRepository.ts
│   │   │       ├── reportRepository.ts
│   │   │       └── patternRepository.ts
│   │   │
│   │   ├── workers/
│   │   │   ├── analyticsWorker.ts           # Statistical computations
│   │   │   ├── searchIndexWorker.ts         # Search index building
│   │   │   └── workerPool.ts                # Worker management
│   │   │
│   │   └── utils/
│   │       ├── dateUtils.ts                 # (existing)
│   │       ├── formatters.ts                # (existing)
│   │       └── compression.ts               # Pako wrapper (NEW)
│   │
│   └── components/                           # Shared components
│       ├── atoms/
│       │   ├── ConfidenceBadge.tsx          # NEW
│       │   ├── TooltipInfo.tsx              # NEW
│       │   └── LoadingSkeleton.tsx          # NEW
│       ├── molecules/
│       │   ├── StatCard.tsx                 # NEW
│       │   ├── InsightCard.tsx              # NEW
│       │   └── FilterChip.tsx               # NEW
│       └── organisms/
│           ├── TrendChart.tsx               # NEW
│           ├── CorrelationMatrix.tsx        # NEW
│           └── WizardStepper.tsx            # NEW
│
├── public/
│   ├── workers/
│   │   ├── analyticsWorker.js               # Compiled worker
│   │   └── searchIndexWorker.js             # Compiled worker
│   ├── manifest.json                         # PWA manifest (existing)
│   └── service-worker.js                     # PWA service worker (existing)
│
├── tests/
│   ├── unit/
│   │   ├── analytics/
│   │   │   ├── linearRegression.test.ts
│   │   │   └── correlation.test.ts
│   │   ├── search/
│   │   │   ├── tokenizer.test.ts
│   │   │   └── ranking.test.ts
│   │   └── reports/
│   │       └── pdfExporter.test.ts
│   └── e2e/
│       ├── analytics-dashboard.spec.ts
│       ├── search-interface.spec.ts
│       └── report-builder.spec.ts
│
├── docs/
│   ├── PRD.md
│   ├── epics.md
│   ├── ux-specification.md
│   ├── solution-architecture.md             # THIS DOCUMENT
│   └── tech-spec-epic-{1|2|3}.md            # Next step
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── vercel.json
```

### 13.3 Naming Conventions

**TypeScript Files:**
- **Components:** PascalCase - `TrendChart.tsx`
- **Services:** camelCase - `trendAnalysisService.ts`
- **Hooks:** camelCase with `use` prefix - `useAnalytics.tsx`
- **Types:** PascalCase with `.types.ts` suffix - `analytics.types.ts`
- **Utilities:** camelCase - `linearRegression.ts`
- **Workers:** camelCase with `Worker` suffix - `analyticsWorker.ts`

**React Components:**
- **Functional components:** PascalCase - `AnalyticsDashboard`
- **Props interfaces:** PascalCase with `Props` suffix - `TrendChartProps`
- **Event handlers:** `handle` prefix - `handleChartClick`

**Database:**
- **Tables:** camelCase plural - `analysisResults`, `savedSearches`
- **Interfaces:** PascalCase singular - `AnalysisResult`, `SavedSearch`

**Constants:**
- **SCREAMING_SNAKE_CASE** - `MAX_SEARCH_RESULTS = 1000`

### 13.4 Best Practices

**TypeScript Strict Mode:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Error Handling:**
```typescript
// Wrap async operations in try-catch
try {
  const results = await analyticsService.analyzeTrend(metric, timeRange);
  setInsights(results);
} catch (error) {
  console.error('Analytics error:', error);
  toast.error('Failed to load analysis. Please try again.');
}
```

**Performance:**
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable event handlers
- Lazy load heavy components with `dynamic()`
- Debounce search input (300ms)
- Virtualize long lists (>100 items)

**Accessibility:**
- Always provide `aria-label` for icon-only buttons
- Use semantic HTML (`<button>` not `<div onClick>`)
- Test keyboard navigation for all interactive features
- Ensure 4.5:1 color contrast for text

**Testing:**
- Unit tests for all statistical algorithms (100% coverage target)
- Integration tests for repository layer
- E2E tests for critical user flows (pattern discovery, report generation)
- Visual regression tests for charts (Percy or Chromatic)

## 14. Testing Strategy

### 14.1 Unit Tests

**Statistical Algorithms (Critical - 100% Coverage Required):**

```typescript
// tests/unit/analytics/linearRegression.test.ts

describe('Linear Regression', () => {
  it('should compute correct slope and intercept', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ];

    const result = linearRegression(points);

    expect(result.slope).toBeCloseTo(2, 4);
    expect(result.intercept).toBeCloseTo(0, 4);
    expect(result.rSquared).toBeCloseTo(1, 4); // Perfect fit
  });

  it('should handle edge case: insufficient data', () => {
    const points = [{ x: 1, y: 1 }];

    expect(() => linearRegression(points)).toThrow('Minimum 2 points required');
  });
});
```

**Repository Layer:**
```typescript
// tests/unit/repositories/analysisRepository.test.ts

describe('AnalysisRepository', () => {
  let db: SymptomTrackerDB;

  beforeEach(async () => {
    db = new SymptomTrackerDB();
    await db.delete(); // Clear test database
    await db.open();
  });

  it('should save and retrieve analysis result', async () => {
    const result: AnalysisResult = {
      type: 'trend',
      metric: 'symptom_severity',
      timeRange: { start: new Date('2025-01-01'), end: new Date('2025-01-31') },
      result: { value: 0.5, confidence: 85, metadata: { rSquared: 0.7 } },
      generatedAt: new Date(),
      expiresAt: addHours(new Date(), 24),
    };

    const id = await analysisRepository.save(result);
    const retrieved = await analysisRepository.getById(id);

    expect(retrieved).toEqual(expect.objectContaining(result));
  });
});
```

### 14.2 Integration Tests

**Analytics Workflow (End-to-End Service Integration):**
```typescript
// tests/integration/analytics/trendAnalysis.integration.test.ts

describe('Trend Analysis Workflow', () => {
  it('should analyze trend from raw data to dashboard display', async () => {
    // 1. Seed test data
    await dailyEntryRepository.bulkAdd(generateTestEntries(30));

    // 2. Run trend analysis service
    const trendService = new TrendAnalysisService();
    const result = await trendService.analyzeTrend('symptom_severity', {
      start: subMonths(new Date(), 1),
      end: new Date(),
    });

    // 3. Verify result structure
    expect(result).toHaveProperty('slope');
    expect(result).toHaveProperty('confidence');
    expect(result.confidence).toBeGreaterThan(0);

    // 4. Verify result cached in database
    const cached = await analysisRepository.getLatest('trend', 'symptom_severity');
    expect(cached).toBeDefined();
  });
});
```

### 14.3 E2E Tests

**Critical User Flows with Playwright:**

```typescript
// tests/e2e/analytics-dashboard.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('should display insights after sufficient data', async ({ page }) => {
    // 1. Navigate to insights
    await page.goto('/insights');

    // 2. Verify dashboard loads
    await expect(page.locator('h1')).toContainText('Insights Dashboard');

    // 3. Check for quick insight cards
    const insightCards = page.locator('[data-testid="insight-card"]');
    await expect(insightCards).toHaveCount(5); // 5 key insights

    // 4. Click on correlation card
    await page.locator('[data-testid="correlation-card"]').click();

    // 5. Verify correlation matrix loads
    await expect(page.locator('[data-testid="correlation-matrix"]')).toBeVisible();

    // 6. Hover over matrix cell
    await page.locator('[data-correlation-cell="dairy-pain"]').hover();

    // 7. Verify tooltip shows correlation value
    await expect(page.locator('[role="tooltip"]')).toContainText('r = 0.78');
  });

  test('should show progressive disclosure for insufficient data', async ({ page }) => {
    // 1. Clear all data (simulate new user)
    await page.goto('/settings');
    await page.locator('[data-testid="clear-data"]').click();

    // 2. Navigate to insights
    await page.goto('/insights');

    // 3. Verify educational message
    await expect(page.locator('[data-testid="insufficient-data-message"]'))
      .toContainText('Track for 14 days to unlock trend analysis');
  });
});
```

**Report Generation Flow:**
```typescript
// tests/e2e/report-builder.spec.ts

test('should generate PDF report', async ({ page }) => {
  await page.goto('/reports/new');

  // Step 1: Select template
  await page.locator('[data-template="consultation-summary"]').click();
  await page.locator('[data-testid="next-step"]').click();

  // Step 2: Configure
  await page.locator('[name="timeRange"]').selectOption('last-6-months');
  await page.locator('[data-section="symptoms"]').check();
  await page.locator('[data-section="flares"]').check();
  await page.locator('[data-testid="next-step"]').click();

  // Step 3: Customize (skip)
  await page.locator('[data-testid="next-step"]').click();

  // Step 4: Generate
  await page.locator('[data-testid="generate-pdf"]').click();

  // Verify progress indicator
  await expect(page.locator('[role="progressbar"]')).toBeVisible();

  // Verify PDF generated
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-testid="download-pdf"]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.pdf');
});
```

### 14.4 Coverage Goals

**Minimum Coverage Targets:**
- **Statistical Algorithms:** 100% (critical for accuracy)
- **Services:** 80% (business logic)
- **Repositories:** 90% (data integrity)
- **Components:** 70% (UI interactions)
- **Overall:** 80% minimum

**Coverage Exclusions:**
- Type definitions (`.types.ts`)
- Configuration files
- Test utilities

## 15. DevOps and CI/CD

**Simple DevOps (Inline - No Specialist Needed)**

### 15.1 CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches: [main, phase-3]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Deployment Strategy:**
- **main branch** → Production (Vercel)
- **phase-3 branch** → Preview (Vercel preview URL)
- **Pull Requests** → Automatic preview deployments

### 15.2 Build Optimization

**Next.js Build Configuration:**
```javascript
// next.config.js

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['chart.js', 'react-chartjs-2'],
  },
  webpack: (config, { isServer }) => {
    // Bundle Web Workers
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader' },
      });
    }
    return config;
  },
};
```

### 15.3 Monitoring

**Simple Monitoring (No External Services):**
- **Browser Console Logging:** Development errors
- **User Feedback:** In-app feedback form (existing from Phase 1)
- **Performance Monitoring:** Lighthouse CI in GitHub Actions
- **Error Boundaries:** React error boundaries with user-friendly messages

**No External Monitoring Tools:**
- ❌ Sentry (privacy concerns - would see health data in errors)
- ❌ New Relic (unnecessary for client-side app)
- ✅ Manual dogfooding by solo developer

## 16. Security

**Simple Security (Inline - No Specialist Needed)**

### 16.1 Data Security

**Client-Side Encryption (Existing from Phase 1):**
- **IndexedDB Encryption:** Sensitive fields encrypted with Web Crypto API (AES-256-GCM)
- **Encryption Key:** Derived from user password (PBKDF2)
- **No Backend:** No server-side data storage (zero transmission risk)

**Phase 3 Security Extensions:**
```typescript
// Encrypt analysis results before storage
const encryptedResult = await encryptData(analysisResult, userKey);
await db.analysisResults.add(encryptedResult);

// Encrypt search index entries (optional - performance vs. privacy tradeoff)
// Decision: Do NOT encrypt search index (would break full-text search performance)
// Acceptable risk: Index contains tokens, not full sensitive content
```

### 16.2 Content Security Policy

**CSP Headers (Vercel):**
```typescript
// next.config.js

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      font-src 'self' data:;
      connect-src 'self';
      worker-src 'self' blob:;
    `.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

### 16.3 Privacy Compliance

**GDPR/HIPAA Considerations:**
- **Data Minimization:** Only collect necessary health data
- **User Control:** Full data export and deletion (existing from Phase 1)
- **No Third Parties:** Zero external data processors
- **Local Processing:** All analytics computed client-side
- **No Cookies:** Session storage only (no tracking)

**Privacy-Preserving Features:**
- ❌ No cloud analytics (Google Analytics, etc.)
- ❌ No error tracking with PII (Sentry)
- ❌ No CDN for health data
- ✅ Offline-first (works in airplane mode)
- ✅ No network requests for computation

### 16.4 Dependency Security

**Automated Security Scanning:**
```yaml
# .github/workflows/security.yml

name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Mondays
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - run: npm outdated || true
```

**Supply Chain Security:**
- **Lock Files:** Commit `package-lock.json` (reproducible builds)
- **Minimal Dependencies:** Only essential libraries (reduce attack surface)
- **Regular Updates:** Monthly dependency updates

---

## Specialist Sections

**All specialist areas handled inline - no external specialist engagement needed for Phase 3.**

**Rationale:**
- **DevOps:** Simple Vercel deployment (no complex infrastructure)
- **Security:** Privacy-first design eliminates most security concerns
- **Testing:** Standard React + Next.js testing patterns (well-documented)

**Future Phases:**
- Phase 4 (cloud sync) may require Security specialist for encryption protocols
- Phase 5 (enterprise) may require DevOps specialist for multi-tenant deployment

---

_Generated using BMad Method Solution Architecture workflow_
_Expert-level concise output - minimal explanations, decision-focused_
