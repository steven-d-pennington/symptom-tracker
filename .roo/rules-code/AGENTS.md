# AGENTS.md - Code Mode

This file provides coding-specific guidance for the symptom tracker project.

## Critical Coding Patterns

### Database Operations
- **Always use compound indexes**: Query with `[userId+field]` patterns for performance
- **JSON string handling**: Arrays stored as JSON strings must be parsed with `JSON.parse()` on read
- **Repository pattern**: Never access Dexie directly - always use repositories in `src/lib/repositories/`
- **Single user pattern**: Use `userRepository.getOrCreateCurrentUser()` instead of assuming user ID

### Component Development
- **Function syntax only**: Use `export function ComponentName()` not arrow functions
- **Custom hooks**: Extract stateful logic to hooks in `src/lib/hooks/`
- **Props interfaces**: Always define TypeScript interfaces for component props
- **Error boundaries**: Wrap risky operations in try/catch blocks

### Photo Encryption Implementation
- **Never store unencrypted photos**: Always encrypt before database storage
- **Key management**: Use `PhotoEncryption.importKey()` and `PhotoEncryption.exportKey()` for key handling
- **EXIF stripping**: Call `stripExifData()` before encryption
- **Thumbnail generation**: Create 150x150px thumbnails, encrypt separately

### Import Order (Strict)
1. React hooks (`import { useState, useEffect } from 'react'`)
2. Local imports (`import { userRepository } from '@/lib/repositories'`)
3. External libraries (`import { Chart } from 'react-chartjs-2'`)

### Testing Requirements
- **80% coverage enforced**: Tests will fail if coverage drops below threshold
- **Mock IndexedDB**: Always mock Dexie operations in repository tests
- **Component testing**: Use Testing Library with accessible queries (`getByRole`, `getByLabelText`)
- **Test location**: Place in `__tests__` subdirectories alongside source files

### Performance Gotchas
- **Database queries**: Filter by indexed fields first, then in memory
- **Photo decryption**: Decrypt on-demand, never bulk decrypt
- **Analytics caching**: Use `analysisResults` table for expensive computations (24h TTL)
- **Code splitting**: Use `dynamic()` imports for heavy components

### Type Safety Rules
- **No `any` types**: Use `unknown` if type is uncertain
- **Strict mode enabled**: All TypeScript strict rules enforced
- **Interface naming**: Use PascalCase for interfaces (`UserRecord`, `DailyEntryProps`)
- **Nullable handling**: Always handle null/undefined cases explicitly

### File Organization
- **Feature-based**: Group components by feature in `src/components/<feature>/`
- **Repository exports**: Export singleton instances (`export const userRepository = new UserRepository()`)
- **Service layer**: Business logic in `src/lib/services/`, repositories injected
- **Utility functions**: Pure functions in `src/lib/utils/`, no side effects

### Migration Pattern
```typescript
// Always increment version number
this.version(9).stores({
  // Copy all existing tables
  users: "id",
  symptoms: "id, userId, category, [userId+category], [userId+isActive]",
  // Add new indexes here
}).upgrade(async (trans) => {
  // Migration logic
});
```

### Default Data System
- **Preset items**: Mark with `isDefault: true`, `isEnabled: true`
- **Custom items**: Mark with `isDefault: false`
- **Toggle visibility**: Use `isEnabled` flag, don't delete defaults
- **Reset functionality**: Re-enable all defaults with `isEnabled: true`