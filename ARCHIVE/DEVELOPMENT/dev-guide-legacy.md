# Pocket Symptom Tracker - Development Guide

**Last Updated**: October 12, 2025  
**Framework**: Next.js 15.5.4 with App Router  
**Node Version**: 20+ required  
**Package Manager**: npm

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Style](#code-style)
6. [Component Development](#component-development)
7. [Database Development](#database-development)
8. [Testing](#testing)
9. [Debugging](#debugging)
10. [Build & Deploy](#build--deploy)
11. [Common Tasks](#common-tasks)
12. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **npm**: 10+ (comes with Node)
- **Git**: Latest version
- **Modern Browser**: Chrome, Firefox, Edge, or Safari (for testing PWA features)
- **IDE**: VS Code recommended

### Clone Repository

```powershell
git clone https://github.com/steven-d-pennington/symptom-tracker.git
cd symptom-tracker
```

### Install Dependencies

```powershell
npm install
```

**Expected Output**:
```
added 250 packages in 15s
```

### Start Development Server

```powershell
npm run dev
```

**Expected Output**:
```
▲ Next.js 15.5.4 (turbo)
- Local:        http://localhost:3001
- Network:      http://192.168.1.100:3001

✓ Ready in 1.2s
```

### Open in Browser

Navigate to: `http://localhost:3001`

**First Load**:
- Database migrations will run automatically
- You'll see the onboarding screen (if first time)
- IndexedDB will be initialized

---

## Development Environment

### Required Tools

#### VS Code Extensions

1. **ESLint** (`dbaeumer.vscode-eslint`) - Linting
2. **Prettier** (`esbenp.prettier-vscode`) - Code formatting
3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Tailwind autocomplete
4. **TypeScript** (built-in) - Type checking
5. **Jest Runner** (`firsttris.vscode-jest-runner`) - Run tests in IDE

#### Browser Extensions

1. **React Developer Tools** - Inspect React components
2. **IndexedDB Inspector** - Debug database (built into DevTools)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]
  ]
}
```

### Environment Variables

Create `.env.local`:

```bash
# Development mode
NODE_ENV=development

# Next.js port (default: 3000, we use 3001)
PORT=3001

# Future: API keys, endpoints
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Note**: No environment variables required currently (local-first app).

---

## Project Structure

```
symptom-tracker/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page (dashboard)
│   │   ├── entry/            # Daily entry pages
│   │   ├── calendar/         # Calendar pages
│   │   ├── analytics/        # Analytics pages
│   │   └── ...
│   ├── components/           # React components
│   │   ├── analytics/
│   │   ├── body-mapping/
│   │   ├── calendar/
│   │   ├── daily-entry/
│   │   ├── flare/
│   │   ├── navigation/
│   │   ├── photos/
│   │   └── ...
│   ├── lib/                  # Core libraries
│   │   ├── db/               # Database client & schema
│   │   ├── repositories/     # Data access layer
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   └── hooks/                # Custom React hooks
├── public/                   # Static assets
│   ├── icons/                # PWA icons
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker
├── docs/                     # Documentation
├── build-docs/               # Build documentation
├── scripts/                  # Build scripts
├── .github/                  # GitHub Actions (future)
├── jest.config.js            # Jest configuration
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.mjs         # ESLint configuration
├── tailwind.config.ts        # Tailwind configuration
└── package.json              # Dependencies & scripts
```

### Key Directories

- **`src/app/`**: Next.js pages (file-based routing)
- **`src/components/`**: Reusable React components
- **`src/lib/db/`**: Database client (Dexie) and schema
- **`src/lib/repositories/`**: Data access layer (CRUD operations)
- **`src/lib/services/`**: Business logic (analytics, export, etc.)
- **`src/lib/utils/`**: Utility functions (date, encryption, etc.)
- **`public/`**: Static files (icons, manifest, service worker)

---

## Development Workflow

### Typical Workflow

1. **Create Branch** (for feature/bugfix)
   ```powershell
   git checkout -b feature/new-feature
   ```

2. **Make Changes** (edit code)

3. **Run Linter**
   ```powershell
   npm run lint
   ```

4. **Run Tests**
   ```powershell
   npm test
   ```

5. **Test in Browser** (manual testing)
   - Open `http://localhost:3001`
   - Test feature functionality
   - Check console for errors

6. **Commit Changes**
   ```powershell
   git add .
   git commit -m "feat: add new feature"
   ```

7. **Push to Remote**
   ```powershell
   git push origin feature/new-feature
   ```

8. **Create Pull Request** (on GitHub)

### Commit Message Convention

Follow **Conventional Commits**:

- `feat: ...` - New feature
- `fix: ...` - Bug fix
- `docs: ...` - Documentation only
- `style: ...` - Code style (formatting, no logic change)
- `refactor: ...` - Code refactor (no feature/bugfix)
- `test: ...` - Add/update tests
- `chore: ...` - Build process, dependencies

**Examples**:
```
feat: add photo annotation feature
fix: resolve date picker timezone issue
docs: update API reference
test: add tests for trend analysis service
```

---

## Code Style

### TypeScript

**Strict Mode**: Enabled in `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**Type Safety**:
- Always define interfaces for props, state, function params
- Use `unknown` instead of `any` when type is uncertain
- Avoid type assertions (`as`) unless necessary

**Example**:
```typescript
// Good
interface UserProps {
  userId: string;
  onUpdate: (user: UserRecord) => void;
}

function UserCard({ userId, onUpdate }: UserProps) { ... }

// Bad
function UserCard(props: any) { ... }
```

### React Components

**Functional Components**: Use function syntax (not arrow)

```typescript
// Good
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  return <div>...</div>;
}

// Bad
export const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  return <div>...</div>;
};
```

**Hooks**: Use hooks at top of component (not in conditionals)

```typescript
// Good
function MyComponent() {
  const [state, setState] = useState(0);
  useEffect(() => { ... }, []);
  
  if (condition) return null;
  return <div>...</div>;
}

// Bad
function MyComponent() {
  if (condition) return null;
  
  const [state, setState] = useState(0);  // ❌ Conditional hook
  return <div>...</div>;
}
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Functions**: camelCase (`getUserData`)
- **Variables**: camelCase (`userId`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_URL`)
- **Types/Interfaces**: PascalCase (`UserRecord`, `DailyEntryProps`)
- **Repositories**: PascalCase + "Repository" (`UserRepository`)
- **Services**: PascalCase + "Service" (`TrendAnalysisService`)

### File Organization

**Component Files**:
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

// 2. Types/Interfaces
interface MyComponentProps {
  userId: string;
}

// 3. Component
export function MyComponent({ userId }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState(0);
  
  // Event handlers
  const handleClick = () => { ... };
  
  // Render
  return <div>...</div>;
}

// 4. Helper functions (if any)
function helperFunction() { ... }
```

### Tailwind CSS

**Utility Classes**: Use Tailwind utilities directly

```tsx
// Good
<div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg">

// Bad (avoid inline styles)
<div style={{ display: 'flex', alignItems: 'center', ... }}>
```

**Class Ordering**: Follow Tailwind's recommended order
1. Layout (display, flex, grid)
2. Positioning (position, top, left)
3. Sizing (width, height)
4. Spacing (margin, padding)
5. Typography (font, text)
6. Colors (bg, text, border)
7. Effects (shadow, opacity)

**Responsive**: Mobile-first

```tsx
<div className="text-sm md:text-base lg:text-lg">
  // Small on mobile, larger on tablet/desktop
</div>
```

---

## Component Development

### Creating a New Component

1. **Create File**: `src/components/feature/MyComponent.tsx`

2. **Define Props Interface**:
   ```typescript
   interface MyComponentProps {
     userId: string;
     onSave: (data: MyData) => void;
     initialData?: MyData;
   }
   ```

3. **Create Component**:
   ```typescript
   export function MyComponent({ userId, onSave, initialData }: MyComponentProps) {
     const [data, setData] = useState(initialData || defaultData);
     
     const handleSubmit = () => {
       onSave(data);
     };
     
     return (
       <div>
         {/* Component JSX */}
       </div>
     );
   }
   ```

4. **Export from Index** (if needed):
   ```typescript
   // src/components/feature/index.ts
   export { MyComponent } from './MyComponent';
   ```

5. **Create Test**:
   ```typescript
   // src/components/feature/__tests__/MyComponent.test.tsx
   import { render, screen } from '@testing-library/react';
   import { MyComponent } from '../MyComponent';
   
   describe('MyComponent', () => {
     it('renders correctly', () => {
       render(<MyComponent userId="user-123" onSave={jest.fn()} />);
       expect(screen.getByText(/expected text/i)).toBeInTheDocument();
     });
   });
   ```

### Component Best Practices

1. **Single Responsibility**: One component, one purpose
2. **Props Over State**: Prefer controlled components
3. **Composition**: Break large components into smaller ones
4. **Memoization**: Use `useMemo`, `useCallback` for expensive operations
5. **Error Boundaries**: Wrap risky components in error boundaries

---

## Database Development

### Adding a New Table

1. **Update Schema** (`src/lib/db/schema.ts`):
   ```typescript
   export interface NewTableRecord {
     id: string;
     userId: string;
     field1: string;
     field2: number;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. **Update Dexie Client** (`src/lib/db/client.ts`):
   ```typescript
   this.version(9).stores({
     // Copy all existing tables
     users: "id",
     symptoms: "id, userId, ...",
     // ... all other tables ...
     
     // Add new table
     newTable: "id, userId, [userId+field1]"
   });
   ```

3. **Create Repository** (`src/lib/repositories/newTableRepository.ts`):
   ```typescript
   import { db } from '../db/client';
   import { NewTableRecord } from '../db/schema';
   
   export class NewTableRepository {
     async create(record: Omit<NewTableRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewTableRecord> {
       const id = generateId();
       const newRecord = {
         ...record,
         id,
         createdAt: new Date(),
         updatedAt: new Date()
       };
       await db.newTable.add(newRecord);
       return newRecord;
     }
     
     // ... other CRUD methods
   }
   ```

4. **Test Repository**:
   ```typescript
   // src/lib/repositories/__tests__/newTableRepository.test.ts
   import { NewTableRepository } from '../newTableRepository';
   
   describe('NewTableRepository', () => {
     it('creates record', async () => {
       const repo = new NewTableRepository();
       const record = await repo.create({ userId: 'user-123', field1: 'value' });
       expect(record.id).toBeDefined();
     });
   });
   ```

### Adding a Field to Existing Table

1. **Update Schema** (`src/lib/db/schema.ts`):
   ```typescript
   export interface SymptomRecord {
     // ... existing fields ...
     newField?: string;  // Optional to support existing records
   }
   ```

2. **Update Dexie Version** (if index needed):
   ```typescript
   this.version(9).stores({
     symptoms: "id, userId, category, [userId+category], [userId+newField]"
   }).upgrade(async (trans) => {
     // Add default value to existing records
     await trans.table("symptoms").toCollection().modify((symptom) => {
       if (symptom.newField === undefined) {
         symptom.newField = "default value";
       }
     });
   });
   ```

3. **Update Repository** (add query methods if needed)

### Database Migrations

**Migration Pattern**:
```typescript
this.version(9).stores({
  // Schema definition
}).upgrade(async (trans) => {
  // Data migration logic
  await trans.table("tableName").toCollection().modify((record) => {
    // Modify record
  });
});
```

**Example**: Adding `isDefault` field to symptoms
```typescript
this.version(8).stores({
  symptoms: "id, userId, category, [userId+category], [userId+isDefault]"
}).upgrade(async (trans) => {
  await trans.table("symptoms").toCollection().modify((symptom) => {
    if (symptom.isDefault === undefined) {
      symptom.isDefault = false;
      symptom.isEnabled = true;
    }
  });
});
```

---

## Testing

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for comprehensive testing documentation.

### Quick Test Commands

```powershell
# Run all tests
npm test

# Run in watch mode (re-run on file change)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/components/analytics/__tests__/TrendChart.test.tsx
```

---

## Debugging

### Browser DevTools

#### React DevTools

1. Install React DevTools extension
2. Open DevTools → Components tab
3. Inspect component props, state, hooks

#### IndexedDB Inspector

1. Open DevTools → Application tab
2. Storage → IndexedDB → symptom-tracker-db
3. Inspect tables and records

#### Console Debugging

```typescript
// Add console logs
console.log('User ID:', userId);
console.log('Entry:', entry);

// Use debugger statement
function problematicFunction() {
  debugger;  // Browser will pause here
  // ...
}
```

### VS Code Debugging

**Launch Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.5.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3001"
    }
  ]
}
```

**Usage**:
1. Set breakpoints in VS Code
2. Run → Start Debugging (F5)
3. Debug in VS Code instead of browser

### Common Issues

**Issue**: "Module not found"
- **Solution**: Check import paths, run `npm install`

**Issue**: "Type error: Property X does not exist"
- **Solution**: Check TypeScript interface, add missing field

**Issue**: "Database migration failed"
- **Solution**: Clear IndexedDB (DevTools → Application → Clear Storage), reload

**Issue**: "Port 3001 already in use"
- **Solution**: Kill process on port 3001: `npx kill-port 3001`

---

## Build & Deploy

### Production Build

```powershell
npm run build
```

**Expected Output**:
```
Route (app)                              Size
┌ ○ /                                    123 kB
├ ○ /entry                               98 kB
├ ○ /calendar                            145 kB
└ ○ /analytics                           156 kB

○  (Static)  prerendered as static content
```

### Test Production Build Locally

```powershell
npm run build
npm start
```

Open `http://localhost:3000` (default port for production)

### Deploy to Vercel

**First Deploy**:
```powershell
npm i -g vercel
vercel login
vercel
```

**Subsequent Deploys**:
```powershell
git push origin main
# Vercel auto-deploys on push to main
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## Common Tasks

### Generate Test Data

**Script**: `scripts/generate-test-data.js`

**Usage** (in browser console):
1. Open DevTools console
2. Paste script content
3. Run `generateTestData()`

**Result**: 30 days of synthetic daily entries

### Clear All Data

**Method 1**: Browser (manual)
1. DevTools → Application → IndexedDB
2. Right-click `symptom-tracker-db` → Delete

**Method 2**: Component (UI)
1. Navigate to Settings → Dev Tools
2. Click "Clear All Data"

### Export Data (Backup)

1. Navigate to Settings → Data Management
2. Click "Export Data"
3. Select format (JSON recommended)
4. Download file

### Import Data

1. Navigate to Settings → Data Management
2. Click "Import Data"
3. Select file
4. Review warnings
5. Confirm import

### Update Dependencies

```powershell
# Check for updates
npm outdated

# Update all (be careful!)
npm update

# Update specific package
npm install dexie@latest

# Update Next.js
npm install next@latest react@latest react-dom@latest
```

---

## Troubleshooting

### Development Server Won't Start

**Symptoms**: `npm run dev` fails

**Possible Causes**:
1. Port 3001 in use → `npx kill-port 3001`
2. Node modules corrupted → `rm -rf node_modules package-lock.json && npm install`
3. Node version mismatch → `nvm use 20` (or install Node 20+)

### TypeScript Errors

**Symptoms**: Red squiggles in IDE, build fails

**Solutions**:
1. Restart TypeScript server: VS Code → Command Palette → "TypeScript: Restart TS Server"
2. Check `tsconfig.json` is correct
3. Run `npx tsc --noEmit` to see all errors

### Tests Failing

**Symptoms**: `npm test` shows failures

**Debug Steps**:
1. Run single test: `npm test -- path/to/test.test.tsx`
2. Add console logs in test
3. Check test environment matches component requirements
4. Verify mocks are correct

### PWA Not Updating

**Symptoms**: Service worker caches old version

**Solution**:
1. DevTools → Application → Service Workers
2. Click "Unregister"
3. Click "Update on reload"
4. Hard refresh (Ctrl+Shift+R)

### Database Schema Mismatch

**Symptoms**: "Database version mismatch" error

**Solution**:
1. Clear IndexedDB (DevTools → Application → Clear Storage)
2. Reload app (migrations will run)
3. Re-generate test data if needed

---

## References

- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Dexie.js Documentation**: https://dexie.org/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Jest Documentation**: https://jestjs.io/docs
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro

---

**For architecture overview, see**: [ARCHITECTURE.md](./ARCHITECTURE.md)  
**For testing guide, see**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)  
**For API reference, see**: [API_REFERENCE.md](./API_REFERENCE.md)
