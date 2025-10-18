# AGENTS.md - Architect Mode

This file provides architectural guidance for the symptom tracker project.

## System Architecture Overview

### Core Architectural Principles
1. **Local-First**: All data stored client-side, no backend dependencies
2. **Privacy-First**: Zero data transmission, AES-256-GCM photo encryption
3. **Offline-First**: Full functionality without network connectivity
4. **Progressive Enhancement**: Core features work everywhere, enhanced features layered
5. **Type Safety**: TypeScript strict mode throughout, no `any` types

### Technology Stack Decisions
- **Next.js 15.5.4**: Chosen for App Router, SSR capabilities, and PWA support
- **Dexie.js**: IndexedDB wrapper for type-safe client-side database operations
- **Tailwind CSS 4**: Utility-first styling with custom design system
- **Jest + Testing Library**: Comprehensive testing with 80% coverage requirement

### Data Architecture Patterns

#### Database Design
- **12 Tables**: Users, Symptoms, SymptomInstances, Medications, Triggers, DailyEntries, Attachments, BodyMapLocations, PhotoAttachments, PhotoComparisons, Flares, AnalysisResults
- **Compound Indexes**: All queries use `[userId+field]` patterns for performance
- **Schema Versioning**: Currently at version 9 with automatic migrations
- **JSON Stringification**: Arrays stored as JSON strings (trade normalization for simplicity)

#### Repository Pattern
```typescript
// All data access abstracted through repositories
export class SymptomRepository {
  async create(data: Omit<SymptomRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SymptomRecord>
  async getAll(userId: string): Promise<SymptomRecord[]>
  async update(id: string, updates: Partial<SymptomRecord>): Promise<void>
  // ... other CRUD operations
}
```

#### Service Layer Architecture
- **Business Logic**: Encapsulated in service classes (`ExportService`, `TrendAnalysisService`)
- **Dependency Injection**: Repositories injected into services
- **Orchestration**: Services coordinate between multiple repositories

### Component Architecture

#### Feature-Based Organization
```
src/components/
├── analytics/          # Data visualization and insights
├── body-mapping/       # Interactive body maps
├── calendar/           # Timeline and calendar views
├── daily-entry/        # Daily health logging
├── photos/             # Photo capture and management
├── flare/              # Active flare tracking
└── triggers/           # Trigger correlation analysis
```

#### State Management Patterns
- **Custom Hooks**: Stateful logic extracted to reusable hooks
- **Local State**: useState/useReducer for component state
- **Server State**: Data fetched through repositories, cached in hooks
- **No Global State**: Avoided Redux/Zustand for simplicity

### Security Architecture

#### Photo Encryption Flow
```typescript
// 1. Capture photo
const blob = await capturePhoto();

// 2. Strip EXIF data
const cleanBlob = await stripExifData(blob);

// 3. Generate encryption key
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

// 4. Encrypt photo
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
  key,
  await cleanBlob.arrayBuffer()
);

// 5. Store encrypted blob with metadata
await photoRepository.create({
  encryptedData: encrypted,
  encryptionKey: await crypto.subtle.exportKey('raw', key),
  // ... other metadata
});
```

#### Privacy Protection Measures
- **Local-Only Storage**: No data transmitted to servers
- **EXIF Stripping**: Location/device metadata removed
- **No Analytics**: Zero tracking unless explicitly opted in
- **Encrypted Photos**: Per-photo AES-256-GCM encryption

### Performance Architecture

#### Database Optimization
- **Compound Indexes**: Critical for query performance
  - `[userId+date]` for daily entries
  - `[userId+timestamp]` for symptom instances
  - `[userId+capturedAt]` for photos
- **Lazy Loading**: Photos decrypted on-demand
- **Analytics Caching**: Expensive computations cached for 24 hours

#### Code Splitting Strategy
- **Route-based**: Next.js automatic splitting by page
- **Component-based**: Dynamic imports for heavy components
- **Feature-based**: Large features loaded on demand

