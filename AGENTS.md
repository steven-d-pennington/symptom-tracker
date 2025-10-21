# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Test Commands

- **Development**: `npm run dev` - Starts Next.js dev server on port 3001 with Turbopack
- **Clean Dev**: `npm run dev:clean` - Clears build cache and starts dev server
- **Build**: `npm run build` - Creates production build
- **Test**: `npm test` - Runs Jest tests (uses experimental VM modules)
- **Test Watch**: `npm run test:watch` - Runs tests in watch mode
- **Test Coverage**: `npm run test:coverage` - Runs tests with coverage report (80% threshold enforced)
- **Lint**: `npm run lint` - Runs ESLint (currently ignores build errors)

## Common Issues & Troubleshooting

**HMR Cache Errors**: If you see "Module factory is not available" errors, do a browser hard reload (Ctrl+Shift+R) or run `npm run dev:clean`. See `docs/TROUBLESHOOTING.md` for details.

## Project-Specific Patterns

### Database Architecture
- **Local-First**: All data stored in IndexedDB via Dexie.js, no backend
- **Schema Versioning**: Currently at version 9, migrations handled in `src/lib/db/client.ts`
- **Compound Indexes**: Critical for performance - always query using `[userId+field]` patterns
- **JSON Stringification**: Arrays stored as JSON strings in database (must parse on read)

### Repository Pattern
- All data access goes through repositories in `src/lib/repositories/`
- Repositories handle CRUD operations and business logic
- Use `userRepository.getOrCreateCurrentUser()` for single-user app pattern
- Always include `userId` in queries (future multi-user support)

### Component Architecture
- **Functional Components Only**: Use function syntax, not arrow functions for components
- **Custom Hooks**: Stateful logic extracted to hooks in `src/lib/hooks/`
- **Feature Organization**: Components grouped by feature in `src/components/<feature>/`
- **Test Files**: Place tests in `__tests__` subdirectories alongside source files

### Photo Encryption
- Photos encrypted with AES-256-GCM before storage
- EXIF data stripped for privacy
- Thumbnails generated (150x150px) and encrypted separately
- Per-photo encryption keys stored in database

### Data Export/Import
- Export service supports JSON and CSV formats
- Photos can be exported encrypted or decrypted
- Progress callbacks for long-running operations
- Date range filtering supported

### Code Style Requirements
- **TypeScript Strict Mode**: Enabled, no `any` types except specific edge cases
- **Import Order**: React hooks first, then local imports, then external libraries
- **Naming**: Components in PascalCase, functions/variables in camelCase
- **Class Names**: Use `cn()` utility for conditional Tailwind classes
- **Error Handling**: Always include try/catch for async operations

### Testing Requirements
- **Coverage**: 80% minimum across branches, functions, lines, statements
- **Test Environment**: jsdom with custom mocks for IndexedDB and Canvas
- **Component Testing**: Use React Testing Library with accessible queries
- **Repository Testing**: Mock Dexie operations, test business logic
- **Integration Tests**: Test multi-component workflows

### Development Workflow
- **Single User Pattern**: App assumes single user (hardcoded "user-123" in tests)
- **Default Data**: Auto-populate default symptoms/triggers on first load
- **Soft Deletes**: Use `isActive` flags instead of hard deletes
- **Timestamps**: All records include `createdAt`/`updatedAt` for future sync

### Performance Considerations
- **Database Queries**: Always use indexed fields first, then filter in memory
- **Photo Loading**: Decrypt photos on-demand, not all at once
- **Analytics Caching**: Expensive computations cached in `analysisResults` table (24h TTL)
- **Code Splitting**: Use dynamic imports for heavy components

### Critical Gotchas
- **Jest Configuration**: Uses `ts-jest/presets/default-esm` for ES modules support
- **IndexedDB**: Must be mocked in tests (see `jest.setup.js`)
- **Dexie Migrations**: Always increment version number when modifying schema
- **Photo Encryption**: Keys are hex strings, must be imported before use
- **Build Process**: ESLint errors currently ignored during builds (TODO: fix)

### File Structure Conventions
- **Pages**: `src/app/(protected)/` for authenticated routes
- **Repositories**: One per entity, export singleton instance
- **Services**: Business logic layer, repositories injected
- **Types**: Database schemas in `src/lib/db/schema.ts`, component types local
- **Utils**: Pure functions, no side effects

### Default Symptom/Trigger System
- Preset items marked with `isDefault: true`
- Users can toggle visibility with `isEnabled` flag
- Custom items have `isDefault: false`
- Reset functionality re-enables all default items

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase
