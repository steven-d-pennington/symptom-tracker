# AGENTS.md - Ask Mode

This file provides context for answering questions about the symptom tracker project.

## Project Overview & Context

### What This Project Is
Pocket Symptom Tracker is a **local-first Progressive Web App** for people with autoimmune conditions (particularly Hidradenitis Suppurativa) to track symptoms, medications, triggers, and health patterns entirely on their device without cloud storage.

### Key Architectural Decisions
- **Local-First**: All data stored in IndexedDB, no backend server required
- **Privacy-First**: Photos encrypted with AES-256-GCM, EXIF data stripped
- **Offline-First**: Full functionality without network connectivity
- **Single User**: Currently assumes single user (hardcoded "user-123" in tests)

### Technology Stack
- **Frontend**: Next.js 15.5.4 with App Router, React 19.1.0, TypeScript 5
- **Database**: Dexie.js wrapper over IndexedDB (12 tables, version 9)
- **Styling**: Tailwind CSS 4 with custom design system
- **Testing**: Jest 30.2.0 with React Testing Library, 80% coverage enforced

## Data Architecture

### Core Entities
- **Users**: Single user with preferences and settings
- **Symptoms**: Trackable symptoms with severity scales (preset + custom)
- **Daily Entries**: Daily health logs with symptoms, medications, triggers
- **Photos**: Encrypted photo attachments with thumbnails
- **Flares**: Active symptom flare tracking
- **Analytics**: Cached trend analysis results

### Database Patterns
- **Compound Indexes**: All queries use `[userId+field]` patterns for performance
- **JSON Stringification**: Arrays stored as JSON strings (must parse on read)
- **Soft Deletes**: Use `isActive` flags instead of hard deletes
- **Schema Migrations**: Versioned schema with automatic migrations

### Repository Pattern
All data access goes through repositories in `src/lib/repositories/`:
- `userRepository`: User management and preferences
- `symptomRepository`: Symptom CRUD operations
- `dailyEntryRepository`: Daily entry management
- `photoRepository`: Encrypted photo storage
- Each repository exports a singleton instance

## Component Architecture

### Organization
- **Feature-based**: Components grouped by feature in `src/components/<feature>/`
- **Custom Hooks**: Stateful logic extracted to `src/lib/hooks/`
- **Services**: Business logic in `src/lib/services/`
- **Pages**: Next.js App Router in `src/app/(protected)/`

### Key Features
- **Daily Entry**: Comprehensive health logging form
- **Photo Documentation**: Encrypted photo capture with annotations
- **Body Mapping**: Visual symptom location tracking
- **Analytics**: Trend analysis with regression
- **Flare Tracking**: Active symptom flare management
- **Export/Import**: Data portability in JSON/CSV formats

## Security & Privacy

### Photo Encryption
- **AES-256-GCM**: Industry-standard encryption
- **Per-photo keys**: Each photo has unique encryption key
- **EXIF Stripping**: All metadata removed for privacy
- **Thumbnails**: Encrypted separately (150x150px)

### Data Sovereignty
- **Local-only**: No data transmitted to servers
- **No tracking**: Zero analytics unless explicitly opted in
- **User control**: Complete data ownership and deletion rights

## Testing & Quality

### Testing Strategy
- **Unit Tests**: Repository logic, utilities, services
- **Component Tests**: React components with Testing Library
- **Integration Tests**: Multi-component workflows
- **Coverage**: 80% minimum enforced

### Code Quality
- **TypeScript Strict**: No `any` types, full type safety
- **ESLint**: Next.js configuration (errors ignored in builds currently)
- **Jest**: Experimental VM modules for ES module support

## Development Workflow

### Getting Started
```bash
npm install
npm run dev  # Starts on port 3001 with Turbopack
```

### Key Commands
- `npm test`: Run all tests
- `npm run test:coverage`: Coverage report
- `npm run build`: Production build
- `npm run lint`: ESLint check

### File Structure
- `src/lib/db/`: Database client and schema
- `src/lib/repositories/`: Data access layer
- `src/lib/services/`: Business logic
- `src/lib/hooks/`: Custom React hooks
- `src/components/`: React components by feature
- `src/app/`: Next.js pages and layouts

## Common Questions

### How does data sync work?
Currently no sync - all data is local-only. Future versions may include optional encrypted cloud sync.

### How are photos stored securely?
Photos are encrypted with AES-256-GCM before storage in IndexedDB. Each photo has a unique encryption key stored separately in the database.

### What's the difference between default and custom symptoms?
Default symptoms (`isDefault: true`) are preset HS-specific symptoms that users can toggle visibility with `isEnabled`. Custom symptoms (`isDefault: false`) are user-created.

### How does the single-user pattern work?
The app uses `userRepository.getOrCreateCurrentUser()` which creates a default user if none exists. Tests use hardcoded "user-123".

### Why are arrays stored as JSON strings?
IndexedDB has limited support for complex objects. Arrays are stringified for storage and parsed when read.

### How are database migrations handled?
Schema versioning in `src/lib/db/client.ts` with upgrade functions. Always increment version number when modifying schema.

## Performance Considerations

### Database Optimization
- **Compound Indexes**: Critical for query performance
- **Lazy Loading**: Photos decrypted on-demand
- **Analytics Caching**: Expensive computations cached for 24 hours

### Code Splitting
- **Dynamic Imports**: Heavy components loaded on-demand
- **Route-based**: Next.js automatic code splitting by page

## Future Roadmap

### Phase 3 (Planned)
- AI-powered insights and pattern recognition
- Enhanced analytics and correlations

### Phase 4 (Future)
- Multi-device sync with end-to-end encryption
- Healthcare provider sharing (read-only reports)

### Phase 5 (Future)
- Multi-user support with permissions
- Family sharing and caregiver access