### PWA Architecture

#### Service Worker Strategy
- **Cache-First**: Static assets (HTML, CSS, JS, images)
- **Network-First**: Future API calls (not implemented)
- **Stale-While-Revalidate**: Dynamic content updates

#### Offline Capabilities
- **Full Functionality**: All features work offline
- **Background Sync**: Queue for future cloud features
- **Installable**: Standalone app experience

### Testing Architecture

#### Testing Pyramid
```
        E2E (Manual)
     /               \
   Integration (Few)
 /                     \
Unit Tests (Many)
```

#### Coverage Requirements
- **80% Minimum**: Enforced across branches, functions, lines, statements
- **Critical Paths**: 100% coverage for repositories and services
- **Component Testing**: Focus on user interactions, not implementation

### Migration Strategy

#### Database Schema Evolution
```typescript
// Version 9: Add photo duplicate detection index
this.version(9).stores({
  // Copy all existing tables
  users: "id",
  symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
  // ... other tables ...
  
  // Add new compound index
  photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
});
```

#### Migration Best Practices
- **Forward-only**: No rollback support (IndexedDB limitation)
- **Data Preservation**: Never lose user data during migrations
- **Incremental**: Small, focused migration steps

### Future Architecture Considerations

#### Multi-Device Sync (Phase 5)
- **End-to-End Encryption**: Client-side encryption before sync
- **Conflict Resolution**: Last-write-wins with user intervention
- **Optional Sync**: User can choose to enable/disable

#### AI-Powered Insights (Phase 3)
- **Client-side Processing**: Pattern recognition runs locally
- **Privacy-Preserving**: No data sent to external services
- **Progressive Enhancement**: Works without AI features

#### Multi-User Support (Future)
- **Permission System**: Role-based access control
- **Data Isolation**: User-scoped data with sharing capabilities
- **Family Support**: Caregiver access with permissions

### Architectural Trade-offs

#### Chosen Trade-offs
1. **JSON Stringification**: Simpler code vs. normalized storage
2. **Single User**: Simpler architecture vs. multi-user complexity
3. **Local-Only**: Privacy vs. collaboration features
4. **TypeScript Strict**: Development safety vs. learning curve

#### Anti-Patterns Avoided
- **Over-engineering**: No Redux, GraphQL, or complex state management
- **Backend Dependencies**: No server requirements for core functionality
- **Third-party Analytics**: No external tracking services
- **Complex Build Tools**: Using Next.js defaults, no custom webpack

### Decision Log

| Decision | Rationale | Status |
|----------|-----------|---------|
| Local-first architecture | Privacy, offline capability, no server costs | Implemented |
| Dexie.js for database | Type-safe, well-maintained IndexedDB wrapper | Implemented |
| Photo encryption | Privacy compliance, user trust | Implemented |
| Single-user pattern | Simplicity for MVP, easy to extend later | Implemented |
| PWA over native app | Cross-platform, no app store approval | Implemented |
| Tailwind CSS 4 | Latest features, good performance | Implemented |
| 80% test coverage | Quality balance vs. development speed | Implemented |

### Architecture Health Metrics

#### Performance Targets
- **First Contentful Paint**: < 1.5s ✅
- **Time to Interactive**: < 3s ✅
- **IndexedDB Query Time**: < 50ms ✅
- **Photo Encryption**: < 100ms ⚠️ (tuning needed)

#### Quality Metrics
- **TypeScript Coverage**: 100% ✅
- **Test Coverage**: 80%+ ✅
- **Bundle Size**: < 500KB ✅
- **Accessibility**: WCAG 2.1 AA 📋 (in progress)

#### Security Metrics
- **Data Transmission**: 0 bytes ✅
- **Photo Encryption**: AES-256-GCM ✅
- **EXIF Data Stripping**: 100% ✅
- **Third-party Trackers**: 0 ✅